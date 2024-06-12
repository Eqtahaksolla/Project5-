import IssueModal from "../../pages/IssueModal";
import { faker } from "@faker-js/faker";

const randomTitle = faker.random.word();
const randomDescription = faker.lorem.words(5);

const issueDetails = {
  type: "Bug",
  description: randomDescription,
  title: randomTitle,
  assignee: "Lord Gaben",
};
const inputNumber = 'input[placeholder="Number"]';
const EXPECTED_AMOUNT_OF_ISSUES = 5;
const timetrackingWindow = '[data-testid="modal:tracking"]';
const WatchIcon = '[data-testid="icon:stopwatch"]';

beforeEach(() => {
  cy.visit("/");
  cy.url()
    .should("eq", `${Cypress.env("baseUrl")}project/board`)
    .then((url) => {
      cy.visit(url + "/board?modal-issue-create=true");
      Cypress.config("defaultCommandTimeout", 70000);
    });
});

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

function createNewIssue() {
  cy.get('[data-testid="modal:issue-create"]', { timeout: 60000 }).should(
    "be.visible"
  );
  cy.get('[data-testid="modal:issue-create"]').within(() => {
    cy.get(".ql-editor").type(randomDescription);
    cy.wait(2000);
    cy.get(".ql-editor").should("have.text", randomDescription);
    cy.get('input[name="title"]').type(randomTitle);
    cy.wait(1000);
    cy.get('input[name="title"]').should("have.value", randomTitle);
    cy.get('[data-testid="select:priority"]').click();
    cy.get('[data-testid="select-option:Highest"]').click();
    cy.get('[data-testid="select:type"]').click();
    cy.get('[data-testid="select-option:Bug"]')
      .wait(5000)
      .trigger("mouseover")
      .trigger("click");
    cy.get('[data-testid="icon:bug"]').should("be.visible");
    cy.get('[data-testid="select:reporterId"]').click();
    cy.get('[data-testid="select-option:Pickle Rick"]').click();
    cy.get('[data-testid="form-field:userIds"]').click();
    cy.get('[data-testid="select-option:Lord Gaben"]').click();
    cy.get('button[type="submit"]').click();
    cy.log("Clicked submit button");
  });
}

function setOriginalEstimate(value) {
  const inputSelector = 'input[placeholder="Number"]';
  cy.get(inputSelector)
    .first()
    .then((input) => {
      if (value === "") {
        cy.wrap(input).clear().should("have.attr", "placeholder", "Number");
      } else {
        cy.wrap(input).clear().type(value);
        cy.contains("Description").click(); // Click to blur input and ensure value is saved
        cy.wrap(input).should("have.value", value);
      }
    });
}

function setTimeValues(timeSpent, timeRemaining) {
  const inputSelector = 'input[placeholder="Number"]';
  cy.get(timetrackingWindow).within(() => {
    cy.get(inputSelector).then((inputs) => {
      cy.wrap(inputs[0]).clear().type(timeSpent);
      cy.wrap(inputs[1]).clear().type(timeRemaining);
    });
    cy.contains("Done").click();
  });
}

function closeTimeEstimation() {
  cy.get('[data-testid="modal:issue-details"]').within(() => {
    cy.get('[data-testid="icon:close"]').first().click();
  });
}

describe("Issue time tracking", () => {
  it("should create issue, add time estimation, edit and delete it", () => {
    createNewIssue();
    IssueModal.ensureIssueIsCreated(EXPECTED_AMOUNT_OF_ISSUES, issueDetails);
    openIssueDetails();

    // Add time estimation
    cy.get('[data-testid="modal:issue-details"]').within(() => {
      setOriginalEstimate("10");
    });

    closeTimeEstimation();
    cy.wait(3000);
    openIssueDetails();

    cy.get(inputNumber).should("have.value", "10");

    // Edit time estimation
    cy.get('[data-testid="modal:issue-details"]').within(() => {
      setOriginalEstimate("20");
    });

    closeTimeEstimation();
    cy.wait(3000);
    openIssueDetails();

    cy.get(inputNumber).should("have.value", "20");

    // Clear time estimation
    cy.get('[data-testid="modal:issue-details"]').within(() => {
      setOriginalEstimate("");
    });

    closeTimeEstimation();
    cy.wait(3000);
    openIssueDetails();
    // Check that it worked
    cy.get(inputNumber).should("have.value", "");
  });

  it("should create issue, log time, update and delete it", () => {
    createNewIssue();
    IssueModal.ensureIssueIsCreated(EXPECTED_AMOUNT_OF_ISSUES, issueDetails);
    openIssueDetails();

    // Log time
    cy.get(WatchIcon).click();
    cy.get(timetrackingWindow).should("contain", "No time logged");
    setTimeValues("5", "5");
    closeTimeEstimation();
    cy.wait(2000);
    openIssueDetails();

    // Edit Time
    cy.get(WatchIcon).click();
    cy.get(timetrackingWindow).should("contain", "5h logged");
    setTimeValues("10", "15");
    closeTimeEstimation();
    cy.wait(2000);
    openIssueDetails();

    // Delete time
    cy.get(WatchIcon).click();
    cy.get(timetrackingWindow).should("contain", "10h logged");
    setTimeValues("0", "0");
    closeTimeEstimation();
    cy.wait(2000);
    openIssueDetails();

    // Check that it worked
    cy.get(WatchIcon).click();
    cy.get(timetrackingWindow).should("contain", "No time logged");
  });
});
