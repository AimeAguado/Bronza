import { isValidObjectId } from 'mongoose'
import { Product } from '../models/Product.js'

/**
 * Estados en los que el pago ya está realizado. En cualquiera de ellos el stock
 * del producto vendido debe estar descontado (una única vez por pedido).
 */
export const PAID_STATUSES = ['approved', 'shipped', 'delivered']

/** Resuelve el _id del producto de un ítem (campo productId o prefijo del id). */
export function resolveProductId(item) {
  const fromField = typeof item?.productId === 'string' ? item.productId : ''
  const fromId = String(item?.id ?? '').split('-')[0]
  return [fromField, fromId].find((id) => isValidObjectId(id)) || null
}

/**
 * Descuenta del stock los productos de un pedido (color + talle).
 * No controla idempotencia: usar `applyStockAdjustment`.
 */
export async function decrementStockForOrder(order) {
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

/**
 * Si el pedido está pago y todavía no se descontó, descuenta el stock una única
 * vez (flag `stockAdjusted`). Devuelve true si aplicó el descuento.
 */
export async function applyStockAdjustment(order) {
  if (!PAID_STATUSES.includes(order.status) || order.stockAdjusted) return false
  await decrementStockForOrder(order)
  order.stockAdjusted = true
  await order.save()
  return true
}
