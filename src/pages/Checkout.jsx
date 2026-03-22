import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart.js'
import { useAuth } from '../hooks/useAuth.js'
import { apiUrl } from '../lib/api.js'

/** Respaldo si el servidor no tiene Mercado Pago o falla la preferencia */
const FALLBACK_MP_URL =
  import.meta.env.VITE_MERCADOPAGO_INIT_POINT?.trim() ?? ''

function formatMoney(value) {
  return `$${Number(value).toFixed(2)}`
}

const Checkout = () => {
  const navigate = useNavigate()
  const { cart } = useCart()
  const { token } = useAuth()

  const [payUrl, setPayUrl] = useState('')
  const [payLoading, setPayLoading] = useState(true)
  const [payError, setPayError] = useState('')

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0)

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
      }))

      if (token) {
        try {
          const res = await fetch(apiUrl('/api/payments/preference'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ items }),
          })
          const data = await res.json().catch(() => ({}))
          if (!cancelled && res.ok && data.init_point) {
            setPayUrl(data.init_point)
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
  }, [token, cart])

  const lines = cart.map((item) => `- ${item.name} x${item.qty}`).join('\n')
  const supportMessage =
    'Hola! Consulta sobre mi pedido:\n\n' +
    lines +
    '\n\nTotal estimado: ' +
    formatMoney(total)

  const whatsappUrl =
    'https://wa.me/549XXXXXXXXX?text=' + encodeURIComponent(supportMessage)

  return (
    <div className="min-h-screen bg-background-light pt-20 px-6 pb-12 text-text-main">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-black uppercase tracking-tighter">
          Finalizar compra
        </h2>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border-2 border-text-main/20 bg-transparent px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-text-main transition-colors hover:border-primary hover:text-primary"
        >
          Volver a agregar productos
        </button>

        <ul className="mt-6 space-y-3 text-sm">
          {cart.map((item) => (
            <li
              key={item.id}
              className="flex justify-between gap-4 border-b border-accent-muted/40 pb-3"
            >
              <span>
                {item.name}{' '}
                <span className="text-text-main/60">x{item.qty}</span>
              </span>
              <span className="font-semibold">
                {formatMoney(item.price * item.qty)}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="mt-8 text-xl font-black">
          Total: {formatMoney(total)}
        </h3>

        <hr className="my-8 border-accent-muted/40" />

        <h4 className="font-bold uppercase text-xs tracking-widest">
          Pago con Mercado Pago
        </h4>
        <p className="mt-2 text-sm text-text-main/70">
          Vas a ser redirigido al checkout seguro de Mercado Pago para abonar
          con tarjeta, dinero en cuenta u otros medios disponibles.
        </p>

        {payLoading ? (
          <p className="mt-6 text-center text-sm text-text-main/60">
            Preparando pago...
          </p>
        ) : payUrl ? (
          <a
            href={payUrl}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#009EE3] px-6 py-4 font-bold text-xs uppercase tracking-widest text-white shadow-sm transition-all hover:brightness-110"
          >
            Pagar con Mercado Pago
          </a>
        ) : (
          <div className="mt-6 rounded-xl border border-accent-muted/60 bg-white/40 p-4 text-sm text-text-main/80">
            <p className="font-semibold text-text-main">
              No hay enlace de pago disponible
            </p>
            <p className="mt-2">
              Configurá{' '}
              <code className="rounded bg-accent-muted/30 px-1">
                MERCADOPAGO_ACCESS_TOKEN
              </code>{' '}
              en el{' '}
              <code className="rounded bg-accent-muted/30 px-1">server/.env</code>{' '}
              para generar el cobro con el total del carrito, o definí{' '}
              <code className="rounded bg-accent-muted/30 px-1">
                VITE_MERCADOPAGO_INIT_POINT
              </code>{' '}
              en el front como respaldo (link fijo).
            </p>
            {payError ? (
              <p className="mt-2 text-xs text-primary" role="alert">
                {payError}
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-accent-muted/40 space-y-3">
          <p className="text-xs uppercase tracking-wider text-text-main/50">
            ¿Dudas con tu pedido?
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Escribinos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

export default Checkout