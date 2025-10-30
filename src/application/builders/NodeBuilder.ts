
// ========== BUILDER PARA NÓ ==========

import NodeEntitie, { NodeOutput, NodeInput } from "@/domain/entities/NodeEntitie";
import { WorkflowBuilder } from "./WorkflowBuilder";

export class NodeBuilder {
  private nome: string;
  private categoria: 'entrada' | 'processamento' | 'saida';
  private prompt: string = '';
  private saida: NodeOutput = { nome: '' };
  private entradas: NodeInput[] = [];
  private modelo_llm?: string;
  private temperatura?: number;
  private ferramentas: string[] = [];

  constructor(
    nome: string, 
    categoria: 'entrada' | 'processamento' | 'saida', 
    private workflowBuilder: WorkflowBuilder
  ) {
    this.nome = nome;
    this.categoria = categoria;
    // Definir nome padrão da saída baseado no nome do nó
    this.saida.nome = `${nome.toLowerCase()}_output`;
  }

  public setPrompt(prompt: string): NodeBuilder {
    this.prompt = prompt;
    return this;
  }

  public setModeloLLM(modelo: string): NodeBuilder {
    this.modelo_llm = modelo;
    return this;
  }

  public setTemperatura(temperatura: number): NodeBuilder {
    if (temperatura < 0 || temperatura > 2) {
      throw new Error('Temperatura deve estar entre 0 e 2');
    }
    this.temperatura = temperatura;
    return this;
  }

  public setFerramentas(ferramentas: string[]): NodeBuilder {
    this.ferramentas = ferramentas;
    return this;
  }

  public addFerramenta(ferramenta: string): NodeBuilder {
    this.ferramentas.push(ferramenta);
    return this;
  }

  public setOutput(nome: string, formato?: 'markdown' | 'json'): NodeBuilder {
    this.saida = { nome, formato };
    return this;
  }

  public addInput(
    variavel_prompt: string, 
    fonte: 'documento_anexado' | 'saida_no_anterior',
    referencia: string,
    processar_em_paralelo: boolean = false
  ): NodeBuilder {
    const input: NodeInput = {
      variavel_prompt,
      fonte,
      ...(fonte === 'documento_anexado' && { documento: referencia }),
      ...(fonte === 'saida_no_anterior' && { no_origem: referencia }),
      ...(processar_em_paralelo && { processar_em_paralelo })
    };

    this.entradas.push(input);
    return this;
  }

  public addDocumentoInput(variavel_prompt: string, documento: string, processar_em_paralelo: boolean = false): NodeBuilder {
    return this.addInput(variavel_prompt, 'documento_anexado', documento, processar_em_paralelo);
  }

  public addPreviousOutputInput(variavel_prompt: string, no_origem: string): NodeBuilder {
    return this.addInput(variavel_prompt, 'saida_no_anterior', no_origem);
  }

  public build(): NodeEntitie {
    const node = new NodeEntitie(
      this.nome,
      this.categoria,
      this.prompt,
      this.saida,
      this.entradas,
      this.modelo_llm,
      this.temperatura,
      this.ferramentas
    );

    // Validar o nó individualmente
    node.validate();

    return node;
  }

  public endNode(): WorkflowBuilder {
    const node = this.build();
    return this.workflowBuilder.addNode(node);
  }
}
