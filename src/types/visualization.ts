import { Node, Edge } from 'reactflow';
import { NodeState } from '@/context/WorkflowContext';

// Dados customizados para os nós do ReactFlow
export interface WorkflowNodeData {
  nodeState: NodeState;
  label: string;
  outputVariable: string;
  isEntryNode: boolean;
  isEndNode: boolean;
  hasInteraction: boolean;
  modelo?: string;
  temperatura?: number;
  ferramentas?: string[];
}

// Tipo do nó customizado do ReactFlow
export type WorkflowReactFlowNode = Node<WorkflowNodeData>;

// Tipo da aresta customizada
export type WorkflowReactFlowEdge = Edge;

// Posição do nó no canvas
export interface NodePosition {
  x: number;
  y: number;
}

// Configuração do layout
export interface LayoutConfig {
  direction: 'TB' | 'LR' | 'BT' | 'RL'; // Top-Bottom, Left-Right, etc.
  nodeSpacing: number;
  rankSpacing: number;
}
