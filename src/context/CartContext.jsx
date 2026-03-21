import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext } from './cart-context.js'

const STORAGE_KEY = 'bronza-cart'

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    } catch {
      /* ignore quota / private mode */
    }
  }, [cart])

  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }, [])

  const updateQty = useCallback((id, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item,
      ),
    )
  }, [])

  const value = useMemo(
    () => ({ cart, setCart, addToCart, updateQty }),
    [cart, addToCart, updateQty],
  )

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  )
}
