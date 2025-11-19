import NodeEntitie from '@/domain/entities/NodeEntitie';
import { Aresta } from '@/domain/entities/Aresta';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DocumentoAnexado } from '@/domain/entities/Workflow';
import { FormatoResultadoFinal, Combinacao } from '@/domain/entities/ResultadoFinal'; 
import { Grafo } from '@/domain/entities/Grafo';
import { Workflow } from '@/domain/entities/Workflow';

export interface NodeState extends Omit<NodeEntitie, 'validate'> {
  id: string;
}

export interface Connection extends Aresta {
  id: string;
}

// Adicionar interface para mensagens do chat
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
export interface ChatState {
  messages: ChatMessage[];
  inputValue: string;
  isChatOpen: boolean;
}

export interface WorkflowState {
  nodes: NodeState[];
  connections: Connection[];
  documentos_anexados: DocumentoAnexado[];
  formato_resultado_final?: FormatoResultadoFinal;
  chat: ChatState; // Novo estado do chat
}

// Atualize os tipos de ação
export type WorkflowAction =
  | { type: 'ADD_NODE'; payload: NodeState }
  | { type: 'UPDATE_NODE'; payload: NodeState }
  | { type: 'DELETE_NODE'; payload: { nodeId: string, chavesDocumentos?: string[] } }
  | { type: 'ADD_DOCUMENTO_ANEXO'; payload: DocumentoAnexado }
  | { type: 'REMOVE_DOCUMENTOS_POR_CHAVE'; payload: string[] }
  | { type: 'ADD_CONNECTION'; payload: Connection }
  | { type: 'UPDATE_CONNECTION'; payload: Connection }
  | { type: 'DELETE_CONNECTION'; payload: { connectionId: string } }
  | { type: 'UPDATE_RESULTADO_FINAL'; payload: { combinacoes: Combinacao[], saidas_individuais: string[] } }
  | { type: 'RESET_WORKFLOW' }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CHAT_INPUT_VALUE'; payload: string }
  | { type: 'SET_CHAT_OPEN'; payload: boolean }
  | { type: 'CLEAR_CHAT_MESSAGES' }
  | { type: 'SET_CHAT_MESSAGES'; payload: ChatMessage[] };


export const initialState: WorkflowState = {
  nodes: [],
  connections: [],
  documentos_anexados: [],
  formato_resultado_final: new FormatoResultadoFinal([], []),
  chat: {
    messages: [],
    inputValue: '',
    isChatOpen: false
  }
};

export function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'ADD_NODE':
      return {
        ...state,
        nodes: [...state.nodes, action.payload]
      };

    case 'UPDATE_NODE': 
      return {
        ...state,
        nodes: state.nodes.map(node => 
          node.id === action.payload.id ? action.payload : node
        ),
        // Remover documentos duplicados baseado na chave
        documentos_anexados: state.documentos_anexados.filter((doc, index, self) => 
          index === self.findIndex(d => d.chave === doc.chave)
        )
    };

    case 'DELETE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter(node => node.id !== action.payload.nodeId)
      };

    case 'ADD_DOCUMENTO_ANEXO':
      return {
        ...state,
        documentos_anexados: [...state.documentos_anexados, action.payload]
      };

    // Ação para remover documentos por chave
    case 'REMOVE_DOCUMENTOS_POR_CHAVE':
      return {
        ...state,
        documentos_anexados: state.documentos_anexados.filter(
          doc => !action.payload.includes(doc.chave)
        )
      };

    case 'ADD_CONNECTION':
      return {
        ...state,
        connections: [...state.connections, action.payload]
      };

    case 'UPDATE_CONNECTION':
      return {
        ...state,
        connections: state.connections.map(conn =>
          conn.id === action.payload.id ? action.payload : conn
        )
      };

    case 'DELETE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter(conn => conn.id !== action.payload.connectionId)
      };
    
    case 'UPDATE_RESULTADO_FINAL':
      return {
        ...state,
        formato_resultado_final: new FormatoResultadoFinal(
          action.payload.combinacoes, 
          action.payload.saidas_individuais
        )
      }

    case 'RESET_WORKFLOW':
      return {
        ...initialState
      }

     // Novos casos para o chat
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chat: {
          ...state.chat,
          messages: [...state.chat.messages, action.payload]
        }
      };

    case 'SET_CHAT_INPUT_VALUE':
      return {
        ...state,
        chat: {
          ...state.chat,
          inputValue: action.payload
        }
      };

    case 'SET_CHAT_OPEN':
      return {
        ...state,
        chat: {
          ...state.chat,
          isChatOpen: action.payload
        }
      };

    case 'CLEAR_CHAT_MESSAGES':
      return {
        ...state,
        chat: {
          ...state.chat,
          messages: []
        }
      };

    case 'SET_CHAT_MESSAGES':
      return {
        ...state,
        chat: {
          ...state.chat,
          messages: action.payload
        }
      };

    default:
      return state;
  }
}

