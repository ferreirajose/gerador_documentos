import { useState } from 'react';
import { useWorkFlow } from '@/context/WorkflowContext';
import { GerarDocCallbacks } from '@/types/nodes';
import WorkflowHttpGatewayV2 from '@/gateway/WorkflowHttpGatewayV2';
import FetchAdapter from '@/infra/FetchAdapter';
import { WorkflowBuilder } from '@/application/builders/WorkflowBuilder';
import { AuditorPrompt, DefensePrompt, RelatorPrompt, InfoExtractorPrompt } from '@/data/mock_prompt';
import { ExecuteProgress } from './common/ExecuteProgress';

const BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

export default function WorkflowExecution() {
  const {
    state,
    setExecuting,
    setResults,
    clearLogs,
    buildCompleteWorkflow,
    clearSelectedFile
  } = useWorkFlow();


  const [progressState, setProgressState] = useState({
    etapasConcluidas: 0,
    totalEtapas: 0,
    progresso: 0,
    isLoading: false,
    erroCritico: null as string | null,
    relatorioFinal: null as string | null,
  });


  const teste = () => {
    
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
    
            
            return builder.toJSON();
        };
  

  const executeWorkflow = async () => {
    if (state.nodes.length === 0) return; // @TODO descomentar essa linha

    setProgressState({
    etapasConcluidas: 0,
    totalEtapas: state.nodes.length + 1, // Total de nós no seu workflow @TODO SERA USADO A QUANTIDADE DE NOS state.nodes.length
    progresso: 0,
    isLoading: true,
    erroCritico: null,
    relatorioFinal: null,
  });


    setExecuting(true);
    setResults(null);
    clearLogs();

    try {
      // Construir workflow completo usando o método do context
      const workflowJson = buildCompleteWorkflow() //teste();

      // Configurar serviço
      // const httpClient = new AxiosAdapter();
      // const workFlowGateway = new WorkflowHttpGateway(httpClient, BASE_URL, AUTH_TOKEN);

      const httpClient = new FetchAdapter();
      const workFlowGateway = new WorkflowHttpGatewayV2(httpClient, BASE_URL, AUTH_TOKEN);

      const handleOnEvent: GerarDocCallbacks = {
        onInfo: (message) => {
          console.log('message:', message)
        },
        onNodeStatus: (node, status) => {
          
          console.log('node:', node)
          console.log('status:', status)
          if (status === 'finalizado') {
            setProgressState(prev => ({
              ...prev,
              etapasConcluidas: prev.etapasConcluidas + 1,
              progresso: Math.round(((prev.etapasConcluidas + 1) / prev.totalEtapas) * 100)
            }));
          }
        },
        onProgress: (nodes) => {
          console.log('nodes:', nodes)

        },
        onData: (data) => {
            console.log("data:", data);
            setProgressState( (prev) => ({
                ...prev,
                relatorioFinal: JSON.stringify(data)
            }));
        },
        onComplete: (result) => {
          console.log("result:", result);

          setProgressState(prev => ({
            ...prev,
            isLoading: false,
            progresso: 100
          }));
        },
        onError: (error) => {
          setProgressState(prev => ({
            ...prev,
            isLoading: false,
            erroCritico: error
          }));
        },
      };

      // Executar workflow
      await workFlowGateway.gerarRelatorio(workflowJson, handleOnEvent);


    } catch (error) {
      console.error('Erro ao executar workflow:', error);
      setExecuting(false);
      setResults({
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  const resetExecution = () => {
    setExecuting(false);
    setResults(null);
    clearLogs();
    clearSelectedFile();
  };

  const canExecute = state.nodes.length > 0 && !state.isExecuting;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Executar Workflow</h2>
          <p className="text-gray-600">Execute e monitore o processamento do seu workflow</p>
        </div>

        <div className="flex items-center space-x-3">
          {(state.executionLogs.length > 0 || state.selectedFile) && (
            <button
              onClick={resetExecution}
              data-testid="reset-execution-button"
              disabled={state.isExecuting}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <i className="ri-refresh-line mr-2"></i>
              Resetar
            </button>
          )}

          <button
            onClick={executeWorkflow}
            data-testid="execute-workflow-button"
            disabled={!canExecute}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap ${
              canExecute
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <i className={`${state.isExecuting ? 'ri-loader-line animate-spin' : 'ri-play-circle-line'}`}></i>
            <span data-testid="text-executing">
              {state.isExecuting ? 'Executando...' : 'Executar Workflow'}
            </span>
          </button>
        </div>
      </div>

      { state.isExecuting && (
        <ExecuteProgress 
          etapasConcluidas={progressState.etapasConcluidas}
          totalEtapas={progressState.totalEtapas}
          progresso={progressState.progresso}
          isLoading={progressState.isLoading}
          erroCritico={progressState.erroCritico}
          relatorioFinal={progressState.relatorioFinal}
        />
      )}

      {/* Workflow Output */}
      {buildCompleteWorkflow && state.nodes.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Workflow Gerado
            </h3>
          </div>
          <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(JSON.parse(buildCompleteWorkflow()), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}