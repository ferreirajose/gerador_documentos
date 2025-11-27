import { useState, useRef } from 'react';
import { RiUploadCloudLine, RiFileTextLine, RiDeleteBin6Line, RiCheckLine, RiCloseLine, RiLoaderLine, RiRefreshLine } from '@remixicon/react';
import { formatFileSize } from '@/libs/util';

export interface UploadedFile {
  id: string;
  name: string;
  rawFile: File; // Armazenar o arquivo original para o retry
  size: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  documentKey?: string; // Chave retornada pela API após upload
  uuid_documento?: string;
}

export interface FileUploadDuringExecutionProps {
  /**
   * Quantidade de arquivos permitidos:
   * - "zero": Não permite upload (componente escondido)
   * - "um": Permite apenas 1 arquivo
   * - "varios": Permite múltiplos arquivos
   */
  quantidadeArquivos: "zero" | "um" | "varios";

  /**
   * Nome da variável do prompt (para exibição)
   */
  variavelPrompt: string;

  /**
   * Callback chamado quando arquivos são enviados com sucesso
   * Retorna array de document keys para serem usados na execução
   */
  onFilesUploaded: (documentKeys: string[]) => void;

  /**
   * Função para fazer upload de um arquivo
   * Deve retornar a chave do documento após upload bem-sucedido
   */
  uploadFile: (file: File) => Promise<string>;

  /**
   * Formatos de arquivo aceitos (opcional)
   * Exemplo: ".pdf,.doc,.docx,.txt,.json"
   */
  acceptedFormats?: string;

  /**
   * Tamanho máximo de arquivo em bytes (opcional)
   * Padrão: 10MB
   */
  maxFileSize?: number;
}