interface WorkflowContextType {
  state: WorkflowState;
  dispatch: React.Dispatch<WorkflowAction>;
  // Node actions
  addNode: (node: NodeState) => void;
  updateNode: (node: NodeState) => void;
  deleteNode: (nodeId: string, chavesDocumentos?: string[]) => void;
  addDocumentoAnexo: (node: DocumentoAnexado) => void;
  removeDocumentosPorChave: (chaves: string[]) => void;
  // Connection actions
  addConnection: (connection: Connection) => void;
  updateConnection: (connection: Connection) => void;
  deleteConnection: (connectionId: string) => void;
  updateResultadoFinal: (combinacoes: Combinacao[], saidas_individuais: string[]) => void;
   // Chat actions
  addChatMessage: (message: ChatMessage) => void;
  setChatInputValue: (value: string) => void;
  setChatOpen: (isOpen: boolean) => void;
  clearChatMessages: () => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  // WORKFLOW
  resetWorkflow: () => void;
  getWorkflowJSON: () => string;
  validateWorkflow: () => { isValid: boolean; errors: string[] };
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  const addNode = (node: NodeState) => {
    dispatch({ type: 'ADD_NODE', payload: { ...node, id: node.id } });
  };

  const updateNode = (node: NodeState) => { 
    dispatch({ type: 'UPDATE_NODE', payload: node });
  };

  const deleteNode = (nodeId: string, chavesDocumentos?: string[]) => {
    // Primeiro remove o nó
    dispatch({ type: 'DELETE_NODE', payload: { nodeId, chavesDocumentos } });
    
    // Se houver chaves de documentos para remover, remove os documentos também
    if (chavesDocumentos && chavesDocumentos.length > 0) {
      dispatch({ type: 'REMOVE_DOCUMENTOS_POR_CHAVE', payload: chavesDocumentos });
    }
  };

  const removeDocumentosPorChave = (chaves: string[]) => {
    dispatch({ type: 'REMOVE_DOCUMENTOS_POR_CHAVE', payload: chaves });
  };
  
  const addDocumentoAnexo = (documento: DocumentoAnexado) => {
    dispatch({ type: 'ADD_DOCUMENTO_ANEXO', payload: { ...documento} });
  };

  const addConnection = (connection: Connection) => {
    dispatch({ type: 'ADD_CONNECTION', payload: connection });
  };

  const updateConnection = (connection: Connection) => {
    dispatch({ type: 'UPDATE_CONNECTION', payload: connection });
  };

  const deleteConnection = (connectionId: string) => {
    dispatch({ type: 'DELETE_CONNECTION', payload: { connectionId } });
  };

   const updateResultadoFinal = (combinacoes: Combinacao[], saidas_individuais: string[]) => {
    dispatch({ 
      type: 'UPDATE_RESULTADO_FINAL', 
      payload: { combinacoes, saidas_individuais } 
    });
  };

  const resetWorkflow = () => {
    dispatch({ type: 'RESET_WORKFLOW' });
  };

