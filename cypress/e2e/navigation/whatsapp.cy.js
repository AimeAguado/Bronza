import HomePage from "../../support/page-objects/HomePage";

/**
 * NOTA: Cypress no puede verificar la apertura real de una pestaña nueva
 * hacia wa.me (es un dominio externo). La estrategia estándar es validar
 * que el elemento tenga el href correcto, con el número y el mensaje
 * pre-armado bien codificados, y que apunte a target="_blank".
 */
describe("Botón flotante de WhatsApp", () => {
  let whatsappData;

  before(() => {
    cy.fixture("whatsapp").then((data) => {
      whatsappData = data;
    });
  });

  beforeEach(() => {
    HomePage.visit();
  });

  it("el botón de WhatsApp es visible en el inicio @smoke", () => {
    HomePage.whatsappButton.should("be.visible");
  });

  it("apunta al número de WhatsApp correcto @smoke @regression", () => {
    HomePage.whatsappButton
      .should("have.attr", "href")
      .and("include", whatsappData.expectedPhoneNumber);
  });

  it("incluye un mensaje automático pre-cargado @regression", () => {
    HomePage.whatsappButton.should("have.attr", "href").then((href) => {
      const decodedHref = decodeURIComponent(href);
      expect(decodedHref).to.include(whatsappData.expectedMessageSnippet);
    });
  });

  it("se abre en una pestaña nueva (target=_blank) @regression", () => {
    HomePage.whatsappButton.should("have.attr", "target", "_blank");
  });

  it("usa rel='noopener noreferrer' por seguridad @regression", () => {
    HomePage.whatsappButton.should("have.attr", "rel").and("include", "noopener");
  });

  it("permanece visible al hacer scroll en la página @regression", () => {
    cy.scrollTo("bottom");
    HomePage.whatsappButton.should("be.visible");
  });
});
