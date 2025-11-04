import { Aresta } from './Aresta';
import NodeEntitie from "./NodeEntitie";

export class Grafo {
  constructor(
    public readonly nos: NodeEntitie[],
    public readonly arestas: Aresta[]
  ) {}

  validate(): void {
    // Valida todos os nós
    this.nos.forEach(node => node.validate());

    // Valida todas as arestas
    this.arestas.forEach(aresta => aresta.validate(this.nos));

    // Verifica se todos os nós estão conectados
    const connectedNodes = new Set<string>();
    this.arestas.forEach(aresta => {
      connectedNodes.add(aresta.origem);
      if (aresta.destino !== 'END') {
        connectedNodes.add(aresta.destino);
      }
    });

    this.nos.forEach(node => {
      if (!connectedNodes.has(node.nome)) {
        throw new Error(`Nó '${node.nome}' não está conectado no grafo`);
      }
    });

    // Verifica se o workflow termina com END
    const hasEnd = this.arestas.some(aresta => aresta.destino === 'END');
    if (!hasEnd) {
      throw new Error('Workflow deve terminar com uma aresta para "END"');
    }
  }

}