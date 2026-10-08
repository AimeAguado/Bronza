# Bronza Club — Agent Guide

## Quick start

```bash
npm run dev:all        # Vite (5173) + Express API (4000) concurrently
npm run dev            # Frontend only
npm run dev:api        # Backend only (uses `node --watch src/index.js` in server/)
npm run build          # Vite build → dist/
npm run lint           # ESLint (flat config, eslint.config.js)
npx playwright test    # E2E (tests/e2e/, config levanta dev:all solo)
npx cypress run        # E2E (cypress/e2e/)
```

No typecheck step. `npm run lint` reports pre-existing errors in `cypress/e2e/2-advanced-examples/` (Cypress globals) — errors in `src/` are the signal that matters.

## Stack

**Frontend:** React 19, Vite 8, React Router v7, Tailwind v4 (`@tailwindcss/vite` plugin — no PostCSS config), framer-motion, lucide-react.

**Backend:** Express 4, Mongoose 8 (MongoDB), bcryptjs, jsonwebtoken, mercadopago SDK, Cloudinary + multer (in-memory buffer).

**Deploy:** Frontend via Vite → Vercel (SPA rewrites in `vercel.json`). API via `server/api/index.js` as Vercel serverless function (`server/vercel.json`).

## Architecture notes that differ from defaults

- **Products are NOT hardcoded.** `App.jsx` fetches from `GET /api/products` (MongoDB). The backend `routes/products.js` queries `Product` model.
- **Auth uses MongoDB + localStorage**, not sessionStorage. Token key: `bronza-token`. Auth is in `AuthProvider.jsx` (call `useAuth()` from `hooks/useAuth.js`).
- **Cart persists to localStorage.** Key: `bronza-cart`. Provider: `CartContext.jsx` (call `useCart()` from `context/useCart.js`).
- **API helper is `src/lib/api.js`**, exports `apiUrl(path)`. Not `apiUrl.js`.
- **Backend auto-reconnects MongoDB** on every request via middleware in `app.js` line 19 (`connectDB().then(next).catch(next)`). Connection is idempotent.
- **JWT payload:** `{ sub, email, name, role }`. `requireAuth` middleware sets `req.user = { id, email, name, role }`.
- **Order statuses:** `pending`, `waiting_payment`, `approved`, `shipped`, `delivered`, `rejected`, `cancelled`. Labels/styles en `src/lib/orderStatus.js` (compartido por `Orders.jsx` y `AdminOrders.jsx`). Admin cambia estado con `PATCH /api/orders/admin/:id/status`; `/api/orders/confirm` (retorno de Mercado Pago) no pisa estados `shipped`/`delivered`/`cancelled`.

## Routes

| Frontend route | Component | Auth |
|---|---|---|
| `/` | `App.jsx` | Public |
| `/checkout` | `Checkout.jsx` | `ProtectedRoute` |
| `/orders` | `Orders.jsx` | `ProtectedRoute` |
| `/login` | `Login.jsx` | Public |
| `/register` | `Register.jsx` | Public |
| `/admin/products` | `AdminProducts.jsx` | `AdminRoute` (role=admin) |
| `/admin/orders` | `AdminOrders.jsx` | `AdminRoute` (role=admin) |

Backend API routes: `/api/auth/*`, `/api/payments/*`, `/api/products/*`, `/api/orders/*`, `/api/health`.

## Environment

**Root `.env` (frontend):**
- `VITE_API_URL` — optional, absolute API URL for production (dev uses Vite proxy)
- `VITE_MERCADOPAGO_INIT_POINT` — fallback payment link

**`server/.env`:**
- `JWT_SECRET` (required)
- `MONGODB_URI` (required — MongoDB Atlas connection string)
- `CLOUDINARY_URL` (optional — for image uploads via admin panel)
- `MERCADOPAGO_ACCESS_TOKEN` (optional — dynamic payment preferences)
- `MP_SUCCESS_URL`, `MP_FAILURE_URL`, `MP_PENDING_URL` — return URLs after payment

## Seeding

`server/scripts/seed-admin.js` creates admin user + sample products:
```bash
node server/src/scripts/seed-admin.js
```
Credentials: `admin@bronzaclub.com` / `bronzadmin2026`.

## Payment flow

1. Checkout calls `POST /api/payments/preference` (auth required)
2. Backend creates Mercado Pago Preference, stores `Order` in MongoDB with `externalReference`
3. Frontend redirects to `init_point`
4. After payment, MP redirects to `/?payment=success|failure|pending&external_reference=...&collection_status=...`
5. `App.jsx` reads query params, calls `PATCH /api/orders/confirm` to update order status

## Styling

Tailwind v4 + `@theme` custom properties in `src/index.css`:
- `--color-primary: #291e08` — marrón profundo: header, footer, fondos principales, textos, botones
- `--color-background-light: #faf7f2` — lienzo claro de páginas (neutro, no es color de marca)
- `--color-text-main: #291e08`
- `--color-accent-muted: #9c8580` — fondos secundarios, cards, bordes suaves, textos secundarios
- `--color-accent: #de8bbd` — acento: hover, badges, indicadores, CTA destacados
- Use these tokens, not hardcoded hex values.

Contraste: `#de8bbd` como **relleno** sobre fondo claro siempre con texto `#291e08` (6.4:1); como texto solo sobre `#291e08` (6.4:1). Nunca texto rosa chico sobre fondo claro (2.5:1). `#9c8580` siempre con texto `#291e08`, nunca con texto blanco.

Excepciones fuera de paleta (a propósito): Mercado Pago `#009EE3` en `Checkout.jsx`, WhatsApp `#25d366` en `App.jsx`, y el `COLOR_MAP` de colores de producto en `ProductModal.jsx`.

Portada: el hero (`src/App.jsx`) es un `<video>` de Pexels CDN (atardecer/playa) con `poster` de Cloudinary y overlay `bg-gradient-to-b from-primary/75 via-primary/35 to-primary/90`. Sin autoplay si `prefers-reduced-motion`.

Footer: `src/components/Footer.jsx` (`bg-primary`), montado al final de cada página — no hay layout compartido, cada ruta es autónoma en `main.jsx`.
