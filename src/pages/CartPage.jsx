import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart.js'

export default function CartPage() {
  const navigate = useNavigate()
  const { cart, updateQty, removeFromCart } = useCart()

  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0)

  return (
    <div className="min-h-screen bg-background-light pt-20 px-6 pb-12 text-text-main">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-black uppercase tracking-tighter">
          Tu carrito
        </h2>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl border-2 border-text-main/20 bg-transparent px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-text-main transition-colors hover:border-primary hover:text-primary"
        >
          Seguir comprando
        </button>

        {cart.length === 0 ? (
          <p
            data-testid="cart-empty-message"
            className="mt-10 text-center text-sm text-text-main/50 uppercase tracking-widest font-bold"
          >
            Tu carrito está vacío
          </p>
        ) : (
          <>
            <ul className="mt-6 space-y-4">
              {cart.map((item) => (
                <li
                  key={item.id}
                  data-testid="cart-item"
                  className="flex gap-4 border-b border-accent-muted/40 pb-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
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
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-accent-muted rounded px-2 gap-3">
                        <button
                          type="button"
                          data-testid="cart-item-decrease-button"
                          onClick={() => updateQty(item.id, -1)}
                          className="cursor-pointer text-sm font-bold"
                        >
                          -
                        </button>
                        <span data-testid="cart-item-quantity" className="font-bold text-sm">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          data-testid="cart-item-increase-button"
                          onClick={() => updateQty(item.id, 1)}
                          className="cursor-pointer text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        data-testid="cart-item-remove-button"
                        onClick={() => removeFromCart(item.id)}
                        className="rounded-lg p-1.5 text-text-main/30 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-accent-muted/40">
              <div className="flex justify-between mb-6">
                <span className="uppercase font-bold text-xs tracking-widest">Total</span>
                <span data-testid="cart-total" className="text-2xl font-black">
                  ${total.toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                data-testid="cart-checkout-button"
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary text-white py-5 rounded-xl font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all"
              >
                Ir a checkout
              </button>
            </div>
          </>
        )}

        {cart.length === 0 && (
          <button
            type="button"
            data-testid="cart-checkout-button"
            disabled
            onClick={() => navigate('/checkout')}
            className="mt-8 w-full bg-primary text-white py-5 rounded-xl font-bold uppercase tracking-widest text-xs opacity-40 cursor-not-allowed"
          >
            Ir a checkout
          </button>
        )}
      </div>
    </div>
  )
}
