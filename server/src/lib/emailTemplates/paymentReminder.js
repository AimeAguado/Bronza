/**
 * Plantilla del correo de recordatorio de pago (pedido por transferencia que
 * sigue sin confirmarse después de N horas). Misma estética Bronza.
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

export function renderPaymentReminderEmail({ order, name, whatsappUrl }) {
  const number = order.number ? `#${order.number}` : '—'
  const greeting = firstName(name || order.userId?.name)
  const wa = whatsappUrl || 'https://wa.me/5491100000000'

  const subject = 'Todavía no pudimos confirmar tu pago 🤎'

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
                  Todavía no pudimos<br/>confirmar tu pago
                </h1>
                <p style="margin:18px 0 0;font-family:${SANS};font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.nude};">Pedido ${esc(number)}</p>
              </td>
            </tr>

            <!-- Mensaje -->
            <tr>
              <td class="px" style="padding:40px 40px 0;">
                <p style="margin:0;font-family:${SERIF};font-size:20px;color:${C.cream};">Hola, ${greeting ? esc(greeting) : ''} 🤎</p>
                <p style="margin:16px 0 0;font-family:${SANS};font-size:14px;line-height:1.85;color:${C.soft};">
                  Recibimos tu pedido ${esc(number)}, pero todavía no pudimos confirmar tu pago.
                </p>
                <p style="margin:12px 0 0;font-family:${SANS};font-size:14px;line-height:1.85;color:${C.soft};">
                  Para continuar con tu compra, recordá realizar la transferencia y enviarnos el comprobante por WhatsApp para que podamos verificarla y comenzar a preparar tu pedido.
                </p>
                <p style="margin:12px 0 0;font-family:${SANS};font-size:14px;line-height:1.85;color:${C.soft};">
                  ¿Tuviste algún inconveniente al realizar el pago? ¡No te preocupes! Escribinos por WhatsApp y te ayudamos. 💌
                </p>
              </td>
            </tr>

            <!-- Botón WhatsApp -->
            <tr>
              <td class="px" align="center" style="padding:34px 40px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                  <td align="center" style="background-color:${C.pink};border-radius:999px;">
                    <a href="${esc(wa)}" style="display:inline-block;padding:15px 30px;font-family:${SANS};font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${C.brown};text-decoration:none;">
                      Escribinos por WhatsApp
                    </a>
                  </td>
                </tr></table>
                <p style="margin:14px 0 0;font-family:${SANS};font-size:11px;line-height:1.7;color:${C.nude};">
                  Confirmá tu pago o resolvé cualquier duda.
                </p>
              </td>
            </tr>

            <!-- Cierre -->
            <tr>
              <td class="px" align="center" style="padding:42px 40px 0;">
                <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.8;color:${C.soft};">
                  Gracias por elegir Bronza. Queremos que tu compra sea el comienzo de muchos momentos lindos bajo el sol. 🌊
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
    `Recibimos tu pedido ${number}, pero todavía no pudimos confirmar tu pago.`,
    'Para continuar con tu compra, recordá realizar la transferencia y enviarnos el comprobante por WhatsApp para que podamos verificarla y comenzar a preparar tu pedido.',
    '¿Tuviste algún inconveniente al realizar el pago? ¡No te preocupes! Escribinos por WhatsApp y te ayudamos. 💌',
    '',
    `Escribinos por WhatsApp para confirmar tu pago o resolver cualquier duda: ${wa}`,
    '',
    'Gracias por elegir Bronza. Queremos que tu compra sea el comienzo de muchos momentos lindos bajo el sol. 🌊',
    '',
    'Con amor, Bronza 🤎',
    'Bronzate. Brilla. Viví.',
  ]

  return { subject, html, text: textLines.join('\n') }
}
