import HomePage from "../../support/page-objects/HomePage";
import CartPage from "../../support/page-objects/CartPage";
import CheckoutPage from "../../support/page-objects/CheckoutPage";

/**
 * NOTA IMPORTANTE sobre testing de pasarelas de pago:
 * No se automatiza el flujo completo dentro del sitio de MercadoPago
 * (es un dominio de terceros fuera de nuestro control, y completar un
 * pago real no es apto para un pipeline de CI). En su lugar:
 *   1. Se verifica que la integración desde bronza-club dispare
 *      correctamente la creación de la "preferencia de pago" (intercept).
 *   2. Se verifica que el usuario sea redirigido/el botón habilite
 *      la apertura del checkout de MercadoPago.
 * Esto es lo que se conoce como testear "hasta el límite del contrato"
 * con el proveedor externo.
 */
describe("Checkout - Integración MercadoPago", () => {
  let users;

  before(() => {
    cy.fixture("users").then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    cy.resetAppState();
    cy.loginViaApi(users.existingUser.email, users.existingUser.password);
    HomePage.visit();
    HomePage.productCards.first().within(() => {
      cy.getByTestId("add-to-cart-button").click();
    });
    HomePage.navCartIcon.click();
  });

  it("redirige al usuario al checkout de MercadoPago al confirmar la compra @smoke @regression", () => {
    cy.intercept("POST", /\/api\/.*preference/).as("createPreference");

    CartPage.goToCheckout();

    CheckoutPage.orderSummary.should("be.visible");
    CheckoutPage.mercadoPagoButton.should("be.visible");

    cy.wait("@createPreference").its("response.statusCode").should("eq", 200);
  });

  it("muestra el resumen de la orden con el total correcto antes de pagar @regression", () => {
    CartPage.goToCheckout();

    CheckoutPage.orderSummary.should("be.visible");
    CheckoutPage.totalAmount.should("be.visible");
  });

  it("maneja un error del backend al crear la preferencia de pago @regression", () => {
    cy.intercept("POST", /\/api\/.*preference/, {
      statusCode: 500,
      body: { error: "Error al crear preferencia" },
    }).as("createPreferenceError");

    CartPage.goToCheckout();

    cy.wait("@createPreferenceError");

    CheckoutPage.orderSummary.should("be.visible");
    CheckoutPage.totalAmount.should("be.visible");
  });

  it("no permite ir a checkout si el carrito está vacío @regression", () => {
    CartPage.removeItemByIndex(0);
    CartPage.checkoutButton.should("be.disabled");
  });
});
