const expectedLength = 5; // Predefined expected number of elements in the priority dropdown
let priorityValues = []; // Empty array variable

beforeEach(() => {
  cy.visit("/");
  cy.url()
    .should("eq", `${Cypress.env("baseUrl")}project`)
    .then((url) => {
      cy.visit(url + "/board");

      // Increase timeout for contains command
      cy.contains("This is an issue of type: Task.", { timeout: 60000 })
        .should("be.visible")
        .click();

      Cypress.config("defaultCommandTimeout", 70000);
    });
});

describe("Issue details editing", () => {
  it("Should update type, status, assignees, reporter, priority successfully", () => {
    getIssueDetailsModal().within(() => {
      cy.get('[data-testid="select:type"]').click("bottomRight");
      cy.get('[data-testid="select-option:Story"]')
        .trigger("mouseover")
        .trigger("click");
      cy.get('[data-testid="select:type"]').should("contain", "Story");

      cy.get('[data-testid="select:status"]').click("bottomRight");
      cy.get('[data-testid="select-option:Done"]').click();
      cy.get('[data-testid="select:status"]').should("have.text", "Done");

      cy.get('[data-testid="select:assignees"]').click("bottomRight");
      cy.get('[data-testid="select-option:Lord Gaben"]').click();
      cy.get('[data-testid="select:assignees"]').click("bottomRight");
      cy.get('[data-testid="select-option:Baby Yoda"]').click();
      cy.get('[data-testid="select:assignees"]').should("contain", "Baby Yoda");
      cy.get('[data-testid="select:assignees"]').should(
        "contain",
        "Lord Gaben"
      );

      cy.get('[data-testid="select:reporter"]').click("bottomRight");
      cy.get('[data-testid="select-option:Pickle Rick"]').click();
      cy.get('[data-testid="select:reporter"]').should(
        "have.text",
        "Pickle Rick"
      );

      cy.get('[data-testid="select:priority"]').click("bottomRight");
      cy.get('[data-testid="select-option:Medium"]').click();
      cy.get('[data-testid="select:priority"]').should("have.text", "Medium");
    });
  });

  it("Should update title, description successfully", () => {
    const title = "TEST_TITLE";
    const description = "TEST_DESCRIPTION";

    getIssueDetailsModal().within(() => {
      cy.get('textarea[placeholder="Short summary"]')
        .clear()
        .type(title)
        .blur();

      cy.get(".ql-snow").click().should("not.exist");

      cy.get(".ql-editor").clear().type(description);

      cy.contains("button", "Save").click().should("not.exist");

      cy.get('textarea[placeholder="Short summary"]').should(
        "have.text",
        title
      );
      cy.get(".ql-snow").should("have.text", description);
    });
  });

  const getIssueDetailsModal = () =>
    cy.get('[data-testid="modal:issue-details"]');
});

describe("Priority Dropdown", () => {
  it.only("should verify the priority dropdown options", () => {
    // Open issue detail view
    cy.get('[data-testid="board-list:backlog"]').within(() => {
      cy.get('[data-testid="list-issue"]')
        .first()
        .scrollIntoView()
        .click({ force: true });
    });

    // Push the initially selected priority value into the array
    cy.get('[data-testid="select:priority"]').then(($selectedPriority) => {
      const selectedPriorityText = $selectedPriority.text().trim();
      priorityValues.push(selectedPriorityText);
      cy.log(`Initially selected priority: ${selectedPriorityText}`);
    });

    // Open the priority dropdown
    cy.get('[data-testid="select:priority"]').click();

    // Access all priority options
    cy.get('[data-testid^="select-option:"]')
      .each(($option, index, $options) => {
        const optionText = $option.text().trim();
        priorityValues.push(optionText);
        cy.log(`Added priority: ${optionText}`);
        cy.log(
          `Array length after iteration ${index + 1}: ${priorityValues.length}`
        );
      })
      .then(() => {
        // Assert that the array has the expected length
        expect(priorityValues.length).to.equal(expectedLength);
      });
  });
});

describe("Reporter Name Validation", () => {
  it.only("should ensure the reporter's name contains only characters", () => {
    // Open issue detail view
    cy.get('[data-testid="board-list:backlog"]').within(() => {
      cy.get('[data-testid="list-issue"]')
        .first()
        .scrollIntoView()
        .click({ force: true });
    });

    // Access the reporter's name
    cy.get('[data-testid="select:reporter"]').then(($reporter) => {
      const reporterName = $reporter.text().trim();
      cy.log(`Reporter name: ${reporterName}`);

      // Regular expression to match only alphabetic characters and spaces
      const regex = /^[A-Za-z\s]+$/;

      // Assert that the reporter's name matches the regular expression
      expect(reporterName).to.match(regex);
    });
  });
});
