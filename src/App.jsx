import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Trash2, User, Database } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from './context/useCart.js';
import { useAuth } from './hooks/useAuth.js';
import { apiUrl } from './lib/api.js';
import ProductModal from './components/ProductModal.jsx';

const COLLECTIONS = {
  'winter-26': { label: 'Winter 26', categories: ['Sweters', 'Pantalones', 'Remeras'] },
  'nightwear': { label: 'Nightwear', categories: ['Shorts', 'Chalecos', 'Bodys'] },
  'summer-27': { label: 'Summer 27', categories: [] },
};

const HERO_IMAGES = [
  'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380397/bronza-products/abzeo3ezvicgs1yizaoq.jpg',
  'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380398/bronza-products/ifepbwmrnhfw515pcucc.jpg',
  'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380398/bronza-products/zpyusoux82tol5idck3v.jpg',
  'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380402/bronza-products/g6aorzkoyfpd4jli8l4k.jpg',
  'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380405/bronza-products/llcyigszegow9kf1u1wn.jpg',
];

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cart, addToCart, updateQty, removeFromCart, setCart } = useCart();
  const { user, token, ready } = useAuth();
  const productsRef = useRef(null);
  const [activeCollection, setActiveCollection] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const filteredProducts =
    activeCollection && COLLECTIONS[activeCollection]
      ? products.filter((p) => COLLECTIONS[activeCollection].categories.includes(p.category))
      : products;

  function scrollToProducts() {
    const el = productsRef.current;
    if (!el) return;
    const target = el.getBoundingClientRect().top + window.scrollY - 60;
    const start = window.scrollY;
    const distance = target - start;
    const duration = 250;
    let startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, start + distance * ease);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  useEffect(() => {
    if (activeCollection) scrollToProducts();
  }, [activeCollection]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  function handleCollectionClick(slug) {
    setActiveCollection(slug);
  }

  useEffect(() => {
    fetch(apiUrl('/api/products'))
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
  }, []);

  useEffect(() => {
    if (!ready) return;

    const status = searchParams.get('payment');
    if (!status) return;

    const externalReference = searchParams.get('external_reference');
    const collectionStatus =
      searchParams.get('collection_status') || searchParams.get('status');

    setPaymentStatus(status);
    setSearchParams({}, { replace: true });

    if (status === 'success') setCart([]);

    if (!externalReference || !token) return;

    const confirmedStatus =
      collectionStatus === 'approved'
        ? 'approved'
        : collectionStatus === 'rejected'
          ? 'rejected'
          : 'pending';

    fetch(apiUrl('/api/orders/confirm'), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ externalReference, status: confirmedStatus }),
    }).catch(() => {});
  }, [ready, token, searchParams, setSearchParams, setCart]);

  function openModal(product) {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSelectedProduct(null);
  }

  function handleAddFromModal(item) {
    addToCart(item);
    setIsCartOpen(true);
  }

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen pt-20">
      {/* HEADER */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-background-light/80 backdrop-blur-md border-b border-accent-muted/40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            type="button"
            onClick={() => { setActiveCollection(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Database className="text-primary" size={24} />
            <span className="font-black tracking-tighter text-xl uppercase">BRONZA CLUB</span>
          </button>
          <div className="hidden md:flex gap-8 text-[10px] font-bold tracking-[0.3em] uppercase">
            {Object.entries(COLLECTIONS).map(([slug, { label }]) => (
              <button
                key={slug}
                type="button"
                onClick={() => handleCollectionClick(slug)}
                className={`transition-colors ${activeCollection === slug ? 'text-primary' : 'hover:text-primary'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-4 sm:gap-5 items-center">
            {user?.role === 'admin' && (
              <Link to="/admin/products" className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">
                Admin
              </Link>
            )}
            {user && user.role !== 'admin' && (
              <Link to="/orders" className="text-[10px] font-bold uppercase tracking-wider text-text-main/60 hover:text-primary transition-colors">
                Pedidos
              </Link>
            )}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-text-main hover:text-primary transition-colors"
              title={user ? `Cuenta: ${user.name}` : 'Iniciar sesión'}
              aria-label={user ? `Cuenta de ${user.name}` : 'Iniciar sesión'}
              {...(!user ? { 'data-testid': 'nav-login-link' } : {})}
            >
              {user ? (
                <span className="hidden sm:inline max-w-[140px] truncate text-left text-[10px] font-bold uppercase tracking-wider leading-tight">
                  {user.name}
                </span>
              ) : null}
              <User size={20} className="shrink-0" />
            </button>
            <div className="relative cursor-pointer" data-testid="nav-cart-icon" onClick={() => navigate('/carrito')}>
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((a, b) => a + b.qty, 0)}
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* PAYMENT STATUS BANNER */}
      <AnimatePresence>
        {paymentStatus && (
          <Motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className={`fixed top-[72px] inset-x-0 z-40 flex items-center justify-between px-6 py-3 text-sm font-bold uppercase tracking-widest ${
              paymentStatus === 'success'
                ? 'bg-green-600 text-white'
                : paymentStatus === 'failure'
                ? 'bg-red-600 text-white'
                : 'bg-yellow-500 text-black'
            }`}
          >
            <span>
              {paymentStatus === 'success' && 'Pago aprobado. Gracias por tu compra!'}
              {paymentStatus === 'failure' && 'El pago fue rechazado. Intenta de nuevo.'}
              {paymentStatus === 'pending' && 'Pago pendiente de acreditacion.'}
            </span>
            <button type="button" onClick={() => setPaymentStatus(null)}>
              <X size={16} />
            </button>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section className="relative min-h-[calc(100svh-5rem)] flex items-center justify-center bg-background-light overflow-hidden">
        <AnimatePresence mode="wait">
          <Motion.img
            key={heroIndex}
            src={HERO_IMAGES[heroIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full object-cover grayscale brightness-75"
          />
        </AnimatePresence>
        <div className="relative z-10 text-center px-6">
          <Motion.span initial={{opacity:0}} animate={{opacity:1}} className="text-text-main font-bold tracking-[0.5em] text-xs uppercase mb-6 block">Nightwear Collection</Motion.span>
          <Motion.h1 initial={{y:30, opacity:0}} animate={{y:0, opacity:1}} className="text-7xl md:text-[10rem] font-black tracking-tighter uppercase leading-[0.85] mb-8">
            BRONZA<br/><span className="text-text-main/40">CLUB</span>
          </Motion.h1>
          <button onClick={() => productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="bg-text-main text-background-light px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-primary transition-all scale-110">Shop the Drop</button>
          <div className="flex justify-center gap-2 mt-8">
            {HERO_IMAGES.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === heroIndex ? 'bg-text-main w-6' : 'bg-text-main/30'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <main className="max-w-7xl mx-auto px-6 py-32">
        {activeCollection === 'summer-27' ? (
          <div ref={productsRef} className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <h2 className="text-5xl font-black tracking-tighter uppercase mb-6">Summer 27</h2>
            <p className="text-text-main/50 uppercase tracking-widest font-bold text-sm">Próximamente</p>
          </div>
        ) : (
          <>
            <div ref={productsRef} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <h2 className="text-5xl font-black tracking-tighter uppercase">
                {activeCollection ? COLLECTIONS[activeCollection].label : 'Shop the Drop'}
              </h2>
              <p className="max-w-xs text-sm text-text-main/50 uppercase tracking-wider font-medium italic">High-performance recovery apparel designed for post-training excellence.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {filteredProducts.map(p => {
            const firstImg = p.variants?.[0]?.images?.[0]
            const firstColor = p.variants?.[0]?.color
            const firstSize = p.sizes?.[0]
            return (
              <div key={p._id} className="group cursor-pointer" onClick={() => openModal(p)} data-testid="product-card">
                <div className="aspect-[3/4] overflow-hidden bg-accent-muted/20 rounded-xl relative mb-6">
                  <img
                    src={firstImg}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <span
                    onClick={(e) => { e.stopPropagation(); openModal(p) }}
                    className="absolute bottom-4 left-4 right-4 bg-text-main text-white py-4 rounded-lg font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all text-center block"
                  >
                    Quick View +
                  </span>
                </div>
                <h3 className="font-bold text-xl uppercase mt-1 tracking-tight">{p.name}</h3>
                <p className="text-text-main/50 text-sm uppercase tracking-tighter font-medium">{p.category}</p>
                <p className="mt-2 font-bold">${p.price.toLocaleString('es-AR')}</p>
                <button
                  type="button"
                  data-testid="add-to-cart-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (firstColor && firstSize) {
                      addToCart({
                        id: `${p._id}-${firstColor}-${firstSize}`,
                        productId: p._id,
                        name: p.name,
                        price: p.price,
                        image: firstImg ?? '',
                        color: firstColor,
                        size: firstSize,
                      })
                    }
                  }}
                  className="mt-3 w-full bg-primary text-white py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  Agregar al carrito
                </button>
              </div>
            )
          })}
            </div>
          </>
        )}
      </main>

      {/* PRODUCT MODAL */}
      <ProductModal
        product={selectedProduct}
        open={isModalOpen}
        onClose={closeModal}
        onAddToCart={handleAddFromModal}
      />

      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <Motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <Motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring', damping:30}} className="fixed right-0 top-0 h-full w-full max-w-md bg-background-light z-50 p-8 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Your Bag</h2>
                <X className="cursor-pointer" onClick={() => setIsCartOpen(false)} />
              </div>
              <div className="flex-grow overflow-y-auto space-y-6">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 border-b border-accent-muted/30 pb-6">
                    <img src={item.image} className="w-20 h-28 object-cover rounded-lg" />
                    <div className="flex-grow">
                      <div className="flex justify-between font-bold uppercase text-sm">
                        <h4>{item.name}</h4>
                        <p>${item.price * item.qty}</p>
                      </div>
                      {(item.color || item.size) && (
                        <p className="text-[10px] uppercase tracking-wider text-text-main/50 mt-1">
                          {item.color}{item.color && item.size ? ' / ' : ''}{item.size}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-accent-muted rounded px-2 gap-4">
                          <Minus size={14} className="cursor-pointer" onClick={() => updateQty(item.id, -1)} />
                          <span className="font-bold text-sm">{item.qty}</span>
                          <Plus size={14} className="cursor-pointer" onClick={() => updateQty(item.id, 1)} />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="rounded-lg p-1.5 text-text-main/30 transition-colors hover:bg-red-50 hover:text-red-500"
                          aria-label={`Eliminar ${item.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-8 border-t border-accent-muted">
                <div className="flex justify-between mb-6">
                  <span className="uppercase font-bold text-xs tracking-widest">Subtotal</span>
                  <span className="text-2xl font-black">${total.toFixed(2)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full bg-primary text-white py-5 rounded-xl font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all"
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
          </Motion.div>
          </>
        )}
      </AnimatePresence>

      {/* WHATSAPP BUTTON */}
      <a
        href="https://wa.me/5491100000000?text=Hola!%20Quiero%20hacer%20una%20consulta"
        target="_blank"
        rel="noopener noreferrer"
        data-testid="whatsapp-float-button"
        className="fixed bottom-6 right-6 z-50 bg-[#25d366] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}

export default App;
