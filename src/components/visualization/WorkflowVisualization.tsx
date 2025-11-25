import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  OnNodesChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowVisualization } from '@/hooks/useWorkflowVisualization';
import WorkflowNode from './WorkflowNode';
import NodeDetailPanel from './NodeDetailPanel';
import { NodeState } from '@/context/WorkflowContext';
import { RiAddLine, RiBrainLine, RiChatSmile2Line, RiCodeBoxLine, RiGoogleLine, RiInformationLine, RiMicrosoftLine, RiOpenaiLine, RiPlayCircleLine, RiStopCircleLine, RiSubtractLine } from '@remixicon/react';

/**
 * Componente principal de visualização do workflow estilo BPMN
 */
const WorkflowVisualization: React.FC = () => {
  const { nodes, edges } = useWorkflowVisualization();
  const [selectedNode, setSelectedNode] = useState<NodeState | null>(null);
  const [isModelsVisible, setIsModelsVisible] = useState(false);


  // Registrar tipos customizados de nós
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      workflowNode: WorkflowNode,
    }),
    []
  );

  // Handler para clique em nós
  const onNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    // Ignorar clique no nó END
    if (node.id === 'END') {
      setSelectedNode(null);
      return;
    }

    setSelectedNode(node.data.nodeState);
  }, []);

  // Handler para clique no canvas (fora dos nós)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Handler para mudanças nos nós (drag, resize, etc.)
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      // Atualizar nós com as mudanças do ReactFlow
      // Por enquanto apenas aplicar mudanças localmente
      // TODO: Salvar posições no WorkflowContext
    },
    []
  );

  return (
    <div className="relative w-full h-full bg-gray-50 dark:bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodesChange={onNodesChange}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          animated: true,
        }}
      >
        {/* Background com grid */}
        <Background
          color="#9ca3af"
          gap={16}
          className="bg-gray-100 dark:bg-gray-800"
        />

        {/* Controles de zoom e fit */}
        <Controls
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg"
        />

        {/* Minimap para navegação */}
        <MiniMap
          nodeColor={(node) => {
            if (node.id === 'END') return '#ef4444'; // red-500
            if (node.data?.isEntryNode) return '#10b981'; // green-500
            if (node.data?.hasInteraction) return '#14b8a6'; // teal-500
            return '#3b82f6'; // blue-500
          }}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg"
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>

      {/* Painel de detalhes do nó */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}

       {/* Legenda */}
    <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 min-w-[200px]">
      <div className="flex items-center gap-2 mb-3">
        <RiInformationLine className="w-4 h-4 text-blue-500" />
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Legenda do Fluxo
        </h4>
      </div>
      
      <div className="space-y-2">
        {/* Nó de Entrada */}
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/50 border-2 border-green-400 dark:border-green-500 rounded-lg flex items-center justify-center">
            <RiPlayCircleLine className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Início</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Nó de entrada do fluxo</p>
          </div>
        </div>

        {/* Nó Normal */}
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/50 border-2 border-blue-400 dark:border-blue-500 rounded-lg flex items-center justify-center">
            <RiCodeBoxLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Processo</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Nó de processamento</p>
          </div>
        </div>

        {/* Nó Interativo */}
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900/40 dark:to-teal-800/50 border-2 border-teal-400 dark:border-teal-500 rounded-lg flex items-center justify-center">
            <RiChatSmile2Line className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Interativo</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Requere interação</p>
          </div>
        </div>

        {/* Nó de Fim */}
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/50 border-2 border-red-400 dark:border-red-500 rounded-full flex items-center justify-center">
            <RiStopCircleLine className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fim</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">Final do fluxo</p>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>

        {/* Ícones de Modelos com toggle */}
        <div className="space-y-2">
          <button 
            onClick={() => setIsModelsVisible(!isModelsVisible)}
            className="flex items-center justify-between w-full text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors group"
          >
            <span className="flex items-center gap-2">
              <RiBrainLine className="w-3 h-3" />
              Provedores de Modelo
            </span>
            {isModelsVisible ? (
              <RiSubtractLine className="w-3 h-3 transition-transform group-hover:scale-110" />
            ) : (
              <RiAddLine className="w-3 h-3 transition-transform group-hover:scale-110" />
            )}
          </button>
          
          {isModelsVisible && (
            <div className="grid grid-cols-2 gap-2 pl-5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <RiOpenaiLine className="w-4 h-4 text-green-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">OpenAI</span>
              </div>
              <div className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <RiGoogleLine className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Google</span>
              </div>
              <div className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <RiBrainLine className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Anthropic</span>
              </div>
              <div className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <RiMicrosoftLine className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-gray-600 dark:text-gray-400">Microsoft</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Instruções */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium mb-2">Nenhum nó no workflow</p>
            <p className="text-sm">Crie nós para visualizá-los aqui</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowVisualization;
