import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { Product } from '../models/Product.js'

const IMG = {
  1: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380394/bronza-products/lxerhv2andts7z9wzwew.jpg',
  2: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380395/bronza-products/ax8m3o8vqbeqqd6esjay.jpg',
  3: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380396/bronza-products/nynzaraexxt3fv70hfr7.jpg',
  4: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380397/bronza-products/abzeo3ezvicgs1yizaoq.jpg',
  5: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380398/bronza-products/ifepbwmrnhfw515pcucc.jpg',
  6: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380398/bronza-products/zpyusoux82tol5idck3v.jpg',
  7: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380399/bronza-products/pecr4akw2dqhqk5tn2sz.jpg',
  8: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380400/bronza-products/recdvgpp7w8z4phvoozc.jpg',
  9: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380400/bronza-products/wcf3voo1vt46pp8id0zq.jpg',
  10: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380401/bronza-products/pj7uvcywm3ieepgyph0e.jpg',
  11: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380402/bronza-products/g6aorzkoyfpd4jli8l4k.jpg',
  12: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380403/bronza-products/qdfmg0vln2n3n9avz2xl.jpg',
  13: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380404/bronza-products/cj6kb7ychvn4xfmjumty.jpg',
  14: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380404/bronza-products/fgaruwqvlcnxl51pq7vd.jpg',
  15: 'https://res.cloudinary.com/dhkhgloxn/image/upload/v1781380405/bronza-products/llcyigszegow9kf1u1wn.jpg',
}

function stock(entries) {
  return Object.fromEntries(entries.map(([size, qty]) => [size, qty]))
}

const PRODUCTS = [
  {
    name: 'Remera tachs',
    category: 'Remeras',
    price: 22000,
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { color: 'Negro', images: [IMG[1]], stock: stock([['S', 5], ['M', 0], ['L', 0], ['XL', 0]]) },
    ],
  },
  {
    name: 'Remera Basic',
    category: 'Remeras',
    price: 16000,
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { color: 'Negro', images: [IMG[2]], stock: stock([['S', 5], ['M', 0], ['L', 0], ['XL', 0]]) },
    ],
  },
  {
    name: 'Remera Siniha',
    category: 'Remeras',
    price: 28000,
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { color: 'Negro', images: [IMG[3]], stock: stock([['S', 5], ['M', 0], ['L', 0], ['XL', 0]]) },
    ],
  },
  {
    name: 'Body Mic',
    category: 'Bodys',
    price: 24000,
    sizes: ['S', 'M', 'L'],
    variants: [
      { color: 'Negro', images: [IMG[4]], stock: stock([['S', 5], ['M', 0], ['L', 0]]) },
      { color: 'Marron', images: [IMG[6]], stock: stock([['S', 5], ['M', 0], ['L', 0]]) },
    ],
  },
  {
    name: 'Denim Blu Tiro Bajo',
    category: 'Pantalones',
    price: 46000,
    sizes: ['36', '38', '40', '42'],
    variants: [
      { color: 'Azul', images: [IMG[5]], stock: stock([['36', 0], ['38', 0], ['40', 0], ['42', 0]]) },
    ],
  },
  {
    name: 'Rayas Wide Leg',
    category: 'Pantalones',
    price: 38000,
    sizes: ['36', '38', '40', '42'],
    variants: [
      { color: 'Azul', images: [IMG[7]], stock: stock([['36', 5], ['38', 0], ['40', 0], ['42', 0]]) },
      { color: 'Negro', images: [IMG[8]], stock: stock([['36', 5], ['38', 0], ['40', 0], ['42', 0]]) },
    ],
  },
  {
    name: 'Short Cordon',
    category: 'Shorts',
    price: 26000,
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { color: 'Negro', images: [IMG[9]], stock: stock([['S', 5], ['M', 0], ['L', 0], ['XL', 0]]) },
      { color: 'Marron', images: [IMG[9]], stock: stock([['S', 5], ['M', 0], ['L', 0], ['XL', 0]]) },
    ],
  },
  {
    name: 'Sweter Street',
    category: 'Sweters',
    price: 40000,
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { color: 'Negro', images: [IMG[10]], stock: stock([['S', 5], ['M', 0], ['L', 0], ['XL', 0]]) },
    ],
  },
  {
    name: 'Muscu Basic',
    category: 'Musculosas',
    price: 20000,
    sizes: ['S', 'M', 'L'],
    variants: [
      { color: 'Blanco', images: [IMG[11]], stock: stock([['S', 0], ['M', 5], ['L', 0]]) },
    ],
  },
  {
    name: 'Muscu Shine',
    category: 'Musculosas',
    price: 29000,
    sizes: ['S', 'M', 'L'],
    variants: [
      { color: 'Blanco', images: [IMG[12]], stock: stock([['S', 0], ['M', 5], ['L', 0]]) },
    ],
  },
  {
    name: 'Chaleco Top Rock',
    category: 'Chalecos',
    price: 30000,
    sizes: ['S', 'M', 'L'],
    variants: [
      { color: 'Negro', images: [IMG[13]], stock: stock([['S', 5], ['M', 0], ['L', 0]]) },
    ],
  },
  {
    name: 'Sweter Icono',
    category: 'Sweters',
    price: 38000,
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { color: 'Bordo', images: [IMG[14]], stock: stock([['S', 5], ['M', 0], ['L', 0], ['XL', 0]]) },
    ],
  },
  {
    name: 'Short Cierre',
    category: 'Shorts',
    price: 28000,
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { color: 'Negro', images: [IMG[15]], stock: stock([['S', 5], ['M', 0], ['L', 0], ['XL', 0]]) },
      { color: 'Marron', images: [IMG[15]], stock: stock([['S', 5], ['M', 0], ['L', 0], ['XL', 0]]) },
    ],
  },
]

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectado a MongoDB')

  // Admin user
  const existing = await User.findOne({ email: 'admin@bronzaclub.com' })
  if (existing) {
    console.log('Admin ya existe, saltando...')
  } else {
    const passwordHash = await bcrypt.hash('bronzadmin2026', 10)
    await User.create({
      name: 'Bronza',
      email: 'admin@bronzaclub.com',
      passwordHash,
      role: 'admin',
    })
    console.log('✓ Admin creado: admin@bronzaclub.com / bronzadmin2026')
  }

  // Products
  const count = await Product.countDocuments()
  if (count > 0) {
    console.log(`Productos ya existen (${count}), eliminando y reseedando...`)
    await Product.deleteMany({})
  }

  await Product.insertMany(PRODUCTS)
  console.log(`✓ ${PRODUCTS.length} productos creados`)

  await mongoose.disconnect()
  console.log('Listo.')
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
