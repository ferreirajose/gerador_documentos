'use client';

import { useState } from 'react';
import { 
  RiNodeTree, 
  RiAddLine,
  RiSearchLine,
  RiCloseLine,
  RiBrainLine,
  RiTimeLine,
  RiFileTextLine,
  RiEditLine,
  RiDeleteBinLine,
  RiRecordCircleLine,
  RiCpuLine,
  RiLoginCircleLine
} from '@remixicon/react';

interface Node {
  id: string;
  name: string;
  type: 'entry' | 'process' | 'end';
  llmModel?: string;
  prompt?: string;
  createdAt: Date;
}

interface NodeManagerProps {
  nodes: Node[];
  onCreate: (node: Omit<Node, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Node>) => void;
  onDelete: (id: string) => void;
}

const nodeTypes = [
  { value: 'entry', label: 'Entrada', icon: RiLoginCircleLine, color: 'bg-green-500' },
  { value: 'process', label: 'Processamento', icon: RiCpuLine, color: 'bg-blue-500' },
  { value: 'end', label: 'Fim', icon: RiRecordCircleLine, color: 'bg-red-500' },
];

const llmModels = [
  { value: 'claude-3.7-sonnet', label: 'Claude 3.7 Sonnet' },
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'gemini-pro', label: 'Gemini Pro' },
];

export default function NodeManager({ nodes, onCreate, onUpdate, onDelete }: NodeManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    type: 'process' as 'entry' | 'process' | 'end',
    llmModel: 'claude-3.7-sonnet',
    prompt: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'process',
      llmModel: 'claude-3.7-sonnet',
      prompt: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingNode) {
      onUpdate(editingNode.id, formData);
      setEditingNode(null);
    } else {
      onCreate(formData);
      setShowCreateForm(false);
    }

    resetForm();
  };

  const handleEdit = (node: Node) => {
    setEditingNode(node);
    setFormData({
      name: node.name,
      type: node.type,
      llmModel: node.llmModel || 'claude-3.7-sonnet',
      prompt: node.prompt || '',
    });
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingNode(null);
    resetForm();
  };

  const filteredNodes = nodes.filter(node => {
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
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'entry' | 'process' | 'end' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {nodeTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div data-testid="node-llm-model">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Modelo LLM
                </label>
                <select
                  data-testid="node-llm-model-select"
                  value={formData.llmModel}
                  onChange={(e) => setFormData(prev => ({ ...prev, llmModel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {llmModels.map(model => (
                    <option key={model.value} value={model.value}>{model.label}</option>
                  ))}
                </select>
              </div>
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
                        <IconComponent className="text-white text-xl" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{node.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            node.type === 'entry' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            node.type === 'process' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {typeInfo.label}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          {node.llmModel && (
                            <div className="flex items-center space-x-1">
                              <RiBrainLine />
                              <span>{llmModels.find(m => m.value === node.llmModel)?.label}</span>
                            </div>
                          )}

                          <div className="flex items-center space-x-1">
                            <RiTimeLine />
                            <span>{node.createdAt.toLocaleDateString()}</span>
                          </div>

                          {node.prompt && (
                            <div className="flex items-center space-x-1">
                              <RiFileTextLine />
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
                        <RiEditLine />
                      </button>

                      <button
                        onClick={() => onDelete(node.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Excluir nó"
                      >
                        <RiDeleteBinLine />
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
              <RiNodeTree className="text-2xl text-gray-400" />
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
    </div>
  );
}