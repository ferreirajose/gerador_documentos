import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sum(a: number, b: number): number {
  return a + b;
}

export function formatAgentName(nodeName: string): string {
  return (
    nodeName
      // Remove acentos e caracteres especiais
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Remove vírgulas e outros caracteres especiais
      .replace(/[^\w\s]/gi, "")
      // Convert camelCase or PascalCase to snake_case
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      // Replace spaces with underscores
      .replace(/\s+/g, "_")
      .toLowerCase()
      // Remove 'node' suffix if present
      .replace(/node$/i, "")
      // Remove underscores duplicados que podem ter sido criados
      .replace(/_+/g, "_")
      // Remove underscores no início e fim
      .replace(/^_+|_+$/g, "")
  );
}

// ✅ FUNÇÃO COMPLETA: Substituir referências entre todos os tipos
export const substituirReferenciasEntradas = (workflowJson: string): string => {
  try {
    const workflowObj = JSON.parse(workflowJson);
    
    if (workflowObj?.grafo?.nos) {
      workflowObj.grafo.nos.forEach((node: any) => {
        if (!node.entradas) return;
        
        // Mapeamento de substituições
        const substituicoes = [
          { origem: 'lista_de_origem', destino: 'buscar_documento' },
          { origem: 'id_da_defesa', destino: 'buscar_documento' },
          { origem: 'lista_de_origem', destino: 'do_estado' },
          { origem: 'id_da_defesa', destino: 'do_estado' }
        ];

        substituicoes.forEach(({ origem, destino }) => {
          // Coletar valores do tipo origem
          const valoresOrigem: Set<string> = new Set();
          
          Object.values(node.entradas).forEach((definicao: any) => {
            if (definicao?.[origem]) {
              valoresOrigem.add(definicao[origem]);
            }
          });

          // Substituir referências no tipo destino
          Object.values(node.entradas).forEach((definicao: any) => {
            if (definicao?.[destino] && valoresOrigem.has(definicao[destino])) {
              definicao[destino] = `{${origem}}`;
            }
          });
        });
      });
    }

    return JSON.stringify(workflowObj, null, 2);
  } catch (error) {
    console.error("Erro ao processar referências:", error);
    return workflowJson; // Retorna original em caso de erro
  }
};


