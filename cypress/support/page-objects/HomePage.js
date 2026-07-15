class HomePage {
  visit() {
    cy.visit("/");
    return this;
  }

  get whatsappButton() {
    return cy.getByTestId("whatsapp-float-button");
  }

  get productCards() {
    return cy.getByTestId("product-card");
  }

  get navLoginLink() {
    return cy.getByTestId("nav-login-link");
  }

  get navRegisterLink() {
    return cy.getByTestId("nav-register-link");
  }

  get navCartIcon() {
    return cy.getByTestId("nav-cart-icon");
  }
}

export default new HomePage();
