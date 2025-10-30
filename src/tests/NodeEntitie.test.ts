import { it, describe, expect } from "vitest";

// import Edge from "@/domain/entities/Edge";
// import Workflow from "@/domain/entities/Workflow";
import NodeEntitie from "@/domain/entities/NodeEntitie";

describe("NodeEntitie", () => {
  it("should create a NodeEntitie instance", () => {
    const node = new NodeEntitie(
      "Node1",
      "Agent1",
      "Model1",
      ['stf'],
      "Prompt1",
      "OutputKey1",
      {
        field1: { buscar_documento: "ref1" },
        field2: { id_da_defesa: "ref2" },
      }
    );
    expect(node).toBeInstanceOf(NodeEntitie);
  });

   it('should create a node with valid properties', () => {
          const node = new NodeEntitie(
              'AuditorNode',
              'audit',
              'claude-3-7-sonnet@20250219',
              ['buscar'],
              '## PERSONA',
              'workflow_data.analise_auditoria',
              {
                  conteudo_auditoria: { 
                      buscar_documento: 'doc.auditoria_especial' 
                  }
              }
          );
  
          expect(node.nome).toBe('AuditorNode');
          expect(node.agente).toBe('audit');
          expect(node.modelo_llm).toBe('claude-3-7-sonnet@20250219');
          expect(node.prompt).toBe('## PERSONA');
          expect(node.chave_de_saida).toBe('workflow_data.analise_auditoria');
          expect(node.entradas).toEqual({
              conteudo_auditoria: { 
                  buscar_documento: 'doc.auditoria_especial' 
              }
          });
      });
  
      it('should create a node with multiple inputs', () => {
          const node = new NodeEntitie(
              'DefenseNode',
              'defense',
              'claude-3-7-sonnet@20250219',
               ['buscar'],
              '## PERSONA',
              'workflow_data.analises_defesas',
              {
                  lista_de_origem: { 
                      id_da_defesa: 'doc.defesas_do_caso' 
                  },
                  conteudo_defesa: { 
                      buscar_documento: '{id_da_defesa}' 
                  }
              }
          );
  
          expect(node.entradas).toHaveProperty('lista_de_origem');
          expect(node.entradas).toHaveProperty('conteudo_defesa');
          expect(node.entradas.lista_de_origem).toHaveProperty('id_da_defesa');
          expect(node.entradas.conteudo_defesa).toHaveProperty('buscar_documento');
      });
  
      it('should create a node with empty inputs', () => {
          const node = new NodeEntitie(
              'EmptyNode',
              'empty',
              'gpt-4',
              ['stf'],
              'prompt',
              'output',
              {}
          );
  
          expect(node.entradas).toEqual({});
      });
  
      it('should create a node with do_estado input type', () => {
          const node = new NodeEntitie(
              'RelatorNode',
              'relator',
              'gpt-4',
              ['stj'],
              '## PERSONA',
              'workflow_data.voto_relator',
              {
                  relatorio_da_auditoria: { 
                      do_estado: 'workflow_data.analise_auditoria' 
                  }
              }
          );
  
          expect(node.entradas.relatorio_da_auditoria).toHaveProperty('do_estado');
          expect(node.entradas.relatorio_da_auditoria.do_estado).toBe('workflow_data.analise_auditoria');
      });
});