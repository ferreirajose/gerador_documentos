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

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    
    const paragraphContent = paragraphLines.join('<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\[([^\]]+)\]/g, '<span class="bg-yellow-100 px-2 py-1 rounded text-sm font-medium">[Campo: $1]</span>')
      .replace(/`(.*?)`/g, '<span class="bg-gray-200 px-1.5 py-1 rounded font-medium">$1</span>'); // Novo destaque para backticks

    output += `<p class="mb-4 leading-relaxed text-gray-700">${paragraphContent}</p>\n`;
    paragraphLines = [];
  };

  const formatInline = (content: string): string => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\[([^\]]+)\]/g, '<span class="bg-yellow-100 px-2 py-1 rounded text-sm font-medium">[Campo: $1]</span>')
      .replace(/`(.*?)`/g, '<span class="bg-gray-200 px-1.5 py-1 rounded font-medium">$1</span>'); // Novo destaque para backticks
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Títulos
    if (/^#{1,6} /.test(trimmedLine)) {
      flushParagraph();
      
      const level = Math.min(6, (trimmedLine.match(/#/g) || []).length);
      const content = trimmedLine.replace(/^#+ /, '');
      
      const classes = [
        'text-3xl font-extrabold mb-6 text-gray-900',         // h1
        'text-2xl font-bold mb-4 text-gray-800 mt-8',        // h2
        'text-xl font-semibold mb-3 text-gray-700 mt-6',     // h3
        'text-lg font-medium mb-3 text-gray-600 mt-4',       // h4
        'text-lg font-normal mb-3 text-gray-500 mt-4',        // h5
        'text-base font-light mb-3 text-gray-500 mt-4'        // h6
      ];
      
      output += `<h${level} class="${classes[level - 1]}">${formatInline(content)}</h${level}>\n`;
    }
    
    // Divisor - linha contínua de 2px (modificado)
    else if (/^---+$/.test(trimmedLine)) {
      flushParagraph();
      if (inList) {
        output += `</${inList}>\n`;
        inList = false;
      }
      output += '<hr class="my-8 border-t-2 border-gray-300">\n'; // Linha de 2px
    }
    
    // Listas
    else if (/^(\d+)\. /.test(trimmedLine)) {
      flushParagraph();
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
      paragraphLines.push(line);
    }
  }

  flushParagraph();
  if (inList) output += `</${inList}>\n`;

  return output;
};
