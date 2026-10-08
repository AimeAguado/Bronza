import { test, expect } from "@playwright/test";
import HomePage from "../pages/HomePage";
import CartPage from "../pages/CartPage";
import { resetAppState } from "../helpers/auth";

test.describe("Carrito de compras", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
    await new HomePage(page).visit();
  });

  test("muestra el carrito vacío inicialmente", async ({ page }) => {
    const cart = new CartPage(page);
    await cart.visit();
    await expect(cart.emptyCartMessage).toBeVisible();
  });

  test("permite agregar un producto al carrito", async ({ page }) => {
    const home = new HomePage(page);
    await home.inStockProductCards.first().getByTestId("add-to-cart-button").click();
    await home.navCartIcon.click();

    const cart = new CartPage(page);
    await expect(cart.cartItems).toHaveCount(1);
  });

  test("permite aumentar la cantidad de un producto", async ({ page }) => {
    const home = new HomePage(page);
    await home.inStockProductCards.first().getByTestId("add-to-cart-button").click();

    const cart = new CartPage(page);
    await cart.visit();
    await cart.increaseQuantity(0);

    await expect(cart.cartItems.nth(0).getByTestId("cart-item-quantity")).toContainText("2");
  });

  test("permite eliminar un producto del carrito", async ({ page }) => {
    const home = new HomePage(page);
    await home.inStockProductCards.first().getByTestId("add-to-cart-button").click();

    const cart = new CartPage(page);
    await cart.visit();
    await cart.removeItemByIndex(0);

    await expect(cart.emptyCartMessage).toBeVisible();
  });

  test("actualiza el total al agregar más de un producto", async ({ page }) => {
    const home = new HomePage(page);
    await home.inStockProductCards.nth(0).getByTestId("add-to-cart-button").click();
    await home.inStockProductCards.nth(1).getByTestId("add-to-cart-button").click();

    const cart = new CartPage(page);
    await cart.visit();
    await expect(cart.cartItems).toHaveCount(2);
    await expect(cart.cartTotal).toBeVisible();
  });

  test("el botón de checkout está deshabilitado con el carrito vacío", async ({ page }) => {
    const cart = new CartPage(page);
    await cart.visit();
    await expect(cart.checkoutButton).toBeDisabled();
  });
});
