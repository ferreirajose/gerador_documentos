import { useState } from 'react';
import WorkflowHttpGateway from '../gateway/WorkflowHttpGateway';
import AxiosAdapter from '../infra/AxiosAdapter';
import { useWorkFlow } from '@/context/WorkflowContext';
import { GerarDocCallbacks } from '@/types/nodes';
import WorkflowHttpGatewayV2 from '@/gateway/WorkflowHttpGatewayV2';
import FetchAdapter from '@/infra/FetchAdapter';
import { WorkflowBuilder } from '@/application/builders/WorkflowBuilder';
import { AuditorPrompt, DefensePrompt, RelatorPrompt, InfoExtractorPrompt } from '@/data/mock_prompt';
import { ExecuteProgress } from './common/ExecuteProgress';

const BASE_URL = import.meta.env.VITE_API_URL;
const BASE_URL_MINUTA = import.meta.env.VITE_API_URL_MINUTA;
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

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

  const [uploadError, setUploadError] = useState<string | null>(null);

  const [progressState, setProgressState] = useState({
    etapasConcluidas: 0,
    totalEtapas: 0,
    progresso: 0,
    isLoading: false,
    erroCritico: null as string | null,
    relatorioFinal: null as string | null,
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFileUpload(file);
    event.target.value = '';
  };

  const processFileUpload = async (file: File) => {
    setExecuting(true);
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
    totalEtapas: state.nodes.length, // Total de nós no seu workflow @TODO SERA USADO A QUANTIDADE DE NOS state.nodes.length
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
                  className={`cursor-pointer flex flex-col items-center space-y-2 ${state.isExecuting ? 'opacity-50 cursor-not-allowed' : ''
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