import { useState } from 'react';
import { useWorkflow } from '@/context/WorkflowContext';
import WorkflowRelatorioService from '../application/services/WorkflowRelatorioService';
import WorkflowHttpGateway from '../gateway/WorkflowHttpGateway';
import AxiosAdapter from '../infra/AxiosAdapter';

const BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

export default function WorkflowExecution() {
   const { 
    state, 
    setExecuting, 
    setResults, 
    addLog, 
    clearLogs, 
    setFiles,
    buildCompleteWorkflow 
  } = useWorkflow();
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);

  const getEntryNodes = () => {
    return state.nodes.filter(node => node.type === 'entry');
  };

  const executeWorkflow = async () => {
    if (state.nodes.length === 0) return;
    
    setExecuting(true);
    setResults(null);
    clearLogs();

    try {
      // Construir workflow completo usando o método do context
      const workflowJson = buildCompleteWorkflow();
      
      // Configurar serviço
      const httpClient = new AxiosAdapter();
      const workFlowGateway = new WorkflowHttpGateway(httpClient, BASE_URL, AUTH_TOKEN);
      const service = new WorkflowRelatorioService(workFlowGateway);

      // Executar workflow
      const streaming = await service.gerarRelatorioComStreaming(workflowJson);

      streaming.onData((data) => {
        console.log("Dados recebidos:", data);
        addLog({
          id: `log_${Date.now()}`,
          message: data.status || 'Processando...',
          timestamp: new Date(),
          data: data
        });
      });

      streaming.onError((error) => {
        console.error("Erro no streaming:", error);
        setExecuting(false);
        setResults({ error: error.message });
      });

      streaming.onComplete(() => {
        console.log("Streaming completado");
        setExecuting(false);
        setResults({ 
          success: true, 
          message: 'Workflow executado com sucesso',
          nodesExecuted: state.nodes.length,
          connectionsUsed: state.connections.length
        });
      });

    } catch (error) {
      console.error('Erro ao executar workflow:', error);
      setExecuting(false);
      setResults({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const resetExecution = () => {
    setExecuting(false);
    setResults(null);
    clearLogs();
    setFiles([]);
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
              <p className="text-2xl font-bold text-blue-600">{state.nodes.length}</p>
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
              <p className="text-2xl font-bold text-green-600">{state.connections.length}</p>
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
          {/* Logs */}
         

          
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
      {state.nodes.length === 0 && (
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
