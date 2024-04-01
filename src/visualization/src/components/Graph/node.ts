
import * as d3 from 'd3';
import { fitText } from '../util';
import { NodeDatum } from './build';

export function create_text(d: NodeDatum): void {
  if (d.details.what === "folder") {
    let fontsize = fitText(d.name, 80, 80 * d.size / 60);
    d3.select(this).append("text")
      .text((d: any) => d.name)
      .attr("x", 0)
      .attr("y", fontsize / 3)
      .style("font-size", fontsize + "px")
      .style("text-anchor", "middle")
      .style("fill", "black")
      .attr("stroke", "none");
  } else if (d.details.what === "file") {
    let fontsize = fitText(d.name, 50, d.size);
    d3.select(this).append("text")
      .text((d: any) => d.name)
      .attr("x", 0)
      .attr("y", fontsize / 3)
      .style("font-size", fontsize + "px")
      .style("text-anchor", "middle")
      .style("fill", "black")
      .attr("stroke", "none");
  } else {
    d3.select(this).append("text")
      .text((d: any) => d.name)
      .attr("x", 0)
      .attr("y", 4)
      .style("font-size", "8px")
      .style("text-anchor", "middle")
      .style("fill", "black")
      .attr("stroke", "none");
  }
}

function draw_file(el, color: string, size: number): void {
  // draw a file icon, based on https://www.iconpacks.net/free-icon/attachment-1530.html
  let s = size / 60;
  el.append("path")
    .attr("d", "M 78.42 18.345 v 68.502 c 0 1.741 -1.412 3.153 -3.153 3.153 H 14.733 c -1.741 0 -3.153 -1.412 -3.153 -3.153 V 3.153 C 11.58 1.412 12.991 0 14.733 0 h 45.343 C 63.133 7.61 69.386 13.658 78.42 18.345 z")
    .attr("fill", color)
    .attr("stroke", "#6a848c")
    .attr("transform", `translate(${-42 * s}, ${-40 * s}) scale(${s},${s})`);
  el.append("path")
    .attr("d", "M 78.42 18.345 H 62.948 c -1.587 0 -2.873 -1.286 -2.873 -2.873 V 0 L 78.42 18.345 z")
    .attr("fill", color)
    .attr("stroke", "#6a848c")
    .attr("transform", `translate(${-42 * s}, ${-40 * s}) scale(${s},${s})`);
}

function draw_folder(el, color: string, size: number): void {
  // draw a folder icon, based on https://www.iconpacks.net/free-icon/folder-1485.html
  let s = size / 60;
  el.append("path")
    .attr("d", "M 73.538 35.162 l -52.548 1.952 c -1.739 0 -2.753 0.651 -3.232 2.323 L 6.85 76.754 c -0.451 1.586 -2.613 2.328 -4.117 2.328 h 0 C 1.23 79.082 0 77.852 0 76.349 l 0 -10.458 V 23.046 v -2.047 v -6.273 c 0 -2.103 1.705 -3.808 3.808 -3.808 h 27.056 c 1.01 0 1.978 0.401 2.692 1.115 l 7.85 7.85 c 0.714 0.714 1.683 1.115 2.692 1.115 H 69.73 c 2.103 0 3.808 1.705 3.808 3.808 v 1.301 C 73.538 26.106 73.538 35.162 73.538 35.162 z")
    .attr("fill", color)
    .attr("stroke", "rgb(213 170 66)")
    .attr("transform", `translate(${-36.7 * s}, ${-40 * s}) scale(${s},${s})`);
  el.append("path")
    .attr("d", "M 2.733 79.082 L 2.733 79.082 c 1.503 0 2.282 -1.147 2.733 -2.733 l 10.996 -38.362 c 0.479 -1.672 2.008 -2.824 3.748 -2.824 h 67.379 c 1.609 0 2.765 1.546 2.311 3.09 L 79.004 75.279 c -0.492 1.751 -1.571 3.818 -3.803 3.803 C 75.201 79.082 2.733 79.082 2.733 79.082 z")
    .attr("fill", color)
    .attr("stroke", "rgb(213 170 66)")
    .attr("transform", `translate(${-36.7 * s}, ${-40 * s}) scale(${s},${s})`);
}


export function create_node(d: NodeDatum): void {
  if (d.details.what === "folder") {
    draw_folder(d3.select(this), d.color, d.size)
  } else if (d.details.what === "file") {
    draw_file(d3.select(this), d.color, d.size)
  } else {
    d3.select(this).append("circle")
      .attr("fill", (d: any) => d.color)
      .attr("stroke", d => "#000")
      .attr("r", (d: any) => d.size * 0.7);
  }
}
