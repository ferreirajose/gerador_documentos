import { RiAddLine, RiDeleteBinLine, RiCodeLine, RiEyeLine, RiEyeOffLine, RiCheckLine, RiCloseLine } from "@remixicon/react";
import WorkflowOutput from "../components/common/WorkflowOutput";
import { useOutputConfiguration } from "@/hooks/useOutputConfiguration";

export default function OutputConfiguration() {
  const {
    // Estados
    outputs,
    openDropdown,
    collapsedCards,
    isWorkflowVisible,
    availableOutputs,
    podeAdicionar,
    
    // Setters
    setOpenDropdown,
    setIsWorkflowVisible,
    
    // Ações
    addOutput,
    removeOutput,
    updateOutput,
    toggleOutputInCombinar,
    toggleOutputInTemplate,
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
          onClick={addOutput}
          disabled={!podeAdicionar}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
            podeAdicionar
              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
          }`}
        >
          <RiAddLine className="w-4 h-4" />
          <span>Adicionar Saída</span>
        </button>
      </div>

      {outputs.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <RiCodeLine className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Nenhuma configuração de saída definida</p>
          <button
            onClick={addOutput}
            disabled={!podeAdicionar}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 mx-auto ${
              podeAdicionar
                ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <RiAddLine className="w-4 h-4" />
            <span>Criar primeira saída</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6 mb-4">
          {outputs.map((output, index) => {
            const isCollapsed = collapsedCards.has(output.id);

            return (
              <div key={output.id} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {output.nome || `Saída ${index + 1}`}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleCardCollapse(output.id)}
                      className="h-8 w-8 p-0 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors flex items-center justify-center"
                      title={isCollapsed ? "Mostrar" : "Ocultar"}
                    >
                      {isCollapsed ? <RiEyeLine className="w-4 h-4" /> : <RiEyeOffLine className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => removeOutput(output.id)}
                      className="h-8 w-8 p-0 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!isCollapsed && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor={`nome-${output.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Nome da Saída *
                      </label>
                      <input
                        id={`nome-${output.id}`}
                        value={output.nome}
                        onChange={(e) => updateOutput(output.id, "nome", e.target.value)}
                        placeholder="Ex: relatorio_completo, dados_estruturados"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <input
                        type="checkbox"
                        id={`manter-${output.id}`}
                        checked={output.manter_original || false}
                        onChange={(e) => updateOutput(output.id, "manter_original", e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                      />
                      <div className="flex-1">
                        <label htmlFor={`manter-${output.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                          Manter formato original
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Preserva a estrutura original dos dados sem transformações
                        </p>
                      </div>
                    </div>

                    {!output.manter_original && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Combinar Saídas
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2">
                              (Selecione múltiplas opções)
                            </span>
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setOpenDropdown(openDropdown === output.id ? null : output.id)}
                              className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            >
                              <div className="flex flex-wrap gap-1.5 flex-1 min-h-[24px]">
                                {output.combinar && output.combinar.length > 0 ? (
                                  output.combinar.map((name) => (
                                    <span
                                      key={name}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-mono"
                                    >
                                      {name}
                                      <RiCloseLine
                                        className="w-3 h-3 cursor-pointer hover:text-blue-500"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleOutputInCombinar(output.id, name);
                                        }}
                                      />
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Selecione as saídas para combinar
                                  </span>
                                )}
                              </div>
                              <RiCodeLine className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === output.id ? "rotate-180" : ""}`} />
                            </button>

                            {openDropdown === output.id && (
                              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {availableOutputs.length === 0 ? (
                                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                    Nenhuma saída disponível para combinar
                                  </div>
                                ) : (
                                  availableOutputs.map((outputName) => {
                                    const isSelected = output.combinar?.includes(outputName);
                                    return (
                                      <button
                                        key={outputName}
                                        type="button"
                                        onClick={() => toggleOutputInCombinar(output.id, outputName)}
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

                        <div>
                          <label htmlFor={`template-${output.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Template de Formatação
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-normal ml-2">
                              (Use {"{nome_saida}"} como placeholder)
                            </span>
                          </label>

                          {availableOutputs.length > 0 && (
                            <div className="mb-2 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Clique para adicionar ao template:</p>
                              <div className="flex flex-wrap gap-2">
                                {availableOutputs.map((outputName) => (
                                  <button
                                    key={outputName}
                                    type="button"
                                    onClick={() => toggleOutputInTemplate(output.id, outputName)}
                                    className={`px-2 py-1 text-xs rounded-md font-mono transition-colors ${
                                      output.template?.includes(`{${outputName}}`)
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                                    }`}
                                  >
                                    {"{"}
                                    {outputName}
                                    {"}"}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <textarea
                            id={`template-${output.id}`}
                            value={output.template || ""}
                            onChange={(e) => updateOutput(output.id, "template", e.target.value)}
                            placeholder="{analise_auditoria}\n\n---\n\n{analises_defesas}\n\n---\n\n{voto}"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm min-h-[120px]"
                          />
                        </div>
                      </>
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