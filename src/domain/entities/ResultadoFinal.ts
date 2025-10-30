import NodeEntitie from "@/domain/entities/NodeEntitie";

// Value Object: Saída Final
export interface SaidaFinal {
  nome: string;
  manter_original?: boolean;
  combinar?: string[];
  template?: string;
}

export class ResultadoFinal {
  constructor(
    public readonly saidas: SaidaFinal[]
  ) {}

  validate(nodes: NodeEntitie[]): void {
    this.saidas.forEach(saida => {
      if (saida.manter_original && saida.combinar) {
        throw new Error(`Saída '${saida.nome}': não pode ter manter_original e combinar simultaneamente`);
      }

      if (saida.combinar && !saida.template) {
        throw new Error(`Saída '${saida.nome}': combinar requer template`);
      }

      // Verifica se as referências de saída existem
      if (saida.combinar) {
        saida.combinar.forEach(ref => {
          const nodeExists = nodes.some(node => node.saida.nome === ref);
          if (!nodeExists) {
            throw new Error(`Saída '${saida.nome}': referência '${ref}' não encontrada nos nós`);
          }
        });
      }

      if (saida.manter_original) {
        const nodeExists = nodes.some(node => node.saida.nome === saida.nome);
        if (!nodeExists) {
          throw new Error(`Saída '${saida.nome}': referência para manter_original não encontrada nos nós`);
        }
      }
    });
  }
}