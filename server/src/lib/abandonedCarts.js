import { Cart } from '../models/Cart.js'
import { sendAbandonedCartEmail, isEmailConfigured } from './email.js'

function appBaseUrl() {
  return (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '')
}

/**
 * Busca carritos abandonados y envía un único recordatorio a cada uno.
 *
 * Un carrito es "abandonado" cuando:
 *  - está en estado `active`
 *  - tiene al menos un producto
 *  - tiene email asociado (si no hay email, no se envía nada)
 *  - no está dado de baja
 *  - nunca recibió un recordatorio (`reminderSentAt` nulo)
 *  - pasaron ABANDONED_CART_HOURS (2 por defecto) sin actividad
 *
 * Es seguro llamarla varias veces: `reminderSentAt` evita duplicados.
 */
export async function processAbandonedCarts({ dryRun = false, max = 50 } = {}) {
  const hours = Number(process.env.ABANDONED_CART_HOURS) || 2
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)

  const carts = await Cart.find({
    status: 'active',
    reminderSentAt: null,
    unsubscribed: false,
    email: { $nin: ['', null] },
    'items.0': { $exists: true },
    lastActivityAt: { $lte: cutoff },
  })
    .sort({ lastActivityAt: 1 })
    .limit(max)

  const summary = {
    hours,
    candidates: carts.length,
    sent: 0,
    errors: 0,
    skipped: 0,
    emailConfigured: isEmailConfigured(),
    details: [],
  }

  if (carts.length === 0) return summary

  if (!isEmailConfigured()) {
    summary.skipped = carts.length
    summary.reason =
      'RESEND_API_KEY no configurada: no se enviaron correos (modo seguro).'
    summary.details = carts.map((cart) => ({
      id: cart.id,
      email: cart.email,
      status: 'skipped',
    }))
    return summary
  }

  const base = appBaseUrl()

  for (const cart of carts) {
    if (dryRun) {
      summary.details.push({
        id: cart.id,
        email: cart.email,
        items: cart.itemCount,
        status: 'dry-run',
      })
      continue
    }

    const recoveryUrl = `${base}/carrito?recover=${cart.recoveryToken}`
    const unsubscribeUrl = `${base}/carrito?unsubscribe=${cart.unsubscribeToken}`

    const result = await sendAbandonedCartEmail({
      to: cart.email,
      cart,
      recoveryUrl,
      unsubscribeUrl,
    })

    if (result.ok) {
      cart.reminderSentAt = new Date()
      cart.reminderCount += 1
      await cart.save()
      summary.sent += 1
      summary.details.push({
        id: cart.id,
        email: cart.email,
        status: 'sent',
        providerId: result.id,
      })
    } else {
      summary.errors += 1
      summary.details.push({
        id: cart.id,
        email: cart.email,
        status: 'error',
        error: result.error || result.reason,
      })
      console.error(
        `[abandoned-cart] Error al enviar a ${cart.email} (${cart.id}):`,
        result.error || result.reason,
      )
    }
  }

  return summary
}
