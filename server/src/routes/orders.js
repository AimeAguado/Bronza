import { Router } from 'express'
import { isValidObjectId } from 'mongoose'
import { Order } from '../models/Order.js'
import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js'
import { PendingCheckout } from '../models/PendingCheckout.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { sendOrderConfirmationEmail } from '../lib/email.js'

const router = Router()

function orderNumberFromId(id) {
  return String(id).slice(-6).toUpperCase()
}

function sanitizeOrderItems(rawItems) {
  if (!Array.isArray(rawItems)) return null
  const items = []
  for (const raw of rawItems) {
    if (!raw || typeof raw !== 'object') continue
    const title = typeof raw.title === 'string' ? raw.title.trim() : ''
    const quantity = Number(raw.quantity)
    let unit_price = Number(raw.unit_price)
    if (!title || !Number.isFinite(quantity) || quantity < 1) continue
    if (!Number.isFinite(unit_price) || unit_price <= 0) continue
    unit_price = Math.round(unit_price * 100) / 100
    items.push({
      id: String(raw.id ?? title),
      productId: typeof raw.productId === 'string' ? raw.productId : '',
      title,
      quantity: Math.floor(quantity),
      unit_price,
      image: typeof raw.image === 'string' ? raw.image : '',
      color: typeof raw.color === 'string' ? raw.color : '',
      size: typeof raw.size === 'string' ? raw.size : '',
    })
  }
  return items
}

/** Resuelve el _id del producto de un ítem (campo productId o prefijo del id). */
function resolveProductId(item) {
  const fromField = typeof item?.productId === 'string' ? item.productId : ''
  const fromId = String(item?.id ?? '').split('-')[0]
  return [fromField, fromId].find((id) => isValidObjectId(id)) || null
}

/**
 * Descuenta del stock los productos de un pedido (color + talle).
 * Se ejecuta una sola vez por pedido (ver `stockAdjusted`).
 */
async function decrementStockForOrder(order) {
  for (const item of order.items ?? []) {
    const productId = resolveProductId(item)
    if (!productId) continue
    const product = await Product.findById(productId).catch(() => null)
    if (!product || !product.variants?.length) continue

    const wanted = (item.color ?? '').trim().toLowerCase()
    let variant = product.variants.find(
      (v) => (v.color ?? '').trim().toLowerCase() === wanted,
    )
    if (!variant && product.variants.length === 1) variant = product.variants[0]
    if (!variant || !variant.stock) continue

    const size = (item.size ?? '').trim()
    const qty = Number(item.quantity) || 0
    if (!size || qty <= 0) continue

    const current = Number(variant.stock.get(size) ?? 0)
    variant.stock.set(size, Math.max(0, current - qty))
    await product.save()
  }
}

/** Si el pedido quedó aprobado, descuenta stock una única vez. */
async function applyStockAdjustment(order) {
  if (order.status !== 'approved' || order.stockAdjusted) return
  await decrementStockForOrder(order)
  order.stockAdjusted = true
  await order.save()
}

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

const EDITABLE_STATUSES = ['pending', 'waiting_payment', 'rejected']

router.get('/my', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 })
    return res.json({ orders })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Error al obtener pedidos.' })
  }
})

/**
 * Confirma un pedido pagado por transferencia bancaria.
 * Crea la orden, marca el carrito como completado (frena recordatorios) y
 * envía el correo de confirmación con el resumen.
 */
router.post('/transfer', requireAuth, async (req, res) => {
  try {
    const { items: rawItems, cartToken } = req.body || {}
    const items = sanitizeOrderItems(rawItems)
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Enviá al menos un ítem.' })
    }
    const total = items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0)

    const order = await Order.create({
      userId: req.user.id,
      items,
      total,
      status: 'waiting_payment',
      paymentMethod: 'transfer',
      cartToken: typeof cartToken === 'string' ? cartToken : undefined,
    })
    order.number = orderNumberFromId(order._id)
    await order.save()

    if (order.cartToken) {
      await Cart.updateOne(
        { token: order.cartToken },
        { $set: { status: 'completed', reminderSentAt: new Date() } },
      ).catch((err) => console.error('[orders] no se pudo completar carrito:', err))
    }

    const mail = await sendOrderConfirmationEmail({
      to: req.user.email,
      order,
    }).catch((err) => ({ ok: false, error: err?.message }))
    if (!mail.ok && !mail.skipped) {
      console.error('[orders] no se pudo enviar el correo de confirmación:', mail.error)
    }

    return res.status(201).json({ order })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'No se pudo confirmar el pedido.' })
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

router.delete('/my/:id/items/:itemId', requireAuth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id })
    if (!order) return res.status(404).json({ error: 'Orden no encontrada.' })
    if (!EDITABLE_STATUSES.includes(order.status)) {
      return res.status(400).json({ error: 'Este pedido ya no puede modificarse.' })
    }
    const item = order.items.id(req.params.itemId)
    if (!item) {
      return res.status(404).json({ error: 'Producto no encontrado en el pedido.' })
    }
    item.deleteOne()
    if (order.items.length === 0) {
      await order.deleteOne()
      return res.json({ deleted: true })
    }
    order.total = order.items.reduce(
      (acc, i) => acc + i.unit_price * i.quantity,
      0,
    )
    await order.save()
    return res.json({ order })
  } catch (e) {
    if (e.name === 'CastError') {
      return res.status(404).json({ error: 'Producto no encontrado en el pedido.' })
    }
    console.error(e)
    return res.status(500).json({ error: 'Error al eliminar el producto.' })
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

    // Idempotencia: si la orden ya se creó, la devolvemos sin reenviar el correo.
    const existing = await Order.findOne({
      externalReference,
      userId: req.user.id,
    })
    if (existing) return res.json({ order: existing })

    const pending = await PendingCheckout.findOne({
      externalReference,
      userId: req.user.id,
    })
    if (!pending) return res.status(404).json({ error: 'Orden no encontrada.' })

    // Pago no aprobado: no registramos pedido, descartamos el borrador.
    if (status !== 'approved') {
      await pending.deleteOne()
      return res.json({ order: null, status })
    }

    const order = await Order.create({
      userId: req.user.id,
      items: pending.items,
      total: pending.total,
      status: 'approved',
      paymentMethod: 'mercadopago',
      externalReference,
      preferenceId: pending.preferenceId,
      cartToken: pending.cartToken,
    })
    order.number = orderNumberFromId(order._id)
    await order.save()

    if (order.cartToken) {
      await Cart.updateOne(
        { token: order.cartToken },
        { $set: { status: 'completed', reminderSentAt: new Date() } },
      ).catch((err) => console.error('[orders] no se pudo completar carrito:', err))
    }

    await pending.deleteOne()

    // El pago se aprobó: descontamos el stock de los productos.
    await applyStockAdjustment(order).catch((err) =>
      console.error('[orders] no se pudo descontar stock:', err),
    )

    const mail = await sendOrderConfirmationEmail({
      to: req.user.email,
      order,
    }).catch((err) => ({ ok: false, error: err?.message }))
    if (!mail.ok && !mail.skipped) {
      console.error('[orders] no se pudo enviar el correo de confirmación:', mail.error)
    }

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

    // Al marcar el pago como realizado ("approved") se descuenta el stock.
    await applyStockAdjustment(order).catch((err) =>
      console.error('[orders] no se pudo descontar stock:', err),
    )

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
