import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
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

const NO_CANCEL_STATUSES = ['shipped', 'delivered', 'cancelled']

export default function Orders() {
  const { token } = useAuth()
  const { open: openArrepentimiento } = useArrepentimiento()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="min-h-screen bg-background-light pt-10 px-6 pb-10 text-text-main flex flex-col">
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center pt-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Mis pedidos</h2>
          <Link to="/" className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">
            Volver
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-text-main/60">Cargando…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-text-main/60">Todavía no tenés pedidos.</p>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
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
                <ul className="space-y-1">
                  {order.items.map((item, i) => (
                    <li key={i} className="text-sm flex justify-between">
                      <span>{item.title} <span className="text-text-main/50">x{item.quantity}</span></span>
                      <span>{formatMoney(item.unit_price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                {!NO_CANCEL_STATUSES.includes(order.status) && (
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
            ))}
          </ul>
        )}
      </div>
      <Footer />
    </div>
  )
}
