import HttpClient from "@/infra/HttpClient";
import WorkflowGateway from "./WorkflowGateway";
import { GerarDocCallbacks } from "@/types/node";
import { DataResponse } from "@/types/process-docs";

export default class WorkflowHttpGatewayV2 implements WorkflowGateway {
  constructor(
    readonly httpClient: HttpClient,
    readonly baseUrl: string,
    readonly token: string
  ) {}

  async gerarRelatorio(
    requestData: any,
    callbacks: GerarDocCallbacks
  ): Promise<any> {
    try {
      const response = await this.httpClient.post<Response>(
        `${this.baseUrl}/executar_workflow/`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
            Accept: "text/event-stream",
          },
          responseType: 'stream' as const,
        }
      );

      console.log("Response received:", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body available");
      }

      await this.processStream(response.body, callbacks);

    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      callbacks.onError?.(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // Novo método para continuar interação
  async continuarInteracao(
    sessionId: string,
    userMessage: string,
    callbacks: GerarDocCallbacks
  ): Promise<any> {
    try {
      const requestData = {
        session_id: sessionId,
        user_response: userMessage,
        approve: false
      };

      const response = await this.httpClient.post<Response>(
        `${this.baseUrl}/continuar_interacao/`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
            Accept: "text/event-stream",
          },
          responseType: 'stream' as const,
        }
      );

      console.log("Response received (continuação):", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body available");
      }

      await this.processStream(response.body, callbacks);

    } catch (error) {
      console.error("Erro ao continuar interação:", error);
      callbacks.onError?.(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private async processStream(
    stream: ReadableStream<Uint8Array>,
    callbacks: GerarDocCallbacks
  ): Promise<void> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let hasInteraction = false; // Nova flag para controlar interações

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log("Stream finalizado pelo servidor");
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;
          
          await this.processStreamLine(line.trim(), callbacks);
          
          // Verifica se houve uma interação
          if (line.includes('awaiting_interaction')) {
            hasInteraction = true;
          }
        }
      }

      if (buffer.trim()) {
        await this.processStreamLine(buffer.trim(), callbacks);
        
        // Verifica se houve uma interação no buffer final
        if (buffer.includes('awaiting_interaction')) {
          hasInteraction = true;
        }
      }

      // Só chama onComplete se não houver interação pendente
      if (!hasInteraction) {
        callbacks.onComplete?.({
          success: true,
          message: "Processamento concluído",
        });
      } else {
        console.log("Stream finalizado com interação pendente - não chamando onComplete");
      }

    } catch (error) {
      console.error("Erro durante processamento do stream:", error);
      callbacks.onError?.(
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      reader.releaseLock();
    }
  }

  private async processStreamLine(line: string, callbacks: GerarDocCallbacks): Promise<void> {
    try {
      console.log("Processando linha:", line);
      
      if (line.startsWith("data: ")) {
        const jsonData = line.slice(6);
        
        if (jsonData.trim() === "") return;
        
        const eventData = JSON.parse(jsonData);
        this.dispatchEvent(eventData, callbacks);
        
      } else if (line.startsWith("{")) {
        try {
          const eventData = JSON.parse(line);
          this.dispatchEvent(eventData, callbacks);
        } catch (parseError) {
          console.warn("Erro ao parsear JSON direto:", line, parseError);
          callbacks.onInfo?.(`Dado recebido (JSON inválido): ${line}`);
        }
      } else if (line.trim()) {
        callbacks.onInfo?.(line);
      }
    } catch (error) {
      console.warn("Erro ao processar linha do stream:", line, error);
      callbacks.onInfo?.(`Dado recebido (não processável): ${line}`);
    }
  }

  private dispatchEvent(eventData: any, callbacks: GerarDocCallbacks): void {
    console.log('Event data recebido:', eventData);
    
    if (!eventData || !eventData.type) {
      console.warn("Evento sem tipo:", eventData);
      return;
    }

    switch (eventData.type) {
      case "started":
      case "finished":
        callbacks.onNodeStatus?.(eventData.node, eventData.type);
        break;
      
      case "completed":
        callbacks.onData?.(eventData.payload || eventData.result);
        break;
      
      case "error":
        callbacks.onError?.(eventData.message);
        break;
      
      // Novos casos para interação
      case "awaiting_interaction":
        callbacks.onInteraction?.({
          session_id: eventData.session_id,
          node: eventData.node,
          agent_message: eventData.agent_message
        });
        break;
      
      case "stream_paused":
        callbacks.onInfo?.(eventData.message);
        break;
      
      default:
        console.log("Evento não tratado:", eventData);
        callbacks.onInfo?.(`Evento: ${JSON.stringify(eventData)}`);
    }
  }

  async uploadAndProcess(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("uploaded_file", file);

      const response = await this.httpClient.post<DataResponse>(
        `${this.baseUrl}/upload_and_process/`,
        formData,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      console.error("Erro ao fazer upload do documento:", error);
      return this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.name === "AbortError" || error.code === "ERR_CANCELED" || error.cancelled) {
      return {
        success: false,
        message: "Request cancelado",
        cancelled: true,
      };
    }

    if (error.status) {
      return {
        success: false,
        message: `HTTP error! status: ${error.status}`,
        status: error.status,
        responseText: error.responseText,
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}