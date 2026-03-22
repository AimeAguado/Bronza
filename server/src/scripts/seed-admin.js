import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { Product } from '../models/Product.js'

const PRODUCTS = [
  {
    name: 'The Shell',
    category: 'Heavyweight Hoodie',
    color: 'Shark Gray',
    price: 145,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMgt-P5xwcMuH8ODKNQApSfeYBH1mLPhHQTQmPXM_KG-BOjWOEuadoRVDz8_WFXC7xHw_2ruIQNRlDt8OC5zy5NtzVrOvo8WhpABlIkDqtXLFFG4o4zLKsI4wbdX1FIwEhVV8Saw63rle6KzmWF6fFXaf1ioYj6zy3DvwRZR3qvflWDtUUFoU5rPKdo477veLdkApucRGLSDLAhhxxJYLAAsPxnzVv3lvlaxLp7gT1cXEcmxgUSKfAu8BZWBGU-OtS4obEV_MWQ2dW',
    volume: 'Volume 01',
    stock: 10,
  },
  {
    name: 'Kinetic',
    category: 'Performance Jogger',
    color: 'Iron',
    price: 110,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKL48PSgOivAyDv7H9_ENMxqNFT3yBCKjsU6RP-IU6cwf3jobATgF3q7tzj2bC-PQb1QFTwjfnGnIzRfSPCnhoD3eE7vJOVwj_QzeZjuKR7msm_0xiv5xbOZH_DbX-fILE53gxkB0NPJKD0thXuJFR7B97ihyVw2tooWBmHRhPxONMExWLGD1iwPdj3r7aDS_JnVp744xB0cqv2ziqblS4ZPHE0FnqmtTnqaf-BdntThHrL-ZRw3pecig0lS4Jgl56AYJogvFpgSJ5',
    volume: 'Volume 02',
    stock: 10,
  },
  {
    name: 'Thermal',
    category: 'Insulated Vest',
    color: 'Off-white',
    price: 180,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYB4RvDcr1JRaZhYEpiNehLD7kp-qUip0wWRzkI2h_irxnoIiapN_CoPWFwH2dZj4x7v8v_Aq57noqxw-FppuUsCQ_dKWgEYDbjM36N8HpCAO5k5b54bIx4J7P3JA8OSu3HRdlsMpC99V_c8ldaXnTudZpVlTKxmRarJbMOqaN2yNvuxUQys5dOGwwwnfHQs-rg2xjd0Sf0hhqP1gRwDLPcHHJjMpLLdJ3S1mlMVKPIaQqO5294KFkNoGGXvQcRiqzJ7PbKOO55aNL',
    volume: 'Volume 03',
    stock: 10,
  },
  {
    name: 'Core',
    category: 'Essential Tee',
    color: 'Shark Gray',
    price: 65,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJgDCmISOO9rov6YTd68-AtIbHn9Y6tfVv-TLQ83nm8V1uxxZOmgk6E5U7MJy1G-n8Z1G1TGB53zdm6tAWJ8VuGpyiAIhPnqO1Toxxdm9GHjuk39BLVcEgoaCpdd5FO7FuUTnEHPE3RqaJJTMm44rNla2C2l8LbvxvTLhdFhfhlV_E-Ogmtdje5lxSQjpsteMwwbnwt1CVB38eWrDSMxTxwdjvmOe5aSUtmpUBxnhoFa8bum9FSuM7KkNYIhqEgT3PVaujYxedGlXJ',
    volume: 'Volume 04',
    stock: 10,
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
    console.log(`Productos ya existen (${count}), saltando...`)
  } else {
    await Product.insertMany(PRODUCTS)
    console.log(`✓ ${PRODUCTS.length} productos creados`)
  }

  await mongoose.disconnect()
  console.log('Listo.')
  process.exit(0)
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
