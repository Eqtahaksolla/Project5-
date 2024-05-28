
const TrashButton = '[data-testid="icon:trash"]';
const confirmationPopup = '[data-testid="modal:confirm"]';
const IssueTitle = "This is an issue of type: Task.";

function confirmDeletion() {
  cy.get(confirmationPopup).should('be.visible').within(() => {
    cy.contains('Delete').should('be.visible').click();
  });
  cy.get(confirmationPopup).should('not.exist');
}

function cancelDeletion() {
  cy.get(confirmationPopup).within(() => {
    cy.contains('Cancel').click();
  });
  cy.get(confirmationPopup).should('not.exist');
  cy.contains(IssueTitle).should('be.visible');
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

  // Issue deletion
  it('should delete issue and validate', () => {
    cy.get(TrashButton).click();
    confirmDeletion();
    cy.contains(IssueTitle).should("not.exist");
  });

  // Cancelling issue deletion
  it('should cancel issue deletion', () => {
    cy.get(TrashButton).click();
    cy.get(confirmationPopup).should('be.visible');
    cancelDeletion();
  });
});