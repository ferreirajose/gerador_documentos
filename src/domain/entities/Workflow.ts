import Edge from "./Edge";
import NodeEntitie from "./Node";

export default class Workflow {
    constructor(
       readonly documentos: Record<string, string | string[]>,
       readonly grafo: { nos: NodeEntitie[]; arestas: Edge[], ponto_de_entrada: string[] },
       readonly modificar_saida: Record<string, string>
    ) {
    }


    toJsonString() {
       return JSON.stringify({
          documentos: this.documentos,
          grafo: {
             ponto_de_entrada: this.grafo.ponto_de_entrada,
             nos: this.grafo.nos,
             arestas: this.grafo.arestas
          },
          modificar_saida: this.modificar_saida
       }, null, 2);
    }
}