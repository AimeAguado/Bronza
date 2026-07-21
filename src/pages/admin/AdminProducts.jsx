import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { apiUrl } from '../../lib/api.js'
import { X, Plus, Trash2, Pencil, Eye, EyeOff, ImagePlus } from 'lucide-react'

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL']
const EMPTY_VARIANT = { color: '', files: [], existingImages: [], stock: {} }

function emptyForm() {
  return { name: '', description: '', category: '', price: '', sizes: [], variants: [] }
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

function ProductModal({ open, product, onClose, onSave, token }) {
  const [form, setForm] = useState(emptyForm())
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isEditing = !!product

  useEffect(() => {
    if (open) {
      if (product) {
        setForm({
          name: product.name ?? '',
          description: product.description ?? '',
          category: product.category ?? '',
          price: product.price ?? '',
          sizes: product.sizes ?? [],
          variants: (product.variants ?? []).map(v => ({
            color: v.color ?? '',
            files: [],
            existingImages: [...(v.images ?? [])],
            stock: v.stock instanceof Map ? Object.fromEntries(v.stock) : (v.stock ?? {}),
          })),
        })
      } else {
        setForm(emptyForm())
      }
      setError('')
    }
  }, [open, product])

  if (!open) return null

  function toggleSize(size) {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter(s => s !== size)
        : [...f.sizes, size],
    }))
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
    setSaving(true)

    const variants = []
    for (const variant of form.variants) {
      const images = [...variant.existingImages]
      for (const file of variant.files) {
        try {
          const url = await uploadImage(file, token)
          images.push(url)
        } catch (err) {
          setSaving(false)
          return setError(`Error al subir imagen para ${variant.color}: ${err.message}`)
        }
      }

      const stock = {}
      for (const size of form.sizes) {
        const val = variant.stock[size]
        stock[size] = val !== undefined && val !== '' ? Number(val) : 0
      }

      variants.push({ color: variant.color, images, stock })
    }

    const body = {
      name: form.name,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      sizes: form.sizes,
      variants,
    }

    const url = isEditing ? apiUrl(`/api/products/${product._id}`) : apiUrl('/api/products')
    const method = isEditing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) return setError(data.error ?? 'Error al guardar.')
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] px-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background-light rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background-light border-b border-accent-muted/30 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="font-bold uppercase text-sm tracking-widest">
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-accent-muted/30 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Nombre *</label>
              <input type="text" value={form.name} required
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-accent-muted/60 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Precio *</label>
              <input type="number" value={form.price} required
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full rounded-lg border border-accent-muted/60 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Categoría</label>
              <input type="text" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg border border-accent-muted/60 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Descripción</label>
              <input type="text" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full rounded-lg border border-accent-muted/60 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2">Talles</label>
            <div className="flex gap-3">
              {AVAILABLE_SIZES.map(size => (
                <button key={size} type="button" onClick={() => toggleSize(size)}
                  className={`min-w-[48px] py-2 px-4 rounded-lg text-sm font-bold uppercase transition-all border
                    ${form.sizes.includes(size)
                      ? 'bg-text-main text-background-light border-text-main'
                      : 'bg-white border-accent-muted/60 hover:border-primary'}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-accent-muted/30 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold uppercase text-xs tracking-widest">Variantes (colores)</h4>
              <button type="button" onClick={addVariant}
                className="text-xs font-bold uppercase text-primary hover:underline tracking-widest">
                + Agregar variante
              </button>
            </div>
            {form.variants.length === 0 && (
              <p className="text-xs text-text-main/40 italic">Sin variantes. Agregá un color para poder subir fotos.</p>
            )}
            {form.variants.map((variant, idx) => (
              <div key={idx} className="mb-4 rounded-lg border border-accent-muted/40 bg-white/40 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Color</label>
                      <input type="text" value={variant.color} placeholder="ej: negro, marrón..."
                        onChange={e => updateVariant(idx, { color: e.target.value })}
                        className="w-full rounded-lg border border-accent-muted/60 bg-white px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Fotos del producto</label>
                      <label className="flex items-center justify-center gap-2 w-full rounded-lg border border-dashed border-accent-muted/60 bg-white px-3 py-2 text-sm cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                        <ImagePlus size={14} className="text-primary" />
                        <span className="text-xs font-bold uppercase text-text-main/60">Subir fotos</span>
                        <input type="file" multiple accept="image/jpeg,image/png,image/webp"
                          onChange={e => updateVariant(idx, { files: [...e.target.files] })}
                          className="hidden" />
                      </label>
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
                        <img src={url} className="h-16 w-16 object-cover rounded-lg border border-accent-muted/30" />
                        <button type="button" onClick={() => {
                          updateVariant(idx, { existingImages: variant.existingImages.filter((_, j) => j !== i) })
                        }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          x
                        </button>
                      </div>
                    ))}
                    {[...variant.files].map((file, i) => (
                      <div key={`f${i}`} className="relative group">
                        <img src={URL.createObjectURL(file)}
                          className="h-16 w-16 object-cover rounded-lg border border-accent-muted/30" />
                        <button type="button" onClick={() => {
                          const newFiles = variant.files.filter((_, j) => j !== i)
                          updateVariant(idx, { files: newFiles })
                        }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {form.sizes.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Stock por talle</label>
                    <div className="flex flex-wrap gap-2">
                      {form.sizes.map(size => (
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

          {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="bg-primary text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50">
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
            </button>
            <button type="button" onClick={onClose}
              className="border border-accent-muted/60 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-primary transition-all">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProducts() {
    try {
      const res = await fetch(apiUrl('/api/products?admin=true'), { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setProducts(data.products ?? [])
    } catch (e) {
      console.error('Error al obtener productos:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [token])

  function openCreateModal() {
    setEditingProduct(null)
    setModalOpen(true)
  }

  function openEditModal(product) {
    console.log('Abriendo modal para editar:', product.name)
    setEditingProduct(product)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingProduct(null)
  }

  async function handleToggleActive(id) {
    await fetch(apiUrl(`/api/products/${id}/toggle-active`), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchProducts()
    window.dispatchEvent(new Event('products-updated'))
  }

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

        <button onClick={openCreateModal}
          className="mb-6 bg-primary text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2">
          <Plus size={14} /> Nuevo producto
        </button>

        {loading ? (
          <p className="text-sm text-text-main/60">Cargando...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-accent-muted/40">
            <table className="w-full text-sm">
              <thead className="bg-accent-muted/20 text-xs uppercase tracking-widest">
                <tr>
                  {['Imagen', 'Nombre', 'Categoría', 'Precio', 'Talles', 'Estado', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-muted/20 bg-white/60">
                {products.map(p => {
                  const firstImg = p.variants?.[0]?.images?.[0]
                  const sizesStr = (p.sizes ?? []).join(', ')
                  return (
                    <tr key={p._id} className={!p.active ? 'opacity-50' : ''}>
                      <td className="px-4 py-3">
                        {firstImg ? <img src={firstImg} className="w-10 h-10 object-cover rounded-md" /> : '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold">{p.name}</td>
                      <td className="px-4 py-3 text-text-main/60">{p.category}</td>
                      <td className="px-4 py-3">${p.price}</td>
                      <td className="px-4 py-3 text-text-main/60 text-xs">{sizesStr}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {p.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button onClick={() => openEditModal(p)}
                            className="flex items-center gap-1 text-xs font-bold uppercase text-primary hover:underline">
                            <Pencil size={12} /> Editar
                          </button>
                          <button onClick={() => handleToggleActive(p._id)}
                            className={`flex items-center gap-1 text-xs font-bold uppercase hover:underline ${p.active ? 'text-red-500' : 'text-green-600'}`}>
                            {p.active ? <><EyeOff size={12} /> Desactivar</> : <><Eye size={12} /> Activar</>}
                          </button>
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

      <ProductModal
        key={editingProduct?._id ?? 'new'}
        open={modalOpen}
        product={editingProduct}
        onClose={closeModal}
        onSave={() => { closeModal(); fetchProducts(); window.dispatchEvent(new Event('products-updated')) }}
        token={token}
      />
    </div>
  )
}
