/**
 * Plantilla del recordatorio de carrito abandonado.
 * Tablas + estilos inline para máxima compatibilidad con los clientes de correo.
 * Identidad Bronza: fondo marrón #291E0C, nude rosado #9C8580, rosa #DE8BBD.
 */

const COLORS = {
  bg: '#291E0C',
  card: '#33260F',
  border: '#4A3A1E',
  nude: '#9C8580',
  cream: '#F3E9DC',
  pink: '#DE8BBD',
  dark: '#291E0C',
}

function formatMoney(value) {
  const n = Number(value) || 0
  return `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function optionsText(item) {
  return [item.color, item.size].filter(Boolean).join(' / ')
}

function renderItem(item) {
  const image = typeof item.image === 'string' && item.image.trim()
    ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" width="80" height="100" style="display:block;width:80px;height:100px;object-fit:cover;border-radius:10px;background:${COLORS.border};" />`
    : `<div style="width:80px;height:100px;border-radius:10px;background:${COLORS.border};color:${COLORS.nude};font-family:Arial,sans-serif;font-size:9px;letter-spacing:1px;text-transform:uppercase;text-align:center;line-height:100px;">Sin foto</div>`

  const opts = optionsText(item)

  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${COLORS.border};" valign="top" width="80">
        ${image}
      </td>
      <td style="padding:12px 0 12px 16px;border-bottom:1px solid ${COLORS.border};" valign="middle">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;letter-spacing:0.5px;text-transform:uppercase;color:${COLORS.cream};">${escapeHtml(item.name)}</p>
        ${opts ? `<p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${COLORS.nude};">${escapeHtml(opts)}</p>` : ''}
        <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${COLORS.nude};">Cantidad: ${escapeHtml(item.qty)}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid ${COLORS.border};text-align:right;" valign="middle">
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:${COLORS.pink};">${formatMoney(Number(item.price) * Number(item.qty))}</p>
      </td>
    </tr>`
}

export function renderAbandonedCartEmail({ cart, recoveryUrl, unsubscribeUrl }) {
  const items = Array.isArray(cart.items) ? cart.items : []
  const total = items.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.qty || 0),
    0,
  )

  const subject = '🤎 ¡Te quedaron unas bikinis esperándote!'

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <title>${escapeHtml(subject)}</title>
    <style>
      @media (max-width: 600px) {
        .container { width: 100% !important; }
        .px { padding-left: 20px !important; padding-right: 20px !important; }
        .btn a { display: block !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:${COLORS.bg};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bg};">
      <tr>
        <td align="center" style="padding:28px 12px;">
          <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:8px;text-transform:uppercase;color:${COLORS.cream};">Bronza</p>
                <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${COLORS.pink};">Bronzate · Brilla · Viví</p>
              </td>
            </tr>

            <tr>
              <td class="px" style="background-color:${COLORS.card};border:1px solid ${COLORS.border};border-radius:18px;padding:36px 40px;">
                <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.3;color:${COLORS.cream};">¡Hola, reina! ☀️</h1>
                <p style="margin:18px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${COLORS.nude};">
                  Vimos que dejaste algunas de tus bikinis favoritas en el carrito y no queremos que te quedes sin ellas.
                </p>
                <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:${COLORS.nude};">
                  Tu próximo look de verano está a un pasito de ser tuyo. 🌊
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                  ${items.map(renderItem).join('')}
                  <tr>
                    <td style="padding-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${COLORS.nude};">Total</td>
                    <td></td>
                    <td style="padding-top:18px;text-align:right;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;color:${COLORS.cream};">${formatMoney(total)}</td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:30px;">
                  <tr>
                    <td align="center" class="btn">
                      <a href="${escapeHtml(recoveryUrl)}" style="display:inline-block;background-color:${COLORS.pink};color:${COLORS.dark};font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:16px 40px;border-radius:999px;">
                        Volver a mi carrito
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:${COLORS.nude};">
                  Con amor, Bronza 🤎<br />
                  <span style="color:${COLORS.cream};">Bronzate. Brilla. Viví.</span>
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:22px 20px 0;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:${COLORS.nude};">
                  Recibís este correo porque tenías productos pendientes en tu carrito de Bronza.
                </p>
                <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:${COLORS.nude};">
                  <a href="${escapeHtml(unsubscribeUrl)}" style="color:${COLORS.pink};text-decoration:underline;">No quiero recibir más recordatorios</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  const textLines = [
    '¡Hola, reina! ☀️',
    '',
    'Vimos que dejaste algunas de tus bikinis favoritas en el carrito y no queremos que te quedes sin ellas.',
    'Tu próximo look de verano está a un pasito de ser tuyo. 🌊',
    '',
    ...items.map(
      (item) =>
        `${item.name} x${item.qty}${
          optionsText(item) ? ` (${optionsText(item)})` : ''
        } — ${formatMoney(Number(item.price) * Number(item.qty))}`,
    ),
    '',
    `Total: ${formatMoney(total)}`,
    '',
    `Volvé a tu carrito: ${recoveryUrl}`,
    '',
    'Con amor, Bronza 🤎',
    'Bronzate. Brilla. Viví.',
    '',
    `No quiero recibir más recordatorios: ${unsubscribeUrl}`,
  ]

  return { subject, html, text: textLines.join('\n') }
}
