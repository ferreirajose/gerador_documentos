import { Connection, useWorkflow } from '@/context/WorkflowContext';
import { useState, useCallback, useMemo } from 'react';

export interface ConnectionFormData {
  origem: string;
  destino: string;
}

export function useConnectionController() {
  const { 
    state,
    addConnection,
    deleteConnection,
    updateConnection,
  } = useWorkflow();
  
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<ConnectionFormData>({
    origem: '',
    destino: ''
  });

  // Obter nome do nó
  const getNodeName = useCallback((nodeId: string): string => {
    const node = state.nodes.find(n => n.id === nodeId);
    return node ? node.nome : 'Nó não encontrado';
  }, [state.nodes]);

  // Função para obter informações do tipo do nó (igual ao ListNode)
  const getNodeTypeInfo = useCallback((node: any) => {
    const hasInteracaoUsuario = node.interacao_com_usuario && 
        Object.keys(node.interacao_com_usuario).length > 0;

    // Critério 1: entrada_grafo = true E interacao_com_usuario habilitado
    if (node.entrada_grafo && hasInteracaoUsuario) {
        return {
            label: 'Entrada com Interação'
        };
    }
    
    // Critério 2: interacao_com_usuario habilitado (sem ser entrada_grafo)
    if (hasInteracaoUsuario) {
        return {
            label: 'Interativo'
        };
    }
    
    // Critério 3: entrada_grafo = true (apenas entrada)
    if (node.entrada_grafo) {
        return {
            label: 'Entrada'
        };
    }
    
    // Critério 4: Nenhum dos acima (processamento padrão)
    return {
        label: 'Processamento'
    };
  }, []);

  // Obter nós disponíveis para conexão
  const getAvailableNodes = useCallback((excludeNodeId?: string) => {
    return state.nodes.filter(node => node.id !== excludeNodeId);
  }, [state.nodes]);

  // Validar se pode conectar ao END
  const canConnectToEnd = useCallback((nodeId: string) => {
    const node = state.nodes.find(n => n.id === nodeId);
    
    if (!node) {
      return { canConnect: false, reason: 'Nó não encontrado' };
    }

    // Verificar se já existe conexão para END deste nó
    const hasEndConnection = state.connections.some(
      conn => conn.origem === nodeId && conn.destino === 'END'
    );

    if (hasEndConnection) {
      return { canConnect: false, reason: 'Já possui conexão final' };
    }

    // TODOS os nós podem conectar ao END (incluindo nós de entrada)
    return { canConnect: true, reason: 'Conexão válida para END' };
  }, [state.nodes, state.connections]);

  // Validar conexão
  const validateConnection = useCallback((origem: string, destino: string) => {
    const errors: string[] = [];

    if (!origem) errors.push('Selecione um nó de origem');
    if (!destino) errors.push('Selecione um nó de destino');

    if (origem && destino) {
      const origemNode = state.nodes.find(n => n.id === origem);
      const destinoNode = state.nodes.find(n => n.id === destino);
      const origemIsEntrada = origemNode?.entrada_grafo;
      const destinoIsEntrada = destinoNode?.entrada_grafo;
      
      // Não permitir conexão com si mesmo
      if (origem === destino && destino !== 'END') {
        errors.push('Não é possível conectar um nó a si mesmo');
      }

      // NOVA REGRA: Nós com entrada_grafo=true não podem conectar a outros nós com entrada_grafo=true
      if (origemIsEntrada && destinoIsEntrada && destino !== 'END') {
        errors.push('Nós do tipo entrada não podem se conectar entre si');
      }

      // Verificar se a conexão já existe
      const connectionExists = state.connections.some(
        conn => conn.origem === origem && 
                conn.destino === destino &&
                // Durante a edição, ignorar a própria conexão que está sendo editada
                conn.id !== editingConnection?.id
      );

      if (connectionExists) {
        errors.push('Esta conexão já existe');
      }

      // Validações específicas para END
      if (destino === 'END') {
        const endValidation = canConnectToEnd(origem);
        if (!endValidation.canConnect) {
          errors.push(endValidation.reason);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [state.nodes, state.connections, editingConnection, canConnectToEnd]);

  // Conexão de validação atual
  const connectionValidation = useMemo(() => {
    if (!formData.origem || !formData.destino) return null;
    return validateConnection(formData.origem, formData.destino);
  }, [formData.origem, formData.destino, validateConnection]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connectionValidation?.isValid) return;

    const newConnection: Connection = {
      id: editingConnection?.id || `conn-${Date.now()}`,
      origem: formData.origem,
      destino: formData.destino
    };

    if (editingConnection) {
      updateConnection(newConnection);
    } else {
      addConnection(newConnection);
    }

    handleCancel();
  }, [connectionValidation, editingConnection, formData, updateConnection, addConnection]);

  const handleCancel = useCallback(() => {
    setFormData({ origem: '', destino: '' });
    setEditingConnection(null);
    setShowCreateForm(false);
  }, []);

  const handleEdit = useCallback((connection: Connection) => {
    setFormData({
      origem: connection.origem,
      destino: connection.destino
    });
    setEditingConnection(connection);
    setShowCreateForm(true);
  }, []);

  const handleConnectToEnd = useCallback((nodeId: string) => {
    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
      origem: nodeId,
      destino: 'END'
    };
    addConnection(newConnection);
  }, [addConnection]);

  const removeConnection = useCallback((connectionId: string) => {
    deleteConnection(connectionId);
  }, [deleteConnection]);

  return {
    connections: state.connections,
    editingConnection,
    showCreateForm,
    formData,
    connectionValidation,
    nodes: state.nodes, // Adicionar nodes para o ConnectionsList
    
    // Setters
    setFormData,
    setShowCreateForm,
    
    // Actions
    removeConnection,
    
    // Handlers
    handleSubmit,
    handleCancel,
    handleEdit,
    handleConnectToEnd,
    
    // Helpers
    getNodeName,
    getNodeTypeInfo, // Alterar para getNodeTypeInfo
    getAvailableNodes,
    canConnectToEnd
  };
}