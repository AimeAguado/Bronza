import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  const token =
    typeof header === 'string' && header.startsWith('Bearer ')
      ? header.slice(7)
      : null

  if (!token) {
    return res.status(401).json({ error: 'No autorizado.' })
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      return res.status(500).json({ error: 'Servidor sin JWT_SECRET configurado.' })
    }
    const payload = jwt.verify(token, secret)
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role ?? 'user',
    }
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado.' })
  }
}
