class CheckoutPage {
  get mercadoPagoButton() {
    return cy.getByTestId("checkout-mercadopago-button");
  }

  get orderSummary() {
    return cy.getByTestId("checkout-order-summary");
  }

  get totalAmount() {
    return cy.getByTestId("checkout-total-amount");
  }

  payWithMercadoPago() {
    this.mercadoPagoButton.click();
    return this;
  }
}

export default new CheckoutPage();
