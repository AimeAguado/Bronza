import { test, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import users from "../fixtures/users.json" with { type: "json" };
import { resetAppState } from "../helpers/auth";

test.describe("Login de usuario", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
  });

  test("permite iniciar sesión con credenciales válidas", async ({ page }) => {
    const login = new LoginPage(page);
    await login.visit();
    await login.login(users.existingUser.email, users.existingUser.password);
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("muestra error con contraseña incorrecta", async ({ page }) => {
    const login = new LoginPage(page);
    await login.visit();
    await login.login(users.existingUser.email, "PasswordIncorrecta123!");
    await expect(login.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("muestra error con un email no registrado", async ({ page }) => {
    const login = new LoginPage(page);
    await login.visit();
    await login.login("noexiste@bronza-test.com", "CualquierPassword123!");
    await expect(login.errorMessage).toBeVisible();
  });

  test("no permite loguear con campos vacíos", async ({ page }) => {
    const login = new LoginPage(page);
    await login.visit();
    await login.submitButton.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("mantiene la sesión iniciada al navegar entre páginas", async ({ page }) => {
    const login = new LoginPage(page);
    await login.visit();
    await login.login(users.existingUser.email, users.existingUser.password);
    await expect(page).not.toHaveURL(/\/login/);
    const home = new HomePage(page);
    await home.visit();
    await expect(home.navLoginLink).toHaveCount(0);
  });
});
