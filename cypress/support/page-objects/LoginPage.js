class LoginPage {
  visit() {
    cy.visit("/login");
    return this;
  }

  get emailInput() {
    return cy.getByTestId("login-email-input");
  }

  get passwordInput() {
    return cy.getByTestId("login-password-input");
  }

  get submitButton() {
    return cy.getByTestId("login-submit-button");
  }

  get errorMessage() {
    return cy.getByTestId("login-error-message");
  }

  login(email, password) {
    this.emailInput.type(email);
    this.passwordInput.type(password);
    this.submitButton.click();
    return this;
  }
}

export default new LoginPage();
