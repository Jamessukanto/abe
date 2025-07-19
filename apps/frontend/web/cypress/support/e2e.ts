// Import commands
import './commands'

// Cypress accessibility testing
import 'cypress-axe'

// Global before hook to inject axe
beforeEach(() => {
  cy.injectAxe()
}) 