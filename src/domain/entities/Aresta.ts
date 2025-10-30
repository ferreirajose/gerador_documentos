import NodeEntitie from "@/domain/entities/NodeEntitie";

// Entidade: Aresta (Edge)
export class Aresta {
  constructor(
    public readonly origem: string,
    public readonly destino: string
  ) {}

  validate(nodes: NodeEntitie[]): void {
    const originNode = nodes.find(node => node.nome === this.origem);
    const destinationNode = nodes.find(node => node.nome === this.destino);

    if (!originNode) {
      throw new Error(`Aresta: nó de origem '${this.origem}' não encontrado`);
    }

    if (this.destino !== 'END' && !destinationNode) {
      throw new Error(`Aresta: nó de destino '${this.destino}' não encontrado`);
    }
  }
}