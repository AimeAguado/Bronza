export default class CheckoutPage {
  constructor(page) {
    this.page = page;
    this.mercadoPagoButton = page.getByTestId("checkout-mercadopago-button");
    this.orderSummary = page.getByTestId("checkout-order-summary");
    this.totalAmount = page.getByTestId("checkout-total-amount");
  }

  async payWithMercadoPago() {
    await this.mercadoPagoButton.click();
    return this;
  }
}
