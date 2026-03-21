# Bronza Club — API

## Arranque

1. Copiá el ejemplo de entorno:

   ```bash
   copy .env.example .env
   ```

   En macOS/Linux: `cp .env.example .env`

2. Editá `.env` y definí al menos **`JWT_SECRET`** (texto largo y aleatorio).

3. Opcional — cobro dinámico con el carrito:

   - Obtené **Access Token** en [Credenciales Mercado Pago](https://www.mercadopago.com.ar/developers/panel/credentials).
   - Pegalo en `MERCADOPAGO_ACCESS_TOKEN`.

4. Instalá dependencias e iniciá:

   ```bash
   npm install
   npm run dev
   ```

Por defecto escucha en **http://localhost:4000**.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del servidor |
| POST | `/api/auth/register` | `{ name, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | Header `Authorization: Bearer <token>` |
| POST | `/api/payments/preference` | Requiere auth. Body `{ items: [{ id?, title, quantity, unit_price }] }` → `{ init_point }` |

Los usuarios se guardan en **`server/data/users.json`** (no subir a git).

## Front (Vite)

Con el proxy del proyecto raíz, las peticiones a `/api` van a este servidor en desarrollo.

Desde la raíz del monorepo:

```bash
npm run dev:all
```

Levanta Vite + API a la vez.
