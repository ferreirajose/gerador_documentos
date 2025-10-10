export type Node = {
  id: string;
  name: string;
  type: 'entry' | 'process' | 'end';
  llmModel?: string;
  prompt?: string;
  createdAt: Date;
}

export type Connection = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  createdAt: Date;
}

export type ViewType = 'nodes' | 'connections' | 'execution';