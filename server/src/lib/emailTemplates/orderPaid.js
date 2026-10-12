/**
 * Plantilla del correo "¡Ya recibimos tu pago!". Se envía cuando el pedido
 * pasa a un estado de pago realizado (approved/shipped/delivered).
 * Misma estética que el resto de los correos Bronza.
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

function firstName(name) {
  const clean = String(name ?? '').trim()
  return clean ? clean.split(/\s+/)[0] : ''
}

export function renderOrderPaidEmail({ order, name }) {
  const total =
    Number(order.total) ||
    (Array.isArray(order.items) ? order.items : []).reduce(
      (acc, item) =>
        acc +
        Number(item.unit_price ?? item.price ?? 0) *
          Number(item.quantity ?? item.qty ?? 0),
      0,
    )
  const number = order.number ? `#${order.number}` : '—'
  const delivery = order.delivery || 'A coordinar'
  const greeting = firstName(name || order.userId?.name)

  const subject = '¡Ya recibimos tu pago! ☀️'

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
                  ¡Ya recibimos tu pago! ☀️
                </h1>
                <p style="margin:18px 0 0;font-family:${SANS};font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.nude};">Tu pedido está en preparación</p>
              </td>
            </tr>

            <!-- Mensaje -->
            <tr>
              <td class="px" style="padding:40px 40px 0;">
                <p style="margin:0;font-family:${SERIF};font-size:20px;color:${C.cream};">Hola, ${greeting ? esc(greeting) : ''} 🤎</p>
                <p style="margin:16px 0 0;font-family:${SANS};font-size:14px;line-height:1.85;color:${C.soft};">
                  ¡Tu pago fue confirmado y ya estamos preparando tu pedido con mucho amor!
                </p>
                <p style="margin:12px 0 0;font-family:${SANS};font-size:14px;line-height:1.85;color:${C.soft};">
                  Gracias por elegir Bronza para acompañarte en tus días de sol. Muy pronto vas a tener tus bikinis listos para disfrutar el verano. 🌊
                </p>
              </td>
            </tr>

            <!-- Resumen -->
            <tr>
              <td class="px" style="padding:36px 40px 0;">
                <p style="margin:0 0 12px;font-family:${SANS};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.nude};">
                  Resumen de tu compra
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:0 0 14px;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.nude};">Pedido</td>
                    <td align="right" style="padding:0 0 14px;font-family:${SERIF};font-size:16px;color:${C.cream};">${esc(number)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:0 0 14px;border-top:1px solid ${C.hair};font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 14px;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.nude};">Total abonado</td>
                    <td align="right" style="padding:0 0 14px;font-family:${SERIF};font-size:18px;color:${C.pink};">${money(total)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding:0;border-top:1px solid ${C.hair};font-size:0;line-height:0;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding:14px 0 0;font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.nude};">Entrega</td>
                    <td align="right" style="padding:14px 0 0;font-family:${SANS};font-size:13px;color:${C.cream};">${esc(delivery)}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Cierre -->
            <tr>
              <td class="px" align="center" style="padding:42px 40px 0;">
                <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.8;color:${C.soft};">
                  Te vamos a mantener al tanto de las novedades de tu pedido. ✨
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
    `Hola, ${greeting || ''} 🤎`,
    '¡Tu pago fue confirmado y ya estamos preparando tu pedido con mucho amor!',
    'Gracias por elegir Bronza para acompañarte en tus días de sol. Muy pronto vas a tener tus bikinis listos para disfrutar el verano. 🌊',
    '',
    'RESUMEN DE TU COMPRA',
    `Pedido: ${number}`,
    `Total abonado: ${money(total)}`,
    `Entrega: ${delivery}`,
    '',
    'Te vamos a mantener al tanto de las novedades de tu pedido. ✨',
    '',
    'Con amor, Bronza 🤎',
    'Bronzate. Brilla. Viví.',
  ]

  return { subject, html, text: textLines.join('\n') }
}
