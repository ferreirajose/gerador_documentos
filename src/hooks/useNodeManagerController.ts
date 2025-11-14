import { NodeState, useWorkflow } from "@/context/WorkflowContext";
import { FERRAMENTAS_DISPONIVEIS } from "@/data/ferramentas";
import { llmModelsByProvider } from "@/data/llmodels";
import { Entrada, InteracaoComUsuario as InteracaoComUsuario2,
} from "@/domain/entities/NodeEntitie";
import WorkflowHttpGatewayV2 from "@/gateway/WorkflowHttpGatewayV2";
import FetchAdapter from "@/infra/FetchAdapter";
import { useCallback, useEffect, useRef, useState } from "react";

interface InteracaoComUsuario extends InteracaoComUsuario2 {
  habilitado: boolean;
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
  status: "pending" | "uploading" | "completed" | "error";
  uuid?: string;
}

export interface FormData {
  nome: string;
  entrada_grafo: boolean;
  modelo_llm: string;
  temperatura: number;
  prompt: string;
  entradas: Entrada[];
  saida: { nome: string; formato: "json" | "markdown" };
  ferramentas: string[];
  documentosAnexados: DocumentoAnexado[];
  interacao_com_usuario: InteracaoComUsuario;
}

const initialFormData: FormData = {
  nome: "",
  entrada_grafo: false,
  modelo_llm: "o3",
  temperatura: 0.3,
  prompt: "",
  entradas: [],
  saida: { nome: "", formato: "markdown" },
  ferramentas: [],
  documentosAnexados: [],
  interacao_com_usuario: {
    habilitado: false, // Novo campo para controlar se a interação está ativa, apenas na UI
    permitir_usuario_finalizar: false,
    ia_pode_concluir: true,
    requer_aprovacao_explicita: false,
    maximo_de_interacoes: 1,
    modo_de_saida: "ultima_mensagem",
  },
};

const BASE_URL = import.meta.env.VITE_API_URL_MINUTA;
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

