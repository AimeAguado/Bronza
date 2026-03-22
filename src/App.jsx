import React, { useState, useEffect } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, User, Database } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from './context/useCart.js';
import { useAuth } from './hooks/useAuth.js';
import { apiUrl } from './lib/api.js';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cart, addToCart, updateQty, setCart } = useCart();
  const { user, token } = useAuth();

  useEffect(() => {
    fetch(apiUrl('/api/products'))
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
  }, []);

  useEffect(() => {
    const status = searchParams.get('payment');
    if (!status) return;
    setPaymentStatus(status);
    setSearchParams({}, { replace: true });

    const externalReference = searchParams.get('external_reference');
    const collectionStatus = searchParams.get('collection_status');
    if (externalReference && token) {
      const confirmedStatus = collectionStatus === 'approved' ? 'approved'
        : collectionStatus === 'rejected' ? 'rejected'
        : 'pending';
      fetch(apiUrl('/api/orders/confirm'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ externalReference, status: confirmedStatus }),
      }).catch(() => {})
    }

    if (status === 'success') setCart([]);
  }, [token]);

  const handleAddToCart = (product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="min-h-screen pt-20">
      {/* HEADER */}
      <nav className="fixed inset-x-0 top-0 z-50 bg-background-light/80 backdrop-blur-md border-b border-accent-muted/40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <Database className="text-primary" size={24} />
            <span className="font-black tracking-tighter text-xl uppercase">BRONZA CLUB</span>
          </Link>
          <div className="hidden md:flex gap-8 text-[10px] font-bold tracking-[0.3em] uppercase">
            <a href="#" className="hover:text-primary transition-colors">Winter 26</a>
            <a href="#" className="hover:text-primary transition-colors">Nightwear</a>
            <a href="#" className="hover:text-primary transition-colors">Best Sellers</a>
          </div>
          <div className="flex gap-4 sm:gap-5 items-center">
            {user?.role === 'admin' && (
              <Link to="/admin/products" className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">
                Admin
              </Link>
            )}
            {user && (
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
            >
              {user ? (
                <span className="hidden sm:inline max-w-[140px] truncate text-left text-[10px] font-bold uppercase tracking-wider leading-tight">
                  {user.name}
                </span>
              ) : null}
              <User size={20} className="shrink-0" />
            </button>
            <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
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
          <m.div
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
          </m.div>
        )}
      </AnimatePresence>

      {/* HERO */}
      <section className="relative min-h-[calc(100svh-5rem)] flex items-center justify-center bg-background-light">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVsA_MnRyKEP0nf5NhhobxseMODstCYkiFWbk9PhW1_U10Z74agE8nKKiRtjsyT526v33Rj244mBrPHgN-zPEGiJktP2iqLUsU4qTlqf5msE4kXFJKfT72mWbm0ag-RH1DYm9Vkc3EtE22RlY1Hu3XBvgblDfnzIXNaLzJp-A21D1OikkQPoYMyW1ks9tPqS3zxfP7LajQ-ROHDwMCyld9hB8jZ1uhOm0oNZT7N-OraXKrRFBkINsD28Gty1k_WD8JWhSyzX0HFFUQ"
          className="absolute inset-0 w-full h-full object-contain grayscale brightness-75"
        />
        <div className="relative z-10 text-center px-6">
          <m.span initial={{opacity:0}} animate={{opacity:1}} className="text-text-main font-bold tracking-[0.5em] text-xs uppercase mb-6 block">Summer 2024 Collection</m.span>
          <m.h1 initial={{y:30, opacity:0}} animate={{y:0, opacity:1}} className="text-7xl md:text-[10rem] font-black tracking-tighter uppercase leading-[0.85] mb-8">
            BRONZA<br/><span className="text-text-main/40">CLUB</span>
          </m.h1>
          <button className="bg-text-main text-background-light px-12 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-primary transition-all scale-110">Shop the Drop</button>
        </div>
      </section>

      {/* PRODUCTS */}
      <main className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <h2 className="text-5xl font-black tracking-tighter uppercase">Chapter I: The Foundation</h2>
          <p className="max-w-xs text-sm text-text-main/50 uppercase tracking-wider font-medium italic">High-performance recovery apparel designed for post-training excellence.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {products.map(p => (
            <div key={p._id} className="group">
              <div className="aspect-[3/4] overflow-hidden bg-accent-muted/20 rounded-xl relative mb-6">
                <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <button
                  onClick={() => handleAddToCart({ ...p, id: p._id })}
                  className="absolute bottom-4 left-4 right-4 bg-text-main text-white py-4 rounded-lg font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all"
                >
                  Quick Add +
                </button>
              </div>
              <span className="text-primary font-bold text-[10px] uppercase tracking-widest">{p.volume}</span>
              <h3 className="font-bold text-xl uppercase mt-1 tracking-tight">{p.name}</h3>
              <p className="text-text-main/50 text-sm uppercase tracking-tighter font-medium">{p.category}</p>
              <p className="mt-2 font-bold">${p.price}.00</p>
            </div>
          ))}
        </div>
      </main>

      {/* CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <m.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setIsCartOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <m.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring', damping:30}} className="fixed right-0 top-0 h-full w-full max-w-md bg-background-light z-50 p-8 shadow-2xl flex flex-col">
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
                      <p className="text-xs text-text-main/50 mb-4 uppercase">{item.category}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-accent-muted rounded px-2 gap-4">
                          <Minus size={14} className="cursor-pointer" onClick={() => updateQty(item.id, -1)} />
                          <span className="font-bold text-sm">{item.qty}</span>
                          <Plus size={14} className="cursor-pointer" onClick={() => updateQty(item.id, 1)} />
                        </div>
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
            </m.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
