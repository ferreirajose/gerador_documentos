import React, { createContext, useContext, useReducer, ReactNode } from 'react';
export interface NodeState {
  id: string;
  nome: string;
  categoria: 'entrada' | 'processamento' | 'saida';
  prompt: string;
  modelo_llm?: string;
  temperatura?: number;
  ferramentas: string[];
  saida: {
    nome: string;
    formato?: 'markdown' | 'json';
  };
  entradas: Array<{
    variavel_prompt: string;
    fonte: 'documento_anexado' | 'saida_no_anterior';
    documento?: string;
    no_origem?: string;
    processar_em_paralelo?: boolean;
  }>;
}

export interface Connection {
  id: string;
  origem: string;
  destino: string;
}

export interface WorkflowState {
  nodes: NodeState[];
  connections: Connection[];
  documentos_anexados: Record<string, string | string[]>;
}

// types/workflowActions.ts
export type WorkflowAction =
  | { type: 'ADD_NODE'; payload: NodeState }

// reducers/workflowReducer.ts

export const initialState: WorkflowState = {
  nodes: [],
  connections: [],
  documentos_anexados: {}
};

export function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    // ========== NODE ACTIONS ==========
    case 'ADD_NODE':
      return {
        ...state,
        nodes: [...state.nodes, action.payload]
      };

    default:
      return state;
  }
}

// contexts/WorkflowContext.tsx
interface WorkflowContextType {
  state: WorkflowState;
  dispatch: React.Dispatch<WorkflowAction>;
  // Node actions
  addNode: (node: NodeState) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  // ========== NODE ACTIONS ==========
  const addNode = (node: NodeState) => {
    dispatch({
      type: 'ADD_NODE',
      payload: {
        ...node,
        id: node.id
      }
    });
  };

  const value: WorkflowContextType = {
    state,
    dispatch,
    // Node actions
    addNode,
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