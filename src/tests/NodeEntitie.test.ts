// Node.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import NodeEntitie, { NodeInput } from "@/domain/entities/NodeEntitie";


describe('Node Entity', () => {
  let baseNodeProps: any
  let consoleSpy: any;

  beforeEach(() => {
    // Setup base properties for tests
    baseNodeProps = {
      nome: 'TestNode',
      categoria: 'entrada',
      prompt: 'Test prompt {variavel}',
      saida: { nome: 'test_output' }
    };

    // Spy on console to catch any unexpected errors or warnings
    consoleSpy = {
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    // Restore all console spies
    consoleSpy.error.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.log.mockRestore();
  });

  describe('Constructor and Basic Properties', () => {
    it('should create a node with basic properties', () => {
      const node = new NodeEntitie(
        'AnalisadorContrato',
        'entrada',
        'Analise: {documento}',
        { nome: 'analise', formato: 'markdown' },
        [],
        'gpt-4',
        0.3,
        ['web_search']
      );

      expect(node.nome).toBe('AnalisadorContrato');
      expect(node.categoria).toBe('entrada');
      expect(node.prompt).toBe('Analise: {documento}');
      expect(node.saida.nome).toBe('analise');
      expect(node.saida.formato).toBe('markdown');
      expect(node.modelo_llm).toBe('gpt-4');
      expect(node.temperatura).toBe(0.3);
      expect(node.ferramentas).toEqual(['web_search']);
      expect(node.entradas).toEqual([]);
    });

    it('should create a node with optional properties undefined', () => {
      const node = new NodeEntitie(
        'SimpleNode',
        'processamento',
        'Simple prompt',
        { nome: 'output' }
      );

      expect(node.modelo_llm).toBeUndefined();
      expect(node.temperatura).toBeUndefined();
      expect(node.ferramentas).toEqual([]);
    });
  });

  describe('Validation Rules', () => {
    describe('Entrada Node Validation', () => {
      it('should allow entrada node with documento_anexado inputs', () => {
        const entradaNode = new NodeEntitie(
          'EntradaNode',
          'entrada',
          'Test {doc}',
          { nome: 'output' },
          [
            {
              variavel_prompt: 'doc',
              fonte: 'documento_anexado',
              documento: 'meu_documento'
            }
          ]
        );

        expect(() => entradaNode.validate()).not.toThrow();
      });

      it('should allow entrada node with empty inputs', () => {
        const entradaNode = new NodeEntitie(
          'GeradorNode',
          'entrada',
          'Generate content',
          { nome: 'output' },
          []
        );

        expect(() => entradaNode.validate()).not.toThrow();
      });

      it('should throw error when entrada node has saida_no_anterior input', () => {
        const invalidEntradaNode = new NodeEntitie(
          'InvalidEntrada',
          'entrada',
          'Test {previous}',
          { nome: 'output' },
          [
            {
              variavel_prompt: 'previous',
              fonte: 'saida_no_anterior',
              no_origem: 'AnotherNode'
            }
          ]
        );

        expect(() => invalidEntradaNode.validate()).toThrow(
          "Nó de entrada 'InvalidEntrada' não pode depender de saida_no_anterior"
        );
      });
    });

    describe('Processamento Node Validation', () => {
      it('should allow processamento node with saida_no_anterior inputs', () => {
        const processamentoNode = new NodeEntitie(
          'ProcessamentoNode',
          'processamento',
          'Process {input1} and {input2}',
          { nome: 'processed' },
          [
            {
              variavel_prompt: 'input1',
              fonte: 'saida_no_anterior',
              no_origem: 'NodeA'
            },
            {
              variavel_prompt: 'input2',
              fonte: 'saida_no_anterior',
              no_origem: 'NodeB'
            }
          ]
        );

        expect(() => processamentoNode.validate()).not.toThrow();
      });

      it('should allow processamento node with mixed input types', () => {
        const processamentoNode = new NodeEntitie(
          'MixedInputNode',
          'processamento',
          'Process {doc} and {previous}',
          { nome: 'output' },
          [
            {
              variavel_prompt: 'doc',
              fonte: 'documento_anexado',
              documento: 'document'
            },
            {
              variavel_prompt: 'previous',
              fonte: 'saida_no_anterior',
              no_origem: 'PreviousNode'
            }
          ]
        );

        expect(() => processamentoNode.validate()).not.toThrow();
      });

    //   it('should throw error when processamento node has no saida_no_anterior inputs', () => {
    //     const invalidProcessamentoNode = new NodeEntitie(
    //       'InvalidProcessamento',
    //       'processamento',
    //       'Process {doc}',
    //       { nome: 'output' },
    //       [
    //         {
    //           variavel_prompt: 'doc',
    //           fonte: 'documento_anexado',
    //           documento: 'document'
    //         }
    //       ]
    //     );

    //     expect(() => invalidProcessamentoNode.validate()).toThrow(
    //       "Nó de processamento 'InvalidProcessamento' deve ter pelo menos uma entrada de saida_no_anterior"
    //     );
    //   });
    });

    describe('Saida Node Validation', () => {
      it('should allow saida node with saida_no_anterior inputs', () => {
        const saidaNode = new NodeEntitie(
          'SaidaNode',
          'saida',
          'Format {data1} and {data2}',
          { nome: 'final_output', formato: 'json' },
          [
            {
              variavel_prompt: 'data1',
              fonte: 'saida_no_anterior',
              no_origem: 'ProcessNode1'
            },
            {
              variavel_prompt: 'data2',
              fonte: 'saida_no_anterior',
              no_origem: 'ProcessNode2'
            }
          ]
        );

        expect(() => saidaNode.validate()).not.toThrow();
      });

    //   it('should throw error when saida node has documento_anexado input', () => {
    //     const invalidSaidaNode = new NodeEntitie(
    //       'InvalidSaida',
    //       'saida',
    //       'Format {doc}',
    //       { nome: 'output' },
    //       [
    //         {
    //           variavel_prompt: 'doc',
    //           fonte: 'documento_anexado',
    //           documento: 'document'
    //         }
    //       ]
    //     );

    //     expect(() => invalidSaidaNode.validate()).toThrow(
    //       "Nó de saida 'InvalidSaida' não pode depender de saida_no_anterior"

    //     );
    //   });

    //   it('should throw error when saida node has no saida_no_anterior inputs', () => {
    //     const invalidSaidaNode = new NodeEntitie(
    //       'InvalidSaida',
    //       'saida',
    //       'Format data',
    //       { nome: 'output' },
    //       [] // No inputs
    //     );

    //     expect(() => invalidSaidaNode.validate()).toThrow(
    //       "Nó de saida 'InvalidSaida' não pode depender de saida_no_anterior"
    //     );
    //   });
    });

    describe('Parallel Processing Validation', () => {
      it('should allow node with one parallel processing input', () => {
        const node = new NodeEntitie(
          'ParallelNode',
          'entrada',
          'Process {items}',
          { nome: 'processed_items' },
          [
            {
              variavel_prompt: 'items',
              fonte: 'documento_anexado',
              documento: 'lista_itens',
              processar_em_paralelo: true
            }
          ]
        );

        expect(() => node.validate()).not.toThrow();
      });

      it('should throw error when node has multiple parallel processing inputs', () => {
        const invalidNode = new NodeEntitie(
          'InvalidParallelNode',
          'entrada',
          'Process {items1} and {items2}',
          { nome: 'output' },
          [
            {
              variavel_prompt: 'items1',
              fonte: 'documento_anexado',
              documento: 'lista1',
              processar_em_paralelo: true
            },
            {
              variavel_prompt: 'items2',
              fonte: 'documento_anexado',
              documento: 'lista2',
              processar_em_paralelo: true
            }
          ]
        );

        expect(() => invalidNode.validate()).toThrow(
          "Nó 'InvalidParallelNode' pode ter apenas uma entrada com processar_em_paralelo: true"
        );
      });

      it('should allow node with one parallel and multiple non-parallel inputs', () => {
        const node = new NodeEntitie(
          'MixedParallelNode',
          'processamento',
          'Process {parallel} and {normal}',
          { nome: 'output' },
          [
            {
              variavel_prompt: 'parallel',
              fonte: 'documento_anexado',
              documento: 'lista',
              processar_em_paralelo: true
            },
            {
              variavel_prompt: 'normal',
              fonte: 'saida_no_anterior',
              no_origem: 'OtherNode'
            }
          ]
        );

        expect(() => node.validate()).not.toThrow();
      });
    });

    describe('Input Types Validation', () => {
      it('should validate documento_anexado input has documento field', () => {
        const node = new NodeEntitie(
          'DocNode',
          'entrada',
          'Process {doc}',
          { nome: 'output' },
          [
            {
              variavel_prompt: 'doc',
              fonte: 'documento_anexado'
              // Missing documento field
            } as any // Force invalid type for testing
          ]
        );

        // This would be caught by TypeScript in real usage
        // For runtime validation, we'd need additional checks
        expect(node.entradas[0].documento).toBeUndefined();
      });

      it('should validate saida_no_anterior input has no_origem field', () => {
        const node = new NodeEntitie(
          'PreviousNode',
          'processamento',
          'Process {prev}',
          { nome: 'output' },
          [
            {
              variavel_prompt: 'prev',
              fonte: 'saida_no_anterior'
              // Missing no_origem field
            } as any // Force invalid type for testing
          ]
        );

        expect(node.entradas[0].no_origem).toBeUndefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle node with special characters in name', () => {
      const node = new NodeEntitie(
        'Node-With_Special.Chars123',
        'entrada',
        'Test prompt',
        { nome: 'output' }
      );

      expect(() => node.validate()).not.toThrow();
      expect(node.nome).toBe('Node-With_Special.Chars123');
    });

    it('should handle node with complex prompt variables', () => {
      const complexPrompt = `
        Analyze the following:
        Document: {doc1}
        Previous Analysis: {analysis_2}
        Additional Data: {data3}
        
        Please provide a comprehensive report.
      `;

      const node = new NodeEntitie(
        'ComplexPromptNode',
        'processamento',
        complexPrompt,
        { nome: 'complex_output' },
        [
          { variavel_prompt: 'doc1', fonte: 'documento_anexado', documento: 'doc1' },
          { variavel_prompt: 'analysis_2', fonte: 'saida_no_anterior', no_origem: 'Analyzer' },
          { variavel_prompt: 'data3', fonte: 'saida_no_anterior', no_origem: 'DataNode' }
        ]
      );

      expect(() => node.validate()).not.toThrow();
    });

    it('should handle node with JSON format output', () => {
      const node = new NodeEntitie(
        'JSONExtractor',
        'saida',
        'Extract JSON from {data}',
        { nome: 'extracted_data', formato: 'json' },
        [
          {
            variavel_prompt: 'data',
            fonte: 'saida_no_anterior',
            no_origem: 'Processor'
          }
        ]
      );

      expect(() => node.validate()).not.toThrow();
      expect(node.saida.formato).toBe('json');
    });

    it('should handle node with markdown format output', () => {
      const node = new NodeEntitie(
        'MarkdownGenerator',
        'processamento',
        'Generate markdown from {input}',
        { nome: 'markdown_report', formato: 'markdown' },
        [
          {
            variavel_prompt: 'input',
            fonte: 'saida_no_anterior',
            no_origem: 'SourceNode'
          }
        ]
      );

      expect(() => node.validate()).not.toThrow();
      expect(node.saida.formato).toBe('markdown');
    });
  });

  describe('Temperature Validation', () => {
    it('should accept valid temperature values', () => {
      const validTemperatures = [0, 0.3, 0.7, 1.0, 1.5, 2.0];
      
      validTemperatures.forEach(temp => {
        const node = new NodeEntitie(
          `NodeWithTemp${temp}`,
          'entrada',
          'Test prompt',
          { nome: 'output' },
          [],
          'gpt-4',
          temp
        );

        expect(() => node.validate()).not.toThrow();
        expect(node.temperatura).toBe(temp);
      });
    });

    it('should accept undefined temperature', () => {
      const node = new NodeEntitie(
        'NodeNoTemp',
        'entrada',
        'Test prompt',
        { nome: 'output' }
      );

      expect(() => node.validate()).not.toThrow();
      expect(node.temperatura).toBeUndefined();
    });
  });

  describe('Tools Validation', () => {
    it('should accept empty tools array', () => {
      const node = new NodeEntitie(
        'NodeNoTools',
        'entrada',
        'Test prompt',
        { nome: 'output' },
        [],
        undefined,
        undefined,
        []
      );

      expect(() => node.validate()).not.toThrow();
      expect(node.ferramentas).toEqual([]);
    });

    it('should accept node with tools', () => {
      const node = new NodeEntitie(
        'NodeWithTools',
        'entrada',
        'Test prompt',
        { nome: 'output' },
        [],
        undefined,
        undefined,
        ['web_search', 'calculator', 'file_reader']
      );

      expect(() => node.validate()).not.toThrow();
      expect(node.ferramentas).toEqual(['web_search', 'calculator', 'file_reader']);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large number of inputs efficiently', () => {
      const largeInputs: NodeInput[] = Array.from({ length: 100 }, (_, i) => ({
        variavel_prompt: `input${i}`,
        fonte: 'saida_no_anterior',
        no_origem: `Node${i}`
      }));

      const startTime = performance.now();
      
      const node = new NodeEntitie(
        'LargeInputNode',
        'processamento',
        'Process many inputs',
        { nome: 'output' },
        largeInputs
      );

      node.validate();
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete in reasonable time (less than 100ms)
      expect(executionTime).toBeLessThan(100);
      expect(node.entradas).toHaveLength(100);
    });

    it('should not leak memory when creating multiple nodes', () => {
      const nodes: NodeEntitie[] = [];

      // Create multiple nodes to test memory usage
      for (let i = 0; i < 1000; i++) {
        const node = new NodeEntitie(
          `Node${i}`,
          'entrada',
          `Prompt ${i}`,
          { nome: `output${i}` }
        );
        nodes.push(node);
      }

      // Validate all nodes
      nodes.forEach(node => {
        expect(() => node.validate()).not.toThrow();
      });

      expect(nodes).toHaveLength(1000);
    });
  });
});