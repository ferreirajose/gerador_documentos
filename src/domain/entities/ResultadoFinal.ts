import NodeEntitie from "@/domain/entities/NodeEntitie";
export interface Combinacao {
  nome_da_saida: string;
  combinar_resultados: string[];
  manter_originais: boolean;
}

export class FormatoResultadoFinal {
  constructor(
    public readonly combinacoes: Combinacao[],
    public readonly saidas_individuais: string[]
  ) {}

  validate(nodes: NodeEntitie[]): void {
    // Validar combinações
    this.combinacoes.forEach(combinacao => {
      // if (combinacao.manter_originais && combinacao.combinar_resultados.length > 0) {
      //   throw new Error(`Combinação '${combinacao.nome_da_saida}': não pode ter manter_originais e combinar_resultados simultaneamente`);
      // }

      // Verifica se as referências de combinação existem
      combinacao.combinar_resultados.forEach(ref => {
        const nodeExists = nodes.some(node => node.saida.nome === ref);
        if (!nodeExists) {
          throw new Error(`Combinação '${combinacao.nome_da_saida}': referência '${ref}' não encontrada nos nós`);
        }
      });
    });

    // Validar saídas individuais
    this.saidas_individuais.forEach(saidaIndividual => {
      const nodeExists = nodes.some(node => node.saida.nome === saidaIndividual);
      if (!nodeExists) {
        throw new Error(`Saída individual '${saidaIndividual}': não encontrada nos nós`);
      }
    });

    // Validar nomes únicos
    const todosNomes = [
      ...this.combinacoes.map(c => c.nome_da_saida),
      ...this.saidas_individuais
    ];
    
    const nomesDuplicados = todosNomes.filter((nome, index) => 
      todosNomes.indexOf(nome) !== index
    );
    
    if (nomesDuplicados.length > 0) {
      throw new Error(`Nomes de saída duplicados encontrados: ${nomesDuplicados.join(', ')}`);
    }
  }
}