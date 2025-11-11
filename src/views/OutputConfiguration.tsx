import { RiAddLine, RiDeleteBinLine, RiCodeLine, RiEyeLine, RiEyeOffLine, RiCheckLine, RiCloseLine } from "@remixicon/react";
import WorkflowOutput from "../components/common/WorkflowOutput";
import { useOutputConfiguration } from "@/hooks/useOutputConfiguration";

export default function OutputConfiguration() {
  const {
    // Estados
    combinacoes,
    saidasIndividuais,
    openDropdown,
    collapsedCards,
    isWorkflowVisible,
    availableOutputs,
    podeAdicionar,
    
    // Setters
    setOpenDropdown,
    setIsWorkflowVisible,
    
    // Ações
    addCombinacao,
    removeCombinacao,
    updateCombinacao,
    toggleSaidaIndividual,
    toggleOutputInCombinar,
    toggleCardCollapse
  } = useOutputConfiguration();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuração de Saídas</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Defina como os resultados do workflow serão formatados e combinados
          </p>
        </div>
        <button
          onClick={addCombinacao}
          disabled={!podeAdicionar}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
            podeAdicionar
              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
          }`}
        >
          <RiAddLine className="w-4 h-4" />
          <span>Adicionar Combinação</span>
        </button>
      </div>

      {/* Seção de Saídas Individuais */}
      {availableOutputs.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Saídas Individuais</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Selecione as saídas que devem ser mantidas individualmente sem combinação
          </p>
          <div className="flex flex-wrap gap-2">
            {availableOutputs.map((outputName) => {
              const isSelected = saidasIndividuais.includes(outputName);
              return (
                <button
                  key={outputName}
                  type="button"
                  onClick={() => toggleSaidaIndividual(outputName)}
                  className={`px-3 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  {isSelected && <RiCheckLine className="w-4 h-4" />}
                  <span className="font-mono text-sm">{outputName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Seção de Combinações */}
      {combinacoes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <RiCodeLine className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Nenhuma combinação de saídas definida</p>
          <button
            onClick={addCombinacao}
            disabled={!podeAdicionar}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 mx-auto ${
              podeAdicionar
                ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <RiAddLine className="w-4 h-4" />
            <span>Criar primeira combinação</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6 mb-4">
          {combinacoes.map((combinacao, index) => {
            const isCollapsed = collapsedCards.has(index);

            return (
              <div key={index} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {combinacao.nome_da_saida || `Combinação ${index + 1}`}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleCardCollapse(index)}
                      className="h-8 w-8 p-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors flex items-center justify-center"
                      title={isCollapsed ? "Mostrar" : "Ocultar"}
                    >
                      {isCollapsed ? <RiEyeLine className="w-4 h-4" /> : <RiEyeOffLine className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => removeCombinacao(index)}
                      className="h-8 w-8 p-0 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor={`nome-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Nome da Saída Combinada *
                      </label>
                      <input
                        id={`nome-${index}`}
                        value={combinacao.nome_da_saida}
                        onChange={(e) => updateCombinacao(index, "nome_da_saida", e.target.value)}
                        placeholder="Ex: relatorio_completo_2024, analise_consolidada"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <input
                        type="checkbox"
                        id={`manter-${index}`}
                        checked={combinacao.manter_originais || false}
                        onChange={(e) => updateCombinacao(index, "manter_originais", e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                      />
                      <div className="flex-1">
                        <label htmlFor={`manter-${index}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                          Manter arquivos originais
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Preserva os arquivos originais das saídas combinadas
                        </p>
                      </div>
                    </div>

                    {!combinacao.manter_originais && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Combinar Resultados
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2">
                            (Selecione múltiplas opções)
                          </span>
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex flex-wrap gap-1.5 flex-1 min-h-[24px]">
                              {combinacao.combinar_resultados && combinacao.combinar_resultados.length > 0 ? (
                                combinacao.combinar_resultados.map((name) => (
                                  <span
                                    key={name}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-mono"
                                  >
                                    {name}
                                    <RiCloseLine
                                      className="w-3 h-3 cursor-pointer hover:text-blue-500"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOutputInCombinar(index, name);
                                      }}
                                    />
                                  </span>
                                ))
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Selecione os resultados para combinar
                                </span>
                              )}
                            </div>
                            <RiCodeLine className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === index ? "rotate-180" : ""}`} />
                          </button>

                          {openDropdown === index && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {availableOutputs.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                  Nenhuma saída disponível para combinar
                                </div>
                              ) : (
                                availableOutputs.map((outputName) => {
                                  const isSelected = combinacao.combinar_resultados?.includes(outputName);
                                  return (
                                    <button
                                      key={outputName}
                                      type="button"
                                      onClick={() => toggleOutputInCombinar(index, outputName)}
                                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-left"
                                    >
                                      <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{outputName}</span>
                                      {isSelected && <RiCheckLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Output do Workflow - só mostra se houver nós */}
      <WorkflowOutput
        isWorkflowVisible={isWorkflowVisible}
        setIsWorkflowVisible={setIsWorkflowVisible}
      />
    </div>
  );
}