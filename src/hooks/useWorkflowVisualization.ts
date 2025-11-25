import { useMemo } from 'react';
import dagre from 'dagre';
import { useWorkflow } from '@/context/WorkflowContext';
import { WorkflowReactFlowNode, WorkflowReactFlowEdge, LayoutConfig } from '@/types/visualization';

const defaultLayoutConfig: LayoutConfig = {
  direction: 'TB', // Top to Bottom
  nodeSpacing: 150,
  rankSpacing: 200,
};

/**
 * Hook para converter dados do WorkflowContext para formato ReactFlow
 * e aplicar layout automático usando dagre
 */
export function useWorkflowVisualization(layoutConfig: LayoutConfig = defaultLayoutConfig) {
  const { state } = useWorkflow();

  const { nodes, edges } = useMemo(() => {
    // 1. Converter NodeState[] para ReactFlow nodes
    const reactFlowNodes: WorkflowReactFlowNode[] = state.nodes.map((node) => {
      const isEndNode = state.connections.some(conn => conn.origem === node.id && conn.destino === 'END');

      return {
        id: node.id,
        type: 'workflowNode', // Custom node type
        position: { x: 0, y: 0 }, // Will be calculated by layout
        data: {
          nodeState: node,
          label: node.nome,
          outputVariable: node.saida.nome,
          isEntryNode: node.entrada_grafo,
          isEndNode,
          hasInteraction: !!node.interacao_com_usuario,
          modelo: node.modelo_llm,
          temperatura: node.temperatura,
          ferramentas: node.ferramentas,
        },
      };
    });

    // 2. Adicionar nó END especial se houver conexões para END
    const hasEndConnections = state.connections.some(conn => conn.destino === 'END');
    if (hasEndConnections) {
      reactFlowNodes.push({
        id: 'END',
        type: 'workflowNode',
        position: { x: 0, y: 0 },
        data: {
          nodeState: null as any, // END não tem NodeState
          label: 'FIM',
          outputVariable: '',
          isEntryNode: false,
          isEndNode: true,
          hasInteraction: false,
        },
      });
    }

    // 3. Converter Connection[] para ReactFlow edges
    const reactFlowEdges: WorkflowReactFlowEdge[] = state.connections.map((conn) => ({
      id: conn.id,
      source: conn.origem,
      target: conn.destino,
      type: 'smoothstep', // Smooth animated edge
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
    }));

    // 4. Aplicar layout automático usando dagre
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: layoutConfig.direction,
      nodesep: layoutConfig.nodeSpacing,
      ranksep: layoutConfig.rankSpacing,
    });

    // Adicionar nós ao grafo dagre
    reactFlowNodes.forEach((node) => {
      // Tamanho do nó (largura x altura)
      const nodeWidth = node.id === 'END' ? 120 : 250;
      const nodeHeight = node.id === 'END' ? 80 : 120;

      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    // Adicionar arestas ao grafo dagre
    reactFlowEdges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calcular layout
    dagre.layout(dagreGraph);

    // Aplicar posições calculadas aos nós
    const layoutedNodes = reactFlowNodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);

      return {
        ...node,
        position: {
          x: nodeWithPosition.x - (nodeWithPosition.width / 2),
          y: nodeWithPosition.y - (nodeWithPosition.height / 2),
        },
      };
    });

    return {
      nodes: layoutedNodes,
      edges: reactFlowEdges,
    };
  }, [state.nodes, state.connections, layoutConfig]);

  return { nodes, edges };
}
