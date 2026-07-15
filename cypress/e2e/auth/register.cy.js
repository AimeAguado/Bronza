import RegisterPage from "../../support/page-objects/RegisterPage";

describe("Registro de usuario", () => {
  let users;

  before(() => {
    cy.fixture("users").then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.resetAppState();
  });

  it("registra un usuario nuevo con datos válidos @smoke @regression", () => {
    const timestamp = Date.now();
    const newUser = {
      ...users.validNewUser,
      email: users.validNewUser.email.replace("{{timestamp}}", timestamp),
    };

    RegisterPage.visit().fillForm(newUser).submit();

    // Ajustar assertion según el flujo real: redirección a home/login,
    // o mensaje de confirmación en pantalla.
    cy.url().should("not.include", "/registro");
  });

  it("muestra error cuando las contraseñas no coinciden @regression", () => {
    RegisterPage.visit().fillForm(users.invalidPasswordMismatch).submit();

    RegisterPage.errorMessage.should("be.visible");
    cy.url().should("include", "/registro");
  });

  it("muestra error con un formato de email inválido @regression", () => {
    RegisterPage.visit().fillForm(users.invalidEmailFormat).submit();

    cy.url().should("include", "/registro");
  });

  it("no permite enviar el formulario con campos vacíos @regression", () => {
    RegisterPage.visit();
    RegisterPage.submitButton.click();

    cy.url().should("include", "/registro");
  });

  it("no permite registrar un email ya existente @regression", () => {
    RegisterPage.visit().fillForm({
      name: "Usuario Duplicado",
      email: users.existingUser.email,
      password: "OtraPassword123!",
      confirmPassword: "OtraPassword123!",
    }).submit();

    RegisterPage.errorMessage.should("be.visible");
  });
});
