import 'dotenv/config'
import { createApp } from './app.js'

const PORT = Number(process.env.PORT) || 4000

if (!process.env.JWT_SECRET?.trim()) {
  console.warn(
    '[bronza-server] Falta JWT_SECRET en .env — la autenticación no funcionará correctamente.',
  )
}

const app = createApp()
app.listen(PORT, () => {
  console.log(`[bronza-server] API en http://localhost:${PORT}`)
})
