import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

const SALT_ROUNDS = 10
const JWT_EXPIRES = '7d'

function signToken(user) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET no configurado')
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    secret,
    { expiresIn: JWT_EXPIRES },
  )
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {}
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({ error: 'Datos inválidos.' })
    }
    const trimmedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()
    if (!trimmedName || !normalizedEmail || password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Nombre, email y contraseña (mín. 6) requeridos.' })
    }

    const existing = await User.findOne({ email: normalizedEmail })
    if (existing) {
      return res.status(409).json({ error: 'Ese email ya está registrado.' })
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await User.create({ name: trimmedName, email: normalizedEmail, passwordHash })

    const token = signToken(user)
    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Error al registrar.' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email y contraseña requeridos.' })
    }
    const normalizedEmail = email.trim().toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos.' })
    }

    const token = signToken(user)
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Error al iniciar sesión.' })
  }
})

router.get('/me', requireAuth, (req, res) => {
  return res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
    },
  })
})

export default router
