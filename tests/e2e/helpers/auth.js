import { request } from "@playwright/test";

export const API_URL = "http://localhost:4000";

export async function loginViaApi(page, email, password) {
  const ctx = await request.newContext();
  const resp = await ctx.post(`${API_URL}/api/auth/login`, {
    data: { email, password },
  });
  if (!resp.ok()) {
    throw new Error(`loginViaApi falló: ${resp.status()} ${await resp.text()}`);
  }
  const body = await resp.json();
  await page.evaluate(
    (token) => localStorage.setItem("bronza-token", token),
    body.token,
  );
  await ctx.dispose();
}

export async function resetAppState(page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("bronza-token");
    localStorage.removeItem("bronza-cart");
  });
}

export function uniqueEmail(pattern) {
  return pattern.replace("{{timestamp}}", Date.now());
}
