describe('Snippets List', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.reload(true);
  });

  it('should display newly created snippets on the main list page', () => {
    const uniqueText = `A new snippet created at ${new Date().toISOString()}`;
    const userEmail = `list.test.${Date.now()}.${Math.random().toString(36).substr(2, 9)}@example.com`;

    // --- Step 1: Create a new snippet using the custom command ---
    cy.createSnippet(userEmail, uniqueText);
    
    // After submission, we should be on the snippet detail page.
    cy.url().should('include', '/snippets/');
    
    // --- Step 2: Navigate back to the main list page by clicking the link ---
    cy.contains('Back to Snippets').click();

    // --- Step 3: Assert that the new snippet is visible in the list ---
    cy.get('ul.divide-y').should('be.visible');
    cy.contains(uniqueText.substring(0, 100)).should('be.visible');
  });
}); 

 