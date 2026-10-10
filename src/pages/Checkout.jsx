import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Check,
  Copy,
  CreditCard,
  Loader2,
  MessageCircle,
  X,
} from 'lucide-react'

import { useCart } from '../context/useCart.js'
import { useAuth } from '../hooks/useAuth.js'
import { apiUrl } from '../lib/api.js'
import Footer from '../components/Footer.jsx'

/** Respaldo si el servidor no tiene Mercado Pago o falla la preferencia */
const FALLBACK_MP_URL =
  import.meta.env.VITE_MERCADOPAGO_INIT_POINT?.trim() ?? ''

const TRANSFER_DATA = {
  titular: 'Aime Natalia Aguado Esteban',
  banco: 'Banco Provincia',
  tipoCuenta: 'Caja de ahorros en pesos',
  cbu: '0140460303620753483409',
  alias: 'Bronza.swim',
}

function formatMoney(value) {
  return `$${Number(value).toFixed(2)}`
}

function TransferRow({ label, value, copyable }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard no disponible */
    }
  }

  return (
    <div className="flex items-start justify-between gap-2 border-b border-accent-muted/30 pb-2">
      <div className="min-w-0">
        <dt className="text-[10px] font-bold uppercase tracking-widest text-text-main/50">
          {label}
        </dt>
        <dd className="mt-0.5 break-all font-semibold">{value}</dd>
      </div>
      {copyable && (
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-lg p-2 text-text-main/50 transition-colors hover:bg-accent/30 hover:text-primary"
          aria-label={`Copiar ${label}`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      )}
    </div>
  )
}

