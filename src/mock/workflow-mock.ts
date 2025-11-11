export const WORFLOW_MOCK = {
  "documentos_anexados": [
   
  ],
  "grafo": {
    "nos": [
      {
        "nome": "Análise da Distribuição de Verbas 2024",
        "entrada_grafo": true,
        "prompt": "## PERSONA: AUDITOR DE CONTAS PÚBLICAS\n**OBJETIVO PRINCIPAL:** Analisar criticamente a distribuição de verbas públicas para eventos culturais no estado de Pernambuco em 2024, com foco específico em:\n\n**TOP 10 CIDADES 2024:**\n- Ranking por valor total recebido\n- Comparativo com ano anterior (2023)\n- Valor per capita cultural\n\n**DISTRIBUIÇÃO POR REGIÃO:**\n- Metropolitana vs Interior\n- Municípios com maior incremento\n- Desequilíbrios regionais identificados\n\n**EVOLUÇÃO TEMPORAL:**\n- Variação percentual vs 2023\n- Meses com maior concentração de gastos\n- Sazonalidade dos eventos\n\n**LEGISLAÇÃO:** LOA 2024, LDO 2024, Emendas parlamentares específicas",
        "modelo_llm": "claude-3-7-sonnet@20250219",
        "temperatura": 0.5,
       "ferramentas": [
          "tcepe",
          "busca-internet",
          "tcu",
          "stf"
        ],
        "entradas": [
          {
            "variavel_prompt": "relatorio_auditoria_2024",
            "origem": "documento_anexado",
            "chave_documento_origem": "auditoria_verba_cultural_2024"
          }
        ],
        "saida": {
          "nome": "analise_distribuicao_2024",
          "formato": "markdown"
        }
      },
      {
        "nome": "Análise dos Artistas e Valores 2024",
        "entrada_grafo": true,
        "prompt": "## PERSONA: FISCAL DE COMPRAS E LICITAÇÕES\n**OBJETIVO PRINCIPAL:** Examinar detalhadamente as contratações e pagamentos a artistas em 2024:\n\n**TOP ARTISTAS MAIS BEM REMUNERADOS:**\n- Ranking dos 20 artistas com maiores cachês\n- Valor total recebido por cada artista\n- Quantidade de apresentações por artista\n- Comparativo de cachê médio\n\n**CATEGORIA DOS ARTISTAS:**\n- Músicos e bandas\n- Grupos de dança e folclore\n- Artes cênicas (teatro, circo)\n- Artes visuais e expositores\n- Artistas locais vs nacionais\n\n**ANÁLISE DE MERCADO:**\n- Preços de mercado vs valores pagos\n- Justificativa de cachês elevados\n- Contratação direta vs licitação\n- Existência de pesquisa de preços\n\n**ARTISTAS LOCAIS BENEFICIADOS:**\n- Percentual destinado a artistas pernambucanos\n- Valor médio para artistas locais\n- Impacto na economia cultural local",
        "modelo_llm": "claude-3-7-sonnet@20250219",
        "temperatura": 0.6,
        "ferramentas": [
          "tcepe",
          "busca-internet",
          "tcu",
          "stf"
        ],
        "entradas": [
          {
            "variavel_prompt": "registro_contratacoes_artistas",
            "origem": "documento_anexado",
            "chave_documento_origem": "contratacoes_artistas_2024"
          },
          {
            "variavel_prompt": "prestacoes_contas_2024",
            "origem": "documento_anexado",
            "chave_documento_origem": "prestacoes_contas_cidades_2024",
            "executar_em_paralelo": true
          }
        ],
        "saida": {
          "nome": "analise_artistas_valores",
          "formato": "markdown"
        }
      },
      {
        "nome": "Consolidação Contábil - Artistas 2024",
        "entrada_grafo": false,
        "prompt": "## PERSONA: CONTADOR PÚBLICO\n**MISSÃO:** Consolidar e validar a contabilização dos pagamentos a artistas:\n\n**REGULARIDADE FISCAL/TRIBUTÁRIA:**\n- Emissão de notas fiscais pelos artistas\n- Retenções de IRRF, INSS, ISS\n- CNPJ/CPF dos artistas contratados\n- Comprovação de quitação tributária\n\n**CLASSIFICAÇÃO CONTÁBIL:**\n- Rubricas orçamentárias utilizadas\n- Despesa com pessoal vs serviços\n- Limites legais para contratações\n- Adequação à LOA 2024\n\n**DOCUMENTAÇÃO COMPROBATÓRIA:**\n- Contratos específicos com artistas\n- Termos de recebimento de serviços\n- Relatórios de apresentação\n- Comprovantes de pagamento\n\n**VALOR TOTAL DESTINADO A ARTISTAS:**\n- Percentual do orçamento cultural\n- Comparação com outros estados\n- Evolução histórica 2023-2024",
        "modelo_llm": "gpt-4.1",
        "temperatura": 0.4,
        "ferramentas": [
          "tcepe",
          "busca-internet",
          "tcu",
          "stf"
        ],
        "entradas": [
          {
            "variavel_prompt": "analise_distribuicao",
            "origem": "resultado_no_anterior",
            "nome_no_origem": "Análise da Distribuição de Verbas 2024"
          },
          {
            "variavel_prompt": "analise_artistas",
            "origem": "resultado_no_anterior",
            "nome_no_origem": "Análise dos Artistas e Valores 2024"
          }
        ],
        "saida": {
          "nome": "consolidacao_contabil_artistas",
          "formato": "markdown"
        }
      },
      {
        "nome": "Parecer Técnico TCE-PE - Foco Artistas 2024",
        "entrada_grafo": false,
        "prompt": "## PERSONA: CONTADOR DO TCE-PE\n**MISSÃO CRÍTICA:** Elaborar parecer técnico sobre a regularidade dos pagamentos a artistas:\n\n**IRREGULARIDADES IDENTIFICADAS:**\n- Superfaturamento de cachês\n- Ausência de licitação quando necessária\n- Pagamentos a artistas fantasmas\n- Duplicidade de pagamentos\n- Contratação sem habilitação técnica\n\n**ARTISTAS COM MAIORES VALORES:**\n- Top 15 artistas por valor recebido\n- Justificativa técnica dos cachês\n- Comparativo com mercado\n- Existência de contrapartidas\n\n**RECOMENDAÇÕES ESPECÍFICAS:**\n- Devolução de valores superfaturados\n- Suspensão de contratações irregulares\n- Apuração de responsabilidade\n- Adequação aos parâmetros do TCE\n\n**IMPACTO ORÇAMENTÁRIO:**\n- Percentual do orçamento em artistas\n- Eficiência na aplicação\n- Retorno cultural e social",
        "modelo_llm": "gemini-2.5-pro",
        "temperatura": 0.2,
        "ferramentas": [
          "tcepe",
          "busca-internet",
          "tcu",
          "stf"
        ],
        "entradas": [
          {
            "variavel_prompt": "analise_distribuicao",
            "origem": "resultado_no_anterior",
            "nome_no_origem": "Análise da Distribuição de Verbas 2024"
          },
          {
            "variavel_prompt": "analise_artistas",
            "origem": "resultado_no_anterior",
            "nome_no_origem": "Análise dos Artistas e Valores 2024"
          },
          {
            "variavel_prompt": "consolidacao_contabil",
            "origem": "resultado_no_anterior",
            "nome_no_origem": "Consolidação Contábil - Artistas 2024"
          }
        ],
        "saida": {
          "nome": "parecer_tecnico_artistas_2024",
          "formato": "markdown"
        }
      },
      {
        "nome": "Extração de Dados - Ranking Artistas 2024",
        "entrada_grafo": false,
        "prompt": "## PERSONA: ANALISTA DE DADOS DO CONTROLE EXTERNO\n**MISSÃO CRÍTICA:** Extrair e estruturar dados detalhados sobre artistas e valores em 2024:\n\n**RANKING COMPLETO DE ARTISTAS:**\n- Nome completo do artista/banda\n- CPF/CNPJ do contratado\n- Valor total recebido em 2024\n- Quantidade de apresentações\n- Cachê médio por apresentação\n- Municípios onde se apresentou\n- Tipo de evento realizado\n\n**ANÁLISE POR CATEGORIA:**\n- Música popular\n- Música erudita\n- Dança e folclore\n- Teatro e artes cênicas\n- Artes visuais\n- Cultura popular\n\n**DADOS DEMOGRÁFICOS DOS ARTISTAS:**\n- Artistas locais (Pernambuco)\n- Artistas de outros estados\n- Coletivos culturais\n- Artistas independentes vs empresas\n\n**FORMATO EXIGIDO:** JSON estruturado com arrays para ranking de artistas, cidades e eventos",
        "modelo_llm": "gemini-2.5-pro",
        "temperatura": 0.1,
"ferramentas": [
          "tcepe",
          "busca-internet",
          "tcu",
          "stf"
        ],        "entradas": [
          {
            "variavel_prompt": "analise_distribuicao",
            "origem": "resultado_no_anterior",
            "nome_no_origem": "Análise da Distribuição de Verbas 2024"
          },
          {
            "variavel_prompt": "analise_artistas",
            "origem": "resultado_no_anterior",
            "nome_no_origem": "Análise dos Artistas e Valores 2024"
          },
          {
            "variavel_prompt": "consolidacao_contabil",
            "origem": "resultado_no_anterior",
            "nome_no_origem": "Consolidação Contábil - Artistas 2024"
          },
          {
            "variavel_prompt": "parecer_tecnico",
            "origem": "resultado_no_anterior",
            "nome_no_origem": "Parecer Técnico TCE-PE - Foco Artistas 2024"
          }
        ],
        "saida": {
          "nome": "dados_estruturados_artistas_2024",
          "formato": "json"
        }
      }
    ],
    "arestas": [
      { "origem": "Análise da Distribuição de Verbas 2024", "destino": "Consolidação Contábil - Artistas 2024" },
      { "origem": "Análise dos Artistas e Valores 2024", "destino": "Consolidação Contábil - Artistas 2024" },
      { "origem": "Consolidação Contábil - Artistas 2024", "destino": "Parecer Técnico TCE-PE - Foco Artistas 2024" },
      { "origem": "Parecer Técnico TCE-PE - Foco Artistas 2024", "destino": "Extração de Dados - Ranking Artistas 2024" },
      { "origem": "Extração de Dados - Ranking Artistas 2024", "destino": "END" }
    ]
  },
  "formato_resultado_final": {
    "combinacoes": [
      {
        "nome_da_saida": "relatorio_completo_artistas_2024",
        "combinar_resultados": ["analise_distribuicao_2024", "analise_artistas_valores", "consolidacao_contabil_artistas"],
        "manter_originais": false
      }
    ],
    "saidas_individuais": ["dados_estruturados_artistas_2024", "parecer_tecnico_artistas_2024"]
  }
}