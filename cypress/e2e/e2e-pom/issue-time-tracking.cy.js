import IssueModal from "../../pages/IssueModal";
import { faker } from "@faker-js/faker";

beforeEach(() => {
  cy.visit("/");
  cy.url()
    .should("eq", `${Cypress.env("baseUrl")}project/board`)
    .then((url) => {
      cy.visit(url + "/board?modal-issue-create=true");
      Cypress.config("defaultCommandTimeout", 70000);
    });
});

const randomTitle = faker.random.word();

const issueDetails = {
  type: "Bug",
  description: faker.lorem.words(5),
  title: randomTitle,
  assignee: "Lord Gaben",
};

const EXPECTED_AMOUNT_OF_ISSUES = 5;
const timetrackingWindow = '[data-testid="modal:tracking"]';

function openIssueDetails() {
  cy.get('[data-testid="board-list:backlog"]')
    .should("be.visible")
    .within(() => {
      cy.get('[data-testid="list-issue"]')
        .should("contain", randomTitle)
        .first()
        .click();
    });
}

function setOriginalEstimate(value) {
  const inputSelector = 'input[placeholder="Number"]';
  if (value === "") {
    cy.get(inputSelector).clear().should("have.attr", "placeholder", "Number");
  } else {
    cy.get(inputSelector).clear().type(value, { delay: 100 });
  }
  cy.contains("Description").click(); // Click to blur input and ensure value is saved
  cy.get('input[placeholder="Number"]').should("have.value", "10");
}
function closeTimeEstimation() {
  cy.get('[data-testid="modal:issue-details"]').within(() => {
    cy.get('[data-testid="icon:close"]').first().click();
  });
}

it.only("should create issue, add time estimation, edit and delete it", () => {
  IssueModal.createIssue(issueDetails);
  IssueModal.ensureIssueIsCreated(EXPECTED_AMOUNT_OF_ISSUES, issueDetails);

  openIssueDetails();

  // Add time estimation
  cy.get('[data-testid="modal:issue-details"]').within(() => {
    setOriginalEstimate("10");
  });

  closeTimeEstimation();
  cy.wait(3000);
  openIssueDetails();

  cy.get('input[placeholder="Number"]').should("have.value", "10");

  // Edit time estimation
  cy.get('[data-testid="modal:issue-details"]').within(() => {
    setOriginalEstimate("20");
  });

  closeTimeEstimation();
  cy.wait(3000);
  openIssueDetails();

  cy.get('input[placeholder="Number"]').should("have.value", "20");

  // Clear time estimation
  cy.get('[data-testid="modal:issue-details"]').within(() => {
    setOriginalEstimate("");
  });

  closeTimeEstimation();
  cy.wait(3000);
  openIssueDetails();

  cy.get('input[placeholder="Number"]').should("have.value", "");
});

it("should create issue, log time, update and delete it", () => {
  IssueModal.createIssue(issueDetails);
  IssueModal.ensureIssueIsCreated(EXPECTED_AMOUNT_OF_ISSUES, issueDetails);
  openIssueDetails();

  // Log time
  cy.get(timetrackingWindow).should("contain", "No time logged");
  cy.get(timetrackingWindow).within(() => {
    setOriginalEstimate("5");
    cy.get('[data-testid="icon:close"]').click({ force: true });
  });

  cy.wait(2000);

  cy.get('[data-testid="icon:stopwatch"]').click();
  cy.get(timetrackingWindow).should("contain", "5h logged");
});
