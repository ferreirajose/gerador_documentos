// hooks/useOutputConfiguration.tsx
import { useState, useEffect } from 'react';
import { useWorkflow } from '@/context/WorkflowContext';
import { SaidaFinal } from '@/domain/entities/ResultadoFinal';

export interface OutputConfig {
  id: string;
  nome: string;
  combinar?: string[];
  template?: string;
  manter_original?: boolean;
}

export function useOutputConfiguration() {
  const { state, updateResultadoFinal } = useWorkflow();
  const [outputs, setOutputs] = useState<OutputConfig[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());
  const [isWorkflowVisible, setIsWorkflowVisible] = useState(true);

  // Obter todas as saídas disponíveis dos nós
  const availableOutputs = state.nodes
    .map(node => node.saida.nome)
    .filter((nome, index, array) => array.indexOf(nome) === index);

  // Sincronizar com o estado do contexto
  useEffect(() => {
    if (state.resultado_final) {
      const saidasConvertidas: OutputConfig[] = state.resultado_final.saidas.map(saida => ({
        id: `output-${Date.now()}-${Math.random()}`,
        nome: saida.nome,
        combinar: saida.combinar,
        template: saida.template,
        manter_original: saida.manter_original
      }));
      setOutputs(saidasConvertidas);
    } else {
      setOutputs([]);
    }
  }, [state.resultado_final]);

  // Atualizar o contexto quando outputs mudarem
  const atualizarContexto = (updatedOutputs: OutputConfig[]) => {
    const saidasFinais: SaidaFinal[] = updatedOutputs.map(output => ({
      nome: output.nome,
      ...(output.combinar && output.combinar.length > 0 && { combinar: output.combinar }),
      ...(output.template && { template: output.template }),
      ...(output.manter_original && { manter_original: output.manter_original })
    }));

    updateResultadoFinal(saidasFinais);
  };

  const addOutput = () => {
    const newOutput: OutputConfig = {
      id: `output-${Date.now()}`,
      nome: "",
      combinar: [],
      template: "",
      manter_original: false,
    };
    const updatedOutputs = [...outputs, newOutput];
    setOutputs(updatedOutputs);
    atualizarContexto(updatedOutputs);
  };

  const removeOutput = (id: string) => {
    const updatedOutputs = outputs.filter((o) => o.id !== id);
    setOutputs(updatedOutputs);
    atualizarContexto(updatedOutputs);
  };

  const updateOutput = (id: string, field: keyof OutputConfig, value: any) => {
    const updatedOutputs = outputs.map((o) => {
      if (o.id === id) {
        const updated = { ...o, [field]: value };
        
        // Limpar campos conflitantes
        if (field === 'manter_original' && value === true) {
          delete updated.combinar;
          delete updated.template;
        } else if (field === 'combinar' && value && value.length > 0) {
          delete updated.manter_original;
        }
        
        return updated;
      }
      return o;
    });
    
    setOutputs(updatedOutputs);
    atualizarContexto(updatedOutputs);
  };

  const toggleOutputInCombinar = (outputId: string, outputName: string) => {
    const output = outputs.find((o) => o.id === outputId);
    if (!output) return;

    const combinar = output.combinar || [];
    const updatedCombinar = combinar.includes(outputName)
      ? combinar.filter((name) => name !== outputName)
      : [...combinar, outputName];

    updateOutput(outputId, "combinar", updatedCombinar);
  };

  const toggleOutputInTemplate = (outputId: string, outputName: string) => {
    const output = outputs.find((o) => o.id === outputId);
    if (!output) return;

    const template = output.template || "";
    const placeholder = `{${outputName}}`;

    // Toggle the placeholder in the template
    const updatedTemplate = template.includes(placeholder)
      ? template.replace(new RegExp(`\\{${outputName}\\}\\n*`, "g"), "").trim()
      : template + (template ? "\n\n" : "") + placeholder;

    updateOutput(outputId, "template", updatedTemplate);
  };

  const toggleCardCollapse = (id: string) => {
    const newCollapsed = new Set(collapsedCards);
    if (newCollapsed.has(id)) {
      newCollapsed.delete(id);
    } else {
      newCollapsed.add(id);
    }
    setCollapsedCards(newCollapsed);
  };

  // Validar se pode adicionar mais saídas
  const podeAdicionar = availableOutputs.length > 0;

  // Retornar todas as funções e estados necessários
  return {
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
  };
}