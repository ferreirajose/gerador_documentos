import WorkflowOutput from "@/components/common/WorkflowOutput";
import { ListNode } from "@/components/forms/ListNode";
import NodeManagerCreate from "@/components/forms/NodeManagerCreate";
import NodeManagerEdit from "@/components/forms/NodeManagerEdit";
import { useWorkflow } from "@/context/WorkflowContext";
import { RiAddLine, RiNodeTree, RiErrorWarningLine } from "@remixicon/react";
import { useEffect, useState } from 'react';

export default function NodeManager() {
  const { state, deleteNode } = useWorkflow();
  const [isWorkflowVisible, setIsWorkflowVisible] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ nodeId: string, message: string } | null>(null);

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
      // Verificar se o nó tem conexões
      const hasConnections = state.connections.some(edge => 
        edge.origem === nodeToDelete.id || edge.destino === nodeToDelete.id
      );

      if (hasConnections) {
        const connections = getNodeConnections(nodeToDelete);
        const connectionsText = formatConnections(connections);
        
        setDeleteError({
          nodeId,
           message: `Não é possível remover o nó <span class='text-xl font-bold text-red-600 dark:text-red-400'>${nodeToDelete.nome}</span> porque ele possui conexões: <span class='font-medium text-blue-600 dark:text-blue-400'>${connectionsText}</span>. Remova as conexões primeiro.`
        });
        return;
      }

      // Extrair todas as chaves de documentos usadas nas entradas do nó
      const chavesDocumentos = nodeToDelete.entradas
        .filter(entrada => entrada.origem === 'documento_anexado' && entrada.chave_documento_origem)
        .map(entrada => entrada.chave_documento_origem!);

      // Deletar o nó e os documentos relacionados
      deleteNode(nodeId, chavesDocumentos);
    } else {
      // Fallback: se não encontrar o nó, deleta apenas pelo ID
      deleteNode(nodeId);
    }
  };

  // Função para obter as conexões de um nó
  const getNodeConnections = (node: any): {type: 'source' | 'target', edge: any}[] => {
    const connections: {type: 'source' | 'target', edge: any}[] = [];
    
    state.connections.forEach(edge => {
      if (edge.origem === node.nome) {
        connections.push({ type: 'source', edge });
      }
      if (edge.destino === node.nome) {
        connections.push({ type: 'target', edge });
      }
    });
    
    return connections;
  };

  // Função para formatar as conexões em texto amigável
  const formatConnections = (connections: {type: 'source' | 'target', edge: any}[]): string => {
    if (connections.length === 0) return '';

    const connectionTexts = connections.map(conn => {
      if (conn.type === 'source') {
        return `${conn.edge.source} → ${conn.edge.target}`;
      } else {
        return `${conn.edge.source} → ${conn.edge.target}`;
      }
    });

    return connectionTexts.join(', ');
  };

  // Função para verificar se um nó tem conexões
  const hasNodeConnections = (node: any): boolean => {
    return state.connections.some(edge => 
      edge.origem === node.nome || edge.destino === node.nome
    );
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
  };

  const handleCloseEditForm = () => {
    setEditingNodeId(null);
  };

  const closeDeleteError = () => {
    setDeleteError(null);
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

  return (
    <div className="space-y-6">
      {/* Modal de Erro de Deleção */}
      {deleteError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <RiErrorWarningLine className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Não é possível remover o nó
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: deleteError.message }}/>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeDeleteError}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Entendi
              </button>
              {/* <button
                onClick={() => {
                  closeDeleteError();
                  // Aqui você pode adicionar lógica para focar no grafo
                  // ou navegar para a aba de conexões
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver Conexões
              </button> */}
            </div>
          </div>
        </div>
      )}

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
          hasNodeConnections={hasNodeConnections}
        />
      )}

      {/* Estado vazio - só mostra quando não há nós E não está mostrando formulários */}
      {!showCreateForm && !editingNodeId && state.nodes.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center">
          <RiNodeTree className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4 mx-auto" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum nó criado
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Comece criando seu primeiro nó para construir o workflow
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg whitespace-nowrap transition-colors"
          >
            Criar Primeiro Nó
          </button>
        </div>
      )}

      <WorkflowOutput
        isWorkflowVisible={isWorkflowVisible}
        setIsWorkflowVisible={setIsWorkflowVisible}
      />

    </div>
  );
}