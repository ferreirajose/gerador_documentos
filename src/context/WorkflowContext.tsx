import NodeEntitie from '@/domain/entities/NodeEntitie';
import { Aresta } from '@/domain/entities/Aresta';
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DocumentoAnexado } from '@/domain/entities/Workflow';
import { ResultadoFinal } from '@/domain/entities/ResultadoFinal';
import { Grafo } from '@/domain/entities/Grafo';
import { Workflow } from '@/domain/entities/Workflow';

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
  | { type: 'UPDATE_NODE'; payload: NodeState }
  | { type: 'DELETE_NODE'; payload: { nodeId: string, chavesDocumentos?: string[] } }
  | { type: 'ADD_DOCUMENTO_ANEXO'; payload: DocumentoAnexado }
  | { type: 'REMOVE_DOCUMENTOS_POR_CHAVE'; payload: string[] } 

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

    case 'UPDATE_NODE': // NOVO CASE
      return {
        ...state,
        nodes: state.nodes.map(node => 
          node.id === action.payload.id ? action.payload : node
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
  // WORKFLOW
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

  // WorkflowContext.tsx - métodos atualizados
  const getWorkflowJSON = (): string => {
    try {
      // Convert NodeState[] to NodeEntitie[]
      const nodes: NodeEntitie[] = state.nodes.map(node => 
        new NodeEntitie(
          node.nome,
          node.prompt,
          node.saida,
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

      // Create empty edges array
      const edges: Aresta[] = [];

      // Create graph with empty edges
      const grafo = new Grafo(nodes, edges);

      // Create workflow with empty resultado_final
      const workflow = new Workflow(
        state.documentos_anexados,
        grafo,
        state.resultado_final
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
          node.saida,
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

      // Create empty edges array
      const edges: Aresta[] = [];

      // Create graph with empty edges
      const grafo = new Grafo(nodes, edges);

      // Create workflow
      const workflow = new Workflow(
        state.documentos_anexados,
        grafo,
        state.resultado_final
      );

      // Validate the workflow
      workflow.validate();
      
    } catch (error) {
      if (error instanceof Error) {
        errors.push(error.message);
      } else {
        errors.push('Unknown validation error occurred');
      }
    }

    // Additional validations specific to the React state
    if (state.nodes.length === 0) {
      errors.push('Workflow must contain at least one node');
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