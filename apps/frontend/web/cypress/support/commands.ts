/// <reference types="cypress" />

// Custom command for accessibility testing
Cypress.Commands.add('checkA11y', (context?: string, options?: any) => {
  cy.checkA11y(context, options)
}) 