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

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    
    const paragraphContent = paragraphLines.join('<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\[([^\]]+)\]/g, '<span class="bg-yellow-100 px-2 py-1 rounded text-sm font-medium">[Campo: $1]</span>')
      .replace(/`(.*?)`/g, '<span class="bg-gray-200 px-1.5 py-1 rounded font-medium">$1</span>');

    output += `<p class="mb-4 leading-relaxed text-gray-700">${paragraphContent}</p>\n`;
    paragraphLines = [];
  };

  const formatInline = (content: string): string => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\[([^\]]+)\]/g, '<span class="bg-yellow-100 px-2 py-1 rounded text-sm font-medium">[Campo: $1]</span>')
      .replace(/`(.*?)`/g, '<span class="bg-gray-200 px-1.5 py-1 rounded font-medium">$1</span>');
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Detectar início de tabela (linha com pipes)
    if (trimmedLine.includes('|') && !trimmedLine.startsWith('#')) {
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
    if (inTable && !trimmedLine.includes('|')) {
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