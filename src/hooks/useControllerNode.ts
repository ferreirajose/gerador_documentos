// hooks/useControllerNode.ts
import { useState, useCallback } from "react";

export function useControllerNode() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCancel = useCallback(() => {
    setShowCreateForm(false);
    console.log('Formulário cancelado');
  }, []);

  const handleCreateNode = useCallback(() => {
    setShowCreateForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowCreateForm(false);
  }, []);

  return { 
    showCreateForm, 
    handleCancel, 
    setShowCreateForm,
    handleCreateNode,
    handleCloseForm
  };
}