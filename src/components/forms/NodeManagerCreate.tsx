import { RiCloseLine, RiFileAddLine, RiFileListLine, RiRefreshLine, RiUploadLine } from "@remixicon/react";
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
        handleSaidaFormatoChange
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

    const documentosAnexados = [
        { chave: 'doc1', descricao: 'Documento de Auditoria' },
        { chave: 'doc2', descricao: 'Contrato de Serviço' },
        { chave: 'doc3', descricao: 'Relatório Financeiro' }
    ];

    // @TODO IMPLMENTAR PARA OBTER OS NODE DO ESTADO
    const nodes = [
        { id: '1', nome: 'Nó de Entrada' },
        { id: '2', nome: 'Nó de Processamento' },
        { id: '3', nome: 'Nó de Saída' }
    ];

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
                                + Inserir Variável
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
                                                value={entrada.fonte}
                                                onChange={(e) => updateEntrada(index, 'fonte', e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 dark:bg-gray-600 dark:text-white"
                                            >
                                                <option value="documento_anexado">Documento Anexado</option>
                                                <option value="saida_no_anterior">Saída de Nó Anterior</option>
                                            </select>
                                        </div>

                                        {entrada.fonte === 'documento_anexado' && (
                                            <>
                                                <div id="input-documento-anexados">
                                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                        Documentos Anexados
                                                    </label>
                                                    <select
                                                        value={entrada.documento || ''}
                                                        onChange={(e) => updateEntrada(index, 'documento', e.target.value)}
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
                                        
                                        {/* @TODO VERIFICAR, QUANDO SELECIONAR UM VALOR O CAMPO SELECT DESAPARECE */}
                                        {entrada.fonte === 'saida_no_anterior' && (
                                            <div id="input-fonte">
                                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                    Nó de fonte
                                                </label>
                                                <select
                                                    value={entrada.no_origem || ''}
                                                    onChange={(e) => updateEntrada(index, 'no_origem', e.target.value)}
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
                    <div>
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

                    {formData.categoria === 'saida' && (
                        <div>
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