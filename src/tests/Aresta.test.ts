import { Aresta } from "@/domain/entities/Aresta";
import NodeEntitie from "@/domain/entities/NodeEntitie";
import { describe, it, expect, beforeEach } from "vitest";

describe("Aresta", () => {
  let nodes: NodeEntitie[];
  let node1: NodeEntitie;
  let node2: NodeEntitie;
  let node3: NodeEntitie;

  beforeEach(() => {
    node1 = new NodeEntitie(
      "Node 1",
      "Prompt do node 1",
      false,
      { nome: "saida_1", formato: "markdown" },
      undefined,
      []
    );

    node2 = new NodeEntitie(
      "Node 2", 
      "Prompt do node 2",
      false,
      { nome: "saida_2", formato: "json" },
      undefined,
      []
    );

    node3 = new NodeEntitie(
      "Node 3",
      "Prompt do node 3", 
      true,
      { nome: "saida_3", formato: "markdown" },
      undefined,
      []
    );

    nodes = [node1, node2, node3];
  });

  describe("Validações básicas", () => {
    it("deve criar uma instância válida", () => {
      const aresta = new Aresta("Node 1", "Node 2");

      expect(aresta.origem).toBe("Node 1");
      expect(aresta.destino).toBe("Node 2");
    });

    it("deve criar aresta com destino END", () => {
      const aresta = new Aresta("Node 1", "END");

      expect(aresta.origem).toBe("Node 1");
      expect(aresta.destino).toBe("END");
    });
  });

  describe("Validação - método validate", () => {
    it("deve validar aresta com nós existentes", () => {
      const aresta = new Aresta("Node 1", "Node 2");

      expect(() => aresta.validate(nodes)).not.toThrow();
    });

    it("deve validar aresta com destino END", () => {
      const aresta = new Aresta("Node 3", "END");

      expect(() => aresta.validate(nodes)).not.toThrow();
    });

    it("deve validar aresta com nó de entrada_grafo como origem", () => {
      const aresta = new Aresta("Node 3", "Node 1");

      expect(() => aresta.validate(nodes)).not.toThrow();
    });

    it("deve lançar erro quando nó de origem não existe", () => {
      const aresta = new Aresta("Node Inexistente", "Node 2");

      expect(() => aresta.validate(nodes))
        .toThrow("Aresta: nó de origem 'Node Inexistente' não encontrado");
    });

    it("deve lançar erro quando nó de destino não existe", () => {
      const aresta = new Aresta("Node 1", "Node Inexistente");

      expect(() => aresta.validate(nodes))
        .toThrow("Aresta: nó de destino 'Node Inexistente' não encontrado");
    });

    it("deve lançar erro quando ambos os nós não existem", () => {
      const aresta = new Aresta("Origem Inexistente", "Destino Inexistente");

      expect(() => aresta.validate(nodes))
        .toThrow("Aresta: nó de origem 'Origem Inexistente' não encontrado");
    });

    it("deve permitir destino END mesmo sem nó correspondente", () => {
      const aresta = new Aresta("Node 1", "END");

      expect(() => aresta.validate(nodes)).not.toThrow();
    });
  });

  describe("Cenários de borda", () => {
    it("deve validar aresta com nomes de nós com espaços", () => {
      const nodeComEspaco = new NodeEntitie(
        "Node Com Espaço",
        "Prompt teste",
        false,
        { nome: "saida_espaco", formato: "markdown" },
        undefined,
        []
      );

      const nodesComEspaco = [...nodes, nodeComEspaco];
      const aresta = new Aresta("Node 1", "Node Com Espaço");

      expect(() => aresta.validate(nodesComEspaco)).not.toThrow();
    });

    it("deve validar aresta com nomes de nós especiais", () => {
      const nodeEspecial = new NodeEntitie(
        "Node_Especial-123",
        "Prompt teste",
        false,
        { nome: "saida_especial", formato: "markdown" },
        undefined,
        []
      );

      const nodesEspeciais = [...nodes, nodeEspecial];
      const aresta = new Aresta("Node_Especial-123", "Node 2");

      expect(() => aresta.validate(nodesEspeciais)).not.toThrow();
    });

    it("deve validar múltiplas arestas do mesmo nó de origem", () => {
      const aresta1 = new Aresta("Node 1", "Node 2");
      const aresta2 = new Aresta("Node 1", "Node 3");
      const aresta3 = new Aresta("Node 1", "END");

      expect(() => aresta1.validate(nodes)).not.toThrow();
      expect(() => aresta2.validate(nodes)).not.toThrow();
      expect(() => aresta3.validate(nodes)).not.toThrow();
    });

    it("deve validar múltiplas arestas para o mesmo nó de destino", () => {
      const aresta1 = new Aresta("Node 1", "Node 3");
      const aresta2 = new Aresta("Node 2", "Node 3");

      expect(() => aresta1.validate(nodes)).not.toThrow();
      expect(() => aresta2.validate(nodes)).not.toThrow();
    });
  });

  describe("Integração com NodeEntitie", () => {
    it("deve validar aresta conectando nós com diferentes configurações", () => {
      const nodeCompleto = new NodeEntitie(
        "Node Completo",
        "Prompt {var1} {var2}",
        true,
        { nome: "saida_completa", formato: "json" },
        {
          permitir_usuario_finalizar: true,
          ia_pode_concluir: false,
          requer_aprovacao_explicita: true,
          maximo_de_interacoes: 5,
          modo_de_saida: "historico_completo"
        },
        [
          {
            variavel_prompt: "var1",
            origem: "documento_anexado",
            chave_documento_origem: "doc1"
          },
          {
            variavel_prompt: "var2",
            origem: "resultado_no_anterior",
            nome_no_origem: "Node 1",
            executar_em_paralelo: true
          }
        ],
        "gpt-4",
        0.8,
        ["ferramenta1", "ferramenta2"]
      );

      const nodesCompletos = [...nodes, nodeCompleto];
      const aresta = new Aresta("Node 2", "Node Completo");

      expect(() => aresta.validate(nodesCompletos)).not.toThrow();
    });

    it("deve validar ciclo no grafo", () => {
      const aresta1 = new Aresta("Node 1", "Node 2");
      const aresta2 = new Aresta("Node 2", "Node 1");

      // A validação da aresta não verifica ciclos, apenas a existência dos nós
      expect(() => aresta1.validate(nodes)).not.toThrow();
      expect(() => aresta2.validate(nodes)).not.toThrow();
    });
  });

  describe("Mensagens de erro", () => {
    it("deve incluir o nome do nó de origem na mensagem de erro", () => {
      const aresta = new Aresta("NodeInexistente", "Node 2");

      expect(() => aresta.validate(nodes))
        .toThrow(/nó de origem 'NodeInexistente'/);
    });

    it("deve incluir o nome do nó de destino na mensagem de erro", () => {
      const aresta = new Aresta("Node 1", "NodeInexistente");

      expect(() => aresta.validate(nodes))
        .toThrow(/nó de destino 'NodeInexistente'/);
    });

    it("deve priorizar erro de origem sobre destino", () => {
      const aresta = new Aresta("OrigemInexistente", "DestinoInexistente");

      try {
        aresta.validate(nodes);
      } catch (error: any) {
        expect(error.message).toContain("nó de origem 'OrigemInexistente'");
        expect(error.message).not.toContain("nó de destino 'DestinoInexistente'");
      }
    });
  });
});