// import NodeEntitie from '@/domain/entities/NodeEntitie';
// import React, { createContext, useContext, useReducer, ReactNode } from 'react';
// export interface NodeState {
//   id: string;
//   nome: string;
//   categoria: 'entrada' | 'processamento' | 'saida';
//   prompt: string;
//   modelo_llm?: string;
//   temperatura?: number;
//   ferramentas: string[];
//   saida: {
//     nome: string;
//     formato?: 'markdown' | 'json';
//   };
//   entradas: Array<{
//     variavel_prompt: string;
//     fonte: 'documento_anexado' | 'saida_no_anterior';
//     documento?: string;
//     no_origem?: string;
//     processar_em_paralelo?: boolean;
//   }>;
// }

// export interface Connection {
//   id: string;
//   origem: string;
//   destino: string;
// }

// export interface WorkflowState {
//   nodes: NodeState[];
//   connections: Connection[];
//   documentos_anexados: Record<string, string | string[]>;
// }

// // types/workflowActions.ts
// export type WorkflowAction =
//   | { type: 'ADD_NODE'; payload: NodeState }
//   | { type: 'DELETE_NODE'; payload: string }
//   | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<NodeState> } } // Mude para NodeState

// // reducers/workflowReducer.ts

// export const initialState: WorkflowState = {
//   nodes: [],
//   connections: [],
//   documentos_anexados: {}
// };

// export function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
//   switch (action.type) {
//     // ========== NODE ACTIONS ==========
//     case 'ADD_NODE':
//       return {
//         ...state,
//         nodes: [...state.nodes, action.payload]
//       };

//     case 'UPDATE_NODE':
//       return {
//         ...state,
//         nodes: state.nodes.map(node =>
//           node.id === action.payload.id
//             ? { ...node, ...action.payload.updates }
//             : node
//         )
//       };

//     case 'DELETE_NODE':
//       return {
//         ...state,
//         nodes: state.nodes.filter(node => node.id !== action.payload),
//         connections: state.connections.filter(
//           conn => conn.origem !== action.payload && conn.destino !== action.payload
//         ),
//       };

//     default:
//       return state;
//   }
// }

// // contexts/WorkflowContext.tsx
// interface WorkflowContextType {
//   state: WorkflowState;
//   dispatch: React.Dispatch<WorkflowAction>;
//   // Node actions
//   addNode: (node: NodeState) => void;
//   deleteNode: (id: string) => void;
//   updateNode: (id: string, updates: Partial<NodeState>) => void; // Mude para NodeState

// }

// const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

// export function WorkflowProvider({ children }: { children: ReactNode }) {
//   const [state, dispatch] = useReducer(workflowReducer, initialState);

//   // ========== NODE ACTIONS ==========
//   const addNode = (node: NodeState) => {
//     dispatch({type: 'ADD_NODE', payload: {...node, id: node.id}});
//   };

//   const updateNode = (id: string, updates: Partial<NodeState>) => {
//     dispatch({ type: 'UPDATE_NODE', payload: { id, updates } });
//   };

//   const deleteNode = (id: string) => {
//     dispatch({ type: 'DELETE_NODE', payload: id });
//   };

//   const value: WorkflowContextType = {
//     state,
//     dispatch,
//     // Node actions
//     addNode,
//     deleteNode,
//     updateNode

//   };

//   return (
//     <WorkflowContext.Provider value={value}>
//       {children}
//     </WorkflowContext.Provider>
//   );
// }

// export function useWorkflow() {
//   const context = useContext(WorkflowContext);
//   if (context === undefined) {
//     throw new Error('useWorkflow must be used within a WorkflowProvider');
//   }
//   return context;
// }

// V2

import NodeEntitie from '@/domain/entities/NodeEntitie';
import { Aresta } from '@/domain/entities/Aresta';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Workflow } from '@/domain/entities/Workflow';
import { Grafo } from '@/domain/entities/Grafo';

// Use as interfaces das entidades de domínio
export interface NodeState extends Omit<NodeEntitie, 'validate'> {
  id: string;
}

export interface Connection extends Aresta {
  id: string;
}

export interface WorkflowState {
  nodes: NodeState[];
  connections: Connection[];
  documentos_anexados: Record<string, string | string[]>;
}

// Atualize os tipos de ação
export type WorkflowAction =
  | { type: 'ADD_NODE'; payload: NodeState }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<NodeState> } }
  | { type: 'ADD_CONNECTION'; payload: Connection }
  | { type: 'DELETE_CONNECTION'; payload: string }
  | { type: 'UPDATE_CONNECTION'; payload: { id: string; origem: string; destino: string } };

