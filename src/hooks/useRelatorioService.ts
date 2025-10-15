import { RelatorioEvent, relatorioService as relatorioServiceInstance } from "@/relatorio.service";
import { useCallback, useMemo, useState } from "react";

// Hook para uso em React (opcional)
export function useRelatorioService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const service = useMemo(() => relatorioServiceInstance, []);

  const gerarRelatorio = useCallback(
    async (data: any, onEvent?: (event: RelatorioEvent) => void) => {
      setIsLoading(true);
      setError(null);

      try {
        const stream = await service.gerarRelatorio(data);
        const reader = stream.getReader();

        while (true){
          const { done, value } = await reader.read();

          if (done) break;

          if (onEvent) {
            onEvent(value);
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [service]
  );

  const cancelar = useCallback(() => {
    service.cancelarGeracao();
    setIsLoading(false);
  }, [service]);

  return {
    gerarRelatorio,
    cancelarGeracao: cancelar,
    isLoading,
    error,
  };
}
