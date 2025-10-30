import { Aresta } from './Aresta';
import NodeEntitie from "./NodeEntitie";

// Entidade: Grafo
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

    // Verifica se há pelo menos um nó de entrada
    const entradaNodes = this.nos.filter(node => node.categoria === 'entrada');
    if (entradaNodes.length === 0) {
      throw new Error('Workflow deve ter pelo menos um nó de categoria "entrada"');
    }

    // Verifica se o workflow termina com END
    const hasEnd = this.arestas.some(aresta => aresta.destino === 'END');
    if (!hasEnd) {
      throw new Error('Workflow deve terminar com uma aresta para "END"');
    }
  }

  // Detecta automaticamente os pontos de entrada
  get pontosDeEntrada(): string[] {
    return this.nos
      .filter(node => node.categoria === 'entrada')
      .map(node => node.nome);
  }
}