export const renderMarkdown = (text: string): string => {
  if (!text) return '';
  
  const lines = text.split('\n');
  let output = '';
  let inList: false | 'ol' | 'ul' = false;
  let paragraphLines: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];
  let tableHeaders: string[] = [];

  // Função para detectar e formatar JSON
  const formatJSON = (content: string): string => {
    // Tenta encontrar objetos JSON completos no texto
    const jsonRegex = /(\{[^{}]*\}|\[[^\[\]]*\])/g;
    
    return content.replace(jsonRegex, (match) => {
      try {
        // Tenta parsear para verificar se é JSON válido
        const parsed = JSON.parse(match);
        const formattedJSON = JSON.stringify(parsed, null, 2);
        
        // Aplica coloração Monokai Dimmed ao JSON formatado
        return formatJSONSyntax(formattedJSON);
      } catch {
        // Se não for JSON válido, retorna o original
        return match;
      }
    });
  };

  // Função para aplicar coloração Monokai Dimmed à sintaxe JSON
  const formatJSONSyntax = (jsonString: string): string => {
    // Cores Monokai Dimmed
    const colors = {
      key: 'text-[#78dce8]',        // Azul claro - chaves
      string: 'text-[#a9dc76]',     // Verde - strings
      number: 'text-[#ab9df2]',     // Roxo - números
      boolean: 'text-[#ff6188]',    // Rosa - booleanos
      null: 'text-[#ff6188]',       // Rosa - null
      punctuation: 'text-[#f8f8f2]', // Branco - pontuação
      background: 'bg-[#1e1e1e]'    // Fundo escuro
    };

    return jsonString
      .split('\n')
      .map(line => {
        // Aplica coloração baseada no tipo de token
        return line
          // Chaves (propriedades)
          .replace(/"([^"]+)":/g, `<span class="${colors.key}">"$1"</span><span class="${colors.punctuation}">:</span>`)
          // Strings
          .replace(/"([^"]*)"/g, `<span class="${colors.string}">"$1"</span>`)
          // Números
          .replace(/\b(-?\d+\.?\d*)\b/g, `<span class="${colors.number}">$1</span>`)
          // Booleanos
          .replace(/\b(true|false)\b/g, `<span class="${colors.boolean}">$1</span>`)
          // Null
          .replace(/\b(null)\b/g, `<span class="${colors.null}">$1</span>`)
          // Colchetes e chaves
          .replace(/[{}[\]]/g, `<span class="${colors.punctuation}">$&</span>`)
          // Vírgulas
          .replace(/,/g, `<span class="${colors.punctuation}">,</span>`);
      })
      .join('\n');
  };

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    
    let paragraphContent = paragraphLines.join('<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\[([^\]]+)\]/g, '<span class="bg-yellow-100 px-2 py-1 rounded text-sm font-medium">[Campo: $1]</span>')
      .replace(/`(.*?)`/g, '<span class="bg-gray-200 px-1.5 py-1 rounded font-medium">$1</span>');

    // Aplica formatação JSON se existir
    paragraphContent = formatJSON(paragraphContent);

    output += `<p class="mb-4 leading-relaxed text-gray-700">${paragraphContent}</p>\n`;
    paragraphLines = [];
  };

  const formatInline = (content: string): string => {
    let formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\[([^\]]+)\]/g, '<span class="bg-yellow-100 px-2 py-1 rounded text-sm font-medium">[Campo: $1]</span>')
      .replace(/`(.*?)`/g, '<span class="bg-gray-200 px-1.5 py-1 rounded font-medium">$1</span>');

    // Aplica formatação JSON se existir
    formattedContent = formatJSON(formattedContent);

    return formattedContent;
  };

  const flushTable = () => {
    if (tableRows.length === 0) return;
    
    output += '<div class="overflow-x-auto my-6">\n';
    output += '<table class="min-w-full border-collapse border border-gray-300">\n';
    
    // Cabeçalho da tabela
    if (tableHeaders.length > 0) {
      output += '<thead class="bg-gray-50">\n<tr>\n';
      tableHeaders.forEach(header => {
        output += `<th class="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700">${formatInline(header.trim())}</th>\n`;
      });
      output += '</tr>\n</thead>\n';
    }
    
    // Corpo da tabela
    output += '<tbody>\n';
    tableRows.forEach(row => {
      const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
      if (cells.length > 0) {
        output += '<tr>\n';
        cells.forEach(cell => {
          output += `<td class="border border-gray-300 px-4 py-2 text-gray-700">${formatInline(cell)}</td>\n`;
        });
        output += '</tr>\n';
      }
    });
    output += '</tbody>\n</table>\n</div>\n';
    
    tableRows = [];
    tableHeaders = [];
    inTable = false;
  };

  // Função para detectar blocos de código JSON
  const detectAndFormatJSONBlocks = (line: string): string => {
    // Detecta blocos de código que podem conter JSON
    if (line.trim().startsWith('```json')) {
      return '<pre class="bg-[#1e1e1e] p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">';
    }
    
    if (line.trim() === '```') {
      return '</code></pre>';
    }
    
    return line;
  };

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmedLine = line.trim();

    // Processa blocos de código JSON
    line = detectAndFormatJSONBlocks(line);

    // Detectar início de tabela (linha com pipes)
    if (trimmedLine.includes('|') && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('```')) {
      if (!inTable) {
        flushParagraph();
        if (inList) {
          output += `</${inList}>\n`;
          inList = false;
        }
        inTable = true;
      }
      
      // Linha de separador de tabela (--- | --- | ---)
      if (/^\|?(\s*:?-+:?\s*\|?)+$/.test(trimmedLine)) {
        // Esta é a linha de separação, não adicionamos como row
        continue;
      }
      
      // Linha normal da tabela
      tableRows.push(trimmedLine);
      
      // Se é a primeira linha, trata como cabeçalho
      if (tableRows.length === 1) {
        tableHeaders = tableRows[0].split('|').map(cell => cell.trim()).filter(cell => cell !== '');
      }
      
      continue;
    }

    // Se estamos em uma tabela e encontramos uma linha que não é tabela
    if (inTable && !trimmedLine.includes('|') && !trimmedLine.startsWith('```')) {
      flushTable();
    }

    // Títulos
    if (/^#{1,6} /.test(trimmedLine)) {
      flushParagraph();
      flushTable();
      
      const level = Math.min(6, (trimmedLine.match(/#/g) || []).length);
      const content = trimmedLine.replace(/^#+ /, '');
      
      const classes = [
        'text-3xl font-extrabold mb-6 text-gray-900',
        'text-2xl font-bold mb-4 text-gray-800 mt-8',
        'text-xl font-semibold mb-3 text-gray-700 mt-6',
        'text-lg font-medium mb-3 text-gray-600 mt-4',
        'text-lg font-normal mb-3 text-gray-500 mt-4',
        'text-base font-light mb-3 text-gray-500 mt-4'
      ];
      
      output += `<h${level} class="${classes[level - 1]}">${formatInline(content)}</h${level}>\n`;
    }
    
    // Divisor
    else if (/^---+$/.test(trimmedLine)) {
      flushParagraph();
      flushTable();
      if (inList) {
        output += `</${inList}>\n`;
        inList = false;
      }
      output += '<hr class="my-8 border-t-2 border-gray-300">\n';
    }
    
    // Listas
    else if (/^(\d+)\. /.test(trimmedLine)) {
      flushParagraph();
      flushTable();
      const content = trimmedLine.replace(/^(\d+)\. /, '');
      
      if (inList !== 'ol') {
        if (inList) output += `</${inList}>\n`;
        output += '<ol class="list-decimal pl-8 mb-4">\n';
        inList = 'ol';
      }
      output += `<li class="mb-2">${formatInline(content)}</li>\n`;
    }
    else if (/^- /.test(trimmedLine)) {
      flushParagraph();
      flushTable();
      const content = trimmedLine.replace(/^- /, '');
      
      if (inList !== 'ul') {
        if (inList) output += `</${inList}>\n`;
        output += '<ul class="list-disc pl-8 mb-4">\n';
        inList = 'ul';
      }
      output += `<li class="mb-2">${formatInline(content)}</li>\n`;
    }
    
    // Linha vazia
    else if (trimmedLine === '') {
      flushParagraph();
      flushTable();
      if (inList) {
        output += `</${inList}>\n`;
        inList = false;
      }
    }
    
    // Blocos de código JSON
    else if (trimmedLine.startsWith('```json')) {
      flushParagraph();
      flushTable();
      if (inList) {
        output += `</${inList}>\n`;
        inList = false;
      }
      output += '<pre class="bg-[#1e1e1e] p-4 rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">';
      
      // Coleta todas as linhas até o fechamento do bloco
      let jsonContent = '';
      i++; // Pula a linha ```json
      while (i < lines.length && lines[i].trim() !== '```') {
        jsonContent += lines[i] + '\n';
        i++;
      }
      
      // Aplica formatação JSON
      try {
        const parsed = JSON.parse(jsonContent);
        const formatted = JSON.stringify(parsed, null, 2);
        output += formatJSONSyntax(formatted);
      } catch {
        output += jsonContent; // Se não for JSON válido, mostra como está
      }
      
      output += '</code></pre>\n';
    }
    
    // Texto normal
    else {
      if (inList) {
        output += `</${inList}>\n`;
        inList = false;
      }
      flushTable();
      paragraphLines.push(line);
    }
  }

  flushParagraph();
  flushTable();
  if (inList) output += `</${inList}>\n`;

  return output;
};


// Função para baixar o markdown como arquivo
export function downloadMarkdown(content: string, filename: string = "Documento.md") {
  try {
    // Método 1: Usando Blob e URL.createObjectURL (mais moderno)
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar a URL após um tempo
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    
  } catch (error) {
    console.error("Erro no método de download moderno:", error);
    
    // Método 2: Fallback para navegadores mais antigos
    try {
      const encodedContent = encodeURIComponent(content);
      const dataUri = `data:text/markdown;charset=utf-8,${encodedContent}`;
      
      const link = document.createElement("a");
      link.href = dataUri;
      link.download = filename;
      link.style.display = "none";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (fallbackError) {
      console.error("Erro no método de fallback:", fallbackError);
      
      // Método 3: Abertura em nova janela como último recurso
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${filename}</title>
              <meta charset="utf-8">
            </head>
            <body>
              <pre>${content}</pre>
              <script>
                document.addEventListener('DOMContentLoaded', function() {
                  alert('Use Ctrl+S para salvar o relatório como arquivo .md');
                });
              </script>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  }
}

// Função auxiliar para formatar duração
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

export  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };