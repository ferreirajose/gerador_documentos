import { downloadMarkdown, renderMarkdown } from "@/libs/util";
import { 
  RiTimeLine, 
  RiLoader4Line, 
  RiCheckboxCircleLine, 
  RiErrorWarningLine,
  RiClipboardLine,
  RiDownloadLine 
} from "@remixicon/react";
import { useState } from "react";

// ExecuteProgress.tsx
interface ExecuteProgressProps {
  etapas: any[];
  nodeStatus: Record<string, string>;
  nodeTimers: Record<string, { start: number; end?: number }>;
  etapasConcluidas: number;
  totalEtapas: number;
  progresso: number;
  isLoading: boolean;
  erroCritico?: string | null;
  relatorioFinal?: string | null;
}

// Função auxiliar para formatar duração
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

// Função para calcular a duração de um nó
function getNodeDuration(nodeName: string, nodeTimers: Record<string, { start: number; end?: number }>): number | null {
  const timer = nodeTimers[nodeName];
  if (!timer || !timer.end) return null;
  
  return timer.end - timer.start;
}

// Função para determinar o status do nó
function getNodeStatus(nodeName: string, nodeStatus: Record<string, string>): string {
  const status = nodeStatus[nodeName];
  
  if (!status) return 'waiting';
  
  if (status === 'iniciado') return 'processing';
  if (status === 'finalizado') return 'completed';
  
  return status;
}

