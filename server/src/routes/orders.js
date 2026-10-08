import { Router } from 'express'
import { Order } from '../models/Order.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const router = Router()

const VALID_STATUSES = [
  'pending',
  'waiting_payment',
  'approved',
  'shipped',
  'delivered',
  'rejected',
  'cancelled',
]

const FULFILLMENT_STATUSES = ['shipped', 'delivered', 'cancelled']

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
    const validStatuses = VALID_STATUSES
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' })
    }
    const order = await Order.findOne({ externalReference, userId: req.user.id })
    if (!order) return res.status(404).json({ error: 'Orden no encontrada.' })
    if (FULFILLMENT_STATUSES.includes(order.status)) {
      return res.json({ order })
    }
    order.status = status
    await order.save()
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

router.patch('/admin/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {}
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' })
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).populate('userId', 'name email')
    if (!order) return res.status(404).json({ error: 'Orden no encontrada.' })
    return res.json({ order })
  } catch (e) {
    if (e.name === 'CastError') {
      return res.status(404).json({ error: 'Orden no encontrada.' })
    }
    console.error(e)
    return res.status(500).json({ error: 'Error al actualizar el estado.' })
  }
})

export default router
