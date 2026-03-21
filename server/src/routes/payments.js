import { Router } from 'express'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

/**
 * Crea una preferencia de Checkout Pro con el carrito.
 * Requiere MERCADOPAGO_ACCESS_TOKEN en .env del servidor.
 */
router.post('/preference', requireAuth, async (req, res) => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim()
  if (!accessToken) {
    return res.status(503).json({
      error:
        'Mercado Pago no configurado en el servidor (MERCADOPAGO_ACCESS_TOKEN).',
    })
  }

  const { items } = req.body || {}
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Enviá al menos un ítem.' })
  }

  const mpItems = []
  for (const raw of items) {
    const title =
      typeof raw.title === 'string' ? raw.title.trim() : ''
    const quantity = Number(raw.quantity)
    let unit_price = Number(raw.unit_price)
    if (!title || !Number.isFinite(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'Ítems inválidos (title, quantity).' })
    }
    if (!Number.isFinite(unit_price) || unit_price <= 0) {
      return res.status(400).json({ error: 'Precio unitario inválido.' })
    }
    unit_price = Math.round(unit_price * 100) / 100
    mpItems.push({
      id: String(raw.id ?? title),
      title,
      quantity: Math.floor(quantity),
      unit_price,
      currency_id: 'ARS',
    })
  }

  const success = process.env.MP_SUCCESS_URL || 'http://localhost:5173/'
  const failure = process.env.MP_FAILURE_URL || 'http://localhost:5173/'
  const pending = process.env.MP_PENDING_URL || 'http://localhost:5173/'

  try {
    const client = new MercadoPagoConfig({ accessToken })
    const preference = new Preference(client)
    const result = await preference.create({
      body: {
        items: mpItems,
        payer: {
          email: req.user.email,
          name: req.user.name,
        },
        back_urls: {
          success,
          failure,
          pending,
        },
        auto_return: 'approved',
        external_reference: `bronza-${req.user.id}-${Date.now()}`,
        metadata: {
          user_id: req.user.id,
          user_email: req.user.email,
        },
      },
    })

    const init_point = result.init_point
    if (!init_point) {
      return res.status(502).json({ error: 'Mercado Pago no devolvió init_point.' })
    }

    return res.json({
      preference_id: result.id,
      init_point,
    })
  } catch (e) {
    console.error('Mercado Pago preference error:', e)
    return res.status(502).json({
      error: 'No se pudo crear la preferencia en Mercado Pago.',
      detail: e.message,
    })
  }
})

export default router
