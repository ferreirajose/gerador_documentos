// WorkflowHttpGatewayV2.ts
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
      // Use o HttpClient para fazer a requisição com responseType: 'stream'
      const response = await this.httpClient.post<Response>(
        `${this.baseUrl}/gerar_relatorio_stream/`,
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

  private async processStream(
    stream: ReadableStream<Uint8Array>,
    callbacks: GerarDocCallbacks
  ): Promise<void> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log("Stream finalizado pelo servidor");
          break;
        }

        // Decodifica o chunk e adiciona ao buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Processa linhas completas
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Mantém a última linha incompleta no buffer

        for (const line of lines) {
          if (line.trim() === "") continue; // Ignora linhas vazias
          
          await this.processStreamLine(line.trim(), callbacks);
        }
      }

      // Processa qualquer dado restante no buffer
      if (buffer.trim()) {
        await this.processStreamLine(buffer.trim(), callbacks);
      }

      callbacks.onComplete?.({
        success: true,
        message: "Processamento concluído",
      });

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
      if (line.startsWith("data: ")) {
        const jsonData = line.slice(6); // Remove "data: "
        
        if (jsonData.trim() === "") return; // Ignora heartbeats vazios
        
        const eventData = JSON.parse(jsonData);
        this.dispatchEvent(eventData, callbacks);
        
      } else if (line.trim()) {
        // Linhas que não começam com "data: " são tratadas como informações
        callbacks.onInfo?.(line);
      }
    } catch (error) {
      console.warn("Erro ao processar linha do stream:", line, error);
      callbacks.onInfo?.(`Dado recebido (não processável): ${line}`);
    }
  }

  private dispatchEvent(eventData: any, callbacks: GerarDocCallbacks): void {
    console.log('Event data:', eventData);
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