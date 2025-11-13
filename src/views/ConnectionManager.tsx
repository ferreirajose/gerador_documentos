import { useState } from "react";
import { RiAddLine } from "@remixicon/react";

import { useConnectionController } from "@/hooks/useConnectionController";
import { useWorkflow } from "@/context/WorkflowContext";
import { ConnectionsList } from "@/components/forms/ConnectionsList";
import WorkflowOutput from "@/components/common/WorkflowOutput";
import FormCreateConnection from "@/components/forms/FormCreateConnection";

export default function ConnectionManager() {
  const { state } = useWorkflow();
  const {
    connections,
    editingConnection,
    showCreateForm,
    formData,
    connectionValidation,
    setFormData,
    setShowCreateForm,
    handleSubmit,
    handleCancel,
    handleEdit,
    removeConnection,
    handleConnectToEnd,
    getNodeName,
    getNodeTypeInfo, // Alterado: agora é getNodeTypeInfo
    getAvailableNodes,
    canConnectToEnd,
    nodes // Adicionado: para passar para ConnectionsList
  } = useConnectionController();

  const [isWorkflowVisible, setIsWorkflowVisible] = useState(true);

  const handleCloseForm = () => {
    setShowCreateForm(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e);
    handleCloseForm();
  };

  const handleFormCancel = () => {
    handleCancel();
    handleCloseForm();
  };

  const handleConnectionEdit = (connection: any) => {
    handleEdit(connection);
    setShowCreateForm(true);
  };

  const handleConnectionDelete = (connectionId: string) => {
    removeConnection(connectionId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Conexões</h2>
          <p className="text-gray-600 dark:text-gray-400">Configure as ligações entre os nós do workflow</p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          disabled={state.nodes.length < 2}
          data-testid="create-connection-button"
          className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 whitespace-nowrap ${
            state.nodes.length < 2
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
          }`}
        >
          <RiAddLine />
          <span>Criar Conexão</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <FormCreateConnection 
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          formData={formData}
          setFormData={setFormData}
          editingConnection={editingConnection}
          connectionValidation={connectionValidation}
          getAvailableNodes={getAvailableNodes}
          getNodeName={getNodeName}
          getNodeTypeInfo={getNodeTypeInfo} // Nova prop adicionada
        />
      )}

      {/* Connections List */}
      <ConnectionsList
        connections={connections}
        showCreateForm={showCreateForm}
        onOpenForm={() => setShowCreateForm(true)}
        onEdit={handleConnectionEdit}
        onDelete={handleConnectionDelete}
        onConnectToEnd={handleConnectToEnd}
        getNodeName={getNodeName}
        getNodeTypeInfo={getNodeTypeInfo} // Alterado: agora é getNodeTypeInfo
        canConnectToEnd={canConnectToEnd}
        nodesCount={state.nodes.length}
        nodes={nodes} // Nova prop adicionada
      />

      <WorkflowOutput
        isWorkflowVisible={isWorkflowVisible}
        setIsWorkflowVisible={setIsWorkflowVisible}
      />
    </div>
  );
}