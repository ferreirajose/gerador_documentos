import React, { useState } from 'react';

interface SaveWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowData: any;
}

const SaveWorkflowModal: React.FC<SaveWorkflowModalProps> = ({
  isOpen,
  onClose,
  workflowData,
}) => {
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    // Gerar nome do arquivo com data se não fornecido
    const now = new Date();
    const defaultName = `workflow_${now.toISOString().split('T')[0]}`;
    const finalFileName = fileName.trim() || defaultName;

    // Criar objeto completo para exportação
    const exportData = {
      nome: finalFileName,
      descricao: description.trim() || 'Workflow exportado',
      data_exportacao: now.toISOString(),
      versao: '1.0',
      workflow: workflowData,
    };

    // Converter para JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Criar link de download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${finalFileName}.json`;

    // Fazer download
    document.body.appendChild(link);
    link.click();

    // Limpar
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Fechar modal e resetar
    onClose();
    setFileName('');
    setDescription('');
  };

  const handleCancel = () => {
    onClose();
    setFileName('');
    setDescription('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          💾 Salvar Workflow
        </h2>

        <div className="space-y-4">
          {/* Nome do arquivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Arquivo
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="workflow_2025-11-24 (opcional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Se vazio, será gerado automaticamente com a data atual
            </p>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito deste workflow..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          {/* Informações */}
          <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-md">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              ℹ️ O arquivo será baixado em formato JSON. Você pode carregá-lo posteriormente usando o botão "Carregar Workflow".
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            💾 Baixar Workflow
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveWorkflowModal;
