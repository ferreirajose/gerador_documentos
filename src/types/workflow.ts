
export interface NodeTimer {
  start: number;
  end?: number;
  duration?: number;
}

export interface ResultItem {
  value: string | object;
  metadata: {
    format: 'markdown' | 'json';
    source_nodes: string[];
    combined?: boolean;
    size_bytes?: number;
  };
}

export interface WorkflowResult {
  [key: string]: ResultItem;
}

// Interface para o erro
export interface WorkflowErrorData {
  type: string;
  message: string;
  node: string | null;
}

// Nova interface para interação
export interface InteractionData {
  session_id: string;
  node: string;
  agent_message: string;
}

// Interface para uploads necessários
export interface UploadNeeded {
  nodeNome: string;
  variavelPrompt: string;
  quantidadeArquivos: "zero" | "um" | "varios";
}
