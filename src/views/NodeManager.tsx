// NodeManager.tsx (atualizado)
import NodeManagerCreate from "@/components/forms/NodeManagerCreate";
import { RiAddLine, RiNodeTree } from "@remixicon/react";
import { useState } from 'react';

export default function NodeManager() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateNode = (formData: any) => {
    console.log('Nó criado:', formData);
    setShowCreateForm(false);
    // @TODO Adicionar a lógica para salvar o nó
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
          onClick={() => setShowCreateForm(true)}
          data-testid="create-node-button"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 whitespace-nowrap disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          <RiAddLine className="text-xl" />
          <span>Criar Nó</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <NodeManagerCreate
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateNode}
        />
      )}

      {/* Lista de nós existentes pode vir aqui */}
      {!showCreateForm && (
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
    </div>
  );
}