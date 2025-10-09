
export default interface WorkflowGateway {
  uploadAndProcess(file: File): Promise<any>;
  gerarRelatorioComStreaming(data: any): Promise<any>;
}