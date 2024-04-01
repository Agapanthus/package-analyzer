import * as d3 from 'd3';
import { Graph, LinkDatum, NodeDatum } from './build';



export function create_simulation(graph: Graph): d3.Simulation<NodeDatum, LinkDatum> {
    return d3.forceSimulation(graph.nodes)
        // pull links together
        .force("link", d3.forceLink(graph.links).id((d: any) => d.id).strength(.5))
        // push nodes apart
        .force("charge", d3.forceManyBody().strength(-800))
        // move everything towards a circle in the center
        .force("x", d3.forceRadial(Math.sqrt(graph.nodes.length) * 18, 0, 0).strength(0.2))
        //.force("x", d3.forceX().strength(0.1))
        //.force("y", d3.forceY().strength(0.1))
        // avoid collisions
        .force("collide", d3.forceCollide().radius((d: any) => d.size).iterations(4))
        .stop();
}

onmessage = function (event) {
    if (event.data.key != "graph") return;

    const graph = event.data.graph

    let total_i = 0;
    let N = 0
    {

        const simulation = create_simulation(graph);

        // without collision and "bringing things together"
        simulation
            .force("collide", null)
            .force("x", null)
            .force("y", null);

        N = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()))

        for (let i = 0; i < N; ++i) {
            postMessage({ type: "tick", progress: total_i, total: 1.5 * N });
            total_i++;
            simulation.tick();
        }
    }

    {
        const simulation = create_simulation(graph);

        for (let i = 0; i < N * 0.5; ++i) {
            postMessage({ type: "tick", progress: total_i, total: 1.5 * N });
            total_i++;
            simulation.tick();
        }
    }

    postMessage({ type: "end", nodes: graph.nodes, links: graph.links });

    // terminate itself
    self.close();
};