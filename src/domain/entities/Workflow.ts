import { Grafo } from './Grafo';
import { ResultadoFinal } from "./ResultadoFinal";

// Entidade Raiz: Workflow
export class Workflow {
  constructor(
    public readonly documentos_anexados: Record<string, string | string[]>,
    public readonly grafo: Grafo,
    public readonly resultado_final?: ResultadoFinal
  ) {}

  validate(): void {
    // Valida o grafo
    this.grafo.validate();

    // Valida resultado final se existir
    if (this.resultado_final) {
      this.resultado_final.validate(this.grafo.nos);
    }

    // Valida referências de documentos nos nós
    this.grafo.nos.forEach(node => {
      node.entradas.forEach(input => {
        if (input.fonte === 'documento_anexado' && input.documento) {
          if (!this.documentos_anexados[input.documento]) {
            throw new Error(`Nó '${node.nome}': documento '${input.documento}' não encontrado em documentos_anexados`);
          }
        }
      });
    });

    // Valida variáveis no prompt
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
    const variableRegex = /\{([^}]+)\}/g;
    const matches = prompt.match(variableRegex);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

  // Converte para o formato JSON esperado
  toJSON() {
    return {
      documentos_anexados: this.documentos_anexados,
      grafo: {
        nos: this.grafo.nos.map(node => ({
          nome: node.nome,
          categoria: node.categoria,
          ...(node.modelo_llm && { modelo_llm: node.modelo_llm }),
          ...(node.temperatura && { temperatura: node.temperatura }),
          ...(node.ferramentas.length > 0 && { ferramentas: node.ferramentas }),
          prompt: node.prompt,
          ...(node.entradas.length > 0 && { entradas: node.entradas }),
          saida: node.saida
        })),
        arestas: this.grafo.arestas.map(aresta => ({
          origem: aresta.origem,
          destino: aresta.destino
        }))
      },
      ...(this.resultado_final && {
        resultado_final: {
          saidas: this.resultado_final.saidas
        }
      })
    };
  }

  toJsonString(): string {
    return JSON.stringify(this.toJSON(), null, 2);
  }
}