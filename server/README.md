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
| POST | `/api/payments/preference` | Requiere auth. Body `{ items: [{ id?, title, quantity, unit_price }], cartToken? }` → `{ init_point }` |
| POST | `/api/cart/sync` | Guarda el carrito. Body `{ token, items, identify? }`. Auth opcional (asocia email si hay sesión) |
| GET | `/api/cart/recover/:token` | Recupera un carrito desde el enlace del correo (valida stock/precio) |
| POST | `/api/cart/unsubscribe` | Body `{ token }` → da de baja los recordatorios |
| GET | `/api/cron/abandoned-carts` | Tarea programada. Header `Authorization: Bearer <CRON_SECRET>`. `?dryRun=1` no envía |

Los datos (usuarios, productos, pedidos y carritos) se guardan en **MongoDB**
(`MONGODB_URI`).

## Recordatorio de carritos abandonados

Cuando una clienta agrega productos y no completa la compra, el backend le
envía **un único** correo recordatorio con un enlace para retomar el carrito.

**Cómo funciona**

1. El front sincroniza el carrito a `POST /api/cart/sync` (token anónimo en
   localStorage). Si hay sesión, se asocia el email del usuario.
2. La tarea programada (`GET /api/cron/abandoned-carts`) busca carritos
   `active`, con email, sin recordatorio previo y sin actividad desde hace
   `ABANDONED_CART_HOURS` (2 por defecto).
3. Envía el correo con Resend y marca `reminderSentAt` → nunca reenvía al mismo
   carrito. Si la compra se aprueba, el carrito pasa a `completed`.
4. El enlace `…/carrito?recover=<token>` vuelve a cargar los productos
   (revalidando disponibilidad y precio). El enlace `?unsubscribe=<token>` da de
   baja los recordatorios de ese email.

### Variables de entorno (además de las de arriba)

```
RESEND_API_KEY=            # API key de Resend (nunca subir al repo)
EMAIL_FROM=Bronza <onboarding@resend.dev>
EMAIL_REPLY_TO=            # opcional
ABANDONED_CART_HOURS=2
CRON_SECRET=<openssl rand -hex 32>
```

Si `RESEND_API_KEY` no está definida, el envío se **omite de forma segura**
(se registra en el log) y no se marca nada como enviado.

### Configurar Resend

1. Creá una cuenta en [resend.com](https://resend.com) y una **API Key**.
2. Pegala en `RESEND_API_KEY`. Para pruebas podés usar
   `EMAIL_FROM=Bronza <onboarding@resend.dev>` (solo envía a tu propio email).
3. Para enviar a cualquier destinatario, verificá tu dominio en Resend
   (Dominios → Add Domain) y cargá los registros DNS que te indica. Luego usá
   `EMAIL_FROM=Bronza <hola@tudominio.com>`.

### Cron en Vercel

`server/vercel.json` ya declara el cron **diario** (`0 15 * * *`), compatible
con el plan Hobby. Recordá:

- Definí `CRON_SECRET` en las variables de entorno del proyecto de Vercel. Vercel
  Cron envía automáticamente `Authorization: Bearer <CRON_SECRET>`.
- En plan **Pro** podés cambiar la frecuencia a horaria: `"schedule": "0 * * * *"`.
- En plan **Hobby** (solo permite un cron diario) si querés frecuencia horaria,
  usá un servicio externo (ej. cron-job.org) que haga `GET` a
  `https://tu-api.vercel.app/api/cron/abandoned-carts` con el header
  `Authorization: Bearer <CRON_SECRET>`.

### Probar el envío

Con la API corriendo y `server/.env` completo:

```bash
# Verificación sin enviar correos (recomendado)
node scripts/test-abandoned-cart.js

# Forzar la tarea manualmente (no envía, solo informa)
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:4100/api/cron/abandoned-carts?dryRun=1"

# Enviar de verdad (necesita RESEND_API_KEY): quitá ?dryRun=1
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:4100/api/cron/abandoned-carts"
```

## Front (Vite)

Con el proxy del proyecto raíz, las peticiones a `/api` van a este servidor en desarrollo.

Desde la raíz del monorepo:

```bash
npm run dev:all
```

Levanta Vite + API a la vez.
