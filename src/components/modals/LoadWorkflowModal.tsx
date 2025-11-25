import React, { useState, useRef } from 'react';

interface LoadWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (workflowData: any) => void;
}

interface WorkflowPreview {
  nome: string;
  descricao: string;
  data_exportacao: string;
  versao: string;
  num_nos: number;
  num_arestas: number;
  num_documentos: number;
}

const LoadWorkflowModal: React.FC<LoadWorkflowModalProps> = ({
  isOpen,
  onClose,
  onLoad,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [preview, setPreview] = useState<WorkflowPreview | null>(null);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateWorkflowStructure = (data: any): boolean => {
    // Validar estrutura básica
    if (!data.workflow) {
      setError('Estrutura inválida: campo "workflow" não encontrado');
      return false;
    }

    const workflow = data.workflow;

    // Validar grafo
    if (!workflow.grafo || !workflow.grafo.nos || !Array.isArray(workflow.grafo.nos)) {
      setError('Estrutura inválida: grafo ou nós não encontrados');
      return false;
    }

    // Validar que cada nó tem os campos obrigatórios
    for (const node of workflow.grafo.nos) {
      if (!node.nome || !node.prompt || !node.saida) {
        setError(`Nó inválido: faltam campos obrigatórios (nome, prompt ou saida)`);
        return false;
      }
    }

    // Validar arestas
    if (!workflow.grafo.arestas || !Array.isArray(workflow.grafo.arestas)) {
      setError('Estrutura inválida: arestas não encontradas');
      return false;
    }

    // Validar que arestas referenciam nós existentes
    const nodeNames = new Set(workflow.grafo.nos.map((n: any) => n.nome));
    for (const aresta of workflow.grafo.arestas) {
      // Validar origem
      if (!nodeNames.has(aresta.origem)) {
        setError(`Aresta inválida: nó de origem não existe (${aresta.origem} -> ${aresta.destino})`);
        return false;
      }

      // Validar destino (permitir "END" como destino especial)
      if (aresta.destino !== 'END' && !nodeNames.has(aresta.destino)) {
        setError(`Aresta inválida: nó de destino não existe (${aresta.origem} -> ${aresta.destino})`);
        return false;
      }
    }

    return true;
  };

  const handleFileSelect = async (file: File) => {
    setError('');
    setPreview(null);
    setWorkflowData(null);
    setSelectedFile(file);

    if (!file.name.endsWith('.json')) {
      setError('Arquivo deve ter extensão .json');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validar estrutura
      if (!validateWorkflowStructure(data)) {
        return;
      }

      // Criar preview
      const workflowPreview: WorkflowPreview = {
        nome: data.nome || 'Sem nome',
        descricao: data.descricao || 'Sem descrição',
        data_exportacao: data.data_exportacao || 'Desconhecida',
        versao: data.versao || 'N/A',
        num_nos: data.workflow.grafo.nos.length,
        num_arestas: data.workflow.grafo.arestas.length,
        num_documentos: data.workflow.documentos_anexados?.length || 0,
      };

      setPreview(workflowPreview);
      setWorkflowData(data.workflow);
    } catch (err: any) {
      setError(`Erro ao ler arquivo: ${err.message}`);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleLoad = () => {
    if (workflowData) {
      onLoad(workflowData);
      handleCancel();
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setWorkflowData(null);
    setPreview(null);
    setError('');
    setIsDragging(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          📂 Carregar Workflow
        </h2>

        {/* Área de Upload */}
        <div
          onClick={handleClickUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 mb-4 cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="text-center">
            <div className="text-4xl mb-2">📄</div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {selectedFile ? selectedFile.name : 'Clique ou arraste um arquivo JSON'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Selecione um arquivo de workflow exportado anteriormente
            </p>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-3 mb-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              ❌ {error}
            </p>
          </div>
        )}

        {/* Preview */}
        {preview && !error && (
          <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-4 mb-4">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
              ✅ Workflow Válido
            </h3>

            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium text-green-800 dark:text-green-200">Nome:</span>
                  <p className="text-green-700 dark:text-green-300">{preview.nome}</p>
                </div>
                <div>
                  <span className="font-medium text-green-800 dark:text-green-200">Versão:</span>
                  <p className="text-green-700 dark:text-green-300">{preview.versao}</p>
                </div>
              </div>

              <div>
                <span className="font-medium text-green-800 dark:text-green-200">Descrição:</span>
                <p className="text-green-700 dark:text-green-300">{preview.descricao}</p>
              </div>

              <div>
                <span className="font-medium text-green-800 dark:text-green-200">Data de Exportação:</span>
                <p className="text-green-700 dark:text-green-300">
                  {new Date(preview.data_exportacao).toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-green-200 dark:border-green-700">
                <div>
                  <span className="font-medium text-green-800 dark:text-green-200">Nós:</span>
                  <p className="text-green-700 dark:text-green-300">{preview.num_nos}</p>
                </div>
                <div>
                  <span className="font-medium text-green-800 dark:text-green-200">Arestas:</span>
                  <p className="text-green-700 dark:text-green-300">{preview.num_arestas}</p>
                </div>
                <div>
                  <span className="font-medium text-green-800 dark:text-green-200">Documentos:</span>
                  <p className="text-green-700 dark:text-green-300">{preview.num_documentos}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aviso */}
        {preview && !error && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-3 mb-4">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>Atenção:</strong> Carregar este workflow substituirá o workflow atual. Certifique-se de salvar suas alterações antes de prosseguir.
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleLoad}
            disabled={!workflowData || !!error}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
              workflowData && !error
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            📂 Carregar Workflow
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoadWorkflowModal;
