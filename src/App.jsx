import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, Trash2, User, Menu, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from './context/useCart.js';
import { useAuth } from './hooks/useAuth.js';
import { useCompraTranquila } from './hooks/useCompraTranquila.js';
import { apiUrl } from './lib/api.js';
import { hasStock } from './lib/stock.js';
import ProductModal from './components/ProductModal.jsx';
import Footer from './components/Footer.jsx';

const COLLECTIONS = {
  'summer-27': { label: 'SUMMER 27', categories: ['Sweters', 'Pantalones', 'Remeras', 'Bikinis'] },
};

const ABOUT_TEXT = `Bronza nació de las ganas de sentirnos lindas, cómodas y libres en nuestra propia piel.

Somos una marca de bikinis pensada para acompañarte en esos días de sol, playa, verano y momentos que se quedan para siempre.

Después de un tiempo, volvemos con una nueva temporada, nuevos diseños y las mismas ganas de hacerte sentir increíble cada vez que elegís Bronza.

Temporada 2027.

Bronzate. Brilla. Viví. ☀️`;

const HERO_VIDEO =
  'https://videos.pexels.com/video-files/36346838/15416216_1280_720_30fps.mp4';

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
  const { open: openCompraTranquila } = useCompraTranquila();
  const productsRef = useRef(null);
  const [activeCollection, setActiveCollection] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroVideoRef = useRef(null);
  const [heroReady, setHeroReady] = useState(false);

  const visibleProducts =
    activeCollection && COLLECTIONS[activeCollection]
      ? products.filter((p) => COLLECTIONS[activeCollection].categories.includes(p.category))
      : products;

  const filteredProducts = [...visibleProducts].sort(
    (a, b) => Number(hasStock(b)) - Number(hasStock(a)),
  );

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
    const video = heroVideoRef.current;
    if (!video) return;
    video.muted = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.removeAttribute('autoplay');
      const stop = () => video.pause();
      video.addEventListener('loadeddata', stop);
      video.pause();
      return () => video.removeEventListener('loadeddata', stop);
    }
    video.play().catch(() => {});
    return undefined;
  }, []);

  function handleCollectionClick(slug) {
    setActiveCollection(slug);
  }

  const fetchProducts = useCallback(() => {
    fetch(apiUrl('/api/products'))
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchProducts()
    window.addEventListener('products-updated', fetchProducts)
    return () => window.removeEventListener('products-updated', fetchProducts)
  }, [fetchProducts]);
  const paymentParam = searchParams.get('payment');
  const [processedPayment, setProcessedPayment] = useState(null);
  if (paymentParam && paymentParam !== processedPayment) {
    setProcessedPayment(paymentParam);
    setPaymentStatus(paymentParam);
    if (paymentParam === 'success') setCart([]);
  }

  useEffect(() => {
    if (!ready) return;

    const status = searchParams.get('payment');
    if (!status) return;

    const externalReference = searchParams.get('external_reference');
    const collectionStatus =
      searchParams.get('collection_status') || searchParams.get('status');

    setSearchParams({}, { replace: true });

    if (!externalReference || !token) return;

    const confirmedStatus =
      collectionStatus === 'approved'
        ? 'approved'
        : collectionStatus === 'rejected'
          ? 'rejected'
          : 'waiting_payment';

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
    <div className="min-h-screen flex flex-col">
      {/* HEADER */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-primary px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            type="button"
            aria-label="Volver arriba"
            onClick={() => { setIsMenuOpen(false); setActiveCollection(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center cursor-pointer"
          >
            <img src="/logo-wordmark.svg" alt="Bronza Club" className="h-6" />
          </button>
          <div className="hidden md:flex gap-8 text-xs font-bold tracking-[0.3em] uppercase text-background-light/75">
            <Link
              to="/"
              onClick={() => { setActiveCollection(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="transition-colors hover:text-accent"
            >
              Inicio
            </Link>
            {Object.entries(COLLECTIONS).map(([slug, { label }]) => (
              <button
                key={slug}
                type="button"
                onClick={() => handleCollectionClick(slug)}
                className={`transition-colors ${activeCollection === slug ? 'text-accent' : 'hover:text-accent'}`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsAboutOpen(true)}
              className="transition-colors hover:text-accent"
            >
              SOMOS BRONZA
            </button>
            <button
              type="button"
              onClick={openCompraTranquila}
              className="transition-colors hover:text-accent"
            >
              COMPRA TRANQUILA
            </button>
          </div>
          <div className="flex gap-4 sm:gap-5 items-center text-background-light">
            {user?.role === 'admin' && (
              <Link to="/admin/products" className="text-[10px] font-bold uppercase tracking-wider text-accent hover:underline">
                Admin
              </Link>
            )}
            {user && user.role !== 'admin' && (
              <Link to="/orders" className="text-[10px] font-bold uppercase tracking-wider text-background-light/60 hover:text-accent transition-colors">
                Pedidos
              </Link>
            )}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-background-light hover:text-accent transition-colors"
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
            <div className="relative cursor-pointer" data-testid="nav-cart-icon" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-primary text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((a, b) => a + b.qty, 0)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="md:hidden text-background-light hover:text-accent transition-colors"
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <Motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden"
            >
              <div className="max-w-7xl mx-auto flex flex-col text-xs font-bold tracking-[0.3em] uppercase text-background-light/75">
                <Link
                  to="/"
                  onClick={() => { setIsMenuOpen(false); setActiveCollection(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="border-t border-background-light/10 py-4 transition-colors hover:text-accent"
                >
                  Inicio
                </Link>
                {Object.entries(COLLECTIONS).map(([slug, { label }]) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => { setIsMenuOpen(false); handleCollectionClick(slug); }}
                    className={`border-t border-background-light/10 py-4 text-left transition-colors ${activeCollection === slug ? 'text-accent' : 'hover:text-accent'}`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setIsMenuOpen(false); setIsAboutOpen(true); }}
                  className="border-t border-background-light/10 py-4 text-left transition-colors hover:text-accent"
                >
                  SOMOS BRONZA
                </button>
                <button
                  type="button"
                  onClick={() => { setIsMenuOpen(false); openCompraTranquila(); }}
                  className="border-t border-background-light/10 py-4 text-left transition-colors hover:text-accent"
                >
                  COMPRA TRANQUILA
                </button>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
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
                ? 'bg-primary text-background-light'
                : paymentStatus === 'failure'
                ? 'bg-accent-muted text-primary'
                : 'bg-accent text-primary'
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
      <section className="relative min-h-svh flex items-center justify-center bg-primary overflow-hidden">
        <video
          ref={heroVideoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${heroReady ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setHeroReady(true)}
          aria-hidden="true"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/75 via-primary/35 to-primary/90" />
        <div className="relative z-10 text-center px-6">
          <Motion.h1 initial={{y:30, opacity:0}} animate={{y:0, opacity:1}} className="text-7xl md:text-[10rem] font-black tracking-tighter uppercase leading-[0.85] mb-8 text-background-light">
            BRONZA<br/><span className="text-background-light/50">CLUB</span>
          </Motion.h1>
          <button onClick={() => productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="bg-accent text-primary px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-background-light hover:text-primary transition-all scale-110">Shop the Drop</button>
        </div>
      </section>

      {/* PRODUCTS */}
      <main className="max-w-7xl mx-auto px-6 py-32">
        <div ref={productsRef} className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <h2 className="text-5xl font-black tracking-tighter uppercase">
            {activeCollection ? COLLECTIONS[activeCollection].label : 'Shop the Drop'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {filteredProducts.map(p => {
            const firstImg = p.variants?.[0]?.images?.[0]
            const inStock = hasStock(p)
            return (
              <div key={p._id} className="group cursor-pointer" onClick={() => openModal(p)} data-testid="product-card" data-in-stock={inStock ? 'true' : 'false'}>
                <div className="aspect-[3/4] overflow-hidden bg-accent-muted/20 rounded-xl relative mb-6">
                  {firstImg ? (
                    <img
                      src={firstImg}
                      alt={p.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-accent-muted">
                      Sin imagen
                    </div>
                  )}
                  {!inStock && (
                    <span className="absolute top-4 left-4 bg-primary text-background-light px-3 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest">
                      Sin stock
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-xl uppercase mt-1 tracking-tight">{p.name}</h3>
                <p className="text-text-main/50 text-sm uppercase tracking-tighter font-medium">{p.category}</p>
                <p className="mt-2 font-bold">${p.price.toLocaleString('es-AR')}</p>
                <button
                  type="button"
                  data-testid="add-to-cart-button"
                  disabled={!inStock}
                  onClick={(e) => {
                    e.stopPropagation()
                    openModal(p)
                  }}
                  className={`mt-3 w-full py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all ${inStock ? 'bg-primary text-background-light hover:bg-accent hover:text-primary' : 'bg-accent-muted/30 text-accent-muted/60 cursor-not-allowed'}`}
                >
                  {inStock ? 'Agregar al carrito' : 'Sin stock'}
                </button>
              </div>
            )
          })}
            </div>
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
            <Motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring', damping:30}} className="fixed right-0 top-0 h-full w-full max-w-md bg-background-light z-50 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between border-b border-accent-muted/40 px-6 py-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent-muted">Bronza Club</p>
                  <h2 className="mt-1 text-2xl font-black uppercase tracking-tighter">Tu bolsa</h2>
                </div>
                <button
                  type="button"
                  data-testid="cart-drawer-close"
                  onClick={() => setIsCartOpen(false)}
                  className="rounded-full p-2 text-text-main/50 transition-colors hover:bg-accent/20 hover:text-primary"
                  aria-label="Cerrar"
                >
                  <X size={22} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-primary">
                    <ShoppingBag size={26} />
                  </span>
                  <p className="mt-5 text-sm font-bold uppercase tracking-widest text-text-main/50">Tu bolsa está vacía</p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 rounded-full bg-primary px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-background-light transition-colors hover:bg-accent hover:text-primary"
                  >
                    Ver productos
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-grow overflow-y-auto px-6 py-5 space-y-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 rounded-2xl border border-accent-muted/30 bg-white/60 p-3">
                        <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-accent-muted/20">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="truncate font-bold uppercase text-sm tracking-tight">{item.name}</h4>
                              {(item.color || item.size) && (
                                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-text-main/50">
                                  {item.color}{item.color && item.size ? ' / ' : ''}{item.size}
                                </p>
                              )}
                            </div>
                            <p className="shrink-0 font-black text-sm">${item.price * item.qty}</p>
                          </div>
                          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                            <div className="flex items-center rounded-full border border-accent-muted/50 bg-white">
                              <button type="button" onClick={() => updateQty(item.id, -1)} aria-label="Restar" className="flex h-8 w-8 items-center justify-center rounded-full text-text-main/70 transition-colors hover:bg-accent/20 hover:text-primary">
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                              <button type="button" onClick={() => updateQty(item.id, 1)} aria-label="Sumar" className="flex h-8 w-8 items-center justify-center rounded-full text-text-main/70 transition-colors hover:bg-accent/20 hover:text-primary">
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              aria-label={`Eliminar ${item.name}`}
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-main/40 transition-colors hover:bg-accent/20 hover:text-primary"
                            >
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-accent-muted/40 px-6 py-5">
                    <div className="flex items-end justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                      <span className="text-2xl font-black">${total.toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      data-testid="cart-drawer-view-cart"
                      onClick={() => {
                        setIsCartOpen(false);
                        navigate('/carrito');
                      }}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-xs font-bold uppercase tracking-widest text-background-light transition-all hover:bg-accent hover:text-primary"
                    >
                      Ir al carrito
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </>
              )}
          </Motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ABOUT US MODAL */}
      <AnimatePresence>
        {isAboutOpen && (
          <>
            <Motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setIsAboutOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />
            <Motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} transition={{type:'spring', damping:25, stiffness:300}} className="fixed inset-x-0 top-1/2 -translate-y-1/2 mx-4 z-[60] max-w-2xl md:mx-auto">
              <div className="relative bg-background-light rounded-2xl shadow-2xl p-8 md:p-12">
                <button
                  type="button"
                  onClick={() => setIsAboutOpen(false)}
                  className="absolute top-4 right-4 p-2 text-text-main/40 hover:text-primary transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-8">SOMOS BRONZA</h2>
                <div className="space-y-6 text-text-main/80 leading-relaxed text-base whitespace-pre-line">
                  {ABOUT_TEXT}
                </div>
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
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-6">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      <Footer />
    </div>
  );
}

export default App;
