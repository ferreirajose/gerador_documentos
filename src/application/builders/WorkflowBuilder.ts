import Edge from '@/domain/entities/Edge';
import NodeEntitie from '@/domain/entities/Node';
import Workflow from '@/domain/entities/Workflow';

export class WorkflowBuilder {
    private documentos: Record<string, string | string[]> = {};
    private nos: NodeEntitie[] = [];
    private arestas: Edge[] = [];
    private currentNode: NodeEntitie | null = null;
    private modificar_saida: Record<string, string> = {};
    private ponto_de_entrada: string[] = [];

    public setDocumentos(documentos: Record<string, string | string[]>): WorkflowBuilder {
        this.documentos = documentos;
        return this;
    }

    public addNode(nome: string): WorkflowBuilder {
        this.currentNode = new NodeEntitie(
            nome,
            '', // agent
            '', // model
            '', // prompt
            '', // outputKey
            {} // inputs - objeto vazio em vez de array
        );
        return this;
    }

    public setAgent(agent: string): WorkflowBuilder {
        if (!this.currentNode) throw new Error('No node selected');
        this.currentNode = new NodeEntitie(
            this.currentNode.nome,
            agent,
            this.currentNode.modelo_llm,
            this.currentNode.prompt,
            this.currentNode.chave_de_saida,
            this.currentNode.entradas
        );
        return this;
    }

    public setModel(model: string): WorkflowBuilder {
        if (!this.currentNode) throw new Error('No node selected');
        this.currentNode = new NodeEntitie(
            this.currentNode.nome,
            this.currentNode.agente,
            model,
            this.currentNode.prompt,
            this.currentNode.chave_de_saida,
            this.currentNode.entradas
        );
        return this;
    }

    public setPrompt(prompt: string): WorkflowBuilder {
        if (!this.currentNode) throw new Error('No node selected');
        this.currentNode = new NodeEntitie(
            this.currentNode.nome,
            this.currentNode.agente,
            this.currentNode.modelo_llm,
            prompt,
            this.currentNode.chave_de_saida,
            this.currentNode.entradas
        );
        return this;
    }

    public setOutputKey(outputKey: string): WorkflowBuilder {
        if (!this.currentNode) throw new Error('No node selected');
        this.currentNode = new NodeEntitie(
            this.currentNode.nome,
            this.currentNode.agente,
            this.currentNode.modelo_llm,
            this.currentNode.prompt,
            outputKey,
            this.currentNode.entradas
        );
        return this;
    }

    public addEntrada(name: string, type: string, source: string): WorkflowBuilder {
        if (!this.currentNode) throw new Error('No node selected');
        
        // Criar uma cópia do objeto entradas existente
        const newInputs = { ...this.currentNode.entradas };
        
        // Adicionar a nova entrada
        newInputs[name] = { [type]: source };

        this.currentNode = new NodeEntitie(
            this.currentNode.nome,
            this.currentNode.agente,
            this.currentNode.modelo_llm,
            this.currentNode.prompt,
            this.currentNode.chave_de_saida,
            newInputs
        );
        return this;
    }

    public endNode(): WorkflowBuilder {
        if (!this.currentNode) throw new Error('No node to end');
        this.nos.push(this.currentNode);
        this.currentNode = null;
        return this;
    }

    public addEdge(source: string, target: string): WorkflowBuilder {
        this.arestas.push(new Edge(source, target));
        return this;
    }

    public setPontoDeEntrada(nodes: string[]): WorkflowBuilder {
        this.ponto_de_entrada = nodes;
        return this;
    }

    public setmodificar_saida(key: string, template: string): WorkflowBuilder {
        this.modificar_saida[key] = template;
        return this;
    }

    public build(): Workflow {
        if (this.currentNode) {
            throw new Error('There is an unclosed node. Call endNode() before building.');
        }

        return new Workflow(
            this.documentos,
            { 
                nos: this.nos, 
                arestas: this.arestas, 
                ponto_de_entrada: this.ponto_de_entrada 
            },
            this.modificar_saida
        );
    }

    public toJSON(): string {
        return this.build().toJsonString();
    }
}