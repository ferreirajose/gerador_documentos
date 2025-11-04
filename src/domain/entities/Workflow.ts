// Workflow.ts
import { Grafo } from './Grafo';
import { ResultadoFinal } from "./ResultadoFinal";

// Interface para Documento Anexado
export interface DocumentoAnexado {
  chave: string;
  descricao: string;
  uuid_unico?: string;
  uuids_lista?: string[];
  tipo: 'unico' | 'lista';
}

// Entidade Raiz: Workflow
export class Workflow {
  constructor(
    public readonly documentos_anexados: DocumentoAnexado[],
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

    // Valida documentos anexados
    this.documentos_anexados.forEach(doc => {
      if (!doc.chave || !doc.descricao) {
        throw new Error('Documento anexado deve ter chave e descrição');
      }
      
      if (doc.tipo === 'unico' && !doc.uuid_unico) {
        throw new Error(`Documento único '${doc.chave}' deve ter um UUID único`);
      }
      
      if (doc.tipo === 'lista' && (!doc.uuids_lista || doc.uuids_lista.length === 0)) {
        throw new Error(`Documento lista '${doc.chave}' deve ter uma lista de UUIDs`);
      }
    });

    // Valida referências de documentos nos nós
    this.grafo.nos.forEach(node => {
      node.entradas.forEach(input => {
        if (input.fonte === 'documento_anexado' && input.documento) {
          const documentoExiste = this.documentos_anexados.some(
            doc => doc.chave === input.documento
          );
          if (!documentoExiste) {
            throw new Error(`Nó '${node.nome}': documento '${input.documento}' não encontrado em documentos_anexados`);
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