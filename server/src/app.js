import express from 'express'
import cors from 'cors'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { connectDB } from './lib/db.js'
import authRoutes from './routes/auth.js'
import paymentsRoutes from './routes/payments.js'
import productsRoutes from './routes/products.js'
import ordersRoutes from './routes/orders.js'
import { Product } from './models/Product.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function createApp() {
  const app = express()

  const origin = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) || true
  app.use(cors({ origin, credentials: true }))
  app.use(express.json({ limit: '1mb' }))
  app.use((_req, _res, next) => connectDB().then(next).catch(next))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await Product.findById(req.params.id)
      if (!product || !product.active) {
        return res.status(404).json({ error: 'Producto no encontrado.' })
      }
      return res.json({ product })
    } catch (e) {
      if (e.name === 'CastError') {
        return res.status(404).json({ error: 'Producto no encontrado.' })
      }
      console.error(e)
      return res.status(500).json({ error: 'Error al obtener producto.' })
    }
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