export function ExecuteProgress({ 
  etapas,
  nodeStatus,
  nodeTimers,
  etapasConcluidas, 
  totalEtapas, 
  progresso, 
  isLoading, 
  erroCritico, 
  relatorioFinal 
}: ExecuteProgressProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  // Mapear nós do backend para etapas genéricas
  const backendToGenericMap: Record<string, number> = {
    'auditor': 1,
    'defesa': 2,
    'relator': 3,
    'extrair_informacoes': 4
  };

  // Função para copiar o conteúdo
  const handleCopyContent = async () => {
    if (!relatorioFinal) return;
    
    setCopyError(null);
    
    try {
      // Método 1: Clipboard API moderna (recomendado)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(relatorioFinal);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      
      // Método 2: Fallback para execCommand (suporte mais amplo)
      const textArea = document.createElement("textarea");
      textArea.value = relatorioFinal;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error("Falha ao copiar usando execCommand");
      }
      
    } catch (err) {
      console.error("Falha ao copiar conteúdo: ", err);
      
      // Método 3: Fallback para seleção manual
      try {
        const textArea = document.createElement("textarea");
        textArea.value = relatorioFinal;
        document.body.appendChild(textArea);
        textArea.select();
        
        setCopyError("Não foi possível copiar automaticamente. O texto foi selecionado - use Ctrl+C para copiar.");
        setTimeout(() => {
          setCopyError(null);
          document.body.removeChild(textArea);
        }, 5000);
        
      } catch (finalError) {
        setCopyError("Erro ao copiar. Tente selecionar e copiar o texto manualmente." + finalError);
        setTimeout(() => setCopyError(null), 5000);
      }
    }
  };

  // Função para baixar o markdown
  const handleDownloadMarkdown = () => {
    if (!relatorioFinal) return;
    downloadMarkdown(relatorioFinal);
  };

  // Função para obter a duração de uma etapa genérica
  const getGenericStepDuration = (stepIndex: number): number | null => {
    // Encontrar o nó do backend correspondente a esta etapa
    const backendNode = Object.entries(backendToGenericMap).find(
      ([_, index]) => index === stepIndex
    );
    
    if (backendNode) {
      return getNodeDuration(backendNode[0], nodeTimers);
    }
    return null;
  };

  // Criar etapas genéricas baseadas na quantidade de nós
  const steps = [
    {
      id: 'start',
      name: 'Início do Processo',
      status: getNodeStatus('START', nodeStatus),
      duration: getNodeDuration('START', nodeTimers)
    },
    ...Array.from({ length: etapas.length }, (_, index) => {
      const stepNumber = index + 1;
      const duration = getGenericStepDuration(stepNumber);
      
      return {
        id: `etapa-${stepNumber}`,
        name: `Etapa ${stepNumber}`,
        status: etapasConcluidas > index ? 'completed' : 'waiting',
        duration: duration
      };
    }),
    {
      id: 'resultado_final',
      name: 'Resultado Final',
      status: relatorioFinal ? 'completed' : 'waiting',
      duration: null
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Gerando Relatório Financeiro
          </h1>

          {/* Barra de Progresso */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {etapasConcluidas}/{totalEtapas} etapas concluídas
              </span>
              <span className="text-lg font-bold text-blue-600">
                {progresso}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progresso}%` }}
              ></div>
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {isLoading ? 'Processando workflow...' : 'Pronto para iniciar'}
            </div>
          </div>

          {/* Lista de Etapas */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              📋 Etapas do Processo
            </h2>
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.id} className="border border-gray-200 rounded-lg p-4 transition-all hover:border-blue-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {step.status === "waiting" && (
                        <RiTimeLine className="ri-time-line w-5 h-5 text-gray-400" />
                      )}
                      {step.status === "processing" && (
                        <RiLoader4Line className="ri-loader-4-line w-5 h-5 text-blue-500 animate-spin" />
                      )}
                      {step.status === "completed" && (
                        <RiCheckboxCircleLine className="ri-checkbox-circle-line w-5 h-5 text-green-500" />
                      )}
                      {step.status === "error" && (
                        <RiErrorWarningLine className="ri-error-warning-line w-5 h-5 text-red-500" />
                      )}

                      <div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {step.name}
                        </span>
                        {/* {step.duration !== null && step.status === "completed" && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({formatDuration(step.duration)})
                          </span>
                        )} */}
                      </div>
                    </div>

                    <span
                      className={`
                        text-sm font-medium px-3 py-1 rounded-full
                        ${step.status === "waiting" ? "bg-gray-100 text-gray-600" : ""}
                        ${step.status === "processing" ? "bg-blue-50 text-blue-700" : ""}
                        ${step.status === "completed" ? "bg-green-50 text-green-700" : ""}
                        ${step.status === "error" ? "bg-red-50 text-red-700" : ""}
                      `}
                    >
                      {step.status === "waiting" && "Aguardando"}
                      {step.status === "processing" && "Processando"}
                      {step.status === "completed" && "Concluído"}
                      {step.status === "error" && "Erro"}
                    </span>
                  </div>

                  {step.status === "processing" && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: '50%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 text-right">Processando...</p>
                    </div>
                  )}

                  {step.status === "completed" && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Área de Erro Crítico */}
          {erroCritico && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                ⚠️ Erro no Workflow
              </h3>
              <div className="bg-white p-3 rounded border">
                <pre className="text-sm text-red-700 whitespace-pre-wrap">
                  {erroCritico}
                </pre>
              </div>
            </div>
          )}

          {/* Mensagem de erro de cópia */}
          {copyError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">{copyError}</p>
            </div>
          )}

          {/* Área do Relatório Final */}
          {relatorioFinal && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  📊 Relatório Final Gerado
                </h2>
                
                {/* Botões de Ação */}
                <div className="flex gap-2">
                  {/* Botão Copiar */}
                  <button
                    onClick={handleCopyContent}
                    disabled={copied}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
                      ${copied 
                        ? "bg-green-50 border-green-200 text-green-700" 
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                      }
                    `}
                  >
                    <RiClipboardLine className="w-4 h-4" />
                    {copied ? "Copiado!" : "Copiar"}
                  </button>

                  {/* Botão Baixar */}
                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <RiDownloadLine className="w-4 h-4" />
                    Baixar Markdown
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                <div className="bg-white p-8 min-h-[600px] max-h-[800px] overflow-y-auto">
                  <div
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: `<div class="mb-4 leading-relaxed text-gray-700">${renderMarkdown(relatorioFinal)}</div>`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}