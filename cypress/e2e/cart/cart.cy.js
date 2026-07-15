import HomePage from "../../support/page-objects/HomePage";
import CartPage from "../../support/page-objects/CartPage";

describe("Carrito de compras", () => {
  beforeEach(() => {
    cy.resetAppState();
    HomePage.visit();
  });

  it("muestra el carrito vacío inicialmente @smoke", () => {
    CartPage.visit();
    CartPage.emptyCartMessage.should("be.visible");
  });

  it("permite agregar un producto al carrito @smoke @regression", () => {
    HomePage.productCards.first().within(() => {
      cy.getByTestId("add-to-cart-button").click();
    });

    HomePage.navCartIcon.click();
    CartPage.cartItems.should("have.length.at.least", 1);
  });

  it("permite aumentar la cantidad de un producto @regression", () => {
    HomePage.productCards.first().within(() => {
      cy.getByTestId("add-to-cart-button").click();
    });

    CartPage.visit();
    CartPage.increaseQuantity(0);

    CartPage.cartItems
      .eq(0)
      .find("[data-testid='cart-item-quantity']")
      .should("contain.text", "2");
  });

  it("permite eliminar un producto del carrito @regression", () => {
    HomePage.productCards.first().within(() => {
      cy.getByTestId("add-to-cart-button").click();
    });

    CartPage.visit();
    CartPage.removeItemByIndex(0);

    CartPage.emptyCartMessage.should("be.visible");
  });

  it("actualiza el total al agregar más de un producto @regression", () => {
    HomePage.productCards.eq(0).within(() => {
      cy.getByTestId("add-to-cart-button").click();
    });
    HomePage.productCards.eq(1).within(() => {
      cy.getByTestId("add-to-cart-button").click();
    });

    CartPage.visit();
    CartPage.cartItems.should("have.length", 2);
    CartPage.cartTotal.should("be.visible");
  });

  it("el botón de checkout está deshabilitado con el carrito vacío @regression", () => {
    CartPage.visit();
    CartPage.checkoutButton.should("be.disabled");
  });
});
