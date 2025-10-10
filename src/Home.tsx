import { WorkflowBuilder } from "./application/builders/WorkflowBuilder";
import WorkflowRelatorioService from "./application/services/WorkflowRelatorioService";
import { AccountingAnalystPrompt, AuditorPrompt, DefensePrompt, FinancialAnalystPrompt, FinancialConsolidatorPrompt, FinancialMetricsPrompt, InfoExtractorPrompt, RelatorPrompt, StrategicRecommendationsPrompt } from "./data/mock_prompt";
import WorkflowHttpGateway from "./gateway/WorkflowHttpGateway";
import AxiosAdapter from "./infra/AxiosAdapter";

const BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

export default function Home() {

    // async function createAndSendWorkflow() {
    //     // Criar o workflow usando o builder
    //     const builder = new WorkflowBuilder();

    //     // Configurar documentos
    //     builder.setDocumentos({
    //         auditoria_especial: '10831034617427640767',
    //         defesas_do_caso: [
    //             '13333786561136215878',
    //             '7065879860948131635',
    //             '11529010421945660908',
    //             '691210388070956173'
    //         ]
    //     });

    //     // Configurar ponto de entrada
    //     builder
    //         .setPontoDeEntrada(['AuditorNode', 'DefenseNode']);

    //     // Configurar nós
    //     builder
    //         .addNode('AuditorNode')
    //         .setAgent('audit')
    //         .setModel('claude-3-7-sonnet@20250219')
    //         .setPrompt(AuditorPrompt)
    //         .setOutputKey('workflow_data.analise_auditoria')
    //         .addEntrada('conteudo_auditoria', 'buscar_documento', 'doc.auditoria_especial')
    //         .endNode();

    //     builder
    //         .addNode('DefenseNode')
    //         .setAgent('defense')
    //         .setModel('claude-3-7-sonnet@20250219')
    //         .setPrompt(DefensePrompt)
    //         .setOutputKey('workflow_data.analises_defesas')
    //         .addEntrada('lista_de_origem', 'id_da_defesa', 'doc.defesas_do_caso')
    //         .addEntrada('conteudo_defesa', 'buscar_documento', '{id_da_defesa}')
    //         .endNode();

    //     // 5) RelatorNode
    //     builder
    //         .addNode('RelatorNode')
    //         .setAgent('relator')
    //         .setModel('gpt-4.1')
    //         .setPrompt(RelatorPrompt)
    //         .setOutputKey('workflow_data.voto_relator')
    //         .addEntrada('relatorio_da_auditoria', 'do_estado', 'workflow_data.analise_auditoria')
    //         .addEntrada('pareceres_das_defesas', 'do_estado', 'workflow_data.analises_defesas')
    //         .endNode();

    //     // 6) InfoExtractorNode
    //     builder
    //         .addNode('InfoExtractorNode')
    //         .setAgent('info_extractor')
    //         .setModel('gemini-2.5-pro')
    //         .setPrompt(InfoExtractorPrompt)
    //         .setOutputKey('workflow_data.dados_estruturados')
    //         .addEntrada('relatorio_da_auditoria', 'do_estado', 'workflow_data.analise_auditoria')
    //         .addEntrada('pareceres_das_defesas', 'do_estado', 'workflow_data.analises_defesas')
    //         .addEntrada('voto_relator', 'do_estado', 'workflow_data.voto_relator')
    //         .endNode();

    //     // Configurar arestas
    //     // builder
    //     //     .addEdge('AuditorNode', 'DefenseNode');
    //     builder
    //         .addEdge('AuditorNode', 'RelatorNode')
    //         .addEdge('DefenseNode', 'RelatorNode')
    //         .addEdge('RelatorNode', 'InfoExtractorNode')
    //         .addEdge('InfoExtractorNode', 'END');

    //     // Configurar template de saída
    //     builder.setModificarSaida(
    //         'relatorio_final',
    //         '{workflow_data.analise_auditoria}' +
    //         '{workflow_data.analises_defesas}' +
    //         '{workflow_data.voto_relator}'
    //     );

    //     const workflowJson = builder.toJSON();
    //     const httpClient = new AxiosAdapter();
    //     const workFlowGateway = new WorkflowHttpGateway(httpClient, BASE_URL, AUTH_TOKEN);
    //     const service = new WorkflowRelatorioService(workFlowGateway);

    //     const streaming = await service.gerarRelatorioComStreaming(workflowJson);

    //     streaming.onData((data) => {
    //         console.log("Dados recebidos:", data);
    //         console.log(`Status: ${data.status}`);

    //     });

    //     streaming.onError((error) => {
    //         console.error("Erro no streaming:", error);
    //     });

    //     streaming.onComplete(() => {
    //         console.log("Streaming completado");
    //     });

    // }

    async function createAndSendWorkflow() {
        // Criar o workflow usando o builder
        const builder = new WorkflowBuilder();

        // Configurar documentos financeiros
        builder.setDocumentos({
            relatorio_financeiro_anual: '',
            demonstracoes_contabeis: []
        });

        // Configurar ponto de entrada
        builder
            .setPontoDeEntrada(['AnalistaFinanceiroNode', 'AnalistaContabilNode']);

        // Configurar nós
        builder
            .addNode('AnalistaFinanceiroNode')
            .setAgent('financial_analyst')
            .setModel('claude-3-7-sonnet@20250219')
            .setPrompt(FinancialAnalystPrompt) // Prompt específico para análise financeira
            .setOutputKey('workflow_data.analise_financeira')
            .addEntrada('relatorio_financeiro', 'buscar_documento', 'doc.relatorio_financeiro_anual')
            .endNode();

        builder
            .addNode('AnalistaContabilNode')
            .setAgent('accounting_analyst')
            .setModel('claude-3-7-sonnet@20250219')
            .setPrompt(AccountingAnalystPrompt) // Prompt específico para análise contábil
            .setOutputKey('workflow_data.analises_contabeis')
            .addEntrada('lista_documentos', 'id_documento', 'doc.demonstracoes_contabeis')
            .addEntrada('conteudo_documento', 'buscar_documento', '{id_documento}')
            .endNode();

        // Nó de Consolidação Financeira
        builder
            .addNode('ConsolidadorFinanceiroNode')
            .setAgent('financial_consolidator')
            .setModel('gpt-4.1')
            .setPrompt(FinancialConsolidatorPrompt) // Prompt para consolidar análises
            .setOutputKey('workflow_data.relatorio_consolidado')
            .addEntrada('analise_financeira', 'do_estado', 'workflow_data.analise_financeira')
            .addEntrada('analises_contabeis', 'do_estado', 'workflow_data.analises_contabeis')
            .endNode();

        // Nó de Extração de Métricas Financeiras
        builder
            .addNode('MetricasFinanceirasNode')
            .setAgent('financial_metrics')
            .setModel('gemini-2.5-pro')
            .setPrompt(FinancialMetricsPrompt) // Prompt para extrair métricas estruturadas
            .setOutputKey('workflow_data.metricas_estruturadas')
            .addEntrada('analise_financeira', 'do_estado', 'workflow_data.analise_financeira')
            .addEntrada('analises_contabeis', 'do_estado', 'workflow_data.analises_contabeis')
            .addEntrada('relatorio_consolidado', 'do_estado', 'workflow_data.relatorio_consolidado')
            .endNode();

        // Nó de Recomendações Estratégicas
        builder
            .addNode('RecomendacoesNode')
            .setAgent('strategic_advisor')
            .setModel('claude-3-7-sonnet@20250219')
            .setPrompt(StrategicRecommendationsPrompt) // Prompt para gerar recomendações
            .setOutputKey('workflow_data.recomendacoes_estrategicas')
            .addEntrada('relatorio_consolidado', 'do_estado', 'workflow_data.relatorio_consolidado')
            .addEntrada('metricas_financeiras', 'do_estado', 'workflow_data.metricas_estruturadas')
            .endNode();

        // Configurar arestas
        builder
            .addEdge('AnalistaFinanceiroNode', 'ConsolidadorFinanceiroNode')
            .addEdge('AnalistaContabilNode', 'ConsolidadorFinanceiroNode')
            .addEdge('ConsolidadorFinanceiroNode', 'MetricasFinanceirasNode')
            .addEdge('MetricasFinanceirasNode', 'RecomendacoesNode')
            .addEdge('RecomendacoesNode', 'END');

        // Configurar template de saída para relatório financeiro
        builder.setModificarSaida(
            'relatorio_financeiro_final',
            'RELATÓRIO FINANCEiro CONSOLIDADO\n\n' +
            'ANÁLISE FINANCEIRA DETALHADA:\n{workflow_data.analise_financeira}\n\n' +
            'ANÁLISES CONTÁBEIS:\n{workflow_data.analises_contabeis}\n\n' +
            'RELATÓRIO CONSOLIDADO:\n{workflow_data.relatorio_consolidado}\n\n' +
            'MÉTRICAS FINANCEIRAS:\n{workflow_data.metricas_estruturadas}\n\n' +
            'RECOMENDAÇÕES ESTRATÉGICAS:\n{workflow_data.recomendacoes_estrategicas}'
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