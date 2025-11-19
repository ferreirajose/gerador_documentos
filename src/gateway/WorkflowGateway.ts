import { GerarDocCallbacks } from "@/types/node";

export default interface WorkflowGateway {
  uploadAndProcess(file: File): Promise<any>;
  gerarRelatorio(data: any, callbacks: GerarDocCallbacks): Promise<any>;
}