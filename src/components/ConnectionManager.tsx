
import { useState } from 'react';

import { 
  RiAddLine,
  RiSearchLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiCheckLine,
  RiTimeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiInformationLine,
  RiArrowRightLine,
  RiLink
} from '@remixicon/react';


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

interface ConnectionManagerProps {
  nodes: Node[];
  connections: Connection[];
  onCreate: (connection: Omit<Connection, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Connection>) => void;
  onDelete: (id: string) => void;
}

export default function ConnectionManager({ 
  nodes, 
  connections, 
  onCreate, 
  onUpdate, 
  onDelete 
}: ConnectionManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    fromNodeId: '',
    toNodeId: '',
  });

  const resetForm = () => {
    setFormData({
      fromNodeId: '',
      toNodeId: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingConnection) {
      onUpdate(editingConnection.id, formData);
      setEditingConnection(null);
    } else {
      onCreate(formData);
      setShowCreateForm(false);
    }
    
    resetForm();
  };

  const handleEdit = (connection: Connection) => {
    setEditingConnection(connection);
    setFormData({
      fromNodeId: connection.fromNodeId,
      toNodeId: connection.toNodeId,
    });
    setShowCreateForm(true);
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingConnection(null);
    resetForm();
  };

  const getNodeName = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.name : 'Nó não encontrado';
  };

  const getAvailableNodes = (excludeId?: string) => {
    return nodes.filter(node => node.id !== excludeId);
  };

  const filteredConnections = connections.filter(connection => {
    const fromNodeName = getNodeName(connection.fromNodeId);
    const toNodeName = getNodeName(connection.toNodeId);
    const searchLower = searchTerm.toLowerCase();
    
    return fromNodeName.toLowerCase().includes(searchLower) ||
           toNodeName.toLowerCase().includes(searchLower);
  });

  const connectionExists = (fromId: string, toId: string) => {
    return connections.some(conn => 
      conn.fromNodeId === fromId && conn.toNodeId === toId
    );
  };

  const isValidConnection = () => {
    if (!formData.fromNodeId || !formData.toNodeId) return false;
    if (formData.fromNodeId === formData.toNodeId) return false;
    
    if (!editingConnection) {
      return !connectionExists(formData.fromNodeId, formData.toNodeId);
    }
    
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Conexões</h2>
          <p className="text-gray-600">Configure as ligações entre os nós do workflow</p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={nodes.length < 2}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap ${
            nodes.length < 2
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {/* <i className="ri-add-line"></i> */}
          <RiAddLine />
          <span>Criar Conexão</span>
        </button>
      </div>

      {/* Info Alert */}
      {nodes.length < 2 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            {/* <i className="ri-information-line text-yellow-600 mt-0.5"></i>
             */}
             <RiInformationLine className="text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Nós insuficientes
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Você precisa de pelo menos 2 nós para criar conexões. 
                Vá para a aba "Gerenciar Nós" e crie mais nós primeiro.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar conexões
            </label>
            <div className="relative">
              {/* <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i> */}
              {<RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome dos nós ou descrição..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingConnection ? 'Editar Conexão' : 'Criar Nova Conexão'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {/* <i className="ri-close-line text-xl"></i> */}
              <RiCloseLine className="text-xl" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nó de Origem *
                </label>
                <select
                  required
                  value={formData.fromNodeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromNodeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione o nó de origem</option>
                  {getAvailableNodes(formData.toNodeId).map(node => (
                    <option key={node.id} value={node.id}>
                      {node.name} ({node.type === 'entry' ? 'Entrada' : node.type === 'process' ? 'Processamento' : 'Fim'})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nó de Destino *
                </label>
                <select
                  required
                  value={formData.toNodeId}
                  onChange={(e) => setFormData(prev => ({ ...prev, toNodeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione o nó de destino</option>
                  {getAvailableNodes(formData.fromNodeId).map(node => (
                    <option key={node.id} value={node.id}>
                      {node.name} ({node.type === 'entry' ? 'Entrada' : node.type === 'process' ? 'Processamento' : 'Fim'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição da Conexão
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o que é passado entre estes nós..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
             */}
            {/* Validation Messages */}
            {formData.fromNodeId && formData.toNodeId && (
              <div className="space-y-2">
                {formData.fromNodeId === formData.toNodeId && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      {/* <i className="ri-error-warning-line text-red-600"></i> */}
                      <RiErrorWarningLine className="text-red-600" />
                      <span className="text-sm text-red-700">
                        Um nó não pode se conectar a si mesmo
                      </span>
                    </div>
                  </div>
                )}
                
                {!editingConnection && connectionExists(formData.fromNodeId, formData.toNodeId) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      {/* <i className="ri-error-warning-line text-red-600"></i> */}
                      <RiErrorWarningLine className="text-red-600" />
                      <span className="text-sm text-red-700">
                        Esta conexão já existe
                      </span>
                    </div>
                  </div>
                )}
                
                {isValidConnection() && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      {/* <i className="ri-check-line text-green-600"></i> */}
                      <RiCheckLine className="text-green-600" />
                      <span className="text-sm text-green-700">
                        Conexão válida: {getNodeName(formData.fromNodeId)} → {getNodeName(formData.toNodeId)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isValidConnection()}
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  isValidConnection()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {editingConnection ? 'Atualizar' : 'Criar'} Conexão
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Connections List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Conexões Criadas ({filteredConnections.length})
          </h3>
        </div>
        
        {filteredConnections.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredConnections.map((connection) => (
              <div key={connection.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          {/* <i className="ri-arrow-right-line text-blue-600"></i> */}
                          <RiArrowRightLine className="text-blue-600" />
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {getNodeName(connection.fromNodeId)} → {getNodeName(connection.toNodeId)}
                        </div>
                      </div>
                    </div>
                    
                    {/* {connection.description && (
                      <p className="text-gray-600 mb-3">{connection.description}</p>
                    )} */}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        {/* <i className="ri-time-line"></i> */}
                        <RiTimeLine />
                        <span>Criada em {connection.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(connection)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar conexão"
                    >
                      {/* <i className="ri-edit-line"></i> */}
                      <RiEditLine />
                    </button>
                    
                    <button
                      onClick={() => onDelete(connection.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir conexão"
                    >
                      {/* <i className="ri-delete-bin-line"></i> */}
                      <RiDeleteBinLine />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {/* <i className="ri-link text-2xl text-gray-400"></i> */}
              <RiLink className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conexão encontrada</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : nodes.length < 2
                ? 'Crie pelo menos 2 nós antes de fazer conexões'
                : 'Comece criando sua primeira conexão entre nós'
              }
            </p>
            {nodes.length >= 2 && !searchTerm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Criar Primeira Conexão
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
