/**
 * Base de la API. En desarrollo, vacío + proxy de Vite → /api → servidor.
 * En producción: VITE_API_URL=https://tu-api.com
 */
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`
  return API_BASE ? `${API_BASE}${p}` : p
}
