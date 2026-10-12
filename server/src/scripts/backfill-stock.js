import 'dotenv/config'
import mongoose from 'mongoose'
import { Order } from '../models/Order.js'
import { applyStockAdjustment, PAID_STATUSES } from '../lib/stock.js'

/**
 * Backfill: descuenta el stock de todos los pedidos con pago realizado que
 * todavía no lo tenían descontado (stockAdjusted distinto de true).
 *
 * Uso: node src/scripts/backfill-stock.js   (desde server/)
 */

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  const orders = await Order.find({
    status: { $in: PAID_STATUSES },
    stockAdjusted: { $ne: true },
  }).sort({ createdAt: 1 })

  console.log(`Pedidos pagados sin descontar: ${orders.length}`)
  let adjusted = 0
  for (const order of orders) {
    const changed = await applyStockAdjustment(order)
    if (changed) adjusted += 1
    console.log(
      ` - ${order.number || order._id} (${order.status}) -> ${changed ? 'descontado' : 'sin cambios'}`,
    )
  }
  console.log(`Listo. Descontados: ${adjusted}`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
