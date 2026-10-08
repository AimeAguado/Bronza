import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { apiUrl } from '../../lib/api.js'
import { ORDER_STATUSES, STATUS_LABELS, STATUS_STYLES } from '../../lib/orderStatus.js'
import Footer from '../../components/Footer.jsx'

function formatMoney(v) {
  return `$${Number(v).toFixed(2)}`
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminOrders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)

  useEffect(() => {
    fetch(apiUrl('/api/orders/admin'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        console.log('[AdminOrders] response:', data)
        setOrders(data.orders ?? [])
      })
      .catch((e) => console.error('[AdminOrders] fetch error:', e))
      .finally(() => setLoading(false))
  }, [token])

  async function updateStatus(id, status) {
    setSavingId(id)
    try {
      const res = await fetch(apiUrl(`/api/orders/admin/${id}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        window.alert(data.error ?? 'Error al actualizar el estado.')
        return
      }
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: data.order.status } : o)))
    } catch (e) {
      console.error('[AdminOrders] status error:', e)
      window.alert('Error de conexión al actualizar el estado.')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDelete(order) {
    const confirmed = window.confirm(
      `¿Eliminar el pedido de ${order.userId?.name ?? 'cliente'} (${formatMoney(order.total)})? Esta acción no se puede deshacer.`
    )
    if (!confirmed) return

    setSavingId(order._id)
    try {
      const res = await fetch(apiUrl(`/api/orders/admin/${order._id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        window.alert(data.error ?? 'Error al eliminar el pedido.')
        return
      }
      setOrders((prev) => prev.filter((o) => o._id !== order._id))
    } catch (e) {
      console.error('[AdminOrders] delete error:', e)
      window.alert('Error de conexión al eliminar el pedido.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background-light pt-24 px-6 pb-12 text-text-main flex flex-col">
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
                  {['Fecha', 'Usuario', 'Items', 'Total', 'Estado', 'Acciones'].map((h) => (
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
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[order.status] ?? ''}`}>
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                        <select
                          value={order.status}
                          disabled={savingId === order._id}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          aria-label={`Cambiar estado del pedido de ${order.userId?.name ?? 'cliente'}`}
                          className="rounded-lg border border-accent-muted/60 bg-white px-2 py-1.5 text-xs font-bold uppercase tracking-wide text-text-main focus:outline-none focus:border-primary disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(order)}
                        disabled={savingId === order._id}
                        className="flex items-center gap-1 text-xs font-bold uppercase text-accent-muted hover:text-primary hover:underline disabled:opacity-50"
                      >
                        <Trash2 size={12} /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
