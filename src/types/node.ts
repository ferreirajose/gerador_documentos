export type ViewType = "nodes" | "connections" | "output-configuration" | "execution";

type NodeStatus = "iniciado" | "finalizado" | "erro" | "pendente";


export interface GerarDocCallbacks {
  onInfo?: (message: string) => void;
  onNodeStatus?: (node: string, status: NodeStatus) => void;
  onProgress?: (nodes: any[]) => void;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
  onData?: (data: any) => void;
}
