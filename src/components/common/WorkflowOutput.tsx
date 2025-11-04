import { RiEyeLine, RiEyeOffLine, RiFileCopyLine, RiCheckLine } from '@remixicon/react';
import { useState } from 'react';

interface WorkflowOutputProps {
  buildCompleteWorkflow: (() => string) | null;
  isWorkflowVisible: boolean;
  setIsWorkflowVisible: (visible: boolean) => void;
}

const WorkflowOutput: React.FC<WorkflowOutputProps> = ({
  buildCompleteWorkflow,
  isWorkflowVisible,
  setIsWorkflowVisible
}) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!buildCompleteWorkflow) {
    return null;
  }

  const handleCopy = async () => {
    try {
      const workflowContent = buildCompleteWorkflow();
      await navigator.clipboard.writeText(workflowContent);
      setIsCopied(true);
      
      // Reset do estado após 2 segundos
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Falha ao copiar o workflow: ', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Workflow Gerado
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-colors ${
              isCopied
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            title={isCopied ? "Copiado!" : "Copiar workflow"}
            disabled={isCopied}
          >
            {isCopied ? (
              <>
                <RiCheckLine className="w-4 h-4" />
                Copiado!
              </>
            ) : (
              <>
                <RiFileCopyLine className="w-4 h-4" />
                Copiar
              </>
            )}
          </button>
          <button
            onClick={() => setIsWorkflowVisible(!isWorkflowVisible)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
          >
            {isWorkflowVisible ? (
              <>
                <RiEyeLine className="w-4 h-4" />
                Ocultar
              </>
            ) : (
              <>
                <RiEyeOffLine className="w-4 h-4" />
                Mostrar
              </>
            )}
          </button>
        </div>
      </div>
      {isWorkflowVisible && (
        <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
          {buildCompleteWorkflow()}
        </pre>
      )}
    </div>
  );
};

export default WorkflowOutput;