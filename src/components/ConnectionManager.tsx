import { useState, useMemo } from "react";

import { RiAddLine, RiInformationLine, RiCloseLine, RiErrorWarningLine, RiCheckLine, RiArrowRightLine, RiTimeLine, RiEditLine, RiDeleteBinLine, RiLink, RiSearchLine } from "@remixicon/react";

import { useWorkflow } from "@/context/WorkflowContext";
import WorkflowOutput from "./common/WorkflowOutput";

interface ConnectionFormData {
  fromNodeId: string;
  toNodeId: string;
}

interface EditingConnection {
  id: string;
  origem: string;
  destino: string;
}

export default function ConnectionManager() {
  const { state, addConnection, updateConnection, deleteConnection } = useWorkflow();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<EditingConnection | null>(null);
  const [formData, setFormData] = useState<ConnectionFormData>({
    fromNodeId: '',
    toNodeId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
    const [isWorkflowVisible, setIsWorkflowVisible] = useState(true); // ou false se quiser iniciar oculto


  // Funções auxiliares
  const getNodeName = (nodeId: string) => {
    const node = state.nodes.find(n => n.id === nodeId);
    return node ? node.nome : 'Nó não encontrado';
  };

  const getNodeType = (nodeId: string) => {
    const node = state.nodes.find(n => n.id === nodeId);
    return node ? node.categoria : null;
  };

  const getAvailableNodes = (excludeNodeId: string = '') => {
    return state.nodes.filter(node => node.id !== excludeNodeId);
  };

  const connectionExists = (fromNodeId: string, toNodeId: string) => {
    return state.connections.some(conn => 
      conn.origem === fromNodeId && conn.destino === toNodeId
    );
  };

    // Adicione esta função ao ConnectionManager.tsx
    const canConnectToEnd = (nodeId: string) => {
        const node = state.nodes.find(n => n.id === nodeId);
        if (!node) return false;
        
        // Verificar se este nó já está conectado ao END
        const alreadyConnectedToEnd = state.connections.some(
            conn => conn.origem === nodeId && conn.destino === 'END'
        );
        
        // Verificar se este nó tem conexões de saída
        const hasOutgoingConnections = state.connections.some(
            conn => conn.origem === nodeId
        );
        
        return !alreadyConnectedToEnd && hasOutgoingConnections;
    };

    // Adicione esta função para conectar ao END
    const handleConnectToEnd = (nodeId: string) => {
        const newConnection = {
            id: `conn-${Date.now()}`,
            origem: nodeId,
            destino: 'END'
        };
        addConnection(newConnection);
    };

    // Atualize a função isValidConnection para incluir validação de END
    const isValidConnection = () => {
        if (!formData.fromNodeId || !formData.toNodeId) return false;
        if (formData.fromNodeId === formData.toNodeId) return false;
        
        // Validação: nós de entrada não podem se conectar entre si
        const fromType = getNodeType(formData.fromNodeId);
        const toType = getNodeType(formData.toNodeId);
        if (fromType === 'entrada' && toType === 'entrada') return false;
        
        // Validação: não permitir conexões duplicadas (exceto quando estiver editando)
        if (!editingConnection && connectionExists(formData.fromNodeId, formData.toNodeId)) {
            return false;
        }
        
        return true;
    };

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidConnection()) return;

    if (editingConnection) {
      // Atualizar conexão existente
      updateConnection(editingConnection.id, formData.fromNodeId, formData.toNodeId);
    } else {
      // Criar nova conexão
      const newConnection = {
        id: `conn-${Date.now()}`,
        origem: formData.fromNodeId,
        destino: formData.toNodeId
      };
      addConnection(newConnection);
    }

    handleCancel();
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingConnection(null);
    setFormData({ fromNodeId: '', toNodeId: '' });
  };

  const handleEdit = (connection: EditingConnection) => {
    setEditingConnection(connection);
    setFormData({
      fromNodeId: connection.origem,
      toNodeId: connection.destino
    });
    setShowCreateForm(true);
  };

  // Filtrar conexões baseado no searchTerm
  const filteredConnections = useMemo(() => {
    if (!searchTerm) return state.connections;
    
    return state.connections.filter(connection => {
      const fromNodeName = getNodeName(connection.origem).toLowerCase();
      const toNodeName = getNodeName(connection.destino).toLowerCase();
      return fromNodeName.includes(searchTerm.toLowerCase()) || 
             toNodeName.includes(searchTerm.toLowerCase());
    });
  }, [state.connections, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Conexões</h2>
          <p className="text-gray-600 dark:text-gray-400">Configure as ligações entre os nós do workflow</p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          disabled={state.nodes.length < 2}
          data-testid="create-connection-button"
          className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap ${
            state.nodes.length < 2
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
          }`}
        >
          <RiAddLine />
          <span>Criar Conexão</span>
        </button>
      </div>

      {/* Info Alert */}
      {state.nodes.length < 2 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <RiInformationLine className="text-yellow-600 dark:text-yellow-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Nós insuficientes
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Você precisa de pelo menos 2 nós para criar conexões.
                Vá para a aba "Gerenciar Nós" e crie mais nós primeiro.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {state.connections.length > 0 && (
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4" />
          <input
            type="text"
            placeholder="Buscar conexões por nome do nó..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingConnection ? 'Editar Conexão' : 'Criar Nova Conexão'}
            </h3>
            <button
              onClick={handleCancel}
              data-testid="close-connection-form-button"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <RiCloseLine className="text-xl" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nó de Origem *
                </label>
                <select
                  required
                  value={formData.fromNodeId}
                  data-testid="from-node-select"
                  onChange={(e) => setFormData(prev => ({ ...prev, fromNodeId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Selecione o nó de origem</option>
                  {getAvailableNodes(formData.toNodeId).map(node => (
                    <option key={node.id} value={node.id}>
                      {node.nome} ({node.categoria === 'entrada' ? 'Entrada' : node.categoria === 'processamento' ? 'Processamento' : 'Saída'})
                    </option>
                  ))}
                </select>
              </div>


                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nó de Destino *
                </label>
                <select
                    required
                    value={formData.toNodeId}
                    data-testid="to-node-select"
                    onChange={(e) => setFormData(prev => ({ ...prev, toNodeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                    <option value="">Selecione o nó de destino</option>
                    {/* Opção END */}
                    <option value="END">END (Final do Workflow)</option>
                    {/* Nós disponíveis */}
                    {getAvailableNodes(formData.fromNodeId).map(node => (
                    <option key={node.id} value={node.id}>
                        {node.nome} ({node.categoria === 'entrada' ? 'Entrada' : node.categoria === 'processamento' ? 'Processamento' : 'Saída'})
                    </option>
                    ))}
                </select>
                </div>
            </div>

            {/* Validation Messages */}
            {formData.fromNodeId && formData.toNodeId && (
              <div className="space-y-2">
                {formData.fromNodeId === formData.toNodeId && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <RiErrorWarningLine className="text-red-600 dark:text-red-500" />
                      <span className="text-sm text-red-700 dark:text-red-300">
                        Um nó não pode se conectar a si mesmo
                      </span>
                    </div>
                  </div>
                )}

                {getNodeType(formData.fromNodeId) === 'entrada' && getNodeType(formData.toNodeId) === 'entrada' && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <RiErrorWarningLine className="text-red-600 dark:text-red-500" />
                      <span className="text-sm text-red-700 dark:text-red-300">
                        Nós de entrada não podem se conectar entre si
                      </span>
                    </div>
                  </div>
                )}

                {!editingConnection && connectionExists(formData.fromNodeId, formData.toNodeId) && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <RiErrorWarningLine className="text-red-600 dark:text-red-500" />
                      <span className="text-sm text-red-700 dark:text-red-300">
                        Esta conexão já existe
                      </span>
                    </div>
                  </div>
                )}

                {isValidConnection() && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <RiCheckLine className="text-green-600 dark:text-green-500" />
                      <span className="text-sm text-green-700 dark:text-green-300">
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
                data-testid="cancel-connection-form-button"
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isValidConnection()}
                data-testid="submit-connection-form-button"
                className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  isValidConnection()
                    ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                }`}
              >
                {editingConnection ? 'Atualizar' : 'Criar'} Conexão
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Connections List */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Conexões Criadas ({filteredConnections.length})
        </h3>
        
        
    </div>

    {filteredConnections.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredConnections.map((connection) => (
            <div key={connection.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <RiArrowRightLine className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getNodeName(connection.origem)} → {connection.destino === 'END' ? 'END' : getNodeName(connection.destino)}
                    </div>
                    
                    {/* Badge para conexões END */}
                    {connection.destino === 'END' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full dark:bg-purple-900/30 dark:text-purple-300">
                        Final
                        </span>
                    )}
                    </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                    <RiTimeLine className="w-4" />
                    <span>Criada em {new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {getNodeType(connection.origem) === 'entrada' ? 'Entrada' : 
                        getNodeType(connection.origem) === 'processamento' ? 'Processamento' : 'Saída'} → 
                        {connection.destino === 'END' ? 'END' : 
                        getNodeType(connection.destino) === 'entrada' ? 'Entrada' : 
                        getNodeType(connection.destino) === 'processamento' ? 'Processamento' : 'Saída'}
                    </span>
                    </div>
                </div>
                </div>

                <div className="flex items-center space-x-2">
                {/* Não permitir editar conexões END */}
                {connection.destino !== 'END' && (
                    <button
                    onClick={() => handleEdit(connection)}
                    data-testid={`edit-connection-${connection.id}-button`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    title="Editar conexão"
                    >
                    <RiEditLine className="w-4" />
                    </button>
                )}

                <button
                    onClick={() => deleteConnection(connection.id)}
                    data-testid={`delete-connection-${connection.id}-button`}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Excluir conexão"
                >
                    <RiDeleteBinLine className="w-4" />
                </button>
                
                {/* Botão para conectar ao END se for um nó final */}
                {connection.destino !== 'END' && canConnectToEnd(connection.origem) && (
                    <button
                    onClick={() => handleConnectToEnd(connection.origem)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                    title="Conectar ao END"
                    >
                    <RiCheckLine className="w-4" />
                    </button>
                )}
                </div>
            </div>
            </div>
        ))}
        </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <RiLink className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'Nenhuma conexão encontrada' : 'Nenhuma conexão criada'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos da busca' 
                : 'Comece criando sua primeira conexão entre nós'
              }
            </p>
            {state.nodes.length >= 2 && !searchTerm && !showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                data-testid="create-first-connection-button"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                Criar Primeira Conexão
              </button>
            )}
          </div>
        )}
      </div>

      
      {/* Output do Workflow - só mostra se houver nós */}
      {state.nodes.length > 0 && (
        <WorkflowOutput
          isWorkflowVisible={isWorkflowVisible}
          setIsWorkflowVisible={setIsWorkflowVisible}
        />
      )}

    </div>
  );
}