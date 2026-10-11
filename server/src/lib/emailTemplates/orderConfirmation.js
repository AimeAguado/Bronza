/**
 * Plantilla del correo de confirmación de compra — estética Bronza.
 * Mismo lenguaje visual que el recordatorio de carrito: fondo marrón profundo
 * cálido, serif, hairlines y acentos blush. Tablas + estilos inline.
 */

const C = {
  bg: '#1C1408',
  panel: '#251A0C',
  hair: '#362814',
  brown: '#291E08',
  nude: '#A99A8B',
  soft: '#CFC5B8',
  cream: '#F4EDE2',
  pink: '#DE8BBD',
}

const LOGO_URL =
  'https://res.cloudinary.com/dhkhgloxn/image/upload/c_crop,x_140,y_504,w_758,h_68/c_scale,w_440,q_auto,f_jpg/v1791660457/bronza/email/logo-bronza.jpg'

const SERIF = "Georgia,'Times New Roman',serif"
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif"

function money(value) {
  const n = Number(value) || 0
  return `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function opts(item) {
  return [item.color, item.size].filter(Boolean).join(' / ')
}

function paymentLabel(order) {
  return order.paymentMethod === 'transfer'
    ? 'Transferencia bancaria'
    : 'Mercado Pago'
}

function renderItemRows(item) {
  const image =
    typeof item.image === 'string' && item.image.trim()
      ? `<img src="${esc(item.image)}" alt="${esc(item.title)}" width="72" height="90" style="display:block;width:72px;height:90px;object-fit:cover;border-radius:8px;background:${C.hair};" />`
      : `<div style="width:72px;height:90px;border-radius:8px;background:${C.panel};color:${C.nude};font-family:${SANS};font-size:8px;letter-spacing:1px;text-transform:uppercase;text-align:center;line-height:90px;">Sin foto</div>`

  const options = opts(item)
  const qty = Number(item.quantity || item.qty || 0)
  const unit = Number(item.unit_price ?? item.price ?? 0)

  return `
    <tr>
      <td width="72" valign="middle" style="padding:18px 0;">${image}</td>
      <td valign="middle" style="padding:18px 8px 18px 16px;">
        <p style="margin:0;font-family:${SANS};font-size:13px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:${C.cream};">${esc(item.name || item.title)}</p>
        ${options ? `<p style="margin:6px 0 0;font-family:${SANS};font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${C.nude};">${esc(options)}</p>` : ''}
        <p style="margin:6px 0 0;font-family:${SANS};font-size:11px;color:${C.nude};">Cantidad: ${esc(qty)}</p>
      </td>
      <td valign="middle" align="right" style="padding:18px 0;">
        <p style="margin:0;font-family:${SERIF};font-size:16px;color:${C.pink};">${money(unit * qty)}</p>
      </td>
    </tr>
    <tr>
      <td colspan="3" style="border-bottom:1px solid ${C.hair};font-size:0;line-height:0;">&nbsp;</td>
    </tr>`
}

export function renderOrderConfirmationEmail({ order }) {
  const items = Array.isArray(order.items) ? order.items : []
  const total =
    Number(order.total) ||
    items.reduce(
      (acc, item) =>
        acc +
        Number(item.unit_price ?? item.price ?? 0) *
          Number(item.quantity ?? item.qty ?? 0),
      0,
    )
  const number = order.number ? `#${order.number}` : ''
  const payment = paymentLabel(order)
  const delivery = order.delivery || 'A coordinar'

  const subject = '¡Gracias por tu compra! 🤎'

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <meta name="supported-color-schemes" content="dark light" />
    <title>${esc(subject)}</title>
    <style>
      @media (max-width: 620px) {
        .container { width: 100% !important; }
        .px { padding-left: 26px !important; padding-right: 26px !important; }
        .hero-title { font-size: 26px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:${C.bg};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};">
      <tr>
        <td align="center" style="padding:0;">
          <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background-color:${C.bg};">

            <!-- Logo -->
            <tr>
              <td class="px" align="center" style="padding:46px 40px 0;">
                <img src="${LOGO_URL}" alt="Bronza" width="150" style="display:block;width:150px;max-width:52%;height:auto;margin:0 auto;" />
                <p style="margin:16px 0 0;font-family:${SANS};font-size:9px;letter-spacing:6px;text-transform:uppercase;color:${C.nude};">Temporada 2027</p>
              </td>
            </tr>

            <!-- Hairline rosa -->
            <tr>
              <td align="center" style="padding:30px 0 0;">
                <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td width="34" height="1" style="background-color:${C.pink};font-size:0;line-height:0;">&nbsp;</td>
                </tr></table>
              </td>
            </tr>

            <!-- Hero -->
            <tr>
              <td class="px" align="center" style="padding:26px 40px 0;">
                <h1 class="hero-title" style="margin:0;font-family:${SERIF};font-size:30px;line-height:1.24;font-weight:normal;color:${C.cream};">
                  ¡Gracias por tu compra!
                </h1>
                <p style="margin:18px 0 0;font-family:${SANS};font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.nude};">Tu pedido ya está confirmado</p>
              </td>
            </tr>

            <!-- Mensaje -->
            <tr>
              <td class="px" style="padding:40px 40px 0;">
                <p style="margin:0;font-family:${SERIF};font-size:20px;color:${C.cream};">Hola, reina ☀️</p>
                <p style="margin:16px 0 0;font-family:${SANS};font-size:14px;line-height:1.85;color:${C.soft};">
                  ¡Tu pedido ya está confirmado! Nos encanta que hayas elegido Bronza para acompañarte en tus días de sol.
                </p>
                <p style="margin:12px 0 0;font-family:${SANS};font-size:14px;line-height:1.85;color:${C.soft};">
                  A continuación, te dejamos el resumen de tu compra para que tengas toda la información a mano.
                </p>
              </td>
            </tr>

            <!-- Resumen -->
            <tr>
              <td class="px" style="padding:36px 40px 0;">
                <p style="margin:0 0 12px;font-family:${SANS};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.nude};">
                  Resumen de tu pedido
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 14px;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.nude};">Número de pedido</td>
                    <td align="right" style="padding:0 0 14px;font-family:${SERIF};font-size:16px;color:${C.cream};">${esc(number)}</td>
                  </tr>
                  ${items.map(renderItemRows).join('')}
                  <tr>
                    <td style="padding:18px 0 0;font-family:${SANS};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.nude};">Total</td>
                    <td></td>
                    <td align="right" style="padding:14px 0 0;font-family:${SERIF};font-size:24px;color:${C.cream};">${money(total)}</td>
                  </tr>
                  <tr>
                    <td colspan="3" style="padding:18px 0 0;border-top:1px solid ${C.hair};font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:14px 0 0;font-family:${SANS};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.nude};">Método de pago</td>
                    <td align="right" style="padding:14px 0 0;font-family:${SANS};font-size:13px;color:${C.cream};">${esc(payment)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:10px 0 0;font-family:${SANS};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.nude};">Entrega</td>
                    <td align="right" style="padding:10px 0 0;font-family:${SANS};font-size:13px;color:${C.cream};">${esc(delivery)}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Cierre -->
            <tr>
              <td class="px" align="center" style="padding:42px 40px 0;">
                <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.8;color:${C.soft};">
                  Si tu pedido requiere alguna confirmación adicional, nos pondremos en contacto con vos.
                </p>
                <p style="margin:18px 0 0;font-family:${SANS};font-size:13px;line-height:1.8;color:${C.soft};">
                  Gracias por confiar en nosotras y ser parte de esta nueva temporada. ✨
                </p>
              </td>
            </tr>

            <!-- Despedida -->
            <tr>
              <td class="px" align="center" style="padding:42px 40px 0;">
                <p style="margin:0;font-family:${SERIF};font-size:16px;color:${C.cream};">Con amor, Bronza 🤎</p>
                <p style="margin:10px 0 0;font-family:${SANS};font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.nude};">Bronzate · Brilla · Viví</p>
              </td>
            </tr>

            <!-- Pie -->
            <tr>
              <td class="px" align="center" style="padding:40px 40px 44px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="border-top:1px solid ${C.hair};font-size:0;line-height:0;">&nbsp;</td></tr>
                </table>
                <p style="margin:22px 0 0;font-family:${SANS};font-size:10px;line-height:1.8;color:${C.nude};">
                  Recibís este correo porque realizaste una compra en Bronza.
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
    'BRONZA · TEMPORADA 2027',
    '',
    'Hola, reina ☀️',
    '¡Tu pedido ya está confirmado! Nos encanta que hayas elegido Bronza para acompañarte en tus días de sol.',
    'A continuación, te dejamos el resumen de tu compra para que tengas toda la información a mano.',
    '',
    'RESUMEN DE TU PEDIDO',
    `Número de pedido: ${number}`,
    'Productos:',
    ...items.map(
      (item) =>
        `- ${item.name || item.title} x${Number(item.quantity ?? item.qty ?? 0)}${
          opts(item) ? ` (${opts(item)})` : ''
        } — ${money(
          Number(item.unit_price ?? item.price ?? 0) *
            Number(item.quantity ?? item.qty ?? 0),
        )}`,
    ),
    `Total: ${money(total)}`,
    `Método de pago: ${payment}`,
    `Entrega: ${delivery}`,
    '',
    'Si tu pedido requiere alguna confirmación adicional, nos pondremos en contacto con vos.',
    'Gracias por confiar en nosotras y ser parte de esta nueva temporada. ✨',
    '',
    'Con amor, Bronza 🤎',
    'Bronzate. Brilla. Viví.',
  ]

  return { subject, html, text: textLines.join('\n') }
}
