import { Grafo } from './Grafo';
import { FormatoResultadoFinal } from "./ResultadoFinal";

export interface DocumentoAnexado {
  chave: string;
  descricao: string;
  uuid_unico?: string;
  uuids_lista?: string[];
}

export class Workflow {
  constructor(
    public readonly documentos_anexados: DocumentoAnexado[],
    public readonly grafo: Grafo,
    public readonly formato_resultado_final?: FormatoResultadoFinal
  ) {}

  validate(): void {
    // Valida o grafo
    this.grafo.validate();

    // Valida resultado final se existir
    if (this.formato_resultado_final) {
      this.formato_resultado_final.validate(this.grafo.nos);
    }

    // Valida referências de documentos nos nós
    this.grafo.nos.forEach(node => {
      node.entradas.forEach(input => {
        if (input.origem === 'documento_anexado' && input.chave_documento_origem) {
          const documentoExiste = this.documentos_anexados.some(
            doc => doc.chave === input.chave_documento_origem
          );
          if (!documentoExiste) {
            throw new Error(`Nó '${node.nome}': documento '${input.chave_documento_origem}' não encontrado em documentos_anexados`);
          }
        }
      });
    });

    // Valida variáveis no prompt (código existente mantido)
    this.grafo.nos.forEach(node => {
      const promptVariables = this.extractPromptVariables(node.prompt);
      const inputVariables = node.entradas.map(input => input.variavel_prompt);
      
      const missingVariables = promptVariables.filter(variable => 
        !inputVariables.includes(variable)
      );
      
      if (missingVariables.length > 0) {
        throw new Error(`Nó '${node.nome}': variáveis no prompt sem entrada correspondente: ${missingVariables.join(', ')}`);
      }
    });
  
  }

  private extractPromptVariables(prompt: string): string[] {
    // Remove blocos de código JSON
    const jsonBlockRegex = /```json[\s\S]*?```/g;
    let cleanPrompt = prompt.replace(jsonBlockRegex, '');
    
    // Remove blocos de código genéricos
    const codeBlockRegex = /```[\s\S]*?```/g;
    cleanPrompt = cleanPrompt.replace(codeBlockRegex, '');
    
    // Remove JSONs stringificados com chaves duplas ({{ }})
    const jsonStringifyRegex = /\{\{[\s\S]*?\}\}/g;
    cleanPrompt = cleanPrompt.replace(jsonStringifyRegex, '');
    
    // Remove objetos JSON simples que podem estar no prompt
    const jsonObjectRegex = /\{\s*"[^"]*"\s*:\s*[^}]*\}/g;
    cleanPrompt = cleanPrompt.replace(jsonObjectRegex, '');
    
    // Agora extrai as variáveis reais do prompt
    const variableRegex = /\{([^}]+)\}/g;
    const matches = cleanPrompt.match(variableRegex);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

   // Método para remover nó do workflow com validação
  removeNode(nodeName: string): void {
    this.grafo.removeNode(nodeName);
  }

  // Método para remover aresta do workflow
  removeAresta(origem: string, destino: string): void {
    this.grafo.removeAresta(origem, destino);
  }

  // Método para verificar se um nó pode ser removido (sem conexões)
  canRemoveNode(nodeName: string): boolean {
    return !this.grafo.hasConnectionsToNode(nodeName);
  }

  // Método para obter informações das conexões de um nó
  getNodeConnections(nodeName: string): { origem: string, destino: string }[] {
    return this.grafo.getConnectionsToNode(nodeName).map(aresta => ({
      origem: aresta.origem,
      destino: aresta.destino
    }));
  }

  // Converte para o formato JSON esperado
  toJSON() {
    return {
      documentos_anexados: this.documentos_anexados,
      grafo: {
        nos: this.grafo.nos.map(node => ({
          nome: node.nome,
          ...(node.modelo_llm && { modelo_llm: node.modelo_llm }),
          ...(node.temperatura && { temperatura: node.temperatura }),
          ...(node.ferramentas.length > 0 && { ferramentas: node.ferramentas }),
          prompt: node.prompt,
          entrada_grafo: node.entrada_grafo,
          ...(node.entradas.length > 0 && { entradas: node.entradas }),
          saida: node.saida,
          interacao_com_usuario: node.interacao_com_usuario
        })),
        arestas: this.grafo.arestas.map(aresta => ({
          origem: aresta.origem,
          destino: aresta.destino
        }))
      },
      ...(this.formato_resultado_final && {
          combinacoes: this.formato_resultado_final.combinacoes,
          saidas_individuais: this.formato_resultado_final.saidas_individuais
      })
    };
  }

  toJsonString(): string {
    return JSON.stringify(this.toJSON(), null, 2);
  }
}