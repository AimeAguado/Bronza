import LoginPage from "../../support/page-objects/LoginPage";
import HomePage from "../../support/page-objects/HomePage";

describe("Login de usuario", () => {
  let users;

  before(() => {
    cy.fixture("users").then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.resetAppState();
  });

  it("permite iniciar sesión con credenciales válidas @smoke @regression", () => {
    LoginPage.visit().login(users.existingUser.email, users.existingUser.password);

    cy.url().should("not.include", "/login");
    // Ajustar: validar algún elemento visible solo con sesión iniciada
    // (ej: nombre de usuario en el header, botón de "Cerrar sesión")
  });

  it("muestra error con contraseña incorrecta @regression", () => {
    LoginPage.visit().login(users.existingUser.email, "PasswordIncorrecta123!");

    LoginPage.errorMessage.should("be.visible");
    cy.url().should("include", "/login");
  });

  it("muestra error con un email no registrado @regression", () => {
    LoginPage.visit().login("noexiste@bronza-test.com", "CualquierPassword123!");

    LoginPage.errorMessage.should("be.visible");
  });

  it("no permite loguear con campos vacíos @regression", () => {
    LoginPage.visit();
    LoginPage.submitButton.click();

    cy.url().should("include", "/login");
  });

  it("mantiene la sesión iniciada al navegar entre páginas @regression", () => {
    LoginPage.visit().login(users.existingUser.email, users.existingUser.password);
    HomePage.visit();

    // Ajustar: verificar que el nav muestre estado logueado
    // en lugar del link de "Iniciar sesión"
    HomePage.navLoginLink.should("not.exist");
  });
});
