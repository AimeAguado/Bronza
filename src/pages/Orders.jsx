import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { apiUrl } from '../lib/api.js'

function formatMoney(v) {
  return `$${Number(v).toFixed(2)}`
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const STATUS_STYLES = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
}

const STATUS_LABELS = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
}

export default function Orders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(apiUrl('/api/orders/my'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="min-h-screen bg-background-light pt-24 px-6 pb-12 text-text-main">
      <div className="max-w-2xl mx-auto">
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
