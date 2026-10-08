import 'dotenv/config'
import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'
import { Product } from '../models/Product.js'

if (process.env.CLOUDINARY_URL) cloudinary.config()

function imageUrlToPublicId(url) {
  try {
    const { pathname } = new URL(url)
    const match = pathname.match(/\/upload\/v\d+\/(.+?)\.[a-z0-9]+$/i)
    return match ? match[1] : null
  } catch {
    return null
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado a MongoDB')

  const products = await Product.find()
  if (products.length === 0) {
    console.log('No hay productos para borrar.')
    await mongoose.disconnect()
    process.exit(0)
  }

  if (process.env.CLOUDINARY_URL) {
    for (const product of products) {
      for (const variant of product.variants ?? []) {
        for (const url of variant.images ?? []) {
          const publicId = imageUrlToPublicId(url)
          if (!publicId) continue
          try {
            await cloudinary.uploader.destroy(publicId)
          } catch (e) {
            console.warn('No se pudo borrar imagen:', publicId, e.message ?? e)
          }
        }
      }
    }
  }

  const { deletedCount } = await Product.deleteMany({})
  console.log(`✓ ${deletedCount} productos eliminados`)

  await mongoose.disconnect()
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
