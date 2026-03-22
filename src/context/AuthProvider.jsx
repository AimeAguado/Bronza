import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth-context.js'
import { apiUrl } from '../lib/api.js'

const TOKEN_KEY = 'bronza-token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function init() {
      const stored = localStorage.getItem(TOKEN_KEY)
      if (!stored) {
        setReady(true)
        return
      }
      setToken(stored)
      try {
        const res = await fetch(apiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${stored}` },
        })
        if (!res.ok) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
        } else {
          const data = await res.json()
          if (!cancelled) setUser(data.user)
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
      } finally {
        if (!cancelled) setReady(true)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || 'Error al iniciar sesión.',
        }
      }
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
      return { ok: true }
    } catch {
      return { ok: false, error: 'No hay conexión con el servidor.' }
    }
  }, [])

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return {
          ok: false,
          error: data.error || 'Error al registrarse.',
        }
      }
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
      return { ok: true }
    } catch {
      return { ok: false, error: 'No hay conexión con el servidor.' }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, token, ready, login, register, logout }),
    [user, token, ready, login, register, logout],
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}
