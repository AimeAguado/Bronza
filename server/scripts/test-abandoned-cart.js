/**
 * Verificación local del flujo de carritos abandonados.
 *
 * Requiere que la API esté corriendo y que server/.env tenga MONGODB_URI,
 * JWT_SECRET y CRON_SECRET.
 *
 *   node server/scripts/test-abandoned-cart.js
 *
 * Ejercita: sync → identificación por email → detección (dryRun) →
 * recuperación → baja. No envía correos reales (usa dryRun).
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

const API = process.env.API_BASE || `http://localhost:${process.env.PORT || 4000}`
const CRON_SECRET = process.env.CRON_SECRET?.trim()
const JWT_SECRET = process.env.JWT_SECRET?.trim()

const TOKEN = `test-${Date.now()}abcdef0123456789`

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`)
  } else {
    console.error(`  ✗ ${label}`)
    process.exitCode = 1
  }
}

async function json(res) {
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body }
}

async function main() {
  if (!CRON_SECRET) throw new Error('Falta CRON_SECRET en server/.env')
  if (!JWT_SECRET) throw new Error('Falta JWT_SECRET en server/.env')

  const items = [
    {
      id: 'prod-test-1-Rosa-M',
      productId: '',
      name: 'Bikini Test',
      price: 25000,
      qty: 2,
      image: 'https://example.com/bikini.jpg',
      color: 'Rosa',
      size: 'M',
    },
  ]

  console.log('\n1) Sync anónimo del carrito')
  let r = await json(
    await fetch(`${API}/api/cart/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: TOKEN, items }),
    }),
  )
  assert(r.status === 200 && r.body.ok, 'el carrito se guarda sin sesión')

  console.log('\n2) Identificación con email (login)')
  const fakeUserId = new mongoose.Types.ObjectId()
  const jwtToken = jwt.sign(
    { sub: fakeUserId.toString(), email: 'test@bronza.local', name: 'Test', role: 'user' },
    JWT_SECRET,
    { expiresIn: '1h' },
  )
  r = await json(
    await fetch(`${API}/api/cart/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ token: TOKEN, identify: true }),
    }),
  )
  assert(r.status === 200 && r.body.ok, 'se asocia el email al carrito')

  console.log('\n3) Detección como abandonado (dryRun)')
  await mongoose.connect(process.env.MONGODB_URI)
  const Cart = mongoose.connection.collection('carts')
  await Cart.updateOne(
    { token: TOKEN },
    { $set: { lastActivityAt: new Date(Date.now() - 3 * 60 * 60 * 1000) } },
  )
  r = await json(
    await fetch(`${API}/api/cron/abandoned-carts?dryRun=1`, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
    }),
  )
  const detected = r.body.details?.some((d) => d.email === 'test@bronza.local')
  assert(r.status === 200 && r.body.ok, 'el cron responde OK')
  assert(detected, 'el carrito aparece como candidato')
  assert(r.body.sent === 0, 'dryRun no envía correos')

  console.log('\n4) Sin secreto de cron debe fallar')
  r = await json(await fetch(`${API}/api/cron/abandoned-carts?dryRun=1`))
  assert(r.status === 401, 'sin CRON_SECRET responde 401')

  console.log('\n5) Recuperación del carrito')
  const doc = await Cart.findOne({ token: TOKEN })
  r = await json(await fetch(`${API}/api/cart/recover/${doc.recoveryToken}`))
  assert(r.status === 200 && Array.isArray(r.body.items), 'devuelve los items')
  assert(r.body.items?.[0]?.name === 'Bikini Test', 'los items son correctos')
  const after = await Cart.findOne({ token: TOKEN })
  assert(after.status === 'recovered', 'queda en estado recovered (no completado)')

  console.log('\n6) Baja de recordatorios')
  r = await json(
    await fetch(`${API}/api/cart/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: doc.unsubscribeToken }),
    }),
  )
  assert(r.status === 200 && r.body.ok, 'la baja responde OK')
  const unsub = await Cart.findOne({ token: TOKEN })
  assert(unsub.unsubscribed === true, 'el carrito queda dado de baja')

  console.log('\n7) Limpieza')
  await Cart.deleteMany({ token: TOKEN })
  console.log('  ✓ datos de prueba eliminados')

  await mongoose.disconnect()
}

main().catch(async (e) => {
  console.error('\nError en la verificación:', e.message)
  try {
    await mongoose.disconnect()
  } catch {
    /* ignorar */
  }
  process.exit(1)
})
