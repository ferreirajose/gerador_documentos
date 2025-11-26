import { useState, useEffect } from 'react';
import { RiChat3Line, RiLoader4Line, RiPlayCircleLine, RiRefreshLine, RiRestartLine, RiSave3Line, RiFolderOpenLine } from '@remixicon/react';
import WorkflowHttpGatewayV2 from '@/gateway/WorkflowHttpGatewayV2';
import FetchAdapter from '@/infra/FetchAdapter';
import { GerarDocCallbacks } from '@/types/node';

import { ExecuteProgress } from '@/components/common/ExecuteProgress';
import { useWorkflow } from '@/context/WorkflowContext';
import MarkdownRenderer from '@/components/common/MarkdownRenderer';
import { WorkflowError } from '@/components/common/WorkflowError';
import { InteractionBot } from '@/components/common/InteractionBot';
import { EmptyState } from '@/components/common/EmptyState';
import { FileUploadDuringExecution } from '@/components/common/FileUploadDuringExecution';
import SaveWorkflowModal from '@/components/modals/SaveWorkflowModal';
import LoadWorkflowModal from '@/components/modals/LoadWorkflowModal';

const BASE_URL = import.meta.env.VITE_API_URL;
const BASE_URL_DOC_PARSER = import.meta.env.VITE_API_URL_MINUTA;
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

// Interface para uploads necessários
interface UploadNeeded {
  nodeNome: string;
  variavelPrompt: string;
  quantidadeArquivos: "zero" | "um" | "varios";
}

interface WorkflowExecutionProps {
  onNavigationLock?: (locked: boolean) => void;
}

