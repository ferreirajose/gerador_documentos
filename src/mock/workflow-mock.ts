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
        },
         "interacao_com_usuario": {
          "permitir_usuario_finalizar": true,
          "ia_pode_concluir": true,
          "requer_aprovacao_explicita": true,
          "maximo_de_interacoes": 10,
          "modo_de_saida": "historico_completo"
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

export const WORFLOW_INTER = {
  "documentos_anexados": [],
  "grafo": {
    "nos": [
      {
        "nome": "Escolhendo tema",
        "entrada_grafo": true,
        "prompt": "Começando. Escolha um tema improvável para se fazer uma piada sobre. Não faça a piada! Quero apenas o tema.",
        "modelo_llm": "gpt-4o-mini",
        "temperatura": 1.0,
        "ferramentas": [],
        "entradas": [],
        "saida": {
          "nome": "tema_piada",
          "formato": "markdown"
        }
      },
      {
        "nome": "Criar Piada",
        "entrada_grafo": false,
        "prompt": "Conte uma piada curta sobre {tema} e pergunte ao usuário se ela é boa. Se ele aprovar, retorne a piada completa e adicione [CONCLUÍDO] no final.",
        "modelo_llm": "gpt-4o-mini",
        "temperatura": 0.9,
        "ferramentas": [],
        "entradas": [
          {
            "variavel_prompt": "tema",
            "origem": "resultado_no_anterior",
            "nome_no_origem": "Escolhendo tema",
            "executar_em_paralelo": false
          }
        ],
        "saida": {
          "nome": "piada_final",
          "formato": "markdown"
        },
        "interacao_com_usuario": {
          "permitir_usuario_finalizar": true,
          "ia_pode_concluir": true,
          "requer_aprovacao_explicita": true,
          "maximo_de_interacoes": 3,
          "modo_de_saida": "ambos"
        }
      },
      {
        "nome": "Avaliar Piada",
        "entrada_grafo": false,
        "prompt": "Avalie esta piada de 0 a 10:\n\n{piada}\n\nDê uma nota e justifique brevemente.",
        "modelo_llm": "gpt-4o-mini",
        "temperatura": 0.3,
        "ferramentas": [],
        "entradas": [
          {
            "variavel_prompt": "piada",
            "origem": "resultado_no_anterior",
            "nome_no_origem": "Criar Piada",
            "executar_em_paralelo": false
          }
        ],
        "saida": {
          "nome": "avaliacao_piada",
          "formato": "markdown"
        }
      }
    ],
    "arestas": [
      {
        "origem": "Escolhendo tema",
        "destino": "Criar Piada"
      },
      {
        "origem": "Criar Piada",
        "destino": "Avaliar Piada"
      },
      {
        "origem": "Avaliar Piada",
        "destino": "END"
      }
    ]
  },
  "formato_resultado_final": {
    "combinacoes": [
      {
        "nome_da_saida": "resultado_completo",
        "combinar_resultados": ["piada_final", "avaliacao_piada"],
        "manter_originais": false
      },
    ],
    "saidas_individuais":[]
  }
}

export const WORFLOW_MINUTA_INTERACAO = {
    "documentos_anexados": [
        {
            "chave": "auditoria_especial",
            "descricao": "Relatório de auditoria especial",
            "uuid_unico": "d8f1259b-b7e2-4daa-983f-7b94d137e79c"
        },
        {
            "chave": "defesas_do_caso",
            "descricao": "Documento de defesa",
            "uuids_lista": [
                "bc18bac5-b777-4d35-a55f-4d274176d857",
                "eefacb55-4226-4865-8eab-92be87194efa"
            ]
        }
    ],
    "grafo": {
        "nos": [
            {
                "nome": "Análise da Auditoria",
                "modelo_llm": "o3",
                "temperatura": 0.3,
                "prompt": "## PERSONA E OBJETIVO PRINCIPAL ##\\n\\n Assuma a persona de um Auditor de Controle Externo extremamente meticuloso e detalhista, preparando um relatório para o Conselheiro Relator. Sua principal diretriz é a **exaustividade**. Nenhum detalhe, por menor que seja, pode ser omitido. Resumos são estritamente proibidos; seu trabalho é detalhar e transcrever os fatos e análises da auditoria. \\n\\n## TAREFA ##\\n\\nCom base no CONTEÚDO DO RELATÓRIO DE AUDITORIA fornecido, sua tarefa é redigir a seção 'RELATÓRIO DO VOTO' de uma minuta de voto em formato MARKDOWN. \\n\\n## DIRETRIZES DE CONTEÚDO ##\\n\\n 1.  **Título Inicial:** Comece a seção com o título '## RELATÓRIO DO VOTO'.\\n2. **Detalhamento Extremo:** A seção deve ser exaustivamente completa, transcrevendo e detalhando TODOS os achados, fatos, evidências, responsáveis e irregularidades apontadas na auditoria. Use o nome da irregularidade exatamente como descrito no relatório.\\n3.  **Estrutura Clara:** Utilize subtítulos (ex: '### Dos Fatos Apurados', '#### Da Irregularidade X: Descrição Detalhada'), listas e parágrafos em Markdown para máxima clareza e organização.\\n\\n----\\n\\n**CONTEÚDO DO RELATÓRIO DE AUDITORIA PARA ANÁLISE:**\\n\\n{conteudo_auditoria}\\n\\n----\\n\\n## REGRAS DE SAÍDA ##\\n\\n- Responda APENAS com o conteúdo Markdown desta seção.\\n- Não adicione números aos títulos (ex: '### 1. Dos Fatos' está incorreto).\\n- Não adicione comentários, saudações ou texto introdutório fora do Markdown.",
                "entrada_grafo": true,
                "entradas": [
                    {
                        "variavel_prompt": "conteudo_auditoria",
                        "origem": "documento_anexado",
                        "chave_documento_origem": "auditoria_especial",
                        "executar_em_paralelo": false
                    }
                ],
                "saida": {
                    "nome": "analise_auditoria",
                    "formato": "markdown"
                }
            },
            {
                "nome": "Análise das Defesas",
                "modelo_llm": "o3",
                "temperatura": 0.5,
                "prompt": "## PERSONA E OBJETIVO PRINCIPAL ##\\n\\nAssuma a persona de um Analista de Controle Externo sênior, cético e focado em fatos. Sua principal diretriz é a **exaustividade**. Nenhum detalhe, por menor que seja, pode ser omitido. Resumos são estritamente proibidos; seu trabalho é detalhar e transcrever o que foi alegado na defesa.\\n\\n## TAREFA ##\\n\\nCom base no CONTEÚDO DO DOCUMENTO DE DEFESA e DE UMA NOTA TÉCNICA fornecidos, sua tarefa é redigir a seção 'ANÁLISE DA DEFESA' de uma minuta de voto em formato MARKDOWN.\\n\\n## DIRETRIZES DE CONTEÚDO E ANÁLISE ##\\n\\nSua redação deve ser guiada pelos seguintes princípios obrigatórios:\\n1.  **Título Principal:** Comece a seção com o título `## ANÁLISE DA DEFESA - DEFESA DE <NOME DA PESSOA>`. Identifique e preencha o `<NOME DA PESSOA>` com base no conteúdo do documento.\\n2.  **Estrutura por Argumentos:** Identifique cada argumento principal apresentado na defesa e crie um subtítulo de nível 3 (`###`) para cada um (ex: `### Argumento sobre a Inexistência de Dano ao Erário`).\\n3.  **Análise Crítica Abrangente:** Dentro de cada subtítulo de argumento, seu texto deve ser exaustivo e obrigatoriamente abordar e conectar a **alegação central** feita pelo defendente e as **provas** que ele apresentou para sustentá-la. Caso a nota técnica se refira a alegação sendo abordada, deve também apresentar as **respostas** apresentadas na nota técnica. Ao se referir a nota técnica, use 'uma nota técnica' ao invés de 'a nota técnica'.\\n---\\n**CONTEÚDO DO DOCUMENTO DE DEFESA:**\\n\\n{conteudo_defesa}\\n\\n----\\n\\n## REGRAS DE SAÍDA ##\\n\\n- Responda APENAS com o conteúdo Markdown desta seção.\\n- Comece obrigatoriamente com o título principal.\\n- Não adicione números aos títulos (ex: '### 1. Argumento X' está incorreto).\\n- Não inclua comentários, saudações ou texto introdutório fora do Markdown.",
                "entrada_grafo": true,
                "entradas": [
                    {
                        "variavel_prompt": "conteudo_defesa",
                        "origem": "documento_anexado",
                        "chave_documento_origem": "defesas_do_caso",
                        "executar_em_paralelo": true
                    }
                ],
                "saida": {
                    "nome": "analises_defesas",
                    "formato": "json"
                }
            },
            {
                "nome": "Revisão de Achados",
                "modelo_llm": "o3",
                "temperatura": 0.3,
                "prompt": "## PERSONA ##\\n\\nVocê é um Assistente de Revisão do Relator, especializado em verificar a completude e coerência dos achados de auditoria e análises de defesa antes da elaboração do voto final.\\n\\n## TAREFA ##\\n\\nRevise cuidadosamente os seguintes documentos:\\n\\nRELATÓRIO DA AUDITORIA:\\n{relatorio_auditoria}\\n\\nANÁLISES DAS DEFESAS:\\n{analises_defesas}\\n\\n## OBJETIVO ##\\n\\n1. Verificar Completude: Confirme se todos os achados principais da auditoria estão devidamente documentados.\\n2. Verificar Consistência: Certifique-se de que as análises das defesas respondem adequadamente aos achados da auditoria.\\n3. Identificar Lacunas: Aponte qualquer informação faltante, inconsistência ou ponto que precise de esclarecimento.\\n4. Sugerir Ajustes: Se necessário, sugira complementações ou correções.\\n\\n## INTERAÇÃO COM O USUÁRIO ##\\n\\n- Apresente um resumo executivo dos achados principais e das defesas.\\n- Liste pontos de atenção ou lacunas identificadas.\\n- Pergunte ao usuário se deseja fazer algum ajuste antes de prosseguir para a elaboração do voto.\\n- Se o usuário aprovar, indique [CONCLUÍDO] para prosseguir.\\n- Se o usuário solicitar correções, incorpore o feedback e apresente uma nova versão revisada.\\n\\n## REGRAS ##\\n\\n- Seja objetivo e direto.\\n- Destaque inconsistências ou pontos críticos em negrito.\\n- Aguarde confirmação explícita do usuário antes de concluir.",
                "entrada_grafo": false,
                "entradas": [
                    {
                        "variavel_prompt": "relatorio_auditoria",
                        "origem": "resultado_no_anterior",
                        "chave_documento_origem": "",
                        "executar_em_paralelo": false,
                        "nome_no_origem": "Análise da Auditoria"
                    },
                    {
                        "variavel_prompt": "analises_defesas",
                        "origem": "resultado_no_anterior",
                        "chave_documento_origem": "",
                        "executar_em_paralelo": false,
                        "nome_no_origem": "Análise das Defesas"
                    }
                ],
                "saida": {
                    "nome": "revisao_achados",
                    "formato": "markdown"
                },
                "interacao_com_usuario": {
                    "permitir_usuario_finalizar": true,
                    "ia_pode_concluir": true,
                    "requer_aprovacao_explicita": true,
                    "maximo_de_interacoes": 10,
                    "modo_de_saida": "historico_completo"
                }
            },
            {
                "nome": "Elaboração do Voto",
                "modelo_llm": "o3",
                "temperatura": 0.5,
                "prompt": "## PERSONA E MISSÃO ##\\nAssuma a persona de um jurista conhecido por sua capacidade de análise profunda, clareza argumentativa e fundamentação impecável. Sua missão é proferir um Voto completo, coeso e juridicamente irretocável, confrontando os achados do relatório de auditoria com as alegações da defesa para formar sua convicção e propor uma decisão final ao colegiado.\\n\\n----\\n\\n## DIRETRIZES DE CONTEÚDO E ANÁLISE CRÍTICA ##\\n\\nSeu voto DEVE ser construído sobre os seguintes pilares:\\n1.  **Exaustividade Analítica:** \\n* Analise CADA irregularidade apontada no relatório. Não agrupe ou omita achados. Cada ponto levantado pela auditoria deve ser um ponto explicitamente tratado em seu voto. Em cada ponto, cite exaustivamente a fundamentação legal de cada ponto, listando, por exemplo, as leis, incisos e acórdãos que fortalecem os argumentos. Essa seção deve se chamar '### FUNDAMENTAÇÃO DO VOTO'. Essa seção deve ter uma breve introdução e uma breve conclusão, que deve ser apresentada antes do '#### VOTO'.\\n2.  **Análise Contraditória Fundamentada:**\\n* Para cada irregularidade, sua análise deve obrigatoriamente confrontar os argumentos. Apresente objetivamente, de forma discursiva, os **achados da auditoria** e, em seguida, as **alegações da defesa** correspondentes.\\n* Sua tarefa principal é pesar esses pontos de vista opostos, avaliar as provas e formar sua **análise do relator**, explicando claramente por que um argumento prevalece sobre o outro.\\n3.  **Clareza e Decisão Conclusiva:**\\n* Após a análise de todos os pontos, proponha um **dispositivo** (a decisão final) claro e inequívoco, votando pela regularidade, irregularidade, etc., e aplicando as medidas corretivas necessárias. Essa seção deve se chamar '#### VOTO'. Antes de apresentar seu voto, liste os fundamentos finais usando cláusulas 'CONSIDERANDO'.\\n4.  **Uso Proativo de Ferramentas:** Seja proativo no uso das ferramentas. Ao encontrar um argumento com fundamentação em leis ou decisões judiciais, **é sua obrigação** usar suas ferramentas (se disponíveis) para validar as informações nos documentos fornecidos ou para encontrar jurisprudência que confirme ou refute o que está sendo apresentado.\\n\\n----\\n\\n## ESTRUTURA E REGRAS PARA O DISPOSITIVO FINAL ##\\nO Dispositivo do seu Voto é a parte mais importante e deve ser dividido em duas seções claras: o Julgamento principal e as Deliberações adicionais.\\n### Parte 1: Julgamento do Mérito e Aplicação de Sanções\\nCom base em toda a sua análise anterior, você deve primeiro proferir o julgamento principal e, se necessário, aplicar as sanções.\\n* **A. Julgamento do Ato:** Inicie com uma das seguintes opções, conforme sua conclusão: \\n* `I. **JULGAR IRREGULARES**...`\\n* `I. **JULGAR REGULARES COM RESSALVAS**...`\\n* `I. **JULGAR REGULARES**...`\\n* **B. Aplicação de Multa (se o julgamento for pela irregularidade):**\\n* Prossiga com a aplicação de multas individuais, seguindo estritamente o modelo:\\n* `II. APLICAR, com fundamento no artigo 73, [inciso] da Lei Estadual nº 12.600/2004, multa individual aos responsáveis abaixo listados:`\\n* `a. Sr(a). [Nome do Responsável 1], pela [descreva a conduta irregular específica que justifica a multa].`\\n* `b. Sr(a). [Nome do Responsável 2], pela [descreva a conduta...].`\\n### Parte 2: Deliberações Adicionais (Determinação, Recomendação, Ciência)\\nApós o julgamento e a aplicação de multas, você deve decidir sobre as medidas corretivas e preventivas. Use o fluxo de decisão abaixo para escolher a ação correta para cada falha remanescente:\\n* **Passo 1: Diagnóstico da Falha**\\n* Responda: A falha é (A) uma clara VIOLAÇÃO de norma que exige correção, ou (B) uma OPORTUNIDADE DE MELHORIA?\\n* **Passo 2: Escolha da Ação Correta**\\n* **SE for (B) - Oportunidade de Melhoria:** Use uma **RECOMENDAÇÃO**.\\n* **SE for (A) - Violação de Norma:** Pergunte-se: 'É necessária uma ação concreta e monitorável AGORA?'\\n* Se **SIM**, use uma **DETERMINAÇÃO**.\\n* Se **NÃO** (o objetivo é apenas notificar para prevenir reincidência), use **DAR CIÊNCIA**.\\n* **Passo 3: Redija a Medida Escolhida Seguindo as Regras Específicas Abaixo**\\n---\\n#### **REGRAS PARA DETERMINAÇÃO**\\n(Use quando há violação de norma E necessidade de ação concreta)\\n* **Estrutura Obrigatória:** 'DETERMINAR à <NOME DO ÓRGÃO OU ENTIDADE> Que <inserir a determinação> conforme <inserir critério>. Prazo: <inserir prazo>.'\\n* **Restrições:**\\n* Deve ser passível de monitoramento futuro (não pode ser de cumprimento eterno).\\n* Não pode adentrar a discricionariedade do gestor.\\n* Não pode ser genérica, abstrata, reiterativa ou meramente pedagógica.\\n* Não pode ser para indicar implementação de controle interno (salvo exceções legais).\\n---\\n#### **REGRAS PARA RECOMENDAÇÃO**\\n(Use quando há oportunidade de melhoria SEM violação de norma)\\n* **Estrutura Obrigatória:** 'RECOMENDAR, com base no disposto no <inserir critérios>, aos atuais gestores do(a) <NOME DO ÓRGÃO OU ENTIDADE>... que atendam às medidas a seguir relacionadas: <INDICAR A OPORTUNIDADE DE MELHORIA> + <NORMA OU BOA PRÁTICA DE REFERÊNCIA>.'\\n* **Restrições:**\\n* NÃO use para irregularidades claras ou violações de normas.\\n* NÃO estipule prazos.\\n * Deve ser específica, aplicável e abordar a causa raiz do problema.\\n----\\n#### **REGRAS PARA DAR CIÊNCIA**\\n(Use quando há violação de norma SEM necessidade de ação concreta imediata)\\n* **Finalidade:** Essencialmente preventiva, para evitar reincidência.\\n* **Estrutura Obrigatória:** 'Dar CIÊNCIA à <NOME DO ÓRGÃO OU ENTIDADE> Que <inserir a situação irregular> contraria a <inserir critério>.'\\n* **Restrições:**\\n* NÃO estipule prazo ou providências concretas.\\n* Sempre aponte o critério (norma, lei, etc.) que foi descumprido.\\n\\n----\\n\\n**CONTEÚDO PARA SUA ANÁLISE:**\\n**RELATÓRIO DA AUDITORIA:**\\n\\n{relatorio_da_auditoria}\\n\\n**ANÁLISES DAS DEFESAS:**\\n\\n{pareceres_das_defesas}\\n\\n**PROPOSTAS DE DELIBERAÇÃO DA AUDITORIA:**\\n\\n{propostas_deliberacao_auditoria}\\n\\n----\\n\\n**REGRAS FINAIS DE SAÍDA:**\\n- Comece obrigatoriamente com '## VOTO DO RELATOR'.\\n- Sua resposta deve ser APENAS o conteúdo Markdown da seção '## VOTO DO RELATOR'.\\n- Não preencha sua seção com nenhum outro conteúdo (por exemplo, não coloque o 'cabeçalho' ou 'ementa').\\n- Não adicione números aos títulos de forma alguma!\\n- Não adicione comentários ou explicações fora do texto do voto.\\n- As propostas de deliberação da auditoria servem como orientação inicial, mas você deve exercer seu julgamento independente e, se necessário, propor deliberações diferentes ou adicionais com base na sua análise do relatório e das defesas.",
                "entrada_grafo": false,
                "entradas": [
                    {
                        "variavel_prompt": "relatorio_da_auditoria",
                        "origem": "resultado_no_anterior",
                        "chave_documento_origem": "",
                        "executar_em_paralelo": false,
                        "nome_no_origem": "Análise da Auditoria"
                    },
                    {
                        "variavel_prompt": "pareceres_das_defesas",
                        "origem": "resultado_no_anterior",
                        "chave_documento_origem": "",
                        "executar_em_paralelo": false,
                        "nome_no_origem": "Análise das Defesas"
                    },
                    {
                        "variavel_prompt": "revisao_achados",
                        "origem": "resultado_no_anterior",
                        "chave_documento_origem": "",
                        "executar_em_paralelo": false,
                        "nome_no_origem": "Revisão de Achados"
                    },
                    {
                        "variavel_prompt": "propostas_deliberacao_auditoria",
                        "origem": "resultado_no_anterior",
                        "chave_documento_origem": "",
                        "executar_em_paralelo": false,
                        "nome_no_origem": "Revisão de Achados"
                    }
                ],
                "saida": {
                    "nome": "voto_relator",
                    "formato": "markdown"
                }
            },
            {
                "nome": "Extração de Dados Estruturados",
                "modelo_llm": "o3",
                "temperatura": 0.3,
                "prompt": "## PERSONA E MISSÃO CRÍTICA ##\\n\\nAssuma a persona de um **Analista de Dados Jurídicos e Estruturais do Tribunal de Contas**. Sua única missão é ler um documento de decisão (minuta de voto) e converter o texto não estruturado em um objeto JSON perfeitamente válido e preciso, seguindo as regras e o schema fornecidos. Precisão, fidelidade ao texto original e aderência estrita ao schema são suas únicas diretrizes. Não invente ou infira informações que não estejam explicitamente no texto.\\n\\n## PROCESSO DE RACIOCÍNIO OBRIGATÓRIO (Passo a Passo) ##\\n\\nPara garantir a máxima precisão, siga estes passos mentais antes de gerar o JSON final:\\n1.  **Leitura Completa:** Leia o `DOCUMENTO COMPLETO` do início ao fim para ter uma visão geral do conteúdo e das seções.\\n2.  **Extração por Seções:** Percorra o documento novamente, uma seção de cada vez, focando em extrair os dados para cada campo principal do JSON (`minutaVoto`, `interessados`, `dadosEstruturados`).\\n3.  **Validação Cruzada:** Ao preencher um campo, verifique se a informação é consistente. Por exemplo, um nome na lista `multaDebito` deve corresponder a um nome na lista de `interessados`.\\n4.  **Verificação do Schema:** Antes de finalizar, revise cada campo do seu JSON para garantir que ele segue as regras, tipos e descrições fornecidas no `GUIA DE PREENCHIMENTO DO SCHEMA` abaixo.\\n\\n---\\n\\n## DOCUMENTO COMPLETO PARA ANÁLISE ##\\n\\n{relatorio_da_auditoria} {pareceres_das_defesas} {voto_relator}\\n\\n---\\n\\n## GUIA DE PREENCHIMENTO DETALHADO DO SCHEMA JSON ##\\n\\nAgora, com base na sua análise e seguindo rigorosamente as instruções abaixo, extraia as informações e gere **APENAS o objeto JSON final**.\\n\\n### 1. Objeto `minutaVoto`\\n- **`relatorioVoto` (string):** Concatene todo o conteúdo textual que estiver sob os títulos 'RELATÓRIO DO VOTO' e 'ANÁLISE DA DEFESA...' em uma única string.\\n- **`fundamentacaoVoto` (string):** Capture apenas o conteúdo textual que estiver sob o subtítulo 'FUNDAMENTAÇÃO DO VOTO' (dentro da seção 'VOTO DO RELATOR').\\n### 2. Lista `interessados`\\n- Os 'INTERESSADOS' são as partes responsabilizadas, que pode ser uma pessoa física, pessoa jurídica, empresa, grupo, etc. Crie um item na lista para cada interessado.\\n- **`nome`:** Nome da parte interessada.\\n- **`cpf_cnpj`:** CPF ou CNPJ da parte.\\n- **`tipo_participante`:** Siga o formato 'CARGO GERAL EM MAIÚSCULO - Nome do Órgão'. Exemplo: `GESTOR/TITULAR DO ÓRGÃO/CHEFE DE PODER - Secretaria de Educação do Recife`.\\n- **`qualificacao`:** Diga a qualificação específica da parte, por exemplo, 'pregoeira', 'advogado', etc.\\n### 3. Objeto `dadosEstruturados`\\n- **`resultados` (lista):** Preencha as informações para cada parte julgada.\\n- **`parte`:** Nome da parte interessada.\\n- **`identificacao`:** CPF ou CNPJ da parte.\\n- **`tipo_participante`:** Siga o formato 'CARGO GERAL EM MAIÚSCULO - Nome do Órgão'. Exemplo: `GESTOR/TITULAR DO ÓRGÃO/CHEFE DE PODER - Secretaria de Educação do Recife`.\\n- **`resultado`:** Resultado da deliberação sobre a defesa daquela parte, escolha entre 'Aprovação' se a defesa foi acolhida, 'Aprovação com ressalvas' se foi acolhida parcialmente ou 'Rejeição' se a defesa foi rejeitada.\\n- **`complemento`:** Complemento do resultado.\\n- **`multaDebito` (lista):** Encontre todas as menções de 'APLICAR MULTA' ou 'imputar DÉBITO'.\\n- **`classificacao`**: Deve ser 'Multa' ou 'Débito'.\\n- **`valor`:** Extraia o valor formatado, ex: 'R$ 10.000,00'.\\n- **`nome`:** Nome da parte a ser imputada a multa ou débito.\\n- **`identificacao`:** CPF ou CNPJ da parte.\\n- **`tipo_participante`:** Siga o formato 'CARGO GERAL EM MAIÚSCULO - Nome do Órgão'. Exemplo: `GESTOR/TITULAR DO ÓRGÃO/CHEFE DE PODER - Secretaria de Educação do Recife`.\\n- **`arrecadacao`:** Escolha entre 'Municipal' ou 'Estadual' para determinar a esfera a ser imputada a multa ou débito.\\n- **`dispositivoLegal`:** Base legal aplicável, escolha entre 'Artigo 73 da Lei Estadual 12.600/04', 'Artigo 74 da Lei Estadual 12.600/04' e 'Outro Dispositivo'.\\n- **`dispositivoLegalUtilizado`:** Siga esta regra com atenção:\\n- Se `dispositivoLegal` for 'Artigo 73...', este campo deve ser os incisos (pode ser mais de um), ex: 'inciso III', 'inciso III e VIII'. Escolha do inciso I ao inciso XII.\\n- Se `dispositivoLegal` for 'Artigo 74...', este campo deve ser uma string vazia `''``.\\n- Se for 'Outro dispositivo', transcreva o dispositivo aqui.\\n- **`inidoneidade` (lista):** Procure por deliberações que declarem inidoneidade. Se não houver, deixe o valor como um objeto vazio.\\n- **`nome`:** Nome da parte inidônea.\\n- **`identificacao`:** CPF ou CNPJ da parte.\\n- **`tipo_participante`:** Siga o formato 'CARGO GERAL EM MAIÚSCULO - Nome do Órgão'. Exemplo: `GESTOR/TITULAR DO ÓRGÃO/CHEFE DE PODER - Secretaria de Educação do Recife`.\\n- **`prazoAnos`:** Prazo de inidoneidade em anos.\\n- **`motivo`:** Motivo da inidoneidade, se aplicável, escolha entre 'contratar com a administração pública', 'o exercício de cargo em comissão ou função de confiança' ou 'o exercício de cargo em comissão ou função de confiança, bem como contratar com a administração pública'.\\n- **`quadroLimites` (objeto):** Preencha este objeto somente se for uma prestação de contas do governo e se encontrar uma tabela ou quadro explícito sobre limites de gastos. Se não houver, deixe o valor como um objeto vazio.\\n- **`area`:** Área de investimento do governo.\\n- **`descricao`:** Onde o valor foi aplicado\\n- **`fundamentacaoLegal`:** Base legal aplicável.\\n- **`baseCalculo`:** Base do cálculo do limite\\n- **`limiteLegal`:** Limite legal de investimento na área\\n- **`percentualValorAplicado`:** Percentual ou valor aplicado na área.\\n- **`naoAtendido`:** Se o limite foi atendido ou não. Escolha entre 'Sim' ou 'Não'.\\n- **`considerandos` (lista):** Na parte final do voto, extraia cada cláusula que começa com a palavra 'CONSIDERANDO'.\\n- **`tipoConsiderando`:** Escolha entre 'Comum' se for referente a todas as partes julgadas ou 'Partes' se for referente a apenas algumas das partes julgadas.\\n- **`conteudoConsiderando`:** Texto do 'CONSIDERANDO', incluido na subseção 'VOTO' da seção 'Voto do relator'.\\n- **`medidas` (lista):** Capture todas as deliberações que começam com 'DETERMINAR', 'RECOMENDAR'.\\n- **`unidadeJurisdicionada`:** Escolha entre 'Participante do processo' se a unidade jurisdicionada estiver envolvida ou 'Outra Unidade Jurisdicionada' caso não esteja.\\n- **`seletor_unidade`:** Seleção da unidade quando 'Participante do processo'.\\n- **`tipoMedida`:** Deve ser estritamente uma das três opções: **'Determinação'**, **'Recomendação'** ou **'Ciência'**.\\n- **`tipoPrazo`:** Escolha entre 'Dias' ou 'Efeito Imediato'.\\n- **`conteudoMedida`:** Conteúdo da medida.\\n- **`encaminhamentos` (lista):** Capture todas as deliberações que começam com 'Dar CIÊNCIA'.\\n- **`destinatario`:** Nome do destinatário da deliberação (que é o encaminhamento).\\n- **`encaminhamento`:** Conteúdo do encaminhamento, provindo da deliberação.\\n\\n----\\n\\n**SCHEMA JSON DE SAÍDA OBRIGATÓRIO (Preencha com os dados extraídos):**",
                "entrada_grafo": false,
                "entradas": [
                    {
                        "variavel_prompt": "relatorio_da_auditoria",
                        "origem": "resultado_no_anterior",
                        "chave_documento_origem": "",
                        "executar_em_paralelo": false,
                        "nome_no_origem": "Análise da Auditoria"
                    },
                    {
                        "variavel_prompt": "pareceres_das_defesas",
                        "origem": "resultado_no_anterior",
                        "chave_documento_origem": "",
                        "executar_em_paralelo": false,
                        "nome_no_origem": "Análise das Defesas"
                    },
                    {
                        "variavel_prompt": "voto_relator",
                        "origem": "resultado_no_anterior",
                        "chave_documento_origem": "",
                        "executar_em_paralelo": false,
                        "nome_no_origem": "Elaboração do Voto"
                    }
                ],
                "saida": {
                    "nome": "dados_estruturados",
                    "formato": "json"
                }
            }
        ],
        "arestas": [
            {
                "origem": "Análise da Auditoria",
                "destino": "Elaboração do Voto"
            },
            {
                "origem": "Análise das Defesas",
                "destino": "Elaboração do Voto"
            },
            {
                "origem": "Elaboração do Voto",
                "destino": "Extração de Dados Estruturados"
            },
            {
                "origem": "Revisão de Achados",
                "destino": "Elaboração do Voto"
            },
            {
                "origem": "Extração de Dados Estruturados",
                "destino": "END"
            }
        ]
    },
    "combinacoes": [
        {
            "nome_da_saida": "relatorio_completo",
            "combinar_resultados": [
                "analise_auditoria",
                "analises_defesas"
            ],
            "manter_originais": false
        }
    ],
    "saidas_individuais": [
        "dados_estruturados",
        "voto_relator",
        "revisao_achados"
    ]
}