import NodeEntitie, { NodeOutput, Entrada } from "@/domain/entities/NodeEntitie";
import { describe, it, expect } from "vitest";

describe('NodeEntitie', () => {
  const baseNodeOutput: NodeOutput = {
    nome: 'saida_teste',
    formato: 'markdown'
  };

  const baseEntrada: Entrada = {
    variavel_prompt: 'variavel_teste',
    origem: 'documento_anexado',
    chave_documento_origem: 'doc_123'
  };

  describe('Validações básicas', () => {
    it('deve criar uma instância válida', () => {
      const node = new NodeEntitie(
        'nome_teste',
        'prompt_teste',
        false,
        baseNodeOutput,
        [baseEntrada],
        'gpt-4',
        0.7,
        ['ferramenta1']
      );

      expect(node.nome).toBe('nome_teste');
      expect(node.prompt).toBe('prompt_teste');
      expect(node.entrada_grafo).toBe(false);
      expect(node.saida).toEqual(baseNodeOutput);
      expect(node.entradas).toEqual([baseEntrada]);
      expect(node.modelo_llm).toBe('gpt-4');
      expect(node.temperatura).toBe(0.7);
      expect(node.ferramentas).toEqual(['ferramenta1']);
    });

    it('deve criar instância com valores padrão', () => {
      const node = new NodeEntitie(
        'nome_teste',
        'prompt_teste',
        true,
        baseNodeOutput
      );

      expect(node.entradas).toEqual([]);
      expect(node.modelo_llm).toBeUndefined();
      expect(node.temperatura).toBeUndefined();
      expect(node.ferramentas).toEqual([]);
    });
  });

  describe('Validação - método validate', () => {
    it('deve validar nó com dados corretos', () => {
      const node = new NodeEntitie(
        'nome_valido',
        'prompt_valido',
        false,
        { nome: 'saida_valida' }
      );

      expect(() => node.validate()).not.toThrow();
    });

    it('deve lançar erro quando nome está vazio', () => {
      const node = new NodeEntitie(
        '',
        'prompt_valido',
        false,
        { nome: 'saida_valida' }
      );

      expect(() => node.validate()).toThrow('Nome do nó é obrigatório');
    });

    it('deve lançar erro quando nome contém apenas espaços', () => {
      const node = new NodeEntitie(
        '   ',
        'prompt_valido',
        false,
        { nome: 'saida_valida' }
      );

      expect(() => node.validate()).toThrow('Nome do nó é obrigatório');
    });

    it('deve lançar erro quando prompt está vazio', () => {
      const node = new NodeEntitie(
        'nome_valido',
        '',
        false,
        { nome: 'saida_valida' }
      );

      expect(() => node.validate()).toThrow('Prompt é obrigatório');
    });

    it('deve lançar erro quando nome da saída está vazio', () => {
      const node = new NodeEntitie(
        'nome_valido',
        'prompt_valido',
        false,
        { nome: '' }
      );

      expect(() => node.validate()).toThrow('Nome da saída é obrigatório');
    });

    it('deve lançar erro quando nome da saída contém apenas espaços', () => {
      const node = new NodeEntitie(
        'nome_valido',
        'prompt_valido',
        false,
        { nome: '   ' }
      );

      expect(() => node.validate()).toThrow('Nome da saída é obrigatório');
    });
  });

  describe('Validação - nome único', () => {
    it('deve lançar erro quando nome já existe em outros nós', () => {
      const existingNode = new NodeEntitie(
        'nome_duplicado',
        'prompt_existente',
        false,
        { nome: 'saida_existente' }
      );

      const newNode = new NodeEntitie(
        'nome_duplicado',
        'prompt_novo',
        false,
        { nome: 'saida_nova' }
      );

      expect(() => newNode.validate([existingNode]))
        .toThrow('Já existe um nó com o nome "nome_duplicado"');
    });

    it('não deve lançar erro quando valida a própria instância', () => {
      const node = new NodeEntitie(
        'nome_unico',
        'prompt_valido',
        false,
        { nome: 'saida_valida' }
      );

      expect(() => node.validate([node])).not.toThrow();
    });

    it('deve permitir nós com nomes diferentes', () => {
      const node1 = new NodeEntitie(
        'node1',
        'prompt1',
        false,
        { nome: 'saida1' }
      );

      const node2 = new NodeEntitie(
        'node2',
        'prompt2',
        false,
        { nome: 'saida2' }
      );

      expect(() => node2.validate([node1])).not.toThrow();
    });
  });

  describe('Validação - executar_em_paralelo', () => {
    it('deve permitir nenhuma entrada com executar_em_paralelo', () => {
      const entradas: Entrada[] = [
        {
          variavel_prompt: 'var1',
          origem: 'documento_anexado'
        },
        {
          variavel_prompt: 'var2',
          origem: 'resultado_no_anterior'
        }
      ];

      const node = new NodeEntitie(
        'nome_teste',
        'prompt_teste',
        false,
        baseNodeOutput,
        entradas
      );

      expect(() => node.validate()).not.toThrow();
    });

    it('deve permitir uma entrada com executar_em_paralelo: true', () => {
      const entradas: Entrada[] = [
        {
          variavel_prompt: 'var1',
          origem: 'documento_anexado',
          executar_em_paralelo: true
        },
        {
          variavel_prompt: 'var2',
          origem: 'resultado_no_anterior'
        }
      ];

      const node = new NodeEntitie(
        'nome_teste',
        'prompt_teste',
        false,
        baseNodeOutput,
        entradas
      );

      expect(() => node.validate()).not.toThrow();
    });

    it('deve lançar erro quando múltiplas entradas têm executar_em_paralelo: true', () => {
      const entradas: Entrada[] = [
        {
          variavel_prompt: 'var1',
          origem: 'documento_anexado',
          executar_em_paralelo: true
        },
        {
          variavel_prompt: 'var2',
          origem: 'resultado_no_anterior',
          executar_em_paralelo: true
        }
      ];

      const node = new NodeEntitie(
        'nome_teste',
        'prompt_teste',
        false,
        baseNodeOutput,
        entradas
      );

      expect(() => node.validate())
        .toThrow('Nó \'nome_teste\' pode ter apenas uma entrada com executar_em_paralelo: true');
    });
  });

  describe('Cenários complexos', () => {
    it('deve validar nó com entrada_grafo: true', () => {
      const node = new NodeEntitie(
        'no_entrada_grafo',
        'prompt_teste',
        true,
        baseNodeOutput
      );

      expect(node.entrada_grafo).toBe(true);
      expect(() => node.validate()).not.toThrow();
    });

    it('deve validar nó com formato de saída JSON', () => {
      const node = new NodeEntitie(
        'no_json',
        'prompt_teste',
        false,
        { nome: 'saida_json', formato: 'json' }
      );

      expect(node.saida.formato).toBe('json');
      expect(() => node.validate()).not.toThrow();
    });

    it('deve validar nó com origem resultado_no_anterior', () => {
      const entrada: Entrada = {
        variavel_prompt: 'var_resultado',
        origem: 'resultado_no_anterior',
        nome_no_origem: 'no_anterior'
      };

      const node = new NodeEntitie(
        'no_resultado',
        'prompt_teste',
        false,
        baseNodeOutput,
        [entrada]
      );

      expect(node.entradas[0].origem).toBe('resultado_no_anterior');
      expect(node.entradas[0].nome_no_origem).toBe('no_anterior');
      expect(() => node.validate()).not.toThrow();
    });
  });
});