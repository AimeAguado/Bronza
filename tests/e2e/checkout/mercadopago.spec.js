import { test, expect } from "@playwright/test";
import HomePage from "../pages/HomePage";
import CartPage from "../pages/CartPage";
import CheckoutPage from "../pages/CheckoutPage";
import users from "../fixtures/users.json" with { type: "json" };
import { resetAppState, loginViaApi } from "../helpers/auth";

/**
 * NOTA IMPORTANTE sobre testing de pasarelas de pago:
 * No se automatiza el flujo completo dentro del sitio de MercadoPago
 * (es un dominio de terceros fuera de nuestro control). En su lugar:
 *   1. Se verifica que la integración dispare la creación de la
 *      "preferencia de pago" (intercept).
 *   2. Se verifica que el usuario sea redirigido / el botón habilite
 *      la apertura del checkout de MercadoPago.
 */
test.describe("Checkout - Integración MercadoPago", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
    await loginViaApi(page, users.existingUser.email, users.existingUser.password);

    const home = new HomePage(page);
    await home.visit();
    await home.inStockProductCards.first().getByTestId("add-to-cart-button").click();
    await home.navCartIcon.click();
  });

  test("redirige al usuario al checkout de MercadoPago al confirmar la compra", async ({ page }) => {
    const createPreference = page.waitForResponse(
      (resp) => resp.url().includes("/api/") && resp.url().includes("preference") && resp.request().method() === "POST",
    );

    const cart = new CartPage(page);
    await cart.goToCheckout();

    const checkout = new CheckoutPage(page);
    await expect(checkout.orderSummary).toBeVisible();
    await expect(checkout.mercadoPagoButton).toBeVisible();

    const resp = await createPreference;
    expect(resp.status()).toBe(200);
  });

  test("muestra el resumen de la orden con el total correcto antes de pagar", async ({ page }) => {
    const cart = new CartPage(page);
    await cart.goToCheckout();

    const checkout = new CheckoutPage(page);
    await expect(checkout.orderSummary).toBeVisible();
    await expect(checkout.totalAmount).toBeVisible();
  });

  test("maneja un error del backend al crear la preferencia de pago", async ({ page }) => {
    await page.route("**/api/**preference**", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Error al crear preferencia" }),
      }),
    );

    const cart = new CartPage(page);
    await cart.goToCheckout();

    const checkout = new CheckoutPage(page);
    await expect(checkout.orderSummary).toBeVisible();
    await expect(checkout.totalAmount).toBeVisible();
  });

  test("no permite ir a checkout si el carrito está vacío", async ({ page }) => {
    const cart = new CartPage(page);
    await cart.removeItemByIndex(0);
    await expect(cart.checkoutButton).toBeDisabled();
  });
});
