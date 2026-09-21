# React + Vite

![Playwright Tests](https://github.com/AimeAguado/Bronza/actions/workflows/playwright.yml/badge.svg)
![Cypress Tests](https://github.com/AimeAguado/Bronza/actions/workflows/cypress.yml/badge.svg)

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## CI/CD

El proyecto utiliza **GitHub Actions** para ejecutar automáticamente las suites de testing E2E sobre el e-commerce Bronza Club.

| Workflow | Archivo | Qué ejecuta |
| --- | --- | --- |
| Playwright Tests | `.github/workflows/playwright.yml` | Suite E2E de Playwright (`tests/e2e`) con reporte HTML, screenshots, videos y traces como artifacts |
| Cypress Tests | `.github/workflows/cypress.yml` | Suite E2E de Cypress (`cypress/e2e`) con videos, screenshots y reportes Mochawesome como artifacts |

Ambos workflows:

- Se ejecutan automáticamente en cada **push** a `main` y en cada **pull request**.
- Se pueden ejecutar a mano desde **Actions → Run workflow**.
- Levantan MongoDB en un contenedor, siembran productos y el usuario de los fixtures, y conservan las evidencias aunque los tests fallen.

## Run tests locally

Requisito: Node.js 22+ y una base MongoDB (los scripts leen `MONGODB_URI` y `JWT_SECRET` desde `server/.env`, ver `server/.env.example`).

```bash
# 1. Instalar dependencias (web + server)
npm ci

# 2. Levantar la app en background (Vite + API) en otra terminal
#    copiá server/.env.example a server/.env y completá MONGODB_URI y JWT_SECRET
npm run dev:all

# 3. Sembrar productos y crear el usuario de los fixtures (una vez, con la app levantada)
node server/src/scripts/seed-products.js
curl -s -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"QA Automation","email":"qa.automation.test@bronza.com","password":"TestPassword123!"}'

# 4a. Playwright
npm run pw:run          # ejecuta los tests
npm run pw:open         # UI interactiva (requiere app levantada)
npm run pw:report       # abre el reporte HTML local

# 4b. Cypress
npm run cy:run          # ejecuta los tests en headless
npm run cy:open         # Cypress App interactiva (requiere app levantada)
npm run report:merge    # combina los JSON de Mochawesome
npm run report:generate # genera el reporte HTML
```

## Run tests with GitHub Actions

1. Entrá al repositorio de GitHub (https://github.com/AimeAguado/Bronza).
2. Andá a la pestaña **Actions**.
3. Seleccioná el workflow (**Playwright Tests** o **Cypress Tests**) en el panel izquierdo.
4. Presioná **Run workflow** (podés elegir la rama y confirmar).
5. Esperá a que termine la ejecución (el running job queda en verde/rojo).
6. Entrá en la ejecución para ver los logs y el resultado de cada paso.
7. Descargá los artifacts generados desde el panel **Artifacts** (reporte HTML, screenshots, videos, traces, etc.).
