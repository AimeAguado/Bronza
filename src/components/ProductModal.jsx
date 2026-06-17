import { useState, useCallback } from 'react'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'

const COLOR_MAP = {
  negro: '#111111',
  marron: '#8B4513',
  marrón: '#8B4513',
  azul: '#1a5276',
  blanco: '#f5f5f5',
  bordo: '#800020',
}

function getColorHex(name) {
  return COLOR_MAP[name?.toLowerCase().trim()] ?? '#888'
}

function ModalContent({ product, onClose, onAddToCart }) {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [imgIdx, setImgIdx] = useState(0)

  const variants = product.variants ?? []
  const currentVariant = variants[selectedColorIdx]
  const images = currentVariant?.images ?? []
  const colorName = currentVariant?.color ?? ''
  const sizes = product.sizes ?? []

  const sizeStock = currentVariant?.stock ?? {}
  const isSizeAvailable = (size) => (sizeStock[size] ?? 0) > 0

  function prevImage() {
    setImgIdx(i => (i - 1 + images.length) % images.length)
  }

  function nextImage() {
    setImgIdx(i => (i + 1) % images.length)
  }

  function handleAdd() {
    if (!selectedSize) return
    onAddToCart({
      id: `${product._id}-${colorName}-${selectedSize}`,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: images[imgIdx] ?? images[0] ?? '',
      color: colorName,
      size: selectedSize,
    })
    onClose()
  }

  return (
    <div className="fixed inset-4 md:inset-8 z-50 m-auto flex max-w-5xl max-h-[90vh] bg-background-light rounded-2xl overflow-hidden shadow-2xl">
      {/* Close button */}
      <button onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur rounded-full p-2 hover:bg-white transition-colors">
        <X size={20} />
      </button>

      {/* Left — Image carousel */}
      <div className="relative flex-1 bg-accent-muted/10 flex items-center justify-center min-w-0">
        {images.length > 0 ? (
          <>
            <img
              src={images[imgIdx]}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
            {images.length > 1 && (
              <>
                <button onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full p-2 hover:bg-white transition-colors shadow-md">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur rounded-full p-2 hover:bg-white transition-colors shadow-md">
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-primary w-4' : 'bg-accent-muted/60'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-accent-muted text-sm">Sin imagen</div>
        )}
      </div>

      {/* Right — Product info */}
      <div className="w-full max-w-sm flex flex-col bg-white/40 p-8 overflow-y-auto">
        {product.category && (
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
            {product.category}
          </span>
        )}

        <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-2">
          {product.name}
        </h2>

        <p className="text-2xl font-bold mb-6">${product.price.toLocaleString('es-AR')}</p>

        {variants.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3">
              Color: <span className="text-text-main/60">{colorName}</span>
            </h4>
            <div className="flex gap-3">
              {variants.map((v, idx) => (
                <button
                  key={v.color}
                  onClick={() => { setSelectedColorIdx(idx); setSelectedSize(''); setImgIdx(0) }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${idx === selectedColorIdx ? 'border-primary scale-110' : 'border-accent-muted/40 hover:border-text-main/40'}`}
                  style={{ backgroundColor: getColorHex(v.color) }}
                  title={v.color}
                />
              ))}
            </div>
          </div>
        )}

        {sizes.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-3">
              Talle: {selectedSize ? <span className="text-text-main/60">{selectedSize}</span> : <span className="text-red-500">* Seleccioná un talle</span>}
            </h4>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => {
                const available = isSizeAvailable(size)
                return (
                  <button
                    key={size}
                    disabled={!available}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[44px] py-2.5 px-4 rounded-lg text-sm font-bold uppercase transition-all
                      ${selectedSize === size
                        ? 'bg-text-main text-background-light'
                        : available
                          ? 'bg-white border border-accent-muted/40 hover:border-text-main/40'
                          : 'bg-accent-muted/10 text-accent-muted/50 line-through cursor-not-allowed border border-accent-muted/20'
                      }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!selectedSize}
          className={`mt-auto w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all
            ${selectedSize
              ? 'bg-primary text-white hover:brightness-110'
              : 'bg-accent-muted/30 text-accent-muted/60 cursor-not-allowed'
            }`}
        >
          <ShoppingBag size={16} />
          {selectedSize ? 'Agregar al carrito' : 'Seleccioná un talle'}
        </button>
      </div>
    </div>
  )
}

export default function ProductModal({ product, open, onClose, onAddToCart }) {
  const close = useCallback(() => onClose(), [onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            key={product?._id}
          >
            <ModalContent product={product} onClose={close} onAddToCart={onAddToCart} />
          </Motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
