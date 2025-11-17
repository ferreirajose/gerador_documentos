import { useState, useEffect } from 'react';
import { RiChat3Line, RiLoader4Line, RiPlayCircleLine, RiRefreshLine, RiRestartLine } from '@remixicon/react';
import WorkflowHttpGatewayV2 from '@/gateway/WorkflowHttpGatewayV2';
import FetchAdapter from '@/infra/FetchAdapter';
import { GerarDocCallbacks } from '@/types/node';
import { WORFLOW_INTER_PIADA, WORFLOW_MINUTA_INTERACAO_SEM_DOC, WORFLOW_MINUTA_INTERACAO_COM_DOC, WORFLOW_MOCK } from '@/mock/workflow-mock';

import { ExecuteProgress } from '@/components/common/ExecuteProgress';
import { useWorkflow } from '@/context/WorkflowContext';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import { WorkflowError } from '@/components/common/WorkflowError';
import { InteractionBot } from '@/components/common/InteractionBot';
import { EmptyState } from '@/components/common/EmptyState';

const BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

interface NodeTimer {
  start: number;
  end?: number;
  duration?: number;
}

interface ResultItem {
  value: string | object;
  metadata: {
    format: 'markdown' | 'json';
    source_nodes: string[];
    combined?: boolean;
    size_bytes?: number;
  };
}

interface WorkflowResult {
  [key: string]: ResultItem;
}

// Interface para o erro
interface WorkflowErrorData {
  type: string;
  message: string;
  node: string | null;
}

// Nova interface para interação
interface InteractionData {
  session_id: string;
  node: string;
  agent_message: string;
}

