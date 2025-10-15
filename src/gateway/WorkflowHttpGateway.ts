import { DataResponse } from "@/types/process-docs";
import HttpClient from "@/infra/HttpClient";
import WorkflowGateway from "./WorkflowGateway";
import { GerarDocCallbacks } from "@/types/nodes";

export default class WorkflowHttpGateway implements WorkflowGateway {
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
      await this.geraStreaming(requestData, callbacks);
    } catch (error) {
      console.error("Erro ao gerar minuta:", error);
      callbacks.onError?.(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private async geraStreaming(requestData: any, callbacks: GerarDocCallbacks) {
    try {
      const response = await this.httpClient.post<any>(
        `${this.baseUrl}/gerar_relatorio_stream/`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.token}`,
            Accept: "text/event-stream",
          },
          responseType: "stream", // AxiosAdapter vai converter para 'text'
        }
      );

      // Agora response.data é uma string com todo o conteúdo
      await this.processRealTimeStream(response.data, callbacks);
    } catch (error) {
      console.error("Erro ao iniciar streaming:", error);
      callbacks.onError?.(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private async processRealTimeStream(
    data: string, // ← AGORA É UMA STRING, não um stream
    callbacks: GerarDocCallbacks
  ) {
    try {
      const lines = data.split('\n');
      let buffer = '';

      for (const line of lines) {
        buffer += line + '\n';
        
        // Processa cada linha completa IMEDIATAMENTE
        if (line.startsWith('data: ') && line.trim().length > 6) {
          try {
            const eventData = JSON.parse(line.slice(6));
            this.processEventData(eventData, callbacks); // ← Processa IMEDIATAMENTE
          } catch (e) {
            console.warn('Erro ao parsear evento:', e, 'Linha:', line);
            callbacks.onInfo?.(`Dado recebido: ${line}`);
          }
        } else if (line.trim() && !line.startsWith('data: ')) {
          // Linhas de informação
          callbacks.onInfo?.(line);
        }
      }

      callbacks.onComplete?.({
        success: true,
        message: "Processamento concluído",
      });

    } catch (error) {
      console.error("Erro ao processar stream:", error);
      callbacks.onError?.(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // NOVO MÉTODO para processar dados do evento
  private processEventData(eventData: any, callbacks: GerarDocCallbacks) {
    if (!eventData || !eventData.type) return;

    switch (eventData.type) {
      case 'status':
        callbacks.onNodeStatus?.(eventData.node, eventData.status);
        break;
      case 'progress':
        callbacks.onProgress?.(eventData.nodes);
        break;
      case 'data':
        callbacks.onData?.(eventData.data);
        break;
      case 'error':
        callbacks.onError?.(eventData.message);
        break;
      case 'info':
        callbacks.onInfo?.(eventData.message);
        break;
      default:
        console.log('Evento não tratado:', eventData);
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
    if (error.name === "AbortError" || error.code === "ERR_CANCELED") {
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
