// hooks/useNodeFormController.ts

import { useWorkflow } from "@/context/WorkflowContext";
import NodeEntitie from "@/domain/entities/NodeEntitie";
import WorkflowHttpGatewayV2 from "@/gateway/WorkflowHttpGatewayV2";
import FetchAdapter from "@/infra/FetchAdapter";
import { useRef, useState } from "react";

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

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  uuid?: string; // UUID retornado pelo upload
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

const BASE_URL = import.meta.env.VITE_API_URL_MINUTA;
const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

export function useNodeFormController(onSuccess?: () => void) {
  const { 
    addNode, 
    addDocumentoAnexado, 
    updateDocumentoAnexado, 
    removeDocumentoAnexado,
    state 
  } = useWorkflow();

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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inicializar HTTP client
  const httpClient = new FetchAdapter();
  const workflowGateway = new WorkflowHttpGatewayV2(
    httpClient,
    BASE_URL,
    AUTH_TOKEN
  );

  // Funções para gerenciar documentos anexados
  const addDocumento = () => {
    const novoDocumento = {
      chave: '',
      descricao: '',
      tipo: 'unico' as 'unico' | 'lista',
      uuid_unico: '',
      uuids_lista: []
    };
    addDocumentoAnexado(novoDocumento);
  };

  const updateDocumento = (index: number, campo: string, valor: any) => {
    const documentoAtual = state.documentos_anexados[index];
    const documentoAtualizado = {
      ...documentoAtual,
      [campo]: valor
    };
    
    // Se mudou de lista para único, limpa a lista de UUIDs
    if (campo === 'tipo' && valor === 'unico') {
      documentoAtualizado.uuids_lista = [];
    }
    
    // Se mudou de único para lista, limpa o UUID único
    if (campo === 'tipo' && valor === 'lista') {
      documentoAtualizado.uuid_unico = '';
    }

    updateDocumentoAnexado(index, documentoAtualizado);
  };

  const removeDocumento = (index: number) => {
    removeDocumentoAnexado(index);
  };

  const retryUpload = async (fileId: string) => {
    const fileToRetry = uploadedFiles.find(file => file.id === fileId);
    if (!fileToRetry) return;

    await processFileUpload(fileToRetry);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);

    const newUploadedFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newUploadedFiles.push({
        id: Date.now().toString() + i,
        file,
        name: file.name,
        size: file.size,
        status: 'pending'
      });
    }

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);

    // Processar upload de cada arquivo
    for (const uploadedFile of newUploadedFiles) {
      await processFileUpload(uploadedFile);
    }

    setIsUploading(false);
  };

  const processFileUpload = async (uploadedFile: UploadedFile) => {
    try {
      // Atualizar status para uploading
      setUploadedFiles(prev => 
        prev.map(file => 
          file.id === uploadedFile.id 
            ? { ...file, status: 'uploading' }
            : file
        )
      );

      // Fazer upload do arquivo
      const response = await workflowGateway.uploadAndProcess(uploadedFile.file);
      
      if (response.success && response.data) {
        const uuidDocumento = response.data.uuid_documento;
        
        // Atualizar arquivo com UUID
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === uploadedFile.id 
              ? { ...file, status: 'completed', uuid: uuidDocumento }
              : file
          )
        );

        console.log('✅ Arquivo uploadado com sucesso:', uploadedFile.name, 'UUID:', uuidDocumento);
        
        // Atualizar documento anexado correspondente
        updateDocumentWithUUID(uuidDocumento, uploadedFile.name);
        
      } else {
        throw new Error(response.message || 'Erro no upload');
      }
      
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      
      // Atualizar status para error
      setUploadedFiles(prev => 
        prev.map(file => 
          file.id === uploadedFile.id 
            ? { ...file, status: 'error' }
            : file
        )
      );
    }
  };


  const updateDocumentWithUUID = (uuid: string, fileName: string) => {
    // Encontrar o documento anexado que corresponde a este arquivo
    // Aqui você pode implementar a lógica para mapear arquivos para documentos
    // Por enquanto, vou atualizar o primeiro documento do tipo correspondente
    
    const documentosAnexados = state.documentos_anexados;
    
    if (documentosAnexados.length > 0) {
      const documentoIndex = 0; // Ou implemente lógica para encontrar o documento correto
      const documento = documentosAnexados[documentoIndex];
      
      if (documento.tipo === 'unico') {
        updateDocumento(documentoIndex, 'uuid_unico', uuid);
      } else if (documento.tipo === 'lista') {
        const currentUuids = documento.uuids_lista || [];
        updateDocumento(documentoIndex, 'uuids_lista', [...currentUuids, uuid]);
      }
    }
  };

  const onRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getUploadStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'uploading':
        return 'Enviando...';
      case 'completed':
        return 'Concluído';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar se há documentos anexados para nós de entrada
      if (formData.categoria === 'entrada' && state.documentos_anexados.length === 0) {
        throw new Error('Nós de entrada devem ter pelo menos um documento anexado');
      }

      // Criar o nó sem categoria
      const node = new NodeEntitie(
        formData.nome,
        formData.prompt,
        formData.saida,
        formData.entradas,
        formData.modelo_llm,
        formData.temperatura,
        formData.ferramentas
      );

      // Validar o nó individualmente
      node.validate();

      // Adicionar ao estado global do workflow (com categoria apenas na UI)
      addNode({
        id: `node_${Date.now()}`,
        nome: node.nome,
        categoria: formData.categoria, // Mantém categoria apenas no estado da UI
        prompt: node.prompt,
        modelo_llm: node.modelo_llm,
        temperatura: node.temperatura,
        ferramentas: node.ferramentas,
        saida: node.saida,
        entradas: node.entradas,
      });

      // ... resto do código ...
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
    fileInputRef, // ✅ Agora exportando fileInputRef
    uploadedFiles, // ✅ Agora exportando uploadedFiles
    isUploading,
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
      // Funções de documentos anexados
      retryUpload,
    addDocumento,
    updateDocumento,
    removeDocumento,
    handleFileUpload,
    onRemoveFile,
    getUploadStatusText
  };
}