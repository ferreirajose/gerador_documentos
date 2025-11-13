interface WorkflowErrorProps {
  error: {
    type: string;
    message: string;
    node: string | null;
  };
  onRetry?: () => void;
}

export function WorkflowError({ error, onRetry }: WorkflowErrorProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <i className="ri-error-warning-line text-red-500 text-xl"></i>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-red-800">
              Erro no Processamento
            </h4>
            {/* {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 text-sm font-medium"
              >
                <i className="ri-refresh-line"></i>
                <span>Tentar Novamente</span>
              </button>
            )} */}
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-red-700">Tipo:</span>
              <span className="ml-2 text-sm text-red-600 bg-red-100 px-2 py-1 rounded">
                {error.type}
              </span>
            </div>
            
            {error.node && (
              <div>
                <span className="text-sm font-medium text-red-700">Nó:</span>
                <span className="ml-2 text-sm text-red-600 bg-red-100 px-2 py-1 rounded">
                  {error.node}
                </span>
              </div>
            )}
            
            <div>
              <span className="text-sm font-medium text-red-700">Mensagem:</span>
              <div className="mt-1 p-3 bg-red-100 border border-red-200 rounded text-sm text-red-800 font-mono whitespace-pre-wrap">
                {error.message}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}