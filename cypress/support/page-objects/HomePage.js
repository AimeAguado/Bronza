class HomePage {
  visit() {
    cy.visit("/");
    return this;
  }

  get whatsappButton() {
    return cy.getByTestId("whatsapp-float-button");
  }

  get productCards() {
    return cy.getByTestId("product-card");
  }

  get inStockProductCards() {
    return cy.get('[data-testid="product-card"][data-in-stock="true"]');
  }

  get navLoginLink() {
    return cy.getByTestId("nav-login-link");
  }

  get navRegisterLink() {
    return cy.getByTestId("nav-register-link");
  }

  get navCartIcon() {
    return cy.getByTestId("nav-cart-icon");
  }

  addProductToCart(index = 0) {
    this.inStockProductCards.eq(index).within(() => {
      cy.getByTestId("add-to-cart-button").click();
    });
    cy.getByTestId("color-option").first().click();
    cy.get('[data-testid="size-option"]:not([disabled])').first().click();
    cy.getByTestId("modal-add-to-cart-button").click();
    cy.getByTestId("cart-drawer-close").click();
    return this;
  }

  goToCart() {
    this.navCartIcon.click();
    cy.getByTestId("cart-drawer-view-cart").click();
    return this;
  }
}

export default new HomePage();
