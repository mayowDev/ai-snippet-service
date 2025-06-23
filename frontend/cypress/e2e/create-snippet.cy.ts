describe('Create Snippet Workflow', () => {
  it('should allow a user to create a new snippet and view it', () => {
    // Start on the main page where the form now lives
    cy.visit('/');

    // --- Step 1: Fill out the form ---
    const userEmail = `test.user.${Date.now()}@example.com`;
    const snippetText = 'This is a test snippet created by Cypress. It should be long enough to require a summary.';
    
    cy.get('input[name="email"]').type(userEmail);
    cy.get('textarea[name="text"]').type(snippetText);
    cy.get('button[type="submit"]').click();

    // --- Step 2: Assert redirection and content ---
    // The app should redirect to the new snippet's detail page
    cy.url().should('include', '/snippets/');

    // The page should display the original text and the AI-generated summary
    cy.contains(snippetText);
    // We can't know the exact summary, but we can check that the summary section exists
    cy.contains('AI Summary'); 
  });

  it('should display a validation error if the text field is empty', () => {
    // Start on the main page
    cy.visit('/');

    // --- Step 1: Fill out only the email ---
    const userEmail = `test.user.${Date.now()}@example.com`;
    cy.get('input[name="email"]').type(userEmail);

    // --- Step 2: Submit the form ---
    cy.get('button[type="submit"]').click();

    // --- Step 3: Assert that the app stays on the page and shows an error ---
    cy.url().should('not.include', '/snippets'); // Should stay on the index page
    cy.contains('Text is required').should('be.visible');
  });

  it('should display a validation error if the email is invalid', () => {
    // Start on the main page
    cy.visit('/');

    // --- Step 1: Fill out with an invalid email ---
    cy.get('input[name="email"]').type('not-a-valid-email');
    cy.get('textarea[name="text"]').type('This is some valid text for the snippet.');

    // --- Step 2: Submit the form ---
    cy.get('button[type="submit"]').click();

    // --- Step 3: Assert that the app stays on the page and shows an error ---
    cy.url().should('not.include', '/snippets'); // Should stay on the index page
    cy.contains('Please provide a valid email address').should('be.visible');
  });
}); 