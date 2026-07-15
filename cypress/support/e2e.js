import "./commands";
import { register } from "@cypress/grep";

register();

// Evita que Cypress falle el test por errores de JS no controlados
// que a veces lanzan SDKs de terceros (ej: script de MercadoPago)
Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("ResizeObserver") ||
    err.message.includes("mercadopago") ||
    err.message.includes("MercadoPago")
  ) {
    return false;
  }
  return true;
});
