import { WorkflowBuilder } from "./application/builders/WorkflowBuilder";
import WorkflowRelatorioService from "./application/services/WorkflowRelatorioService";
import { AuditorPrompt, DefensePrompt, InfoExtractorPrompt, RelatorPrompt } from "./data/mock_prompt";
import WorkflowHttpGateway from "./gateway/WorkflowHttpGateway";
import AxiosAdapter from "./infra/AxiosAdapter";

const BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

export default function Home() {

    async function createAndSendWorkflow() {
        // Criar o workflow usando o builder
        const builder = new WorkflowBuilder();

        // Configurar documentos
        builder.setDocumentos({
            auditoria_especial: '10831034617427640767',
            defesas_do_caso: [
                '13333786561136215878',
                '7065879860948131635',
                '11529010421945660908',
                '691210388070956173'
            ]
        });

        // Configurar ponto de entrada
        builder
            .setPontoDeEntrada(['AuditorNode', 'DefenseNode']);

        // Configurar nós
        builder
            .addNode('AuditorNode')
            .setAgent('audit')
            .setModel('claude-3-7-sonnet@20250219')
            .setPrompt(AuditorPrompt)
            .setOutputKey('workflow_data.analise_auditoria')
            .addEntrada('conteudo_auditoria', 'buscar_documento', 'doc.auditoria_especial')
            .endNode();

        builder
            .addNode('DefenseNode')
            .setAgent('defense')
            .setModel('claude-3-7-sonnet@20250219')
            .setPrompt(DefensePrompt)
            .setOutputKey('workflow_data.analises_defesas')
            .addEntrada('lista_de_origem', 'id_da_defesa', 'doc.defesas_do_caso')
            .addEntrada('conteudo_defesa', 'buscar_documento', '{id_da_defesa}')
            .endNode();

        // 5) RelatorNode
        builder
            .addNode('RelatorNode')
            .setAgent('relator')
            .setModel('gpt-4.1')
            .setPrompt(RelatorPrompt)
            .setOutputKey('workflow_data.voto_relator')
            .addEntrada('relatorio_da_auditoria', 'do_estado', 'workflow_data.analise_auditoria')
            .addEntrada('pareceres_das_defesas', 'do_estado', 'workflow_data.analises_defesas')
            .endNode();

        // 6) InfoExtractorNode
        builder
            .addNode('InfoExtractorNode')
            .setAgent('info_extractor')
            .setModel('gemini-2.5-pro')
            .setPrompt(InfoExtractorPrompt)
            .setOutputKey('workflow_data.dados_estruturados')
            .addEntrada('relatorio_da_auditoria', 'do_estado', 'workflow_data.analise_auditoria')
            .addEntrada('pareceres_das_defesas', 'do_estado', 'workflow_data.analises_defesas')
            .addEntrada('voto_relator', 'do_estado', 'workflow_data.voto_relator')
            .endNode();

        // Configurar arestas
        // builder
        //     .addEdge('AuditorNode', 'DefenseNode');
        builder
            .addEdge('AuditorNode', 'RelatorNode')
            .addEdge('DefenseNode', 'RelatorNode')
            .addEdge('RelatorNode', 'InfoExtractorNode')
            .addEdge('InfoExtractorNode', 'END');

        // Configurar template de saída
        builder.setModificarSaida(
            'relatorio_final',
            '{workflow_data.analise_auditoria}' +
            '{workflow_data.analises_defesas}' +
            '{workflow_data.voto_relator}'
        );

        const workflowJson = builder.toJSON();
        const httpClient = new AxiosAdapter();
        const workFlowGateway = new WorkflowHttpGateway(httpClient, BASE_URL, AUTH_TOKEN);
        const service = new WorkflowRelatorioService(workFlowGateway);

        const streaming = await service.gerarRelatorioComStreaming(workflowJson);

        streaming.onData((data) => {
            console.log("Dados recebidos:", data);
            console.log(`Status: ${data.status}`);

        });

        streaming.onError((error) => {
            console.error("Erro no streaming:", error);
        });

        streaming.onComplete(() => {
            console.log("Streaming completado");
        });

    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <button 
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                onClick={createAndSendWorkflow}
            >
                Executar Fluxo
            </button>
        </div>
    );
}