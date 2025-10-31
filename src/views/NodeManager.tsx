// NodeManager.tsx (atualizado)
import { RiAddLine, RiCloseLine } from "@remixicon/react";
import { useControllerNode } from "@/hooks/useControllerNode";
import { useWorkflow } from "@/context/WorkflowContext";
import { useNodeFormEditController } from "@/hooks/useNodeFormEditController";
import { useEffect, useState } from "react";
import { NodeFormEdit } from "@/components/forms/NodeFormEdit";
import { NodeFormCreate } from "@/components/forms/NodeFormCreate";
import { ListNode } from "@/components/forms/ListNode";
import WorkflowOutput from "@/components/common/WorkflowOutput";

export default function NodeManager() {
  const [isWorkflowVisible, setIsWorkflowVisible] = useState(true); // ou false se quiser iniciar oculto

  const {
    showCreateForm,
    handleCreateNode,
    handleCloseForm
  } = useControllerNode();

  const { state, deleteNode } = useWorkflow();
  const { 
    startEdit, 
    saveEdit, 
    editingNode, 
    showEditForm,
    closeForm 
  } = useNodeFormEditController();

  // Função para editar nó
  const handleEditNode = (nodeId: string) => {
      console.log('Iniciando edição do nó:', nodeId);

    startEdit(nodeId);
  };

  // Função para excluir nó
  const handleDeleteNode = (nodeId: string) => {
    deleteNode(nodeId);
  };

  // Fechar qualquer formulário (criação ou edição)
  const handleCloseAnyForm = () => {
    handleCloseForm();
    closeForm();
  };

  // Adicione este useEffect para debug
useEffect(() => {
  console.log('Estado atual do workflow:', state);
}, [state]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Nós</h2>
          <p className="text-gray-600 dark:text-gray-400">Crie e configure os nós do seu workflow</p>
        </div>

        <button
          onClick={handleCreateNode}
          data-testid="create-node-button"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
        >
          <RiAddLine className="text-xl" />
          <span>Criar Nó</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Criar Novo Nó
            </h3>
            <button
              onClick={handleCloseAnyForm}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <RiCloseLine className="text-xl" />
            </button>
          </div>

          <NodeFormCreate
            state={state}
            onCloseForm={handleCloseAnyForm}
          />
        </div>
      )}

      {/* Edit Form */}
      {showEditForm && editingNode && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Editar Nó: {editingNode.nome}
            </h3>
            <button
              onClick={closeForm}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <RiCloseLine className="text-xl" />
            </button>
          </div>

          <NodeFormEdit
            state={state}
            onCloseForm={closeForm}
            // Você precisará adaptar o NodeFormEdit para aceitar dados iniciais
            initialData={editingNode}
            onSave={saveEdit}
          />
        </div>
      )}

      <ListNode
        state={state}
        onOpenForm={handleCreateNode}
        onEditNode={handleEditNode}
        onDeleteNode={handleDeleteNode}
      />

      {/* Output do Workflow - só mostra se houver nós */}
      {state.nodes.length > 0 && (
        <WorkflowOutput
          isWorkflowVisible={isWorkflowVisible}
          setIsWorkflowVisible={setIsWorkflowVisible}
        />
      )}

    </div>
  );
}