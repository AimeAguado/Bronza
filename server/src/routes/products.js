import { Router } from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { Product } from '../models/Product.js'
import { requireAdmin } from '../middleware/requireAdmin.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    cb(null, allowed.includes(file.mimetype))
  },
})

const router = Router()

router.post('/upload', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo inválido. Solo JPG, PNG o WEBP.' })
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'bronza-products' },
        (err, result) => (err ? reject(err) : resolve(result)),
      )
      stream.end(req.file.buffer)
    })
    return res.json({ url: result.secure_url })
  } catch (e) {
    console.error('Cloudinary upload error:', e)
    return res.status(500).json({ error: 'Error al subir imagen.' })
  }
})

router.get('/', async (_req, res) => {
  try {
    const products = await Product.find({ active: true }).sort({ createdAt: 1 })
    return res.json({ products })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Error al obtener productos.' })
  }
})

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, category, color, price, image, volume, stock } = req.body || {}
    if (!name || price == null) {
      return res.status(400).json({ error: 'Nombre y precio son requeridos.' })
    }
    const product = await Product.create({ name, category, color, price, image, volume, stock: stock ?? 0 })
    return res.status(201).json({ product })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Error al crear producto.' })
  }
})

router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, category, color, price, image, volume, stock, active } = req.body || {}
    const update = {}
    if (name !== undefined) update.name = name
    if (category !== undefined) update.category = category
    if (color !== undefined) update.color = color
    if (price !== undefined) update.price = price
    if (image !== undefined) update.image = image
    if (volume !== undefined) update.volume = volume
    if (stock !== undefined) update.stock = stock
    if (active !== undefined) update.active = active

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!product) return res.status(404).json({ error: 'Producto no encontrado.' })
    return res.json({ product })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Error al actualizar producto.' })
  }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true })
    if (!product) return res.status(404).json({ error: 'Producto no encontrado.' })
    return res.json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Error al eliminar producto.' })
  }
})

export default router
