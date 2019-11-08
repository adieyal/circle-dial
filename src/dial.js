import {select, selectAll, event} from 'd3-selection';
import {scaleLinear} from 'd3-scale';
import {min, max} from 'd3-array';
import {path} from 'd3-path';
import {drag} from 'd3-drag';
import {transform} from 'd3-transform';
import {transition} from 'd3-transition';

const getEvent = function() {
    return event;
}
const d3 = {
    select, selectAll, path, drag, getEvent, transform,
    min, max, scaleLinear, transition
}

var constant = function(x) {
  return function constant() {
    return x;
  };
}

export function Dial() {
    var radiusScale = null;

    function deg2rad(deg) {
        return deg / 360 * Math.PI * 2;
    }

    function rad2deg(deg) {
        return deg / (Math.PI * 2) * 360;
    }

    var radius = constant(10),
        cx = constant(0),
        cy = constant(0)

    function createRadiusScale(data) {
        return d3.scaleLinear()
            .domain([d3.min(data), d3.max(data) * 1.5])
            .range([0, radius()])
    }


    function drawData(container, d, coords) {
        var graphLine = d3.path();
        var shiftAngle = (360 / d.length);
        var shiftAngleRadians = deg2rad(shiftAngle);
        var angleAccum = 0;
        radiusScale = createRadiusScale(d);

        var baseX = coords.middle, baseY = (radius() - radiusScale(d[0])) + cy();
        graphLine.moveTo(baseX, baseY)
    /*
        container.append("circle")
            .attr("r", 10)
            .attr("cx", baseX)
            .attr("cy", baseY)
            .style("fill", "red")
*/

        for (var idx in d) {
            if (idx > 0) {
                angleAccum += shiftAngleRadians;
                var baseX = (radius() - radiusScale(d[idx])) * Math.sin(angleAccum) + cx();
                var baseY = (radius() - radiusScale(d[idx])) * Math.cos(angleAccum) + cy();

       //         graphLine.lineTo(baseX, baseY);
                graphLine.quadraticCurveTo(coords.middle, coords.middle, baseX, baseY);

/*
                container.append("circle")
                    .attr("r", 10)
                    .attr("cx", baseX)
                    .attr("cy", baseY)
                    .style("fill", "red")
*/
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
            var self = d3.select(this);
            var g = self.append("g");
            var circle = g.append("circle")
                .attr("r", radius)
                .attr("cx", cx)
                .attr("cy", cy)
                .style("stroke", "black")
                .style("fill", "pink")

            var coords = {
                bottom: cy() + radius(),
                top: cy() - radius(),
                left: cx() - radius(),
                right: cx() + radius(),
                middle: cx()
            } 

            var radiusScale = createRadiusScale(d);
            drawData(g, d, coords);


            var drag = d3.drag()
                .on("start", function() {
                    var e = d3.getEvent();
                    if (this._event == undefined)
                        this._startAngle = 0;
                    this._event = e;
                    console.log("start")
                })
                .on("end", function(el) {
                    console.log("end")
                    this._startAngle = 0;
                    this._event = undefined;
                })
                .on("drag", function(el) {
                    var g = d3.select(this);
                    var oldEvent = this._event;
                    var newEvent = d3.getEvent();
                    this._event = newEvent;
    
                    if (oldEvent == undefined)
                        return;

                    var centre = {x: cx(), y: cy()};
                    var oldpos = {x: oldEvent.x - cx(), y: oldEvent.y - cy()};
                    var newpos = {x: newEvent.x - cx(), y: newEvent.y - cy()};

                    var angleOld = rad2deg(Math.atan(oldpos.y / oldpos.x));
                    var angleNew = rad2deg(Math.atan(newpos.y / newpos.x));
                    var dtheta = (angleNew - angleOld);
                    if (dtheta > 170) {
                        dtheta -= 180;
                    } else if (dtheta < -170) {
                        dtheta += 180;
                    }
                    console.log(dtheta);
                    this._startAngle += dtheta ;
                    if (this._startAngle < 0)
                        this._startAngle += 0;


                    var transform = d3.transform()
                        .translate([cx(), cy()])
                        .rotate(this._startAngle)
                        .translate([-cx(), -cy()])
                    g.transition().duration(10).attr("transform", transform);

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


