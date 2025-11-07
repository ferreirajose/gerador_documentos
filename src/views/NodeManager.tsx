import WorkflowOutput from "@/components/common/WorkflowOutput";
import { ListNode } from "@/components/forms/ListNode";
import NodeManagerCreate from "@/components/forms/NodeManagerCreate";
import NodeManagerEdit from "@/components/forms/NodeManagerEdit";
import { useWorkflow } from "@/context/WorkflowContext";
import { RiAddLine, RiNodeTree } from "@remixicon/react";
import { useEffect, useState } from 'react';

export default function NodeManager() {
  const { state, deleteNode } = useWorkflow();
  const [isWorkflowVisible, setIsWorkflowVisible] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const handleCreateNode = (formData: any) => {
    console.log('Nó criado:', formData);
    setShowCreateForm(false);
  };

  const handleEditNode = (nodeId: string) => {
    setEditingNodeId(nodeId);
  };

  const handleUpdateNode = (formData: any) => {
    console.log('Nó atualizado:', editingNodeId, formData);
    setEditingNodeId(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    const nodeToDelete = state.nodes.find(node => node.id === nodeId);
    
    if (nodeToDelete) {
      // Extrair todas as chaves de documentos usadas nas entradas do nó
      const chavesDocumentos = nodeToDelete.entradas
        .filter(entrada => entrada.origem === 'documento_anexado' && entrada.chave_documento_origem)
        .map(entrada => entrada.chave_documento_origem!);
      
      console.log('🗑️ Deletando nó:', nodeToDelete.nome);
      console.log('📄 Chaves de documentos a remover:', chavesDocumentos);
      
      // Deletar o nó e os documentos relacionados
      deleteNode(nodeId, chavesDocumentos);
    } else {
      // Fallback: se não encontrar o nó, deleta apenas pelo ID
      deleteNode(nodeId);
    }
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
  };

  const handleCloseEditForm = () => {
    setEditingNodeId(null);
  };

  // Fechar formulários quando o estado mudar
  useEffect(() => {
    if (showCreateForm) {
      setEditingNodeId(null);
    }
    if (editingNodeId) {
      setShowCreateForm(false);
    }
  }, [showCreateForm, editingNodeId]);

  useEffect(() => {
    console.log(state, 'Estado Atual');
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Nós</h2>
          <p className="text-gray-600 dark:text-gray-400">Crie e configure os nós do seu workflow</p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          data-testid="create-node-button"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 whitespace-nowrap disabled:bg-blue-400 disabled:cursor-not-allowed"
          disabled={showCreateForm || editingNodeId !== null}
        >
          <RiAddLine className="text-xl" />
          <span>Criar Nó</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <NodeManagerCreate
          onClose={handleCloseForm}
          onSubmit={handleCreateNode}
        />
      )}

      {/* Edit Form */}
      {editingNodeId && (
        <NodeManagerEdit
          nodeId={editingNodeId}
          onClose={handleCloseEditForm}
          onSubmit={handleUpdateNode}
        />
      )}

      {/* Lista de nós existentes - Só mostra quando não há formulários abertos */}
      {!showCreateForm && !editingNodeId && state.nodes.length > 0 && (
        <ListNode
          onOpenForm={() => setShowCreateForm(true)}
          state={state}
          onEditNode={handleEditNode}
          onDeleteNode={handleDeleteNode}
        />
      )}

      {/* Estado vazio - só mostra quando não há nós E não está mostrando formulários */}
      {!showCreateForm && !editingNodeId && state.nodes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 flex flex-col items-center">
          <RiNodeTree className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum nó criado</h3>
          <p className="text-gray-500 mb-4">Comece criando seu primeiro nó para construir o workflow</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
          >
            Criar Primeiro Nó
          </button>
        </div>
      )}

      {/* Output do Workflow - só mostra se houver nós E não estiver editando/criando */}
      {state.nodes.length > 0 && !showCreateForm && !editingNodeId && (
        <WorkflowOutput
          isWorkflowVisible={isWorkflowVisible}
          setIsWorkflowVisible={setIsWorkflowVisible}
        />
      )}
    </div>
  );
}