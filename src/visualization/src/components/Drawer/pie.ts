import * as d3 from 'd3';

export function createPie(selector: string, data: Record<string, number>) {

  const width = 400,
    height = 200,
    margin = 20;
  const radius = Math.min(width, height) / 2 - margin

  const svg = d3.select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const color = d3.scaleOrdinal()
    .range(d3.schemeSet2);

  // Compute the position of each group on the pie:
  const pie = d3.pie()
    .value(function (d) { return d[1] })
  const data_ready = pie(Object.entries(data) as any)

  // TODO: comments and loc are separated by the sorting. Move the comments to the loc!

  var arc = d3.arc()
    .innerRadius(radius * 0.5)         // This is the size of the donut hole
    .outerRadius(radius * 0.8)

  // Another arc that won't be drawn. Just for labels positioning
  var outerArc = d3.arc()
    .innerRadius(radius * 0.85)
    .outerRadius(radius * 0.85)

  svg
    .selectAll('allSlices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arc as any)
    .attr('fill', ((d) => {
      const parts = d.data[0].split('@');
      if (parts[1] == "code")
        return color(parts[0])
      else
        return color(parts[0]) + "c0"
    }) as any)
    .attr("stroke", "white")
    .style("stroke-width", "0")
    .style("opacity", 0.7)

  let lastPosP = -100000;
  let lastPosN = -100000;
  const MIN_STEP = 14;

  let indices = Array.from({ length: data_ready.length }, (_, i) => i);
  indices.sort((a, b) => {
    let midangleA = data_ready[a].startAngle + (data_ready[a].endAngle - data_ready[a].startAngle) / 2;
    let midangleB = data_ready[b].startAngle + (data_ready[b].endAngle - data_ready[b].startAngle) / 2;
    return midangleB - midangleA;
  });

  for (const i of indices) {
    const d = data_ready[i];
    const parts = d.data[0].split('@');
    if (parts[1] == "code") {
      var pos = outerArc.centroid(d as any);
      var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
      pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
      if (midangle < Math.PI) {
        pos[1] = Math.max(lastPosP + MIN_STEP, pos[1]);
        lastPosP = pos[1];
      } else {
        pos[1] = Math.max(lastPosN + MIN_STEP, pos[1]);
        lastPosN = pos[1];
      }
      (data_ready[i] as any).pos = pos;
    }
  }


  svg
    .selectAll('allPolylines')
    .data(data_ready)
    .enter()
    .filter((d) => d.data[0].split('@')[1] == "code")
    .append('polyline')
    .attr("stroke", "black")
    .style("fill", "none")
    .attr("stroke-width", 1)
    .attr('points', (d: any) => {
      var posA = arc.centroid(d) // line insertion in the slice
      var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
      return [posA, posB, d.pos]
    })

  svg
    .selectAll('allLabels')
    .data(data_ready)
    .enter()
    .append('text')
    .text(function (d) { const parts = d.data[0].split('@'); if (parts[1] == "code") return parts[0] + " (" + d.data[1] + ")"; else return "" })
    .attr('transform', function (d) {
      const p = (d as any).pos;
      if (p) return 'translate(' + p + ')';
      return '';
    })
    .attr('font-size', 12)
    .style('text-anchor', function (d) {
      var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
      return (midangle < Math.PI ? 'start' : 'end')
    })

}