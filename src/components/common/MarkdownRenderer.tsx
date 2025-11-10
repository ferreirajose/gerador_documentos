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
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header com botões */}
      {(showCopyButton || showDownloadButton) && (
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <span className="text-sm font-medium text-gray-700">Visualização Markdown</span>
          
          <div className="flex items-center space-x-2">
            {showCopyButton && (
              <button
                onClick={handleCopyContent}
                disabled={copyStatus !== 'idle'}
                className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
                  copyStatus === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : copyStatus === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <i className={getCopyButtonIcon()}></i>
                <span>{getCopyButtonText()}</span>
              </button>
            )}
            
            {showDownloadButton && (
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
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