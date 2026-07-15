// ============================================================
// Custom Commands - bronza-club QA Automation
// ============================================================

/**
 * Selecciona un elemento por data-testid.
 * Convención recomendada para desacoplar los tests del styling.
 * Ej: cy.getByTestId('login-submit-button')
 */
Cypress.Commands.add("getByTestId", (testId) => {
  return cy.get(`[data-testid="${testId}"]`);
});

/**
 * Registra un nuevo usuario a través del formulario de la UI.
 */
Cypress.Commands.add("registerUser", (user) => {
  cy.visit("/registro");
  cy.getByTestId("register-name-input").type(user.name);
  cy.getByTestId("register-email-input").type(user.email);
  cy.getByTestId("register-password-input").type(user.password);
  if (user.confirmPassword) {
    cy.getByTestId("register-confirm-password-input").type(user.confirmPassword);
  }
  cy.getByTestId("register-submit-button").click();
});

/**
 * Login vía UI, reutilizable en cualquier test que necesite
 * empezar con sesión iniciada.
 */
Cypress.Commands.add("loginViaUI", (email, password) => {
  cy.visit("/login");
  cy.getByTestId("login-email-input").type(email);
  cy.getByTestId("login-password-input").type(password);
  cy.getByTestId("login-submit-button").click();
  cy.url().should("not.include", "/login");
});

/**
 * Login via API: crea token directamente y lo guarda en localStorage.
 * Más rápido y confiable que loginViaUI para tests que solo necesitan sesión.
 */
Cypress.Commands.add("loginViaApi", (email, password) => {
  cy.request("POST", "http://localhost:4000/api/auth/login", {
    email,
    password,
  }).then((resp) => {
    expect(resp.status).to.eq(200);
    localStorage.setItem("bronza-token", resp.body.token);
  });
});

/**
 * Agrega un producto al carrito desde el home o listado,
 * identificándolo por su nombre visible.
 */
Cypress.Commands.add("addProductToCartByName", (productName) => {
  cy.contains("[data-testid='product-card']", productName)
    .within(() => {
      cy.getByTestId("add-to-cart-button").click();
    });
});

/**
 * Limpia estado de sesión/cookies entre tests cuando se necesita
 * partir de cero (no depende de localStorage del navegador real,
 * corre dentro del contexto de Cypress).
 */
Cypress.Commands.add("resetAppState", () => {
  cy.clearCookies();
  cy.clearLocalStorage();
});
