import { useState } from 'react';
import { useWorkFlow } from '@/context/WorkflowContext';
import { GerarDocCallbacks } from '@/types/nodes';
import WorkflowHttpGatewayV2 from '@/gateway/WorkflowHttpGatewayV2';
import FetchAdapter from '@/infra/FetchAdapter';
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

  const [executionState, setExecutionState] = useState<'idle' | 'executing' | 'error'>('idle');
  const [nodeStatus, setNodeStatus] = useState<Record<string, string>>({});
  const [nodeTimers, setNodeTimers] = useState<Record<string, { start: number; end?: number }>>({}); 

  const executeWorkflow = async () => {
  if (state.nodes.length === 0) return;

  // Resetar status dos nós
  setNodeStatus({});

  setExecutionState('executing');
  setProgressState({
    etapasConcluidas: 0,
    totalEtapas: state.nodes.length, 
    progresso: 0,
    isLoading: true,
    erroCritico: null,
    relatorioFinal: '',
  });

  setExecuting(true);
  setResults(null);
  clearLogs();

  try {
    const workflowJson = buildCompleteWorkflow();

    const httpClient = new FetchAdapter();
    const workFlowGateway = new WorkflowHttpGatewayV2(httpClient, BASE_URL, AUTH_TOKEN);

    const handleOnEvent: GerarDocCallbacks = {
      onInfo: (message) => {
        console.log('message:', message);
      },
      onNodeStatus: (node, status) => {
        console.log('node:', node);
        console.log('status:', status);
        
        const currentTime = Date.now();
        
        // Atualizar o status do nó
        setNodeStatus(prev => ({
          ...prev,
          [node]: status
        }));

        // Controlar timers
        if (status === 'iniciado') {
          setNodeTimers(prev => ({
            ...prev,
            [node]: { start: currentTime }
          }));
        } else if (status === 'finalizado') {
          setNodeTimers(prev => ({
            ...prev,
            [node]: {
              ...prev[node],
              end: currentTime
            }
          }));
        }

        // Contar apenas as etapas que não são START para o progresso
        if (status === 'finalizado' && node !== 'START') {
          setProgressState(prev => ({
            ...prev,
            etapasConcluidas: prev.etapasConcluidas + 1,
            progresso: Math.round(((prev.etapasConcluidas + 1) / prev.totalEtapas) * 100)
          }));
        }
      },
      onProgress: (nodes) => {
        console.log('nodes:', nodes);
      },
      onData: (data) => {
        console.log("data:", data);
        setProgressState((prev) => ({
          ...prev,
        relatorioFinal: data.relatorio_final
        }));
      },
      onComplete: (result) => {
        console.log("result:", result);
        setExecutionState('idle');
        setProgressState(prev => ({
          ...prev,
          isLoading: false,
          progresso: 100
        }));
      },
      onError: (error) => {
        setExecutionState('error');
        setProgressState(prev => ({
          ...prev,
          isLoading: false,
          erroCritico: error
        }));
      },
    };

    await workFlowGateway.gerarRelatorio(workflowJson, handleOnEvent);

  } catch (error) {
    console.error('Erro ao executar workflow:', error);
    setExecutionState('error');
    setExecuting(false);
    setResults({
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};


   const resetExecution = () => {
    setExecutionState('idle');
    setExecuting(false);
    setResults(null);
    clearLogs();
    clearSelectedFile();
  };

  const canExecute = state.nodes.length > 0 && executionState !== 'executing';

  // Determinar texto e estilo do botão baseado no estado
  const getButtonConfig = () => {
    switch (executionState) {
      case 'executing':
        return {
          text: 'Executando...',
          icon: 'ri-loader-line animate-spin',
          className: 'bg-blue-600 text-white hover:bg-blue-700',
          disabled: true
        };
      case 'error':
        return {
          text: 'Tentar Novamente',
          icon: 'ri-refresh-line',
          className: 'bg-orange-600 text-white hover:bg-orange-700',
          disabled: false
        };
      default: // idle
        return {
          text: 'Executar Workflow',
          icon: 'ri-play-circle-line',
          className: 'bg-green-600 text-white hover:bg-green-700',
          disabled: !canExecute
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Executar Workflow</h2>
          <p className="text-gray-600">Execute e monitore o processamento do seu workflow</p>
        </div>

        <div className="flex items-center space-x-3">
          {(state.executionLogs.length > 0 || state.selectedFile || executionState === 'error') && (
            <button
              onClick={resetExecution}
              data-testid="reset-execution-button"
              disabled={executionState === 'executing'}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <i className="ri-close-line mr-2"></i>
              Limpar
            </button>
          )}

          <button
            onClick={executeWorkflow}
            data-testid="execute-workflow-button"
            disabled={buttonConfig.disabled}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap ${buttonConfig.className} ${
              buttonConfig.disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <i className={buttonConfig.icon}></i>
            <span data-testid="text-executing">
              {buttonConfig.text}
            </span>
          </button>
        </div>
      </div>

        <ExecuteProgress 
          etapas={state.nodes}
          nodeStatus={nodeStatus}
          nodeTimers={nodeTimers}
          etapasConcluidas={progressState.etapasConcluidas}
          totalEtapas={progressState.totalEtapas}
          progresso={progressState.progresso}
          isLoading={progressState.isLoading}
          erroCritico={progressState.erroCritico}
          relatorioFinal={progressState.relatorioFinal}
        />

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