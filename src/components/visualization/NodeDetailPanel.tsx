import React, { useState } from 'react';
import { NodeState } from '@/context/WorkflowContext';
import { 
  RiCloseLine, 
  RiInformationLine,
  RiSettings3Line,
  RiToolsLine,
  RiInputMethodLine,
  RiChatSmile2Line,
  RiFileTextLine,
  RiBrainLine,
  RiPlayCircleLine,
  RiStopCircleLine,
  RiCheckboxCircleLine,
  RiTimerLine,
  RiUserLine,
  RiShieldCheckLine,
  RiArrowRightLine,
  RiCodeBoxLine
} from '@remixicon/react';

interface NodeDetailPanelProps {
  node: NodeState | null;
  onClose: () => void;
}

/**
 * Painel lateral que exibe detalhes completos e ricos de um nó quando clicado
 */
const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'inputs' | 'config' | 'prompt'>('overview');

  if (!node) {
    return null;
  }

  // Calcular estatísticas do nó
  const nodeStats = {
    inputCount: node.entradas?.length || 0,
    toolCount: node.ferramentas?.length || 0,
    hasLLM: !!node.modelo_llm,
    isInteractive: !!node.interacao_com_usuario,
    isEntry: node.entrada_grafo,
  };

  // Determinar cor do badge baseado no tipo de nó
  const getNodeTypeColor = () => {
    if (node.entrada_grafo) return 'green';
    if (node.id === 'END') return 'red';
    if (node.interacao_com_usuario) return 'teal';
    if (node.modelo_llm) return 'purple';
    return 'blue';
  };

  const nodeTypeColor = getNodeTypeColor();
  const colorClasses = {
    green: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30',
    blue: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
    teal: 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/30',
    purple: 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
    red: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
  };

  return (
    <div className="absolute bottom-2 right-4 w-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-300/50 dark:border-gray-600/50 overflow-hidden z-20">
      {/* Header com gradiente */}
      <div className={`bg-gradient-to-r ${
        nodeTypeColor === 'green' ? 'from-green-500 to-green-600' :
        nodeTypeColor === 'blue' ? 'from-blue-500 to-blue-600' :
        nodeTypeColor === 'teal' ? 'from-teal-500 to-teal-600' :
        nodeTypeColor === 'purple' ? 'from-purple-500 to-purple-600' :
        'from-red-500 to-red-600'
      } text-white p-4`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {node.entrada_grafo && <RiPlayCircleLine className="w-5 h-5" />}
            {node.id === 'END' && <RiStopCircleLine className="w-5 h-5" />}
            {node.interacao_com_usuario && <RiChatSmile2Line className="w-5 h-5" />}
            {node.modelo_llm && !node.interacao_com_usuario && <RiBrainLine className="w-5 h-5" />}
            {!node.entrada_grafo && node.id !== 'END' && !node.interacao_com_usuario && !node.modelo_llm && <RiCodeBoxLine className="w-5 h-5" />}
            <h2 className="text-lg font-bold truncate">{node.nome}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
          >
            <RiCloseLine className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-1 rounded-full text-white text-xs font-medium border ${colorClasses[nodeTypeColor]}`}>
            {node.entrada_grafo ? 'Nó de Início' :
             node.id === 'END' ? 'Nó de Fim' :
             node.interacao_com_usuario ? 'Nó Interativo' :
             node.modelo_llm ? 'Nó com LLM' : 'Nó de Processo'}
          </span>
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-200/50 dark:border-gray-600/50">
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-gray-700 dark:text-gray-300">{nodeStats.inputCount}</div>
            <div className="text-gray-500 dark:text-gray-400">Entradas</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-700 dark:text-gray-300">{nodeStats.toolCount}</div>
            <div className="text-gray-500 dark:text-gray-400">Ferramentas</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-700 dark:text-gray-300">
              {nodeStats.hasLLM ? 'Sim' : 'Não'}
            </div>
            <div className="text-gray-500 dark:text-gray-400">LLM</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-700 dark:text-gray-300">
              {nodeStats.isInteractive ? 'Sim' : 'Não'}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Interativo</div>
          </div>
        </div>
      </div>

      {/* Tabs de navegação */}
      <div className="border-b border-gray-200 dark:border-gray-600">
        <nav className="flex space-x-1 px-4">
          {[
            { id: 'overview', label: 'Visão Geral', icon: RiInformationLine },
            { id: 'inputs', label: 'Entradas', icon: RiInputMethodLine },
            { id: 'config', label: 'Configurações', icon: RiSettings3Line },
            { id: 'prompt', label: 'Prompt', icon: RiFileTextLine },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-t-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo das tabs */}
      <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto space-y-4">
        
        {/* Tab: Visão Geral */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Informações básicas */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-600/30 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <RiInformationLine className="w-4 h-4 text-blue-500" />
                Informações Básicas
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Entrada do Grafo:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    node.entrada_grafo 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {node.entrada_grafo ? (
                      <>
                        <RiCheckboxCircleLine className="w-3 h-3" />
                        Sim
                      </>
                    ) : (
                      <>
                        <RiCloseLine className="w-3 h-3" />
                        Não
                      </>
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Formato de Saída:</span>
                  <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">
                    {node.saida.formato.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Variável de Saída:</span>
                  <span className="font-mono text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                    {node.saida.nome}
                  </span>
                </div>
              </div>
            </div>

            {/* Configurações do LLM */}
            {(node.modelo_llm || node.temperatura !== undefined) && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-600/50">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <RiBrainLine className="w-4 h-4 text-purple-500" />
                  Configurações do LLM
                </h3>
                <div className="space-y-3">
                  {node.modelo_llm && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Modelo:</span>
                      <div className="font-mono text-xs bg-white dark:bg-gray-700 border border-purple-200 dark:border-purple-600 text-purple-800 dark:text-purple-300 px-3 py-2 rounded-lg">
                        {node.modelo_llm}
                      </div>
                    </div>
                  )}
                  {node.temperatura !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Temperatura:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${node.temperatura * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-medium text-gray-800 dark:text-gray-200 text-sm w-8">
                          {node.temperatura}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ferramentas */}
            {node.ferramentas && node.ferramentas.length > 0 && (
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-600/50">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <RiToolsLine className="w-4 h-4 text-orange-500" />
                  Ferramentas ({node.ferramentas.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {node.ferramentas.map((ferramenta, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-lg border border-orange-200 dark:border-orange-600"
                    >
                      <RiToolsLine className="w-3 h-3" />
                      {ferramenta}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Entradas */}
        {activeTab === 'inputs' && node.entradas && node.entradas.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              <RiInputMethodLine className="w-4 h-4 text-green-500" />
              Entradas do Nó ({node.entradas.length})
            </h3>
            {node.entradas.map((entrada, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-600/30 p-3 rounded-xl border border-gray-200/50 dark:border-gray-600/50 space-y-2"
              >
                {/* Cabeçalho da entrada */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${
                      entrada.origem === 'documento_anexado' ? 'bg-blue-100 dark:bg-blue-900/40' :
                      entrada.origem === 'resultado_no_anterior' ? 'bg-green-100 dark:bg-green-900/40' :
                      'bg-purple-100 dark:bg-purple-900/40'
                    }`}>
                      {entrada.origem === 'documento_anexado' && <RiFileTextLine className="w-3 h-3 text-blue-600 dark:text-blue-400" />}
                      {entrada.origem === 'resultado_no_anterior' && <RiArrowRightLine className="w-3 h-3 text-green-600 dark:text-green-400" />}
                      {entrada.origem === 'documento_upload_execucao' && <RiUserLine className="w-3 h-3 text-purple-600 dark:text-purple-400" />}
                    </div>
                    <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                      {entrada.variavel_prompt}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                    {entrada.origem === 'documento_anexado' && '📄 Documento'}
                    {entrada.origem === 'resultado_no_anterior' && '🔗 Nó Anterior'}
                    {entrada.origem === 'documento_upload_execucao' && '📤 Upload'}
                  </span>
                </div>

                {/* Detalhes específicos da origem */}
                <div className="space-y-1 text-xs">
                  {entrada.origem === 'documento_anexado' && entrada.chave_documento_origem && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Chave do documento:</span>
                      <code className="font-mono bg-white dark:bg-gray-600 px-1 rounded">
                        {entrada.chave_documento_origem}
                      </code>
                    </div>
                  )}
                  
                  {entrada.origem === 'resultado_no_anterior' && entrada.nome_no_origem && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Nó de origem:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {entrada.nome_no_origem}
                      </span>
                    </div>
                  )}
                  
                  {entrada.origem === 'documento_upload_execucao' && entrada.quantidade_arquivos && (
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Quantidade de arquivos:</span>
                      <span className="font-medium text-purple-600 dark:text-purple-400">
                        {entrada.quantidade_arquivos}
                      </span>
                    </div>
                  )}
                </div>

                {/* Execução em paralelo */}
                {entrada.executar_em_paralelo && (
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                    <RiTimerLine className="w-3 h-3" />
                    ⚡ Execução em paralelo habilitada
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab: Configurações */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            {/* Interação com Usuário */}
            {node.interacao_com_usuario && (
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-xl p-4 border border-teal-200/50 dark:border-teal-600/50">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <RiChatSmile2Line className="w-4 h-4 text-teal-500" />
                  💬 Interação com Usuário
                </h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Usuário pode finalizar', value: node.interacao_com_usuario.permitir_usuario_finalizar, icon: RiUserLine },
                    { label: 'IA pode concluir', value: node.interacao_com_usuario.ia_pode_concluir, icon: RiBrainLine },
                    { label: 'Requer aprovação explícita', value: node.interacao_com_usuario.requer_aprovacao_explicita, icon: RiShieldCheckLine },
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <item.icon className="w-3 h-3" />
                        {item.label}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        item.value 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      }`}>
                        {item.value ? (
                          <>
                            <RiCheckboxCircleLine className="w-3 h-3" />
                            Sim
                          </>
                        ) : (
                          <>
                            <RiCloseLine className="w-3 h-3" />
                            Não
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <RiTimerLine className="w-3 h-3" />
                      Máximo de interações:
                    </span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-600 px-2 py-1 rounded">
                      {node.interacao_com_usuario.maximo_de_interacoes}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Modo de saída:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-600 px-2 py-1 rounded text-xs">
                      {node.interacao_com_usuario.modo_de_saida}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações avançadas */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-600/30 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <RiSettings3Line className="w-4 h-4 text-gray-500" />
                Configurações Avançadas
              </h3>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>ID do Nó: <code className="bg-white dark:bg-gray-600 px-1 rounded">{node.id}</code></div>
                <div>Tipo: <code className="bg-white dark:bg-gray-600 px-1 rounded">{node.tipo}</code></div>
                {node.modelo_llm && (
                  <div>Provedor LLM: <code className="bg-white dark:bg-gray-600 px-1 rounded">
                    {node.modelo_llm.includes('gpt') ? 'OpenAI' : 
                     node.modelo_llm.includes('claude') ? 'Anthropic' :
                     node.modelo_llm.includes('gemini') ? 'Google' : 'Custom'}
                  </code></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Prompt */}
        {activeTab === 'prompt' && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <RiFileTextLine className="w-4 h-4 text-blue-500" />
              Prompt do Nó
            </h3>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-600/50">
              <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
                {node.prompt || <span className="text-gray-400 dark:text-gray-500 italic">Nenhum prompt definido</span>}
              </pre>
            </div>
            
            {node.prompt && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 p-2 rounded-lg">
                <RiInformationLine className="w-3 h-3" />
                {node.prompt.length} caracteres • Aprox. {Math.ceil(node.prompt.length / 5)} tokens
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer com ações */}
      <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-700/30 border-t border-gray-200/50 dark:border-gray-600/50">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            Última atualização: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailPanel;