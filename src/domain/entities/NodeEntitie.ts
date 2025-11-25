export interface Entrada {
  variavel_prompt: string;
  origem: "documento_anexado" | "resultado_no_anterior" | "documento_upload_execucao";

  // Campos para documento pré-anexado (origem: "documento_anexado")
  chave_documento_origem?: string;

  // Campos para documento com upload durante execução (origem: "documento_upload_execucao")
  quantidade_arquivos?: "zero" | "um" | "varios";

  // Campos para resultado de nó anterior (origem: "resultado_no_anterior")
  nome_no_origem?: string;

  // Campo comum
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
  formato: "markdown" | "json";
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

    // Validação dos campos de entrada de acordo com a origem
    this.entradas.forEach((entrada, index) => {
      if (entrada.origem === "documento_upload_execucao") {
        if (!entrada.quantidade_arquivos) {
          throw new Error(
            `Entrada ${index + 1} do nó '${this.nome}': campo 'quantidade_arquivos' é obrigatório quando origem é 'documento_upload_execucao'`
          );
        }
      } else if (entrada.origem === "documento_anexado") {
        if (!entrada.chave_documento_origem) {
          throw new Error(
            `Entrada ${index + 1} do nó '${this.nome}': campo 'chave_documento_origem' é obrigatório quando origem é 'documento_anexado'`
          );
        }
      } else if (entrada.origem === "resultado_no_anterior") {
        if (!entrada.nome_no_origem) {
          throw new Error(
            `Entrada ${index + 1} do nó '${this.nome}': campo 'nome_no_origem' é obrigatório quando origem é 'resultado_no_anterior'`
          );
        }
      }
    });
  }
}
