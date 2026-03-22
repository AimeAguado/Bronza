import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Falta MONGODB_URI en .env')

  await mongoose.connect(uri)
  console.log('[bronza-server] MongoDB conectado')
}
