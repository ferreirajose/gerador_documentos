import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { WorkflowBuilder } from '../application/builders/WorkflowBuilder';

// Tipos
export interface Node {
  id: string;
  name: string;
  type: 'entry' | 'process' | 'end';
  llmModel?: string;
  prompt?: string;
  createdAt: Date;
  workflowData?: any;
}

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
  selectedFiles: File[];
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
  | { type: 'SET_SELECTED_FILES'; payload: File[] }
  | { type: 'RESET_WORKFLOW' };

// Estado inicial
const initialState: WorkflowState = {
  nodes: [],
  connections: [],
  isExecuting: false,
  executionResults: null,
  executionLogs: [],
  selectedFiles: [],
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

    case 'SET_SELECTED_FILES':
      return {
        ...state,
        selectedFiles: action.payload,
      };

    case 'RESET_WORKFLOW':
      return {
        ...initialState,
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
  setFiles: (files: File[]) => void;
  resetWorkflow: () => void;
  // Métodos do WorkflowBuilder
  buildCompleteWorkflow: () => any;
  getNodeWorkflowData: (nodeId: string) => any;
  getConnectionWorkflowData: (connectionId: string) => any;
} | null>(null);

// Provider
interface WorkflowProviderProps {
  children: ReactNode;
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
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

  const setFiles = (files: File[]) => {
    dispatch({ type: 'SET_SELECTED_FILES', payload: files });
  };

  const resetWorkflow = () => {
    dispatch({ type: 'RESET_WORKFLOW' });
  };

  // Métodos do WorkflowBuilder
  const buildCompleteWorkflow = () => {
    const builder = new WorkflowBuilder();

    // Configurar documentos se houver arquivos
    if (state.selectedFiles.length > 0) {
      builder.setDocumentos({
        uploaded_files: state.selectedFiles.map(file => file.name)
      });
    }

    // Configurar ponto de entrada (nós do tipo 'entry')
    const entryNodes = state.nodes.filter(node => node.type === 'entry');
    if (entryNodes.length > 0) {
      builder.setPontoDeEntrada(entryNodes.map(node => node.name)); // Usar nome em vez de ID
    }

    // Adicionar todos os nós
    state.nodes.forEach(node => {
      const nodeData = node.workflowData || {};
      
      builder.addNode(node.name)
            .setAgent(nodeData.agent || getAgentByType(node.type))
            .setModel(node.llmModel || 'claude-3.7-sonnet@20250219')
            .setPrompt(node.prompt || '')
            .setOutputKey(`workflow_data.${node.name}`)
            .endNode();
    });

    // Adicionar todas as conexões usando NOMES dos nós
    state.connections.forEach(connection => {
      const fromNode = state.nodes.find(n => n.id === connection.fromNodeId);
      const toNode = state.nodes.find(n => n.id === connection.toNodeId);
      
      if (fromNode && toNode) {
        builder.addEdge(fromNode.name, toNode.name); // Usar nomes em vez de IDs
      }
    });

    // Configurar template de saída
    const outputTemplate = state.nodes.map(node => 
      `## ${node.name}\n{workflow_data.${node.name}}\n\n`
    ).join('');

    builder.setModificarSaida('relatorio_final', outputTemplate);

    return builder.toJSON();
  };

  const getAgentByType = (type: string): string => {
    const agentMap: Record<string, string> = {
      'entry': 'info_extractor',
      'process': 'financial_analyst',
      'end': 'strategic_advisor'
    };
    return agentMap[type] || 'financial_analyst';
  };

  const getNodeWorkflowData = (nodeId: string) => {
    const node = state.nodes.find(n => n.id === nodeId);
    return node?.workflowData || null;
  };

  const getConnectionWorkflowData = (connectionId: string) => {
    const connection = state.connections.find(c => c.id === connectionId);
    return connection?.workflowData || null;
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
    setFiles,
    resetWorkflow,
    buildCompleteWorkflow,
    getNodeWorkflowData,
    getConnectionWorkflowData,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

// Hook personalizado
export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow deve ser usado dentro de um WorkflowProvider');
  }
  return context;
}