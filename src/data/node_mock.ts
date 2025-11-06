
const name = Date.now().toString() + Math.random().toString(36).substring(2, 11);

export const NODE_MOCK= {
    "nome": `Node_${name}`,
    "categoria": "entrada",
    "modelo_llm": "claude-3-5-sonnet@20240620",
    "temperatura": 0.3,
    "prompt": "ADADAD:{Variável no Prompt}",
    "entradas": [
        {
            "variavel_prompt": "Variável no Prompt",
            "fonte": "documento_anexado",
            "documento": "doc1",
            "executar_em_paralelo": false
        }
    ],
    "saida": {
        "nome": "Nome da Saída",
        "formato": "json"
    },
    "ferramentas": [
        "busca-internet",
        "stf"
    ],
    "documentosAnexados": [
        {
            "chave": "Chave do Documento",
            "descricao": "Descrição do Documento",
            "uuid_unico": "f3a87ebc-902e-4c98-9494-f29e7f877f17"
        }
    ]
}