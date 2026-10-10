import jwt from 'jsonwebtoken'

/**
 * Igual que requireAuth pero sin bloquear: si hay un token válido deja
 * `req.user` disponible y, si no lo hay, sigue como visitante anónimo.
 * Lo usa el carrito, que debe funcionar sin sesión.
 */
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization
  const token =
    typeof header === 'string' && header.startsWith('Bearer ')
      ? header.slice(7)
      : null

  if (!token) return next()

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) return next()
    const payload = jwt.verify(token, secret)
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role ?? 'user',
    }
  } catch {
    /* token inválido/expirado: continuamos como anónimo */
  }

  return next()
}
