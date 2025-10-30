// hooks/useWorkflowActions.ts

import { Connection, NodeState, useWorkflow } from "@/context/WorkflowContext";

export function useWorkflowActions() {
  const {
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    updateConnection,
    deleteConnection,
    deleteConnectionsByNode,
    resetWorkflow
  } = useWorkflow();

  // Factory methods para criar nodes
  const createNode = (categoria: NodeState['categoria'], baseData: Partial<NodeState> = {}): NodeState => {
    const id = `node_${Date.now()}`;
    return {
      id,
      nome: `Novo ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`,
      categoria,
      prompt: '',
      ferramentas: [],
      saida: { nome: `${categoria}_output` },
      entradas: [],
      position: { x: 100, y: 100 },
      ...baseData
    };
  };

  const createConnection = (origem: string, destino: string): Connection => {
    return {
      id: `conn_${Date.now()}`,
      origem,
      destino
    };
  };

  // Ações compostas
  const addNodeWithConnections = (node: NodeState, connections: Connection[]) => {
    addNode(node);
    connections.forEach(conn => addConnection(conn));
  };

  const deleteNodeWithConnections = (nodeId: string) => {
    deleteConnectionsByNode(nodeId);
    deleteNode(nodeId);
  };

  return {
    // Ações básicas
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    updateConnection,
    deleteConnection,
    deleteConnectionsByNode,
    resetWorkflow,
    // Factory methods
    createNode,
    createConnection,
    // Ações compostas
    addNodeWithConnections,
    deleteNodeWithConnections
  };
}