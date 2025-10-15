// ExecuteProgress.tsx
interface ExecuteProgressProps {
  etapasConcluidas: number;
  totalEtapas: number;
  progresso: number;
  isLoading: boolean;
  erroCritico?: string | null;
  relatorioFinal?: string | null;
}

export function ExecuteProgress({ 
  etapasConcluidas, 
  totalEtapas, 
  progresso, 
  isLoading, 
  erroCritico, 
  relatorioFinal 
}: ExecuteProgressProps) {
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

                    {/* Área do Relatório Final */}
                    {relatorioFinal && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                📊 Relatório Final Gerado
                            </h2>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                                <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200 font-mono">
                                    {relatorioFinal}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}