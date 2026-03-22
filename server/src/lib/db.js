import mongoose from 'mongoose'

let connectionPromise = null

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta MONGODB_URI en .env')

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri)
  }

  await connectionPromise
  console.log('[bronza-server] MongoDB conectado')
}
