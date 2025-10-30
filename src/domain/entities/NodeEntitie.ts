// Entidade: Nó (Node)
export interface NodeInput {
  variavel_prompt: string;
  fonte: 'documento_anexado' | 'saida_no_anterior';
  documento?: string; // apenas para documento_anexado
  no_origem?: string; // apenas para saida_no_anterior
  processar_em_paralelo?: boolean;
}

export interface NodeOutput {
  nome: string;
  formato?: 'markdown' | 'json';
}

export default class NodeEntitie {
  constructor(
    public readonly nome: string,
    public readonly categoria: 'entrada' | 'processamento' | 'saida',
    public readonly prompt: string,
    public readonly saida: NodeOutput,
    public readonly entradas: NodeInput[] = [],
    public readonly modelo_llm?: string,
    public readonly temperatura?: number,
    public readonly ferramentas: string[] = []
  ) {}

  // Validação de regras de negócio
  validate(): void {
    // Nós de entrada não podem depender de saída de nó anterior
    if (this.categoria === 'entrada') {
      const hasPreviousOutput = this.entradas.some(input => 
        input.fonte === 'saida_no_anterior'
      );
      if (hasPreviousOutput) {
        throw new Error(`Nó de entrada '${this.nome}' não pode depender de saida_no_anterior`);
      }
    }

    // Nós de processamento e saída devem ter pelo menos uma entrada de saida_no_anterior
    if (this.categoria === 'processamento' || this.categoria === 'saida') {
      const hasPreviousOutput = this.entradas.some(input => 
        input.fonte === 'saida_no_anterior'
      );
      if (!hasPreviousOutput) {
        throw new Error(`Nó de ${this.categoria} '${this.nome}' deve ter pelo menos uma entrada de saida_no_anterior`);
      }
    }

    // Nós de saída não podem ler documentos diretamente
    if (this.categoria === 'saida') {
      const hasDocumentInput = this.entradas.some(input => 
        input.fonte === 'documento_anexado'
      );
      if (hasDocumentInput) {
        throw new Error(`Nó de saída '${this.nome}' não pode ler documentos diretamente`);
      }
    }

    // Apenas uma entrada por nó pode ter processar_em_paralelo: true
    const parallelInputs = this.entradas.filter(input => input.processar_em_paralelo);
    if (parallelInputs.length > 1) {
      throw new Error(`Nó '${this.nome}' pode ter apenas uma entrada com processar_em_paralelo: true`);
    }
  }
}