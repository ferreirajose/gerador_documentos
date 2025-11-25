# 📄 Gerador de Documentos

Aplicação **React + TypeScript** construída com **Vite**, voltada para geração personalizada de documentos.

---

## 🚀 Tecnologias Utilizadas

- **React 19.1.1** – Biblioteca para construção de interfaces.
- **TypeScript** – Superset do JavaScript com tipagem estática.
- **Vite 7.1.7** – Ferramenta de build e desenvolvimento rápido.
- **Tailwind CSS 3.4.17** – Framework CSS utilitário.
- **Vitest 3.2.4** – Framework de testes unitários.
- **React Router DOM 7.9.4** – Roteamento para aplicações React.
- **Axios 1.12.2** – Cliente HTTP para requisições à API.

---

## 📋 Pré-requisitos

### ✔️ Versão do Node.js

Este projeto requer **Node.js 18 ou superior**.

**Versões recomendadas:**  
- Node.js **18.x**  
- Node.js **20.x** (LTS)  
- Node.js **22.x** (LTS)

### 🔍 Verificar versão instalada

```bash
node --version
```

Como instalar/atualizar o Node.js:
Windows/Mac: Baixe o instalador do [site oficial](https://nodejs.org/pt)


Linux: Use o gerenciador de pacotes da sua distribuição

Via NVM (recomendado para desenvolvimento): [site oficial]( https://www.nvmnode.com/guide/introduction.html)

[Como usar NVM](https://medium.com/reactbrasil/usando-nvm-no-windows-d46f018935ef)
```bash
# Instalar e usar Node.js 18
nvm install 18
nvm use 18

# Ou para a versão mais recente LTS
nvm install --lts
nvm use --lts
```

## ⚙️ Configuração do Projeto

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd gerador_documentos

```

### 2. Instalar Dependências
```bash
npm install
```
### 3. Configurar Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto com as seguintes variáveis:
```bash
VITE_API_URL=sua_url_da_api_principal
VITE_API_URL_MINUTA=sua_url_da_api_minuta
VITE_API_AUTH_TOKEN=seu_token_de_autenticacao
```
Exemplo:

```bash
VITE_API_URL=https://api.exemplo.com/v1
VITE_API_URL_MINUTA=https://api.exemplo.com/minuta
VITE_API_AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

### 4. Scripts Disponíveis

# Modo desenvolvimento
```bash
npm run dev
````
# Build para produção
```bash
npm run build
````

### 5. Executar Todos os Testes
```bash
npm run test
````

### 6. Executar Testes Específicos
```bash

# Testes da entidade Node
npm run test:node

# Testes do Grafo
npm run test:grafo

# Testes da Aresta
npm run test:aresta

# Testes do Workflow
npm run test:workflow
````

Executar Testes com Coverage
```bash
npx vitest --coverage
````
