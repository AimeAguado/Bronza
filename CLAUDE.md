# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bronza Club** — Fashion ecommerce app (portfolio/learning project). Full-stack: React 19 frontend + Express.js backend, integrated with Mercado Pago.

## Commands

### Development

```bash
npm run dev:all    # Start both frontend (port 5173) and backend (port 4000)
npm run dev        # Frontend only
npm run dev:api    # Backend only
```

### Build & Lint

```bash
npm run build      # Vite production build → /dist
npm run lint       # ESLint check
npm run preview    # Preview production build locally
```

No test suite exists in this project.

## Architecture

### Monorepo Structure

- `src/` — React frontend (Vite)
- `server/` — Express backend (ES modules, Node.js)
- Frontend proxies `/api/*` → `http://localhost:4000` in dev (set in `vite.config.js`)

### Frontend

**State:** React Context API only — no Redux/Zustand.
- `CartContext` → cart state + localStorage persistence
- `AuthContext` → JWT auth state + sessionStorage (not persistent across sessions)

**Custom hooks** wrap context access: `useAuth()`, `useCart()`.

**Routing (React Router v7):**
- `/` — Product catalog (main page, in `App.jsx`)
- `/checkout` — Protected, requires auth
- `/login`, `/register` — Auth forms

`ProtectedRoute` wraps `/checkout` and redirects to `/login` if unauthenticated.

**API calls:** raw `fetch` with JWT Bearer token. Use `src/lib/apiUrl.js` helper for constructing endpoints — it handles dev vs. production URL differences via `VITE_API_URL`.

**Styling:** Tailwind CSS 4 utility classes exclusively. CSS custom properties defined in `src/index.css` (e.g., `--color-primary: #d2691e`, `--color-bg-light: #ede6dd`). Use these variables for brand colors, not hardcoded hex values.

### Backend (`server/src/`)

- `app.js` — Express setup + CORS
- `index.js` — Entry point, port 4000
- `routes/auth.js` — `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- `routes/payments.js` — `/api/payments/preference` (requires auth middleware)
- `middleware/requireAuth.js` — JWT verification
- `lib/store.js` — File-based persistence: reads/writes `server/data/users.json`

### Data Models

```js
// Product (hardcoded in App.jsx)
{ id, name, category, color, price, image, volume }

// Cart item
{ ...product, qty }

// User (in users.json)
{ id, name, email, password } // password is bcrypt-hashed
```

## Environment Variables

**Frontend (`.env`):**
```
VITE_API_URL=                        # Optional: absolute API URL for production
VITE_MERCADOPAGO_INIT_POINT=         # Fallback payment link if backend unavailable
```

**Backend (`server/.env`):**
```
JWT_SECRET=                          # Required
MERCADOPAGO_ACCESS_TOKEN=            # Optional: enables dynamic payment preferences
PORT=4000                            # Optional
```

## Key Patterns

- Products are **hardcoded** in `App.jsx` — no database or API for catalog.
- Payment flow: backend creates Mercado Pago preference → returns `init_point` URL → frontend redirects user.
- Both frontend and backend use ES modules (`"type": "module"`).
- No TypeScript — pure JavaScript throughout.
