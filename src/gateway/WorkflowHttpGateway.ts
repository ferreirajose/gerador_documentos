import { DataResponse } from "@/types/process-docs";
import HttpClient from "@/infra/HttpClient";
import { StreamingResponse } from "@/application/services/WorkflowRelatorioService";
import WorkflowGateway from "./WorkflowGateway";

export default class WorkflowHttpGateway implements WorkflowGateway {
  constructor(
    readonly httpClient: HttpClient,
    readonly baseUrl: string,
    readonly token: string
  ) {}


  async gerarRelatorioComStreaming(data: any): Promise<StreamingResponse> {
    return this.createStreamingConnection(data);
  }

  private createStreamingConnection(data: any): StreamingResponse {
    const controller = new AbortController();
    const signal = controller.signal;

    let isCancelled = false;
    let errorCallback: ((error: Error) => void) | null = null;
    let completeCallback: (() => void) | null = null;

    const streamingResponse: StreamingResponse = {
      onData: (callback: (data: any) => void) => {
        this.executeStreamingRequest(data, callback, signal)
          .then(() => {
            if (completeCallback && !isCancelled) {
              completeCallback();
            }
          })
          .catch((error) => {
            if (errorCallback && !isCancelled) {
              errorCallback(error);
            }
          });
      },
      onError: (callback: (error: Error) => void) => {
        errorCallback = callback;
      },
      onComplete: (callback: () => void) => {
        completeCallback = callback;
      },
      cancel: () => {
        isCancelled = true;
        controller.abort();
      }
    };

    return streamingResponse;
  }

  private async executeStreamingRequest(
    data: any, 
    onData: (data: any) => void,
    signal: AbortSignal
  ): Promise<void> {
    try {
      const response = await this.httpClient.post(
        `${this.baseUrl}/gerar_relatorio_stream/`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'text/event-stream',
          },
          responseType: 'text',
          signal // Passando o AbortSignal para o HttpClient
        }
      );

      // Processa a resposta como texto (formato Server-Sent Events)
      if (typeof response === 'string') {
        const lines = response.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const parsedData = JSON.parse(line.slice(6));
              onData(parsedData);
            } catch (e) {
              console.warn('Failed to parse stream data:', e);
            }
          }
        }
      }
    } catch (error: any) {
      // Verifica se o erro foi por cancelamento
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.log('Request cancelado pelo usuário');
        return;
      }
      
      console.error("Erro no streaming:", error);
      throw error;
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
    // Verifica se é um erro de cancelamento
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
      return {
        success: false,
        message: "Request cancelado",
        cancelled: true,
      };
    }

    if (error.response) {
      return {
        success: false,
        message: `HTTP error! status: ${error.response.status}`,
        status: error.response.status,
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}