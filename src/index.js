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
var budget = {
    "Learning & Culture": 386.4,
    "Social Development": 278.4,
    "Health": 222.6,
    "Peace & Security": 211,
    "Economic Development": 210,
    "Community Development": 209.8,
    "Debt Service Cost": 202.2,
    "General Public Services": 93.1,
    "Contingency Reserve": 13
}
var data = Object.values(budget);
var dial = Dial()
    .radius(200)
    .cx(200)
    .cy(200)

svg
    .data([data])
    .call(dial);
