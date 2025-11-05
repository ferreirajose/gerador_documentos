// useNodeManagerController.ts
import { FERRAMENTAS_DISPONIVEIS } from "@/data/ferramentas";
import { llmModelsByProvider } from "@/data/llmodels";
import { useRef, useState } from "react";

interface Entrada {
  variavel_prompt: string;
  fonte: "documento_anexado" | "saida_no_anterior";
  documento?: string;
  no_origem?: string;
  executar_em_paralelo?: boolean;
}

interface DocumentoAnexado {
  chave: string;
  descricao: string;
  tipo: "unico" | "lista";
  arquivos: ArquivoUpload[];
}

interface ArquivoUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

export interface FormData {
  nome: string;
  categoria: "entrada" | "processamento" | "saida";
  modelo_llm: string;
  temperatura: number;
  prompt: string;
  entradas: Entrada[];
  saida: { nome: string; formato: "json" | "markdown" };
  ferramentas: string[];
  documentosAnexados: DocumentoAnexado[];
}

const initialFormData: FormData = {
  nome: "",
  categoria: "entrada",
  modelo_llm: "claude-3-5-sonnet@20240620",
  temperatura: 0.3,
  prompt: "",
  entradas: [],
  saida: { nome: "", formato: "json" },
  ferramentas: [],
  documentosAnexados: [],
};

export function useNodeManagerController() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showVariableSelector, setShowVariableSelector] = useState(false);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados do formulário:", formData);
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    if (field === 'saida') {
      setFormData((prev) => ({ 
        ...prev, 
        saida: { ...prev.saida, nome: value } 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleFerramentaChange = (
    ferramentaValue: string,
    isChecked: boolean
  ) => {
    setFormData((prev) => {
      const ferramentas = isChecked
        ? [...prev.ferramentas, ferramentaValue]
        : prev.ferramentas.filter((f) => f !== ferramentaValue);

      return { ...prev, ferramentas };
    });
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const insertVariableInPrompt = (variable: string) => {
    const textarea = promptTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentPrompt = formData.prompt;
      const newPrompt =
        currentPrompt.substring(0, start) +
        `{${variable}}` +
        currentPrompt.substring(end);

      setFormData({ ...formData, prompt: newPrompt });

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variable.length + 2,
          start + variable.length + 2
        );
      }, 0);
    }
    setShowVariableSelector(false);
  };

  const getAvailableVariables = () => {
    return formData.entradas
      .map((entrada) => entrada.variavel_prompt)
      .filter((v) => v.trim() !== "");
  };

  const addEntrada = () => {
    const novaEntrada: Entrada = {
      variavel_prompt: '',
      fonte: 'documento_anexado',
      documento: '',
      executar_em_paralelo: false
    };
    setFormData({
      ...formData,
      entradas: [...formData.entradas, novaEntrada]
    });
  };

  const removeEntrada = (index: number) => {
    setFormData({
      ...formData,
      entradas: formData.entradas.filter((_, i) => i !== index),
    });
  };

  const updateEntrada = (index: number, field: keyof Entrada, value: any) => {
    setFormData(prev => {
      const updatedEntradas = [...prev.entradas];
      updatedEntradas[index] = {
        ...updatedEntradas[index],
        [field]: value
      };
      return {
        ...prev,
        entradas: updatedEntradas
      };
    });
  };

  // Funções para gerenciar documentos anexados
  const addDocumento = () => {
    const novoDocumento: DocumentoAnexado = {
      chave: '',
      descricao: '',
      tipo: 'unico',
      arquivos: []
    };
    setFormData(prev => ({
      ...prev,
      documentosAnexados: [...prev.documentosAnexados, novoDocumento]
    }));
  };

  const removeDocumento = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentosAnexados: prev.documentosAnexados.filter((_, i) => i !== index)
    }));
  };

  const updateDocumento = (index: number, field: keyof DocumentoAnexado, value: any) => {
    setFormData(prev => {
      const updatedDocumentos = [...prev.documentosAnexados];
      updatedDocumentos[index] = {
        ...updatedDocumentos[index],
        [field]: value
      };
      return {
        ...prev,
        documentosAnexados: updatedDocumentos
      };
    });
  };

  // Funções para upload de arquivos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, documentoIndex: number) => {
    const files = event.target.files;
    if (!files) return;

    const novosArquivos: ArquivoUpload[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));

    setFormData(prev => {
      const updatedDocumentos = [...prev.documentosAnexados];
      const documentoAtual = updatedDocumentos[documentoIndex];
      
      if (documentoAtual.tipo === 'lista') {
        // Para lista, adiciona todos os arquivos
        updatedDocumentos[documentoIndex] = {
          ...documentoAtual,
          arquivos: [...documentoAtual.arquivos, ...novosArquivos]
        };
      } else {
        // Para único, mantém apenas o último arquivo
        updatedDocumentos[documentoIndex] = {
          ...documentoAtual,
          arquivos: [novosArquivos[0]] // Pega apenas o primeiro arquivo
        };
      }

      return {
        ...prev,
        documentosAnexados: updatedDocumentos
      };
    });

    // Limpa o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeArquivo = (documentoIndex: number, arquivoId: string) => {
    setFormData(prev => {
      const updatedDocumentos = [...prev.documentosAnexados];
      updatedDocumentos[documentoIndex] = {
        ...updatedDocumentos[documentoIndex],
        arquivos: updatedDocumentos[documentoIndex].arquivos.filter(arquivo => arquivo.id !== arquivoId)
      };
      return {
        ...prev,
        documentosAnexados: updatedDocumentos
      };
    });
  };

  // Função para atualizar o formato da saída
  const handleSaidaFormatoChange = (formato: "json" | "markdown") => {
    setFormData(prev => ({
      ...prev,
      saida: { ...prev.saida, formato }
    }));
  };

  return {
    formData,
    showVariableSelector,
    promptTextareaRef,
    fileInputRef,
    modelos: llmModelsByProvider,
    ferramentasDisponiveis: FERRAMENTAS_DISPONIVEIS,
    setShowVariableSelector,
    getAvailableVariables,
    addEntrada,
    removeEntrada,
    updateEntrada,
    addDocumento,
    removeDocumento,
    updateDocumento,
    handleFileUpload,
    removeArquivo,
    insertVariableInPrompt,
    handleSubmit,
    handleInputChange,
    handleFerramentaChange,
    resetForm,
    handleSaidaFormatoChange,
  };
}