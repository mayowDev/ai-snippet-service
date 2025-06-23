// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Custom command to create a new snippet via the form on the main page.
 * Assumes the test is already on the main page.
 * @param email The user's email address.
 * @param text The text content for the snippet.
 * @example cy.createSnippet('test@example.com', 'This is my snippet text.')
 */
Cypress.Commands.add('createSnippet', (email: string, text: string) => {
  // This command assumes the test is already on the page with the form.
  // It only fills out the fields and clicks submit.
  cy.get('input[name="email"]').type(email);
  cy.get('textarea[name="text"]').type(text);
  cy.get('button[type="submit"]').click();
});

// We need to export something to make this file a module.
// This is a common practice in TypeScript to ensure the file is treated as a module.
export {};

/// <reference types="cypress" />
/// <reference path="../global.d.ts" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// This is the correct place for custom commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands

export function registerCommands() {
  Cypress.Commands.add('createSnippet', { prevSubject: false}, (email: string, text: string) => { 
    cy.get('input[name="email"]').type(email);
    cy.get('textarea[name="text"]').type(text);
    cy.get('button[type="submit"]').click();
  });
}
  //other commands here



