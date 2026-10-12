import { Order } from '../models/Order.js'
import '../models/User.js'
import { sendPaymentReminderEmail, isEmailConfigured } from './email.js'

/**
 * Envía un recordatorio a los pedidos por transferencia que siguen sin
 * confirmarse después de PAYMENT_REMINDER_HOURS (3 por defecto).
 *
 * Un pedido es candidato cuando:
 *  - está en `waiting_payment` (pago todavía no recibido)
 *  - nunca recibió el recordatorio (`paymentReminderSentAt` nulo)
 *  - no se envió ya el correo de pago (`paidEmailSentAt` nulo)
 *  - tiene email de usuario
 *  - pasaron PAYMENT_REMINDER_HOURS desde su creación
 *
 * Es seguro llamarla varias veces: `paymentReminderSentAt` evita duplicados.
 */
export async function processPaymentReminders({ dryRun = false, max = 50 } = {}) {
  const hours = Number(process.env.PAYMENT_REMINDER_HOURS) || 3
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)

  const orders = await Order.find({
    status: 'waiting_payment',
    paymentReminderSentAt: null,
    paidEmailSentAt: null,
    createdAt: { $lte: cutoff },
  })
    .populate('userId', 'name email')
    .sort({ createdAt: 1 })
    .limit(max)

  const summary = {
    hours,
    candidates: orders.length,
    sent: 0,
    errors: 0,
    skipped: 0,
    emailConfigured: isEmailConfigured(),
    details: [],
  }

  if (orders.length === 0) return summary

  if (!isEmailConfigured()) {
    summary.skipped = orders.length
    summary.reason =
      'RESEND_API_KEY no configurada: no se enviaron correos (modo seguro).'
    summary.details = orders.map((order) => ({
      id: order.id,
      email: order.userId?.email ?? null,
      status: 'skipped',
    }))
    return summary
  }

  for (const order of orders) {
    const email = order.userId?.email
    if (!email) {
      summary.skipped += 1
      summary.details.push({ id: order.id, email: null, status: 'no-email' })
      continue
    }

    if (dryRun) {
      summary.details.push({
        id: order.id,
        email,
        number: order.number,
        status: 'dry-run',
      })
      continue
    }

    const result = await sendPaymentReminderEmail({
      to: email,
      order,
      name: order.userId?.name,
    })

    if (result.ok) {
      order.paymentReminderSentAt = new Date()
      await order.save()
      summary.sent += 1
      summary.details.push({
        id: order.id,
        email,
        number: order.number,
        status: 'sent',
        providerId: result.id,
      })
    } else {
      summary.errors += 1
      summary.details.push({
        id: order.id,
        email,
        number: order.number,
        status: 'error',
        error: result.error || result.reason,
      })
      console.error(
        `[payment-reminder] Error al enviar a ${email} (${order.id}):`,
        result.error || result.reason,
      )
    }
  }

  return summary
}
