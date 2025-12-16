import { useState } from 'react'; // Adicione esta importação
import { RiClipboardLine } from '@remixicon/react'; // Adicione esta importação

interface WorkflowErrorProps {
  error: {
    type: string;
    message: string;
    node: string | null;
    detail?: string;
    errors?: Array<{
      field: string;
      message: string;
      type: string;
    }>;
    hint?: string;
  };
  onRetry?: () => void;
}

export function WorkflowError({ error }: WorkflowErrorProps) {
  const [copied, setCopied] = useState(false);
  const hasDetailedErrors = error.detail && error.errors;

  const copyErrorToClipboard = async () => {
    try {
      // Remove quaisquer propriedades undefined
      const cleanError = JSON.parse(JSON.stringify(error));
      const errorJson = JSON.stringify(cleanError, null, 2);

      // Verificar se estamos em contexto seguro (HTTPS ou localhost HTTP)
      const isSecureContext = window.isSecureContext ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      // Usar Clipboard API se disponível e seguro
      if (navigator.clipboard && isSecureContext) {
        await navigator.clipboard.writeText(errorJson);
      } else {
        // Fallback para textarea + execCommand
        const textArea = document.createElement('textarea');
        textArea.value = errorJson;
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);

        // Tentar selecionar e copiar
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          if (!successful) {
            throw new Error('execCommand falhou');
          }
        } catch (execErr) {
          // Último fallback: prompt
          console.warn('execCommand falhou, usando prompt:', execErr);
          const shouldCopy = window.confirm(
            'Clique em OK para ver o erro e copie manualmente do prompt.'
          );

          if (shouldCopy) {
            prompt('Copie o texto abaixo:', errorJson);
          } else {
            document.body.removeChild(textArea);
            return;
          }
        }

        document.body.removeChild(textArea);
      }

      setCopied(true);

      // Resetar após 2 segundos
      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (err) {
      console.error('Erro ao copiar para a área de transferência:', err);

      // Fallback final simplificado
      try {
        const errorJson = JSON.stringify(error, null, 2);
        const shouldCopy = window.confirm(
          'Não foi possível copiar automaticamente. Clique em OK para copiar manualmente.'
        );

        if (shouldCopy) {
          prompt('Copie o JSON do erro:', errorJson);
        }
      } catch (fallbackErr) {
        console.error('Erro no fallback:', fallbackErr);
      }
    }
  };

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <i className="ri-error-warning-line text-red-500 dark:text-red-400 text-xl"></i>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-red-800 dark:text-red-300">
              {hasDetailedErrors ? "Erro de Validação" : "Erro no Processamento"}
            </h4>

            <div className="flex items-center space-x-3">
              {/* Botão Copiar JSON */}
              <button
                onClick={copyErrorToClipboard}
                className="px-3 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2 text-sm"
                title="Copiar erro como JSON"
              >
                {copied ? (
                  <>
                    <RiClipboardLine className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <RiClipboardLine className="w-4 h-4" />
                    <span>Copiar JSON</span>
                  </>
                )}
              </button>

            </div>
          </div>

          <div className="space-y-4">
            {error.detail && (
              <div className="mb-2">
                <p className="text-base font-medium text-red-700 dark:text-red-300">
                  {error.detail}
                </p>
              </div>
            )}

            {error.message && (
              <div>
                <span className="text-sm font-medium text-red-700 dark:text-red-300">Mensagem:</span>
                <div className="mt-1 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-300 font-mono whitespace-pre-wrap">
                  {error.message}
                </div>
              </div>
            )}

            {error.hint && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <i className="ri-lightbulb-line text-yellow-600 dark:text-yellow-400 mt-0.5"></i>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">Dica:</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">{error.hint}</p>
                  </div>
                </div>
              </div>
            )}

            {error.errors && error.errors.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Erros de Validação:</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {error.errors.length} erro(s) encontrado(s)
                  </span>
                </div>
                <div className="space-y-3">
                  {error.errors.map((err, index) => (
                    <div
                      key={index}
                      className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-300">
                            {err.type}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-800 dark:text-red-300">
                            Campo: <code className="font-bold">{err.field}</code>
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-400 mt-1">{err.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visualização Raw JSON (opcional - pode ser colapsável) */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                  <span>Visualizar erro como JSON raw</span>
                  <i className="ri-arrow-down-s-line group-open:rotate-180 transition-transform"></i>
                </summary>
                <div className="mt-3 relative">
                  <pre className="bg-gray-900 dark:bg-gray-800 text-gray-100 dark:text-gray-200 rounded-lg p-4 text-sm font-mono overflow-x-auto max-h-60 overflow-y-auto">
                    <code>{JSON.stringify(error, null, 2)}</code>
                  </pre>
                  <button
                    onClick={copyErrorToClipboard}
                    className="absolute top-2 right-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-100 text-xs rounded flex items-center space-x-1"
                  >
                    {copied ? (
                      <>
                        <RiClipboardLine className="w-3 h-3" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <RiClipboardLine className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </details>
            </div>

            <div className="flex flex-wrap gap-3">
              {error.type && (
                <div>
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Tipo:</span>
                  <span className="ml-2 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                    {error.type}
                  </span>
                </div>
              )}

              {error.node && (
                <div>
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">Nó:</span>
                  <span className="ml-2 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                    {error.node}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}