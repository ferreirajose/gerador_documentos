// components/common/MarkdownRenderer.tsx
import { downloadMarkdown, renderMarkdown } from '@/libs/util';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  variant?: 'default' | 'compact' | 'document';
  filename?: string;
  showCopyButton?: boolean;
  showDownloadButton?: boolean;
}

export default function MarkdownRenderer({
  content,
  className = '',
  variant = 'default',
  filename = 'documento.md',
  showCopyButton = true,
  showDownloadButton = true
}: MarkdownRendererProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!content) return null;

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'prose-sm max-w-none';
      case 'document':
        return 'prose-lg max-w-none prose-headings:font-bold prose-p:leading-relaxed';
      default:
        return 'prose max-w-none prose-headings:font-semibold';
    }
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Erro ao copiar conteúdo:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleDownload = () => {
    downloadMarkdown(content, filename);
  };

  const getCopyButtonText = () => {
    switch (copyStatus) {
      case 'success':
        return 'Copiado!';
      case 'error':
        return 'Erro ao copiar';
      default:
        return 'Copiar Markdown';
    }
  };

  const getCopyButtonIcon = () => {
    switch (copyStatus) {
      case 'success':
        return 'ri-check-line text-green-600';
      case 'error':
        return 'ri-close-line text-red-600';
      default:
        return 'ri-clipboard-line';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header com botões */}
      {(showCopyButton || showDownloadButton) && (
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Visualização Markdown</span>

          <div className="flex items-center space-x-2">
            {showCopyButton && (
              <button
                onClick={handleCopyContent}
                disabled={copyStatus !== 'idle'}
                className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${copyStatus === 'success'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : copyStatus === 'error'
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <i className={getCopyButtonIcon()}></i>
                <span>{getCopyButtonText()}</span>
              </button>
            )}

            {showDownloadButton && (
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
              >
                <i className="ri-download-line"></i>
                <span>Download</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo Markdown */}
      <div className="p-6">
        <div
          className={`${getVariantClasses()}`}
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(content)
          }}
        />
      </div>
    </div>
  );
}