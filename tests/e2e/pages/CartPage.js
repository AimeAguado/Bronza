export default class CartPage {
  constructor(page) {
    this.page = page;
    this.cartItems = page.getByTestId("cart-item");
    this.emptyCartMessage = page.getByTestId("cart-empty-message");
    this.cartTotal = page.getByTestId("cart-total");
    this.checkoutButton = page.getByTestId("cart-checkout-button");
  }

  async visit() {
    await this.page.goto("/carrito");
    return this;
  }

  async removeItemByIndex(index) {
    await this.cartItems.nth(index).getByTestId("cart-item-remove-button").click();
    return this;
  }

  async increaseQuantity(index) {
    await this.cartItems.nth(index).getByTestId("cart-item-increase-button").click();
    return this;
  }

  async decreaseQuantity(index) {
    await this.cartItems.nth(index).getByTestId("cart-item-decrease-button").click();
    return this;
  }

  async goToCheckout() {
    await this.checkoutButton.click();
    return this;
  }
}
