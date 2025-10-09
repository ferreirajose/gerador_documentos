import { DataResponse } from "@/types/types";
import HttpClient from "@/infra/HttpClient";
import WorkflowGateway from "./WorkflowGateway";

export default class DocumentHttpGateway implements WorkflowGateway {
  constructor(
    readonly httpClient: HttpClient,
    readonly baseUrl: string,
    readonly token: string
  ) {}

  async gerarRelatorio(data: any): Promise<any> {
    throw new Error("Method not implemented.");
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

      // Se for um erro do Axios, podemos acessar mais detalhes
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
}
