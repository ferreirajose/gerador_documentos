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

  // Função auxiliar para descrever status
  function getStatusDescription(status: string) {
    const statusMap = {
      waiting: "aguardando",
      processing: "processando",
      completed: "concluído",
      error: "erro"
    };

    return statusMap[status as keyof typeof statusMap] || status;

  }

  // Função para descrições detalhadas das etapas
  function getStepDetailedDescription(step: Step, index: number, totalSteps: number) {
    const baseDescription = `Esta é a etapa ${index + 1} de ${totalSteps} no workflow. `;
    
    const statusDescriptions = {
      waiting: "Atualmente aguardando para ser iniciada. Esta etapa será processada após a conclusão das etapas anteriores.",
      processing: "Está atualmente em execução. O sistema está processando esta etapa agora.",
      completed: "Já foi concluída com sucesso. Todos os processos desta etapa foram finalizados.",
      error: "Encontrou um erro durante a execução. Esta etapa requer atenção para resolver o problema antes de continuar."
    };

    const durationText = step.duration && step.status === "completed" 
      ? ` Tempo total de execução foi ${formatDuration(step.duration)}.`
      : "";

    return baseDescription + (statusDescriptions[step.status as keyof typeof statusDescriptions] || "") + durationText;
  }

  return (
  <section 
    className="bg-gray-50 dark:bg-gray-900 py-8"
    aria-labelledby="workflow-title"
    aria-describedby="workflow-description"
  >
    <div className="mx-auto">
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 
          id="workflow-title"
          className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
        >
          {title}
        </h1>
        
        {/* Descrição geral do workflow para leitores de tela */}
        <div id="workflow-description" className="sr-only">
          Esta seção mostra o progresso geral do workflow e lista todas as etapas individuais do processo. 
          Você pode navegar pelas etapas usando a tecla Tab.
        </div>

        {/* Barra de Progresso */}
        <section 
          aria-labelledby="progress-section-title"
          aria-describedby="progress-description"
        >
          <h2 id="progress-section-title" className="sr-only">
            Progresso Geral do Workflow
          </h2>
          
          <div id="progress-description" className="sr-only">
            Esta barra de progresso mostra o percentual completo de todas as etapas do workflow.
            Atualmente {progress}% das etapas foram concluídas.
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span 
                id="progress-label"
                className="text-lg font-semibold text-gray-700 dark:text-gray-300"
              >
                {etapasConcluidas}/{totalEtapas} etapas concluídas
              </span>
              <span 
                className="text-lg font-bold text-blue-600"
                aria-live="polite"
                aria-atomic="true"
                aria-describedby="progress-percentage-description"
              >
                {progress}%
              </span>
              
              {/* Descrição do percentual para leitores de tela */}
              <div id="progress-percentage-description" className="sr-only">
                Percentual completo do workflow. 
                {progress === 0 && " Workflow ainda não iniciado."}
                {progress > 0 && progress < 100 && ` Workflow ${progress} por cento completo.`}
                {progress === 100 && " Workflow totalmente completo."}
              </div>
            </div>

            <div 
              className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700"
              role="progressbar"
              aria-labelledby="progress-label"
              aria-describedby="progress-bar-description"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${progress} por cento completo`}
            >
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* Descrição detalhada da barra de progresso */}
            <div id="progress-bar-description" className="sr-only">
              Barra de progresso visual que mostra o avanço geral do workflow. 
              A barra azul representa as etapas concluídas, enquanto a área cinza 
              representa as etapas restantes.
            </div>

            <div 
              className="mt-4 text-sm text-gray-600 dark:text-gray-400"
              aria-live="polite"
              aria-atomic="true"
              aria-describedby="workflow-status-description"
            >
              {isLoading ? 'Processando workflow...' : 'Pronto para iniciar'}
            </div>
            
            {/* Descrição do status do workflow */}
            <div id="workflow-status-description" className="sr-only">
              {isLoading 
                ? "O workflow está atualmente em processamento. Aguarde a conclusão das etapas." 
                : "O workflow está pronto para ser iniciado. Nenhuma etapa está em processamento no momento."
              }
            </div>
          </div>
        </section>

        {/* Lista de Etapas */}
        <section 
          aria-labelledby="steps-list-title"
          aria-describedby="steps-list-description"
        >
          <h2 
            id="steps-list-title"
            className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4"
          >
            <span aria-hidden="true">📋</span> Etapas do Processo
          </h2>
          
          <div id="steps-list-description" className="sr-only">
            Lista de todas as etapas individuais que compõem este workflow. 
            Cada etapa mostra seu nome, status atual e progresso individual quando aplicável.
            Use as teclas de direção para navegar entre as etapas.
          </div>
          
          <div 
            className="space-y-4"
            role="list"
            aria-label="Lista de etapas do processo"
            aria-describedby="steps-stats"
          >
            {/* Estatísticas da lista para leitores de tela */}
            <div id="steps-stats" className="sr-only">
              Total de {steps.length} etapas no workflow. 
              {steps.filter(s => s.status === 'completed').length} etapas concluídas,
              {steps.filter(s => s.status === 'processing').length} etapas em processamento,
              {steps.filter(s => s.status === 'error').length} etapas com erro,
              {steps.filter(s => s.status === 'waiting').length} etapas aguardando.
            </div>

            {steps.map((step, index) => (
              <div 
                key={step.id}
                role="listitem"
                className="border border-gray-200 rounded-lg p-4 transition-all hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500"
                tabIndex={0}
                aria-labelledby={`step-${step.id}-title`}
                aria-describedby={`step-${step.id}-description`}
                aria-posinset={index + 1}
                aria-setsize={steps.length}
              >
                {/* Título e informações principais da etapa */}
                <div id={`step-${step.id}-title`} className="sr-only">
                  Etapa {index + 1} de {steps.length}: {step.name}. 
                  Status: {getStatusDescription(step.status)}.
                  {step.duration && step.status === "completed" && 
                    ` Tempo de execução: ${formatDuration(step.duration)}.`
                  }
                </div>
                
                {/* Descrição detalhada da etapa */}
                <div id={`step-${step.id}-description`} className="sr-only">
                  {getStepDetailedDescription(step, index, steps.length)}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Ícones com labels acessíveis */}
                    {step.status === "waiting" && (
                      <>
                        <RiTimeLine 
                          className="ri-time-line w-5 h-5 text-gray-400" 
                          aria-hidden="true"
                        />
                        <span className="sr-only" id={`step-${step.id}-icon`}>
                          Ícone de relógio: etapa aguardando início
                        </span>
                      </>
                    )}
                    {step.status === "processing" && (
                      <>
                        <RiLoader4Line 
                          className="ri-loader-4-line w-5 h-5 text-blue-500 animate-spin" 
                          aria-hidden="true"
                        />
                        <span className="sr-only" id={`step-${step.id}-icon`}>
                          Ícone de carregamento giratório: etapa em processamento
                        </span>
                      </>
                    )}
                    {step.status === "completed" && (
                      <>
                        <RiCheckboxCircleLine 
                          className="ri-checkbox-circle-line w-5 h-5 text-green-500" 
                          aria-hidden="true"
                        />
                        <span className="sr-only" id={`step-${step.id}-icon`}>
                          Ícone de verificação: etapa concluída com sucesso
                        </span>
                      </>
                    )}
                    {step.status === "error" && (
                      <>
                        <RiErrorWarningLine 
                          className="ri-error-warning-line w-5 h-5 text-red-500" 
                          aria-hidden="true"
                        />
                        <span className="sr-only" id={`step-${step.id}-icon`}>
                          Ícone de alerta: etapa com erro que requer atenção
                        </span>
                      </>
                    )}

                    <div>
                      <span 
                        className="font-medium text-gray-800 dark:text-gray-200"
                        aria-describedby={`step-${step.id}-name-description`}
                      >
                        {step.name}
                      </span>
                      
                      <div id={`step-${step.id}-name-description`} className="sr-only">
                        Nome desta etapa do workflow
                      </div>
                      
                      {step.duration !== undefined && step.duration !== null && step.status === "completed" && (
                        <span 
                          className="ml-2 text-xs text-gray-500"
                          aria-label={`Duração: ${formatDuration(step.duration)}`}
                        >
                          {/*
                          @TODO QUANDO ENTRAR EM NODE DE INTERAÇÃO O TIME É 0 VERIFICAR NO COMPONENTE PAI calculateProgress
                           ({formatDuration(step.duration)}) */}
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
                    aria-hidden="true"
                  >
                    {step.status === "waiting" && "Aguardando"}
                    {step.status === "processing" && "Processando..."}
                    {step.status === "completed" && "Concluído"}
                    {step.status === "error" && "Erro"}
                  </span>
                  
                  {/* Texto acessível para leitores de tela */}
                  <span className="sr-only" id={`step-${step.id}-status`}>
                    Status atual: 
                    {step.status === "waiting" && "Aguardando início. Esta etapa ainda não foi iniciada."}
                    {step.status === "processing" && "Processando. Esta etapa está atualmente em execução."}
                    {step.status === "completed" && "Concluído com sucesso. Esta etapa foi finalizada."}
                    {step.status === "error" && "Erro. Esta etapa encontrou um problema e requer intervenção."}
                  </span>
                </div>

                {/* Barras de progresso individuais */}
                {step.status === "processing" && (
                  <div className="space-y-2">
                    <div 
                      className="w-full bg-gray-200 rounded-full h-2"
                      role="progressbar"
                      aria-labelledby={`step-${step.id}-progress-label`}
                      aria-valuenow={50}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuetext="50 por cento completo">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: '50%' }}
                      ></div>
                    </div>
                    <div id={`step-${step.id}-progress-label`} className="sr-only">
                      Progresso individual desta etapa: 50% completo. Barra de progresso em azul mostra o avanço.
                    </div>
                  </div>
                )}

                {step.status === "completed" && (
                  <div className="mt-2">
                    <div 
                      className="w-full bg-gray-200 rounded-full h-2"
                      role="progressbar"
                      aria-labelledby={`step-${step.id}-completed-label`}
                      aria-valuenow={100}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuetext="100 por cento completo">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: '100%' }}
                      ></div>
                    </div>
                    <div id={`step-${step.id}-completed-label`} className="sr-only">
                      Progresso individual desta etapa: 100% completo. Barra verde indica conclusão total.
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </article>
    </div>
  </section>
  );

}