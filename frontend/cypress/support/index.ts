import {registerCommands} from './commands';


// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import our custom commands
// import './commands'

registerCommands();
// This global hook prevents any uncaught application errors
// from failing the Cypress tests.
Cypress.on('uncaught:exception', (err, runnable) => {
  // We are returning false here to prevent Cypress from
  // failing the test on all uncaught exceptions.
  // This is a broad approach and can be refined later.
  // console.log("uncaught:exception error =>>", err)
  return false
})

