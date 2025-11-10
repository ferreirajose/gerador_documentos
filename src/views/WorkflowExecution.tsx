import { useState } from 'react';
import WorkflowHttpGatewayV2 from '@/gateway/WorkflowHttpGatewayV2';
import FetchAdapter from '@/infra/FetchAdapter';
import { GerarDocCallbacks } from '@/types/node';
import WorkflowOutput from '@/components/common/WorkflowOutput';
import { WORFLOW_MOCK } from '@/mock/workflow-mock';
import { ExecuteProgress } from '@/components/common/ExecuteProgress';

const BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

interface NodeTimer {
  start: number;
  end?: number;
  duration?: number;
}

export default function WorkflowExecution() {
  const [executionState, setExecutionState] = useState<'idle' | 'executing' | 'completed' | 'error'>('idle');
  const [isWorkflowVisible, setIsWorkflowVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [nodeStatus, setNodeStatus] = useState<Record<string, string>>({});
  const [nodeTimers, setNodeTimers] = useState<Record<string, NodeTimer>>({});
  // @TODO VERIFICAR A NECESSIDADE DO completedNodes
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);

  // Função para calcular o progresso baseado nos nós concluídos
  const calculateProgress = (currentCompletedNodes: string[]) => {
    const totalNodes = WORFLOW_MOCK.grafo.nos.length;
    const completedCount = currentCompletedNodes.length;
    return Math.round((completedCount / totalNodes) * 100);
  };

  // Função para calcular a duração de um nó
  const calculateNodeDuration = (nodeName: string): number | null => {
    const timer = nodeTimers[nodeName];
    if (!timer || !timer.end) return null;
    return timer.end - timer.start;
  };

  const executeWorkflow = async () => {
    // Resetar estados
    setProgress(0);
    setNodeStatus({});
    setNodeTimers({});
    setCompletedNodes([]);
    setExecutionState('executing');

    try {
      const workflowJson = WORFLOW_MOCK;

      const httpClient = new FetchAdapter();
      const workFlowGateway = new WorkflowHttpGatewayV2(httpClient, BASE_URL, AUTH_TOKEN);

      const handleOnEvent: GerarDocCallbacks = {
        onInfo: (message) => {
          console.log('Info:', message);
        },
        
        onNodeStatus: (node, status) => {
         // console.log(`Node ${node}: ${status}`);
          
          const currentTime = Date.now();          
          // Atualizar status do nó
          setNodeStatus(prev => ({
            ...prev,
            [node]: status
          }));

          // Controlar timers
          if (status === 'started') {
            setNodeTimers(prev => ({
              ...prev,
              [node]: { start: currentTime }
            }));
          } else if (status === 'finished') {
            setNodeTimers(prev => {
              const endTime = currentTime;
              const startTime = prev[node]?.start || endTime;
              const duration = endTime - startTime;
              
              return {
                ...prev,
                [node]: { 
                  start: startTime, 
                  end: endTime,
                  duration: duration
                }
              };
            });

            setCompletedNodes(prev => {
              // Evitar duplicatas
              if (!prev.includes(node)) {
                const newCompletedNodes = [...prev, node];
                const newProgress = calculateProgress(newCompletedNodes);
                setProgress(newProgress);
                return newCompletedNodes;
              }
              return prev;
            });
          }
        },
        onData: (data) => {
          console.log("Data recebida:", data);
        },
        
        onComplete: (result) => {
          console.log("Processamento completo:", result);
          setExecutionState('completed');
          setProgress(100);
          
          //Garantir que todos os nós estejam marcados como completed
          setNodeStatus(prev => {
            const updatedStatus = { ...prev };
            WORFLOW_MOCK.grafo.nos.forEach(node => {
              if (updatedStatus[node.nome] !== 'finished') {
                updatedStatus[node.nome] = 'completed';
              }
            });
            return updatedStatus;
          });
        },
        
        onError: (error) => {
          console.error("Erro no workflow:", error);
          setExecutionState('error');
        },
      };

      await workFlowGateway.gerarRelatorio(workflowJson, handleOnEvent);

    } catch (error) {
      console.error('Erro ao executar workflow:', error);
      setExecutionState('error');
    }
  };

  const resetExecution = () => {
    console.log('resetExecution');
    setExecutionState('idle');
    setProgress(0);
    setNodeStatus({});
    setNodeTimers({});
    setCompletedNodes([]);
  };

  // Preparar steps para o ExecuteProgress - CORREÇÃO: Mapear status para UI
  const steps = WORFLOW_MOCK.grafo.nos.map((node, idx) => {
    const nodeName = node.nome;
    const rawStatus = nodeStatus[nodeName] || 'waiting';
    const duration = calculateNodeDuration(nodeName);
    
    // Mapear status do backend para status da UI
    const getUIStatus = (status: string): "waiting" | "processing" | "completed" | "error" => {
      switch (status) {
        case 'started': return 'processing';
        case 'finished': return 'completed';
        case 'completed': return 'completed';
        case 'error': return 'error';
        default: return 'waiting';
      }
    };
    
    return {
      id: idx,
      name: nodeName,
      status: getUIStatus(rawStatus),
      duration: duration
    };
  });

  // Determinar texto e estilo do botão baseado no estado
  const getButtonConfig = () => {
    switch (executionState) {
      case 'executing':
        return {
          text: 'Executando...',
          icon: 'ri-loader-4-line animate-spin',
          className: 'bg-blue-600 text-white hover:bg-blue-700',
          disabled: true
        };
      case 'completed':
        return {
          text: 'Executar Novamente',
          icon: 'ri-restart-line',
          className: 'bg-green-600 text-white hover:bg-green-700',
          disabled: false
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
          disabled: false
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Executar Workflow</h2>
          <p className="text-gray-600 dark:text-gray-400">Execute e monitore o processamento do seu workflow</p>
        </div>

        <div className="flex items-center space-x-3">
          {executionState !== 'idle' && (
            <button
              onClick={resetExecution}
              data-testid="reset-execution-button"
              disabled={executionState === 'executing'}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <i className="ri-close-line mr-2"></i>
              Limpar
            </button>
          )}

          <button
            onClick={executeWorkflow}
            data-testid="execute-workflow-button"
            disabled={buttonConfig.disabled}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap font-medium ${buttonConfig.className} ${
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

      {/* ExecuteProgress - Mostrar apenas durante execução ou quando há progresso */}
      {(executionState === 'executing' || executionState === 'completed' || progress > 0) && (
        <ExecuteProgress 
          progress={progress}
          title="Processando Workflow"
          steps={steps}
        />
      )}

      {/* Workflow Output */}
      <WorkflowOutput
        isWorkflowVisible={isWorkflowVisible}
        setIsWorkflowVisible={setIsWorkflowVisible}
      />        
    </div>
  );
}