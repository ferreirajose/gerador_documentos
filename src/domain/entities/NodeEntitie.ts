export interface Entrada {
  variavel_prompt: string;
  origem: "documento_anexado" | "resultado_no_anterior";
  chave_documento_origem?: string;
  nome_no_origem?: string;
  executar_em_paralelo?: boolean;
}
export interface InteracaoComUsuario {
  permitir_usuario_finalizar: boolean;
  ia_pode_concluir: boolean;
  requer_aprovacao_explicita: boolean;
  maximo_de_interacoes: number
  modo_de_saida: "ultima_mensagem" | "historico_completo";
}
export interface NodeOutput {
  nome: string;
  formato?: "markdown" | "json";
}

export default class NodeEntitie {
  constructor(
    public readonly nome: string,
    public readonly prompt: string,
    public readonly entrada_grafo: boolean = false,
    public readonly saida: NodeOutput,
    public readonly interacao_com_usuario?: InteracaoComUsuario,
    public readonly entradas: Entrada[] = [],
    public readonly modelo_llm?: string,
    public readonly temperatura?: number,
    public readonly ferramentas: string[] = []
  ) {}

  // Validação que inclui verificação de nome único
  validate(existingNodes: NodeEntitie[] = []): void {
    // Validações básicas
    if (!this.nome || this.nome.trim() === "") {
      throw new Error("Nome do nó é obrigatório");
    }

    if (!this.prompt || this.prompt.trim() === "") {
      throw new Error("Prompt é obrigatório");
    }

    if (!this.saida.nome || this.saida.nome.trim() === "") {
      throw new Error("Nome da saída é obrigatório");
    }

    // Validação de nome único
    const duplicateNode = existingNodes.find(
      (node) => node.nome === this.nome && node !== this
    );

    if (duplicateNode) {
      throw new Error(`Já existe um nó com o nome "${this.nome}"`);
    }

    // Apenas uma entrada por nó pode ter executar_em_paralelo: true
    const parallelInputs = this.entradas.filter(
      (input) => input.executar_em_paralelo
    );
    if (parallelInputs.length > 1) {
      throw new Error(
        `Nó '${this.nome}' pode ter apenas uma entrada com executar_em_paralelo: true`
      );
    }
  }
}
