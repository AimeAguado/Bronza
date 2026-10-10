import { Resend } from 'resend'
import { renderAbandonedCartEmail } from './emailTemplates/abandonedCart.js'

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
