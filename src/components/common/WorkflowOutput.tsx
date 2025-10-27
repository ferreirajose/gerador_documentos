import { RiEyeLine, RiEyeOffLine } from '@remixicon/react';

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
  if (!buildCompleteWorkflow) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Workflow Gerado
        </h3>
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
      {isWorkflowVisible && (
        <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-sm">
          {buildCompleteWorkflow()}
        </pre>
      )}
    </div>
  );
};

export default WorkflowOutput;