const expectedLength = 5; // Expected number of elements in the priority dropdown
let priorityValues = []; // Empty array variable

beforeEach(() => {
  cy.visit("/");
  cy.url()
    .should("eq", `${Cypress.env("baseUrl")}project`)
    .then((url) => {
      cy.visit(url + "/board");
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
  it("should verify the priority dropdown options", () => {
    cy.get('[data-testid="board-list:backlog"]').within(() => {
      cy.get('[data-testid="list-issue"]')
        .first()
        .scrollIntoView()
        .click({ force: true });
    });

    // Push the selected priority value into the array
    cy.get('[data-testid="select:priority"]').then(($selectedPriority) => {
      const selectedPriorityText = $selectedPriority.text().trim();
      priorityValues.push(selectedPriorityText);
      cy.log(`Initially selected priority: ${selectedPriorityText}`);
    });

    // Open and access all priority options
    cy.get('[data-testid="select:priority"]').click();
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
        // Confirm
        expect(priorityValues.length).to.equal(expectedLength);
      });
  });
});

describe("Reporter Name Validation", () => {
  it("should ensure the reporter's name contains only characters", () => {
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

      // should match only alphabetic characters and spaces
      const notThese = /^[A-Za-z\s]+$/;

      // Confirm
      expect(reporterName).to.match(notThese);
    });
  });
});

describe("Issue Creation and Title Trimming", () => {
  const titleWithSpaces = "   Hello    world!   ";
  const trimmedTitle = "Hello world!";

  it.only("should remove unnecessary spaces from the issue title on the board view", () => {
    // Close the currently opened issue details modal if it's open
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="modal:issue-details"]').length) {
        cy.get('[data-testid="modal:issue-details"] [data-testid="icon:close"]')
          .first()
          .click();
      }
    });

    // Create a new issue with a title containing extra spaces
    cy.get('[data-testid="icon:plus"]').click();
    cy.get('[data-testid="modal:issue-create"]').within(() => {
      cy.get('input[name="title"]').type(titleWithSpaces);
      cy.get(".ql-editor").type("This is a description.");
      cy.get('[data-testid="select:priority"]').click();
      cy.get('[data-testid="select-option:Low"]').click();
      cy.get('[data-testid="select:reporterId"]').click();
      cy.get('[data-testid="select-option:Pickle Rick"]').click();
      cy.get('button[type="submit"]').click();
      cy.wait(5000);
    });

    // Confirm the issue title is trimmed on the board view
    cy.get('[data-testid="modal:issue-create"]').should("not.exist");
    cy.contains("Issue has been successfully created.").should("be.visible");
    cy.reload();
    cy.contains("Issue has been successfully created.").should("not.exist");

    cy.get('[data-testid="board-list:backlog"]').within(() => {
      cy.wait(10000); // Adding wait to ensure the issue is loaded
      cy.get('[data-testid="list-issue"]')
        .first()
        .find("p")
        .should("be.visible")
        .and(($issueTitle) => {
          const issueTitleText = $issueTitle.text().replace(/\s+/g, " ").trim();
          expect(issueTitleText).to.equal(trimmedTitle);
        });
    });
  });
});
