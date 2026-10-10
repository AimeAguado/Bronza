import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../context/useCart.js'
import { apiUrl } from '../lib/api.js'
import Footer from '../components/Footer.jsx'

function formatMoney(v) {
  return `$${Number(v).toFixed(2)}`
}

export default function CartPage() {
  const navigate = useNavigate()
  const { cart, setCart, updateQty, removeFromCart } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const [notice, setNotice] = useState('')
  const handledRef = useRef(false)

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0)
  const itemCount = cart.reduce((acc, item) => acc + item.qty, 0)

  // Recuperación desde el correo (?recover=…) y baja de recordatorios (?unsubscribe=…)
  useEffect(() => {
    if (handledRef.current) return
    const recoverToken = searchParams.get('recover')
    const unsubscribeToken = searchParams.get('unsubscribe')
    if (!recoverToken && !unsubscribeToken) return
    handledRef.current = true

    const next = new URLSearchParams(searchParams)
    next.delete('recover')
    next.delete('unsubscribe')

    async function run() {
      if (unsubscribeToken) {
        try {
          await fetch(apiUrl('/api/cart/unsubscribe'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: unsubscribeToken }),
          })
        } catch {
          /* ignorar */
        }
        setNotice('Listo, no te vamos a enviar más recordatorios. 💛')
      } else if (recoverToken) {
        try {
          const res = await fetch(apiUrl(`/api/cart/recover/${recoverToken}`))
          const data = await res.json().catch(() => ({}))
          if (res.ok && Array.isArray(data.items) && data.items.length) {
            setCart((prev) => {
              const map = new Map(prev.map((item) => [item.id, { ...item }]))
              for (const item of data.items) {
                const found = map.get(item.id)
                if (found) found.qty += item.qty
                else map.set(item.id, { ...item, qty: item.qty })
              }
              return [...map.values()]
            })
            const removed = Array.isArray(data.removed) ? data.removed.length : 0
            setNotice(
              removed > 0
                ? `Recuperamos tu carrito. ${removed} producto(s) ya no están disponibles. 🌊`
                : 'Recuperamos tu carrito. ¡Seguí donde lo dejaste! 🌊',
            )
          } else {
            setNotice('Tu carrito ya no tiene productos disponibles. 💛')
          }
        } catch {
          setNotice('No pudimos recuperar tu carrito. 💛')
        }
      }
      setSearchParams(next, { replace: true })
    }

    run()
  }, [searchParams, setSearchParams, setCart])

  return (
    <div className="min-h-screen bg-background-light pt-10 px-6 pb-10 text-text-main flex flex-col">
      <div className="w-full max-w-5xl mx-auto flex-1 pt-8 pb-16">
        <div className="flex items-end justify-between gap-4 border-b border-accent-muted/40 pb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-muted">
              Bronza Club
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-black uppercase tracking-tighter">
              Tu carrito
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary transition-colors hover:text-accent"
          >
            <ArrowLeft size={16} />
            Seguir comprando
          </button>
        </div>

        {notice && (
          <div
            role="status"
            data-testid="cart-notice"
            className="mt-6 rounded-xl border border-accent/40 bg-accent/10 px-5 py-4 text-sm text-text-main"
          >
            {notice}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-primary">
              <ShoppingBag size={26} aria-hidden="true" />
            </span>
            <p
              data-testid="cart-empty-message"
              className="mt-5 text-sm font-bold uppercase tracking-widest text-text-main/50"
            >
              Tu carrito está vacío
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-background-light transition-colors hover:bg-accent hover:text-primary"
            >
              Ver productos
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              data-testid="cart-checkout-button"
              disabled
              onClick={() => navigate('/checkout')}
              className="mt-3 w-full max-w-xs rounded-xl bg-primary py-4 text-xs font-bold uppercase tracking-widest text-background-light opacity-40 cursor-not-allowed"
            >
              Ir a checkout
            </button>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <ul className="space-y-4">
              {cart.map((item) => (
                <li
                  key={item.id}
                  data-testid="cart-item"
                  className="flex gap-4 rounded-2xl border border-accent-muted/30 bg-white/60 p-4 shadow-sm transition-shadow hover:shadow-md sm:gap-5"
                >
                  <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-accent-muted/20 sm:h-32 sm:w-28">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[9px] font-bold uppercase tracking-widest text-accent-muted">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate font-bold uppercase text-sm tracking-tight">
                          {item.name}
                        </h4>
                        {(item.color || item.size) && (
                          <p className="mt-1 text-[10px] uppercase tracking-wider text-text-main/50">
                            {item.color}
                            {item.color && item.size ? ' / ' : ''}
                            {item.size}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 font-black text-sm">
                        {formatMoney(item.price * item.qty)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <div className="flex items-center rounded-full border border-accent-muted/50 bg-white">
                        <button
                          type="button"
                          data-testid="cart-item-decrease-button"
                          onClick={() => updateQty(item.id, -1)}
                          aria-label="Restar una unidad"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-text-main/70 transition-colors hover:bg-accent/20 hover:text-primary"
                        >
                          <Minus size={14} aria-hidden="true" />
                        </button>
                        <span
                          data-testid="cart-item-quantity"
                          className="w-8 text-center text-sm font-bold"
                        >
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          data-testid="cart-item-increase-button"
                          onClick={() => updateQty(item.id, 1)}
                          aria-label="Sumar una unidad"
                          className="flex h-8 w-8 items-center justify-center rounded-full text-text-main/70 transition-colors hover:bg-accent/20 hover:text-primary"
                        >
                          <Plus size={14} aria-hidden="true" />
                        </button>
                      </div>
                      <button
                        type="button"
                        data-testid="cart-item-remove-button"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Eliminar ${item.name}`}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-main/40 transition-colors hover:bg-accent/20 hover:text-primary"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

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
                <span data-testid="cart-total" className="text-2xl font-black">
                  {formatMoney(total)}
                </span>
              </div>
              <button
                type="button"
                data-testid="cart-checkout-button"
                onClick={() => navigate('/checkout')}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-xs font-bold uppercase tracking-widest text-background-light transition-all hover:bg-accent hover:text-primary"
              >
                Ir a checkout
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-text-main/15 py-3.5 text-xs font-bold uppercase tracking-widest text-text-main transition-colors hover:border-primary hover:text-primary sm:hidden"
              >
                Seguir comprando
              </button>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
