declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to create a new snippet through the UI.
     * @param email The user's email address.
     * @param text The text content for the snippet.
     * @example cy.createSnippet('test@example.com', 'This is my snippet text.')
     */
    createSnippet(email: string, text: string): Chainable<void>;
  }
} 