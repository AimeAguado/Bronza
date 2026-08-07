import { test, expect } from "@playwright/test";
import HomePage from "../pages/HomePage";
import whatsapp from "../fixtures/whatsapp.json" with { type: "json" };

test.describe("Botón flotante de WhatsApp", () => {
  test.beforeEach(async ({ page }) => {
    await new HomePage(page).visit();
  });

  test("el botón de WhatsApp es visible en el inicio", async ({ page }) => {
    await expect(new HomePage(page).whatsappButton).toBeVisible();
  });

  test("apunta al número de WhatsApp correcto", async ({ page }) => {
    const href = await new HomePage(page).whatsappButton.getAttribute("href");
    expect(href).toContain(whatsapp.expectedPhoneNumber);
  });

  test("incluye un mensaje automático pre-cargado", async ({ page }) => {
    const href = await new HomePage(page).whatsappButton.getAttribute("href");
    expect(decodeURIComponent(href)).toContain(whatsapp.expectedMessageSnippet);
  });

  test("se abre en una pestaña nueva (target=_blank)", async ({ page }) => {
    await expect(new HomePage(page).whatsappButton).toHaveAttribute("target", "_blank");
  });

  test("usa rel='noopener noreferrer' por seguridad", async ({ page }) => {
    const rel = await new HomePage(page).whatsappButton.getAttribute("rel");
    expect(rel).toContain("noopener");
  });

  test("permanece visible al hacer scroll en la página", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(new HomePage(page).whatsappButton).toBeVisible();
  });
});
