// cypress/e2e/create-node.cy.ts

describe('Criação de Nó', () => {
  beforeEach(() => {
    // Visita a página inicial antes de cada teste
    cy.visit('http://localhost:5173')
  })

  it('deve criar um nó com sucesso', () => {
    // Verifica se a página carregou corretamente
    cy.contains('Gerenciar Nós').should('be.visible')
    cy.contains('Crie e configure os nós do seu workflow').should('be.visible')

    //Se quiser verificar se o botão está visível e habilitado:
    cy.get('[data-testid="create-node-button"]')
    .should('be.visible')
    .and('not.be.disabled')

    // Clica no botão "Criar Nó"
    cy.get('[data-testid="create-node-button"]')
    .should('contain', 'Criar Nó')
    .click();

    // Verifica se o formulário foi aberto
    cy.contains('Criar Novo Nó').should('be.visible')

    // Preenche o formulário
    cy.get('[data-testid="node-name-input"]')
      .type('Nó de Teste Automatizado')
      .should('have.value', 'Nó de Teste Automatizado')

    // Seleciona o tipo do nó
    cy.get('[data-testid="node-type-select"]')
      .select('process')
      .should('have.value', 'process')

    // Preenche o prompt personalizado
    cy.get('[data-testid="node-prompt-textarea"]')
      .type('Este é um prompt de teste automatizado para validação do fluxo.')
      .should('have.value', 'Este é um prompt de teste automatizado para validação do fluxo.')

    // Seleciona o modelo LLM
    cy.get('[data-testid="node-llm-model-select"]')
      .select('gpt-4')
      .should('have.value', 'gpt-4')

    // Clica no botão de submit
    cy.get('[data-testid="submit-button"]')
      .should('contain.text', 'Criar Nó')
      .click()

    // Verifica se o nó foi criado e aparece na lista
    cy.contains('Nós Criados (1)').should('be.visible')
    cy.contains('Nó de Teste Automatizado').should('be.visible')
    cy.contains('Processamento').should('be.visible')
    cy.contains('GPT-4').should('be.visible')
    cy.contains('Prompt configurado').should('be.visible')
  })

  it('deve validar campo obrigatório do nome do nó', () => {
    // Clica no botão "Criar Nó"
    cy.contains('button', 'Criar Nó').click()

    // Tenta submeter sem preencher o nome
    cy.get('[data-testid="submit-button"]').click()

    // Verifica se o formulário não foi submetido e permanece aberto
    cy.contains('Criar Novo Nó').should('be.visible')
    
    // O campo nome deve estar com foco e mostrar validação de required
    cy.get('[data-testid="node-name-input"]')
      .then(($input) => {
        expect($input[0].validationMessage).not.to.be.empty
      })
  })

  it('deve cancelar a criação de nó', () => {
    // Clica no botão "Criar Nó"
    cy.contains('button', 'Criar Nó').click()

    // Preenche alguns campos
    cy.get('[data-testid="node-name-input"]').type('Nó para Cancelar')
    cy.get('[data-testid="node-prompt-textarea"]').type('Prompt que será cancelado')

    // Clica no botão cancelar
    cy.get('[data-testid="cancel-button"]').click()

    // Verifica se o formulário foi fechado
    cy.contains('Criar Novo Nó').should('not.exist')

    // Verifica que o nó não foi criado
    cy.contains('Nó para Cancelar').should('not.exist')
  })

  it('deve filtrar nós por tipo', () => {
    // Primeiro cria um nó do tipo processamento
    cy.contains('button', 'Criar Nó').click()
    cy.get('[data-testid="node-name-input"]').type('Nó de Processamento')
    cy.get('[data-testid="node-type-select"]').select('process')
    cy.get('[data-testid="submit-button"]').click()

    // Cria um nó do tipo entrada
    cy.contains('button', 'Criar Nó').click()
    cy.get('[data-testid="node-name-input"]').type('Nó de Entrada')
    cy.get('[data-testid="node-type-select"]').select('entry')
    cy.get('[data-testid="submit-button"]').click()

    // Filtra por tipo "Entrada"
    cy.get('select').eq(1).select('entry')

    // Verifica que apenas o nó de entrada é exibido
    cy.contains('Nó de Entrada').should('be.visible')
    cy.contains('Nó de Processamento').should('not.exist')
    cy.contains('Entrada').should('be.visible')
  })

  it('deve buscar nós pelo nome', () => {
    // Cria alguns nós para testar a busca
    cy.contains('button', 'Criar Nó').click()
    cy.get('[data-testid="node-name-input"]').type('Nó Especial para Busca')
    cy.get('[data-testid="submit-button"]').click()

    cy.contains('button', 'Criar Nó').click()
    cy.get('[data-testid="node-name-input"]').type('Outro Nó Diferente')
    cy.get('[data-testid="submit-button"]').click()

    // Busca pelo termo "Especial"
    cy.get('input[placeholder*="Digite o nome"]').type('Especial')

    // Verifica que apenas o nó com "Especial" no nome é exibido
    cy.contains('Nó Especial para Busca').should('be.visible')
    cy.contains('Outro Nó Diferente').should('not.exist')
  })
})