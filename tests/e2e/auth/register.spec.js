import { test, expect } from "@playwright/test";
import RegisterPage from "../pages/RegisterPage";
import users from "../fixtures/users.json" with { type: "json" };
import { resetAppState, uniqueEmail } from "../helpers/auth";

test.describe("Registro de usuario", () => {
  test.beforeEach(async ({ page }) => {
    await resetAppState(page);
  });

  test("registra un usuario nuevo con datos válidos", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.visit();
    await register.fillForm({
      ...users.validNewUser,
      email: uniqueEmail(users.validNewUser.email),
    });
    await register.submit();
    await expect(page).not.toHaveURL(/\/registro/);
  });

  test("muestra error cuando las contraseñas no coinciden", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.visit();
    await register.fillForm(users.invalidPasswordMismatch);
    await register.submit();
    await expect(register.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/\/registro/);
  });

  test("muestra error con un formato de email inválido", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.visit();
    await register.fillForm(users.invalidEmailFormat);
    await register.submit();
    await expect(page).toHaveURL(/\/registro/);
  });

  test("no permite enviar el formulario con campos vacíos", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.visit();
    await register.submitButton.click();
    await expect(page).toHaveURL(/\/registro/);
  });

  test("no permite registrar un email ya existente", async ({ page }) => {
    const register = new RegisterPage(page);
    await register.visit();
    await register.fillForm({
      name: "Usuario Duplicado",
      email: users.existingUser.email,
      password: "OtraPassword123!",
      confirmPassword: "OtraPassword123!",
    });
    await register.submit();
    await expect(register.errorMessage).toBeVisible();
  });
});
