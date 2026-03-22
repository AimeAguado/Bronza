import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { apiUrl } from '../../lib/api.js'

const EMPTY_FORM = { name: '', category: '', color: '', price: '', image: '', volume: '', stock: '' }

export default function AdminProducts() {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function fetchProducts() {
    const res = await fetch(apiUrl('/api/products'), { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setProducts(data.products ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [])

  function handleEdit(product) {
    setEditing(product._id)
    setForm({
      name: product.name ?? '',
      category: product.category ?? '',
      color: product.color ?? '',
      price: product.price ?? '',
      image: product.image ?? '',
      volume: product.volume ?? '',
      stock: product.stock ?? '',
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) }
    const url = editing ? apiUrl(`/api/products/${editing}`) : apiUrl('/api/products')
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) return setError(data.error ?? 'Error al guardar.')
    setForm(EMPTY_FORM)
    setEditing(null)
    fetchProducts()
  }

  async function handleDeactivate(id) {
    await fetch(apiUrl(`/api/products/${id}`), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchProducts()
  }

  return (
    <div className="min-h-screen bg-background-light pt-24 px-6 pb-12 text-text-main">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Admin — Productos</h2>
          <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
            <Link to="/admin/orders" className="text-text-main/50 hover:text-primary">Pedidos</Link>
            <Link to="/" className="text-primary hover:underline">Ver tienda</Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-10 rounded-xl border border-accent-muted/40 bg-white/60 p-6 space-y-4">
          <h3 className="font-bold uppercase text-xs tracking-widest">
            {editing ? 'Editar producto' : 'Nuevo producto'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'name', label: 'Nombre', required: true },
              { key: 'category', label: 'Categoría' },
              { key: 'color', label: 'Color' },
              { key: 'price', label: 'Precio', type: 'number', required: true },
              { key: 'volume', label: 'Volume (ej: Volume 01)' },
              { key: 'stock', label: 'Stock', type: 'number' },
            ].map(({ key, label, type = 'text', required }) => (
              <div key={key}>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required={required}
                  className="w-full rounded-lg border border-accent-muted/60 bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1">URL de imagen</label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://..."
              className="w-full rounded-lg border border-accent-muted/60 bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all">
              {editing ? 'Guardar cambios' : 'Crear producto'}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm(EMPTY_FORM) }}
                className="border border-accent-muted/60 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-primary transition-all">
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Table */}
        {loading ? (
          <p className="text-sm text-text-main/60">Cargando…</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-accent-muted/40">
            <table className="w-full text-sm">
              <thead className="bg-accent-muted/20 text-xs uppercase tracking-widest">
                <tr>
                  {['Imagen', 'Nombre', 'Categoría', 'Precio', 'Stock', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-muted/20 bg-white/60">
                {products.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4 py-3">
                      {p.image ? <img src={p.image} className="w-10 h-10 object-cover rounded-md" /> : '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold">{p.name}</td>
                    <td className="px-4 py-3 text-text-main/60">{p.category}</td>
                    <td className="px-4 py-3">${p.price}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button onClick={() => handleEdit(p)} className="text-xs font-bold uppercase text-primary hover:underline">Editar</button>
                        <button onClick={() => handleDeactivate(p._id)} className="text-xs font-bold uppercase text-red-500 hover:underline">Desactivar</button>
                      </div>
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
