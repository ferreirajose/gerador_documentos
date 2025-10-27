import { useState } from 'react';
import {
  RiNodeTree,
  RiAddLine,
  RiSearchLine,
  RiCloseLine,
  RiTimeLine,
  RiFileTextLine,
  RiEditLine,
  RiDeleteBinLine,
  RiCpuLine,
  RiLoginCircleLine,
  RiBrainLine
} from '@remixicon/react';

import { useWorkFlow } from '@/context/WorkflowContext';
import WorkflowHttpGateway from '@/gateway/WorkflowHttpGateway';
import AxiosAdapter from '@/infra/AxiosAdapter';
import { llmModelsByProvider } from '@/data/llmodels';
import { formatAgentName } from '@/libs/util';
import WorkflowOutput from './common/WorkflowOutput';
import { Node } from '@/types/nodes';

const nodeTypes = [
  { value: 'entry', label: 'Entrada', icon: RiLoginCircleLine, color: 'bg-green-500' },
  { value: 'process', label: 'Processamento', icon: RiCpuLine, color: 'bg-blue-500' },
];

const BASE_URL_MINUTA = import.meta.env.VITE_API_URL_MINUTA;
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

export default function NodeManager() {

  const {
    state,
    createNode,
    updateNode,
    deleteNode,
    setSelectedFile,
    clearSelectedFile,
    getAvailableDocumentKeys,
    getAvailableOutputKeys,
    buildCompleteWorkflow
  } = useWorkFlow();

  const availableDocumentKeys = getAvailableDocumentKeys();
  const availableOutputKeys = getAvailableOutputKeys();


  // Estado para arquivo selecionado
  const [selectedFiles, setLocalSelectedFiles] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isMultipleFiles, setIsMultipleFiles] = useState(false);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const [isWorkflowVisible, setIsWorkflowVisible] = useState(true); // ou false se quiser iniciar oculto


  const [formData, setFormData] = useState({
    name: '',
    type: 'process' as 'entry' | 'process',
    llmModel: 'o3',
    prompt: '',
     workflowData: {
      entradas: {} as Record<string, Record<string, string>>
    }
  });

   // ✅ NOVO: Estado para gerenciar entradas
  const [entradas, setEntradas] = useState<Array<{
    campo: string;
    tipo: 'lista_de_origem' | 'buscar_documento' | 'id_da_defesa' | 'do_estado';
    referencia: string;
  }>>([]);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'process',
      llmModel: 'o3',
      prompt: '',
      workflowData: { entradas: {} }
    });
    setEntradas([]);
    setLocalSelectedFiles([]); // LIMPAR ARQUIVOS
    setIsMultipleFiles(false);
  };

  // ✅ NOVO: Função para adicionar entrada
  const adicionarEntrada = () => {
    // Define o tipo padrão baseado no tipo do nó
    const tipoPadrao = formData.type === 'process' ? 'lista_de_origem' : 'buscar_documento';
    
    setEntradas(prev => [...prev, { campo: '', tipo: tipoPadrao, referencia: '' }]);
  };

  // ✅ NOVO: Função para remover entrada
  const removerEntrada = (index: number) => {
    setEntradas(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ NOVO: Função para atualizar entrada
  const atualizarEntrada = (index: number, field: string, value: string) => {
    setEntradas(prev => prev.map((entrada, i) => 
      i === index ? { ...entrada, [field]: value } : entrada
    ));
  };

  // No NodeManager.tsx - no handleSubmit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Montar workflowData com as entradas configuradas E informação de múltiplos arquivos
    const workflowData = {
      entradas: entradas.reduce((acc, entrada) => {
        if (entrada.campo && entrada.referencia) {
          // ✅ USAR formatAgentName PARA NORMALIZAR O NOME DO CAMPO
          const campoNormalizado = formatAgentName(entrada.campo);
          acc[campoNormalizado] = { [entrada.tipo]: entrada.referencia };
        }
        return acc;
      }, {} as Record<string, Record<string, string>>),
      // ADICIONAR: informação sobre múltiplos arquivos (apenas para nós de entrada)
      ...(formData.type === 'entry' && {
        isMultipleFiles: isMultipleFiles
      })
    };

    const nodeData = {
      ...formData,
      workflowData
    };

    if (editingNode) {
      updateNode(editingNode.id, nodeData);
      setEditingNode(null);
    } else {
      createNode(nodeData);
      setShowCreateForm(false);
    }

    resetForm();
  };

  // E no handleEdit, carregar o estado do checkbox
  const handleEdit = (node: any) => {
    setEditingNode(node);
    setFormData({
      name: node.name,
      type: node.type,
      llmModel: node.llmModel || 'o3',
      prompt: node.prompt || '',
      workflowData: node.workflowData || { entradas: {} }
    });

    // ✅ Carregar entradas existentes para edição
    if (node.workflowData?.entradas) {
      const entradasArray = Object.entries(node.workflowData.entradas).map(([campo, def]) => {
        const [[tipo, referencia]] = Object.entries(def as Record<string, string>);
        return { 
          campo, 
          tipo: tipo as any,
          referencia 
        };
      });
      setEntradas(entradasArray);
    } else {
      setEntradas([]);
    }

    // CARREGAR: estado do checkbox de múltiplos arquivos
    if (node.type === 'entry') {
      setIsMultipleFiles(node.workflowData?.isMultipleFiles || false);
    }

    setShowCreateForm(true);
  };

  const onDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este nó?')) {
      deleteNode(id);   
    }
  };  

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingNode(null);
    resetForm();
  };

  // MUDANÇA: Função para processar múltiplos arquivos
  const processFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const httpClient = new AxiosAdapter();
      const workFlowGateway = new WorkflowHttpGateway(httpClient, BASE_URL_MINUTA, AUTH_TOKEN);

      const processedFiles: any[] = [];

      // PROCESSAR CADA ARQUIVO INDIVIDUALMENTE
      for (const file of files) {
        const response = await workFlowGateway.uploadAndProcess(file);

        if (response.success && response.data) {
          const { uuid_documento } = response.data;

          const processedFile = {
            name: response.data.titulo_arquivo || response.data.arquivo_original,
            size: file.size,
            type: file.type,
            uuid: uuid_documento,
            data: response.data
          };

          processedFiles.push(processedFile);
          console.log(`Arquivo processado: ${file.name} -> UUID: ${uuid_documento}`);
        }
      }

      // ATUALIZAR STATE COM TODOS OS ARQUIVOS PROCESSADOS
      if (processedFiles.length > 0) {
        setLocalSelectedFiles(processedFiles);
        setSelectedFile(processedFiles as any); // MUDANÇA: Agora passa array completo // @TODO DEFINIR TIPO CORRETOR E REMOVE any
        console.log('Todos os arquivos processados:', processedFiles);
      }
      
    } catch (error) {
      console.error('Erro ao processar arquivos:', error);
      alert('Erro ao processar arquivos. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  // MUDANÇA: Handler para seleção de arquivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files);
      
      if (isMultipleFiles) {
        // ✅ MÚLTIPLOS ARQUIVOS: Processar todos
        setLocalSelectedFiles(filesArray.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          uuid: '', // Será preenchido após processamento
          data: null
        })));
        processFiles(filesArray);
      } else {
        // ✅ ÚNICO ARQUIVO: Processar apenas o primeiro
        const file = filesArray[0];
        setLocalSelectedFiles([{
          name: file.name,
          size: file.size,
          type: file.type,
          uuid: '', // Será preenchido após processamento
          data: null
        }]);
        processFiles([file]);
      }
    }
  };

  // MUDANÇA: Handler para remover arquivos
  const handleRemoveFiles = () => {
    setLocalSelectedFiles([]);
    clearSelectedFile();
  };


  const filteredNodes = state.nodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || node.type === filterType;
    return matchesSearch && matchesType;
  });

  const getNodeTypeInfo = (type: string) => {
    return nodeTypes.find(nt => nt.value === type) || nodeTypes[1];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Nós</h2>
          <p className="text-gray-600 dark:text-gray-400">Crie e configure os nós do seu workflow</p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          data-testid="create-node-button"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
        >
          <RiAddLine className="text-xl" />
          <span>Criar Nó</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar nós
            </label>
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome ou descrição..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filtrar por tipo
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos os tipos</option>
              {nodeTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingNode ? 'Editar Nó' : 'Criar Novo Nó'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <RiCloseLine className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div data-testid="node-name">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do Nó *
                </label>
                <input
                  data-testid="node-name-input"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Processador de Documentos"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div data-testid="node-type">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo do Nó *
                </label>
                <select
                  data-testid="node-type-select"
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'entry' | 'process' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {nodeTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ NOVA SEÇÃO: Upload de Arquivo - APENAS para Entry Nodes - AO LADO DO MODELO LLM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div data-testid="node-llm-model">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Modelo LLM
              </label>
              
              <div className="relative">
                <select
                  data-testid="node-llm-model-select"
                  value={formData.llmModel}
                  onChange={(e) => setFormData(prev => ({ ...prev, llmModel: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none cursor-pointer transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm"
                >
                  {Object.entries(llmModelsByProvider).map(([providerKey, provider]) => (
                    <optgroup 
                      key={providerKey}
                      label={provider.name} 
                      className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800"
                    >
                      {provider.models.map(model => (
                        <option key={model.value} value={model.value} className="py-2">
                          {model.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                
                {/* Ícone de seta */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Badge do modelo selecionado */}
              <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Selecionado:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {(() => {
                    let selectedLabel = formData.llmModel;
                    Object.values(llmModelsByProvider).forEach(provider => {
                      provider.models.forEach(model => {
                        if (model.value === formData.llmModel) {
                          selectedLabel = model.label;
                        }
                      });
                    });
                    return selectedLabel;
                  })()}
                </span>
              </div>
            </div>

              {/* ✅ SEÇÃO DE UPLOAD - APENAS PARA NÓS DE ENTRADA */}
              {formData.type === 'entry' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload de Arquivo
                  </label>
                  
                  {/* Checkbox para múltiplos arquivos */}
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="multiple-files"
                      checked={isMultipleFiles}
                      onChange={(e) => setIsMultipleFiles(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="multiple-files" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Upload como lista de múltiplos arquivos
                    </label>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.txt,.json"
                      className="hidden"
                      disabled={isUploading}
                      multiple={isMultipleFiles}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                        isUploading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          <RiFileTextLine className="mr-2" />
                          {isMultipleFiles ? 'Selecionar Arquivos' : 'Selecionar Arquivo'}
                        </>
                      )}
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Formatos suportados: PDF, DOC, DOCX, TXT, JSON
                      {isMultipleFiles && ' (Selecione múltiplos arquivos)'}
                    </p>
                  </div>

                  {/* ✅ MUDANÇA: Exibir múltiplos arquivos */}
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <RiFileTextLine className="text-green-600 dark:text-green-400" />
                              <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {file.name}
                                </span>
                                {file.uuid && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    UUID: {file.uuid}
                                  </p>
                                )}
                              </div>
                            </div>
                            {!isUploading && (
                              <button
                                onClick={() => {
                                  const newFiles = selectedFiles.filter((_, i) => i !== index);
                                  setLocalSelectedFiles(newFiles);
                                  setSelectedFile(newFiles as any); // @TODO DEFINIR TIPO CORRETOR E REMOVE any
                                }}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              >
                                <RiCloseLine className="text-lg" />
                              </button>
                            )}
                          </div>
                          {isUploading && !file.uuid && (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {selectedFiles.length > 1 && !isUploading && (
                        <button
                          onClick={handleRemoveFiles}
                          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Remover Todos os Arquivos
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ✅ SEÇÃO: Configuração de Entradas */}
            {/* ✅ SEÇÃO: Configuração de Entradas - APENAS SE HOUVER DOCUMENTOS */}
            {state.selectedFile && state.selectedFile.length > 0 && state.nodes.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                    Configurar Entradas do Nó
                  </h4>
                  <button
                    type="button"
                    onClick={adicionarEntrada}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    + Adicionar Entrada
                  </button>
                </div>

                {entradas.map((entrada, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome do Campo *
                      </label>
                      <input
                        type="text"
                        value={entrada.campo}
                        onChange={(e) => atualizarEntrada(index, 'campo', e.target.value)}
                        placeholder="Ex: conteudo_auditoria"
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tipo
                      </label>
                      <select
                        value={entrada.tipo}
                        onChange={(e) => atualizarEntrada(index, 'tipo', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="lista_de_origem">Lista de Origem</option>
                        <option value="buscar_documento">Buscar Documento</option>
                        <option value="id_da_defesa">ID da Defesa</option>
                        <option value="do_estado">Do Estado</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {formData.type === 'process' ? 'Chave de Saída *' : 'Documento de Referência *'}
                        </label>
                        {formData.type === 'process' ? (
                          // Select para Chaves de Saída (nós de processamento)
                          <select
                            value={entrada.referencia}
                            onChange={(e) => atualizarEntrada(index, 'referencia', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="">Selecione uma chave de saída...</option>
                            {/* // @TODO DEFINIR TIPO CORRETOR E REMOVE any */}
                            {availableOutputKeys.map((key: any) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                          </select>
                        ) : (
                          // Select para Documentos (nós de entrada)
                          <select
                            value={entrada.referencia}
                            onChange={(e) => atualizarEntrada(index, 'referencia', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                          >
                            <option value="">Selecione um documento...</option>
                            {/* // @TODO DEFINIR TIPO CORRETOR E REMOVE any */}
                            {availableDocumentKeys.map((key: any) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removerEntrada(index)}
                          className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700 transition-colors whitespace-nowrap"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {entradas.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <RiFileTextLine className="mx-auto text-gray-400 text-2xl mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Nenhuma entrada configurada
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                      Adicione entradas para conectar este nó aos documentos disponíveis
                    </p>
                    <button
                      type="button"
                      onClick={adicionarEntrada}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Adicionar Primeira Entrada
                    </button>
                  </div>
                )}
              </div>
            )}
            

            <div data-testid="node-prompt">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prompt Personalizado
              </label>
              <textarea
                data-testid="node-prompt-textarea"
                value={formData.prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Configure instruções específicas para este nó..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                data-testid="cancel-button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                type="submit"
                data-testid="submit-button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                {editingNode ? 'Atualizar' : 'Criar'} Nó
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Nodes List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nós Criados ({filteredNodes.length})
          </h3>
        </div>

        {filteredNodes.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNodes.map((node) => {
              const typeInfo = getNodeTypeInfo(node.type);
              const IconComponent = typeInfo.icon;
              return (
                <div key={node.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${typeInfo.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-4 text-white text-xl" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{node.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${node.type === 'entry' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              node.type === 'process' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                            {typeInfo.label}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          {node.llmModel && (
                            <div className="flex items-center space-x-1">
                              <RiBrainLine className="w-4" />
                              <span>
                                {(() => {
                                  // Buscar o label do modelo selecionado em todos os grupos
                                  let modelLabel = node.llmModel; // Fallback para o valor se não encontrar
                                  
                                  // Verificar em cada provedor
                                  Object.values(llmModelsByProvider).forEach(provider => {
                                    const foundModel = provider.models.find(m => m.value === node.llmModel);
                                    if (foundModel) {
                                      modelLabel = foundModel.label;
                                    }
                                  });
                                  
                                  return modelLabel;
                                })()}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center space-x-1">
                            <RiTimeLine className="w-4" />
                            <span>{node.createdAt.toLocaleDateString()}</span>
                          </div>

                          {node.prompt && (
                            <div className="flex items-center space-x-1">
                              <RiFileTextLine className="w-4" />
                              <span>Prompt configurado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(node)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Editar nó"
                      >
                        <RiEditLine className="w-4" />
                      </button>

                      <button
                        onClick={() => onDelete(node.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Excluir nó"
                      >
                        <RiDeleteBinLine className="h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <RiNodeTree className="w-4 text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum nó encontrado</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterType !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro nó para o workflow'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Criar Primeiro Nó
              </button>
            )}
          </div>
        )}
      </div>

      {/* Workflow Output */}
      <WorkflowOutput
        buildCompleteWorkflow={buildCompleteWorkflow}
        isWorkflowVisible={isWorkflowVisible}
        setIsWorkflowVisible={setIsWorkflowVisible}
      />
    </div>
  );
}