// NodeEntitie.ts
export interface NodeInput {
  variavel_prompt: string;
  fonte: 'documento_anexado' | 'saida_no_anterior';
  documento?: string;
  no_origem?: string;
  executar_em_paralelo?: boolean;
}

export interface NodeOutput {
  nome: string;
  formato?: 'markdown' | 'json';
}

// NodeEntitie.ts
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

  // Validação que inclui verificação de nome único
  validate(existingNodes: NodeEntitie[] = []): void {
    // Validações básicas
    if (!this.nome || this.nome.trim() === '') {
      throw new Error('Nome do nó é obrigatório');
    }

    if (!this.prompt || this.prompt.trim() === '') {
      throw new Error('Prompt é obrigatório');
    }

    if (!this.saida.nome || this.saida.nome.trim() === '') {
      throw new Error('Nome da saída é obrigatório');
    }

    // Validação de nome único
    const duplicateNode = existingNodes.find(node => 
      node.nome === this.nome && node !== this
    );
    
    if (duplicateNode) {
      throw new Error(`Já existe um nó com o nome "${this.nome}"`);
    }

    // Apenas uma entrada por nó pode ter executar_em_paralelo: true
    const parallelInputs = this.entradas.filter(input => input.executar_em_paralelo);
    if (parallelInputs.length > 1) {
      throw new Error(`Nó '${this.nome}' pode ter apenas uma entrada com executar_em_paralelo: true`);
    }
  }
}