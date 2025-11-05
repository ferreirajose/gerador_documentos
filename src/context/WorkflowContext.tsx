import NodeEntitie from '@/domain/entities/NodeEntitie';
import { Aresta } from '@/domain/entities/Aresta';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DocumentoAnexado } from '@/domain/entities/Workflow';
import { ResultadoFinal } from '@/domain/entities/ResultadoFinal';

// Use as interfaces das entidades de domínio
export interface NodeState extends Omit<NodeEntitie, 'validate'> {
  id: string;
  categoria: 'entrada' | 'processamento' | 'saida';
}

export interface Connection extends Aresta {
  id: string;
}

export interface WorkflowState {
  nodes: NodeState[];
  connections: Connection[];
  documentos_anexados: DocumentoAnexado[];
  resultado_final?: ResultadoFinal;
}

// Atualize os tipos de ação
export type WorkflowAction =
  | { type: 'ADD_NODE'; payload: NodeState }


export const initialState: WorkflowState = {
  nodes: [],
  connections: [],
  documentos_anexados: [],
  resultado_final: new ResultadoFinal([])
};

export function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'ADD_NODE':
      return {
        ...state,
        nodes: [...state.nodes, action.payload]
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

}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  const addNode = (node: NodeState) => {
    dispatch({ type: 'ADD_NODE', payload: { ...node, id: node.id } });
  };



  const value: WorkflowContextType = {
    state,
    dispatch,
    addNode
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