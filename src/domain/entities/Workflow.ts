import Edge from "./Edge";
import Node from "./Node";

export default class Workflow {
    constructor(
       readonly documentos: Record<string, string | string[]>,
       readonly grafo: { nodes: Node[]; edges: Edge[] },
       readonly modificarSaida: Record<string, string>
    ) {
    }


    toJsonString() {
       return JSON.stringify({
          documentos: this.documentos,
          grafo: {
             nodes: this.grafo.nodes,
             edges: this.grafo.edges
          },
          modificarSaida: this.modificarSaida
       }, null, 2);
    }
}