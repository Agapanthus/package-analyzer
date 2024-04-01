import { uniqueBy } from "../util";
import * as d3 from 'd3';

export class FileDetails {
  text: string
  code: number
  blanks: number
  comment: number
  language: string
}

export class FolderDetails {
}

export class MethodDetails {
  signature: string
}

export class Details {
  public what: string
  public name: string
  public icon: string
  public graph: Graph
  public file_details?: FileDetails
  public folder_details?: FolderDetails
  public method_details?: MethodDetails

  public line: number
  public path: string
}

export interface NodeDatum extends d3.SimulationNodeDatum {
  name: string,
  details: Details,
  size: number,
  color: string,
  parent?: NodeDatum,
  children: NodeDatum[],
  id: string
}

export function nodeDatum_loc(d: NodeDatum): Record<string, number> {
  if (d.details.what === "file") {
    let res = {}
    const l = d.details.file_details!.language
    res[l + "@code"] = d.details.file_details!.code
    res[l + "@blank"] = d.details.file_details!.blanks
    res[l + "@comment"] = d.details.file_details!.comment
    res[l + "@files"] = 1
    return res
  }
  let res = {}
  for (let c of d.children) {
    let loc = nodeDatum_loc(c)
    for (let l in loc) {
      res[l] = (res[l] || 0) + loc[l]
    }
  }
  return res
}

export interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: NodeDatum,
  target: NodeDatum,
  width: number,
  id: string
}

export class Graph {
  public nodes: NodeDatum[]
  public links: LinkDatum[]
  public constraints: any[]
  public groups: any[]

  private raw_data: any;
  private path2nodeId: Record<string, number>;

  constructor(data: any) {
    this.nodes = []
    this.links = []
    this.constraints = []
    this.groups = []
    this.raw_data = data
    this.path2nodeId = {}
    this.add_folders()
    this.add_methods()
    this.sort_children()
  }

  private sort_children() {
    for (let n of this.nodes) {
      //n.children = uniqueBy(n.children, (x) => x.id)
      n.children.sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  private folder_details(subpath: string): Details {
    const i = subpath.split('/').length - 1;
    const name = subpath.split('/').pop() || ""
    return {
      path: subpath,
      graph: this,
      line: -1,
      name,
      icon: "mdi-folder",
      what: "folder", folder_details: {}
    }
  }

  private file_details(subpath: string): Details {
    const txt = this.raw_data.files[subpath];
    const name = txt.artifact.filename;
    return {
      graph: this,
      name,
      path: txt.artifact.path,
      line: -1,
      icon: "mdi-file",
      what: "file", file_details: {
        text: txt.text,
        code: txt.code,
        blanks: txt.blanks,
        comment: txt.comments,
        language: txt.lang
      }
    }
  }

  private add_folders() {
    let id = 0;
    for (const path in this.raw_data.files) {
      const parts = path.split('/');
      for (let i = 0; i < parts.length; i++) {
        const name = parts[i];
        const subpath = parts.slice(0, i + 1).join('/');
        if (this.path2nodeId[subpath] === undefined) {
          this.path2nodeId[subpath] = id;

          if (i == parts.length - 1) {
            // add a file
            const size = Math.max(10, 2 * Math.sqrt(this.raw_data.files[subpath].code) || 0);
            this.nodes.push({
              id: id.toString(),
              name: name,
              details: this.file_details(subpath),
              size: size,
              color: "lightblue",
              children: []
            });

          } else {
            // add a folder
            this.nodes.push({
              id: id.toString(),
              name: name,
              details: this.folder_details(subpath),
              size: i == 0 ? 120 : 60,
              color: "rgb(255,200,67)",
              children: []
            });
          }
          id += 1;

          // Link it to the parent
          if (i > 0) {
            const subpath2 = parts.slice(0, i).join('/');
            const source = this.nodes[this.path2nodeId[subpath2]]
            const target = this.nodes[id - 1]
            this.links.push({ id: `${source.id} ${target.id}`, source, target, width: 5 });
            target.parent = source
            source.children.push(target)
          }
        }
      }
    }

  }

  private add_methods() {
    for (const fun in this.raw_data.functions) {
      const f = this.raw_data.functions[fun];
      for (const m of f.methods) {
        const name = f.name
        this.nodes.push({
          id: this.nodes.length.toString(),
          name: name,
          size: 20,
          color: "#ccc",
          details: {
            what: "method",
            path: m.file,
            line: m.line,
            name,
            icon: "mdi-function",
            graph: this,
            method_details: {
              signature: m.params,
            }
          },
          children: [],

        });
        const id = this.nodes.length;
        const source = this.nodes[this.path2nodeId[m.file]]
        const target = this.nodes[id - 1]
        if (!source || !target) {
          console.log("source is undefined", m.file)
        } else {
          this.links.push({ id: `${source.id} ${target.id}`, source, target, width: 1 });
          target.parent = source
          source.children.push(target)
        }
      }
    }
  }

  public select_file(file: string) {

  }

}
