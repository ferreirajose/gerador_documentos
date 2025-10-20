// WorkflowHttpGatewayV2InMemory.ts
import { DataResponse } from "@/types/process-docs";
import WorkflowGateway from "./WorkflowGateway";
import { GerarDocCallbacks } from "@/types/nodes";

export const MINUTA_MOCK = { 
  type: "resultado_final",
  payload: { dados_estruturados: "" }
};

export default class WorkflowHttpGatewayV2InMemory implements WorkflowGateway {
  private delayMs: number;

  constructor(delayMs: number = 200) {
    this.delayMs = delayMs;
  }

  async gerarRelatorio(
    requestData: any,
    callbacks: GerarDocCallbacks
  ): Promise<any> {
    try {
      await this.simulateStreaming(callbacks);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      callbacks.onError?.(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private async simulateStreaming(callbacks: GerarDocCallbacks): Promise<void> {
    try {
      // Sequência exata de eventos baseada no response fornecido
      const events = [
        { type: "status", node: "START", status: "iniciado" },
        { type: "status", node: "START", status: "finalizado" },
        { type: "status", node: "AuditorNode", status: "iniciado" },
        { type: "status", node: "DefenseNode", status: "iniciado" },
        { type: "status", node: "DefenseNode", status: "finalizado" },
        { type: "status", node: "AuditorNode", status: "finalizado" },
        { type: "status", node: "RelatorNode", status: "iniciado" },
        { type: "status", node: "RelatorNode", status: "finalizado" },
        { type: "status", node: "InfoExtractorNode", status: "iniciado" },
        { type: "status", node: "InfoExtractorNode", status: "finalizado" },
        { type: "resultado_final", payload: MINUTA_MOCK.payload }
      ];

      // Processa cada evento com delay
      for (const event of events) {
        await this.delay(this.delayMs);
        this.dispatchEvent(event, callbacks);
      }

      // Finaliza com sucesso
      await this.delay(this.delayMs);
      callbacks.onComplete?.({
        success: true,
        message: "Processamento concluído",
      });

    } catch (error) {
      console.error("Erro durante simulação do streaming:", error);
      callbacks.onError?.(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private dispatchEvent(eventData: any, callbacks: GerarDocCallbacks): void {
    if (!eventData || !eventData.type) {
      console.warn("Evento sem tipo:", eventData);
      return;
    }

    switch (eventData.type) {
      case "status":
        callbacks.onNodeStatus?.(eventData.node, eventData.status);
        break;
      
      case "progress":
        callbacks.onProgress?.(eventData.nodes);
        break;
      
      case "resultado_final":
        callbacks.onData?.(eventData.payload);
        break;
      
      case "error":
        callbacks.onError?.(eventData.message);
        break;
      
      case "info":
        callbacks.onInfo?.(eventData.message);
        break;
      
      default:
        console.log("Evento não tratado:", eventData);
        callbacks.onInfo?.(`Evento: ${JSON.stringify(eventData)}`);
    }
  }

  async uploadAndProcess(file: File): Promise<any> {
    // Mock para uploadAndProcess
    await this.delay(this.delayMs);
    
    return {
      success: true,
      data: {
        message: "Upload processado com sucesso",
        fileId: "mock-file-id",
        fileName: file.name
      }
    };
  }
}