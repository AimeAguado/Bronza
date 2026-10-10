import { useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { ShieldCheck, Truck, MessageCircle, AlertTriangle, Check, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { apiUrl } from '../lib/api.js'

export const WHATSAPP_URL =
  'https://wa.me/5491100000000?text=' +
  encodeURIComponent('Hola! Quiero ejercer el derecho de arrepentimiento de mi compra en Bronza')

export const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

function formatMoney(v) {
  return `$${Number(v).toFixed(2)}`
}

const PILLARS = [
  {
    icon: Truck,
    title: 'Antes del envío',
    text: 'Podés cancelar tu pedido sin costo y sin vueltas mientras todavía no lo despachamos por correo.',
  },
  {
    icon: ShieldCheck,
    title: 'Sin cambios ni devoluciones',
    text: 'Una vez despachado, el pedido no se puede cancelar, cambiar ni devolver: no podemos garantizar cómo se probó la bikini, y priorizamos la higiene y el cuidado de todas nuestras clientas.',
  },
  {
    icon: MessageCircle,
    title: 'Consultanos antes de comprar',
    text: 'Escribinos por WhatsApp antes de confirmar tu compra para sacarte cualquier duda de talles, medidas o modelos.',
  },
]

export default function ArrepentimientoContent({ order = null, onCancelled = null }) {
  const { token } = useAuth()
  const [confirming, setConfirming] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  async function handleCancel() {
    if (!order || !token) return
    setStatus('loading')
    setError('')
    try {
      const res = await fetch(apiUrl(`/api/orders/my/${order._id}/withdrawal`), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'No pudimos cancelar tu pedido.')
      }
      setStatus('done')
      if (onCancelled) onCancelled(data.order)
      window.dispatchEvent(new Event('orders-updated'))
    } catch (e) {
      setStatus('idle')
      setConfirming(false)
      setError(e.message || 'No pudimos cancelar tu pedido.')
    }
  }

  return (
    <div className="px-6 pt-10 pb-10 md:px-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-accent-muted">
        Botón de arrepentimiento
      </p>
      <h2 className="mt-5 text-3xl font-black uppercase leading-[1.05] tracking-tighter md:text-4xl">
        ¿Te arrepentiste de tu compra?{' '}
        <span className="font-serif italic normal-case tracking-normal text-accent">
          la podés cancelar
        </span>
        .
      </h2>
      <p className="mt-6 text-sm leading-relaxed text-text-main/70 md:text-base">
        Podés cancelar tu compra sin costo mientras todavía no despachamos tu pedido
        por correo. Por una cuestión de higiene y cuidado para todas, una vez enviado
        no podemos hacer cambios ni devoluciones.
      </p>

      <div className="mt-8 grid gap-4">
        {PILLARS.map(({ icon: _Icon, title, text }) => {
          const Icon = _Icon
          return (
          <div
            key={title}
            className="flex gap-4 rounded-2xl border border-accent-muted/30 bg-white/60 p-5"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/20 text-primary">
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-text-main/75">{text}</p>
            </div>
          </div>
          )
        })}
      </div>

      {order && (
        <Motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8 rounded-2xl border border-accent/30 bg-accent/15 p-6"
        >
          {status === 'done' ? (
            <div className="flex items-start gap-3 text-left">
              <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                <Check size={16} strokeWidth={3} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight">
                  Pedido cancelado
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-text-main/75">
                  Tu pedido de {formatMoney(order.total ?? 0)} quedó cancelado.
                  Si ya estaba pago, te contactamos para coordinar la devolución.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                  <AlertTriangle size={16} strokeWidth={2.5} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight">
                    Pedido del {new Date(order.createdAt).toLocaleDateString('es-AR')}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-main/75">
                    Total {formatMoney(order.total ?? 0)}. Podés cancelarlo ahora mismo.
                  </p>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-xl bg-background-light px-4 py-3 text-sm text-text-main/80">
                  {error}
                </p>
              )}

              {confirming ? (
                <div className="mt-5">
                  <p className="text-sm font-bold text-text-main/80">
                    ¿Seguro que querés cancelar este pedido?
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={status === 'loading'}
                      className={`inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-[11px] font-bold uppercase tracking-widest text-background-light transition-colors hover:bg-accent hover:text-primary disabled:opacity-60 ${FOCUS}`}
                    >
                      {status === 'loading' && (
                        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                      )}
                      Sí, cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      disabled={status === 'loading'}
                      className={`inline-flex items-center justify-center rounded-full border border-primary/25 px-7 py-3 text-[11px] font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/5 disabled:opacity-60 ${FOCUS}`}
                    >
                      Volver
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className={`mt-5 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-[11px] font-bold uppercase tracking-widest text-background-light transition-colors hover:bg-accent hover:text-primary ${FOCUS}`}
                >
                  Cancelar mi pedido
                </button>
              )}
            </>
          )}
        </Motion.div>
      )}

      <div className="mt-8 flex flex-col items-center rounded-2xl border border-accent-muted/30 bg-white/60 p-6 text-center">
        <p className="text-sm leading-relaxed text-text-main/75">
          ¿Preferís escribirnos? Estamos para ayudarte.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-[11px] font-bold uppercase tracking-widest text-background-light transition-colors hover:bg-accent hover:text-primary ${FOCUS}`}
        >
          <MessageCircle size={16} aria-hidden="true" />
          Escribinos por WhatsApp
        </a>
      </div>
    </div>
  )
}
