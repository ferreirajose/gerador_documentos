// NodeManager.tsx
import { RiAddLine, RiCloseLine } from "@remixicon/react";
import { useControllerNode } from "@/hooks/useControllerNode";
import { NodeForm } from "./forms/NodeForm";
import { ListNode } from "./forms/ListNode";
import { useWorkflow } from "@/context/WorkflowContext";

export default function NodeManager() {

  const {
    showCreateForm,
    handleCreateNode,
    handleCloseForm
  } = useControllerNode()

  const { state } = useWorkflow();

  // Função para editar nó (pode ser expandida posteriormente)
  const handleEditNode = (nodeId: string) => {
    console.log('Editar nó:', nodeId);
  };

  // Função para excluir nó
  const handleDeleteNode = (nodeId: string) => {
    console.log(nodeId)
  };

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

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Criar Novo Nó
            </h3>
            <button
              onClick={handleCloseForm}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <RiCloseLine className="text-xl" />
            </button>
          </div>

          <NodeForm 
            state={state}
            onCloseForm={handleCloseForm} />
        </div>
      )}

      <ListNode 
        state={state}
        onOpenForm={handleCreateNode}
        onEditNode={handleEditNode}
        onDeleteNode={handleDeleteNode}
      />
    </div>
  )
}