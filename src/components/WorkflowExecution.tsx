
import { useState } from 'react';

interface Node {
  id: string;
  name: string;
  type: 'entry' | 'process' | 'end';
  llmModel?: string;
  prompt?: string;
  createdAt: Date;
}

interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  createdAt: Date;
}

interface ExecutionLog {
  id: string;
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  output?: string;
  error?: string;
  streamingMessages: string[];
  currentStep?: string;
}

interface WorkflowExecutionProps {
  nodes: Node[];
  connections: Connection[];
}

export default function WorkflowExecution({ nodes, connections }: WorkflowExecutionProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [currentExecutingNode, setCurrentExecutingNode] = useState<string | null>(null);

  const getEntryNodes = () => {
    return nodes.filter(node => node.type === 'entry');
  };

  const getNodeConnections = (nodeId: string) => {
    return connections.filter(conn => conn.fromNodeId === nodeId);
  };

  const buildExecutionOrder = () => {
    const visited = new Set<string>();
    const order: string[] = [];
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // Primeiro visita as dependências
      const incomingConnections = connections.filter(conn => conn.toNodeId === nodeId);
      incomingConnections.forEach(conn => visit(conn.fromNodeId));
      
      order.push(nodeId);
    };
    
    // Começa pelos nós de entrada
    getEntryNodes().forEach(node => visit(node.id));
    
    // Visita nós restantes
    nodes.forEach(node => visit(node.id));
    
    return order;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const simulateNodeExecution = async (nodeId: string): Promise<void> => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    setCurrentExecutingNode(nodeId);

    // Atualiza status para "executando"
    setExecutionLogs(prev => prev.map(log => 
      log.nodeId === nodeId 
        ? { 
            ...log, 
            status: 'running', 
            startTime: new Date(),
            progress: 0,
            streamingMessages: [],
            currentStep: 'Iniciando processamento...'
          }
        : log
    ));

    // Simula etapas de processamento com streaming
    const steps = getProcessingSteps(node);
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const progress = Math.round(((i + 1) / steps.length) * 100);
      
      // Atualiza o passo atual
      setExecutionLogs(prev => prev.map(log => 
        log.nodeId === nodeId 
          ? { 
              ...log, 
              currentStep: step.message,
              progress: Math.min(progress - 10, 90) // Deixa 10% para finalização
            }
          : log
      ));

      // Simula tempo de processamento da etapa
      await new Promise(resolve => setTimeout(resolve, step.duration));

      // Adiciona mensagem de streaming
      setExecutionLogs(prev => prev.map(log => 
        log.nodeId === nodeId 
          ? { 
              ...log, 
              streamingMessages: [...log.streamingMessages, `✓ ${step.message}`],
              progress: progress - 5
            }
          : log
      ));

      // Pequena pausa entre etapas
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Finalização
    setExecutionLogs(prev => prev.map(log => 
      log.nodeId === nodeId 
        ? { 
            ...log, 
            currentStep: 'Finalizando processamento...',
            progress: 95
          }
        : log
    ));

    await new Promise(resolve => setTimeout(resolve, 500));

    // Simula resultado (90% sucesso, 10% erro)
    const success = Math.random() > 0.1;
    
    if (success) {
      const mockOutput = `Processamento do nó "${node.name}" concluído com sucesso. Dados processados e enviados para próximos nós.`;
      
      setExecutionLogs(prev => prev.map(log => 
        log.nodeId === nodeId 
          ? { 
              ...log, 
              status: 'completed', 
              endTime: new Date(),
              output: mockOutput,
              progress: 100,
              currentStep: 'Concluído',
              streamingMessages: [...log.streamingMessages, '✓ Processamento finalizado com sucesso']
            }
          : log
      ));
    } else {
      const mockError = `Erro no processamento do nó "${node.name}": Falha na conexão com o modelo LLM.`;
      
      setExecutionLogs(prev => prev.map(log => 
        log.nodeId === nodeId 
          ? { 
              ...log, 
              status: 'error', 
              endTime: new Date(),
              error: mockError,
              progress: 100,
              currentStep: 'Erro no processamento',
              streamingMessages: [...log.streamingMessages, '✗ Erro durante o processamento']
            }
          : log
      ));
    }

    setCurrentExecutingNode(null);
  };

  const getProcessingSteps = (node: Node) => {
    const baseSteps = [
      { message: 'Inicializando modelo LLM...', duration: 800 },
      { message: 'Carregando configurações...', duration: 600 },
    ];

    switch (node.type) {
      case 'entry':
        return [
          ...baseSteps,
          { message: 'Processando arquivos de entrada...', duration: 1200 },
          { message: 'Extraindo conteúdo dos documentos...', duration: 1000 },
          { message: 'Aplicando análise inicial...', duration: 900 },
          { message: 'Preparando dados para próxima etapa...', duration: 500 }
        ];
      
      case 'process':
        return [
          ...baseSteps,
          { message: 'Recebendo dados dos nós anteriores...', duration: 700 },
          { message: 'Processando análises combinadas...', duration: 1400 },
          { message: 'Aplicando regras de negócio...', duration: 1100 },
          { message: 'Gerando relatório intermediário...', duration: 800 },
          { message: 'Validando resultados...', duration: 600 }
        ];
      
      case 'end':
        return [
          ...baseSteps,
          { message: 'Consolidando resultados finais...', duration: 1000 },
          { message: 'Gerando relatório final...', duration: 1200 },
          { message: 'Aplicando formatação...', duration: 700 },
          { message: 'Validando documento final...', duration: 500 }
        ];
      
      default:
        return baseSteps;
    }
  };

  const executeWorkflow = async () => {
    if (nodes.length === 0) return;
    
    setIsExecuting(true);
    setExecutionResults(null);
    
    const executionOrder = buildExecutionOrder();
    
    // Inicializa logs
    const initialLogs: ExecutionLog[] = executionOrder.map(nodeId => ({
      id: `log_${nodeId}_${Date.now()}`,
      nodeId,
      status: 'pending',
      progress: 0,
      streamingMessages: [],
      currentStep: 'Aguardando execução...'
    }));
    
    setExecutionLogs(initialLogs);
    
    // Executa nós em ordem
    for (const nodeId of executionOrder) {
      await simulateNodeExecution(nodeId);
      
      // Verifica se houve erro
      const currentLog = executionLogs.find(log => log.nodeId === nodeId);
      if (currentLog?.status === 'error') {
        break; // Para a execução em caso de erro
      }
    }
    
    // Gera resultados finais
    const mockResults = {
      totalNodes: executionOrder.length,
      successfulNodes: executionLogs.filter(log => log.status === 'completed').length,
      executionTime: '2m 34s',
      outputData: 'Workflow executado com sucesso. Dados processados e análise completa.',
    };
    
    setExecutionResults(mockResults);
    setIsExecuting(false);
  };

  const resetExecution = () => {
    setExecutionLogs([]);
    setExecutionResults(null);
    setIsExecuting(false);
    setCurrentExecutingNode(null);
  };

  const getNodeName = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.name : 'Nó não encontrado';
  };

  const getStatusIcon = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'pending': return 'ri-time-line text-gray-400';
      case 'running': return 'ri-loader-line text-blue-600 animate-spin';
      case 'completed': return 'ri-check-circle-line text-green-600';
      case 'error': return 'ri-error-warning-line text-red-600';
      default: return 'ri-circle-line text-gray-400';
    }
  };

  const getStatusText = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'pending': return 'Aguardando';
      case 'running': return 'Executando';
      case 'completed': return 'Concluído';
      case 'error': return 'Erro';
      default: return 'Desconhecido';
    }
  };

  const canExecute = nodes.length > 0 && !isExecuting;

  const getProgressColor = (progress: number, status: ExecutionLog['status']) => {
    if (status === 'error') return 'bg-red-500';
    if (status === 'completed') return 'bg-green-500';
    if (status === 'running') return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const getProgressTextColor = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'running': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Executar Workflow</h2>
          <p className="text-gray-600">Execute e monitore o processamento do seu workflow</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {executionLogs.length > 0 && (
            <button
              onClick={resetExecution}
              disabled={isExecuting}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <i className="ri-refresh-line mr-2"></i>
              Resetar
            </button>
          )}
          
          <button
            onClick={executeWorkflow}
            disabled={!canExecute}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap ${
              canExecute
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <i className={`${isExecuting ? 'ri-loader-line animate-spin' : 'ri-play-circle-line'}`}></i>
            <span>{isExecuting ? 'Executando...' : 'Executar Workflow'}</span>
          </button>
        </div>
      </div>

      {/* Workflow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-node-tree text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total de Nós</h3>
              <p className="text-2xl font-bold text-blue-600">{nodes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-link text-green-600 text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Conexões</h3>
              <p className="text-2xl font-bold text-green-600">{connections.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="ri-login-circle-line text-purple-600 text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Nós de Entrada</h3>
              <p className="text-2xl font-bold text-purple-600">{getEntryNodes().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Arquivos de Entrada</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar arquivos para processamento
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Arquivos Selecionados ({selectedFiles.length})
              </h4>
              <div className="space-y-1">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="text-sm text-blue-700 flex items-center space-x-2">
                    <i className="ri-file-line text-xs"></i>
                    <span>{file.name}</span>
                    <span className="text-blue-600">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Execution Status with Streaming */}
      {executionLogs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Status da Execução</h3>
              {isExecuting && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span>Executando em tempo real</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {executionLogs.map((log) => (
              <div key={log.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <i className={getStatusIcon(log.status)}></i>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {getNodeName(log.nodeId)}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                        log.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        log.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getStatusText(log.status)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {(log.status === 'running' || log.status === 'completed' || log.status === 'error') && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${getProgressTextColor(log.status)}`}>
                            {log.currentStep}
                          </span>
                          <span className={`text-sm font-medium ${getProgressTextColor(log.status)}`}>
                            {log.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(log.progress, log.status)}`}
                            style={{ width: `${log.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Streaming Messages */}
                    {log.streamingMessages.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
                        <div className="space-y-1">
                          {log.streamingMessages.map((message, index) => (
                            <div key={index} className="text-sm text-gray-700 flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {new Date().toLocaleTimeString()}
                              </span>
                              <span>{message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {log.output && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-green-800">{log.output}</p>
                      </div>
                    )}
                    
                    {log.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-red-800">{log.error}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {log.startTime && (
                        <div className="flex items-center space-x-1">
                          <i className="ri-time-line"></i>
                          <span>Iniciado: {log.startTime.toLocaleTimeString()}</span>
                        </div>
                      )}
                      
                      {log.endTime && (
                        <div className="flex items-center space-x-1">
                          <i className="ri-check-line"></i>
                          <span>Finalizado: {log.endTime.toLocaleTimeString()}</span>
                        </div>
                      )}

                      {log.status === 'running' && log.startTime && (
                        <div className="flex items-center space-x-1">
                          <i className="ri-timer-line"></i>
                          <span>Tempo decorrido: {Math.floor((Date.now() - log.startTime.getTime()) / 1000)}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {executionResults && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-check-circle-line text-green-600 text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Execução Concluída</h3>
              <p className="text-gray-600">Workflow processado com sucesso</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Total de Nós</div>
              <div className="text-2xl font-bold text-blue-800">{executionResults.totalNodes}</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Nós Executados</div>
              <div className="text-2xl font-bold text-green-800">{executionResults.successfulNodes}</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-sm text-purple-600 font-medium">Tempo Total</div>
              <div className="text-2xl font-bold text-purple-800">{executionResults.executionTime}</div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Resultado Final</h4>
            <p className="text-gray-800">{executionResults.outputData}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-play-circle-line text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum workflow para executar</h3>
          <p className="text-gray-600 mb-4">
            Crie nós e conexões primeiro para poder executar um workflow.
          </p>
        </div>
      )}
    </div>
  );
}