export function FileUploadDuringExecution({
  quantidadeArquivos,
  variavelPrompt,
  onFilesUploaded,
  uploadFile,
  acceptedFormats = ".pdf,.doc,.docx,.txt,.json",
  maxFileSize = 10 * 1024 * 1024 // 10MB
}: FileUploadDuringExecutionProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Se não permite arquivos, não renderiza nada
  if (quantidadeArquivos === "zero") {
    return null;
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    // Validar número de arquivos
    if (quantidadeArquivos === "um" && selectedFiles.length > 1) {
      alert("Apenas um arquivo é permitido");
      return;
    }

    if (quantidadeArquivos === "um" && files.length > 0) {
      alert("Você já adicionou um arquivo. Remova-o antes de adicionar outro.");
      return;
    }

    // Validar tamanho dos arquivos
    const invalidFiles = selectedFiles.filter(file => file.size > maxFileSize);
    if (invalidFiles.length > 0) {
      alert(`Arquivos muito grandes: ${invalidFiles.map(f => f.name).join(', ')}\nTamanho máximo: ${formatFileSize(maxFileSize)}`);
      return;
    }

    // Criar registros de arquivos pendentes
    const newFiles: UploadedFile[] = selectedFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      rawFile: file,
      size: file.size,
      status: 'pending' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Fazer upload de cada arquivo
    await Promise.all(newFiles.map(fileRecord => uploadSingleFile(fileRecord)));

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadSingleFile = async (fileRecord: UploadedFile) => {
    try {
      // Atualizar status para uploading
      setFiles(prev => prev.map(f =>
        f.id === fileRecord.id ? { ...f, status: 'uploading' as const, errorMessage: undefined } : f
      ));

      // Fazer upload
      const documentKey = await uploadFile(fileRecord.rawFile);

      // Atualizar com sucesso
      setFiles(prev => {
        const updated = prev.map(f =>
          f.id === fileRecord.id
            ? {
              ...f,
              status: 'completed' as const,
              documentKey,
            }
            : f
        );

        // Notificar sobre arquivos completos
        const completedKeys = updated
          .filter(f => f.status === 'completed' && f.documentKey)
          .map(f => f.documentKey!);

        onFilesUploaded(completedKeys);

        return updated;
      });

    } catch (error) {
      // Atualizar com erro
      setFiles(prev => prev.map(f =>
        f.id === fileRecord.id
          ? {
            ...f,
            status: 'error' as const,
            errorMessage: error instanceof Error ? error.message : 'Erro ao fazer upload'
          }
          : f
      ));
    }
  };

  const handleRetryUpload = (fileId: string) => {
    const fileToRetry = files.find(f => f.id === fileId);
    if (fileToRetry) {
      uploadSingleFile(fileToRetry);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);

      // Atualizar lista de document keys
      const completedKeys = updated
        .filter(f => f.status === 'completed' && f.documentKey)
        .map(f => f.documentKey!);

      onFilesUploaded(completedKeys);

      return updated;
    });
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const canAddMore = quantidadeArquivos === "varios" || (quantidadeArquivos === "um" && files.length === 0);
  const hasCompletedFiles = files.some(f => f.status === 'completed');

  return (
    <div className="border border-border dark:border-gray-700 rounded-lg p-4 bg-card dark:bg-gray-800/50">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground dark:text-gray-200 flex items-center gap-2">
          <RiUploadCloudLine className="w-4 h-4" aria-hidden="true" />
          Upload de Arquivos
        </h3>
        <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
          Variável: <span className="font-mono font-semibold">{variavelPrompt}</span>
        </p>
        <p className="text-xs text-muted-foreground dark:text-gray-400">
          {quantidadeArquivos === "um"
            ? "Faça upload de 1 arquivo"
            : "Faça upload de um ou mais arquivos"}
        </p>
      </div>

      {/* Input de arquivo (escondido) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={quantidadeArquivos === "varios"}
        accept={acceptedFormats}
        onChange={handleFileSelect}
        className="hidden"
        aria-label={`Selecionar arquivo${quantidadeArquivos === "varios" ? "s" : ""} para ${variavelPrompt}`}
      />

      {/* Botão de upload */}
      {canAddMore && (
        <button
          onClick={handleClickUpload}
          className="w-full py-3 px-4 border-2 border-dashed border-border dark:border-gray-600 rounded-lg hover:border-primary dark:hover:border-purple-500 hover:bg-muted dark:hover:bg-gray-700/50 transition-all duration-200 flex flex-col items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          aria-label="Clique para selecionar arquivos"
        >
          <RiUploadCloudLine
            className="w-8 h-8 text-muted-foreground dark:text-gray-400 group-hover:text-primary dark:group-hover:text-purple-400 transition-colors"
            aria-hidden="true"
          />
          <span className="text-sm text-muted-foreground dark:text-gray-300 group-hover:text-primary dark:group-hover:text-purple-300">
            Clique para selecionar {quantidadeArquivos === "varios" ? "arquivo(s)" : "arquivo"}
          </span>
          <span className="text-xs text-muted-foreground dark:text-gray-500">
            Formatos aceitos: {acceptedFormats.replace(/\./g, '').toUpperCase()}
          </span>
        </button>
      )}

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2" role="list" aria-label="Arquivos selecionados">
          {files.map(file => (
            <div key={file.id}>
              <div className="flex items-center justify-between bg-muted dark:bg-gray-700/50 p-3 rounded-lg border border-border dark:border-gray-600"
                role="listitem">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Ícone de status */}
                  {file.status === 'completed' && (
                    <RiCheckLine className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" aria-label="Upload completo" />
                  )}
                  {file.status === 'uploading' && (
                    <RiLoaderLine className="w-5 h-5 text-blue-500 dark:text-blue-400 animate-spin flex-shrink-0" aria-label="Fazendo upload" />
                  )}
                  {file.status === 'error' && (
                    <RiCloseLine className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" aria-label="Erro no upload" />
                  )}
                  {file.status === 'pending' && (
                    <RiFileTextLine className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-label="Aguardando" />
                  )}

                  {/* Informações do arquivo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground dark:text-gray-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      {formatFileSize(file.size)}
                      {file.status === 'uploading' && ' • ⏳ Enviando...'}
                      {file.status === 'completed' && ' • ✅ Completo'}
                      {file.status === 'error' && ' • ❌ Erro no upload'}
                    </p>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex items-center space-x-1 ml-2">
                  {/* Botão de retry - aparece apenas quando há erro */}
                  {file.status === 'error' && (
                    <button
                      onClick={() => handleRetryUpload(file.id)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      aria-label={`Tentar novamente ${file.name}`}
                    >
                      <RiRefreshLine className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}

                  {/* Botão de remover */}
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    disabled={file.status === 'uploading'}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                    aria-label={`Remover ${file.name}`}
                  >
                    <RiDeleteBin6Line className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Mensagem de erro abaixo do arquivo */}
              {file.status === 'error' && file.errorMessage && (
                <div className="mt-1 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-xs text-red-800 dark:text-red-300 flex items-center gap-1">
                    <RiCloseLine className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                    {file.errorMessage}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mensagem de sucesso quando todos os uploads estiverem completos */}
      {hasCompletedFiles && files.every(f => f.status === 'completed') && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
            <RiCheckLine className="w-4 h-4" aria-hidden="true" />
            {files.length === 1 ? 'Arquivo enviado com sucesso!' : `${files.length} arquivos enviados com sucesso!`}
          </p>
        </div>
      )}
    </div>
  );
}
