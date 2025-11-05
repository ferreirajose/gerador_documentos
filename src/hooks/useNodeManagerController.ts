// useNodeManagerController.ts
import { FERRAMENTAS_DISPONIVEIS } from "@/data/ferramentas";
import { llmModelsByProvider } from "@/data/llmodels";
import WorkflowHttpGatewayV2 from "@/gateway/WorkflowHttpGatewayV2";
import FetchAdapter from "@/infra/FetchAdapter";
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
  status: 'pending' | 'uploading' | 'completed' | 'error';
  uuid?: string; // Adicionar UUID após upload bem-sucedido
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


const BASE_URL = import.meta.env.VITE_API_URL_MINUTA;
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

export function useNodeManagerController() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showVariableSelector, setShowVariableSelector] = useState(false);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadedFiles, setUploadedFiles] = useState<ArquivoUpload[]>([]); 
  
  // Inicializar HTTP client
  const httpClient = new FetchAdapter();
  const workflowGateway = new WorkflowHttpGatewayV2(
    httpClient,
    BASE_URL,
    AUTH_TOKEN
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar dados com UUIDs dos documentos
    const workflowData = prepareWorkflowData();
    
    console.log("Dados do workflow para envio:", workflowData);
    
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

  const retryUpload = async (documentoIndex: number, arquivoId: string) => {
    const documento = formData.documentosAnexados[documentoIndex];
    const arquivoIndex = documento.arquivos.findIndex(arquivo => arquivo.id === arquivoId);
    
    if (arquivoIndex === -1) return;

    await processFileUpload(documento.arquivos[arquivoIndex], documentoIndex, arquivoIndex);
  };


  const processFileUpload = async (uploadedFile: ArquivoUpload, documentoIndex: number, arquivoIndex: number) => {
    try {
      // Atualizar status para uploading
      setFormData(prev => {
        const updatedDocumentos = [...prev.documentosAnexados];
        const arquivos = [...updatedDocumentos[documentoIndex].arquivos];
        arquivos[arquivoIndex] = {
          ...arquivos[arquivoIndex],
          status: 'uploading'
        };
        updatedDocumentos[documentoIndex] = {
          ...updatedDocumentos[documentoIndex],
          arquivos
        };
        return { ...prev, documentosAnexados: updatedDocumentos };
      });

      // Fazer upload do arquivo
      const response = await workflowGateway.uploadAndProcess(uploadedFile.file);
      
      if (response.success && response.data) {
        const uuidDocumento = response.data.uuid_documento;

        console.log('✅ Arquivo uploadado com sucesso:', uploadedFile.name, 'UUID:', uuidDocumento);
        
        // Atualizar arquivo com UUID e status completed
        setFormData(prev => {
          const updatedDocumentos = [...prev.documentosAnexados];
          const arquivos = [...updatedDocumentos[documentoIndex].arquivos];
          arquivos[arquivoIndex] = {
            ...arquivos[arquivoIndex],
            status: 'completed',
            uuid: uuidDocumento
          };
          updatedDocumentos[documentoIndex] = {
            ...updatedDocumentos[documentoIndex],
            arquivos
          };
          return { ...prev, documentosAnexados: updatedDocumentos };
        });
        
      } else {
        throw new Error(response.message || 'Erro no upload');
      }
      
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      
      // Atualizar status para error
      setFormData(prev => {
        const updatedDocumentos = [...prev.documentosAnexados];
        const arquivos = [...updatedDocumentos[documentoIndex].arquivos];
        arquivos[arquivoIndex] = {
          ...arquivos[arquivoIndex],
          status: 'error'
        };
        updatedDocumentos[documentoIndex] = {
          ...updatedDocumentos[documentoIndex],
          arquivos
        };
        return { ...prev, documentosAnexados: updatedDocumentos };
      });
    }
  };

  // Funções para upload de arquivos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentoIndex: number) => {
    const files = event.target.files;
    if (!files) return;

    const novosArquivos: ArquivoUpload[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      status: 'pending' as const
    }));

    setFormData(prev => {
      const updatedDocumentos = [...prev.documentosAnexados];
      const documentoAtual = updatedDocumentos[documentoIndex];
      
      let arquivosAtualizados: ArquivoUpload[];
      
      if (documentoAtual.tipo === 'lista') {
        // Para lista, adiciona todos os arquivos
        arquivosAtualizados = [...documentoAtual.arquivos, ...novosArquivos];
      } else {
        // Para único, mantém apenas o último arquivo
        arquivosAtualizados = [novosArquivos[0]]; // Pega apenas o primeiro arquivo
      }

      updatedDocumentos[documentoIndex] = {
        ...documentoAtual,
        arquivos: arquivosAtualizados
      };

      return {
        ...prev,
        documentosAnexados: updatedDocumentos
      };
    });

    // Processar upload dos novos arquivos
    const documento = formData.documentosAnexados[documentoIndex];
    const startIndex = documento.arquivos.length;
    
    novosArquivos.forEach(async (arquivo, index) => {
      await processFileUpload(arquivo, documentoIndex, startIndex + index);
    });

    // Limpa o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

   // Função para preparar dados do workflow para envio
  const prepareWorkflowData = () => {
    const documentosParaEnvio = formData.documentosAnexados
    .filter(documento => {
      // Filtrar apenas documentos que têm arquivos com upload concluído
      const hasCompletedFiles = documento.arquivos.some(
        arquivo => arquivo.status === 'completed' && arquivo.uuid
      );
      return documento.chave && documento.descricao && hasCompletedFiles;
    })
    .map(documento => {
      // Filtrar apenas arquivos com upload concluído e com UUID
      const uuids = documento.arquivos
        .filter(arquivo => arquivo.status === 'completed' && arquivo.uuid)
        .map(arquivo => arquivo.uuid!);

      // Base do objeto (sempre inclui chave e descricao)
      const documentoBase = {
        chave: documento.chave,
        descricao: documento.descricao
      };

      // Para tipo único - usar uuid_unico
      if (documento.tipo === 'unico' && uuids.length > 0) {
        return {
          ...documentoBase,
          uuid_unico: uuids[0] // Pega o primeiro UUID (único arquivo)
        };
      }

      // Para tipo lista - usar uuids_lista
      if (documento.tipo === 'lista' && uuids.length > 0) {
        return {
          ...documentoBase,
          uuids_lista: uuids // Array com todos os UUIDs
        };
      }

      return null;
    })
    .filter(Boolean); // Remove null values

    return {
      ...formData,
      documentosAnexados: documentosParaEnvio
    };
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
    retryUpload, // Exportar retryUpload
    insertVariableInPrompt,
    handleSubmit,
    handleInputChange,
    handleFerramentaChange,
    resetForm,
    handleSaidaFormatoChange,
    prepareWorkflowData, // Exportar para uso no componente
  };
}