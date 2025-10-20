import { useState, useEffect } from "react";
import { WorkflowBuilder } from "./application/builders/WorkflowBuilder";
import { AccountingAnalystPrompt, AuditorPrompt, DefensePrompt, FinancialAnalystPrompt, FinancialConsolidatorPrompt, FinancialMetricsPrompt, InfoExtractorPrompt, RelatorPrompt, StrategicRecommendationsPrompt } from "./data/mock_prompt";
import { RelatorioEvent } from "./relatorio.service";
import { useRelatorioService } from "./hooks/useRelatorioService";

interface Etapa {
    id: string;
    nome: string;
    status: 'aguardando' | 'processando' | 'concluido' | 'erro';
    tempoDecorrido?: number;
    tempoInicio?: number;
}

export default function Home() {
    const { gerarRelatorio, isLoading, error } = useRelatorioService();
    const [eventos, setEventos] = useState<RelatorioEvent[]>([]);
    const [relatorioFinal, setRelatorioFinal] = useState<string>('');
    const [erroCritico, setErroCritico] = useState<string>('');
    const [etapas, setEtapas] = useState<Etapa[]>([
        
    ]);

    // Timer para atualizar tempos decorridos
    useEffect(() => {
        if (!isLoading) return;

        const interval = setInterval(() => {
            setEtapas(prev => prev.map(etapa => {
                if (etapa.status === 'processando' && etapa.tempoInicio) {
                    const tempoDecorrido = Math.floor((Date.now() - etapa.tempoInicio) / 1000);
                    return { ...etapa, tempoDecorrido };
                }
                return etapa;
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, [isLoading]);

    const createWorkflowData = () => {
        const builder = new WorkflowBuilder();

    //     // Configurar documentos financeiros
    //     builder.setDocumentos({
            
    //         relatorio_financeiro_anual: "10831034617427640767",
    //         demonstracoes_contabeis: [
    //             "13333786561136215878",
    //   "7065879860948131635",
    //   "11529010421945660908",
    //   "691210388070956173"
    //         ]
    //     });

    //     // Configurar ponto de entrada
    //     builder.setPontoDeEntrada(['AnalistaFinanceiroNode', 'AnalistaContabilNode']);

    //     // Configurar nós
    //     builder
    //         .addNode('AnalistaFinanceiroNode')
    //         .setAgent('financial_analyst')
    //         .setModel('claude-3-7-sonnet@20250219')
    //         .setPrompt(FinancialAnalystPrompt)
    //         .setOutputKey('workflow_data.analise_financeira')
    //         .addEntrada('relatorio_financeiro', 'buscar_documento', 'doc.relatorio_financeiro_anual')
    //         .endNode();

    //     builder
    //         .addNode('AnalistaContabilNode')
    //         .setAgent('accounting_analyst')
    //         .setModel('claude-3-7-sonnet@20250219')
    //         .setPrompt(AccountingAnalystPrompt)
    //         .setOutputKey('workflow_data.analises_contabeis')
    //         .addEntrada('lista_documentos', 'id_documento', 'doc.demonstracoes_contabeis')
    //         .addEntrada('conteudo_documento', 'buscar_documento', '{id_documento}')
    //         .endNode();

    //     builder
    //         .addNode('ConsolidadorFinanceiroNode')
    //         .setAgent('financial_consolidator')
    //         .setModel('gpt-4.1')
    //         .setPrompt(FinancialConsolidatorPrompt)
    //         .setOutputKey('workflow_data.relatorio_consolidado')
    //         .addEntrada('analise_financeira', 'do_estado', 'workflow_data.analise_financeira')
    //         .addEntrada('analises_contabeis', 'do_estado', 'workflow_data.analises_contabeis')
    //         .endNode();

    //     builder
    //         .addNode('MetricasFinanceirasNode')
    //         .setAgent('financial_metrics')
    //         .setModel('gemini-2.5-pro')
    //         .setPrompt(FinancialMetricsPrompt)
    //         .setOutputKey('workflow_data.metricas_estruturadas')
    //         .addEntrada('analise_financeira', 'do_estado', 'workflow_data.analise_financeira')
    //         .addEntrada('analises_contabeis', 'do_estado', 'workflow_data.analises_contabeis')
    //         .addEntrada('relatorio_consolidado', 'do_estado', 'workflow_data.relatorio_consolidado')
    //         .endNode();

    //     builder
    //         .addNode('RecomendacoesNode')
    //         .setAgent('strategic_advisor')
    //         .setModel('claude-3-7-sonnet@20250219')
    //         .setPrompt(StrategicRecommendationsPrompt)
    //         .setOutputKey('workflow_data.recomendacoes_estrategicas')
    //         .addEntrada('relatorio_consolidado', 'do_estado', 'workflow_data.relatorio_consolidado')
    //         .addEntrada('metricas_financeiras', 'do_estado', 'workflow_data.metricas_estruturadas')
    //         .endNode();

    //     // Configurar arestas
    //     builder
    //         .addEdge('AnalistaFinanceiroNode', 'ConsolidadorFinanceiroNode')
    //         .addEdge('AnalistaContabilNode', 'ConsolidadorFinanceiroNode')
    //         .addEdge('ConsolidadorFinanceiroNode', 'MetricasFinanceirasNode')
    //         .addEdge('MetricasFinanceirasNode', 'RecomendacoesNode')
    //         .addEdge('RecomendacoesNode', 'END');

    //     // Configurar template de saída
    //     builder.setModificarSaida(
    //         'relatorio_financeiro_final',
    //         'RELATÓRIO FINANCEIRO CONSOLIDADO\n\n' +
    //         'ANÁLISE FINANCEIRA DETALHADA:\n{workflow_data.analise_financeira}\n\n' +
    //         'ANÁLISES CONTÁBEIS:\n{workflow_data.analises_contabeis}\n\n' +
    //         'RELATÓRIO CONSOLIDADO:\n{workflow_data.relatorio_consolidado}\n\n' +
    //         'MÉTRICAS FINANCEIRAS:\n{workflow_data.metricas_estruturadas}\n\n' +
    //         'RECOMENDAÇÕES ESTRATÉGICAS:\n{workflow_data.recomendacoes_estrategicas}'
    //     );

    //     return builder.toJSON();

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
            .addEntrada('conteudo_auditoria', 'buscar_documento', 'doc.auditoria_especial') // Deve referenciar o primeiro objeto da lista {auditoria_especial: "", defesas_do_caso: ""}
            .endNode();

        builder
            .addNode('DefenseNode')
            .setAgent('defense')
            .setModel('claude-3-7-sonnet@20250219')
            .setPrompt(DefensePrompt)
            .setOutputKey('workflow_data.analises_defesas')
            .addEntrada('lista_de_origem', 'id_da_defesa', 'doc.defesas_do_caso') // Deve referenciar o segundo objeto da lista  {auditoria_especial: "", defesas_do_caso: ""}
            .addEntrada('conteudo_defesa', 'buscar_documento', '{id_da_defesa}') // // Deve referencia 
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

        setEtapas([
           { id: 'START', nome: 'Inicialização do Sistema', status: 'aguardando' },
        { id: 'AuditorNode', nome: 'Auditor Fiscal', status: 'aguardando' },
        { id: 'DefenseNode', nome: 'Defesa', status: 'aguardando' },
        { id: 'RelatorNode', nome: 'Relator', status: 'aguardando' },
        { id: 'InfoExtractorNode', nome: 'Extrair Informações', status: 'aguardando' }]);

        return builder.toJSON();
    };

    const atualizarEtapa = (nodeId: string, status: Etapa['status']) => {
        setEtapas(prev => prev.map(etapa => {
            if (etapa.id === nodeId) {
                const updates: Partial<Etapa> = { status };
                
                if (status === 'processando') {
                    updates.tempoInicio = Date.now();
                    updates.tempoDecorrido = 0;
                } else if (status === 'concluido' && etapa.tempoInicio) {
                    updates.tempoDecorrido = Math.floor((Date.now() - etapa.tempoInicio) / 1000);
                }
                
                return { ...etapa, ...updates };
            }
            return etapa;
        }));
    };

    const handleGerarRelatorio = async () => {
        setEventos([]);
        setRelatorioFinal('');
        setErroCritico('');
        
        // Resetar etapas para estado inicial
        setEtapas(prev => prev.map(etapa => ({
            ...etapa,
            status: 'aguardando',
            tempoDecorrido: undefined,
            tempoInicio: undefined
        })));

        const workflowData = createWorkflowData();

        try {
            await gerarRelatorio(workflowData, (event) => {
                setEventos(prev => [...prev, event]);
                
                console.log('Evento recebido:', event);
                
                if (event.type === 'status') {
                    if (event.status === 'iniciado') {
                        atualizarEtapa(event.node, 'processando');
                    } else if (event.status === 'finalizado') {
                        atualizarEtapa(event.node, 'concluido');
                    }
                }
                
                if (event.type === 'resultado_final') {
                    setRelatorioFinal(event.payload.relatorio_final);
                }
                
                if (event.type === 'error') {
                    setErroCritico(event.message);
                    // Marcar etapa atual como erro
                    const etapaAtual = etapas.find(e => e.status === 'processando');
                    if (etapaAtual) {
                        atualizarEtapa(etapaAtual.id, 'erro');
                    }
                }
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
            setErroCritico(errorMessage);
            console.error('Erro ao gerar relatório:', err);
        }
    };

    // Calcular progresso
    const etapasConcluidas = etapas.filter(etapa => 
        etapa.status === 'concluido' || etapa.status === 'erro'
    ).length;
    let totalEtapas = etapas.length;
    if (totalEtapas === 0) totalEtapas = 1; // Evitar divisão por zero
    const progresso = Math.round((etapasConcluidas / totalEtapas) * 100);
    

    // Função para obter ícone da etapa
    const getEtapaIcon = (etapa: Etapa) => {
        switch (etapa.status) {
            case 'concluido':
                return '✅';
            case 'processando':
                return '🔄';
            case 'erro':
                return '❌';
            default:
                return '⏳';
        }
    };

    // Função para obter cor da etapa
    const getEtapaColor = (etapa: Etapa) => {
        switch (etapa.status) {
            case 'concluido':
                return 'text-green-600';
            case 'processando':
                return 'text-blue-600';
            case 'erro':
                return 'text-red-600';
            default:
                return 'text-gray-400';
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                        Gerando Relatório Financeiro
                    </h1>
                    
                    {/* Barra de Progresso */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                {etapasConcluidas}/{totalEtapas} etapas concluídas
                            </span>
                            <span className="text-lg font-bold text-blue-600">
                                {progresso}%
                            </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                            <div 
                                className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out"
                                style={{ width: `${progresso}%` }}
                            ></div>
                        </div>
                        
                        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            {isLoading ? 'Processando workflow...' : 'Pronto para iniciar'}
                        </div>
                    </div>

                    {/* Botão de Ação */}
                    <div className="mb-8">
                        <button 
                            onClick={handleGerarRelatorio} 
                            disabled={isLoading}
                            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                                isLoading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                            }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                    Processando Workflow...
                                </div>
                            ) : (
                                'Iniciar Geração do Relatório'
                            )}
                        </button>

                        {error && (
                            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                <strong>Erro de Conexão:</strong> {error}
                            </div>
                        )}
                    </div>

                    {/* Lista de Etapas */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                            Etapas do Processo:
                        </h2>
                        
                        <div className="space-y-3">
                            {etapas.map((etapa, index) => (
                                <div 
                                    key={etapa.id}
                                    className={`flex items-center p-4 rounded-lg border-2 transition-all duration-300 ${
                                        etapa.status === 'processando' 
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                            : etapa.status === 'concluido'
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                            : etapa.status === 'erro'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-700 border-2 border-current mr-4">
                                        <span className={`text-sm font-bold ${getEtapaColor(etapa)}`}>
                                            {index + 1}
                                        </span>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`font-medium ${getEtapaColor(etapa)}`}>
                                                {etapa.nome}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {getEtapaIcon(etapa)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-1">
                                            <span className={`text-sm ${
                                                etapa.status === 'processando' ? 'text-blue-600' :
                                                etapa.status === 'concluido' ? 'text-green-600' :
                                                etapa.status === 'erro' ? 'text-red-600' :
                                                'text-gray-400'
                                            }`}>
                                                {etapa.status === 'processando' && 'Processando...'}
                                                {etapa.status === 'concluido' && 'Concluído'}
                                                {etapa.status === 'erro' && 'Erro'}
                                                {etapa.status === 'aguardando' && 'Aguardando'}
                                            </span>
                                            
                                            {etapa.tempoDecorrido !== undefined && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {etapa.tempoDecorrido}s
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Área de Erro Crítico */}
                    {erroCritico && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">
                                ⚠️ Erro no Workflow
                            </h3>
                            <div className="bg-white p-3 rounded border">
                                <pre className="text-sm text-red-700 whitespace-pre-wrap">
                                    {erroCritico}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* Área do Relatório Final */}
                    {relatorioFinal && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                📊 Relatório Final Gerado
                            </h2>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                                    {relatorioFinal}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}