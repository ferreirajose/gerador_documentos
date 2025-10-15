import { GerarDocCallbacks } from "@/types/nodes";

export default interface WorkflowGateway {
  uploadAndProcess(file: File): Promise<any>;
  gerarRelatorio(data: any, callbacks: GerarDocCallbacks): Promise<any>;
}