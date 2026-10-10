/**
 * Protege los endpoints de cron / tareas programadas.
 * Vercel Cron agrega automáticamente `Authorization: Bearer <CRON_SECRET>`
 * cuando la variable de entorno CRON_SECRET está definida en el proyecto.
 * También aceptamos `?key=<CRON_SECRET>` para pruebas manuales.
 */
export function requireCronSecret(req, res, next) {
  const expected = process.env.CRON_SECRET?.trim()
  if (!expected) {
    return res
      .status(503)
      .json({ error: 'CRON_SECRET no configurado en el servidor.' })
  }

  const header = req.headers.authorization
  const bearer =
    typeof header === 'string' && header.startsWith('Bearer ')
      ? header.slice(7)
      : ''
  const provided = bearer || req.query.key || ''

  if (provided !== expected) {
    return res.status(401).json({ error: 'No autorizado.' })
  }

  return next()
}
