const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 6969;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Mantém o nome original do arquivo
    const filename = `${Date.now()}-${file.originalname}`;
    console.log(`[MULTER] Nome do arquivo gerado: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limite
  },
  fileFilter: function (req, file, cb) {
    console.log(`[MULTER] Arquivo recebido no filter:`, {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Aceita qualquer tipo de arquivo, você pode personalizar isso
    cb(null, true);
  }
});

// Tipos de dados (conforme especificado)
/**
 * @typedef {Object} Pagina
 * @property {string} fonte
 * @property {number} numero_pagina
 * @property {number} quantidade_tokens
 * @property {string} texto
 */

/**
 * @typedef {Object} DataResponse
 * @property {string} uuid_documento
 * @property {string} arquivo_original
 * @property {string} titulo_arquivo
 * @property {string} extensao
 * @property {number} total_paginas
 * @property {number} total_tokens
 * @property {Pagina[]} paginas
 */

/**
 * @typedef {Object} ResponseData
 * @property {boolean} [success]
 * @property {string} [message]
 * @property {number} [status]
 * @property {DataResponse} [data]
 */

// Função para simular processamento do arquivo
function processarArquivo(filePath, originalName) {
  console.log(`[PROCESSAMENTO] Iniciando processamento do arquivo: ${originalName}`);
  console.log(`[PROCESSAMENTO] Caminho do arquivo: ${filePath}`);
  
  const uuidDocumento = uuidv4();
  const extensao = path.extname(originalName).toLowerCase();
  const tituloArquivo = path.basename(originalName, extensao);
  
  console.log(`[PROCESSAMENTO] UUID gerado: ${uuidDocumento}`);
  console.log(`[PROCESSAMENTO] Extensão: ${extensao}`);
  console.log(`[PROCESSAMENTO] Título do arquivo: ${tituloArquivo}`);
  
  // Simulação de processamento - valores fictícios
  const totalPaginas = Math.floor(Math.random() * 50) + 1; // 1-50 páginas
  const totalTokens = Math.floor(Math.random() * 10000) + 1000; // 1000-11000 tokens
  
  console.log(`[PROCESSAMENTO] Total de páginas simuladas: ${totalPaginas}`);
  console.log(`[PROCESSAMENTO] Total de tokens simulados: ${totalTokens}`);
  
  // Gerar páginas simuladas
  const paginas = [];
  for (let i = 1; i <= totalPaginas; i++) {
    const tokensPagina = Math.floor(Math.random() * 200) + 50;
    paginas.push({
      fonte: `processador-${extensao.replace('.', '')}`,
      numero_pagina: i,
      quantidade_tokens: tokensPagina,
      texto: `Este é o texto simulado da página ${i} do documento "${tituloArquivo}". Em uma implementação real, este conteúdo seria extraído do arquivo original.`
    });
    
    if (i <= 3) { // Log apenas das primeiras 3 páginas para não poluir
      console.log(`[PROCESSAMENTO] Página ${i} criada com ${tokensPagina} tokens`);
    }
  }
  
  if (totalPaginas > 3) {
    console.log(`[PROCESSAMENTO] ... e mais ${totalPaginas - 3} páginas`);
  }
  
  const resultado = {
    uuid_documento: uuidDocumento,
    arquivo_original: originalName,
    titulo_arquivo: tituloArquivo,
    extensao: extensao,
    total_paginas: totalPaginas,
    total_tokens: totalTokens,
    paginas: paginas
  };
  
  console.log(`[PROCESSAMENTO] Processamento concluído com sucesso`);
  return resultado;
}

// Rota de health check - DEVE VIR ANTES DO MIDDLEWARE DE ROTA NÃO ENCONTRADA
app.get('/health', (req, res) => {
  console.log(`[HEALTH] Health check solicitado - ${new Date().toISOString()}`);
  
  /** @type {ResponseData} */
  const response = {
    success: true,
    message: 'Servidor está funcionando corretamente',
    status: 200,
    data: {
      servidor: 'Online',
      timestamp: new Date().toISOString(),
      porta: PORT
    }
  };
  
  res.status(200).json(response);
});

// Rota raiz
app.get('/', (req, res) => {
  console.log(`[ROTA] Acesso à rota raiz`);
  
  /** @type {ResponseData} */
  const response = {
    success: true,
    message: 'Servidor de upload de arquivos funcionando',
    status: 200,
    data: {
      endpoints: {
        health: '/health',
        upload: '/upload_and_process (POST)'
      }
    }
  };
  
  res.status(200).json(response);
});

// Rota de upload e processamento
app.post('/upload_and_process', upload.single('uploaded_file'), (req, res) => {
  console.log(`[ROTA] === NOVA REQUISIÇÃO PARA /upload_and_process ===`);
  console.log(`[ROTA] Método: ${req.method}`);
  console.log(`[ROTA] Headers:`, req.headers);
  console.log(`[ROTA] Body fields:`, req.body);
  
  try {
    // Verificar se o arquivo foi enviado
    if (!req.file) {
      console.log(`[ERRO] Nenhum arquivo foi recebido no campo 'uploaded_file'`);
      console.log(`[ERRO] Files recebidos:`, req.file);
      console.log(`[ERRO] Body completo:`, req.body);
      
      /** @type {ResponseData} */
      const response = {
        success: false,
        message: 'Nenhum arquivo foi enviado no campo uploaded_file',
        status: 400
      };
      return res.status(400).json(response);
    }

    console.log(`[UPLOAD] Arquivo recebido com sucesso:`, {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });
    
    // Processar o arquivo
    console.log(`[PROCESSAMENTO] Iniciando processamento do arquivo...`);
    const dataProcessada = processarArquivo(req.file.path, req.file.originalname);
    
    // Limpar o arquivo temporário após o processamento
    console.log(`[LIMPEZA] Removendo arquivo temporário: ${req.file.path}`);
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error('[ERRO] Erro ao deletar arquivo temporário:', err);
      } else {
        console.log(`[LIMPEZA] Arquivo temporário removido com sucesso`);
      }
    });
    
    /** @type {ResponseData} */
    const response = {
      success: true,
      message: 'Arquivo processado com sucesso',
      status: 200,
      data: dataProcessada
    };
    
    console.log(`[RESPOSTA] Enviando resposta com status 200`);
    console.log(`[RESPOSTA] UUID do documento: ${dataProcessada.uuid_documento}`);
    console.log(`[RESPOSTA] Total de páginas: ${dataProcessada.total_paginas}`);
    console.log(`[RESPOSTA] Total de tokens: ${dataProcessada.total_tokens}`);
    
    res.status(200).json(response.data);
    
  } catch (error) {
    console.error('[ERRO CRÍTICO] Erro no processamento:', error);
    console.error('[ERRO CRÍTICO] Stack trace:', error.stack);
    
    /** @type {ResponseData} */
    const response = {
      success: false,
      message: `Erro interno do servidor: ${error.message}`,
      status: 500
    };
    
    res.status(500).json(response);
  }
  
  console.log(`[ROTA] === FIM DA REQUISIÇÃO ===\n`);
});

// Middleware para rotas não encontradas - DEVE SER A ÚLTIMA ROTA
app.use('*', (req, res) => {
  console.log(`[ROTA NÃO ENCONTRADA] ${req.method} ${req.originalUrl}`);
  
  /** @type {ResponseData} */
  const response = {
    success: false,
    message: 'Rota não encontrada',
    status: 404
  };
  res.status(404).json(response);
});

// Log de inicialização do servidor
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Servidor iniciado com sucesso`);
  console.log(`📍 Porta: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📤 Upload: http://localhost:${PORT}/upload_and_process`);
  console.log(`📝 Campo do form-data: uploaded_file`);
  console.log(`=================================\n`);
});

module.exports = app;