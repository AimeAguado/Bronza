import React, { useState } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, User, Database } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from './context/useCart.js';
import { useAuth } from './hooks/useAuth.js';

const PRODUCTS = [
  {
    id: 1,
    name: "The Shell",
    category: "Heavyweight Hoodie",
    color: "Shark Gray",
    price: 145.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMgt-P5xwcMuH8ODKNQApSfeYBH1mLPhHQTQmPXM_KG-BOjWOEuadoRVDz8_WFXC7xHw_2ruIQNRlDt8OC5zy5NtzVrOvo8WhpABlIkDqtXLFFG4o4zLKsI4wbdX1FIwEhVV8Saw63rle6KzmWF6fFXaf1ioYj6zy3DvwRZR3qvflWDtUUFoU5rPKdo477veLdkApucRGLSDLAhhxxJYLAAsPxnzVv3lvlaxLp7gT1cXEcmxgUSKfAu8BZWBGU-OtS4obEV_MWQ2dW",
    volume: "Volume 01"
  },
  {
    id: 2,
    name: "Kinetic",
    category: "Performance Jogger",
    color: "Iron",
    price: 110.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKL48PSgOivAyDv7H9_ENMxqNFT3yBCKjsU6RP-IU6cwf3jobATgF3q7tzj2bC-PQb1QFTwjfnGnIzRfSPCnhoD3eE7vJOVwj_QzeZjuKR7msm_0xiv5xbOZH_DbX-fILE53gxkB0NPJKD0thXuJFR7B97ihyVw2tooWBmHRhPxONMExWLGD1iwPdj3r7aDS_JnVp744xB0cqv2ziqblS4ZPHE0FnqmtTnqaf-BdntThHrL-ZRw3pecig0lS4Jgl56AYJogvFpgSJ5",
    volume: "Volume 02"
  },
  {
    id: 3,
    name: "Thermal",
    category: "Insulated Vest",
    color: "Off-white",
    price: 180.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYB4RvDcr1JRaZhYEpiNehLD7kp-qUip0wWRzkI2h_irxnoIiapN_CoPWFwH2dZj4x7v8v_Aq57noqxw-FppuUsCQ_dKWgEYDbjM36N8HpCAO5k5b54bIx4J7P3JA8OSu3HRdlsMpC99V_c8ldaXnTudZpVlTKxmRarJbMOqaN2yNvuxUQys5dOGwwwnfHQs-rg2xjd0Sf0hhqP1gRwDLPcHHJjMpLLdJ3S1mlMVKPIaQqO5294KFkNoGGXvQcRiqzJ7PbKOO55aNL",
    volume: "Volume 03"
  },
  {
    id: 4,
    name: "Core",
    category: "Essential Tee",
    color: "Shark Gray",
    price: 65.00,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJgDCmISOO9rov6YTd68-AtIbHn9Y6tfVv-TLQ83nm8V1uxxZOmgk6E5U7MJy1G-n8Z1G1TGB53zdm6tAWJ8VuGpyiAIhPnqO1Toxxdm9GHjuk39BLVcEgoaCpdd5FO7FuUTnEHPE3RqaJJTMm44rNla2C2l8LbvxvTLhdFhfhlV_E-Ogmtdje5lxSQjpsteMwbkNwt1CVB38eWrDSMxTxwdjvmOe5aSUtmpUBxnhoFa8bum9FSuM7KkNYIhqEgT3PVaujYxedGlXJ",
    volume: "Volume 04"
  }
];

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const { cart, addToCart, updateQty } = useCart();
  const { user } = useAuth();

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
          <Link
            to="/"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Database className="text-primary" size={24} />
            <span className="font-black tracking-tighter text-xl uppercase">BRONZA CLUB</span>
          </Link>
          <div className="hidden md:flex gap-8 text-[10px] font-bold tracking-[0.3em] uppercase">
            <a href="#" className="hover:text-primary transition-colors">Winter 26</a>
            <a href="#" className="hover:text-primary transition-colors">Nightwear</a>
            <a href="#" className="hover:text-primary transition-colors">Best Sellers</a>
          </div>
          <div className="flex gap-4 sm:gap-5 items-center">
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
          {PRODUCTS.map(p => (
            <div key={p.id} className="group">
              <div className="aspect-[3/4] overflow-hidden bg-accent-muted/20 rounded-xl relative mb-6">
                <img src={p.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <button 
                  onClick={() => handleAddToCart(p)}
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