export const initialState: WorkflowState = {
  nodes: [],
  connections: [],
  documentos_anexados: {}
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
          node.id === action.payload.id
            ? { ...node, ...action.payload.updates }
            : node
        )
      };

    case 'DELETE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter(node => node.id !== action.payload),
        connections: state.connections.filter(
          conn => conn.origem !== action.payload && conn.destino !== action.payload
        ),
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
          conn.id === action.payload.id
            ? { ...conn, origem: action.payload.origem, destino: action.payload.destino }
            : conn
        )
      };

    case 'DELETE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter(conn => conn.id !== action.payload)
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
  deleteNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<NodeState>) => void;
  // Connection actions
  addConnection: (connection: Connection) => void;
  deleteConnection: (id: string) => void;
  updateConnection: (id: string, origem: string, destino: string) => void;

  // Workflow export
  getWorkflowJSON: () => string;
  getWorkflowObject: () => Workflow;
  validateWorkflow: () => { isValid: boolean; errors: string[] };
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  const addNode = (node: NodeState) => {
    dispatch({ type: 'ADD_NODE', payload: { ...node, id: node.id } });
  };

  const updateNode = (id: string, updates: Partial<NodeState>) => {
    dispatch({ type: 'UPDATE_NODE', payload: { id, updates } });
  };
  
  const deleteNode = (id: string) => {
    dispatch({ type: 'DELETE_NODE', payload: id });
  };

  const addConnection = (connection: Connection) => {
    dispatch({ type: 'ADD_CONNECTION', payload: connection });
  };

  const updateConnection = (id: string, origem: string, destino: string) => {
    dispatch({ type: 'UPDATE_CONNECTION', payload: { id, origem, destino } });
  };

  const deleteConnection = (id: string) => {
    dispatch({ type: 'DELETE_CONNECTION', payload: id });
  };


   // Converter NodeState para NodeEntitie
  const convertToNodeEntitie = (nodeState: NodeState): NodeEntitie => {
    return new NodeEntitie(
      nodeState.nome,
      nodeState.categoria,
      nodeState.prompt,
      nodeState.saida,
      nodeState.entradas,
      nodeState.modelo_llm,
      nodeState.temperatura,
      nodeState.ferramentas
    );
  };

  // Converter Connection para Aresta
  // const convertToAresta = (connection: Connection): Aresta => {
  //   return new Aresta(connection.origem, connection.destino);
  // };

  // Converter Connection para Aresta (usando nomes em vez de IDs)
  const convertToAresta = (connection: Connection): Aresta => {
    const origemNode = state.nodes.find(node => node.id === connection.origem);
    const destinoNode = state.nodes.find(node => node.id === connection.destino);
    
    if (!origemNode) {
      throw new Error(`Nó de origem com ID '${connection.origem}' não encontrado`);
    }
    
    // Para destino 'END', usar 'END' diretamente
    const destino = connection.destino === 'END' ? 'END' : (destinoNode?.nome || connection.destino);
    
    return new Aresta(origemNode.nome, destino);
  };

  // Validar workflow
  const validateWorkflow = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    try {
      // Verificar se há nós
      if (state.nodes.length === 0) {
        errors.push('Workflow deve ter pelo menos um nó');
      }

      // Verificar se há pelo menos um nó de entrada
      const entradaNodes = state.nodes.filter(node => node.categoria === 'entrada');
      if (entradaNodes.length === 0) {
        errors.push('Workflow deve ter pelo menos um nó de categoria "entrada"');
      }

      // Verificar se há conexões
      if (state.connections.length === 0) {
        errors.push('Workflow deve ter pelo menos uma conexão');
      }

      // Verificar se há conexão para END
      const hasEndConnection = state.connections.some(conn => conn.destino === 'END');
      if (!hasEndConnection) {
        errors.push('Workflow deve terminar com uma conexão para "END"');
      }

      // Validar nós individuais
      state.nodes.forEach(node => {
        try {
          const nodeEntity = convertToNodeEntitie(node);
          nodeEntity.validate();
        } catch (error) {
          errors.push(`Nó "${node.nome}": ${error.message}`);
        }
      });

      // Validar conexões
      const nodeEntities = state.nodes.map(convertToNodeEntitie);
      state.connections.forEach(connection => {
        try {
          const aresta = convertToAresta(connection);
          aresta.validate(nodeEntities);
        } catch (error) {
          errors.push(`Conexão ${connection.origem} → ${connection.destino}: ${error.message}`);
        }
      });

    } catch (error) {
      errors.push(`Erro na validação: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };



  // Obter workflow como objeto
  const getWorkflowObject = (): Workflow => {
    const nodeEntities = state.nodes.map(convertToNodeEntitie);
    const arestas = state.connections.map(convertToAresta);
    const grafo = new Grafo(nodeEntities, arestas);

    return new Workflow(state.documentos_anexados, grafo);
  };

  // Obter workflow como JSON string
  const getWorkflowJSON = (): string => {
    try {
      const workflow = getWorkflowObject();

      console.log(workflow, 'workflow')
      return workflow.toJsonString();
    } catch (error) {
      console.error('Erro ao converter workflow para JSON:', error);
      return JSON.stringify({
        error: 'Erro ao converter workflow para JSON',
        message: error.message
      }, null, 2);
    }
  };

  const value: WorkflowContextType = {
    state,
    dispatch,
    addNode,
    deleteNode,
    updateNode,
    addConnection,
    deleteConnection,
    updateConnection,

    // Workflow export
    getWorkflowJSON,
    getWorkflowObject,
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