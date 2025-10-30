// ListNode.tsx
import {
    RiNodeTree,
    RiEditLine,
    RiDeleteBinLine,
    RiBrainLine,
    RiTimeLine,
    RiFileTextLine,
    RiInputMethodLine,
    RiSettingsLine,
    RiOutletLine,
    RiLoginCircleLine
} from "@remixicon/react";
import { llmModelsByProvider } from "@/data/llmodels";
import { WorkflowState } from "@/context/WorkflowContext";

interface ListNodeProps {
    onOpenForm: () => void;
    state: WorkflowState;
    onEditNode?: (nodeId: string) => void;
    onDeleteNode?: (nodeId: string) => void;
}

// Função para obter informações do tipo de nó
const getNodeTypeInfo = (categoria: string) => {
    switch (categoria) {
        case 'entrada':
            return {
                icon: RiLoginCircleLine,
                color: 'bg-green-500',
                label: 'Entrada'
            };
        case 'processamento':
            return {
                icon: RiSettingsLine,
                color: 'bg-blue-500',
                label: 'Processamento'
            };
        case 'saida':
            return {
                icon: RiOutletLine,
                label: 'Saída',
                color: 'bg-purple-500'
            };
        default:
            return {
                icon: RiNodeTree,
                color: 'bg-gray-500',
                label: 'Desconhecido'
            };
    }
};

export function ListNode({ onOpenForm, state, onEditNode, onDeleteNode }: ListNodeProps) {

    return (

        <div className="space-y-6">

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Nós Criados ({state.nodes.length})
                    </h3>
                </div>

                {state.nodes.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {state.nodes.map((node) => {
                            const typeInfo = getNodeTypeInfo(node.categoria);
                            const IconComponent = typeInfo.icon;
                            return (
                                <div key={node.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className={`w-12 h-12 ${typeInfo.color} rounded-lg flex items-center justify-center`}>
                                                <IconComponent className="w-6 text-white" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{node.nome}</h4>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${node.categoria === 'entrada' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                        node.categoria === 'processamento' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                        }`}>
                                                        {typeInfo.label}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {node.modelo_llm && (
                                                        <div className="flex items-center space-x-1">
                                                            <RiBrainLine className="w-4" />
                                                            <span>
                                                                {(() => {
                                                                    // Buscar o label do modelo selecionado em todos os grupos
                                                                    let modelLabel = node.modelo_llm; // Fallback para o valor se não encontrar

                                                                    // Verificar em cada provedor
                                                                    Object.values(llmModelsByProvider).forEach(provider => {
                                                                        const foundModel = provider.models.find(m => m.value === node.modelo_llm);
                                                                        if (foundModel) {
                                                                            modelLabel = foundModel.label;
                                                                        }
                                                                    });

                                                                    return modelLabel;
                                                                })()}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center space-x-1">
                                                        <RiTimeLine className="w-4" />
                                                        <span>Temperatura: {node.temperatura || 0.3}</span>
                                                    </div>

                                                    {node.prompt && (
                                                        <div className="flex items-center space-x-1">
                                                            <RiFileTextLine className="w-4" />
                                                            <span>Prompt configurado</span>
                                                        </div>
                                                    )}

                                                    {node.entradas.length > 0 && (
                                                        <div className="flex items-center space-x-1">
                                                            <RiInputMethodLine className="w-4" />
                                                            <span>{node.entradas.length} entrada(s)</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {onEditNode && (
                                                <button
                                                    onClick={() => onEditNode(node.id)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Editar nó"
                                                >
                                                    <RiEditLine className="w-4" />
                                                </button>
                                            )}

                                            {onDeleteNode && (
                                                <button
                                                    onClick={() => onDeleteNode(node.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Excluir nó"
                                                >
                                                    <RiDeleteBinLine className="w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RiNodeTree className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum nó encontrado</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Comece criando seu primeiro nó para o workflow
                            
                        </p>
                            <button
                                onClick={onOpenForm}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                            >
                                Criar Primeiro Nó
                            </button>
                        
                    </div>
                )}
            </div>
        </div>
    );
}