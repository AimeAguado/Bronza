import { Router } from 'express'
import { isValidObjectId } from 'mongoose'
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

router.post('/my/:id/withdrawal', requireAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id })
    if (!order) return res.status(404).json({ error: 'Orden no encontrada.' })
    if (FULFILLMENT_STATUSES.includes(order.status)) {
      return res
        .status(400)
        .json({ error: 'Este pedido ya fue enviado o finalizado y no puede cancelarse.' })
    }
    order.status = 'cancelled'
    await order.save()
    return res.json({ order })
  } catch (e) {
    if (e.name === 'CastError') {
      return res.status(404).json({ error: 'Orden no encontrada.' })
    }
    console.error(e)
    return res.status(500).json({ error: 'Error al cancelar el pedido.' })
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

router.delete('/admin', requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body || {}
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Enviá al menos un pedido.' })
    }
    if (ids.some((id) => !isValidObjectId(id))) {
      return res.status(400).json({ error: 'Ids inválidos.' })
    }
    const result = await Order.deleteMany({ _id: { $in: ids } })
    return res.json({ ok: true, deleted: result.deletedCount })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Error al eliminar los pedidos.' })
  }
})

router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)
    if (!order) return res.status(404).json({ error: 'Orden no encontrada.' })
    return res.json({ ok: true, order })
  } catch (e) {
    if (e.name === 'CastError') {
      return res.status(404).json({ error: 'Orden no encontrada.' })
    }
    console.error(e)
    return res.status(500).json({ error: 'Error al eliminar el pedido.' })
  }
})

export default router
