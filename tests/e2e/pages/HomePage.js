export default class HomePage {
  constructor(page) {
    this.page = page;
    this.whatsappButton = page.getByTestId("whatsapp-float-button");
    this.productCards = page.getByTestId("product-card");
    this.inStockProductCards = page.locator(
      '[data-testid="product-card"][data-in-stock="true"]',
    );
    this.navLoginLink = page.getByTestId("nav-login-link");
    this.navRegisterLink = page.getByTestId("nav-register-link");
    this.navCartIcon = page.getByTestId("nav-cart-icon");
  }

  async visit() {
    await this.page.goto("/");
    return this;
  }

  async addProductToCart(index = 0) {
    await this.inStockProductCards
      .nth(index)
      .getByTestId("add-to-cart-button")
      .click();
    await this.page.getByTestId("color-option").first().click();
    await this.page
      .locator('[data-testid="size-option"]:not([disabled])')
      .first()
      .click();
    await this.page.getByTestId("modal-add-to-cart-button").click();
    await this.page.getByTestId("cart-drawer-close").click();
    return this;
  }

  async goToCart() {
    await this.navCartIcon.click();
    await this.page.getByTestId("cart-drawer-view-cart").click();
    return this;
  }
}
