class RegisterPage {
  visit() {
    cy.visit("/registro");
    return this;
  }

  get nameInput() {
    return cy.getByTestId("register-name-input");
  }

  get emailInput() {
    return cy.getByTestId("register-email-input");
  }

  get passwordInput() {
    return cy.getByTestId("register-password-input");
  }

  get confirmPasswordInput() {
    return cy.getByTestId("register-confirm-password-input");
  }

  get submitButton() {
    return cy.getByTestId("register-submit-button");
  }

  get errorMessage() {
    return cy.getByTestId("register-error-message");
  }

  fillForm({ name, email, password, confirmPassword }) {
    if (name) this.nameInput.type(name);
    if (email) this.emailInput.type(email);
    if (password) this.passwordInput.type(password);
    if (confirmPassword) this.confirmPasswordInput.type(confirmPassword);
    return this;
  }

  submit() {
    this.submitButton.click();
    return this;
  }
}

export default new RegisterPage();
