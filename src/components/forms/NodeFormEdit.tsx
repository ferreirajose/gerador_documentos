// NodeFormEdit.tsx (atualizado)
import { useState, useEffect, useRef } from 'react';
import { RiBracesLine } from "@remixicon/react";
import { FERRAMENTAS_DISPONIVEIS } from '@/data/ferramentas';
import { llmModelsByProvider } from '@/data/llmodels';
import { WorkflowState, NodeState } from '@/context/WorkflowContext';

interface NodeFormEditProps {
  state: WorkflowState;
  onCloseForm: () => void;
  initialData?: NodeState;
  onSave?: (data: Partial<NodeState>) => void;
}

export function NodeFormEdit({ state, onCloseForm, initialData, onSave }: NodeFormEditProps) {
  // Estado do formulário inicializado com os dados do nó sendo editado
  const [formData, setFormData] = useState<NodeState>(() => ({
    id: '',
    nome: '',
    categoria: 'processamento' as 'entrada' | 'processamento' | 'saida',
    prompt: '',
    modelo_llm: '',
    temperatura: 0.3,
    ferramentas: [],
    saida: {
      nome: '',
      formato: 'markdown' as 'markdown' | 'json'
    },
    entradas: [],
    ...initialData // Sobrescreve com os dados iniciais se fornecidos
  }));

  const [showVariableSelector, setShowVariableSelector] = useState(false);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Atualiza o formData quando initialData muda
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        nome: initialData.nome || '',
        categoria: initialData.categoria || 'processamento',
        prompt: initialData.prompt || '',
        modelo_llm: initialData.modelo_llm || '',
        temperatura: initialData.temperatura || 0.3,
        ferramentas: initialData.ferramentas || [],
        saida: {
          nome: initialData.saida?.nome || '',
          formato: initialData.saida?.formato || 'markdown'
        },
        entradas: initialData.entradas || []
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Dados a serem salvos:', formData); // Debug
  if (onSave) {
    onSave(formData); // Isso deve passar o NodeState completo
  }
};

  // Função para obter variáveis disponíveis para inserção no prompt
  const getAvailableVariables = () => {
    return formData.entradas.map(entrada => entrada.variavel_prompt).filter(Boolean);
  };

  // Função para inserir variável no prompt
  const insertVariableInPrompt = (variable: string) => {
    const textarea = promptTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const variableText = `{${variable}}`;

    const newPrompt = formData.prompt.substring(0, start) + variableText + formData.prompt.substring(end);
    
    setFormData({
      ...formData,
      prompt: newPrompt
    });

    setShowVariableSelector(false);
    
    // Foca e posiciona o cursor após a variável inserida
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variableText.length, start + variableText.length);
    }, 0);
  };

  // Função para manipular mudança nas ferramentas
  const handleFerramentaChange = (ferramentaValue: string) => {
    const currentFerramentas = formData.ferramentas || [];
    const newFerramentas = currentFerramentas.includes(ferramentaValue)
      ? currentFerramentas.filter(f => f !== ferramentaValue)
      : [...currentFerramentas, ferramentaValue];

    setFormData({
      ...formData,
      ferramentas: newFerramentas
    });
  };

  // Função para adicionar nova entrada
  const addEntrada = () => {
    const novaEntrada = {
      variavel_prompt: '',
      fonte: 'documento_anexado' as 'documento_anexado' | 'saida_no_anterior',
      documento: '',
      no_origem: '',
      processar_em_paralelo: false
    };

    setFormData({
      ...formData,
      entradas: [...formData.entradas, novaEntrada]
    });
  };

  // Função para remover entrada
  const removeEntrada = (index: number) => {
    const novasEntradas = formData.entradas.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      entradas: novasEntradas
    });
  };

  // Função para atualizar entrada
  const updateEntrada = (index: number, field: string, value: any) => {
    const novasEntradas = [...formData.entradas];
    novasEntradas[index] = {
      ...novasEntradas[index],
      [field]: value
    };

    setFormData({
      ...formData,
      entradas: novasEntradas
    });
  };

  // Função para atualizar saída
  const updateSaida = (field: string, value: any) => {
    setFormData({
      ...formData,
      saida: {
        ...formData.saida,
        [field]: value
      }
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Nó
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: AnalisadorContrato"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={formData.categoria}
            onChange={(e) => setFormData({
              ...formData,
              categoria: e.target.value as "entrada" | "processamento" | "saida"
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
          >
            <option value="entrada">Entrada</option>
            <option value="processamento">Processamento</option>
            <option value="saida">Saída</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modelo LLM
          </label>
          <select
            value={formData.modelo_llm}
            onChange={(e) => setFormData({ ...formData, modelo_llm: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
          >
            <option value="">Selecione um modelo</option>
            {Object.entries(llmModelsByProvider).map(([providerKey, provider]) => (
              <optgroup
                key={providerKey}
                label={provider.name}
                className="text-gray-700 bg-gray-50"
              >
                {provider.models.map(model => (
                  <option key={model.value} value={model.value} className="py-2">
                    {model.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperatura ({formData.temperatura})
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
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Mais preciso</span>
            <span>Mais criativo</span>
          </div>
        </div>
      </div>

      {/* ✅ SEÇÃO: Ferramentas */}
      <div data-testid="node-tools">
        <label className="block text-sm font-medium text-gray-700 mb-3">
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
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label
                htmlFor={`ferramenta-${ferramenta.value}`}
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                {ferramenta.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Prompt
          </label>
          <div className="relative">
            <button
              type="button"
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
              onClick={() => setShowVariableSelector(!showVariableSelector)}
              disabled={getAvailableVariables().length === 0}
            >
              <RiBracesLine className='w-4' />
              <span>Inserir Variável</span>
            </button>

            {showVariableSelector && getAvailableVariables().length > 0 && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                <div className="p-2">
                  <p className="text-xs text-gray-500 mb-2">Clique para inserir:</p>
                  {getAvailableVariables().map(variable => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => insertVariableInPrompt(variable)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <span className="font-mono text-blue-600">{`{${variable}}`}</span>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite o prompt para este nó... Configure as entradas abaixo e use o botão 'Inserir Variável' para referenciar"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Configure as entradas abaixo e use o botão "Inserir Variável" para referenciar dados no prompt
        </p>
      </div>

      {/* ✅ SEÇÃO: Entradas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
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
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg mx-auto mb-2">
              <i className="ri-download-line text-gray-400 text-xl"></i>
            </div>
            <p className="text-gray-500 text-sm">Nenhuma entrada configurada</p>
            <p className="text-gray-400 text-xs">Adicione entradas para referenciar no prompt</p>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.entradas.map((entrada, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Entrada {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeEntrada(index)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Variável no Prompt
                    </label>
                    <input
                      type="text"
                      value={entrada.variavel_prompt}
                      onChange={(e) => updateEntrada(index, 'variavel_prompt', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ex: documento, analise"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Fonte dos Dados
                    </label>
                    <select
                      value={entrada.fonte}
                      onChange={(e) => updateEntrada(index, 'fonte', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    >
                      <option value="documento_anexado">Documento Anexado</option>
                      <option value="saida_no_anterior">Saída de Nó Anterior</option>
                    </select>
                  </div>

                  {entrada.fonte === 'documento_anexado' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Documento
                        </label>
                        <select
                          value={entrada.documento || ''}
                          onChange={(e) => updateEntrada(index, 'documento', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                        >
                          <option value="">Selecione um documento</option>
                          <option value="auditoria">Documentos de auditoria</option>
                          <option value="defesas">Documentos de defesa</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center space-x-2 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={entrada.processar_em_paralelo || false}
                            onChange={(e) => updateEntrada(index, 'processar_em_paralelo', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span>Processar em paralelo</span>
                        </label>
                      </div>
                    </>
                  )}

                  {entrada.fonte === 'saida_no_anterior' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nó de Origem
                      </label>
                      <select
                        value={entrada.no_origem || ''}
                        onChange={(e) => updateEntrada(index, 'no_origem', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                        required
                      >
                        <option value="">Selecione o nó de origem</option>
                        {state.nodes
                          .filter(node => node.id !== formData.id) // Excluir o próprio nó
                          .map(node => (
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Saída
          </label>
          <input
            type="text"
            value={formData.saida.nome}
            onChange={(e) => updateSaida('nome', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ex: analise_final"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Formato da Saída
          </label>
          <select
            value={formData.saida.formato}
            onChange={(e) => updateSaida('formato', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
          >
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          data-testid="cancel-button"
          onClick={onCloseForm}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          Cancelar
        </button>
        <button
          type="submit"
          data-testid="submit-button"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          Salvar Alterações
        </button>
      </div>
    </form>
  );
}