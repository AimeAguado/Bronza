import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import paymentsRoutes from './routes/payments.js'
import productsRoutes from './routes/products.js'
import ordersRoutes from './routes/orders.js'

export function createApp() {
  const app = express()

  const origin = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) || true
  app.use(cors({ origin, credentials: true }))
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/payments', paymentsRoutes)
  app.use('/api/products', productsRoutes)
  app.use('/api/orders', ordersRoutes)

  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ error: 'Error interno del servidor.' })
  })

  return app
}
