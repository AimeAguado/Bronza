# Bronza Club — Agent Guide

## Quick start

```bash
npm run dev:all        # Vite (5173) + Express API (4000) concurrently
npm run dev            # Frontend only
npm run dev:api        # Backend only (uses `node --watch src/index.js` in server/)
npm run build          # Vite build → dist/
npm run lint           # ESLint (flat config, eslint.config.js)
```

No tests exist. No typecheck step.

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
- `--color-primary: #d2691e`, `--color-background-light: #ede6dd`, `--color-text-main: #111111`, `--color-accent-muted: #c7c1b4`
- Use these tokens, not hardcoded hex values.
