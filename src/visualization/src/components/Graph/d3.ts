
import * as d3 from 'd3';
import { Details, Graph, LinkDatum, NodeDatum } from './build';
import { create_node, create_text } from './node';
import { create_simulation } from './worker';


function generate_drag(simulation: d3.Simulation<NodeDatum, LinkDatum>): (selection: any) => void {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

export class D3Graph {
  private simulation: d3.Simulation<NodeDatum, LinkDatum>
  private g: d3.Selection<SVGGElement, any, any, any>
  private svg: d3.Selection<SVGSVGElement, any, any, any>
  private background: d3.Selection<SVGRectElement, any, any, any>
  private link: d3.Selection<d3.BaseType | SVGLineElement, LinkDatum, SVGGElement, any>
  private node: d3.Selection<d3.BaseType | SVGGElement, NodeDatum, SVGGElement, any>

  constructor(private width: number,
    private height: number,
    private show_element: (d: NodeDatum | null) => void,
    private graph: Graph,
    private tick_callback: (g: D3Graph) => void
  ) {

  }

  private create_graph() {
    this.svg = d3.select("#graph").append("svg")
      .attr("width", this.width)
      .attr("height", this.height);
    this.setup_background();
    this.g = this.svg.append('g');
    this.setup_pan_zoom();
    this.setup_simulation();
    this.setup_link()
    this.setup_node();
  }

  private setup_background() {
    this.background = this.svg.append('rect')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'white')
      .style('cursor', 'move').on('click', () => this.show_element(null));
  }

  private setup_pan_zoom() {
    const handleZoom = (e) => this.g.attr('transform', e.transform);
    const zoom = d3.zoom().on('zoom', handleZoom);
    this.svg.call(zoom as any).call(zoom.transform as any, d3.zoomIdentity.translate(this.width / 2, this.height / 2).scale(0.3))

  }

  private setup_link() {
    const groupLinks = this.g.append('g');
    this.link = groupLinks.append("g")
      .attr("stroke", "#000")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 4.0)
      .selectAll("line")
      .data(this.graph.links)
      .join("line");
  }

  private setup_node() {
    const groupNodes = this.g.append('g');
    this.node = groupNodes.append("g")
      .selectAll("g")
      .data(this.graph.nodes)
      .join("g")
      .style("cursor", "pointer")
      .call(generate_drag(this.simulation))
      .on("click", (event, d: NodeDatum) => {
        this.show_element(d)
      })
      .on("mouseover", function (d) {
        d3.select(this).select("circle").style("opacity", ".5");
        d3.select(this).selectAll("path").style("opacity", ".5");
      })
      .on("mouseout", function (d) {
        d3.select(this).select("circle").style("opacity", "1.0");
        d3.select(this).selectAll("path").style("opacity", "1.0");
      });

    this.node.each(create_node);
    this.node.each(create_text);
  }

  private setup_simulation() {
    this.simulation = create_simulation(this.graph)
    this.simulation.on("tick", () => {
      this.link
        .attr("x1", (d: LinkDatum) => d.source.x || 0)
        .attr("y1", (d: LinkDatum) => d.source.y || 0)
        .attr("x2", (d: LinkDatum) => d.target.x || 0)
        .attr("y2", (d: LinkDatum) => d.target.y || 0);
      this.node.attr("transform", (d: NodeDatum) => `translate(${d.x}, ${d.y})`);
      this.tick_callback(this);
    });
  }

  public reset_highlight() {
    this.node.each(function (d: NodeDatum) {
      d3.select(this).select("circle").style("fill", d.color);
      d3.select(this).selectAll("path").style("fill", d.color);
    });
  }

  public highlight_node(id: string | null, color: string) {
    if (id) {
      const node = this.node.filter((d: NodeDatum) => d.id === id);
      node.select("circle").style("fill", color);
      node.selectAll("path").style("fill", color);
    }
  }

  public reset_highlight_link() {
    this.link.each(function (d: LinkDatum) {
      d3.select(this).attr("stroke", "black");
    });
  }

  public highlight_link(id: string | null, color: string) {
    if (id) {
      const link = this.link.filter((d: LinkDatum) => d.id === id);
      link.attr("stroke", color);
    }
  }

  public restart() {
    this.simulation.restart();
  }

  public stop() {
    this.simulation.stop();
  }

  public alpha() {
    return this.simulation.alpha();
  }

  public unmount() {
    this.stop();
    d3.selectAll("svg > *").remove();
  }

  public warmstart_worker(onProgress: (prog: number, total: number) => void, done: () => void) {
    const worker = new Worker(
      new URL('./worker', import.meta.url),
      { type: 'module' }
    );
    worker.addEventListener('message', (event) => {
      if (event.data.type === 'tick') {
        onProgress(event.data.progress, event.data.total);
      } else if (event.data.type === 'end') {
        worker.terminate();
        this.graph.nodes = event.data.nodes
        this.graph.links = event.data.links
        this.create_graph();
        this.simulation.restart();
        done();
      }
    });

    worker.postMessage({ key: "graph", graph: this.graph });
  }
}

