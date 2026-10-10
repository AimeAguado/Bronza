import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useCart } from '../context/useCart.js'
import { useArrepentimiento } from '../hooks/useArrepentimiento.js'
import { apiUrl } from '../lib/api.js'
import { STATUS_LABELS, STATUS_STYLES } from '../lib/orderStatus.js'
import Footer from '../components/Footer.jsx'

function formatMoney(v) {
  return `$${Number(v).toFixed(2)}`
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

const EDITABLE_STATUSES = ['pending', 'waiting_payment', 'rejected']

function mergeCartItems(existing, incoming) {
  const map = new Map(existing.map((item) => [item.id, { ...item }]))
  for (const item of incoming) {
    const found = map.get(item.id)
    if (found) {
      found.qty += item.qty
    } else {
      map.set(item.id, { ...item })
    }
  }
  return [...map.values()]
}

export default function Orders() {
  const { token } = useAuth()
  const { setCart } = useCart()
  const navigate = useNavigate()
  const { open: openArrepentimiento } = useArrepentimiento()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState('')
  const [error, setError] = useState('')

  const fetchOrders = useCallback(() => {
    if (!token) return
    setLoading(true)
    fetch(apiUrl('/api/orders/my'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setOrders([])
      return
    }
    fetchOrders()
  }, [token, fetchOrders])

  useEffect(() => {
    function onUpdated() {
      fetchOrders()
    }
    window.addEventListener('orders-updated', onUpdated)
    return () => window.removeEventListener('orders-updated', onUpdated)
  }, [fetchOrders])

  async function handleRemoveItem(order, itemId) {
    if (!token || removingId) return
    setRemovingId(itemId)
    setError('')
    try {
      const res = await fetch(
        apiUrl(`/api/orders/my/${order._id}/items/${itemId}`),
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'No pudimos eliminar el producto.')
      }
      if (data.deleted) {
        setOrders((prev) => prev.filter((o) => o._id !== order._id))
      } else {
        setOrders((prev) =>
          prev.map((o) => (o._id === order._id ? data.order : o)),
        )
      }
    } catch (e) {
      setError(e.message || 'No pudimos eliminar el producto.')
    } finally {
      setRemovingId('')
    }
  }

  function handleContinuePayment(order) {
    const items = order.items.map((item) => ({
      id: item.id ?? item._id,
      productId: item.id ?? item._id,
      name: item.title,
      price: item.unit_price,
      image: item.image ?? '',
      color: item.color ?? '',
      size: item.size ?? '',
      qty: item.quantity,
    }))
    setCart((prev) => mergeCartItems(prev, items))
    navigate('/checkout')
  }

  return (
    <div className="min-h-screen bg-background-light pt-10 px-6 pb-10 text-text-main flex flex-col">
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center pt-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Mis pedidos</h2>
          <Link to="/" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
            Volver
          </Link>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-xl bg-accent/20 px-4 py-3 text-sm text-text-main/80">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-text-main/60">Cargando…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-text-main/60">Todavía no tenés pedidos.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => {
              const editable = EDITABLE_STATUSES.includes(order.status)
              return (
              <li key={order._id} className="rounded-xl border border-accent-muted/40 bg-white/60 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-text-main/50 uppercase tracking-wider">{formatDate(order.createdAt)}</p>
                    <p className="font-black text-lg mt-1">{formatMoney(order.total)}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${STATUS_STYLES[order.status] ?? ''}`}>
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li key={item._id} className="text-sm flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="h-12 w-10 shrink-0 rounded-md object-cover" />
                        ) : (
                          <span className="flex h-12 w-10 shrink-0 items-center justify-center rounded-md bg-accent-muted/20 text-[8px] font-bold uppercase text-accent-muted">
                            —
                          </span>
                        )}
                        <span className="min-w-0 truncate">
                          {item.title} <span className="text-text-main/50">x{item.quantity}</span>
                        </span>
                      </span>
                      <span className="flex items-center gap-3 shrink-0">
                        <span>{formatMoney(item.unit_price * item.quantity)}</span>
                        {editable && (
                          <button
                            type="button"
                            data-testid="order-item-remove-button"
                            disabled={removingId === item._id}
                            onClick={() => handleRemoveItem(order, item._id)}
                            className={`text-[10px] font-bold uppercase tracking-widest text-accent-muted transition-colors hover:text-primary disabled:opacity-50 ${FOCUS}`}
                          >
                            {removingId === item._id ? 'Eliminando…' : 'Eliminar producto'}
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                {editable && (
                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      data-testid="order-continue-payment-button"
                      onClick={() => handleContinuePayment(order)}
                      className={`inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-background-light transition-colors hover:bg-accent hover:text-primary ${FOCUS}`}
                    >
                      Continuar con el pago
                    </button>
                  </div>
                )}
                {order.status === 'approved' && (
                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => openArrepentimiento(order)}
                      className={`inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-primary transition-colors hover:bg-primary hover:text-background-light ${FOCUS}`}
                    >
                      Botón de arrepentimiento
                    </button>
                  </div>
                )}
              </li>
              )
            })}
          </ul>
        )}
      </div>
      <Footer />
    </div>
  )
}
