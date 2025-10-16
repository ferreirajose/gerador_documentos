export type Node = {
  id: string;
  name: string;
  type: 'entry' | 'process' | 'end';
  llmModel?: string;
  prompt?: string;
  createdAt: Date;
  // ✅ ADICIONAR esta propriedade
  workflowData?: {
    entradas?: Record<string, Record<string, string>>;
  };
}

export type Connection = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  createdAt: Date;
}

export type ViewType = 'nodes' | 'connections' | 'execution';

type NodeStatus = 'iniciado' | 'finalizado' | 'erro' | 'pendente';

  
  export interface WorkflowNode {
    id:   any,
    name: any,
    status: any,
    isStarted: boolean,
    isCompleted: boolean,
  }
  
  
  export interface GerarDocCallbacks {
    onInfo?: (message: string) => void
      onNodeStatus?: (node: string, status: NodeStatus) => void;
    onProgress?: (nodes: WorkflowNode[]) => void
    onComplete?: (result: any) => void
    onError?: (error: string) => void
    onData?: (data: any) => void
  
  }