//v2

import { ListNode } from "@/components/forms/ListNode";
import NodeManagerCreate from "@/components/forms/NodeManagerCreate";
import NodeManagerEdit from "@/components/forms/NodeManagerEdit";
import LoadWorkflowModal from "@/components/modals/LoadWorkflowModal";
import SaveWorkflowModal from "@/components/modals/SaveWorkflowModal";
import { useWorkflow } from "@/context/WorkflowContext";
import { RiAddLine, RiUploadCloud2Line, RiNodeTree, RiSave3Line, RiDeleteBinLine } from "@remixicon/react";
import { useState } from 'react';

export default function NodeManager() {
  //const workflow = useWorkflow(); // 1. Pegamos o objeto inteiro primeiro
  const { state, deleteNode, loadWorkflow, resetWorkflow, getWorkflowJSON } = useWorkflow();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Estados para modais de salvar/carregar
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);

  // --- PROTEÇÃO CONTRA CRASH (Contexto) ---
  // Se o hook retornar null ou undefined, retornamos algo vazio para não quebrar
  if (!useWorkflow()) {
    return <div className="p-4 text-center text-gray-400">Carregando contexto...</div>;
  }


  // --- PROTEÇÃO CONTRA CRASH (State) ---
  // Garantimos que 'nodes' seja sempre um array, mesmo se state for null/undefined
  const nodes = state?.nodes || [];
  const hasNodes = nodes.length > 0;

  // Handlers para salvar e carregar workflow
  const handleOpenSaveModal = () => {
    setIsSaveModalOpen(true);
  };

  const handleCloseSaveModal = () => {
    setIsSaveModalOpen(false);
  };

  const handleOpenLoadModal = () => {
    setIsLoadModalOpen(true);
  };

  const handleCloseLoadModal = () => {
    setIsLoadModalOpen(false);
  };

  const handleLoadWorkflow = (workflowData: any) => {
    try {
      loadWorkflow(workflowData);
      console.log('✅ Workflow carregado com sucesso!');

    } catch (error) {
      console.error('❌ Erro ao carregar workflow:', error);
      console.log(`Erro ao carregar workflow: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleCreateNode = (formData: any) => {
    setShowCreateForm(false);
  };

  const handleUpdateNode = (formData: any) => {
    setEditingNodeId(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (deleteNode) deleteNode(nodeId);
  };

  
  const clearWorkflow = () => {
    console.log('Limpa workflow Atual');


    // Resetar workflow
    resetWorkflow();
  };


  // --- RENDER HELPERS ---
  const isFormOpen = showCreateForm || editingNodeId !== null;

  return (
    <div className="space-y-6 h-full flex flex-col">

      {/* 1. TELA INICIAL (WIZARD) */}
      {!hasNodes && !isFormOpen && (
        <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] dark:bg-gray-800 rounded-xl p-8 shadow-sm">
          <div className="text-center max-w-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Bem-vindo ao Editor de Workflow</h2>
            <p className="text-gray-500 dark:text-gray-400">Você ainda não tem nenhuma etapa configurada. Como gostaria de começar?</p>
          </div>

          <div className="grid grid-cols-1 gap-6 w-full max-w-2xl">
            <div
              onClick={() => setShowCreateForm(true)}
              className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group"><div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <RiAddLine className="ri-add-circle-line text-white text-3xl" />
              </div><h3 className="text-xl font-semibold text-gray-900 mb-3">Começar do Zero</h3><p className="text-gray-600 mb-4">Crie seu primeiro nó e construa o fluxo passo a passo.</p><div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all"><span>Criar do zero</span><i className="ri-arrow-right-line"></i></div></div>


            <div
              onClick={handleOpenLoadModal}
              className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer group"><div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">

                <RiUploadCloud2Line className="ri-file-upload-line text-white text-3xl" />

              </div><h3 className="text-xl font-semibold text-gray-900 mb-3">Carregar JSON</h3><p className="text-gray-600 mb-4">Importe um arquivo .json de um workflow existente.</p><div className="flex items-center text-purple-600 font-medium group-hover:gap-2 transition-all"><span>Importar arquivo</span>

                <i className="ri-arrow-right-line"></i></div></div>
          </div>
        </div>
      )}


      {/* Modais de Salvar e Carregar Workflow */}
      <SaveWorkflowModal
        isOpen={isSaveModalOpen}
        onClose={handleCloseSaveModal}
        workflowData={JSON.parse(getWorkflowJSON())}
      />

      <LoadWorkflowModal
        isOpen={isLoadModalOpen}
        onClose={handleCloseLoadModal}
        onLoad={handleLoadWorkflow}
      />

      {/* 2. HEADER DA LISTA */}
      {hasNodes && !isFormOpen && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <RiNodeTree className="text-blue-500" /> Gerenciar Nós
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Organize a lógica e as etapas do seu fluxo.</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
          >
            <RiAddLine size={20} /> Criar Novo Nó
          </button>

          <button
            onClick={handleOpenSaveModal}
            disabled={state.nodes.length === 0}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 flex items-center space-x-2"
            title="Salvar workflow em arquivo"
          >
            <RiSave3Line className="w-4 h-4" />
            <span>Salvar</span>
          </button>

          <button
            onClick={clearWorkflow}
            disabled={state.nodes.length === 0}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 flex items-center space-x-2"
            title="Limpar Workflow"
          >
            <RiDeleteBinLine className="w-4 h-4" />
            <span>Limpar Workflow ?</span>
          </button>
        </div>
      )}

      {/* 3. ÁREA DE FORMULÁRIOS */}
      {showCreateForm && (
        <NodeManagerCreate
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateNode}
        />
      )}

      {editingNodeId && (
        <NodeManagerEdit
          nodeId={editingNodeId}
          onClose={() => setEditingNodeId(null)}
          onSubmit={handleUpdateNode}
        />
      )}

      {/* 4. LISTA DE NÓS */}
      {!isFormOpen && hasNodes && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Aqui passamos 'nodes' ou garantimos que state existe */}
          <ListNode
            state={state!} // O '!' força, mas o ideal é o ListNode tratar nulls internamente
            onEditNode={setEditingNodeId}
            onDeleteNode={handleDeleteNode}
            onOpenForm={() => setShowCreateForm(true)}
            hasNodeConnections={(node) => false}
          />
        </div>
      )}
    </div>
  );
}