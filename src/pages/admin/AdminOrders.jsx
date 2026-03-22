import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { apiUrl } from '../../lib/api.js'

function formatMoney(v) {
  return `$${Number(v).toFixed(2)}`
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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

export default function AdminOrders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(apiUrl('/api/orders/admin'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="min-h-screen bg-background-light pt-24 px-6 pb-12 text-text-main">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Admin — Pedidos</h2>
          <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
            <Link to="/admin/products" className="text-text-main/50 hover:text-primary">Productos</Link>
            <Link to="/" className="text-primary hover:underline">Ver tienda</Link>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-text-main/60">Cargando…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-text-main/60">No hay pedidos todavía.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-accent-muted/40">
            <table className="w-full text-sm">
              <thead className="bg-accent-muted/20 text-xs uppercase tracking-widest">
                <tr>
                  {['Fecha', 'Usuario', 'Items', 'Total', 'Estado'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-muted/20 bg-white/60">
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-text-main/60">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{order.userId?.name ?? '—'}</p>
                      <p className="text-xs text-text-main/50">{order.userId?.email ?? ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ul className="space-y-0.5">
                        {order.items.map((item, i) => (
                          <li key={i} className="text-xs">{item.title} x{item.quantity}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 font-bold">{formatMoney(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${STATUS_STYLES[order.status] ?? ''}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
