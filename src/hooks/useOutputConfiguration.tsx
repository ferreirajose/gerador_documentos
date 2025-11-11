import { useState, useEffect } from 'react';
import { useWorkflow } from '@/context/WorkflowContext';
import { Combinacao } from '@/domain/entities/ResultadoFinal';

export function useOutputConfiguration() {
  const { state, updateResultadoFinal } = useWorkflow();
  const [combinacoes, setCombinacoes] = useState<Combinacao[]>([]);
  const [saidasIndividuais, setSaidasIndividuais] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null); 
  const [collapsedCards, setCollapsedCards] = useState<Set<number>>(new Set()); 
  const [isWorkflowVisible, setIsWorkflowVisible] = useState(true);

  // Obter todas as saídas disponíveis dos nós
  const availableOutputs = state.nodes
    .map(node => node.saida.nome)
    .filter((nome, index, array) => array.indexOf(nome) === index);

  // Sincronizar com o estado do contexto
  useEffect(() => {
    if (state.formato_resultado_final) {
      setCombinacoes(state.formato_resultado_final.combinacoes);
      setSaidasIndividuais(state.formato_resultado_final.saidas_individuais || []);
    } else {
      setCombinacoes([]);
      setSaidasIndividuais([]);
    }
  }, [state.formato_resultado_final]);

  // Atualizar o contexto quando as configurações mudarem
  const atualizarContexto = (updatedCombinacoes: Combinacao[], updatedSaidasIndividuais: string[]) => {
    updateResultadoFinal(updatedCombinacoes, updatedSaidasIndividuais);
  };

  const addCombinacao = () => {
    const newCombinacao: Combinacao = {
      nome_da_saida: "",
      combinar_resultados: [],
      manter_originais: false,
    };
    const updatedCombinacoes = [...combinacoes, newCombinacao];
    setCombinacoes(updatedCombinacoes);
    atualizarContexto(updatedCombinacoes, saidasIndividuais);
  };

  const removeCombinacao = (index: number) => {
    const updatedCombinacoes = combinacoes.filter((_, i) => i !== index);
    setCombinacoes(updatedCombinacoes);
    atualizarContexto(updatedCombinacoes, saidasIndividuais);
  };

  const updateCombinacao = (index: number, field: keyof Combinacao, value: any) => {
    const updatedCombinacoes = combinacoes.map((c, i) => {
      if (i === index) {
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

  const toggleOutputInCombinar = (combinacaoIndex: number, outputName: string) => {
    const combinacao = combinacoes[combinacaoIndex];
    if (!combinacao) return;

    const combinar_resultados = combinacao.combinar_resultados || [];
    const updatedCombinar = combinar_resultados.includes(outputName)
      ? combinar_resultados.filter((name) => name !== outputName)
      : [...combinar_resultados, outputName];

    updateCombinacao(combinacaoIndex, "combinar_resultados", updatedCombinar);
  };

  const toggleCardCollapse = (index: number) => {
    const newCollapsed = new Set(collapsedCards);
    if (newCollapsed.has(index)) {
      newCollapsed.delete(index);
    } else {
      newCollapsed.add(index);
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