import { useWorkflow, NodeState } from "@/context/WorkflowContext";
import { useState } from "react";

// hooks/useNodeEdit.ts (correções)
export function useNodeFormEditController() {
  const { state, updateNode } = useWorkflow();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingNode, setEditingNode] = useState<NodeState | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const startEdit = (nodeId: string) => {
    const nodeToEdit = state.nodes.find(node => node.id === nodeId);
    
    if (nodeToEdit) {
      setEditingNode(nodeToEdit);
      setIsEditing(true);
      setShowEditForm(true);
    } else {
      console.error('Nó não encontrado para edição:', nodeId);
    }
  };

  const cancelEdit = () => {
    setEditingNode(null);
    setIsEditing(false);
    setShowEditForm(false);
  };

  const saveEdit = (updatedNodeData: Partial<NodeState>) => {
    if (!editingNode) return false;

    try {
      // Garantir que o ID seja preservado e mesclar os dados
      const updatedNode: NodeState = {
        ...editingNode, // Mantém todos os dados originais
        ...updatedNodeData, // Aplica as atualizações
        id: editingNode.id // Garante que o ID não mude
      };

      console.log('Salvando nó atualizado:', updatedNode);
      
      // Chamar a action de atualização
      updateNode(editingNode.id, updatedNode);
      
      
      console.log(editingNode.id) 
        console.log(updatedNode)

      // Limpar estado
      cancelEdit();
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar edição do nó:', error);
      return false;
    }
  };

  const closeForm = () => {
    cancelEdit();
  };

  const isNodeEditing = (nodeId: string) => {
    return isEditing && editingNode?.id === nodeId;
  };

  return {
    isEditing,
    editingNode,
    showEditForm,
    startEdit,
    cancelEdit,
    saveEdit,
    closeForm,
    isNodeEditing,
    hasEditingNode: !!editingNode
  };
}