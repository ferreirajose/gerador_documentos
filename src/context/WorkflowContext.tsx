import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { WorkflowBuilder } from '../application/builders/WorkflowBuilder';
import { Node } from '@/types/nodes';

export interface NodeDocument {
  id: string;
  name: string;
  file: File;
  nodeId: string;
  uploadedAt: Date;
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
  nodeDocuments: NodeDocument[]; // ← NOVO: documentos específicos por nó
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
  | { type: 'ADD_NODE_DOCUMENT'; payload: { nodeId: string; file: File } }
  | { type: 'DELETE_NODE_DOCUMENT'; payload: string }
  | { type: 'DELETE_NODE_DOCUMENTS'; payload: string }
  | { type: 'CLEAR_NODE_DOCUMENTS' }

// Estado inicial
const initialState: WorkflowState = {
  nodes: [],
  connections: [],
  isExecuting: false,
  executionResults: null,
  executionLogs: [],
  nodeDocuments: [], // ← NOVO

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

    case 'ADD_NODE_DOCUMENT':
      const newDocument: NodeDocument = {
        id: `doc_${Date.now()}`,
        name: action.payload.file.name,
        file: action.payload.file,
        nodeId: action.payload.nodeId,
        uploadedAt: new Date(),
      };
      return {
        ...state,
        nodeDocuments: [...state.nodeDocuments, newDocument],
      };

    case 'DELETE_NODE_DOCUMENT':
      return {
        ...state,
        nodeDocuments: state.nodeDocuments.filter(doc => doc.id !== action.payload),
      };

    case 'DELETE_NODE_DOCUMENTS':
      return {
        ...state,
        nodeDocuments: state.nodeDocuments.filter(doc => doc.nodeId !== action.payload),
      };

    case 'CLEAR_NODE_DOCUMENTS':
      return {
        ...state,
        nodeDocuments: [],
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
  exportWorkflowJSON: () => string;

  // Novos métodos para documentos dos nós
  addNodeDocument: (nodeId: string, file: File) => void;
  deleteNodeDocument: (documentId: string) => void;
  deleteNodeDocuments: (nodeId: string) => void;
  clearNodeDocuments: () => void;
  getNodeDocuments: (nodeId: string) => NodeDocument[];
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

  // Métodos para documentos dos nós
  const addNodeDocument = (nodeId: string, file: File) => {
    dispatch({ type: 'ADD_NODE_DOCUMENT', payload: { nodeId, file } });
  };

  const deleteNodeDocument = (documentId: string) => {
    dispatch({ type: 'DELETE_NODE_DOCUMENT', payload: documentId });
  };

  const deleteNodeDocuments = (nodeId: string) => {
    dispatch({ type: 'DELETE_NODE_DOCUMENTS', payload: nodeId });
  };

  const clearNodeDocuments = () => {
    dispatch({ type: 'CLEAR_NODE_DOCUMENTS' });
  };

  const getNodeDocuments = (nodeId: string): NodeDocument[] => {
    return state.nodeDocuments.filter(doc => doc.nodeId === nodeId);
  };

  // Métodos do WorkflowBuilder
  // WorkflowContext.tsx - método buildCompleteWorkflow
  const buildCompleteWorkflow = () => {
    const builder = new WorkflowBuilder();

    // Configurar documentos baseados nos nós de entrada
    const entryNodes = state.nodes.filter(node => node.type === 'entry');
    
    if (entryNodes.length > 0) {
      const documentos: Record<string, any> = {};
      
      entryNodes.forEach(entryNode => {
        const nodeDocuments = getNodeDocuments(entryNode.id);
        if (nodeDocuments.length > 0) {
          documentos[entryNode.name] = nodeDocuments[0].file;
        }
      });

      if (Object.keys(documentos).length > 0) {
        builder.setDocumentos(documentos);
      }
    }

    // Configurar ponto de entrada
    if (entryNodes.length > 0) {
      builder.setPontoDeEntrada(entryNodes.map(node => node.name));
    }

    // Adicionar todos os nós
    state.nodes.forEach(node => {
      const nodeData = node.workflowData || {};
      
      builder.addNode(node.name)
            .setAgent(node.name.toLocaleLowerCase())
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
        builder.addEdge(fromNode.name, toNode.name);
      }
    });

    // Configurar template de saída
    const outputTemplate = state.nodes.map(node => 
      `## ${node.name}\n{workflow_data.${node.name}}\n\n`
    ).join('');

    builder.setModificarSaida('relatorio_final', outputTemplate);

    return builder.toJSON();
  };
  
  const getNodeWorkflowData = (nodeId: string) => {
    const node = state.nodes.find(n => n.id === nodeId);
    return node?.workflowData || null;
  };

  const getConnectionWorkflowData = (connectionId: string) => {
    const connection = state.connections.find(c => c.id === connectionId);
    return connection?.workflowData || null;
  };

  const exportWorkflowJSON = (): string => {
    return buildCompleteWorkflow();
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
    exportWorkflowJSON,

    addNodeDocument, // ← NOVO
    deleteNodeDocument, // ← NOVO
    getNodeDocuments, // ← NOVO
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