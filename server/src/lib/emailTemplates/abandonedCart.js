/**
 * Plantilla del recordatorio de carrito abandonado — estética Bronza.
 * Fondo marrón profundo cálido, tipografía serif, hairlines, mucho aire y
 * acentos blush. Tablas + estilos inline para compatibilidad con clientes de correo.
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

function renderItemRows(item) {
  const image =
    typeof item.image === 'string' && item.image.trim()
      ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" width="72" height="90" style="display:block;width:72px;height:90px;object-fit:cover;border-radius:8px;background:${C.hair};" />`
      : `<div style="width:72px;height:90px;border-radius:8px;background:${C.panel};color:${C.nude};font-family:${SANS};font-size:8px;letter-spacing:1px;text-transform:uppercase;text-align:center;line-height:90px;">Sin foto</div>`

  const options = opts(item)

  return `
    <tr>
      <td width="72" valign="middle" style="padding:18px 0;">${image}</td>
      <td valign="middle" style="padding:18px 8px 18px 16px;">
        <p style="margin:0;font-family:${SANS};font-size:13px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:${C.cream};">${esc(item.name)}</p>
        ${options ? `<p style="margin:6px 0 0;font-family:${SANS};font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:${C.nude};">${esc(options)}</p>` : ''}
        <p style="margin:6px 0 0;font-family:${SANS};font-size:11px;color:${C.nude};">Cantidad: ${esc(item.qty)}</p>
      </td>
      <td valign="middle" align="right" style="padding:18px 0;">
        <p style="margin:0;font-family:${SERIF};font-size:16px;color:${C.pink};">${money(Number(item.price) * Number(item.qty))}</p>
      </td>
    </tr>
    <tr>
      <td colspan="3" style="border-bottom:1px solid ${C.hair};font-size:0;line-height:0;">&nbsp;</td>
    </tr>`
}

export function renderAbandonedCartEmail({ cart, recoveryUrl, unsubscribeUrl }) {
  const items = Array.isArray(cart.items) ? cart.items : []
  const total = items.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.qty || 0),
    0,
  )
  const count = items.reduce((acc, item) => acc + Number(item.qty || 0), 0)

  const subject = '🤎 ¡Te quedaron unas bikinis esperándote!'
  const preheader =
    'Tu verano te está esperando. Volvé a tu carrito y completá tu compra.'

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
        .btn a { display: block !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:${C.bg};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
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
                  ¡Te quedó algo<br />lindo por acá!
                </h1>
                <p style="margin:18px 0 0;font-family:${SANS};font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.nude};">Tu verano te está esperando</p>
              </td>
            </tr>

            <!-- Mensaje -->
            <tr>
              <td class="px" style="padding:40px 40px 0;">
                <p style="margin:0;font-family:${SERIF};font-size:20px;color:${C.cream};">Hola, reina 🤎</p>
                <p style="margin:16px 0 0;font-family:${SANS};font-size:14px;line-height:1.85;color:${C.soft};">
                  Vimos que dejaste algunas de tus bikinis favoritas en el carrito y no queremos que te quedes sin ellas.
                </p>
                <p style="margin:12px 0 0;font-family:${SANS};font-size:14px;line-height:1.85;color:${C.soft};">
                  Tu próximo look de verano está a un pasito de ser tuyo. 🌊
                </p>
              </td>
            </tr>

            <!-- Productos -->
            <tr>
              <td class="px" style="padding:36px 40px 0;">
                <p style="margin:0 0 2px;font-family:${SANS};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.nude};">
                  Tu selección · ${esc(count)} ${count === 1 ? 'prenda' : 'prendas'}
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${items.map(renderItemRows).join('')}
                  <tr>
                    <td style="padding:18px 0 0;font-family:${SANS};font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${C.nude};">Total</td>
                    <td></td>
                    <td align="right" style="padding:14px 0 0;font-family:${SERIF};font-size:24px;color:${C.cream};">${money(total)}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td class="px" align="center" style="padding:40px 40px 0;">
                <p style="margin:0 0 8px;font-family:${SERIF};font-size:20px;color:${C.cream};">Tu verano te está esperando</p>
                <p style="margin:0 0 26px;font-family:${SANS};font-size:13px;line-height:1.7;color:${C.nude};">Volvé a tu carrito y completá tu compra.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" align="center" class="btn">
                  <tr>
                    <td align="center" style="background-color:${C.pink};border-radius:999px;">
                      <a href="${esc(recoveryUrl)}" style="display:inline-block;padding:16px 44px;font-family:${SANS};font-size:12px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:${C.brown};text-decoration:none;">
                        Volver a mi carrito
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Despedida -->
            <tr>
              <td class="px" align="center" style="padding:44px 40px 0;">
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
                  Recibís este correo porque tenías productos pendientes en tu carrito de Bronza.<br />
                  <a href="${esc(unsubscribeUrl)}" style="color:${C.nude};text-decoration:underline;">No quiero recibir más recordatorios</a>
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
    '¡Te quedó algo lindo por acá!',
    'Tu verano te está esperando.',
    '',
    'Hola, reina 🤎',
    'Vimos que dejaste algunas de tus bikinis favoritas en el carrito y no queremos que te quedes sin ellas.',
    'Tu próximo look de verano está a un pasito de ser tuyo. 🌊',
    '',
    ...items.map(
      (item) =>
        `${item.name} x${item.qty}${opts(item) ? ` (${opts(item)})` : ''} — ${money(Number(item.price) * Number(item.qty))}`,
    ),
    '',
    `Total: ${money(total)}`,
    '',
    'Volvé a tu carrito y completá tu compra:',
    recoveryUrl,
    '',
    'Con amor, Bronza 🤎',
    'Bronzate. Brilla. Viví.',
    '',
    `No quiero recibir más recordatorios: ${unsubscribeUrl}`,
  ]

  return { subject, html, text: textLines.join('\n') }
}
