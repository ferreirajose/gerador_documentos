export type ViewType = "nodes" | "connections" | "output-configuration" | "visualization" | "execution";

type NodeStatus = "started" | "finished" | "error" | "completed" | "waiting" | "processing";

export interface GerarDocCallbacks {
  onInfo?: (message: string) => void;
  onNodeStatus?: (node: string, status: NodeStatus) => void;
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
  onData?: (data: any) => void;
  onInteraction?: (data: {
    session_id: string;
    node: string;
    agent_message: string;
  }) => void;
}
