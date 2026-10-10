import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CartContext } from './cart-context.js'
import { useAuth } from '../hooks/useAuth.js'
import { apiUrl } from '../lib/api.js'

const STORAGE_KEY = 'bronza-cart'
const TOKEN_KEY = 'bronza-cart-token'

function createToken() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID().replace(/-/g, '')
    }
  } catch {
    /* ignorar */
  }
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`.slice(0, 32)
}

function getCartToken() {
  try {
    let token = localStorage.getItem(TOKEN_KEY)
    if (!token || token.length < 16) {
      token = createToken()
      localStorage.setItem(TOKEN_KEY, token)
    }
    return token
  } catch {
    return createToken()
  }
}

export function CartProvider({ children }) {
  const { token: authToken } = useAuth()

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

  // Persistencia local (sin cambios).
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    } catch {
      /* ignore quota / private mode */
    }
  }, [cart])

  // Sincronización con el backend para poder recordar el carrito.
  // Se omite la primera ejecución (montaje) para no "revivir" la actividad
  // de un carrito que la clienta dejó abandonado y vuelve a abrir el sitio.
  const didMountRef = useRef(false)
  const syncTimerRef = useRef(null)

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      return undefined
    }
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(() => {
      const token = getCartToken()
      const items = cart.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image,
        color: item.color,
        size: item.size,
      }))
      fetch(apiUrl('/api/cart/sync'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ token, items }),
      }).catch(() => {})
    }, 800)

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    }
  }, [cart, authToken])

  // Al iniciar sesión asociamos el email sin marcar actividad.
  useEffect(() => {
    if (!authToken) return
    const token = getCartToken()
    fetch(apiUrl('/api/cart/sync'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token, identify: true }),
    }).catch(() => {})
  }, [authToken])

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

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const cartToken = useMemo(() => getCartToken(), [])

  const value = useMemo(
    () => ({ cart, setCart, addToCart, updateQty, removeFromCart, cartToken }),
    [cart, addToCart, updateQty, removeFromCart, cartToken],
  )

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  )
}
