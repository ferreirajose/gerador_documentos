import { Aresta } from "@/domain/entities/Aresta";
import { Grafo } from "@/domain/entities/Grafo";
import NodeEntitie from "@/domain/entities/NodeEntitie";
import { ResultadoFinal, SaidaFinal } from "@/domain/entities/ResultadoFinal";
import { Workflow, DocumentoAnexado } from "@/domain/entities/Workflow";
import { describe, beforeEach, test, expect } from "vitest";

describe("Workflow Completo", () => {
  let workflow: Workflow;
  let nodes: NodeEntitie[];
  let arestas: Aresta[];
  let documentosAnexados: DocumentoAnexado[];
  let resultadoFinal: ResultadoFinal;

  beforeEach(() => {
    // Criar os nós
    nodes = [
      new NodeEntitie(
        "Análise da Auditoria",
        "Analise o documento {documento_auditoria} e identifique os principais pontos de auditoria. Foque em: {foco_analise}",
        false,
        { nome: "analise_auditoria", formato: "markdown" },
        [
          {
            variavel_prompt: "documento_auditoria",
            origem: "documento_anexado",
            chave_documento_origem: "relatorio_auditoria",
          },
          {
            variavel_prompt: "foco_analise",
            origem: "resultado_no_anterior",
            nome_no_origem: "Extração de Dados Estruturados",
          },
        ],
        "gpt-4",
        0.7,
        ["analise_documentos"]
      ),

      new NodeEntitie(
        "Elaboração do Voto",
        "Com base na análise {analise_auditoria} e nas defesas {analise_defesas}, elabore um voto técnico considerando: {aspectos_voto}",
        true,
        { nome: "voto_tecnico", formato: "markdown" },
        [
          {
            variavel_prompt: "analise_auditoria",
            origem: "resultado_no_anterior",
            nome_no_origem: "Análise da Auditoria",
          },
          {
            variavel_prompt: "analise_defesas",
            origem: "resultado_no_anterior",
            nome_no_origem: "Análise das Defesas",
          },
          {
            variavel_prompt: "aspectos_voto",
            origem: "resultado_no_anterior",
            nome_no_origem: "Extração de Dados Estruturados",
            executar_em_paralelo: true,
          },
        ],
        "gpt-4",
        0.5,
        ["elaboracao_texto"]
      ),

      new NodeEntitie(
        "Análise das Defesas",
        "Analise as defesas apresentadas no documento {documento_defesas} e identifique os argumentos principais: {parametros_analise}",
        false,
        { nome: "analise_defesas", formato: "json" },
        [
          {
            variavel_prompt: "documento_defesas",
            origem: "documento_anexado",
            chave_documento_origem: "documento_defesas",
          },
          {
            variavel_prompt: "parametros_analise",
            origem: "resultado_no_anterior",
            nome_no_origem: "Extração de Dados Estruturados",
          },
        ],
        "gpt-4",
        0.6,
        ["analise_argumentos"]
      ),

      new NodeEntitie(
        "Extração de Dados Estruturados",
        "Extraia dados estruturados do documento {documento_base} seguindo o formato: {formato_extração}",
        false,
        { nome: "dados_estruturados", formato: "json" },
        [
          {
            variavel_prompt: "documento_base",
            origem: "documento_anexado",
            chave_documento_origem: "relatorio_auditoria",
          },
          {
            variavel_prompt: "formato_extração",
            origem: "documento_anexado",
            chave_documento_origem: "template_extração",
          },
        ],
        "gpt-4-turbo",
        0.3,
        ["extração_dados"]
      ),
    ];

    // Criar as arestas (conexões)
    arestas = [
      new Aresta("Extração de Dados Estruturados", "Análise da Auditoria"),
      new Aresta("Extração de Dados Estruturados", "Análise das Defesas"),
      new Aresta("Análise da Auditoria", "Elaboração do Voto"),
      new Aresta("Análise das Defesas", "Elaboração do Voto"),
      new Aresta("Elaboração do Voto", "END"),
    ];

    // Criar documentos anexados
    documentosAnexados = [
      {
        chave: "relatorio_auditoria",
        descricao: "Relatório completo da auditoria contábil",
        uuid_unico: "550e8400-e29b-41d4-a716-446655440000",
      },
      {
        chave: "documento_defesas",
        descricao: "Documento com as defesas apresentadas",
        uuids_lista: [
          "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
          "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
          "6ba7b812-9dad-11d1-80b4-00c04fd430c8",
        ],
      },
      {
        chave: "template_extração",
        descricao: "Template para extração de dados estruturados",
        uuid_unico: "123e4567-e89b-12d3-a456-426614174000",
      },
    ];

    // Criar resultado final
    const saidasFinais: SaidaFinal[] = [
      {
        nome: "voto_tecnico",
        manter_original: true,
      },
      {
        nome: "relatorio_consolidado",
        combinar: ["analise_auditoria", "analise_defesas", "voto_tecnico"],
        template:
          "Template de consolidação: {analise_auditoria} | {analise_defesas} | {voto_tecnico}",
      },
    ];

    resultadoFinal = new ResultadoFinal(saidasFinais);
  });

  test("deve criar um workflow completo válido", () => {
    // Criar grafo
    const grafo = new Grafo(nodes, arestas);

    // Criar workflow
    workflow = new Workflow(documentosAnexados, grafo, resultadoFinal);

    // Validar workflow
    expect(() => workflow.validate()).not.toThrow();

    // Verificar estrutura do workflow
    expect(workflow.documentos_anexados).toHaveLength(3);
    expect(workflow.grafo.nos).toHaveLength(4);
    expect(workflow.grafo.arestas).toHaveLength(5);
    expect(workflow.resultado_final?.saidas).toHaveLength(2);
  });

  test("deve conter todos os nós com nomes corretos", () => {
    const grafo = new Grafo(nodes, arestas);
    workflow = new Workflow(documentosAnexados, grafo, resultadoFinal);

    const nomesNos = workflow.grafo.nos.map((node) => node.nome);

    expect(nomesNos).toContain("Análise da Auditoria");
    expect(nomesNos).toContain("Elaboração do Voto");
    expect(nomesNos).toContain("Análise das Defesas");
    expect(nomesNos).toContain("Extração de Dados Estruturados");
  });

  test("deve ter conexões válidas entre os nós", () => {
    const grafo = new Grafo(nodes, arestas);
    workflow = new Workflow(documentosAnexados, grafo, resultadoFinal);

    const conexoes = workflow.grafo.arestas.map(
      (aresta) => `${aresta.origem} -> ${aresta.destino}`
    );

    expect(conexoes).toContain(
      "Extração de Dados Estruturados -> Análise da Auditoria"
    );
    expect(conexoes).toContain(
      "Extração de Dados Estruturados -> Análise das Defesas"
    );
    expect(conexoes).toContain("Análise da Auditoria -> Elaboração do Voto");
    expect(conexoes).toContain("Análise das Defesas -> Elaboração do Voto");
    expect(conexoes).toContain("Elaboração do Voto -> END");
  });

  test("deve criar documentos anexados com UUID único e lista", () => {
    const grafo = new Grafo(nodes, arestas);
    workflow = new Workflow(documentosAnexados, grafo, resultadoFinal);

    const docComUUIDUnico = workflow.documentos_anexados.find(
      (doc) => doc.uuid_unico !== undefined
    );
    const docComUUIDsLista = workflow.documentos_anexados.find(
      (doc) => doc.uuids_lista !== undefined
    );

    expect(docComUUIDUnico).toBeDefined();
    expect(docComUUIDUnico?.uuid_unico).toBe(
      "550e8400-e29b-41d4-a716-446655440000"
    );

    expect(docComUUIDsLista).toBeDefined();
    expect(docComUUIDsLista?.uuids_lista).toHaveLength(3);
  });

  test("deve gerar JSON válido", () => {
    const grafo = new Grafo(nodes, arestas);
    workflow = new Workflow(documentosAnexados, grafo, resultadoFinal);

    const json = workflow.toJSON();
    const jsonString = workflow.toJsonString();

    expect(json).toHaveProperty("documentos_anexados");
    expect(json).toHaveProperty("grafo");
    expect(json).toHaveProperty("resultado_final");

    expect(json.documentos_anexados).toHaveLength(3);
    expect(json.grafo.nos).toHaveLength(4);
    expect(json.grafo.arestas).toHaveLength(5);
    expect(json.resultado_final?.saidas).toHaveLength(2);

    expect(typeof jsonString).toBe("string");
    expect(() => JSON.parse(jsonString)).not.toThrow();
  });

  test("deve validar referências entre documentos e nós", () => {
    const grafo = new Grafo(nodes, arestas);
    workflow = new Workflow(documentosAnexados, grafo, resultadoFinal);

    expect(() => workflow.validate()).not.toThrow();
  });

  test("deve validar variáveis nos prompts", () => {
    const grafo = new Grafo(nodes, arestas);
    workflow = new Workflow(documentosAnexados, grafo, resultadoFinal);

    expect(() => workflow.validate()).not.toThrow();
  });

  test("deve detectar workflow inválido com documento não encontrado", () => {
    const nodesComDocumentoInvalido = [
      new NodeEntitie(
        "Análise da Auditoria",
        "Analise {documento_inexistente}",
        false,
        { nome: "saida_teste", formato: "markdown" },
        [
          {
            variavel_prompt: "documento_inexistente",
            origem: "documento_anexado",
            chave_documento_origem: "documento_que_nao_existe",
          },
        ]
      ),
    ];

    const arestasSimples = [new Aresta("Análise da Auditoria", "END")];
    const grafo = new Grafo(nodesComDocumentoInvalido, arestasSimples);
    const workflowInvalido = new Workflow(documentosAnexados, grafo);

    expect(() => workflowInvalido.validate()).toThrow(
      "documento_que_nao_existe"
    );
  });

  test("deve exibir o JSON completo do workflow gerado", () => {
    // Criar grafo
    const grafo = new Grafo(nodes, arestas);

    // Criar workflow
    workflow = new Workflow(documentosAnexados, grafo, resultadoFinal);

    // Gerar JSON
    const json = workflow.toJSON();
    const jsonString = workflow.toJsonString();

    // Exibir JSON formatado no console
    console.log("=== JSON COMPLETO DO WORKFLOW ===");
    console.log(jsonString);
    console.log("=================================");

    // Verificar estrutura básica
    expect(json).toHaveProperty("documentos_anexados");
    expect(json).toHaveProperty("grafo");
    expect(json).toHaveProperty("resultado_final");

    // Verificar tipos específicos
    expect(typeof jsonString).toBe("string");
    expect(() => JSON.parse(jsonString)).not.toThrow();
  });

  // Teste adicional para verificar estrutura específica
  test("deve ter estrutura JSON correta para integração", () => {
    const grafo = new Grafo(nodes, arestas);
    workflow = new Workflow(documentosAnexados, grafo, resultadoFinal);

    const json = workflow.toJSON();

    // Verificar se todos os campos obrigatórios existem
    expect(json.documentos_anexados).toBeDefined();
    expect(json.grafo).toBeDefined();
    expect(json.grafo.nos).toBeDefined();
    expect(json.grafo.arestas).toBeDefined();
    expect(json.resultado_final).toBeDefined();

    // Verificar tipos dos documentos anexados
    const docComUUID = json.documentos_anexados.find(
      (doc: DocumentoAnexado) => doc.uuid_unico
    );
    const docComListaUUID = json.documentos_anexados.find(
      (doc: DocumentoAnexado) => doc.uuids_lista
    );

    expect(docComUUID?.uuid_unico).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(Array.isArray(docComListaUUID?.uuids_lista)).toBe(true);
    expect(
      docComListaUUID.uuids_lista.every((uuid: string) =>
        uuid.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        )
      )
    ).toBe(true);

    // Verificar se todos os nós têm os campos esperados
    json.grafo.nos.forEach((node: any) => {
      expect(node.nome).toBeDefined();
      expect(node.prompt).toBeDefined();
      expect(node.saida).toBeDefined();
      expect(node.saida.nome).toBeDefined();
    });

    // Verificar se todas as arestas têm origem e destino
    json.grafo.arestas.forEach((aresta: any) => {
      expect(aresta.origem).toBeDefined();
      expect(aresta.destino).toBeDefined();
    });

    // Verificar resultado final
    json.resultado_final?.saidas.forEach((saida: any) => {
      expect(saida.nome).toBeDefined();
    });
  });

  // Teste para validar a propriedade entrada_grafo
  test("deve validar nós com entrada_grafo corretamente", () => {
    const grafo = new Grafo(nodes, arestas);
    workflow = new Workflow(documentosAnexados, grafo, resultadoFinal);

    const noComEntradaGrafo = workflow.grafo.nos.find(node => node.entrada_grafo === true);
    const noSemEntradaGrafo = workflow.grafo.nos.find(node => node.entrada_grafo === false);

    expect(noComEntradaGrafo).toBeDefined();
    expect(noComEntradaGrafo?.nome).toBe("Elaboração do Voto");
    expect(noSemEntradaGrafo).toBeDefined();
  });

  // Teste para validar nomes únicos
  test("deve detectar nomes de nós duplicados", () => {
    const nodesDuplicados = [
      new NodeEntitie(
        "Nome Duplicado",
        "Prompt 1",
        false,
        { nome: "saida1", formato: "markdown" },
        []
      ),
      new NodeEntitie(
        "Nome Duplicado", 
        "Prompt 2",
        false,
        { nome: "saida2", formato: "markdown" },
        []
      ),
    ];

    expect(() => {
      nodesDuplicados.forEach(node => node.validate(nodesDuplicados));
    }).toThrow('Já existe um nó com o nome "Nome Duplicado"');
  });
});