export default function WorkflowExecution() {
  const { state, resetWorkflow, getWorkflowJSON } = useWorkflow();
  const WORFLOW = JSON.parse(getWorkflowJSON());

  const [executionState, setExecutionState] = useState<'idle' | 'executing' | 'completed' | 'error' | 'awaiting_interaction'>('idle');
  const [progress, setProgress] = useState(0);
  const [workflowResults, setWorkflowResults] = useState<WorkflowResult>({});

  const [nodeStatus, setNodeStatus] = useState<Record<string, string>>({});
  const [nodeTimers, setNodeTimers] = useState<Record<string, NodeTimer>>({});
  const [completedNodes, setCompletedNodes] = useState<string[]>([]);

  const [workflowError, setWorkflowError] = useState<WorkflowErrorData | null>(null);

  // Novos estados para interação
  const [interactionData, setInteractionData] = useState<InteractionData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false); // Novo estado para controlar abertura do chat

  // Efeito para abrir o chat automaticamente quando houver interação
  useEffect(() => {
    if (executionState === 'awaiting_interaction' && interactionData) {
      setIsChatOpen(true);
    }
  }, [executionState, interactionData]);

  // Função para calcular o progresso baseado nos nós concluídos
  const calculateProgress = (currentCompletedNodes: string[]) => {
    const totalNodes = WORFLOW.grafo.nos.length;
    const completedCount = currentCompletedNodes.length;
    return Math.round((completedCount / totalNodes) * 100);
  };

  // Função para calcular a duração de um nó
  const calculateNodeDuration = (nodeName: string): number | null => {
    const timer = nodeTimers[nodeName];
    if (!timer || !timer.end) return null;
    return timer.end - timer.start;
  };

  // Função para obter os nomes das saídas esperadas do workflow
  const getExpectedOutputNames = (): string[] => {
    const outputNames: string[] = [];

    // Adicionar saídas combinadas
    if (WORFLOW.formato_resultado_final?.combinacoes) {
      WORFLOW.formato_resultado_final.combinacoes.forEach((combinacao: any) => {
        outputNames.push(combinacao.nome_da_saida);
      });
    }

    // Adicionar saídas individuais
    if (WORFLOW.formato_resultado_final?.saidas_individuais) {
      outputNames.push(...WORFLOW.formato_resultado_final.saidas_individuais);
    }

    return outputNames;
  };

  // Função para renderizar o conteúdo baseado no formato
  const renderContentByFormat = (resultKey: string, resultItem: ResultItem) => {
    const { value, metadata } = resultItem;

    if (metadata.format === 'markdown') {
      const content = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      return (
        <MarkdownRenderer
          content={content}
          className="min-h-[200px] max-h-[600px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-700"
          variant="document"
          filename={`${resultKey}.md`}
        />
      );
    } else if (metadata.format === 'json') {
      const jsonContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      return (
        <pre className="min-h-[200px] max-h-[600px] overflow-y-auto p-4 bg-gray-900 dark:bg-gray-800 text-gray-100 dark:text-gray-200 rounded border dark:border-gray-700 text-sm font-mono">
          <code>{jsonContent}</code>
        </pre>
      );
    }

    return (
      <pre className="min-h-[200px] max-h-[600px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-700 text-sm">
        <code>{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</code>
      </pre>
    );
  };

  // Nova função para continuar interação
  const continueInteraction = async (userMessage: string) => {
    console.log("🚀 continueInteraction CHAMADO! Mensagem:", userMessage);
    console.log("📋 SessionId:", sessionId);

    if (!sessionId) {
      console.error("❌ SessionId não definido!");
      return;
    }

    try {
      const httpClient = new FetchAdapter();
      const workFlowGateway = new WorkflowHttpGatewayV2(httpClient, BASE_URL, AUTH_TOKEN);

      // Mudar estado para executando enquanto processa a resposta
      setExecutionState('executing');

      console.log("🔄 Chamando continuarInteracao no gateway...");

      await workFlowGateway.continuarInteracao(
        sessionId,
        userMessage,
        createInteractionCallbacks()
      );

      console.log("✅ continuarInteracao concluído");

    } catch (error) {
      console.error('❌ Erro ao continuar interação:', error);
      const errorData: WorkflowErrorData = {
        type: 'interaction_error',
        message: error instanceof Error ? error.message : 'Erro desconhecido na interação',
        node: null
      };
      setWorkflowError(errorData);
      setExecutionState('error');
    }
  };

  // Criar callbacks para interação
  const createInteractionCallbacks = (): GerarDocCallbacks => {
    return {
      onInfo: (message) => {
        console.log('Info (interação):', message);
      },

      onNodeStatus: (node, status) => {
        const currentTime = Date.now();
        setNodeStatus(prev => ({
          ...prev,
          [node]: status
        }));

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
        console.log("Data recebida (interação):", data);
        if (data) {
          setWorkflowResults(data);
        }
      },

      onComplete: (result) => {
        console.log("Processamento completo (interação):", result);
        setExecutionState('completed');
        setProgress(100);

        setNodeStatus(prev => {
          const updatedStatus = { ...prev };
          WORFLOW.grafo.nos.forEach((node: any) => {
            if (updatedStatus[node.nome] !== 'finished') {
              updatedStatus[node.nome] = 'completed';
            }
          });
          return updatedStatus;
        });
      },

      onError: (error) => {
        console.error("Erro no workflow (interação):", error);

        let errorData: WorkflowErrorData;

        if (typeof error === 'string') {
          errorData = {
            type: 'error',
            message: error,
            node: null
          };
        } else if (error && typeof error === 'object') {
          errorData = {
            type: error.type || 'error',
            message: error.message || 'Erro desconhecido',
            node: error.node || null
          };
        } else {
          errorData = {
            type: 'error',
            message: 'Ocorreu um erro durante a execução do workflow',
            node: null
          };
        }

        setWorkflowError(errorData);
        setExecutionState('error');
      },

      // Novo callback para interação
      onInteraction: (data) => {
        console.log("Interação necessária:", data);
        setInteractionData(data);
        setSessionId(data.session_id);
        setExecutionState('awaiting_interaction');
        setIsChatOpen(true); // Garantir que o chat abra
      }
    };
  };

  const executeWorkflow = async () => {
    if (state.nodes.length === 0) return null;
    // Resetar estados
    setProgress(0);
    setNodeStatus({});
    setNodeTimers({});
    setCompletedNodes([]);
    setWorkflowResults({});
    setWorkflowError(null);
    setInteractionData(null);
    setSessionId(null);
    setIsChatOpen(false);
    setExecutionState('executing');

    try {
      const workflowJson = WORFLOW;

      const httpClient = new FetchAdapter();
      const workFlowGateway = new WorkflowHttpGatewayV2(httpClient, BASE_URL, AUTH_TOKEN);

      const handleOnEvent: GerarDocCallbacks = {
        onInfo: (message) => {
          console.log('Info:', message);
        },

        onNodeStatus: (node, status) => {
          const currentTime = Date.now();
          setNodeStatus(prev => ({
            ...prev,
            [node]: status
          }));

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
          if (data) {
            setWorkflowResults(data);
          }
        },

        onComplete: (result) => {
          console.log("Processamento completo:", result);
          // Só muda para completed se não estiver aguardando interação
          setExecutionState(prev => prev === 'awaiting_interaction' ? 'awaiting_interaction' : 'completed');
          setProgress(100);

          setNodeStatus(prev => {
            const updatedStatus = { ...prev };
            WORFLOW.grafo.nos.forEach((node: any) => {
              if (updatedStatus[node.nome] !== 'finished') {
                updatedStatus[node.nome] = 'completed';
              }
            });
            return updatedStatus;
          });
        },

        onError: (error) => {
          console.error("Erro no workflow:", error);

          let errorData: WorkflowErrorData;

          if (typeof error === 'string') {
            errorData = {
              type: 'error',
              message: error,
              node: null
            };
          } else if (error && typeof error === 'object') {
            errorData = {
              type: error.type || 'error',
              message: error.message || 'Erro desconhecido',
              node: error.node || null
            };
          } else {
            errorData = {
              type: 'error',
              message: 'Ocorreu um erro durante a execução do workflow',
              node: null
            };
          }

          setWorkflowError(errorData);
          setExecutionState('error');
        },

        // Novo callback para interação
        onInteraction: (data) => {
          console.log("Interação necessária:", data);
          setInteractionData(data);
          setSessionId(data.session_id);
          setExecutionState('awaiting_interaction');
          setIsChatOpen(true);
        }
      };

      await workFlowGateway.gerarRelatorio(workflowJson, handleOnEvent);

    } catch (error) {
      console.error('Erro ao executar workflow:', error);

      const errorData: WorkflowErrorData = {
        type: 'execution_error',
        message: error instanceof Error ? error.message : 'Erro desconhecido na execução',
        node: null
      };

      setWorkflowError(errorData);
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
    setWorkflowResults({});
    setWorkflowError(null);
    setInteractionData(null);
    setSessionId(null);
    setIsChatOpen(false); // Fechar chat ao resetar
    resetWorkflow();
  };

  // Preparar steps para o ExecuteProgress
  const steps = WORFLOW.grafo.nos.map((node: any, idx: number) => {
    const nodeName = node.nome;
    const rawStatus = nodeStatus[nodeName] || 'waiting';
    const duration = calculateNodeDuration(nodeName);

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

  const canExecute = state.nodes.length > 0 && executionState !== 'executing';

  // Determinar texto e estilo do botão baseado no estado
  const getButtonConfig = () => {
    switch (executionState) {
      case 'executing':
        return {
          text: 'Executando...',
          icon: RiLoader4Line,
          className: 'bg-blue-600 text-white hover:bg-blue-700',
          disabled: true
        };
      case 'awaiting_interaction':
        return {
          text: 'Aguardando Interação...',
          icon: RiChat3Line,
          className: 'bg-purple-600 text-white hover:bg-purple-700',
          disabled: true
        };
      case 'completed':
        return {
          text: 'Executar Novamente',
          icon: RiRestartLine,
          className: 'bg-green-600 text-white hover:bg-green-700',
          disabled: false
        };
      case 'error':
        return {
          text: 'Tentar Novamente',
          icon: RiRefreshLine,
          className: 'bg-red-600 text-white hover:bg-red-700',
          disabled: false
        };
      default: // idle
        return {
          text: 'Executar Workflow',
          icon: RiPlayCircleLine,
          className: 'bg-green-600 text-white hover:bg-green-700',
          disabled: !canExecute //false
        };
    }
  };

  const buttonConfig = getButtonConfig();
  const expectedOutputs = getExpectedOutputNames();

  const hasInteracaoUsuario = WORFLOW.grafo.nos.some(node =>
    node.interacao_com_usuario && Object.keys(node.interacao_com_usuario).length > 0);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Executar Workflow</h2>
          <p className="text-gray-600 dark:text-gray-400">Execute e monitore o processamento do seu workflow</p>
        </div>

        <div className="flex items-center space-x-3">
            <button
              onClick={resetExecution}
              data-testid="reset-execution-button"
              disabled={executionState === 'executing'}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <i className="ri-close-line mr-2"></i>
              Limpar
            </button>
          

          <button
            onClick={executeWorkflow}
            data-testid="execute-workflow-button"
            disabled={buttonConfig.disabled}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap font-medium ${buttonConfig.className} ${buttonConfig.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {buttonConfig.icon && <buttonConfig.icon className={executionState === 'executing' ? 'animate-spin' : ''} />}
            <span data-testid="text-executing">
              {buttonConfig.text}
            </span>
          </button>
        </div>
      </div>

      {/* Exibir erro se houver */}
      {workflowError && (
        <WorkflowError
          error={workflowError}
          onRetry={executionState === 'error' ? executeWorkflow : undefined}
        />
      )}

      {/* ExecuteProgress - Mostrar apenas durante execução ou quando há progresso */}
      {(executionState === 'executing' || executionState === 'completed' || progress > 0) && (
        <ExecuteProgress
          progress={progress}
          title="Processando Workflow"
          steps={steps}
        />
      )}

      {/* Resultados do Workflow */}
      {Object.keys(workflowResults).length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Resultados do Processamento</h3>

          {expectedOutputs.map((outputName) => {
            const resultItem = workflowResults[outputName];
            if (!resultItem) return null;

            return (
              <div key={outputName} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {outputName.replace(/_/g, ' ')}
                  </h4>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    {resultItem.metadata.format.toUpperCase()}
                  </span>
                </div>
                {renderContentByFormat(outputName, resultItem)}
              </div>
            );
          })}

          {/* Renderizar quaisquer resultados adicionais que não estejam nas saídas esperadas */}
          {Object.entries(workflowResults)
            .filter(([key]) => !expectedOutputs.includes(key))
            .map(([key, resultItem]) => (
              <div key={key} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {key.replace(/_/g, ' ')}
                  </h4>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full">
                    {resultItem.metadata.format.toUpperCase()}
                  </span>
                </div>
                {renderContentByFormat(key, resultItem)}
              </div>
            ))
          }
        </div>
      )}

      { WORFLOW.grafo.nos.length === 0 && (
        <EmptyState  />
      )}

      {/* InteractionBot com suporte para interação de workflow */}
      {hasInteracaoUsuario && (
        <InteractionBot
          onSendMessage={continueInteraction} 
          interactionContext={interactionData}
          isWorkflowInteraction={executionState === 'awaiting_interaction'}
          isOpen={isChatOpen}
          setIsOpen={setIsChatOpen}
          autoOpen={executionState === 'awaiting_interaction'}
        />
      )}

    </div>
  );
}