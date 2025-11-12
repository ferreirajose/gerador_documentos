import { Grafo } from "@/domain/entities/Grafo";
import { Aresta } from "@/domain/entities/Aresta";
import NodeEntitie from "@/domain/entities/NodeEntitie";
import { describe, beforeEach, test, expect, vi } from "vitest";

describe("Grafo", () => {
  let nodes: NodeEntitie[];
  let arestas: Aresta[];
  let grafo: Grafo;

  beforeEach(() => {
    // Configuração básica de nós e arestas para os testes
    nodes = [
      new NodeEntitie(
        "Nó 1",
        "Prompt do nó 1 {variavel1}",
        false,
        { nome: "saida1", formato: "markdown" },
        {
            permitir_usuario_finalizar: true,
            ia_pode_concluir: true,
            requer_aprovacao_explicita: true,
            maximo_de_interacoes: 3,
            modo_de_saida: "historico_completo",
          },
        [
          {
            variavel_prompt: "variavel1",
            origem: "documento_anexado",
            chave_documento_origem: "doc1",
          },
        ]
      ),
      new NodeEntitie(
        "Nó 2",
        "Prompt do nó 2 {variavel2}",
        false,
        { nome: "saida2", formato: "json" },
        {
            permitir_usuario_finalizar: true,
            ia_pode_concluir: true,
            requer_aprovacao_explicita: true,
            maximo_de_interacoes: 3,
            modo_de_saida: "historico_completo",
          },
        [
          {
            variavel_prompt: "variavel2",
            origem: "resultado_no_anterior",
            nome_no_origem: "Nó 1",
          },
        ]
      ),
      new NodeEntitie(
        "Nó 3",
        "Prompt do nó 3",
        false,
        { nome: "saida3", formato: "markdown" },
        {
            permitir_usuario_finalizar: true,
            ia_pode_concluir: true,
            requer_aprovacao_explicita: true,
            maximo_de_interacoes: 3,
            modo_de_saida: "historico_completo",
          },
        []
      ),
    ];

    arestas = [
      new Aresta("Nó 1", "Nó 2"),
      new Aresta("Nó 2", "Nó 3"),
      new Aresta("Nó 3", "END"),
    ];

    grafo = new Grafo(nodes, arestas);
  });

  describe("Construtor", () => {
    test("deve criar uma instância de Grafo com nós e arestas", () => {
      expect(grafo).toBeInstanceOf(Grafo);
      expect(grafo.nos).toHaveLength(3);
      expect(grafo.arestas).toHaveLength(3);
    });

    test("deve inicializar com listas vazias se não fornecido", () => {
      const grafoVazio = new Grafo([], []);

      expect(grafoVazio.nos).toEqual([]);
      expect(grafoVazio.arestas).toEqual([]);
    });
  });

  describe("validate()", () => {
    test("deve validar grafo corretamente quando estiver válido", () => {
      expect(() => grafo.validate()).not.toThrow();
    });

    test("deve lançar erro quando há nó desconectado", () => {
      const nodesComDesconectado = [
        ...nodes,
        new NodeEntitie(
          "Nó Desconectado",
          "Prompt desconectado",
          false,
          { nome: "saida_desconectada", formato: "markdown" },
          {
            permitir_usuario_finalizar: true,
            ia_pode_concluir: true,
            requer_aprovacao_explicita: true,
            maximo_de_interacoes: 3,
            modo_de_saida: "historico_completo",
          },
          []
        ),
      ];

      const grafoComDesconectado = new Grafo(nodesComDesconectado, arestas);

      expect(() => grafoComDesconectado.validate()).toThrow(
        "Nó 'Nó Desconectado' não está conectado no grafo"
      );
    });

    test("deve lançar erro quando não há aresta para END", () => {
      const arestasSemEnd = [
        new Aresta("Nó 1", "Nó 2"),
        new Aresta("Nó 2", "Nó 3"),
        // Sem aresta para END
      ];

      const grafoSemEnd = new Grafo(nodes, arestasSemEnd);

      expect(() => grafoSemEnd.validate()).toThrow(
        'Workflow deve terminar com uma aresta para "END"'
      );
    });

    test("deve aceitar múltiplas arestas para END", () => {
      const arestasMultiploEnd = [
        new Aresta("Nó 1", "Nó 2"),
        new Aresta("Nó 2", "END"),
        new Aresta("Nó 3", "END"),
      ];

      const grafoMultiploEnd = new Grafo(nodes, arestasMultiploEnd);

      expect(() => grafoMultiploEnd.validate()).not.toThrow();
    });

    test("deve validar nós individualmente", () => {
      const nodeSpy = vi.spyOn(nodes[0], "validate");

      grafo.validate();

      expect(nodeSpy).toHaveBeenCalled();
    });

    test("deve validar arestas individualmente", () => {
      const arestaSpy = vi.spyOn(arestas[0], "validate");

      grafo.validate();

      expect(arestaSpy).toHaveBeenCalledWith(nodes);
    });

    test("deve detectar nó inválido durante validação", () => {
      const nodesInvalidos = [
        new NodeEntitie(
          "", // Nome vazio - inválido
          "Prompt inválido",
          false,
          { nome: "saida_invalida", formato: "markdown" },
          {
            permitir_usuario_finalizar: true,
            ia_pode_concluir: true,
            requer_aprovacao_explicita: true,
            maximo_de_interacoes: 3,
            modo_de_saida: "historico_completo",
          },
          []
        ),
      ];

      const arestasInvalidas = [new Aresta("", "END")];
      const grafoInvalido = new Grafo(nodesInvalidos, arestasInvalidas);

      expect(() => grafoInvalido.validate()).toThrow(
        "Nome do nó é obrigatório"
      );
    });

    test("deve detectar aresta inválida durante validação", () => {
      const arestasInvalidas = [
        new Aresta("Nó Inexistente", "END"), // Nó de origem não existe
      ];

      const grafoInvalido = new Grafo(nodes, arestasInvalidas);

      expect(() => grafoInvalido.validate()).toThrow(
        "Aresta: nó de origem 'Nó Inexistente' não encontrado"
      );
    });
  });

  describe("Cenários Específicos", () => {
    test("deve validar grafo com apenas um nó conectado ao END", () => {
      const nodeUnico = [
        new NodeEntitie(
          "Nó Único",
          "Prompt único",
          false,
          { nome: "saida_unica", formato: "markdown" },
          {
            permitir_usuario_finalizar: true,
            ia_pode_concluir: true,
            requer_aprovacao_explicita: true,
            maximo_de_interacoes: 3,
            modo_de_saida: "historico_completo",
          },
          []
        ),
      ];

      const arestaUnica = [new Aresta("Nó Único", "END")];
      const grafoUnico = new Grafo(nodeUnico, arestaUnica);

      expect(() => grafoUnico.validate()).not.toThrow();
    });

    test("deve validar grafo complexo com múltiplos caminhos", () => {
      const nodesComplexos = [
        new NodeEntitie(
          "Início",
          "Prompt início",
          false,
          { nome: "inicio", formato: "markdown" },
          {
            permitir_usuario_finalizar: true,
            ia_pode_concluir: true,
            requer_aprovacao_explicita: true,
            maximo_de_interacoes: 3,
            modo_de_saida: "historico_completo",
          },
          []
        ),
        new NodeEntitie(
          "Processo A",
          "Prompt A",
          false,
          { nome: "processo_a", formato: "markdown" },
          {
            permitir_usuario_finalizar: true,
            ia_pode_concluir: true,
            requer_aprovacao_explicita: true,
            maximo_de_interacoes: 3,
            modo_de_saida: "historico_completo",
          },
          []
        ),
        new NodeEntitie(
          "Processo B",
          "Prompt B",
          false,
          { nome: "processo_b", formato: "markdown" },
          {
            permitir_usuario_finalizar: true,
            ia_pode_concluir: true,
            requer_aprovacao_explicita: true,
            maximo_de_interacoes: 3,
            modo_de_saida: "historico_completo",
          },
          []
        ),
        new NodeEntitie(
          "Processo C",
          "Prompt C",
          false,
          { nome: "processo_c", formato: "markdown" },
          {
            permitir_usuario_finalizar: true,
            ia_pode_concluir: true,
            requer_aprovacao_explicita: true,
            maximo_de_interacoes: 3,
            modo_de_saida: "historico_completo",
          },
          []
        ),
        new NodeEntitie(
          "Fim",
          "Prompt fim",
          false,
          { nome: "fim", formato: "markdown" },
          {
            permitir_usuario_finalizar: true,
            ia_pode_concluir: true,
            requer_aprovacao_explicita: true,
            maximo_de_interacoes: 3,
            modo_de_saida: "historico_completo",
          },
          []
        ),
      ];

      const arestasComplexas = [
        new Aresta("Início", "Processo A"),
        new Aresta("Início", "Processo B"),
        new Aresta("Processo A", "Processo C"),
        new Aresta("Processo B", "Processo C"),
        new Aresta("Processo C", "Fim"),
        new Aresta("Fim", "END"),
      ];

      const grafoComplexo = new Grafo(nodesComplexos, arestasComplexas);

      expect(() => grafoComplexo.validate()).not.toThrow();
    });

    test("deve permitir nó com entrada_grafo true", () => {
      const nodeComEntradaGrafo = [
        new NodeEntitie(
          "Nó Entrada",
          "Prompt entrada",
          true, // entrada_grafo = true
          { nome: "entrada", formato: "markdown" },
          {
            permitir_usuario_finalizar: true,
            ia_pode_concluir: true,
            requer_aprovacao_explicita: true,
            maximo_de_interacoes: 3,
            modo_de_saida: "ultima_mensagem",
          },
          []
        ),
      ];

      const arestaEntrada = [new Aresta("Nó Entrada", "END")];
      const grafoComEntrada = new Grafo(nodeComEntradaGrafo, arestaEntrada);

      expect(() => grafoComEntrada.validate()).not.toThrow();
    });
  });

  describe("Propriedades", () => {
    test("deve ter propriedade nos como readonly", () => {
      expect(grafo.nos).toBeDefined();
      expect(Array.isArray(grafo.nos)).toBe(true);
    });

    test("deve ter propriedade arestas como readonly", () => {
      expect(grafo.arestas).toBeDefined();
      expect(Array.isArray(grafo.arestas)).toBe(true);
    });

    test("deve manter a referência original dos nós e arestas", () => {
      expect(grafo.nos).toBe(nodes);
      expect(grafo.arestas).toBe(arestas);
    });
  });
});
