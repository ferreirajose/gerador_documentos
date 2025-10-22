import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { WorkflowBuilder } from '../application/builders/WorkflowBuilder';
import { Node } from '@/types/nodes';
import { formatAgentName } from '@/libs/util';
import { InputType } from '@/domain/entities/NodeEntitie';


export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  createdAt: Date;
  workflowData?: any;
}

export interface WorkflowState {
  nodes: Node[];
  connections: Connection[];
  isExecuting: boolean;
  executionResults: any;
  executionLogs: any[];
  selectedFile: any[]
}

// Ações
type WorkflowAction =
  | { type: 'ADD_NODE'; payload: Omit<Node, 'id' | 'createdAt'> }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<Node> } }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'ADD_CONNECTION'; payload: Omit<Connection, 'id' | 'createdAt'> }
  | { type: 'UPDATE_CONNECTION'; payload: { id: string; updates: Partial<Connection> } }
  | { type: 'DELETE_CONNECTION'; payload: string }
  | { type: 'SET_EXECUTION_STATE'; payload: boolean }
  | { type: 'SET_EXECUTION_RESULTS'; payload: any }
  | { type: 'ADD_EXECUTION_LOG'; payload: any }
  | { type: 'CLEAR_EXECUTION_LOGS' }
  | { type: 'RESET_WORKFLOW' }
  | { type: 'SET_SELECTED_FILE'; payload: any[] | null } // ✅ MUDANÇA: Agora aceita array


// Estado inicial
const initialState: WorkflowState = {
  nodes: [],
  connections: [],
  isExecuting: false,
  executionResults: null,
  executionLogs: [],
  selectedFile: []
};

// Reducer
function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'ADD_NODE':
      const newNode: Node = {
        ...action.payload,
        id: `node_${Date.now()}`,
        createdAt: new Date(),
      };
      return {
        ...state,
        nodes: [...state.nodes, newNode],
      };

    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map(node =>
          node.id === action.payload.id ? { ...node, ...action.payload.updates } : node
        ),
      };

    case 'DELETE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter(node => node.id !== action.payload),
        connections: state.connections.filter(
          conn => conn.fromNodeId !== action.payload && conn.toNodeId !== action.payload
        ),
      };

    case 'ADD_CONNECTION':
      const newConnection: Connection = {
        ...action.payload,
        id: `conn_${Date.now()}`,
        createdAt: new Date(),
      };
      return {
        ...state,
        connections: [...state.connections, newConnection],
      };

    case 'UPDATE_CONNECTION':
      return {
        ...state,
        connections: state.connections.map(conn =>
          conn.id === action.payload.id ? { ...conn, ...action.payload.updates } : conn
        ),
      };

    case 'DELETE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter(conn => conn.id !== action.payload),
      };

    case 'SET_EXECUTION_STATE':
      return {
        ...state,
        isExecuting: action.payload,
      };

    case 'SET_EXECUTION_RESULTS':
      return {
        ...state,
        executionResults: action.payload,
      };

    case 'ADD_EXECUTION_LOG':
      return {
        ...state,
        executionLogs: [...state.executionLogs, action.payload],
      };

    case 'CLEAR_EXECUTION_LOGS':
      return {
        ...state,
        executionLogs: [],
      };

    case 'RESET_WORKFLOW':
      return {
        ...initialState,
      };
    case 'SET_SELECTED_FILE':
      return {
        ...state,
        selectedFile: action.payload || [],
      };

    default:
      return state;
  }
}

// Context
const WorkflowContext = createContext<{
  state: WorkflowState;
  dispatch: React.Dispatch<WorkflowAction>;
  // Métodos auxiliares
  createNode: (nodeData: Omit<Node, 'id' | 'createdAt'>) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  deleteNode: (id: string) => void;
  createConnection: (connectionData: Omit<Connection, 'id' | 'createdAt'>) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;
  setExecuting: (isExecuting: boolean) => void;
  setResults: (results: any) => void;
  addLog: (log: any) => void;
  clearLogs: () => void;
  resetWorkflow: () => void;
  // Métodos do WorkflowBuilder
  buildCompleteWorkflow: () => any;
  getNodeWorkflowData: (nodeId: string) => any;
  getConnectionWorkflowData: (connectionId: string) => any;

  getAvailableDocumentKeys: () => any;
  getAvailableOutputKeys: () => any;
  // NOVOS métodos para arquivo selecionado
  setSelectedFile: (objFile: []) => void;
  clearSelectedFile: () => void;
} | null>(null);

// Provider
interface WorkFlowProviderProps {
  children: ReactNode;
}

