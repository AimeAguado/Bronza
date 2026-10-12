import { Resend } from 'resend'
import { renderAbandonedCartEmail } from './emailTemplates/abandonedCart.js'
import { renderOrderConfirmationEmail } from './emailTemplates/orderConfirmation.js'
import { renderOrderPaidEmail } from './emailTemplates/orderPaid.js'
import { renderPaymentReminderEmail } from './emailTemplates/paymentReminder.js'

let client = null

function getClient() {
  const key = process.env.RESEND_API_KEY?.trim()
  if (!key) return null
  if (!client) client = new Resend(key)
  return client
}

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}

/** Número de WhatsApp de Bronza (mismo que usa el checkout). */
export function whatsappUrl(text) {
  const number = process.env.BRONZA_WHATSAPP?.trim() || '5491100000000'
  const base = `https://wa.me/${number}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

/**
 * Envía un correo ya renderizado. Nunca lanza: devuelve { ok }.
 */
async function deliver({ to, subject, html, text }) {
  if (!to) {
    return { ok: false, skipped: true, reason: 'Sin email de destino.' }
  }

  const resend = getClient()
  if (!resend) {
    return { ok: false, skipped: true, reason: 'RESEND_API_KEY no configurada.' }
  }

  const from =
    process.env.EMAIL_FROM?.trim() || 'Bronza <onboarding@resend.dev>'
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    })
    if (error) {
      return { ok: false, error: error.message || String(error) }
    }
    return { ok: true, id: data?.id ?? null }
  } catch (e) {
    return { ok: false, error: e?.message || String(e) }
  }
}

/**
 * Envía el recordatorio de carrito abandonado.
 * Nunca lanza: devuelve { ok } para poder registrar errores y evitar
 * marcar como enviado lo que en realidad falló.
 */
export async function sendAbandonedCartEmail({
  to,
  cart,
  recoveryUrl,
  unsubscribeUrl,
}) {
  if (!to) {
    return { ok: false, skipped: true, reason: 'Sin email de destino.' }
  }

  const resend = getClient()
  if (!resend) {
    return { ok: false, skipped: true, reason: 'RESEND_API_KEY no configurada.' }
  }

  const from =
    process.env.EMAIL_FROM?.trim() || 'Bronza <onboarding@resend.dev>'
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || undefined

  const { subject, html, text } = renderAbandonedCartEmail({
    cart,
    recoveryUrl,
    unsubscribeUrl,
  })

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    })
    if (error) {
      return { ok: false, error: error.message || String(error) }
    }
    return { ok: true, id: data?.id ?? null }
  } catch (e) {
    return { ok: false, error: e?.message || String(e) }
  }
}

/**
 * Envía el correo de confirmación de compra.
 * Nunca lanza: devuelve { ok } para poder registrar errores sin romper el flujo.
 */
export async function sendOrderConfirmationEmail({ to, order }) {
  const { subject, html, text } = renderOrderConfirmationEmail({ order })
  return deliver({ to, subject, html, text })
}

/**
 * Envía el correo "¡Ya recibimos tu pago!" cuando el pago fue confirmado.
 */
export async function sendOrderPaidEmail({ to, order, name }) {
  const { subject, html, text } = renderOrderPaidEmail({ order, name })
  return deliver({ to, subject, html, text })
}

/**
 * Envía el recordatorio de pago (pedido por transferencia sin confirmar).
 */
export async function sendPaymentReminderEmail({ to, order, name }) {
  const number = order?.number ? `#${order.number}` : ''
  const wa = whatsappUrl(
    `Hola! Quiero confirmar el pago de mi pedido ${number}. Les envío el comprobante.`,
  )
  const { subject, html, text } = renderPaymentReminderEmail({
    order,
    name,
    whatsappUrl: wa,
  })
  return deliver({ to, subject, html, text })
}
