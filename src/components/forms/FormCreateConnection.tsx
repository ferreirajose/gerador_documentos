import { RiCloseLine, RiErrorWarningLine, RiCheckLine } from "@remixicon/react";

interface FormCreateConnectionProps {
  onClose?: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  formData: {
    origem: string;
    destino: string;
  };
  setFormData: (data: { origem: string; destino: string }) => void;
  editingConnection: any;
  connectionValidation: {
    isValid: boolean;
    errors: string[];
  } | null;
  getAvailableNodes: (excludeNodeId?: string) => any[];
  getNodeName: (nodeId: string) => string;
}

export default function FormCreateConnection({
  onClose,
  onSubmit,
  onCancel,
  formData,
  setFormData,
  editingConnection,
  connectionValidation,
  getAvailableNodes,
  getNodeName
}: FormCreateConnectionProps) {
  const handleCancel = () => {
    onCancel();
    onClose?.(); // Fecha o formulário
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {editingConnection ? 'Editar Conexão' : 'Criar Nova Conexão'}
        </h3>
        <button
          onClick={handleCancel}
          data-testid="close-connection-form-button"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <RiCloseLine className="text-xl" />
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nó de Origem *
            </label>
            <select
              required
              value={formData.origem}
              data-testid="from-node-select"
              onChange={(e) => setFormData({ ...formData, origem: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecione o nó de origem</option>
              {getAvailableNodes(formData.destino).map(node => (
                <option key={node.id} value={node.id}>
                  {node.nome} ({node.categoria === 'entrada' ? 'Entrada' : node.categoria === 'processamento' ? 'Processamento' : 'Saída'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nó de Destino *
            </label>
            <select
              required
              value={formData.destino}
              data-testid="to-node-select"
              onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecione o nó de destino</option>
              <option value="END">END (Final do Workflow)</option>
              {getAvailableNodes(formData.origem).map(node => (
                <option key={node.id} value={node.id}>
                  {node.nome} ({node.categoria === 'entrada' ? 'Entrada' : node.categoria === 'processamento' ? 'Processamento' : 'Saída'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Validation Messages */}
        {connectionValidation && (
          <div className="space-y-2">
            {!connectionValidation.isValid ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <RiErrorWarningLine className="text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
                      {connectionValidation.errors.length === 1 ? 'Problema na conexão:' : 'Problemas na conexão:'}
                    </span>
                    <ul className="text-sm text-red-600 dark:text-red-400 mt-1 space-y-1">
                      {connectionValidation.errors.map((error, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <RiCloseLine className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <RiCheckLine className="text-green-600 dark:text-green-500" />
                  <span className="text-sm text-green-700 dark:text-green-300">
                    Conexão válida: {getNodeName(formData.origem)} → {formData.destino === 'END' ? 'END' : getNodeName(formData.destino)}
                    {formData.destino === 'END' && ' (Final do workflow)'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            data-testid="cancel-connection-form-button"
            className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!connectionValidation?.isValid}
            data-testid="submit-connection-form-button"
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              connectionValidation?.isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
            }`}
          >
            {editingConnection ? 'Atualizar' : 'Criar'} Conexão
          </button>
        </div>
      </form>
    </div>
  );
}