import {select, selectAll, event} from 'd3-selection';
import {scaleLinear} from 'd3-scale';
import {min, max} from 'd3-array';
import {path} from 'd3-path';
import {drag} from 'd3-drag';
import {transform} from 'd3-transform';
import {transition} from 'd3-transition';

const getEvent = () => event;

const d3 = {
    select, selectAll, path, drag, getEvent, transform,
    min, max, scaleLinear, transition
}

let constant = x => () => x;

export function Dial() {
    let radiusScale = null;

    const deg2rad = (deg) => deg / 360 * Math.PI * 2;
    const rad2deg = (deg) => deg / (Math.PI * 2) * 360;

    let radius = constant(10),
        cx = constant(0),
        cy = constant(0)

    const createRadiusScale = data =>
        d3.scaleLinear()
            .domain([d3.min(data), d3.max(data) * 1.5])
            .range([0, radius()])


    function drawData(container, d, coords) {
        let graphLine = d3.path();
        let shiftAngle = (360 / d.length);
        let shiftAngleRadians = deg2rad(shiftAngle);
        let angleAccum = 0;
        radiusScale = createRadiusScale(d);

        let baseX = coords.middle,
            baseY = (radius() - radiusScale(d[0])) + cy();
        graphLine.moveTo(baseX, baseY)

        container.append("circle")
            .attr("r", 10)
            .attr("cx", baseX)
            .attr("cy", baseY)
            .style("fill", "red")


        for (let idx in d) {
            if (idx > 0) {
                angleAccum += shiftAngleRadians;
                let oldBaseX = baseX;
                let oldBaseY = baseY;
                let baseX = (radius() - radiusScale(d[idx])) * Math.sin(angleAccum) + cx();
                let baseY = (radius() - radiusScale(d[idx])) * Math.cos(angleAccum) + cy();

       //         graphLine.lineTo(baseX, baseY);
                graphLine.quadraticCurveTo(coords.middle, coords.middle, baseX, baseY);


                container.append("circle")
                    .attr("r", 10)
                    .attr("cx", baseX)
                    .attr("cy", baseY)
                    .style("fill", "red")

            }
        }

        //graphLine.lineTo(coords.middle, coords.bottom);
        graphLine.quadraticCurveTo(coords.middle, coords.middle, coords.middle, coords.bottom);
        graphLine.closePath();
        container.append("path")
            .attr("d", graphLine.toString())
            .style("stroke", "black")
            .style("fill", "white")
    }

    function my(selection) {
        selection.each(function(d, i) {
            let self = d3.select(this);
            let g = self.append("g");
            let circle = g.append("circle")
                .attr("r", radius)
                .attr("cx", cx)
                .attr("cy", cy)
                .style("stroke", "black")
                .style("fill", "#45419a")

            let coords = {
                bottom: cy() + radius(),
                top: cy() - radius(),
                left: cx() - radius(),
                right: cx() + radius(),
                middle: cx()
            } 

            let radiusScale = createRadiusScale(d);
            drawData(g, d, coords);


            let drag = d3.drag()
                .on("start", function() {
                    let e = d3.getEvent();
                    if (this._event == undefined)
                        this._startAngle = 0;
                    this._event = e;
                    console.log("start")
                })
                .on("end", function(el) {
                    console.log("end")
                    this._startAngle = 0;
                    this._event = undefined;
                    d3.select(this).style("touch-action", "auto");
                    d3.select(this).style("touch-action", "manipulation");
                })
                .on("drag", function(el) {
                    let g = d3.select(this);
                    let oldEvent = this._event;
                    let newEvent = d3.getEvent();
                    this._event = newEvent;
    
                    if (oldEvent == undefined)
                        return;

                    let centre = {x: cx(), y: cy()};
                    let oldpos = {x: oldEvent.x - cx(), y: oldEvent.y - cy()};
                    let newpos = {x: newEvent.x - cx(), y: newEvent.y - cy()};

                    let angleOld = rad2deg(Math.atan(oldpos.y / oldpos.x));
                    let angleNew = rad2deg(Math.atan(newpos.y / newpos.x));
                    let dtheta = (angleNew - angleOld);
                    if (dtheta > 170) {
                        dtheta -= 180;
                    } else if (dtheta < -170) {
                        dtheta += 180;
                    }
                    console.log(dtheta);
                    this._startAngle += dtheta ;
                    if (this._startAngle < 0)
                        this._startAngle += 0;


                    let transform = d3.transform()
                        .translate([cx(), cy()])
                        .rotate(this._startAngle)
                        .translate([-cx(), -cy()])
                    g.attr("transform", transform);

                })

            g.call(drag);
        });
    }

    my.radius = function(_) {
        return arguments.length ? (radius = typeof _ === "function" ? _ : constant(+_), my) : radius;
    };

    my.cx = function(_) {
        return arguments.length ? (cx = typeof _ === "function" ? _ : constant(+_), my) : cx;

    };

    my.cy = function(_) {
        return arguments.length ? (cy = typeof _ === "function" ? _ : constant(+_), my) : cy;

    };

    return my;
};