export function WorkFlowProvider({ children }: WorkFlowProviderProps) {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  // Métodos auxiliares
  const createNode = (nodeData: Omit<Node, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_NODE', payload: nodeData });
  };

  const updateNode = (id: string, updates: Partial<Node>) => {
    dispatch({ type: 'UPDATE_NODE', payload: { id, updates } });
  };

  const deleteNode = (id: string) => {
    dispatch({ type: 'DELETE_NODE', payload: id });
  };

  const createConnection = (connectionData: Omit<Connection, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_CONNECTION', payload: connectionData });
  };

  const updateConnection = (id: string, updates: Partial<Connection>) => {
    dispatch({ type: 'UPDATE_CONNECTION', payload: { id, updates } });
  };

  const deleteConnection = (id: string) => {
    dispatch({ type: 'DELETE_CONNECTION', payload: id });
  };

  const setExecuting = (isExecuting: boolean) => {
    dispatch({ type: 'SET_EXECUTION_STATE', payload: isExecuting });
  };

  const setResults = (results: any) => {
    dispatch({ type: 'SET_EXECUTION_RESULTS', payload: results });
  };

  const addLog = (log: any) => {
    dispatch({ type: 'ADD_EXECUTION_LOG', payload: log });
  };

  const clearLogs = () => {
    dispatch({ type: 'CLEAR_EXECUTION_LOGS' });
  };

  const resetWorkflow = () => {
    dispatch({ type: 'RESET_WORKFLOW' });
  };

  // NOVOS métodos para arquivo selecionado
  const setSelectedFile = (file: File | null) => {
    dispatch({ type: 'SET_SELECTED_FILE', payload: file });
  };

  const clearSelectedFile = () => {
    dispatch({ type: 'SET_SELECTED_FILE', payload: null });
  };

  // Função auxiliar para validar tipos de entrada
  const isValidInputType = (type: string): type is InputType => {
    return ['buscar_documento', 'id_da_defesa', 'do_estado', 'lista_de_origem'].includes(type);
  };

  // WorkflowContext.tsx - método buildCompleteWorkflow
  const buildCompleteWorkflow = () => {
    const builder = new WorkflowBuilder();
    
    // Configurar ponto de entrada
    const entryNodes = state.nodes.filter(node => node.type === 'entry');
    
    if (entryNodes.length > 0) {
      const documentos: Record<string, any> = {};
      
      entryNodes.forEach((entryNode) => {
        const nodeName = formatAgentName(entryNode.name);

        if (state.selectedFile && state.selectedFile.length > 0) {
          // NOVA LÓGICA: Verificar configuração de múltiplos arquivos do nó
          const shouldUseAsList = entryNode.workflowData?.isMultipleFiles === true;
          
          if (shouldUseAsList) {
            // LISTA: Para múltiplos arquivos - pega TODOS os UUIDs
            documentos[nodeName] = state.selectedFile
              .map((item: any) => item.uuid)
              .filter((uuid: string) => uuid); // Filtra UUIDs válidos
            
          } else {
            // ÚNICO: Para arquivo único - pega apenas o PRIMEIRO UUID
            documentos[nodeName] = state.selectedFile[0]?.uuid || '';
          }
        }
      });

      if (Object.keys(documentos).length > 0) {
        builder.setDocumentos(documentos);
      }
    }

    // Configurar ponto de entrada
    if (entryNodes.length > 0) {
      builder.setPontoDeEntrada(entryNodes.map(node => formatAgentName(node.name)));
    }

    // Adicionar todos os nós
    state.nodes.forEach(node => {
      const nodeData = node.workflowData || {};
      const agentName = formatAgentName(node.name);
      const nodeName = formatAgentName(node.name);

      const nodeBuilder = builder.addNode(nodeName)
        .setAgent(agentName)
        .setModel(node.llmModel || 'o3')
        .setPrompt(node.prompt || '')
        .setOutputKey(`workflow_data.${nodeName}`);
      
      // Adicionar entradas se existirem no nodeData
      if (nodeData.entradas && typeof nodeData.entradas === 'object') {
        Object.entries(nodeData.entradas).forEach(([nomeCampo, definicao]) => {
          if (definicao && typeof definicao === 'object') {
            Object.entries(definicao).forEach(([tipo, referencia]) => {
              if (isValidInputType(tipo) && referencia) {
                nodeBuilder.addEntrada(nomeCampo, tipo as InputType, `doc.${referencia}` as string);
              }
            });
          }
        });
      }

      nodeBuilder.endNode();
    });
    
    // Adicionar todas as conexões usando NOMES dos nós
    state.connections.forEach(connection => {
      const fromNode = state.nodes.find(n => n.id === connection.fromNodeId);
      const toNode = state.nodes.find(n => n.id === connection.toNodeId);
      
      if (fromNode && toNode) {
        builder.addEdge(formatAgentName(fromNode.name), formatAgentName(toNode.name));
      }
    });

    // Configurar template de saída
    const outputTemplate = state.nodes.map(node => 
      `{workflow_data.${formatAgentName(node.name)}}\n\n`
    ).join('').trimEnd();

    builder.setModificarSaida('relatorio_final', outputTemplate);

    // Gerar o workflow JSON
    const workflowJson = builder.toJSON();

    return workflowJson;
  };
  
  const getNodeWorkflowData = (nodeId: string) => {
    const node = state.nodes.find(n => n.id === nodeId);
    return node?.workflowData || null;
  };

  const getConnectionWorkflowData = (connectionId: string) => {
    const connection = state.connections.find(c => c.id === connectionId);
    return connection?.workflowData || null;
  };

  // Método para obter as chaves disponíveis dos documentos
const getAvailableDocumentKeys = () => {
  const entryNodes = state.nodes.filter(node => node.type === 'entry');
  const documentKeys: string[] = [];
  
  entryNodes.forEach((entryNode) => {
    const nodeName = formatAgentName(entryNode.name);
    documentKeys.push(nodeName);
  });
  
  return documentKeys;
};

const getAvailableOutputKeys = () => {
  const outputKeys: string[] = [];
  
  state.nodes.forEach(node => {
    const nodeName = formatAgentName(node.name);
    outputKeys.push(`workflow_data.${nodeName}`);
  });
  
  return outputKeys;
};


  const value = {
    state,
    dispatch,
    createNode,
    updateNode,
    deleteNode,
    createConnection,
    updateConnection,
    deleteConnection,
    setExecuting,
    setResults,
    addLog,
    clearLogs,
    resetWorkflow,
    buildCompleteWorkflow,
    getNodeWorkflowData,
    getConnectionWorkflowData,

    setSelectedFile, // ← NOVO
    clearSelectedFile , // ← NOVO

    getAvailableDocumentKeys,
    getAvailableOutputKeys
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

// Hook personalizado
export function useWorkFlow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkFlow deve ser usado dentro de um WorkFlowProvider');
  }
  return context;
}