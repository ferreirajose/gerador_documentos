// hooks/useNodeFormController.ts
import { useWorkflow } from "@/context/WorkflowContext";
import NodeEntitie from "@/domain/entities/NodeEntitie";
import { useRef, useState, } from "react";

interface Entrada {
  variavel_prompt: string;
  fonte: 'documento_anexado' | 'saida_no_anterior';
  documento?: string;
  no_origem?: string;
  processar_em_paralelo?: boolean;
}

interface FormData {
  nome: string;
  categoria: "entrada" | "processamento" | "saida";
  modelo_llm: string;
  temperatura: number;
  prompt: string;
  entradas: Entrada[];
  saida: { nome: string; formato: "json" | "markdown" };
  ferramentas: string[];
}

export function useNodeFormController(onSuccess?: () => void) {
  const { addNode } = useWorkflow();

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    categoria: "entrada",
    modelo_llm: "o3",
    temperatura: 0.3,
    prompt: "",
    entradas: [] as Entrada[],
    saida: { nome: "", formato: "json" },
    ferramentas: [] as string[],
  });
  
  const [showVariableSelector, setShowVariableSelector] = useState(false);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Criar o nó diretamente sem usar WorkflowBuilder
      const node = new NodeEntitie(
        formData.nome,
        formData.categoria,
        formData.prompt,
        formData.saida,
        formData.entradas,
        formData.modelo_llm,
        formData.temperatura,
        formData.ferramentas
      );

      // Validar o nó individualmente
      node.validate();

      // Adicionar ao estado global do workflow
      addNode({
        id: `node_${Date.now()}`,
        nome: node.nome,
        categoria: node.categoria,
        prompt: node.prompt,
        modelo_llm: node.modelo_llm,
        temperatura: node.temperatura,
        ferramentas: node.ferramentas,
        saida: node.saida,
        entradas: node.entradas,
      });

      console.log('✅ Nó criado com sucesso:', node);
      
      // Limpar formulário
      setFormData({
        nome: "",
        categoria: "entrada",
        modelo_llm: "o3",
        temperatura: 0.3,
        prompt: "",
        entradas: [],
        saida: { nome: "", formato: "json" },
        ferramentas: [],
      });

      // Chamar callback de sucesso
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('❌ Erro ao criar nó:', error);
      alert(`Erro ao criar nó: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // ✅ Adicionar entrada
  const addEntrada = () => {
    const novaEntrada: Entrada = {
      variavel_prompt: "",
      fonte: "documento_anexado",
      documento: "",
      processar_em_paralelo: false
    };
    
    setFormData(prev => ({
      ...prev,
      entradas: [...prev.entradas, novaEntrada]
    }));
  };

  // ✅ Remover entrada
  const removeEntrada = (index: number) => {
    setFormData(prev => ({
      ...prev,
      entradas: prev.entradas.filter((_, i) => i !== index)
    }));
  };

  // ✅ Atualizar entrada
  const updateEntrada = (index: number, field: keyof Entrada, value: any) => {
    setFormData(prev => {
      const novasEntradas = [...prev.entradas];
      const entradaAtual = { ...novasEntradas[index] };
      
      // Atualizar campo
      entradaAtual[field] = value;
      
      // Limpar campos quando a fonte mudar
      if (field === 'fonte') {
        if (value === 'documento_anexado') {
          delete entradaAtual.no_origem;
        } else if (value === 'saida_no_anterior') {
          delete entradaAtual.documento;
          delete entradaAtual.processar_em_paralelo;
        }
      }
      
      novasEntradas[index] = entradaAtual;
      
      return {
        ...prev,
        entradas: novasEntradas
      };
    });
  };

  // ✅ Atualizar saída
  const updateSaida = (field: keyof FormData['saida'], value: any) => {
    setFormData(prev => ({
      ...prev,
      saida: {
        ...prev.saida,
        [field]: value
      }
    }));
  };

  // ✅ Manipular ferramentas
  const handleFerramentaChange = (ferramenta: string) => {
    setFormData(prev => {
      const ferramentasAtuais = prev.ferramentas || [];
      const novasFerramentas = ferramentasAtuais.includes(ferramenta)
        ? ferramentasAtuais.filter(f => f !== ferramenta)
        : [...ferramentasAtuais, ferramenta];

      return {
        ...prev,
        ferramentas: novasFerramentas
      };
    });
  };

  
  const getAvailableVariables = () => {
    return formData.entradas.map(entrada => entrada.variavel_prompt).filter(v => v.trim() !== '');
  };

  
  const insertVariableInPrompt = (variable: string) => {
    const textarea = promptTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentPrompt = formData.prompt;
      const newPrompt = currentPrompt.substring(0, start) + `{${variable}}` + currentPrompt.substring(end);
      
      setFormData({ ...formData, prompt: newPrompt });
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2);
      }, 0);
    }
    setShowVariableSelector(false);
  };


  return {
    formData,
    showVariableSelector,
    promptTextareaRef,
    getAvailableVariables,
    setShowVariableSelector,
    insertVariableInPrompt,
    setFormData,
    handleSubmit,
    handleFerramentaChange,
    addEntrada,
    removeEntrada,
    updateEntrada,
    updateSaida,
  };
}