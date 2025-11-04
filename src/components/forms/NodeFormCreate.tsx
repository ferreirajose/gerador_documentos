// NodeForm.tsx
import { WorkflowState } from '@/context/WorkflowContext';
import { FERRAMENTAS_DISPONIVEIS } from '@/data/ferramentas';
import { llmModelsByProvider } from '@/data/llmodels';
import { useNodeFormController } from '@/hooks/useNodeFormController';
import { formatFileSize } from '@/libs/util';
import { RiBracesLine, RiCheckboxCircleLine, RiDeleteBinLine, RiErrorWarningLine, RiFileLine, RiInformationLine, RiLoader4Line, RiRefreshLine, RiTimeLine, RiUploadLine } from '@remixicon/react';

  interface NodeFormProps {
  state: WorkflowState;
  onCloseForm: () => void;
}

const UploadStatusIcon = ({ status }: { status: string }) => {
  const iconProps = { className: "w-4 h-4" };
  
  switch (status) {
    case 'pending':
      return <RiTimeLine {...iconProps} className={`${iconProps.className} text-gray-400`} />;
    case 'uploading':
      return <RiLoader4Line {...iconProps} className={`${iconProps.className} text-blue-500 animate-spin`} />;
    case 'completed':
      return <RiCheckboxCircleLine {...iconProps} className={`${iconProps.className} text-green-500`} />;
    case 'error':
      return <RiErrorWarningLine {...iconProps} className={`${iconProps.className} text-red-500`} />;
    default:
      return <RiFileLine {...iconProps} className={`${iconProps.className} text-gray-400`} />;
  }
};
export function NodeFormCreate({ state, onCloseForm }: NodeFormProps) {
  const {
    formData,
    showVariableSelector,
    promptTextareaRef,
    fileInputRef,
    uploadedFiles,
    isUploading,
    getAvailableVariables,
    setShowVariableSelector,
    insertVariableInPrompt,
    setFormData,
    handleSubmit,
    handleFerramentaChange,
    addEntrada,
    removeEntrada,
    updateEntrada,
    updateSaida,
    // Funções de documentos anexados
    retryUpload,
    addDocumento,
    updateDocumento,
    removeDocumento,
    handleFileUpload,
    onRemoveFile,
    getUploadStatusText,
  } = useNodeFormController(onCloseForm);

  const documentosAnexados = state.documentos_anexados;


  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome do Nó
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Ex: AnalisadorContrato"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoria
          </label>
          <select
            value={formData.categoria}
            onChange={(e) => setFormData({ 
              ...formData, 
              categoria: e.target.value as "entrada" | "processamento" | "saida" 
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="entrada">Entrada</option>
            <option value="processamento">Processamento</option>
            <option value="saida">Saída</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Modelo LLM
          </label>
          <select
            value={formData.modelo_llm}
            onChange={(e) => setFormData({ ...formData, modelo_llm: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {Object.entries(llmModelsByProvider).map(([providerKey, provider]) => (
              <optgroup
                key={providerKey}
                label={provider.name}
                className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-600"
              >
                {provider.models.map(model => (
                  <option key={model.value} value={model.value} className="py-2 bg-white dark:bg-gray-700">
                    {model.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nivel de Criatividade ({formData.temperatura})
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={formData.temperatura}
            onChange={(e) => setFormData({ ...formData, temperatura: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Mais preciso</span>
            <span>Mais criativo</span>
          </div>
        </div>
      </div>

      {/* ✅ SEÇÃO: Ferramentas */}
      <div data-testid="node-tools">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Ferramentas
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {FERRAMENTAS_DISPONIVEIS.map((ferramenta) => (
            <div key={ferramenta.value} className="flex items-center">
              <input
                type="checkbox"
                id={`ferramenta-${ferramenta.value}`}
                checked={formData.ferramentas?.includes(ferramenta.value) || false}
                onChange={() => handleFerramentaChange(ferramenta.value)}
                className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor={`ferramenta-${ferramenta.value}`}
                className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {ferramenta.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ SEÇÃO: Documentos Anexados - apenas para categoria entrada */}
      {/* ✅ SEÇÃO: Documentos Anexados - apenas para categoria entrada */}
      {formData.categoria === 'entrada' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Documentos Anexados
            </label>
            <button
              type="button"
              onClick={addDocumento}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <RiUploadLine className="w-4" />
              <span>Adicionar Documento</span>
            </button>
          </div>

          {documentosAnexados.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <RiFileLine className="text-3xl text-gray-400 mb-2 mx-auto" />
              <p className="text-gray-500 text-sm">Nenhum documento anexado</p>
              <p className="text-gray-400 text-xs">Clique em "Adicionar Documento" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documentosAnexados.map((documento, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Documento {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeDocumento(index)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Chave do Documento
                      </label>
                      <input
                        type="text"
                        value={documento.chave}
                        onChange={(e) => updateDocumento(index, 'chave', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ex: auditoria_especial"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tipo
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`tipo-${index}`}
                            checked={documento.tipo === 'unico'}
                            onChange={(e) => updateDocumento(index, 'tipo', 'unico')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Único</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name={`tipo-${index}`}
                            checked={documento.tipo === 'lista'}
                            onChange={(e) => updateDocumento(index, 'tipo', 'lista')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Lista</span>
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Descrição do Documento
                      </label>
                      <input
                        type="text"
                        value={documento.descricao}
                        onChange={(e) => updateDocumento(index, 'descricao', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ex: Relatório de Auditoria Especial"
                        required
                      />
                    </div>

                    {/* Upload de Arquivos */}
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-xs font-medium text-gray-600">
                          Upload de Arquivos
                        </label>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                          disabled={isUploading}
                        >
                          <RiUploadLine className="w-4" />
                          <span>{isUploading ? 'Enviando...' : 'Selecionar Arquivos'}</span>
                        </button>
                      </div>
                      
                      <div 
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                          isUploading 
                            ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg mx-auto mb-4">
                          <RiFileLine className="text-white text-xl" />
                        </div>
                        <p className="text-blue-600 font-medium mb-2">
                          {isUploading ? 'Enviando arquivos...' : 'Selecionar Arquivo'}
                        </p>
                        <p className="text-sm text-gray-500">Formatos suportados: PDF, DOC, DOCX, TXT, JSON</p>
                      </div>
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.json"
                        disabled={isUploading}
                      />

                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2 mt-4">
                          {uploadedFiles.map(file => (
                            <div key={file.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-3 flex-1">
                                <UploadStatusIcon status={file.status} />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>{formatFileSize(file.size)}</span>
                                    <span>{getUploadStatusText(file.status)}</span>
                                    {file.uuid && (
                                      <span className="text-green-600">UUID: {file.uuid}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                               {/* ✅ Botão de Retry - aparece apenas quando há erro */}
                              {file.status === 'error' && (
                                <button
                                  type="button"
                                  onClick={() => retryUpload(file.id)}
                                  className="text-blue-500 hover:text-blue-700 cursor-pointer"
                                  title="Tentar novamente"
                                >
                                  <RiRefreshLine className="w-4 h-4" />
                                </button>
                              )}
                              
                              {/* Botão de Delete */}
                              
                              <button
                                type="button"
                                onClick={() => onRemoveFile(file.id)}
                                className="text-red-500 hover:text-red-700 cursor-pointer ml-2"
                                disabled={file.status === 'uploading'}
                              >
                                <RiDeleteBinLine className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <div className="p-3 bg-white border border-gray-200 rounded-md">
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <RiInformationLine className="w-4 h-4" />
                          <span>
                            {documento.tipo === 'unico' 
                              ? `UUID: ${documento.uuid_unico || 'Será gerado automaticamente'}`
                              : `UUIDs Lista: ${documento.uuids_lista?.length || 0} arquivo(s)`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Prompt
          </label>
          <div className="relative">
            <button
              type="button"
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
              onClick={() => setShowVariableSelector(!showVariableSelector)}
              disabled={getAvailableVariables().length === 0}>
              <RiBracesLine className='w-4'/><span>Inserir Variável</span>
            </button>

            {showVariableSelector && getAvailableVariables().length > 0 && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
                <div className="p-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Clique para inserir:</p>
                  {getAvailableVariables().map(variable => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => insertVariableInPrompt(variable)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer text-gray-700 dark:text-gray-300"
                    >
                      <span className="font-mono text-blue-600 dark:text-blue-400">{`{${variable}}`}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <textarea
          ref={promptTextareaRef}
          value={formData.prompt}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Digite o prompt para este nó... Configure as entradas abaixo e use o botão 'Inserir Variável' para referenciar"
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Configure as entradas abaixo e use o botão "Inserir Variável" para referenciar dados no prompt
        </p>
      </div>

      {/* ✅ SEÇÃO: Entradas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Configurar Entradas
          </label>
          <button
            type="button"
            onClick={addEntrada}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
          >
            + Adicionar Entrada
          </button>
        </div>

        {formData.entradas.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-2">
              <i className="ri-download-line text-gray-400 text-xl"></i>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma entrada configurada</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">Adicione entradas para referenciar no prompt</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.entradas.map((entrada, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Entrada {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeEntrada(index)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Variável no Prompt
                    </label>
                    <input
                      type="text"
                      value={entrada.variavel_prompt}
                      onChange={(e) => updateEntrada(index, 'variavel_prompt', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      placeholder="ex: documento, analise"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Fonte dos Dados
                    </label>
                    <select
                      value={entrada.fonte}
                      onChange={(e) => updateEntrada(index, 'fonte', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                    >
                      <option value="documento_anexado">Documento Anexado</option>
                      <option value="saida_no_anterior">Saída de Nó Anterior</option>
                    </select>
                  </div>

                  {entrada.fonte === 'documento_anexado' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Documentos Anexados
                        </label>
                        <select
                          value={entrada.documento || ''}
                          onChange={(e) => updateEntrada(index, 'documento', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        >
                          <option value="">Selecione um documento anexado</option>
                          {documentosAnexados.map(doc => (
                            <option key={doc.chave} value={doc.chave}>
                              {doc.descricao} ({doc.chave})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                          <input
                            type="checkbox"
                            checked={entrada.processar_em_paralelo || false}
                            onChange={(e) => updateEntrada(index, 'processar_em_paralelo', e.target.checked)}
                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-600"
                          />
                          <span>Processar em paralelo</span>
                        </label>
                      </div>
                    </>
                  )}

                  {entrada.fonte === 'saida_no_anterior' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Nó de Origem
                      </label>
                      <select
                        value={entrada.no_origem || ''}
                        onChange={(e) => updateEntrada(index, 'no_origem', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        required
                      >
                        <option value="">Selecione o nó de origem</option>
                        {(state.nodes).map(node => (
                          <option key={node.id} value={node.nome}>
                            {node.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ SEÇÃO: Saída */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome da Saída
          </label>
          <input
            type="text"
            value={formData.saida.nome}
            onChange={(e) => updateSaida('nome', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="ex: analise_final"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Formato da Saída
          </label>
          <select
            value={formData.saida.formato}
            onChange={(e) => updateSaida('formato', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          data-testid="cancel-button"
          onClick={onCloseForm}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
        >
          Cancelar
        </button>
        <button
          type="submit"
          data-testid="submit-button"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          Criar Nó
        </button>
      </div>
    </form>
  );
}