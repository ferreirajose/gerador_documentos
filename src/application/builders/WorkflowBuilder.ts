// WorkflowBuilder.ts
import NodeEntitie from '@/domain/entities/NodeEntitie';
import { Aresta } from '@/domain/entities/Aresta';
import { Grafo } from '@/domain/entities/Grafo';
import { ResultadoFinal } from '@/domain/entities/ResultadoFinal';
import { Workflow } from '@/domain/entities/Workflow';
import { NodeBuilder } from './NodeBuilder';
import { ResultadoFinalBuilder } from './ResultadoFinalBuilder';

export class WorkflowBuilder {
  private documentos_anexados: Record<string, string | string[]> = {};
  private nodes: NodeEntitie[] = [];
  private arestas: Aresta[] = [];
  private resultado_final?: ResultadoFinal;

  // Builder para Node atual
  private currentNodeBuilder: NodeBuilder | null = null;
  // Builder para ResultadoFinal atual
  private resultadoFinalBuilder: ResultadoFinalBuilder | null = null;

  // ========== CONFIGURAÇÃO DO WORKFLOW ==========

  public setDocumentosAnexados(documentos: Record<string, string | string[]>): WorkflowBuilder {
    this.documentos_anexados = documentos;
    return this;
  }

  public addDocumento(nome: string, uuid: string | string[]): WorkflowBuilder {
    this.documentos_anexados[nome] = uuid;
    return this;
  }

  // ========== CONSTRUÇÃO DE NÓS ==========

  public startNode(nome: string, categoria: 'entrada' | 'processamento' | 'saida'): NodeBuilder {
    if (this.currentNodeBuilder) {
      throw new Error('Já existe um nó em construção. Finalize-o antes de iniciar outro.');
    }
    this.currentNodeBuilder = new NodeBuilder(nome, categoria, this);
    return this.currentNodeBuilder;
  }

  public addNode(node: NodeEntitie): WorkflowBuilder {
    this.nodes.push(node);
    return this;
  }

  public endNode(): WorkflowBuilder {
    if (!this.currentNodeBuilder) {
      throw new Error('Nenhum nó em construção para finalizar.');
    }
    
    const node = this.currentNodeBuilder.build();
    this.nodes.push(node);
    this.currentNodeBuilder = null;
    return this;
  }

  // ========== CONSTRUÇÃO DE ARESTAS ==========

  public addAresta(origem: string, destino: string): WorkflowBuilder {
    this.arestas.push(new Aresta(origem, destino));
    return this;
  }

  public connect(origem: string, destino: string): WorkflowBuilder {
    return this.addAresta(origem, destino);
  }

  public connectToEnd(origem: string): WorkflowBuilder {
    return this.addAresta(origem, 'END');
  }

  // ========== CONSTRUÇÃO DE RESULTADO FINAL ==========

  public startResultadoFinal(): ResultadoFinalBuilder {
    if (this.resultadoFinalBuilder) {
      throw new Error('Já existe um resultado final em construção.');
    }
    this.resultadoFinalBuilder = new ResultadoFinalBuilder(this);
    return this.resultadoFinalBuilder;
  }

  public setResultadoFinal(resultadoFinal: ResultadoFinal): WorkflowBuilder {
    this.resultado_final = resultadoFinal;
    return this;
  }

  public endResultadoFinal(): WorkflowBuilder {
    if (!this.resultadoFinalBuilder) {
      throw new Error('Nenhum resultado final em construção para finalizar.');
    }
    
    this.resultado_final = this.resultadoFinalBuilder.build();
    this.resultadoFinalBuilder = null;
    return this;
  }

  // ========== MÉTODOS DE VALIDAÇÃO E UTILITÁRIOS ==========

  public getNodeNames(): string[] {
    return this.nodes.map(node => node.nome);
  }

  public getFinalNodes(): string[] {
    const allSources = new Set(this.arestas.map(aresta => aresta.origem));
    return this.nodes
      .map(node => node.nome)
      .filter(nodeName => !allSources.has(nodeName));
  }

  public autoConnectFinalNodes(): WorkflowBuilder {
    const finalNodes = this.getFinalNodes();
    for (const finalNode of finalNodes) {
      const alreadyConnectedToEnd = this.arestas.some(
        aresta => aresta.origem === finalNode && aresta.destino === 'END'
      );
      
      if (!alreadyConnectedToEnd) {
        this.arestas.push(new Aresta(finalNode, 'END'));
      }
    }
    return this;
  }

  // ========== CONSTRUÇÃO DO WORKFLOW ==========

  public build(): Workflow {
    // Finalizar qualquer construção em andamento
    if (this.currentNodeBuilder) {
      this.endNode();
    }

    if (this.resultadoFinalBuilder) {
      this.endResultadoFinal();
    }

    // Conectar nós finais automaticamente se necessário
    this.autoConnectFinalNodes();

    // Criar o grafo
    const grafo = new Grafo(this.nodes, this.arestas);

    // Criar e validar o workflow
    const workflow = new Workflow(this.documentos_anexados, grafo, this.resultado_final);
    workflow.validate();

    return workflow;
  }

  public toJSON(): string {
    return this.build().toJsonString();
  }

}
