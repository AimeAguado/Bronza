class CartPage {
  visit() {
    cy.visit("/carrito");
    return this;
  }

  get cartItems() {
    return cy.getByTestId("cart-item");
  }

  get emptyCartMessage() {
    return cy.getByTestId("cart-empty-message");
  }

  get cartTotal() {
    return cy.getByTestId("cart-total");
  }

  get checkoutButton() {
    return cy.getByTestId("cart-checkout-button");
  }

  removeItemByIndex(index) {
    this.cartItems.eq(index).within(() => {
      cy.getByTestId("cart-item-remove-button").click();
    });
    return this;
  }

  increaseQuantity(index) {
    this.cartItems.eq(index).within(() => {
      cy.getByTestId("cart-item-increase-button").click();
    });
    return this;
  }

  decreaseQuantity(index) {
    this.cartItems.eq(index).within(() => {
      cy.getByTestId("cart-item-decrease-button").click();
    });
    return this;
  }

  goToCheckout() {
    this.checkoutButton.click();
    return this;
  }
}

export default new CartPage();
