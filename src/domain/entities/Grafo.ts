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

  hasConnectionsToNode(nodeName: string): boolean {
    return this.arestas.some(aresta => 
      aresta.origem === nodeName || aresta.destino === nodeName
    );
  }

  getConnectionsToNode(nodeName: string): Aresta[] {
    return this.arestas.filter(aresta => 
      aresta.origem === nodeName || aresta.destino === nodeName
    );
  }

  // Método para remover nó com validação
  removeNode(nodeName: string): void {
    if (this.hasConnectionsToNode(nodeName)) {
      const connections = this.getConnectionsToNode(nodeName);
      const connectionNames = connections.map(a => 
        a.origem === nodeName ? `→ ${a.destino}` : `${a.origem} →`
      ).join(', ');
      
      throw new Error(
        `Não é possível remover o nó '${nodeName}' porque ele possui conexões: ${connectionNames}. ` +
        `Remova as conexões primeiro.`
      );
    }

    const index = this.nos.findIndex(node => node.nome === nodeName);
    if (index !== -1) {
      this.nos.splice(index, 1);
    }
  }

  // Método para remover aresta
  removeAresta(origem: string, destino: string): void {
    const index = this.arestas.findIndex(aresta => 
      aresta.origem === origem && aresta.destino === destino
    );
    
    if (index !== -1) {
      this.arestas.splice(index, 1);
    }
  }

}