  // Novas funções para o chat
  const addChatMessage = (message: ChatMessage) => {
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message });
  };

  const setChatInputValue = (value: string) => {
    dispatch({ type: 'SET_CHAT_INPUT_VALUE', payload: value });
  };

  const setChatOpen = (isOpen: boolean) => {
    dispatch({ type: 'SET_CHAT_OPEN', payload: isOpen });
  };

  const clearChatMessages = () => {
    dispatch({ type: 'CLEAR_CHAT_MESSAGES' });
  };

  const setChatMessages = (messages: ChatMessage[]) => {
    dispatch({ type: 'SET_CHAT_MESSAGES', payload: messages });
  };

  const getWorkflowJSON = (): string => {
    try {
      // Convert NodeState[] to NodeEntitie[]
      const nodes: NodeEntitie[] = state.nodes.map(node => 
        new NodeEntitie(
          node.nome,
          node.prompt,
          node.entrada_grafo,
          node.saida,
          node.interacao_com_usuario,
          node.entradas,
          node.modelo_llm,
          node.temperatura,
          node.ferramentas
        )
      );

      // Validar todos os nós (incluindo nomes únicos)
      nodes.forEach((node, index, allNodes) => {
        // Passar todos os nodes exceto o atual para validação de nome único
        const otherNodes = allNodes.filter((_, i) => i !== index);
        node.validate(otherNodes);
      });

      // Converter connections (IDs) para Aresta[] (nomes)
      const edges: Aresta[] = state.connections.map(connection => {
        // Encontrar o nó de origem pelo ID para obter o nome
        const origemNode = state.nodes.find(node => node.id === connection.origem);
        if (!origemNode) {
          throw new Error(`Nó de origem não encontrado para ID: ${connection.origem}`);
        }

        // Se for END, usar "END" como destino, senão encontrar o nó de destino
        let destinoNome = connection.destino;
        if (connection.destino !== 'END') {
          // Tenta encontrar o nó de destino primeiro por ID, depois por nome
          const destinoNode = state.nodes.find(node => node.id === connection.destino || node.nome === connection.destino);

          if (!destinoNode) {
            throw new Error(`Nó de destino não encontrado para ID: ${connection.destino}`);
          }

          // Garante que estamos usando o nome do nó para criar a Aresta
          destinoNome = destinoNode.nome;
        }

        return new Aresta(origemNode.nome, destinoNome);
      });

      // Create graph with actual edges
      const grafo = new Grafo(nodes, edges);

      // Create workflow
      const workflow = new Workflow(
        state.documentos_anexados,
        grafo,
        state.formato_resultado_final
      );

      return workflow.toJsonString();
    } catch (error) {
      console.error('Error generating workflow JSON:', error);
      return JSON.stringify({ error: 'Failed to generate workflow JSON' }, null, 2);
    }
  };

  const validateWorkflow = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    try {
      // Convert NodeState[] to NodeEntitie[]
      const nodes: NodeEntitie[] = state.nodes.map(node => 
        new NodeEntitie(
          node.nome,
          node.prompt,
          node.entrada_grafo,
          node.saida,
          node.interacao_com_usuario,
          node.entradas,
          node.modelo_llm,
          node.temperatura,
          node.ferramentas
        )
      );

      // Validar todos os nós (incluindo nomes únicos)
      nodes.forEach((node, index, allNodes) => {
        try {
          const otherNodes = allNodes.filter((_, i) => i !== index);
          node.validate(otherNodes);
        } catch (error) {
          if (error instanceof Error) {
            errors.push(error.message);
          }
        }
      });

      // Converter connections (IDs) para Aresta[] (nomes)
      const edges: Aresta[] = state.connections.map(connection => {
        // Encontrar o nó de origem pelo ID para obter o nome
        const origemNode = state.nodes.find(node => node.id === connection.origem);
        if (!origemNode) {
          throw new Error(`Nó de origem não encontrado para ID: ${connection.origem}`);
        }

        // Se for END, usar "END" como destino, senão encontrar o nó de destino
        let destinoNome = connection.destino;
        if (connection.destino !== 'END') {
          // Tenta encontrar o nó de destino primeiro por ID, depois por nome
          const destinoNode = state.nodes.find(node => node.id === connection.destino || node.nome === connection.destino);

          if (!destinoNode) {
            throw new Error(`Nó de destino não encontrado para ID: ${connection.destino}`);
          }

          // Garante que estamos usando o nome do nó para criar a Aresta
          destinoNome = destinoNode.nome;
        }

        return new Aresta(origemNode.nome, destinoNome);
      });

      // Create graph with actual edges
      const grafo = new Grafo(nodes, edges);

      // Create workflow
      const workflow = new Workflow(
        state.documentos_anexados,
        grafo,
        state.formato_resultado_final
      );

      // Validate the workflow
      workflow.validate();
      
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message);
      } else {
        errors.push('Ocorreu um erro de validação desconhecido.');
      }
    }

    // Validações adicionais específicas para o estado do React
    if (state.nodes.length === 0) {
      errors.push('O Worflow de trabalho deve conter pelo menos um nó.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const value: WorkflowContextType = {
    state,
    dispatch,
    addNode,
    updateNode,
    deleteNode,
    removeDocumentosPorChave,
    addDocumentoAnexo,
    
    addConnection,
    deleteConnection,
    updateConnection,
    updateResultadoFinal,
    // Adicionar as novas funções do chat
    addChatMessage,
    setChatInputValue,
    setChatOpen,
    clearChatMessages,
    setChatMessages,
    // WORKFLOW
    resetWorkflow,
    getWorkflowJSON,
    validateWorkflow
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}