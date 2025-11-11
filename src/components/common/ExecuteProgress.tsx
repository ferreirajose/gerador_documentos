import { formatDuration } from "@/libs/util";
import { 
  RiTimeLine, 
  RiLoader4Line, 
  RiCheckboxCircleLine, 
  RiErrorWarningLine,
} from "@remixicon/react";

interface Step {
  id: number;
  name: string;
  status: string;
  duration?: number | null;
}

interface ExecuteProgressProps {
  progress: number;
  steps: Step[];
  title?: string;
}

export function ExecuteProgress({ progress, steps, title = "Gerando Relatório" }: ExecuteProgressProps) {
  // Calcular etapas concluídas baseado no status
  const etapasConcluidas = steps.filter(step => step.status === "completed" || step.status === "error").length;
  const totalEtapas = steps.length;
  
  // Verificar se há alguma etapa em processamento
  const isLoading = steps.some(step => step.status === "processing");

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {title}
          </h1>

          {/* Barra de Progresso */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                {etapasConcluidas}/{totalEtapas} etapas concluídas
              </span>
              <span className="text-lg font-bold text-blue-600">
                {progress}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
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
                        {step.duration !== undefined && step.duration !== null && step.status === "completed" && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({formatDuration(step.duration)})
                          </span>
                        )}
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
                      {step.status === "processing" && "Processando..."}
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
        </div>
      </div>
    </div>
  );
}