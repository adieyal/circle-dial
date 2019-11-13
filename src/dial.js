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
            .domain([d3.min(data) * 0.75, d3.max(data) * 1.25])
            .range([0, radius()])


    function drawData(container, d, coords) {
        let graphLine = d3.path();
        let cBaseX, cBaseY;
        let oldBaseX, oldBaseY;

        let shiftAngle = (360 / d.length);
        let shiftAngleRadians = deg2rad(shiftAngle);
        let angleAccum = 0;
        radiusScale = createRadiusScale(d);

        console.log(radiusScale(d[0]))
        let baseX = coords.middle,
            baseY = (radius() - radiusScale(d[0])) + cy();
        graphLine.moveTo(baseX, baseY)

        let graphPath = container.append("path")

        container.append("circle")
            .attr("r", 10)
            .attr("cx", baseX)
            .attr("cy", baseY)
            .style("fill", "blue")

        for (let idx in d) {
            if (idx > 0) {
                let middleAngle = angleAccum + shiftAngleRadians / 2;
                angleAccum += shiftAngleRadians;
                
                oldBaseX = baseX;
                oldBaseY = baseY;
                baseX = (radius() - radiusScale(d[idx])) * Math.sin(angleAccum) + cx();
                baseY = (radius() - radiusScale(d[idx])) * Math.cos(angleAccum) + cy();
                cBaseX = radius() * Math.sin(middleAngle) + cx();
                cBaseY = radius() * Math.cos(middleAngle) + cy();

                //graphLine.lineTo(baseX, baseY);

                graphLine.quadraticCurveTo(cBaseX, cBaseY , baseX, baseY);

                container.append("circle")
                    .attr("r", 10)
                    .attr("cx", cBaseX)
                    .attr("cy", cBaseY)
                    .style("fill", "green")

                container.append("circle")
                    .attr("r", 10)
                    .attr("cx", baseX)
                    .attr("cy", baseY)
                    .style("fill", "red")

            }
        }

        let middleAngle = angleAccum + shiftAngleRadians / 2;
        angleAccum += shiftAngleRadians;
        cBaseX = radius() * Math.sin(middleAngle) + cx();
        cBaseY = radius() * Math.cos(middleAngle) + cy();
        baseY = (radius() - radiusScale(d[0])) + cy();
        //graphLine.lineTo(coords.middle, baseY);
        graphLine.quadraticCurveTo(cBaseX, cBaseY, coords.middle, baseY);
        graphLine.closePath();
        graphPath
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
                    if (this._event == undefined) {
                        this._startAngle = 0;
                        let e = d3.getEvent();
                        this._event = e;
                    }
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
                    
                    if (this._startAngle > 360) {
                        this._startAngle -= 360;
                    } else if (this._startAngle < -360) {
                        this._startAngle += 360;
                    }
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


