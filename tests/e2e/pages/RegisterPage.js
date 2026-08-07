export default class RegisterPage {
  constructor(page) {
    this.page = page;
    this.nameInput = page.getByTestId("register-name-input");
    this.emailInput = page.getByTestId("register-email-input");
    this.passwordInput = page.getByTestId("register-password-input");
    this.confirmPasswordInput = page.getByTestId("register-confirm-password-input");
    this.submitButton = page.getByTestId("register-submit-button");
    this.errorMessage = page.getByTestId("register-error-message");
  }

  async visit() {
    await this.page.goto("/registro");
    return this;
  }

  async fillForm({ name, email, password, confirmPassword }) {
    if (name) await this.nameInput.fill(name);
    if (email) await this.emailInput.fill(email);
    if (password) await this.passwordInput.fill(password);
    if (confirmPassword) await this.confirmPasswordInput.fill(confirmPassword);
    return this;
  }

  async submit() {
    await this.submitButton.click();
    return this;
  }
}
