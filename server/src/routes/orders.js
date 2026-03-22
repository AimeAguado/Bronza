import { Router } from 'express'
import { Order } from '../models/Order.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

router.get('/my', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 })
    return res.json({ orders })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Error al obtener pedidos.' })
  }
})

router.patch('/confirm', requireAuth, async (req, res) => {
  try {
    const { externalReference, status } = req.body || {}
    if (!externalReference || !status) {
      return res.status(400).json({ error: 'externalReference y status son requeridos.' })
    }
    const validStatuses = ['approved', 'rejected', 'pending']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' })
    }
    const order = await Order.findOneAndUpdate(
      { externalReference, userId: req.user.id },
      { status },
      { new: true },
    )
    if (!order) return res.status(404).json({ error: 'Orden no encontrada.' })
    return res.json({ order })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Error al confirmar orden.' })
  }
})

router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
    return res.json({ orders })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Error al obtener pedidos.' })
  }
})

export default router
