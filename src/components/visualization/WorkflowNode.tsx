import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { WorkflowNodeData } from '@/types/visualization';
import { 
  RiStopCircleLine, 
  RiPlayCircleLine, 
  RiChatSmile2Line,
  RiBrainLine,
  RiRobot2Line,
  RiGoogleLine,
  RiOpenaiLine,
  RiMicrosoftLine,
  RiToolsLine,
  RiMessage2Line,
  RiCodeBoxLine
} from '@remixicon/react';
import { llmModelsByProvider } from '@/data/llmodels';

const WorkflowNode: React.FC<NodeProps<WorkflowNodeData>> = ({ data, selected }) => {
  // Mapeamento de ícones para provedores de modelo baseado na lista de LLMs
  const getModelIcon = (modelo?: string) => {
    if (!modelo) return null;
    
    const modelLower = modelo.toLowerCase();
    
    // Verifica se o modelo pertence a algum provedor conhecido
    if (llmModelsByProvider.openai.models.some(model => 
        model.value.toLowerCase() === modelLower || 
        model.label.toLowerCase().includes(modelLower))) {
      return <RiOpenaiLine className="w-4 h-4" />;
    } 
    else if (llmModelsByProvider.google.models.some(model => 
        model.value.toLowerCase() === modelLower || 
        model.label.toLowerCase().includes(modelLower))) {
      return <RiGoogleLine className="w-4 h-4" />;
    } 
    else if (llmModelsByProvider.anthropic.models.some(model => 
        model.value.toLowerCase() === modelLower || 
        model.label.toLowerCase().includes(modelLower))) {
      return <RiBrainLine className="w-4 h-4" />;
    }
    // Fallback para detecção por palavras-chave
    else if (modelLower.includes('openai') || modelLower.includes('gpt')) {
      return <RiOpenaiLine className="w-4 h-4" />;
    } 
    else if (modelLower.includes('google') || modelLower.includes('gemini')) {
      return <RiGoogleLine className="w-4 h-4" />;
    } 
    else if (modelLower.includes('claude') || modelLower.includes('anthropic')) {
      return <RiBrainLine className="w-4 h-4" />;
    }
    else if (modelLower.includes('azure') || modelLower.includes('microsoft')) {
      return <RiMicrosoftLine className="w-4 h-4" />;
    } 
    else {
      return <RiRobot2Line className="w-4 h-4" />;
    }
  };

  // Função para obter o nome amigável do modelo
  const getModelLabel = (modelo?: string) => {
    if (!modelo) return '';
    
    const modelLower = modelo.toLowerCase();
    
    // Procura o modelo na lista de LLMs
    for (const provider of Object.values(llmModelsByProvider)) {
      const foundModel = provider.models.find(model => 
        model.value.toLowerCase() === modelLower || 
        model.label.toLowerCase().includes(modelLower)
      );
      if (foundModel) {
        return foundModel.label;
      }
    }
    
    // Fallback: retorna a primeira parte do modelo ou o próprio valor
    return modelo.split('-')[0] || modelo;
  };

  // Cores e estilos baseados no tipo de nó
  const getNodeStyle = () => {
    if (data.isEndNode && data.label === 'FIM') {
      return {
        bgClass: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/30',
        borderClass: 'border-red-300 dark:border-red-500',
        textClass: 'text-red-900 dark:text-red-100',
        icon: <RiStopCircleLine className="w-6 h-6" />,
        headerClass: 'from-red-500 to-red-600',
      };
    } else if (data.isEntryNode) {
      return {
        bgClass: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30',
        borderClass: 'border-green-300 dark:border-green-500',
        textClass: 'text-green-900 dark:text-green-100',
        icon: <RiPlayCircleLine className="w-5 h-5" />,
        headerClass: 'from-green-500 to-green-600',
      };
    } else if (data.hasInteraction) {
      return {
        bgClass: 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/30',
        borderClass: 'border-teal-300 dark:border-teal-500',
        textClass: 'text-teal-900 dark:text-teal-100',
        icon: <RiChatSmile2Line className="w-5 h-5" />,
        headerClass: 'from-teal-500 to-teal-600',
      };
    } else {
      return {
        bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30',
        borderClass: 'border-blue-300 dark:border-blue-500',
        textClass: 'text-blue-900 dark:text-blue-100',
        icon: <RiCodeBoxLine className="w-5 h-5" />,
        headerClass: 'from-blue-500 to-blue-600',
      };
    }
  };

  const style = getNodeStyle();
  const isEndNode = data.isEndNode && data.label === 'FIM';
  const modelIcon = getModelIcon(data.modelo);
  const modelLabel = getModelLabel(data.modelo);

  return (
    <div
      className={`
        ${style.bgClass} ${style.borderClass} ${style.textClass}
        ${isEndNode ? 'rounded-full w-28 h-20' : 'rounded-xl w-64'}
        border shadow-lg backdrop-blur-sm
        ${selected ? 'ring-4 ring-blue-400 ring-opacity-50 shadow-xl scale-105' : ''}
        transition-all duration-200 hover:shadow-xl hover:scale-102
        cursor-pointer overflow-hidden
      `}
    >
      {/* Handle de entrada (topo) */}
      {!data.isEntryNode && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-gray-400 dark:!bg-gray-500 border-2 border-white dark:border-gray-800 opacity-80"
        />
      )}

      {/* Conteúdo do nó */}
      {isEndNode ? (
        // Nó END especial (circular)
        <div className="flex flex-col items-center justify-center h-full p-3">
          {style.icon}
          <span className="text-sm font-bold mt-1">{data.label}</span>
        </div>
      ) : (
        // Nó normal (retangular)
        <div className="h-full flex flex-col">
          {/* Cabeçalho com gradiente */}
          <div className={`bg-gradient-to-r ${style.headerClass} px-4 py-3 text-white`}>
            <div className="flex items-center gap-2">
              {style.icon}
              <h3 className="font-semibold text-sm truncate flex-1">{data.label}</h3>
              {data.hasInteraction && (
                <RiMessage2Line className="w-4 h-4 text-white/80" />
              )}
            </div>
          </div>

          {/* Corpo do nó */}
          <div className="p-4 flex-1">
            {/* Variável de saída */}
            {data.outputVariable && (
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs font-medium opacity-70">Saída</span>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                    {data.outputVariable}
                  </span>
                </div>
              </div>
            )}

            {/* Informações adicionais */}
            <div className="flex flex-wrap gap-2 mt-3">
              {data.modelo && (
                <div className="flex items-center gap-1 bg-white/70 dark:bg-gray-800/70 rounded-full px-3 py-1 border border-gray-200 dark:border-gray-700">
                  {modelIcon}
                  <span className="text-xs font-medium">
                    {modelLabel}
                  </span>
                </div>
              )}
              
              {data.ferramentas && data.ferramentas.length > 0 && (
                <div className="flex items-center gap-1 bg-purple-200/70 dark:bg-purple-800/70 rounded-full px-3 py-1 border border-purple-300 dark:border-purple-600">
                  <RiToolsLine className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {data.ferramentas.length}
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Handle de saída (base) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-gray-400 dark:!bg-gray-500 border-2 border-white dark:border-gray-800 opacity-80"
      />
    </div>
  );
};

// Memoizar para melhor performance
export default memo(WorkflowNode);