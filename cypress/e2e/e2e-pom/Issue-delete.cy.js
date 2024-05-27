
const TrashButton = '[data-testid="icon:trash"]';
const confirmationPopup = '[data-testid="modal:confirm"]';
const IssueTitle = "This is an issue of type: Task.";

function confirmDeletion() {
  cy.get(confirmationPopup).should('be.visible').within(() => {
    cy.contains('Delete').should('be.visible').click();
    cy.get (confirmationPopup).should('not.exist');
  });
}

describe("Issue deletion", () => {
  beforeEach(() => {
    cy.visit("/project/board").then(() => {
      Cypress.config("defaultCommandTimeout", 60000);
      cy.get('[data-testid="board-list:backlog"]').should("be.visible");
      cy.get('[data-testid="list-issue"]').first().click();
      cy.get('[data-testid="modal:issue-details"]').should("be.visible");
    });
  });
//1st part Issue deletion
  it('should delete issue and validate', () => {
    cy.get(TrashButton).click();
    confirmDeletion();
    cy.contains(IssueTitle).should("not.exist");
    
 //2nd part stop issue deletion using POM  
  });
});