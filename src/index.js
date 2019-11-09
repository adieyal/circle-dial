import {select, selectAll} from 'd3-selection';
import {Dial} from './dial.js';

var width = 1024;
var height = 768;

const d3 = {select, selectAll}

var svg = d3.selectAll("#viz")
    .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("margin-left", "100px")
var data = [5, 20, 10, 7, 4, 9, 2, 6, 8, 13, 20, 18, 5, 28];
var dial = Dial()
    .radius(200)
    .cx(200)
    .cy(200)

svg
    .data([data])
    .call(dial);
