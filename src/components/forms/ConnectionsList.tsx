import { RiArrowRightLine, RiTimeLine, RiEditLine, RiDeleteBinLine, RiCheckLine, RiLink } from "@remixicon/react";

interface Connection {
  id: string;
  origem: string;
  destino: string;
}

interface ConnectionsListProps {
  connections: Connection[];
  showCreateForm: boolean;
  onOpenForm: () => void;
  onEdit: (connection: Connection) => void;
  onDelete: (connectionId: string) => void;
  onConnectToEnd: (nodeId: string) => void;
  getNodeName: (nodeId: string) => string;
  getNodeType: (nodeId: string) => string;
  canConnectToEnd: (nodeId: string) => { canConnect: boolean; reason: string };
  nodesCount: number;
}

export function ConnectionsList({
  connections,
  showCreateForm,
  onOpenForm,
  onEdit,
  onDelete,
  onConnectToEnd,
  getNodeName,
  getNodeType,
  canConnectToEnd,
  nodesCount
}: ConnectionsListProps) {
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Conexões Criadas ({connections.length})
        </h3>
      </div>

      {connections.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {connections.map((connection) => {
            const endValidation = canConnectToEnd(connection.origem);
            const origemNome = getNodeName(connection.origem);
            const destinoNome = connection.destino === 'END' ? 'END' : getNodeName(connection.destino);
            
            return (
              <div key={connection.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <RiArrowRightLine className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {origemNome} → {destinoNome}
                        </div>
                        
                        {connection.destino === 'END' && (
                          <span 
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full dark:bg-purple-900/30 dark:text-purple-300 cursor-help"
                            title="Conexão final do workflow"
                          >
                            Final
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <RiTimeLine className="w-4" />
                        <span>Criada em {new Date().toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {getNodeType(connection.origem) === 'entrada' ? 'Entrada' : 
                           getNodeType(connection.origem) === 'processamento' ? 'Processamento' : 'Saída'} → 
                          {connection.destino === 'END' ? 'END' : 
                           getNodeType(connection.destino) === 'entrada' ? 'Entrada' : 
                           getNodeType(connection.destino) === 'processamento' ? 'Processamento' : 'Saída'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Não permitir editar conexões END */}
                    {connection.destino !== 'END' && (
                      <button
                        onClick={() => onEdit(connection)}
                        data-testid={`edit-connection-${connection.id}-button`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Editar conexão"
                      >
                        <RiEditLine className="w-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(connection.id)}
                      data-testid={`delete-connection-${connection.id}-button`}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Excluir conexão"
                    >
                      <RiDeleteBinLine className="w-4" />
                    </button>
                    
                    {/* Botão para conectar ao END */}
                    {connection.destino !== 'END' && endValidation.canConnect && (
                      <button
                        onClick={() => onConnectToEnd(connection.origem)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                        title={`Conectar ao END: ${endValidation.reason}`}
                      >
                        <RiCheckLine className="w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <RiLink className="text-2xl text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma conexão criada
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Comece criando sua primeira conexão entre nós
          </p>
          {nodesCount >= 2 && !showCreateForm && (
            <button
              onClick={onOpenForm}
              data-testid="create-first-connection-button"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors whitespace-nowrap"
            >
              Criar Primeira Conexão
            </button>
          )}
        </div>
      )}
    </div>
  );
}