const Checkout = () => {
  const navigate = useNavigate()
  const { cart, cartToken } = useCart()
  const { token } = useAuth()

  const [payUrl, setPayUrl] = useState('')
  const [payLoading, setPayLoading] = useState(true)
  const [payError, setPayError] = useState('')
  const [testMode, setTestMode] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0)
  const itemCount = cart.reduce((acc, item) => acc + item.qty, 0)

  useEffect(() => {
    let cancelled = false

    async function loadPreference() {
      setPayLoading(true)
      setPayError('')

      if (!cart.length) {
        setPayUrl('')
        setPayLoading(false)
        return
      }

      const items = cart.map((item) => ({
        id: String(item.id),
        title: item.name,
        quantity: item.qty,
        unit_price: item.price,
        image: item.image ?? '',
        color: item.color ?? '',
        size: item.size ?? '',
      }))

      if (token) {
        try {
          const res = await fetch(apiUrl('/api/payments/preference'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items, cartToken }),
          })
          const data = await res.json().catch(() => ({}))
          if (!cancelled && res.ok && data.init_point) {
            setPayUrl(data.init_point)
            setTestMode(Boolean(data.testMode))
            setPayLoading(false)
            return
          }
          if (!cancelled && !res.ok && data.error) {
            setPayError(data.error)
          }
        } catch {
          if (!cancelled) setPayError('No se pudo contactar al servidor.')
        }
      }

      if (!cancelled && FALLBACK_MP_URL) {
        setPayUrl(FALLBACK_MP_URL)
      }
      if (!cancelled) setPayLoading(false)
    }

    loadPreference()
    return () => {
      cancelled = true
    }
  }, [token, cart, cartToken])

  const lines = cart.map((item) => {
    const opts = [item.color, item.size].filter(Boolean).join(' / ')
    return `- ${item.name} x${item.qty}${opts ? ` (${opts})` : ''}`
  }).join('\n')
  const supportMessage =
    'Hola! Consulta sobre mi pedido:\n\n' +
    lines +
    '\n\nTotal estimado: ' +
    formatMoney(total)

  const whatsappUrl =
    'https://wa.me/549XXXXXXXXX?text=' + encodeURIComponent(supportMessage)

  return (
    <div className="min-h-screen bg-background-light pt-10 px-6 pb-10 text-text-main flex flex-col">
      <div className="w-full max-w-5xl mx-auto flex-1 pt-8 pb-16">
        <header className="flex items-end justify-between gap-4 border-b border-accent-muted/40 pb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-muted">
              Bronza Club
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-black uppercase tracking-tighter">
              Finalizar compra
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:text-accent"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Seguir comprando
          </button>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-6">
            <section className="rounded-2xl border border-accent-muted/30 bg-white/60 p-6 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest">
                Tu pedido
              </h2>
              <ul
                data-testid="checkout-order-summary"
                className="mt-4 space-y-3 text-sm"
              >
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-4 border-b border-accent-muted/30 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="h-14 w-12 shrink-0 overflow-hidden rounded-lg bg-accent-muted/20">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-bold uppercase">
                          {item.name}{' '}
                          <span className="text-text-main/50">x{item.qty}</span>
                        </span>
                        {(item.color || item.size) && (
                          <span className="mt-0.5 text-[10px] uppercase tracking-wider text-text-main/40">
                            {item.color}
                            {item.color && item.size ? ' / ' : ''}
                            {item.size}
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="shrink-0 font-semibold">
                      {formatMoney(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-2xl border border-accent-muted/30 bg-white/60 p-6 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest">
                Forma de pago
              </h2>
              <p className="mt-1 text-sm text-text-main/60">
                Elegí cómo querés abonar tu compra.
              </p>

              <div className="mt-5 rounded-xl border border-[#009EE3]/30 bg-[#009EE3]/5 p-4">
                <div className="flex items-center gap-2">
                  <CreditCard
                    size={16}
                    className="text-[#009EE3]"
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#009EE3]">
                    Mercado Pago
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-main/70">
                  Tarjeta, dinero en cuenta u otros medios. Te redirigimos al
                  checkout seguro.
                </p>

                {payLoading ? (
                  <p className="mt-4 inline-flex items-center gap-2 text-sm text-text-main/60">
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Preparando pago...
                  </p>
                ) : payUrl ? (
                  <>
                    {testMode ? (
                      <div className="mt-4 rounded-xl border border-[#009EE3]/30 bg-white/60 p-4 text-sm text-text-main/80">
                        <p className="font-semibold text-text-main">
                          Modo prueba (sandbox)
                        </p>
                        <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs">
                          <li>
                            Abrí el checkout en una ventana de incógnito (evita
                            mezclar sesiones reales con la de prueba).
                          </li>
                          <li>
                            Iniciá sesión con tu cuenta de comprador de prueba
                            (no la del vendedor). La creás en{' '}
                            <a
                              href="https://www.mercadopago.com.ar/developers/panel/app"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline"
                            >
                              Tus integraciones → Cuentas de prueba
                            </a>
                            .
                          </li>
                          <li>
                            Con tarjeta de prueba: Visa{' '}
                            <code className="rounded bg-accent-muted/30 px-1">
                              4509 9535 6623 3704
                            </code>
                            , vencimiento{' '}
                            <code className="rounded bg-accent-muted/30 px-1">
                              11/30
                            </code>
                            , CVV{' '}
                            <code className="rounded bg-accent-muted/30 px-1">
                              123
                            </code>
                            , titular{' '}
                            <code className="rounded bg-accent-muted/30 px-1">
                              APRO
                            </code>
                            , DNI{' '}
                            <code className="rounded bg-accent-muted/30 px-1">
                              12345678
                            </code>
                            .
                          </li>
                        </ol>
                        <p className="mt-2 text-xs text-text-main/60">
                          Si el botón &quot;Pagar&quot; sigue deshabilitado,
                          faltan datos del formulario o la sesión no es la del
                          comprador de prueba.
                        </p>
                      </div>
                    ) : null}
                    <a
                      href={payUrl}
                      data-testid="checkout-mercadopago-button"
                      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#009EE3] px-6 py-4 font-bold text-xs uppercase tracking-widest text-white shadow-sm transition-all hover:brightness-110"
                    >
                      Pagar con Mercado Pago
                    </a>
                  </>
                ) : (
                  <div className="mt-4 rounded-xl border border-accent-muted/60 bg-white/40 p-4 text-sm text-text-main/80">
                    <p className="font-semibold text-text-main">
                      No hay enlace de pago disponible
                    </p>
                    <p className="mt-2">
                      Configurá{' '}
                      <code className="rounded bg-accent-muted/30 px-1">
                        MERCADOPAGO_ACCESS_TOKEN
                      </code>{' '}
                      en el{' '}
                      <code className="rounded bg-accent-muted/30 px-1">
                        server/.env
                      </code>{' '}
                      para generar el cobro con el total del carrito, o definí{' '}
                      <code className="rounded bg-accent-muted/30 px-1">
                        VITE_MERCADOPAGO_INIT_POINT
                      </code>{' '}
                      en el front como respaldo (link fijo).
                    </p>
                    {payError ? (
                      <p
                        className="mt-2 text-xs text-primary"
                        role="alert"
                        data-testid="checkout-error-message"
                      >
                        {payError}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-xl border border-accent-muted/40 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Building2
                    size={16}
                    className="text-primary"
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                    Transferencia bancaria
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-main/70">
                  Transferí el total a nuestra cuenta y envianos el comprobante
                  para confirmar tu pedido.
                </p>
                <button
                  type="button"
                  data-testid="checkout-transfer-button"
                  onClick={() => setShowTransfer(true)}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl border-2 border-primary bg-transparent px-6 py-3.5 font-bold text-xs uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-background-light"
                >
                  Pagar con transferencia
                </button>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 rounded-2xl border border-accent-muted/30 bg-white/70 p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest">
              Resumen
            </h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-main/60">Productos</dt>
                <dd className="font-semibold">{itemCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-main/60">Envío</dt>
                <dd className="font-semibold">A coordinar</dd>
              </div>
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-accent-muted/40 pt-5">
              <span className="text-xs font-bold uppercase tracking-widest">
                Total
              </span>
              <span
                data-testid="checkout-total-amount"
                className="text-2xl font-black"
              >
                {formatMoney(total)}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-text-main/15 py-3.5 text-xs font-bold uppercase tracking-widest text-text-main transition-colors hover:border-primary hover:text-primary"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Volver a agregar productos
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent-muted/50 py-3.5 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:bg-accent/20"
              >
                <MessageCircle size={16} aria-hidden="true" />
                ¿Dudas? WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </div>

      {showTransfer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Datos para transferencia"
          data-testid="checkout-transfer-modal"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowTransfer(false)}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-background-light p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={() => setShowTransfer(false)}
              className="absolute right-3 top-3 rounded-full p-2 text-text-main/50 transition-colors hover:bg-white hover:text-primary"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black uppercase tracking-tighter">
              Transferencia
            </h3>
            <p className="mb-4 mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-text-main/50">
              Datos de la cuenta
            </p>

            <dl className="space-y-3 text-sm">
              <TransferRow label="Titular" value={TRANSFER_DATA.titular} />
              <TransferRow label="Banco" value={TRANSFER_DATA.banco} />
              <TransferRow
                label="Tipo de cuenta"
                value={TRANSFER_DATA.tipoCuenta}
              />
              <TransferRow label="CBU" value={TRANSFER_DATA.cbu} copyable />
              <TransferRow label="Alias" value={TRANSFER_DATA.alias} copyable />
            </dl>

            <p className="mt-4 text-sm font-black uppercase tracking-tight">
              Total a transferir: {formatMoney(total)}
            </p>

            <p className="mt-3 text-xs leading-relaxed text-text-main/60">
              Una vez realizada la transferencia, envianos el comprobante por
              WhatsApp para confirmar tu pedido.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 font-bold text-xs uppercase tracking-widest text-background-light transition-colors hover:bg-accent hover:text-primary"
            >
              Enviar comprobante por WhatsApp
            </a>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default Checkout
