import { RiEyeLine, RiEyeOffLine, RiClipboardLine, RiCheckLine, RiErrorWarningLine, RiDownloadLine } from '@remixicon/react';
import { useState } from 'react';
import { useWorkflow } from '@/context/WorkflowContext';

interface WorkflowOutputProps {
  isWorkflowVisible: boolean;
  setIsWorkflowVisible: (visible: boolean) => void;
}

const WorkflowOutput: React.FC<WorkflowOutputProps> = ({
  isWorkflowVisible,
  setIsWorkflowVisible
}) => {
  const { getWorkflowJSON, validateWorkflow } = useWorkflow();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const workflowJSON = getWorkflowJSON();
  const validation = validateWorkflow();

  // Função para copiar o JSON
  const handleCopyJSON = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(workflowJSON);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      
      // Fallback para execCommand
      const textArea = document.createElement("textarea");
      textArea.value = workflowJSON;
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
      console.error("Falha ao copiar JSON: ", err);
      setCopyError("Erro ao copiar. Tente selecionar e copiar manualmente.");
      setTimeout(() => setCopyError(null), 3000);
    }
  };

  // Função para baixar o JSON
  const handleDownloadJSON = () => {
    const blob = new Blob([workflowJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!workflowJSON) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Workflow Gerado
          </h3>
          
          {/* Status de Validação */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            validation.isValid 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
          }`}>
            {validation.isValid ? (
              <>
                <RiCheckLine className="w-3 h-3" />
                Válido
              </>
            ) : (
              <>
                <RiErrorWarningLine className="w-3 h-3" />
                {validation.errors.length} erro(s)
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Copiar */}
          <button
            onClick={handleCopyJSON}
            disabled={copied}
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors ${
              copied
                ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600'
            }`}
          >
            <RiClipboardLine className="w-4 h-4" />
            {copied ? 'Copiado!' : 'Copiar'}
          </button>

          {/* Botão Download */}
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 rounded-md transition-colors dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800"
          >
            <RiDownloadLine className="w-4 h-4" />
            Download
          </button>

          {/* Botão Mostrar/Ocultar */}
          <button
            onClick={() => setIsWorkflowVisible(!isWorkflowVisible)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded-md transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600"
          >
            {isWorkflowVisible ? (
              <>
                <RiEyeOffLine className="w-4 h-4" />
                Ocultar
              </>
            ) : (
              <>
                <RiEyeLine className="w-4 h-4" />
                Mostrar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensagem de erro de cópia */}
      {copyError && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">{copyError}</p>
        </div>
      )}

      {/* Lista de erros de validação */}
      {!validation.isValid && isWorkflowVisible && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            Problemas de validação encontrados:
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* JSON do Workflow */}
      {isWorkflowVisible && (
        <div className="relative">
          <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm border border-gray-200 dark:border-gray-700 max-h-96">
            <code className="text-gray-800 dark:text-gray-200">
              {workflowJSON}
            </code>
          </pre>
          
          {/* Contador de caracteres */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {workflowJSON.length} caracteres
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowOutput;