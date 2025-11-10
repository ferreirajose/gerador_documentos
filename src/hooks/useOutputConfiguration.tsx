// hooks/useOutputConfiguration.tsx
import { useState, useEffect } from 'react';
import { useWorkflow } from '@/context/WorkflowContext';
import { Combinacao } from '@/domain/entities/ResultadoFinal';

export interface OutputConfig {
  id: string;
  nome_da_saida: string;
  combinar_resultados: string[];
  manter_originais: boolean;
}

export function useOutputConfiguration() {
  const { state, updateResultadoFinal } = useWorkflow();
  const [combinacoes, setCombinacoes] = useState<OutputConfig[]>([]);
  const [saidasIndividuais, setSaidasIndividuais] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [collapsedCards, setCollapsedCards] = useState<Set<string>>(new Set());
  const [isWorkflowVisible, setIsWorkflowVisible] = useState(true);

  // Obter todas as saídas disponíveis dos nós
  const availableOutputs = state.nodes
    .map(node => node.saida.nome)
    .filter((nome, index, array) => array.indexOf(nome) === index);

  // Sincronizar com o estado do contexto
  useEffect(() => {
    if (state.formato_resultado_final) {
      // Converter combinações
      const combinacoesConvertidas: OutputConfig[] = state.formato_resultado_final.combinacoes.map(combinacao => ({
        id: `combinacao-${Date.now()}-${Math.random()}`,
        nome_da_saida: combinacao.nome_da_saida,
        combinar_resultados: combinacao.combinar_resultados || [],
        manter_originais: combinacao.manter_originais || false
      }));
      
      setCombinacoes(combinacoesConvertidas);
      setSaidasIndividuais(state.formato_resultado_final.saidas_individuais || []);
    } else {
      setCombinacoes([]);
      setSaidasIndividuais([]);
    }
  }, [state.formato_resultado_final]);

  // Atualizar o contexto quando as configurações mudarem
  const atualizarContexto = (updatedCombinacoes: OutputConfig[], updatedSaidasIndividuais: string[]) => {
    const combinacoesFinais: Combinacao[] = updatedCombinacoes.map(combinacao => ({
      nome_da_saida: combinacao.nome_da_saida,
      combinar_resultados: combinacao.combinar_resultados,
      manter_originais: combinacao.manter_originais
    }));

    updateResultadoFinal(combinacoesFinais, updatedSaidasIndividuais);
  };

  const addCombinacao = () => {
    const newCombinacao: OutputConfig = {
      id: `combinacao-${Date.now()}`,
      nome_da_saida: "",
      combinar_resultados: [],
      manter_originais: false,
    };
    const updatedCombinacoes = [...combinacoes, newCombinacao];
    setCombinacoes(updatedCombinacoes);
    atualizarContexto(updatedCombinacoes, saidasIndividuais);
  };

  const removeCombinacao = (id: string) => {
    const updatedCombinacoes = combinacoes.filter((c) => c.id !== id);
    setCombinacoes(updatedCombinacoes);
    atualizarContexto(updatedCombinacoes, saidasIndividuais);
  };

  const updateCombinacao = (id: string, field: keyof OutputConfig, value: any) => {
    const updatedCombinacoes = combinacoes.map((c) => {
      if (c.id === id) {
        const updated = { ...c, [field]: value };
        
        // Limpar campos conflitantes
        if (field === 'manter_originais' && value === true) {
          updated.combinar_resultados = [];
        } else if (field === 'combinar_resultados' && value && value.length > 0) {
          updated.manter_originais = false;
        }
        
        return updated;
      }
      return c;
    });
    
    setCombinacoes(updatedCombinacoes);
    atualizarContexto(updatedCombinacoes, saidasIndividuais);
  };

  const toggleSaidaIndividual = (outputName: string) => {
    const updatedSaidasIndividuais = saidasIndividuais.includes(outputName)
      ? saidasIndividuais.filter((name) => name !== outputName)
      : [...saidasIndividuais, outputName];

    setSaidasIndividuais(updatedSaidasIndividuais);
    atualizarContexto(combinacoes, updatedSaidasIndividuais);
  };

  const toggleOutputInCombinar = (combinacaoId: string, outputName: string) => {
    const combinacao = combinacoes.find((c) => c.id === combinacaoId);
    if (!combinacao) return;

    const combinar_resultados = combinacao.combinar_resultados || [];
    const updatedCombinar = combinar_resultados.includes(outputName)
      ? combinar_resultados.filter((name) => name !== outputName)
      : [...combinar_resultados, outputName];

    updateCombinacao(combinacaoId, "combinar_resultados", updatedCombinar);
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

  // Validar se pode adicionar mais combinações
  const podeAdicionar = availableOutputs.length > 0;

  // Retornar todas as funções e estados necessários
  return {
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
  };
}