export function useNodeManagerController() {
  const { state, addNode, updateNode, addDocumentoAnexo, removeDocumentosPorChave } = useWorkflow();
  const [documentsToRemove, setDocumentsToRemove] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showVariableSelector, setShowVariableSelector] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
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
    // VALIDAÇÃO DE NOME ÚNICO NO FRONTEND
    const existingNodes = state.nodes;
    if (isEditing) {
      // Em modo edição, exclui o próprio nó da verificação
      const otherNodes = existingNodes.filter(node => node.id !== editingNodeId);
      const duplicateNode = otherNodes.find(node => node.nome === formData.nome);
      if (duplicateNode) {
        throw new Error(`Já existe um nó com o nome "${formData.nome}"`);
      }
    } else {
      // Em modo criação, verifica todos os nós
      const duplicateNode = existingNodes.find(node => node.nome === formData.nome);
      if (duplicateNode) {
        throw new Error(`Já existe um nó com o nome "${formData.nome}"`);
      }
    }

    const workflowData = buildAttachedDocument();

    console.log("Dados do workflow para envio:", workflowData);

    try {
      // Remover a propriedade 'habilitado' antes de salvar
      const { habilitado, ...interacaoComUsuarioSemHabilitado } = formData.interacao_com_usuario;

      const nodeData = {
        ...formData,
        interacao_com_usuario: formData.interacao_com_usuario.habilitado 
          ? interacaoComUsuarioSemHabilitado 
          : undefined
      };

      if (isEditing && editingNodeId) {
        // Modo edição - atualizar nó existente
        const updatedNode: NodeState = {
          id: editingNodeId,
          ...nodeData,
        };
        updateNode(updatedNode);
        console.log("Nó atualizado com sucesso:", updatedNode);
      } else {
        // Modo criação - adicionar novo nó
        const newNode: NodeState = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          ...nodeData,
        };
        addNode(newNode);
        console.log("Nó criado com sucesso:", newNode);
      }

      // Adicionar cada documento individualmente
      if (workflowData.documentosAnexados && Array.isArray(workflowData.documentosAnexados)) {
        workflowData.documentosAnexados.forEach((documento: any) => {
          if (documento) {
            addDocumentoAnexo(documento);
          }
        });
      }

      // Limpar o formulário após sucesso
      resetForm();
    } catch (error) {
      console.error("Erro ao criar/atualizar nó:", error);
    }
  };

  // Carregar dados do nó para edição
  const loadNodeData = useCallback((nodeId: string) => {
    const node = state.nodes.find((n) => n.id === nodeId);
    if (node) {
      // Verificar se o nó tem interacao_com_usuario configurada
       const hasInteracaoUsuario = !!(node.interacao_com_usuario && 
        Object.keys(node.interacao_com_usuario).length > 0);
      
      setFormData({
        nome: node.nome || "",
        entrada_grafo: node.entrada_grafo,
        modelo_llm: node.modelo_llm || "",
        temperatura: node.temperatura || 0,
        ferramentas: node.ferramentas || [],
        prompt: node.prompt || "",
        documentosAnexados: node.documentosAnexados || [],
        entradas: node.entradas || [],
        saida: node.saida || { nome: "", formato: "json" },
        interacao_com_usuario: {
          habilitado: hasInteracaoUsuario,
          permitir_usuario_finalizar: node.interacao_com_usuario?.permitir_usuario_finalizar || false,
          ia_pode_concluir: node.interacao_com_usuario?.ia_pode_concluir ?? true,
          requer_aprovacao_explicita: node.interacao_com_usuario?.requer_aprovacao_explicita || false,
          maximo_de_interacoes: node.interacao_com_usuario?.maximo_de_interacoes || 1,
          modo_de_saida: node.interacao_com_usuario?.modo_de_saida || "ultima_mensagem",
        }
      });
      setIsEditing(true);
      setEditingNodeId(nodeId);
    }
  },[state.nodes]);

  // NOVO MÉTODO: Reset para modo criação
  const resetToCreateMode = () => {
    resetForm();
    setIsEditing(false);
    setEditingNodeId(null);
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    if (field === "saida") {
      setFormData((prev) => ({
        ...prev,
        saida: { ...prev.saida, nome: value },
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
    setIsEditing(false);
    setEditingNodeId(null);
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
      variavel_prompt: "",
      origem: "documento_anexado",
      chave_documento_origem: "",
      executar_em_paralelo: false,
    };
    setFormData({
      ...formData,
      entradas: [...formData.entradas, novaEntrada],
    });
  };

  const removeEntrada = (index: number) => {
    setFormData({
      ...formData,
      entradas: formData.entradas.filter((_, i) => i !== index),
    });
  };

  const updateEntrada = <K extends keyof Entrada>(index: number, field: K, value: Entrada[K]) => {
    setFormData((prev) => {
      const updatedEntradas = [...prev.entradas];
      updatedEntradas[index] = {
        ...updatedEntradas[index],
        [field]: value,
      };
      return {
        ...prev,
        entradas: updatedEntradas,
      };
    });
  };

  const addDocumento = () => {
    const novoDocumento: DocumentoAnexado = {
      chave: "",
      descricao: "",
      tipo: "unico",
      arquivos: [],
    };
    setFormData((prev) => ({
      ...prev,
      documentosAnexados: [...prev.documentosAnexados, novoDocumento],
    }));
  };

  const removeDocumento = (index: number) => {
      setFormData((prev) => {
          const documentoRemovido = prev.documentosAnexados[index];
          // Agendar remoção do estado global
          if (documentoRemovido?.chave) {
              setDocumentsToRemove(prev => [...prev, documentoRemovido.chave]);
          }
          // Remover imediatamente do formData (UI)
          return {
              ...prev,
              documentosAnexados: prev.documentosAnexados.filter((_, i) => i !== index),
          };
      });
  };

  // Efeito para remover documentos do estado global
  useEffect(() => {
      if (documentsToRemove.length > 0) {
          removeDocumentosPorChave(documentsToRemove);
          setDocumentsToRemove([]);
      }
  }, [documentsToRemove, removeDocumentosPorChave]);

  const updateDocumento = (
    index: number,
    field: keyof DocumentoAnexado,
    value: any
  ) => {
    setFormData((prev) => {
      const updatedDocumentos = [...prev.documentosAnexados];
      updatedDocumentos[index] = {
        ...updatedDocumentos[index],
        [field]: value,
      };
      return {
        ...prev,
        documentosAnexados: updatedDocumentos,
      };
    });
  };

  const retryUpload = async (documentoIndex: number, arquivoId: string) => {
    const documento = formData.documentosAnexados[documentoIndex];
    const arquivoIndex = documento.arquivos.findIndex(
      (arquivo) => arquivo.id === arquivoId
    );

    if (arquivoIndex === -1) return;

    await processFileUpload(
      documento.arquivos[arquivoIndex],
      documentoIndex,
      arquivoIndex
    );
  };

  const processFileUpload = async (
    uploadedFile: ArquivoUpload,
    documentoIndex: number,
    arquivoIndex: number
  ) => {
    try {
      setFormData((prev) => {
        const updatedDocumentos = [...prev.documentosAnexados];
        const arquivos = [...updatedDocumentos[documentoIndex].arquivos];
        arquivos[arquivoIndex] = {
          ...arquivos[arquivoIndex],
          status: "uploading",
        };
        updatedDocumentos[documentoIndex] = {
          ...updatedDocumentos[documentoIndex],
          arquivos,
        };
        return { ...prev, documentosAnexados: updatedDocumentos };
      });

      const response = await workflowGateway.uploadAndProcess(
        uploadedFile.file
      );

      if (response.success && response.data) {
        const uuidDocumento = response.data.uuid_documento;

        console.log(
          "✅ Arquivo uploadado com sucesso:",
          uploadedFile.name,
          "UUID:",
          uuidDocumento
        );

        setFormData((prev) => {
          const updatedDocumentos = [...prev.documentosAnexados];
          const arquivos = [...updatedDocumentos[documentoIndex].arquivos];
          arquivos[arquivoIndex] = {
            ...arquivos[arquivoIndex],
            status: "completed",
            uuid: uuidDocumento,
          };
          updatedDocumentos[documentoIndex] = {
            ...updatedDocumentos[documentoIndex],
            arquivos,
          };
          return { ...prev, documentosAnexados: updatedDocumentos };
        });
      } else {
        throw new Error(response.message || "Erro no upload");
      }
    } catch (error) {
      console.error("❌ Erro no upload:", error);

      setFormData((prev) => {
        const updatedDocumentos = [...prev.documentosAnexados];
        const arquivos = [...updatedDocumentos[documentoIndex].arquivos];
        arquivos[arquivoIndex] = {
          ...arquivos[arquivoIndex],
          status: "error",
        };
        updatedDocumentos[documentoIndex] = {
          ...updatedDocumentos[documentoIndex],
          arquivos,
        };
        return { ...prev, documentosAnexados: updatedDocumentos };
      });
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentoIndex: number
  ) => {
    const files = event.target.files;
    if (!files) return;

    const novosArquivos: ArquivoUpload[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      status: "pending" as const,
    }));

    setFormData((prev) => {
      const updatedDocumentos = [...prev.documentosAnexados];
      const documentoAtual = updatedDocumentos[documentoIndex];

      let arquivosAtualizados: ArquivoUpload[];

      if (documentoAtual.tipo === "lista") {
        arquivosAtualizados = [...documentoAtual.arquivos, ...novosArquivos];
      } else {
        arquivosAtualizados = [novosArquivos[0]];
      }

      updatedDocumentos[documentoIndex] = {
        ...documentoAtual,
        arquivos: arquivosAtualizados,
      };

      return {
        ...prev,
        documentosAnexados: updatedDocumentos,
      };
    });

    const documento = formData.documentosAnexados[documentoIndex];
    const startIndex = documento.arquivos.length;

    novosArquivos.forEach(async (arquivo, index) => {
      await processFileUpload(arquivo, documentoIndex, startIndex + index);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const buildAttachedDocument = () => {
    const documentosParaEnvio = formData.documentosAnexados
      .filter((documento) => {
        const hasCompletedFiles = documento.arquivos.some(
          (arquivo) => arquivo.status === "completed" && arquivo.uuid
        );
        return documento.chave && documento.descricao && hasCompletedFiles;
      })
      .map((documento) => {
        const uuids = documento.arquivos
          .filter((arquivo) => arquivo.status === "completed" && arquivo.uuid)
          .map((arquivo) => arquivo.uuid!);

        const documentoBase = {
          chave: documento.chave,
          descricao: documento.descricao,
        };

        if (documento.tipo === "unico" && uuids.length > 0) {
          return {
            ...documentoBase,
            uuid_unico: uuids[0],
          };
        }

        if (documento.tipo === "lista" && uuids.length > 0) {
          return {
            ...documentoBase,
            uuids_lista: uuids,
          };
        }

        return null;
      })
      .filter(Boolean);

    return {
      ...formData,
      documentosAnexados: documentosParaEnvio,
    };
  };

  const removeArquivo = (documentoIndex: number, arquivoId: string) => {
    setFormData((prev) => {
      const updatedDocumentos = [...prev.documentosAnexados];
      updatedDocumentos[documentoIndex] = {
        ...updatedDocumentos[documentoIndex],
        arquivos: updatedDocumentos[documentoIndex].arquivos.filter(
          (arquivo) => arquivo.id !== arquivoId
        ),
      };
      return {
        ...prev,
        documentosAnexados: updatedDocumentos,
      };
    });
  };

  const handleSaidaFormatoChange = (formato: "json" | "markdown") => {
    setFormData((prev) => ({
      ...prev,
      saida: { ...prev.saida, formato },
    }));
  };

  // Adicione esta função no hook
  const handleInteracaoUsuarioChange = useCallback(
    (field: keyof InteracaoComUsuario, value: boolean | number | string) => {
      setFormData((prev) => ({
        ...prev,
        interacao_com_usuario: {
          ...prev.interacao_com_usuario,
          [field]:
            field === "maximo_de_interacoes"
              ? Math.max(1, Math.min(10, value as number)) // Garante entre 1 e 10
              : value,
        },
      }));
    },
    []
  );

  const handleChangeInteractions = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const valueNumber = Number(value);
      
      // Validação: permite de 1 até 10 (incluindo 10)
      if (valueNumber >= 1 && valueNumber <= 10) {
          handleInteracaoUsuarioChange('maximo_de_interacoes', valueNumber);
      } else if (valueNumber > 10) {
          // Se digitar mais que 10, mantém 10
          handleInteracaoUsuarioChange('maximo_de_interacoes', 10);
      } else if (valueNumber < 1 || !value) {
          // Se digitar menos que 1 ou vazio, mantém 1
          handleInteracaoUsuarioChange('maximo_de_interacoes', 1);
      }
  }

  const toggleInteracaoUsuario = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      interacao_com_usuario: {
        ...prev.interacao_com_usuario,
        habilitado: !prev.interacao_com_usuario.habilitado,
      },
    }));
  }, []);

  return {
    formData,
    showVariableSelector,
    promptTextareaRef,
    fileInputRef,
    modelos: llmModelsByProvider,
    ferramentasDisponiveis: FERRAMENTAS_DISPONIVEIS,
    isEditing,
    editingNodeId,
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
    retryUpload,
    insertVariableInPrompt,
    handleSubmit,
    handleInputChange,
    handleFerramentaChange,
    resetForm,
    resetToCreateMode,
    loadNodeData,
    handleSaidaFormatoChange,
    handleInteracaoUsuarioChange,
    handleChangeInteractions,
    toggleInteracaoUsuario,
  };
}
