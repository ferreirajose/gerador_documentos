
export default interface WorkflowGateway {
  uploadAndProcess(file: File): Promise<any>;
  gerarRelatorio(data: any): Promise<any>;
}