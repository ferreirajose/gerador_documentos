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

// ✅ FUNÇÃO AUXILIAR: Substituir referências entre entradas
// v1
// export const substituirReferenciasEntradas = (workflowJson: string): string => {
//   try {
//     const workflowObj = JSON.parse(workflowJson);
//     // Percorrer todos os nós do workflow

//     if (workflowObj && workflowObj.grafo.nos.length > 0) {
//       workflowObj.grafo.nos.forEach((node: any) => {
//         // Coletar valores de lista_de_origem primeiro
//         const referencias: { [key: string]: string } = {};

//         // Primeira passada: encontrar todos os id_da_defesa
//         Object.entries(node.entradas).forEach(
//           ([nomeCampo, definicao]: [string, any]) => {
//             if (nomeCampo === "lista_de_origem") {
//               referencias.id_da_defesa = definicao.id_da_defesa;
//             }
//           }
//         );

//         // Segunda passada: substituir referências em conteudo_defesa
//         Object.entries(node.entradas).forEach(
//           ([nomeCampo, definicao]: [string, any]) => {
//             if (nomeCampo === "conteudo_defesa" && definicao.buscar_documento) {
//               console.log("dada", Object.keys(referencias));

//               // Se buscar_documento for {id_da_defesa} e temos o valor real
//               node.entradas.conteudo_defesa.buscar_documento = `{${Object.keys(
//                 referencias
//               ).join()}}`;
//             }
//           }
//         );
//       });
//     }

//     return JSON.stringify(workflowObj, null, 2);
//   } catch (error) {
//     console.error("Erro ao processar referências:", error);
//     return workflowJson; // Retorna original em caso de erro
//   }
// };

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
