import WorkflowGateway from "@/gateway/WorkflowGateway";

export interface StreamingResponse {
  onData: (callback: (data: any) => void) => void;
  onError: (callback: (error: Error) => void) => void;
  onComplete: (callback: () => void) => void;
  cancel: () => void;
}

export default class WorkflowRelatorioService {
  constructor(private readonly workflowGateway: WorkflowGateway) {}

  /**
   * Gera relatório com suporte a streaming
   */
  async gerarRelatorioComStreaming(payload: string): Promise<StreamingResponse> {
    return this.workflowGateway.gerarRelatorioComStreaming(payload);
  }

}