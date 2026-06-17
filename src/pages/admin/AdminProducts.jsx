import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { apiUrl } from '../../lib/api.js'

const EMPTY_VARIANT = { color: '', files: [], existingImages: [], stock: {} }

function emptyForm() {
  return { name: '', category: '', price: '', sizes: '', variants: [] }
}

async function uploadImage(file, token) {
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(apiUrl('/api/products/upload'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Error al subir imagen.')
  return data.url
}

export default function AdminProducts() {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm())
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function fetchProducts() {
    const res = await fetch(apiUrl('/api/products'), { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setProducts(data.products ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetch(apiUrl('/api/products'), { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setProducts(data.products ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  function handleEdit(product) {
    const sizesStr = (product.sizes ?? []).join(', ')
    setEditing(product._id)
    setForm({
      name: product.name ?? '',
      category: product.category ?? '',
      price: product.price ?? '',
      sizes: sizesStr,
      variants: (product.variants ?? []).map(v => ({
        color: v.color ?? '',
        files: [],
        existingImages: [...(v.images ?? [])],
        stock: Object.fromEntries(v.stock ?? new Map()),
      })),
    })
  }

  function addVariant() {
    setForm(f => ({ ...f, variants: [...f.variants, { ...EMPTY_VARIANT }] }))
  }

  function removeVariant(idx) {
    setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }))
  }

  function updateVariant(idx, patch) {
    setForm(f => {
      const v = [...f.variants]
      v[idx] = { ...v[idx], ...patch }
      return { ...f, variants: v }
    })
  }

  function updateVariantStock(idx, size, value) {
    setForm(f => {
      const v = [...f.variants]
      v[idx] = { ...v[idx], stock: { ...v[idx].stock, [size]: value } }
      return { ...f, variants: v }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const parsedSizes = form.sizes
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const variants = []
    for (const variant of form.variants) {
      const images = [...variant.existingImages]
      for (const file of variant.files) {
        try {
          const url = await uploadImage(file, token)
          images.push(url)
        } catch (err) {
          return setError(`Error al subir imagen para ${variant.color}: ${err.message}`)
        }
      }

      const stock = {}
      for (const size of parsedSizes) {
        const val = variant.stock[size]
        stock[size] = val !== undefined && val !== '' ? Number(val) : 0
      }

      variants.push({ color: variant.color, images, stock })
    }

    const body = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      sizes: parsedSizes,
      variants,
    }

    const url = editing ? apiUrl(`/api/products/${editing}`) : apiUrl('/api/products')
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) return setError(data.error ?? 'Error al guardar.')
    setForm(emptyForm())
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

  const parsedSizes = form.sizes.split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div className="min-h-screen bg-background-light pt-24 px-6 pb-12 text-text-main">
      <div className="max-w-5xl mx-auto">
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

          {/* Basic fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Nombre *</label>
              <input type="text" value={form.name} required
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-accent-muted/60 bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Categoría</label>
              <input type="text" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-accent-muted/60 bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Precio *</label>
              <input type="number" value={form.price} required
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full rounded-lg border border-accent-muted/60 bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Talles (separados por coma)</label>
              <input type="text" value={form.sizes} placeholder="S, M, L, XL"
                onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))}
                className="w-full rounded-lg border border-accent-muted/60 bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>

          {/* Variants */}
          <div className="border-t border-accent-muted/30 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold uppercase text-xs tracking-widest">Variantes (colores)</h4>
              <button type="button" onClick={addVariant}
                className="text-xs font-bold uppercase text-primary hover:underline tracking-widest">
                + Agregar variante
              </button>
            </div>
            {form.variants.map((variant, idx) => (
              <div key={idx} className="mb-4 rounded-lg border border-accent-muted/40 bg-white/40 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Color</label>
                      <input type="text" value={variant.color}
                        onChange={e => updateVariant(idx, { color: e.target.value })}
                        className="w-full rounded-lg border border-accent-muted/60 bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Imágenes</label>
                      <input type="file" multiple accept="image/jpeg,image/png,image/webp"
                        onChange={e => updateVariant(idx, { files: [...e.target.files] })}
                        className="w-full text-sm text-text-main/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-primary file:text-white hover:file:brightness-110 cursor-pointer" />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeVariant(idx)}
                    className="ml-3 text-red-500 text-xs font-bold uppercase hover:underline tracking-widest shrink-0">
                    Eliminar
                  </button>
                </div>
                {(variant.files.length > 0 || variant.existingImages.length > 0) && (
                  <div className="flex gap-2 flex-wrap mb-3">
                    {variant.existingImages.map((url, i) => (
                      <div key={`e${i}`} className="relative group">
                        <img src={url} className="h-14 w-14 object-cover rounded-lg border border-accent-muted/30" />
                        <button type="button" onClick={() => {
                          const imgs = variant.existingImages.filter((_, j) => j !== i)
                          updateVariant(idx, { existingImages: imgs })
                        }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          x
                        </button>
                      </div>
                    ))}
                    {[...variant.files].map((file, i) => (
                      <img key={`f${i}`} src={URL.createObjectURL(file)}
                        className="h-14 w-14 object-cover rounded-lg border border-accent-muted/30" />
                    ))}
                  </div>
                )}
                {parsedSizes.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Stock por talle</label>
                    <div className="flex flex-wrap gap-2">
                      {parsedSizes.map(size => (
                        <div key={size} className="flex items-center gap-1">
                          <span className="text-xs font-bold uppercase">{size}:</span>
                          <input type="number" min="0" value={variant.stock[size] ?? ''} placeholder="0"
                            onChange={e => updateVariantStock(idx, size, e.target.value)}
                            className="w-16 rounded border border-accent-muted/60 bg-white px-2 py-1 text-xs text-center focus:outline-none focus:border-primary" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button type="submit"
              className="bg-primary text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all">
              {editing ? 'Guardar cambios' : 'Crear producto'}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm(emptyForm()) }}
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
                  {['Imagen', 'Nombre', 'Categoría', 'Precio', 'Talles', 'Variantes', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-muted/20 bg-white/60">
                {products.map(p => {
                  const firstImg = p.variants?.[0]?.images?.[0]
                  const variantInfo = (p.variants ?? []).map(v =>
                    `${v.color}${v.images?.length ? ` (${v.images.length} img)` : ''}`
                  ).join(', ')
                  const sizesStr = (p.sizes ?? []).join(', ')
                  return (
                    <tr key={p._id}>
                      <td className="px-4 py-3">
                        {firstImg ? <img src={firstImg} className="w-10 h-10 object-cover rounded-md" /> : '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold">{p.name}</td>
                      <td className="px-4 py-3 text-text-main/60">{p.category}</td>
                      <td className="px-4 py-3">${p.price}</td>
                      <td className="px-4 py-3 text-text-main/60 text-xs">{sizesStr}</td>
                      <td className="px-4 py-3 text-text-main/60 text-xs max-w-[200px] truncate">{variantInfo}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button onClick={() => handleEdit(p)}
                            className="text-xs font-bold uppercase text-primary hover:underline">Editar</button>
                          <button onClick={() => handleDeactivate(p._id)}
                            className="text-xs font-bold uppercase text-red-500 hover:underline">Desactivar</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
