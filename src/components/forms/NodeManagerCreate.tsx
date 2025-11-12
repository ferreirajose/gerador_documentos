import { RiBracesLine, RiCloseLine, RiFileAddLine, RiFileListLine, RiRefreshLine, RiUploadLine } from "@remixicon/react";
import { useNodeManagerController } from "@/hooks/useNodeManagerController";
import { formatFileSize } from "@/libs/util";
import { useWorkflow } from "@/context/WorkflowContext";

interface NodeManagerCreateProps {
    onClose?: () => void;
    onSubmit?: (formData: any) => void;
}

export default function NodeManagerCreate({ onClose, onSubmit }: NodeManagerCreateProps) {
    const {
        formData,
        showVariableSelector,
        promptTextareaRef,
        fileInputRef,
        modelos,
        ferramentasDisponiveis,
        setShowVariableSelector,
        getAvailableVariables,
        addEntrada,
        removeEntrada,
        updateEntrada,
        addDocumento,
        removeDocumento,
        updateDocumento,
        handleFileUpload,
        removeArquivo,
        retryUpload,
        insertVariableInPrompt,
        handleSubmit,
        handleInputChange,
        handleFerramentaChange,
        resetForm,
        handleSaidaFormatoChange,
        handleInteracaoUsuarioChange,
        handleChangeInteractions,
        toggleInteracaoUsuario
    } = useNodeManagerController();

    const { state } = useWorkflow();

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(e);
        onSubmit?.(formData);
    };

    const handleCancel = () => {
        resetForm(); // Limpa os campos do formulário
        onClose?.(); // Fecha o formulário
    };

    const documentosAnexados = formData.documentosAnexados.map(doc => ({
        chave: doc.chave,
        descricao: doc.descricao
    }))

    // @TODO ALTERA PARA PEGAR O NODE DO formData IGUAL A documentosAnexados
    const nodes = state.nodes.map(node => ({
        id: node.id,
        nome: node.nome
    }))

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Criar Novo Nó
                </h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <RiCloseLine className="text-xl" />
                </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Primeira linha - 2 colunas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="input-name-node">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome do Nó
                        </label>
                        <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    <div id="input-categoria">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Categoria
                        </label>
                        <select
                            value={formData.categoria}
                            onChange={(e) => handleInputChange('categoria', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="entrada">Entrada</option>
                            <option value="processamento">Processamento</option>
                            <option value="saida">Saída</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Modelos LLM */}
                    <div id="input-modelo-llm">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Modelo LLM
                        </label>
                        <select
                            value={formData.modelo_llm}
                            onChange={(e) => handleInputChange('modelo_llm', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 dark:bg-gray-700 dark:text-white"
                        >
                            {Object.entries(modelos).map(([providerKey, provider]) => (
                                <optgroup key={providerKey} label={provider.name}>
                                    {provider.models.map(model => (
                                        <option key={model.value} value={model.value}>
                                            {model.label}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    {/* Temperatura */}
                    <div id="input-temperatura">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nível de Criatividade ({formData.temperatura})
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={formData.temperatura}
                            onChange={(e) => handleInputChange('temperatura', parseFloat(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Mais preciso</span>
                            <span>Mais criativo</span>
                        </div>
                    </div>
                </div>

                {/* Ferramentas - Checkboxes */}
                <div id="input-tools">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Ferramentas
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ferramentasDisponiveis.map(ferramenta => (
                            <label key={ferramenta.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.ferramentas.includes(ferramenta.value)}
                                    onChange={(e) => handleFerramentaChange(ferramenta.value, e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{ferramenta.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Entrada de Grafo - Checkboxes */}
                <div id="input-graph">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Informe se o Nó sera um  Entrada de Grafo.
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.entrada_grafo}
                                onChange={(e) => handleInputChange('entrada_grafo', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Entrada de Grafo</span>
                        </label>

                    </div>
                </div>

                {/* Prompt - largura total */}
                <div id="input-text-prompt">
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Prompt
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowVariableSelector(!showVariableSelector)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 whitespace-nowrap disabled:bg-green-400 disabled:cursor-not-allowed"
                                disabled={getAvailableVariables().length === 0}
                            >
                                <span><RiBracesLine className="h-4 mr-2" /></span> Inserir Variável
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
                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded cursor-pointer"
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
                        onChange={(e) => handleInputChange('prompt', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Digite o prompt para este nó... Configure as entradas abaixo e use o botão 'Inserir Variável' para referenciar"
                        required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Configure as entradas abaixo e use o botão "Inserir Variável" para referenciar dados no prompt
                    </p>
                </div>

                {/* Seção de Documentos Anexados */}
                <div id="input-documentos-anexados">
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Documentos Anexados
                        </label>
                        <button
                            type="button"
                            onClick={addDocumento}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
                        >
                            + Adicionar Documento
                        </button>
                    </div>

                    {formData.documentosAnexados.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                            <RiFileListLine className="text-3xl text-gray-400 mb-2" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum documento anexado</p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs">Clique em "Adicionar Documento" para começar</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formData.documentosAnexados.map((documento, index) => (
                                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Documento {index + 1}</h4>
                                        <button
                                            type="button"
                                            onClick={() => removeDocumento(index)}
                                            className="text-red-500 hover:text-red-700 cursor-pointer"
                                        >
                                            <RiCloseLine className="text-lg" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Chave do Documento
                                            </label>
                                            <input
                                                type="text"
                                                value={documento.chave}
                                                onChange={(e) => updateDocumento(index, 'chave', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                                                placeholder="ex: auditoria_especial"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Tipo
                                            </label>
                                            <div className="flex items-center space-x-4">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name={`tipo-${index}`}
                                                        checked={documento.tipo === 'unico'}
                                                        onChange={() => updateDocumento(index, 'tipo', 'unico')}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-600"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Único</span>
                                                </label>
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        name={`tipo-${index}`}
                                                        checked={documento.tipo === 'lista'}
                                                        onChange={() => updateDocumento(index, 'tipo', 'lista')}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-600"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">Lista</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Descrição do Documento
                                            </label>
                                            <input
                                                type="text"
                                                value={documento.descricao}
                                                onChange={(e) => updateDocumento(index, 'descricao', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                                                placeholder="ex: Relatório de Auditoria Especial"
                                                required
                                            />
                                        </div>

                                        {/* Upload de Arquivos */}
                                        <div className="md:col-span-2">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    Upload de Arquivos
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex items-center space-x-1"
                                                >
                                                    <RiUploadLine />
                                                    <span>Selecionar Arquivos</span>
                                                </button>
                                            </div>

                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            >
                                                <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg mx-auto mb-4">
                                                    <RiFileAddLine className="text-white text-xl" />
                                                </div>
                                                <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">Selecionar Arquivo</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Formatos suportados: PDF, DOC, DOCX, TXT, JSON</p>
                                            </div>

                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple={documento.tipo === 'lista'}
                                                onChange={(e) => handleFileUpload(e, index)}
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.txt,.json"
                                            />

                                            {documento.arquivos.length > 0 && (
                                                <div className="space-y-2 mt-4">
                                                    {documento.arquivos.map(arquivo => (
                                                        <div key={arquivo.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-600 p-3 rounded-lg">
                                                            <div className="flex items-center space-x-3">
                                                                <i className={`ri-file-line ${arquivo.status === 'completed' ? 'text-green-500' :
                                                                    arquivo.status === 'uploading' ? 'text-blue-500' :
                                                                        arquivo.status === 'error' ? 'text-red-500' : 'text-gray-500'
                                                                    }`}></i>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{arquivo.name}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {formatFileSize(arquivo.size)} •
                                                                        <span className={
                                                                            arquivo.status === 'completed' ? 'text-green-600' :
                                                                                arquivo.status === 'uploading' ? 'text-blue-600' :
                                                                                    arquivo.status === 'error' ? 'text-red-600' : 'text-gray-600'
                                                                        }>
                                                                            {arquivo.status === 'completed' ? ' Concluído' :
                                                                                arquivo.status === 'uploading' ? ' Enviando...' :
                                                                                    arquivo.status === 'error' ? ' Erro' : ' Pendente'}
                                                                            {arquivo.uuid && ` • UUID: ${arquivo.uuid}`}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {arquivo.status === 'error' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => retryUpload(index, arquivo.id)}
                                                                        className="text-blue-500 hover:text-blue-700 cursor-pointer"
                                                                        title="Tentar novamente"
                                                                    >
                                                                        <RiRefreshLine className="w-4" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeArquivo(index, arquivo.id)}
                                                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                                                >
                                                                    <RiCloseLine className="text-lg" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Configuração de Entradas */}
                <div id="input-entrada">
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Configurar Entradas
                        </label>
                        <button
                            type="button"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
                            onClick={addEntrada}
                        >
                            + Adicionar Entrada
                        </button>
                    </div>

                    {formData.entradas.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma entrada configurada</p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs">Clique em "Adicionar Entrada" para começar</p>
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
                                            className="text-red-500 hover:text-red-700 cursor-pointer"
                                        >
                                            <RiCloseLine className="text-lg" />
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
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                                                placeholder="ex: auditoria, defesa"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                fonte dos Dados
                                            </label>
                                            <select
                                                value={entrada.origem}
                                                onChange={(e) => updateEntrada(index, 'origem', e.target.value as "documento_anexado" | "resultado_no_anterior")}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 dark:bg-gray-600 dark:text-white"
                                            >
                                                <option value="documento_anexado">Documento Anexado</option>
                                                <option value="resultado_no_anterior">Saída de Nó Anterior</option>
                                            </select>
                                        </div>

                                        {entrada.origem === 'documento_anexado' && (
                                            <>
                                                <div id="input-documento-anexados">
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                        Documentos Anexados
                                                    </label>
                                                    <select
                                                        value={entrada.chave_documento_origem || ''}
                                                        onChange={(e) => updateEntrada(index, 'chave_documento_origem', e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 dark:bg-gray-600 dark:text-white"
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
                                                            checked={entrada.executar_em_paralelo || false}
                                                            onChange={(e) => updateEntrada(index, 'executar_em_paralelo', e.target.checked)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-600"
                                                        />
                                                        <span>Processar em paralelo</span>
                                                    </label>
                                                </div>
                                            </>
                                        )}

                                        {entrada.origem === 'resultado_no_anterior' && (
                                            <div id="input-fonte">
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                    Lista de Nós
                                                </label>
                                                <select
                                                    value={entrada.nome_no_origem || ''}
                                                    onChange={(e) => updateEntrada(index, 'nome_no_origem', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 dark:bg-gray-600 dark:text-white"
                                                    required
                                                >
                                                    <option value="">Selecione o nó de fonte</option>
                                                    {nodes.map(node => (
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

                {/* Saída - 2 colunas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="input-name-output">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome da Saída
                        </label>
                        <input
                            type="text"
                            value={formData.saida.nome}
                            onChange={(e) => handleInputChange('saida', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Nome da variável de saída"
                            required
                        />
                    </div>

                    <div id="input-output-format">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Formato da Saída
                        </label>
                        <select
                            value={formData.saida.formato || 'json'}
                            onChange={(e) => handleSaidaFormatoChange(e.target.value as "json" | "markdown")}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="json">JSON</option>
                            <option value="markdown">Markdown</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Escolha o formato de saída para este nó
                        </p>
                    </div>

                </div>

                {/* Interação do Usuário */}
                <div id="input-interacao-usuario">
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Interação do Usuário
                        </label>
                        <button
                            type="button"
                            onClick={toggleInteracaoUsuario}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.interacao_com_usuario.habilitado
                                ? 'bg-blue-600'
                                : 'bg-gray-200 dark:bg-gray-600'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.interacao_com_usuario.habilitado
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {formData.interacao_com_usuario.habilitado && (
                        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Permitir Usuário Finalizar */}
                                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.interacao_com_usuario.permitir_usuario_finalizar}
                                        onChange={(e) => handleInteracaoUsuarioChange('permitir_usuario_finalizar', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-600"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Permitir usuário finalizar
                                    </span>
                                </div>

                                {/* IA Pode Concluir */}
                                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.interacao_com_usuario.ia_pode_concluir}
                                        onChange={(e) => handleInteracaoUsuarioChange('ia_pode_concluir', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-600"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        IA pode concluir automaticamente
                                    </span>
                                </div>

                                {/* Requer Aprovação Explícita */}
                                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.interacao_com_usuario.requer_aprovacao_explicita}
                                        onChange={(e) => handleInteracaoUsuarioChange('requer_aprovacao_explicita', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-600"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Requer aprovação explícita
                                    </span>
                                </div>

                                {/* Máximo de Interações */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Máximo de Interações
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.interacao_com_usuario.maximo_de_interacoes}
                                        onChange={handleChangeInteractions}
                                        onBlur={handleChangeInteractions}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Número máximo de interações permitidas (1-10)
                                    </p>
                                    {formData.interacao_com_usuario.maximo_de_interacoes > 10 && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                            Valor máximo permitido: 10 interações
                                        </p>
                                    )}
                                </div>

                                {/* Modo de Saída */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        Modo de Saída
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <label className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                            <input
                                                type="radio"
                                                name="modo_saida"
                                                checked={formData.interacao_com_usuario.modo_de_saida === 'ultima_mensagem'}
                                                onChange={() => handleInteracaoUsuarioChange('modo_de_saida', 'ultima_mensagem')}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Última Mensagem</span>
                                        </label>
                                        <label className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                            <input
                                                type="radio"
                                                name="modo_saida"
                                                checked={formData.interacao_com_usuario.modo_de_saida === 'historico_completo'}
                                                onChange={() => handleInteracaoUsuarioChange('modo_de_saida', 'historico_completo')}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Histórico Completo</span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Define qual conteúdo será retornado como saída
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!formData.interacao_com_usuario.habilitado && (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Interação com usuário desativada
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-xs">
                                Ative o toggle para configurar a interação com o usuário
                            </p>
                        </div>
                    )}
                </div>

                {/* Botão de submit */}
                <div className="flex space-x-3 justify-end pt-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Criar Nó
                    </button>
                </div>
            </form>
        </div>
    );
}