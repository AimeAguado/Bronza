import { Router } from 'express'
import { randomBytes } from 'node:crypto'
import { isValidObjectId } from 'mongoose'
import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js'
import { optionalAuth } from '../middleware/optionalAuth.js'

const router = Router()

function newToken() {
  return randomBytes(24).toString('hex')
}

function sanitizeItems(rawItems) {
  if (!Array.isArray(rawItems)) return null
  const items = []
  for (const raw of rawItems) {
    if (!raw || typeof raw !== 'object') continue
    const name = typeof raw.name === 'string' ? raw.name.trim() : ''
    const price = Number(raw.price)
    const qty = Number(raw.qty)
    if (!name || !Number.isFinite(price) || price < 0) continue
    if (!Number.isFinite(qty) || qty < 1) continue
    items.push({
      productId: typeof raw.productId === 'string' ? raw.productId : '',
      itemId: typeof raw.id === 'string' ? raw.id : '',
      name,
      price: Math.round(price * 100) / 100,
      qty: Math.min(Math.floor(qty), 99),
      image: typeof raw.image === 'string' ? raw.image : '',
      color: typeof raw.color === 'string' ? raw.color : '',
      size: typeof raw.size === 'string' ? raw.size : '',
    })
  }
  return items
}

function computeTotals(items) {
  return {
    total: items.reduce((acc, i) => acc + i.price * i.qty, 0),
    itemCount: items.reduce((acc, i) => acc + i.qty, 0),
  }
}

function itemKey(item) {
  return `${item.itemId}|${item.productId}|${item.qty}|${item.price}`
}

function sameItems(a, b) {
  if (a.length !== b.length) return false
  const sa = a.map(itemKey).sort()
  const sb = b.map(itemKey).sort()
  return sa.every((value, idx) => value === sb[idx])
}

function toClientItem(item) {
  return {
    id:
      item.itemId ||
      `${item.productId || 'producto'}-${item.color || ''}-${item.size || ''}`,
    productId: item.productId || '',
    name: item.name,
    price: item.price,
    qty: item.qty,
    image: item.image || '',
    color: item.color || '',
    size: item.size || '',
  }
}

/**
 * Guarda / actualiza el carrito del navegador (funciona sin sesión).
 * Si hay sesión, asocia el email y el userId para poder recordarle después.
 * Body: { token, items, identify? }
 */
router.post('/sync', optionalAuth, async (req, res) => {
  try {
    const token =
      typeof req.body?.token === 'string' ? req.body.token.trim() : ''
    if (token.length < 16) {
      return res.status(400).json({ error: 'Token de carrito inválido.' })
    }

    const email = req.user?.email || ''
    const userId = req.user?.id || null

    // Solo identificación (login): asocia el email sin tocar la actividad.
    if (req.body?.identify === true) {
      if (!email) return res.json({ ok: true })
      await Cart.updateOne(
        { token },
        { $set: { email, ...(userId ? { userId } : {}) } },
      )
      return res.json({ ok: true })
    }

    const items = sanitizeItems(req.body?.items)
    if (items === null) {
      return res.status(400).json({ error: 'Items inválidos.' })
    }

    let cart = await Cart.findOne({ token })

    if (!cart) {
      if (items.length === 0) return res.json({ ok: true, empty: true })
      cart = new Cart({
        token,
        recoveryToken: newToken(),
        unsubscribeToken: newToken(),
        items,
        ...computeTotals(items),
        email,
        userId,
        status: 'active',
        lastActivityAt: new Date(),
      })
      await cart.save()
      return res.json({ ok: true })
    }

    // Carrito ya comprado: si el contenido no cambió, no lo resucitamos.
    if (cart.status === 'completed') {
      const stored = cart.items.map((i) => ({
        itemId: i.itemId,
        productId: i.productId,
        qty: i.qty,
        price: i.price,
      }))
      if (sameItems(stored, items)) {
        return res.json({ ok: true, completed: true })
      }
      cart.reminderSentAt = null
      cart.reminderCount = 0
      cart.recoveredAt = null
    }

    if (items.length === 0) {
      await cart.deleteOne()
      return res.json({ ok: true, empty: true })
    }

    cart.items = items
    const totals = computeTotals(items)
    cart.total = totals.total
    cart.itemCount = totals.itemCount
    cart.lastActivityAt = new Date()
    if (email) cart.email = email
    if (userId) cart.userId = userId
    if (cart.status !== 'active') cart.status = 'active'

    await cart.save()
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'No se pudo guardar el carrito.' })
  }
})

/**
 * Recupera un carrito desde el enlace del correo.
 * Valida disponibilidad y precio actual contra el catálogo, pero NO marca
 * la compra como completada: solo deja de recordar (status `recovered`).
 */
router.get('/recover/:token', async (req, res) => {
  try {
    const token = String(req.params.token || '')
    if (token.length < 16) {
      return res.status(404).json({ error: 'Carrito no encontrado.' })
    }

    const cart = await Cart.findOne({ recoveryToken: token })
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado.' })
    }

    const items = []
    const removed = []

    for (const item of cart.items) {
      let available = true
      let name = item.name
      let price = item.price
      let image = item.image

      if (item.productId && isValidObjectId(item.productId)) {
        const product = await Product.findById(item.productId).catch(() => null)
        if (!product || product.active === false) {
          available = false
        } else {
          name = product.name
          price = product.price
          const hasVariants = Array.isArray(product.variants) && product.variants.length > 0
          const variant = hasVariants
            ? product.variants.find((v) => v.color === item.color)
            : null
          if (item.color && hasVariants && !variant) available = false
          if (variant) {
            if (variant.images?.[0] && !image) image = variant.images[0]
            if (item.size) {
              const stock = variant.stock?.get?.(item.size) ?? 0
              if (stock <= 0) available = false
            }
          }
          if (
            item.size &&
            Array.isArray(product.sizes) &&
            product.sizes.length > 0 &&
            !product.sizes.includes(item.size)
          ) {
            available = false
          }
        }
      }

      const mapped = toClientItem({ ...item.toObject(), name, price, image })
      if (available) items.push(mapped)
      else removed.push(mapped)
    }

    if (cart.status === 'active') {
      cart.status = 'recovered'
      cart.recoveredAt = new Date()
      await cart.save()
    }

    return res.json({ ok: true, items, removed })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'No se pudo recuperar el carrito.' })
  }
})

/** Baja de los recordatorios (para ese email). */
router.post('/unsubscribe', async (req, res) => {
  try {
    const token =
      typeof req.body?.token === 'string' ? req.body.token.trim() : ''
    if (token.length < 16) {
      return res.status(400).json({ error: 'Token inválido.' })
    }

    const cart = await Cart.findOne({ unsubscribeToken: token })
    // No revelamos si el token existe o no.
    if (!cart) return res.json({ ok: true })

    if (cart.email) {
      await Cart.updateMany({ email: cart.email }, { $set: { unsubscribed: true } })
    } else {
      cart.unsubscribed = true
      await cart.save()
    }

    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'No se pudo procesar la baja.' })
  }
})

export default router