export default function WorkflowExecution({ onNavigationLock }: WorkflowExecutionProps) {
  const { state, resetWorkflow, getWorkflowJSON, loadWorkflow, setChatOpen, clearChatMessages } = useWorkflow();
  const WORFLOW = JSON.parse(getWorkflowJSON());


  const [executionState, setExecutionState] = useState<'idle' | 'executing' | 'completed' | 'error' | 'awaiting_interaction' | 'awaiting_uploads'>('idle');
  const [progress, setProgress] = useState(0);
  const [workflowResults, setWorkflowResults] = useState<WorkflowResult>({});

  const [nodeStatus, setNodeStatus] = useState<Record<string, string>>({});
  const [nodeTimers, setNodeTimers] = useState<Record<string, NodeTimer>>({});
  const [_, setCompletedNodes] = useState<string[]>([]);

  const [workflowError, setWorkflowError] = useState<WorkflowErrorData | null>(null);

  // Novos estados para interação
  const [interactionData, setInteractionData] = useState<InteractionData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Estados para uploads durante execução
  const [uploadsNeeded, setUploadsNeeded] = useState<UploadNeeded[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, string[]>>({});

  // Estados para modais de salvar/carregar
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

  // Usar estado global do chat
  const isChatOpen = state.chat.isChatOpen;

  // Efeito para controlar o bloqueio da navegação
  useEffect(() => {
    if (onNavigationLock) {
      // Bloqueia a navegação quando estiver executando, aguardando interação ou aguardando uploads
      const shouldLock = executionState === 'executing' || executionState === 'awaiting_interaction' || executionState === 'awaiting_uploads';
      onNavigationLock(shouldLock);
    }

    // Cleanup: desbloqueia a navegação quando o componente desmontar
    return () => {
      if (onNavigationLock) {
        onNavigationLock(false);
      }
    };
  }, [executionState, onNavigationLock]);

  // Função para calcular o progresso baseado nos nós concluídos
  const calculateProgress = (currentCompletedNodes: string[]) => {
    const totalNodes = WORFLOW.grafo.nos.length;
    const completedCount = currentCompletedNodes.length;
    return Math.round((completedCount / totalNodes) * 100);
  };

  /**
   * Detecta quais uploads são necessários antes da execução do workflow
   * Analisa todos os nós e suas entradas para identificar uploads durante execução
   * @param workflowJson JSON do workflow a ser analisado
   * @returns Array de uploads necessários com informações sobre cada um
   */
  const detectUploadsNeeded = (workflowJson: any): UploadNeeded[] => {
    const uploads: UploadNeeded[] = [];

    // Percorrer todos os nós do workflow
    workflowJson.grafo?.nos?.forEach((node: any) => {
      // Verificar se o nó tem entradas
      node.entradas?.forEach((entrada: any) => {
        // Se a origem for documento_upload_execucao, adicionar à lista
        if (entrada.origem === "documento_upload_execucao") {
          uploads.push({
            nodeNome: node.nome,
            variavelPrompt: entrada.variavel_prompt,
            quantidadeArquivos: entrada.quantidade_arquivos || "um"
          });
        }
      });
    });

    console.log(`Detectados ${uploads.length} upload(s) necessário(s):`, uploads);
    return uploads;
  };

  /**
   * Modifica o workflow JSON substituindo entradas de upload por documentos anexados
   * Transforma entradas com origem "documento_upload_execucao" para "documento_anexado"
   * usando as chaves dos documentos que foram enviados
   * @param workflow JSON do workflow original
   * @param uploads Mapa de uploads realizados {nodeNome__variavelPrompt: [document_keys]}
   * @returns Workflow modificado com documentos anexados
   */
  const modifyWorkflowWithUploads = (workflow: any, uploads: Record<string, string[]>): any => {
    const modified = JSON.parse(JSON.stringify(workflow)); // Deep clone

    // Mapa para agrupar documentos por chave (nodeNome + variavelPrompt)
    const documentGroups = new Map<string, { chave: string; descricao: string; uuids: string[] }>();

    modified.grafo?.nos?.forEach((node: any) => {
      node.entradas?.forEach((entrada: any) => {
        if (entrada.origem === "documento_upload_execucao") {
          const key = `${node.nome}__${entrada.variavel_prompt}`;
          const documentKeys = uploads[key] || [];

          console.log(`Transformando entrada ${key}:`, documentKeys);

          // Para múltiplos arquivos, criar um grupo
          if (documentKeys.length > 1) {
            const groupKey = `${node.nome}_${entrada.variavel_prompt}`;
            documentGroups.set(groupKey, {
              chave: groupKey,
              descricao: `Documentos para ${node.nome} - ${entrada.variavel_prompt}`,
              uuids: documentKeys
            });

            // Transformar em documento_anexado apontando para o grupo
            entrada.origem = "documento_anexado";
            entrada.chave_documento_origem = groupKey;
          } 
          // Para único arquivo, manter como uuid_unico
          else if (documentKeys.length === 1) {
            const singleKey = documentKeys[0];
            documentGroups.set(singleKey, {
              chave: singleKey,
              descricao: `Documento enviado: ${singleKey}`,
              uuids: [singleKey]
            });

            entrada.origem = "documento_anexado";
            entrada.chave_documento_origem = singleKey;
          }

          // Remover campo de quantidade de arquivos
          delete entrada.quantidade_arquivos;
        }
      });
    });

    // Reconstruir documentos_anexados com a estrutura correta
    modified.documentos_anexados = [];

    documentGroups.forEach((documentGroup, key) => {
      if (documentGroup.uuids.length === 1) {
        // Documento único - usar uuid_unico
        modified.documentos_anexados.push({
          chave: documentGroup.chave,
          descricao: documentGroup.descricao,
          uuid_unico: documentGroup.uuids[0]
        });
      } else {
        // Múltiplos documentos - usar uuids_lista
        modified.documentos_anexados.push({
          chave: documentGroup.chave,
          descricao: documentGroup.descricao,
          uuids_lista: documentGroup.uuids
        });
      }
    });

    console.log("Workflow modificado com uploads:", modified);
    console.log("Documentos anexados:", modified.documentos_anexados);
    return modified;
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

    // Bloquear navegação durante a interação
    if (onNavigationLock) {
      onNavigationLock(true);
    }

    if (!sessionId) {
      console.error("❌ SessionId não definido!");
      return;
    }

    try {
      const httpClient = new FetchAdapter();
      const workFlowGateway = new WorkflowHttpGatewayV2(httpClient, BASE_URL, AUTH_TOKEN);

      // Mudar estado para executando enquanto processa a resposta
      setExecutionState('executing');
      
      // Garantir que o chat esteja aberto durante a interação
      setChatOpen(true);

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

      onError: (error: any) => {
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
      }
    };
  };

  /**
   * Inicia a execução do workflow
   * Detecta uploads necessários e exibe UI de upload ou prossegue diretamente
   */
  const executeWorkflow = async () => {
    if (state.nodes.length === 0) return null;

    // Bloquear navegação
    if (onNavigationLock) {
      onNavigationLock(true);
    }

    // Resetar estados
    setProgress(0);
    setNodeStatus({});
    setNodeTimers({});
    setCompletedNodes([]);
    setWorkflowResults({});
    setWorkflowError(null);
    setInteractionData(null);
    setSessionId(null);
    setUploadedDocuments({});

    // Detectar uploads necessários
    const uploads = detectUploadsNeeded(WORFLOW);

    if (uploads.length > 0) {
      console.log("Uploads necessários detectados. Aguardando upload de arquivos...");
      setUploadsNeeded(uploads);
      setExecutionState('awaiting_uploads');
      return; // Não executar ainda
    }

    // Se não houver uploads, executar diretamente
    console.log("Nenhum upload necessário. Executando workflow...");
    proceedWithExecution();
  };

  /**
   * Prossegue com a execução do workflow após uploads (se houver)
   * Contém a lógica principal de execução do workflow
   */
  const proceedWithExecution = async () => {
    setExecutionState('executing');

    try {
      // Modificar workflow se houver uploads
      let workflowJson = WORFLOW;
      if (Object.keys(uploadedDocuments).length > 0) {
        workflowJson = modifyWorkflowWithUploads(WORFLOW, uploadedDocuments);
      }

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
          if (executionState !== 'awaiting_interaction') {
            setExecutionState('completed');
          }
          setProgress(100);

          // Se não há interação com usuário no workflow, podemos fechar o chat
          if (!hasInteracaoUsuario) {
            setChatOpen(false);
          }

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

        onError: (error: any) => {
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
        }
      };

      console.log("WORKFLOW JSON", workflowJson);

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
    console.log('Resetando execução e limpando estado do chat');

    // Desbloquear navegação
    if (onNavigationLock) {
      onNavigationLock(false);
    }

    // Resetar todos os estados locais
    setExecutionState('idle');
    setProgress(0);
    setNodeStatus({});
    setNodeTimers({});
    setCompletedNodes([]);
    setWorkflowResults({});
    setWorkflowError(null);
    setInteractionData(null);
    setSessionId(null);

    // Limpar estado do chat global
    setChatOpen(false);
    clearChatMessages();

    // Resetar workflow
    resetWorkflow();
  };

  // Handlers para salvar e carregar workflow
  const handleOpenSaveModal = () => {
    setIsSaveModalOpen(true);
  };

  const handleCloseSaveModal = () => {
    setIsSaveModalOpen(false);
  };

  const handleOpenLoadModal = () => {
    setIsLoadModalOpen(true);
  };

  const handleCloseLoadModal = () => {
    setIsLoadModalOpen(false);
  };

  const handleLoadWorkflow = (workflowData: any) => {
    try {
      loadWorkflow(workflowData);
      console.log('✅ Workflow carregado com sucesso!');

      // Resetar execução após carregar
      setExecutionState('idle');
      setProgress(0);
      setNodeStatus({});
      setNodeTimers({});
      setCompletedNodes([]);
      setWorkflowResults({});
      setWorkflowError(null);
      setInteractionData(null);
      setSessionId(null);
      setChatOpen(false);
      clearChatMessages();
    } catch (error) {
      console.error('❌ Erro ao carregar workflow:', error);
      alert(`Erro ao carregar workflow: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
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

  const hasInteracaoUsuario = WORFLOW.grafo.nos.some((node: any) =>
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
          {/* Botão Carregar Workflow */}
          <button
            onClick={handleOpenLoadModal}
            disabled={executionState === 'executing'}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 flex items-center space-x-2"
            title="Carregar workflow de arquivo"
          >
            <RiFolderOpenLine className="w-4 h-4" />
            <span>Carregar</span>
          </button>

          {/* Botão Salvar Workflow */}
          <button
            onClick={handleOpenSaveModal}
            disabled={executionState === 'executing' || state.nodes.length === 0}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 flex items-center space-x-2"
            title="Salvar workflow em arquivo"
          >
            <RiSave3Line className="w-4 h-4" />
            <span>Salvar</span>
          </button>

          {/* Botão Limpar */}
          <button
            onClick={resetExecution}
            data-testid="reset-execution-button"
            disabled={executionState === 'executing'}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <i className="ri-close-line mr-2"></i>
            Limpar
          </button>

          {/* Botão Executar */}
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

      {/* UI de Upload Pré-Execução */}
      {executionState === 'awaiting_uploads' && uploadsNeeded.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <RiPlayCircleLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Uploads Necessários
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Este workflow requer que você faça upload de {uploadsNeeded.length} arquivo(s) antes da execução.
              Por favor, envie os arquivos necessários abaixo.
            </p>
          </div>

          <div className="space-y-4">
            {uploadsNeeded.map((upload, index) => {
              const key = `${upload.nodeNome}__${upload.variavelPrompt}`;
              const uploadedKeys = uploadedDocuments[key] || [];

              return (
                <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Upload {index + 1} de {uploadsNeeded.length}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Nó: <span className="font-mono font-semibold">{upload.nodeNome}</span>
                    </p>
                  </div>

                  <FileUploadDuringExecution
                    quantidadeArquivos={upload.quantidadeArquivos}
                    variavelPrompt={upload.variavelPrompt}
                    onFilesUploaded={(keys) => {
                      console.log(`Upload completo para ${key}:`, keys);
                      setUploadedDocuments(prev => ({
                        ...prev,
                        [key]: keys
                      }));
                    }}
                    uploadFile={async (file) => {
                      const httpClient = new FetchAdapter();
                      const gateway = new WorkflowHttpGatewayV2(httpClient, BASE_URL_DOC_PARSER, AUTH_TOKEN);
                      
                      try {
                        // Chama uploadAndProcess que retorna ResponseData
                        const response = await gateway.uploadAndProcess(file);
                        
                        // Verifica se a resposta foi bem-sucedida e tem dados
                        if (response.success && response.data) {
                          // Retorna o uuid_documento que será usado como documentKey
                          return response.data.uuid_documento;
                        } else {
                          throw new Error(response.message || 'Erro desconhecido no upload');
                        }
                      } catch (error) {
                        console.error('Erro no upload do arquivo:', error);
                        throw error;
                      }
                    }}
                  />

                  {uploadedKeys.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                      <i className="ri-checkbox-circle-line"></i>
                      <span>{uploadedKeys.length} arquivo(s) pronto(s)</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-center">
            <button
              onClick={() => {
                // Cancelar e voltar
                setExecutionState('idle');
                setUploadsNeeded([]);
                setUploadedDocuments({});
                if (onNavigationLock) {
                  onNavigationLock(false);
                }
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={() => {
                // Verificar se todos uploads foram feitos
                const allUploaded = uploadsNeeded.every(upload => {
                  const key = `${upload.nodeNome}__${upload.variavelPrompt}`;
                  const keys = uploadedDocuments[key];

                  // Se quantidade for "zero", não precisa de uploads
                  if (upload.quantidadeArquivos === "zero") return true;

                  // Caso contrário, verificar se há pelo menos um documento
                  return keys && keys.length > 0;
                });

                if (allUploaded) {
                  console.log("Todos uploads completos. Prosseguindo com execução...");
                  proceedWithExecution();
                } else {
                  alert("Por favor, faça upload de todos os arquivos necessários antes de continuar.");
                }
              }}
              disabled={!uploadsNeeded.every(upload => {
                const key = `${upload.nodeNome}__${upload.variavelPrompt}`;
                const keys = uploadedDocuments[key];
                return upload.quantidadeArquivos === "zero" || (keys && keys.length > 0);
              })}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <RiPlayCircleLine className="w-5 h-5" />
              Continuar com Execução
            </button>
          </div>
        </div>
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

      {/* Modais de Salvar e Carregar Workflow */}
      <SaveWorkflowModal
        isOpen={isSaveModalOpen}
        onClose={handleCloseSaveModal}
        workflowData={JSON.parse(getWorkflowJSON())}
      />

      <LoadWorkflowModal
        isOpen={isLoadModalOpen}
        onClose={handleCloseLoadModal}
        onLoad={handleLoadWorkflow}
      />

      {/* InteractionBot com suporte para interação de workflow */}
      {hasInteracaoUsuario && (
        <InteractionBot
          onSendMessage={continueInteraction}
          interactionContext={interactionData}
          isWorkflowInteraction={executionState === 'awaiting_interaction'}
          isOpen={isChatOpen}
          setIsOpen={setChatOpen}
          autoOpen={executionState === 'awaiting_interaction'}
        />
      )}

    </div>
  );
}