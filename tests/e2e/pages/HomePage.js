export default class HomePage {
  constructor(page) {
    this.page = page;
    this.whatsappButton = page.getByTestId("whatsapp-float-button");
    this.productCards = page.getByTestId("product-card");
    this.navLoginLink = page.getByTestId("nav-login-link");
    this.navRegisterLink = page.getByTestId("nav-register-link");
    this.navCartIcon = page.getByTestId("nav-cart-icon");
  }

  async visit() {
    await this.page.goto("/");
    return this;
  }
}
