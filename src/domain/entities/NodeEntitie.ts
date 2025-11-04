// NodeEntitie.ts
export interface NodeInput {
  variavel_prompt: string;
  fonte: 'documento_anexado' | 'saida_no_anterior';
  documento?: string;
  no_origem?: string;
  processar_em_paralelo?: boolean;
}

export interface NodeOutput {
  nome: string;
  formato?: 'markdown' | 'json';
}

export default class NodeEntitie {
  constructor(
    public readonly nome: string,
    public readonly prompt: string,
    public readonly saida: NodeOutput,
    public readonly entradas: NodeInput[] = [],
    public readonly modelo_llm?: string,
    public readonly temperatura?: number,
    public readonly ferramentas: string[] = []
  ) {}

  // Validação simplificada sem categoria
  validate(): void {
    // Apenas validações básicas que não dependem de categoria
    if (!this.nome || this.nome.trim() === '') {
      throw new Error('Nome do nó é obrigatório');
    }

    if (!this.prompt || this.prompt.trim() === '') {
      throw new Error('Prompt é obrigatório');
    }

    if (!this.saida.nome || this.saida.nome.trim() === '') {
      throw new Error('Nome da saída é obrigatório');
    }

    // Apenas uma entrada por nó pode ter processar_em_paralelo: true
    const parallelInputs = this.entradas.filter(input => input.processar_em_paralelo);
    if (parallelInputs.length > 1) {
      throw new Error(`Nó '${this.nome}' pode ter apenas uma entrada com processar_em_paralelo: true`);
    }
  }
}