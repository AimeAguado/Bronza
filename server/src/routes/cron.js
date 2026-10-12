import { Router } from 'express'
import { requireCronSecret } from '../middleware/requireCronSecret.js'
import { processAbandonedCarts } from '../lib/abandonedCarts.js'
import { processPaymentReminders } from '../lib/paymentReminders.js'

const router = Router()

/**
 * Tarea programada: envía los recordatorios de carrito abandonado.
 * Se invoca desde Vercel Cron (ver server/vercel.json) o manualmente.
 *   GET /api/cron/abandoned-carts?dryRun=1   → no envía, solo informa
 * Header/param de auth: CRON_SECRET.
 */
router.get('/abandoned-carts', requireCronSecret, async (req, res) => {
  try {
    const dryRun = req.query.dryRun === '1' || req.query.dryRun === 'true'
    const summary = await processAbandonedCarts({ dryRun })
    return res.json({ ok: true, dryRun, ...summary })
  } catch (e) {
    console.error('[cron] abandoned-carts error:', e)
    return res
      .status(500)
      .json({ error: 'Error al procesar los carritos abandonados.' })
  }
})

/**
 * Tarea programada: envía recordatorios de pago a pedidos por transferencia
 * que siguen sin confirmarse. Se invoca desde Vercel Cron o manualmente.
 *   GET /api/cron/payment-reminders?dryRun=1   → no envía, solo informa
 * Header/param de auth: CRON_SECRET.
 */
router.get('/payment-reminders', requireCronSecret, async (req, res) => {
  try {
    const dryRun = req.query.dryRun === '1' || req.query.dryRun === 'true'
    const summary = await processPaymentReminders({ dryRun })
    return res.json({ ok: true, dryRun, ...summary })
  } catch (e) {
    console.error('[cron] payment-reminders error:', e)
    return res
      .status(500)
      .json({ error: 'Error al procesar los recordatorios de pago.' })
  }
})

export default router
