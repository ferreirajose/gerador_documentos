// hooks/useConnectionController.ts
import { useState, useMemo } from "react";
import { Aresta } from "@/domain/entities/Aresta";
import { Grafo } from "@/domain/entities/Grafo";
import NodeEntitie from "@/domain/entities/NodeEntitie";
import { useWorkflow } from "@/context/WorkflowContext";

export interface ConnectionFormData {
  origem: string;
  destino: string;
}

export interface EditingConnection {
  id: string;
  origem: string;
  destino: string;
}

export interface ConnectionValidation {
  isValid: boolean;
  errors: string[];
}

export interface EndConnectionSuggestion {
  nodeId: string;
  nodeName: string;
  reason: string;
}

export function useConnectionController() {
  const { state, addConnection, updateConnection, deleteConnection } = useWorkflow();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<EditingConnection | null>(null);
  const [formData, setFormData] = useState<ConnectionFormData>({
    origem: '',
    destino: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Converter nodes do estado para entidades de domínio
  const convertToDomainNodes = (): NodeEntitie[] => {
    return state.nodes.map(node => 
      new NodeEntitie(
        node.nome,
        node.categoria as 'entrada' | 'processamento' | 'saida',
        node.prompt,
        node.saida,
        node.entradas || [],
        node.modelo_llm,
        node.temperatura,
        node.ferramentas || []
      )
    );
  };

  // Obter nome do nó pelo ID
  const getNodeName = (nodeId: string) => {
    const node = state.nodes.find(n => n.id === nodeId);
    return node ? node.nome : 'Nó não encontrado';
  };

  // Obter tipo do nó pelo ID
  const getNodeType = (nodeId: string) => {
    const node = state.nodes.find(n => n.id === nodeId);
    return node ? node.categoria : null;
  };

  // Obter nós disponíveis (excluindo um específico)
  const getAvailableNodes = (excludeNodeId: string = '') => {
    return state.nodes.filter(node => node.id !== excludeNodeId);
  };

  // Verificar se conexão já existe
  const connectionExists = (origem: string, destino: string) => {
    const origemNome = getNodeName(origem);
    const destinoNome = destino === 'END' ? 'END' : getNodeName(destino);
    
    return state.connections.some(conn => {
      const connOrigemNome = getNodeName(conn.origem);
      const connDestinoNome = conn.destino === 'END' ? 'END' : getNodeName(conn.destino);
      
      return connOrigemNome === origemNome && connDestinoNome === destinoNome;
    });
  };

  // Detecção de ciclos
  const createsCycle = (origem: string, destino: string): boolean => {
    if (destino === 'END') return false;
    
    const visited = new Set<string>();
    const stack: string[] = [destino];
    
    while (stack.length > 0) {
      const current = stack.pop()!;
      const currentNome = getNodeName(current);
      const origemNome = getNodeName(origem);
      
      if (currentNome === origemNome) {
        return true;
      }
      
      if (!visited.has(currentNome)) {
        visited.add(currentNome);
        
        const outgoingConnections = state.connections.filter(
          conn => conn.origem === current && conn.destino !== 'END'
        );
        
        outgoingConnections.forEach(conn => {
          const destinoNome = getNodeName(conn.destino);
          if (!visited.has(destinoNome)) {
            stack.push(conn.destino);
          }
        });
      }
    }
    
    return false;
  };

  // Validação de conexão
  const isValidConnection = (): ConnectionValidation => {
    const errors: string[] = [];

    if (!formData.origem || !formData.destino) {
      errors.push('Origem e destino são obrigatórios');
      return { isValid: false, errors };
    }

    if (formData.origem === formData.destino) {
      errors.push('Um nó não pode se conectar a si mesmo');
      return { isValid: false, errors };
    }

    try {
      const domainNodes = convertToDomainNodes();
      
      // ✅ CORREÇÃO: Usar nomes dos nós para criar a aresta
      const origemNome = getNodeName(formData.origem);
      const destinoNome = formData.destino === 'END' ? 'END' : getNodeName(formData.destino);
      
      const aresta = new Aresta(origemNome, destinoNome);
      aresta.validate(domainNodes);

      // Detecção de ciclos
      if (formData.destino !== 'END' && createsCycle(formData.origem, formData.destino)) {
        errors.push('Esta conexão criaria um ciclo no workflow');
      }

      // Validações específicas do formulário
      if (!editingConnection && connectionExists(formData.origem, formData.destino)) {
        errors.push('Esta conexão já existe');
      }

      // Validar categorias
      const origemNode = state.nodes.find(n => n.id === formData.origem);
      const destinoNode = state.nodes.find(n => n.id === formData.destino);

      if (origemNode && destinoNode) {
        // ✅ REGRA ADICIONADA: Nós de entrada não podem se conectar entre si
        if (origemNode.categoria === 'entrada' && destinoNode.categoria === 'entrada') {
          errors.push('Nós de entrada não podem se conectar entre si');
        }

        // Nós de saída só podem conectar ao END
        if (origemNode.categoria === 'saida' && formData.destino !== 'END') {
          errors.push('Nós de saída só podem conectar ao END');
        }

        // Nós de entrada não podem receber conexões (exceto se for END)
        if (destinoNode.categoria === 'entrada' && formData.destino !== 'END') {
          errors.push('Nós de entrada não podem receber conexões de outros nós');
        }
      }

      return { 
        isValid: errors.length === 0, 
        errors 
      };

    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Erro de validação');
      return { isValid: false, errors };
    }
  };

  // Validação de workflow completo
  const validateWorkflow = (): ConnectionValidation => {
    try {
      const domainNodes = convertToDomainNodes();
      
      // ✅ CORREÇÃO: Converter conexões usando nomes dos nós
      const domainArestas = state.connections.map(conn => {
        const origemNome = getNodeName(conn.origem);
        const destinoNome = conn.destino === 'END' ? 'END' : getNodeName(conn.destino);
        return new Aresta(origemNome, destinoNome);
      });

      const grafo = new Grafo(domainNodes, domainArestas);
      grafo.validate();

      return { isValid: true, errors: [] };
    } catch (error) {
      return { 
        isValid: false, 
        errors: [error instanceof Error ? error.message : 'Erro na validação do workflow'] 
      };
    }
  };

  // Validação de conexão ao END
  const canConnectToEnd = (origem: string): { canConnect: boolean; reason?: string } => {
    const node = state.nodes.find(n => n.id === origem);
    if (!node) {
      return { canConnect: false, reason: 'Nó não encontrado' };
    }

    // Verificar se já está conectado ao END
    const alreadyConnectedToEnd = state.connections.some(
      conn => conn.origem === origem && conn.destino === 'END'
    );

    if (alreadyConnectedToEnd) {
      return { canConnect: false, reason: 'Já conectado ao END' };
    }

    // Nós de saída devem conectar ao END
    if (node.categoria === 'saida') {
      return { canConnect: true, reason: 'Nó de saída deve finalizar no END' };
    }

    // Nós de entrada podem conectar ao END se forem os únicos
    if (node.categoria === 'entrada') {
      const hasOtherConnections = state.connections.some(
        conn => conn.origem === origem && conn.destino !== 'END'
      );
      
      if (!hasOtherConnections) {
        return { canConnect: true, reason: 'Nó de entrada isolado pode finalizar no END' };
      }
    }

    // Nós de processamento podem conectar ao END se não tiverem outras saídas
    const hasOtherOutgoingConnections = state.connections.some(
      conn => conn.origem === origem && conn.destino !== 'END'
    );

    if (!hasOtherOutgoingConnections) {
      return { canConnect: true, reason: 'Nó sem outras saídas pode finalizar no END' };
    }

    return { 
      canConnect: false, 
      reason: 'Nó já tem conexões de saída para outros nós' 
    };
  };

  // Sugestões de conexão ao END
  const getEndConnectionSuggestions = (): EndConnectionSuggestion[] => {
    const suggestions: EndConnectionSuggestion[] = [];
    
    state.nodes.forEach(node => {
      const validation = canConnectToEnd(node.id);
      
      if (validation.canConnect) {
        suggestions.push({
          nodeId: node.id,
          nodeName: node.nome,
          reason: validation.reason || 'Pode conectar ao END'
        });
      }
    });
    
    return suggestions;
  };

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = isValidConnection();
    if (!validation.isValid) {
      alert(`Erros de validação:\n${validation.errors.join('\n')}`);
      return;
    }

    try {
      const domainNodes = convertToDomainNodes();
      
      // ✅ CORREÇÃO: Usar nomes dos nós para criar a aresta
      const origemNome = getNodeName(formData.origem);
      const destinoNome = formData.destino === 'END' ? 'END' : getNodeName(formData.destino);
      
      const aresta = new Aresta(origemNome, destinoNome);
      aresta.validate(domainNodes);

      if (editingConnection) {
        updateConnection(editingConnection.id, formData.origem, formData.destino);
      } else {
        const newConnection = {
          id: `conn-${Date.now()}`,
          origem: formData.origem,
          destino: formData.destino
        };
        addConnection(newConnection);
      }

      handleCancel();

    } catch (error) {
      console.error('❌ Erro ao criar conexão:', error);
      alert(`Erro ao criar conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleConnectToEnd = (origem: string) => {
    const validation = canConnectToEnd(origem);
    
    if (!validation.canConnect) {
      alert(`Não é possível conectar ao END: ${validation.reason}`);
      return;
    }

    try {
      const domainNodes = convertToDomainNodes();
      const origemNome = getNodeName(origem);
      const aresta = new Aresta(origemNome, 'END');
      aresta.validate(domainNodes);

      const newConnection = {
        id: `conn-${Date.now()}`,
        origem: origem,
        destino: 'END'
      };
      
      addConnection(newConnection);
      
    } catch (error) {
      console.error('❌ Erro ao conectar ao END:', error);
      alert(`Erro ao conectar ao END: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingConnection(null);
    setFormData({ origem: '', destino: '' });
  };

  const handleEdit = (connection: EditingConnection) => {
    setEditingConnection(connection);
    setFormData({
      origem: connection.origem,
      destino: connection.destino
    });
    setShowCreateForm(true);
  };

  // Filtrar conexões
  const filteredConnections = useMemo(() => {
    if (!searchTerm) return state.connections;
    
    return state.connections.filter(connection => {
      const fromNodeName = getNodeName(connection.origem).toLowerCase();
      const toNodeName = getNodeName(connection.destino).toLowerCase();
      return fromNodeName.includes(searchTerm.toLowerCase()) || 
             toNodeName.includes(searchTerm.toLowerCase());
    });
  }, [state.connections, searchTerm]);

  return {
    // State
    state,
    showCreateForm,
    editingConnection,
    formData,
    searchTerm,
    filteredConnections,
    
    // Functions
    getNodeName,
    getNodeType,
    getAvailableNodes,
    isValidConnection,
    validateWorkflow,
    canConnectToEnd,
    getEndConnectionSuggestions,
    handleSubmit,
    handleConnectToEnd,
    handleCancel,
    handleEdit,
    deleteConnection,
    
    // Setters
    setShowCreateForm,
    setFormData,
    setSearchTerm,
  };
}