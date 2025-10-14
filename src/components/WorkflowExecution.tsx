import { useState } from 'react';
import WorkflowHttpGateway from '../gateway/WorkflowHttpGateway';
import AxiosAdapter from '../infra/AxiosAdapter';
import { useWorkFlow } from '@/context/WorkflowContext';

const BASE_URL = import.meta.env.VITE_API_URL;
const BASE_URL_MINUTA = import.meta.env.VITE_API_URL_MINUTA;
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;
console.log("BASE_URL:", BASE_URL);
console.log("BASE_URL_MINUTA:", BASE_URL_MINUTA); 

export default function WorkflowExecution() {
  const { 
    state, 
    setExecuting, 
    setResults, 
    addLog, 
    clearLogs, 
    buildCompleteWorkflow,
    setSelectedFile,
    clearSelectedFile
  } = useWorkFlow();
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const getEntryNodes = () => {
    return state.nodes.filter(node => node.type === 'entry');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFileUpload(file);
    event.target.value = '';
  };

  const processFileUpload = async (file: File) => {
    setExecuting(true);
    setIsExecuting(true);
    setUploadError(null);
    clearLogs();
    setResults(null);

    try {
      // Configurar serviço
      const httpClient = new AxiosAdapter();
      const workFlowGateway = new WorkflowHttpGateway(httpClient, BASE_URL_MINUTA, AUTH_TOKEN);

      addLog({
        id: `log_${Date.now()}`,
        message: 'Iniciando upload e processamento do arquivo...',
        timestamp: new Date(),
        data: { fileName: file.name, size: file.size }
      });

      // Executar upload e processamento
      const response = await workFlowGateway.uploadAndProcess(file);

      if (response.success && response.data) {
        // Pegar o valor da propriedade uuid_documento e passar para setSelectedFile
        const { uuid_documento } = response.data;
        
        // Criar um objeto file-like com as informações do documento processado
        const processedFile = {
          name: response.data.titulo_arquivo || response.data.arquivo_original,
          size: 0, // Não temos o tamanho do arquivo processado
          type: `application/${response.data.extensao}`,
          uuid: uuid_documento,
          data: response.data
        };

        setSelectedFile(processedFile as any);

        addLog({
          id: `log_${Date.now()}_success`,
          message: 'Arquivo processado com sucesso!',
          timestamp: new Date(),
          data: {
            uuid_documento,
            arquivo_original: response.data.arquivo_original,
            total_paginas: response.data.total_paginas,
            total_tokens: response.data.total_tokens
          }
        });

        setResults({
          success: true,
          message: 'Arquivo processado com sucesso',
          data: response.data
        });
      } else {
        throw new Error(response.message || 'Erro ao processar arquivo');
      }

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao processar arquivo';
      setUploadError(errorMessage);
      
      addLog({
        id: `log_${Date.now()}_error`,
        message: 'Erro ao processar arquivo',
        timestamp: new Date(),
        data: { error: errorMessage }
      });
      setResults({ 
        error: errorMessage
      });
    } finally {
      setExecuting(false);
      setIsExecuting(false);
    }
  };

  const handleRetryUpload = () => {
    if (state.selectedFile) {
      // Criar um File object a partir do arquivo selecionado para reenviar
      const file = new File([], state.selectedFile.name, {
        type: state.selectedFile.type,
      });
      processFileUpload(file);
    }
  };

  const handleRemoveFile = () => {
    clearSelectedFile();
    setUploadError(null);
  };

  const executeWorkflow = async () => {
    if (state.nodes.length === 0) return;
    
    setExecuting(true);
    setIsExecuting(true);
    setResults(null);
    clearLogs();

    try {
      // Construir workflow completo usando o método do context
      const workflowJson = buildCompleteWorkflow();
      
      // Configurar serviço
      const httpClient = new AxiosAdapter();
      const workFlowGateway = new WorkflowHttpGateway(httpClient, BASE_URL, AUTH_TOKEN);
      //const service = new WorkflowRelatorioService(workFlowGateway);

      // Executar workflow
      const streaming = await workFlowGateway.gerarRelatorioComStreaming(workflowJson);

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
        setIsExecuting(false);
        setResults({ error: error.message });
      });

      streaming.onComplete(() => {
        console.log("Streaming completado");
        setExecuting(false);
        setIsExecuting(false);
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
      setIsExecuting(false);
      setResults({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      });
    }
  };

  const resetExecution = () => {
    setExecuting(false);
    setIsExecuting(false);
    setResults(null);
    clearLogs();
    clearSelectedFile();
    setUploadError(null);
  };

  const canExecute = state.nodes.length > 0 && !state.isExecuting;

  // Lógica ajustada: mostrar seção de upload SEMPRE (para poder anexar arquivos)
  const shouldShowUploadSection = true;

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

      {/* File Upload Section - MOSTRAR SEMPRE */}
      {shouldShowUploadSection && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Upload de Documento</h3>
              <p className="text-gray-600">Selecione um arquivo para processar no workflow</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Arquivo selecionado */}
            {!state.selectedFile ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <i className="ri-file-text-line text-green-600 text-xl"></i>
                  <div>
                    <p className="font-medium text-green-800">{state.selectedFile.name}</p>
                    <p className="text-sm text-green-600">
                      {state.selectedFile.size > 0 ? `${(state.selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Arquivo processado'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {uploadError && (
                    <button
                      onClick={handleRetryUpload}
                      disabled={state.isExecuting}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Tentar novamente"
                    >
                      <i className="ri-refresh-line"></i>
                    </button>
                  )}
                  <button
                    onClick={handleRemoveFile}
                    disabled={state.isExecuting}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            ) : (
              /* Área de upload */
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  disabled={state.isExecuting}
                />
                <label
                  htmlFor="file-upload"
                  className={`cursor-pointer flex flex-col items-center space-y-2 ${
                    state.isExecuting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <i className="ri-upload-cloud-2-line text-3xl text-gray-400"></i>
                  <span className="text-gray-600">
                    {state.isExecuting ? 'Upload desabilitado durante execução' : 'Clique para fazer upload'}
                  </span>
                  <span className="text-sm text-gray-500">PDF, DOC, DOCX, TXT</span>
                </label>
              </div>
            )}

            {/* Mensagem de erro */}
            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="ri-error-warning-line text-red-600"></i>
                    <span className="text-red-800">{uploadError}</span>
                  </div>
                  <button
                    onClick={handleRetryUpload}
                    disabled={state.isExecuting}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resto do código permanece igual */}
      {/* Workflow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-node-tree text-blue-600 text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total de Nós</h3>
              <p className="text-2xl font-bold text-blue-600" data-testid="text-nodes-length">
                {state.nodes.length}
              </p>
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
              <p className="text-2xl font-bold text-green-600" data-testid="text-connections-length">
                {state.connections.length}
              </p>
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

      {/* Execution Status with Streaming */}
      {state.executionLogs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Status da Execução</h3>
              {state.isExecuting && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span>Executando em tempo real</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Logs */}
          <div className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {state.executionLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{log.message}</p>
                      <span className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {log.data && (
                      <pre className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {state.executionResults && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              state.executionResults.success ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <i className={`text-xl ${
                state.executionResults.success ? 'ri-check-circle-line text-green-600' : 'ri-error-warning-line text-red-600'
              }`}></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {state.executionResults.success ? 'Execução Concluída' : 'Erro na Execução'}
              </h3>
              <p className="text-gray-600">{state.executionResults.message}</p>
            </div>
          </div>
          
          {state.executionResults.success && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Nós Executados</div>
                <div className="text-2xl font-bold text-blue-800">
                  {state.executionResults.nodesExecuted || state.nodes.length}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Conexões Utilizadas</div>
                <div className="text-2xl font-bold text-green-800">
                  {state.executionResults.connectionsUsed || state.connections.length}
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">Arquivo Processado</div>
                <div className="text-2xl font-bold text-purple-800">
                  {state.selectedFile ? 'Sim' : 'Não'}
                </div>
              </div>
            </div>
          )}
          
          {state.executionResults.error && (
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-700 mb-2">Erro</h4>
              <p className="text-red-800">{state.executionResults.error}</p>
            </div>
          )}
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