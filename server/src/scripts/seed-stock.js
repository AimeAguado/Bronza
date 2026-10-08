/**
 * seed-stock.js — Crea/actualiza los productos de "Stock Bronza - Hoja 2".
 *
 * Uso:
 *   cd server && node src/scripts/seed-stock.js [--dry-run] [--force-upload]
 *
 * Flags:
 *   --dry-run       No escribe en MongoDB ni sube imágenes. Solo imprime el plan.
 *   --force-upload  Vuelve a subir todas las imágenes aunque estén en el cache.
 *
 * Comportamiento:
 *   - Lee las imágenes de IMG_DIR (default: ~/OneDrive/Desktop/Img-Bronza)
 *   - Sube solo las que falten a Cloudinary (cache en stock-images.json).
 *   - Upsert por nombre: NO borra ni desactiva productos existentes.
 *     En productos ya existentes preserva `active` (se puede cambiar desde el panel admin).
 *   - Visibilidad: todos los productos nacen con active: true — el front los muestra
 *     aunque no haya stock, con un cartel "Sin stock". `active: false` es solo para
 *     que el admin oculte un producto del todo.
 *
 * Requiere en server/.env: MONGODB_URI (y CLOUDINARY_URL para subir fotos).
 */
import { config as loadEnv } from 'dotenv'
import { createReadStream } from 'node:fs'
import { readdir, readFile, writeFile, access } from 'node:fs/promises'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'
import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

loadEnv({ path: resolve(__dirname, '..', '..', '.env') })
loadEnv()

const FLAGS = process.argv.slice(2)
const DRY_RUN = FLAGS.includes('--dry-run')
const FORCE_UPLOAD = FLAGS.includes('--force-upload')

const IMG_DIR = process.env.IMG_DIR
  ? resolve(process.env.IMG_DIR)
  : join(homedir(), 'OneDrive', 'Desktop', 'Img-Bronza')

const CACHE_FILE = resolve(__dirname, 'stock-images.json')
const CLOUD_FOLDER = 'bronza-products/stock'

const CATEGORY = 'Bikinis'
const ALL_SIZES = ['S', 'M', 'L', 'XL']

function zero(sizes) {
  return Object.fromEntries(sizes.map((s) => [s, 0]))
}

function one(sizes) {
  return Object.fromEntries(sizes.map((s) => [s, 1]))
}

/**
 * Una entrada del PDF = un ID de artículo con una o varias variantes (Color).
 * - `price` es la columna Precio (la columna Costo NO se guarda).
 * - `stock` es 1 por talle solo si el Estado del PDF es "En stock";
 *   si no, 0 (los números reales de la columna Stock no se pudieron leer).
 * - `active` nace true en todos: el front muestra igual los que no tienen stock,
 *   con un cartel "Sin stock" y el botón deshabilitado.
 * - `file` es el nombre de la foto en IMG_DIR, o null si no tiene foto.
 */
const PRODUCTS = [
  {
    name: 'Brasil',
    price: 37000,
    sizes: ['M'],
    active: true,
    variants: [{ color: 'Unico', file: 'Brasil.jpeg', stock: { M: 1 } }],
  },
  {
    name: 'Remy',
    price: 50400,
    sizes: ALL_SIZES,
    active: true,
    variants: [{ color: 'Beige', file: 'Remy.jpeg', stock: zero(ALL_SIZES) }],
  },
  {
    name: 'Delirio',
    price: 46000,
    sizes: ['M'],
    active: true,
    variants: [{ color: 'Unico', file: 'Delirio.png', stock: { M: 1 } }],
  },
  {
    name: 'New Santorini',
    price: 42000,
    sizes: ALL_SIZES,
    active: true,
    variants: [{ color: 'Unico', file: 'New Santinori.jpeg', stock: zero(ALL_SIZES) }],
  },
  {
    name: 'Wild Cherri',
    price: 52400,
    sizes: ALL_SIZES,
    active: true,
    variants: [{ color: 'Unico', file: 'Wild Cherri.jpeg', stock: zero(ALL_SIZES) }],
  },
  {
    name: 'Calambre',
    price: 45000,
    sizes: ['S', 'M'],
    active: true,
    variants: [{ color: 'Unico', file: 'Calambre.png', stock: one(['S', 'M']) }],
  },
  {
    name: 'Briggite',
    price: 42000,
    sizes: ['S'],
    active: true,
    variants: [
      { color: 'Rosa', file: 'Briggite Rosa.jpeg', stock: { S: 0 } },
      { color: 'Marron', file: null, stock: { S: 0 } },
      { color: 'Negro', file: null, stock: { S: 0 } },
    ],
  },
  {
    name: 'Cote Bleue + Short',
    price: 52400,
    sizes: ['S', 'M'],
    active: true,
    variants: [{ color: 'Azul', file: 'Cote Blueue.jpeg', stock: zero(['S', 'M']) }],
  },
  {
    name: 'Babyphi',
    price: 38000,
    sizes: ['S'],
    active: true,
    variants: [{ color: 'Verde', file: 'Babyphi.jpeg', stock: { S: 0 } }],
  },
  {
    name: 'Babylu',
    price: 38000,
    sizes: ['S'],
    active: true,
    variants: [{ color: 'Negro', file: 'Babylu.png', stock: { S: 0 } }],
  },
  {
    name: 'Soft Pink',
    price: 30000,
    sizes: ['S'],
    active: true,
    variants: [{ color: 'Rosa', file: 'Pink.jpeg', stock: { S: 0 } }],
  },
  {
    name: 'Santorini',
    price: 32000,
    sizes: ['S', 'M'],
    active: true,
    variants: [
      { color: 'Oliva', file: null, stock: { S: 0, M: 1 } },
      { color: 'Gris', file: null, stock: { S: 1, M: 0 } },
      { color: 'Marron', file: null, stock: { S: 1, M: 0 } },
    ],
  },
  {
    name: 'Rivera Blue',
    price: 41700,
    sizes: ['S'],
    active: true,
    variants: [
      { color: 'Celeste', file: 'Rivera Celeste.png', stock: { S: 0 } },
      { color: 'Amarillo', file: 'Rivera Amarillo.png', stock: { S: 0 } },
    ],
  },
  {
    name: 'Moon Chocolate',
    price: 41700,
    sizes: ['S'],
    active: true,
    variants: [{ color: 'Marron', file: 'Moon Chocolate.png', stock: { S: 0 } }],
  },
  {
    name: 'Dots',
    price: 43000,
    sizes: ['S'],
    active: true,
    variants: [
      { color: 'Negro', file: 'Dots Negro.jpeg', stock: { S: 0 } },
      { color: 'Marron', file: 'Dots Marron.jpeg', stock: { S: 0 } },
    ],
  },
  {
    name: 'Saint Marine',
    price: 50400,
    sizes: ['S'],
    active: true,
    variants: [{ color: 'Azul', file: 'Saint Marina.jpeg', stock: { S: 0 } }],
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function slugify(fileName) {
  return basename(fileName, extname(fileName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function readCache() {
  try {
    return JSON.parse(await readFile(CACHE_FILE, 'utf8'))
  } catch {
    return {}
  }
}

if (process.env.CLOUDINARY_URL) {
  try {
    const u = new URL(process.env.CLOUDINARY_URL)
    cloudinary.config({
      cloud_name: u.hostname || u.searchParams.get('cloud_name') || u.pathname?.split('/')[1],
      api_key: u.username,
      api_secret: u.password,
      secure: true,
    })
  } catch { /* ignore */ }
}

function uploadToCloudinary(filePath, fileName) {
  return new Promise((resolvePromise, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUD_FOLDER,
        public_id: slugify(fileName),
        overwrite: true,
        unique_filename: false,
        resource_type: 'image',
      },
      (err, result) => (err ? reject(err) : resolvePromise(result.secure_url)),
    )
    createReadStream(filePath).pipe(stream)
  })
}

async function ensureImages(files, cache) {
  const urls = []
  for (const file of files) {
    const cached = cache[file] && cache[file].url
    if (cached && !FORCE_UPLOAD) {
      urls.push(cached)
      continue
    }
    if (!process.env.CLOUDINARY_URL) {
      throw new Error(
        `Falta CLOUDINARY_URL en server/.env y no hay URL cacheada para "${file}".`,
      )
    }
    console.log(`   ↑ Subiendo ${file}...`)
    const url = await uploadToCloudinary(join(IMG_DIR, file), file)
    cache[file] = {
      url,
      publicId: `${CLOUD_FOLDER}/${slugify(file)}`,
      uploadedAt: new Date().toISOString(),
    }
    await writeFile(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`)
    console.log(`     ✓ ${url}`)
    urls.push(url)
  }
  return urls
}

async function upsertProduct(payload) {
  const existing = await Product.findOne({
    name: { $regex: `^${escapeRegex(payload.name)}$`, $options: 'i' },
  })

  if (!existing) {
    const doc = await Product.create(payload)
    console.log(`   + creado       ${doc.name} (activo: ${doc.active})`)
    return 'created'
  }

  existing.description = payload.description
  existing.category = payload.category
  existing.price = payload.price
  existing.sizes = payload.sizes
  existing.set('variants', payload.variants)
  await existing.save()
  console.log(`   = actualizado  ${existing.name} (activo: ${existing.active}, no se toca)`)
  return 'updated'
}

function printHelp() {
  console.log(`
seed-stock.js — crea/actualiza los productos del stock (Stock Bronza - Hoja 2)

Uso:  node src/scripts/seed-stock.js [--dry-run] [--force-upload]

  --dry-run        no escribe en MongoDB ni sube imágenes
  --force-upload   ignora el cache y vuelve a subir todo
  IMG_DIR=/ruta    carpeta de imágenes (default: ~/OneDrive/Desktop/Img-Bronza)
`)
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  if (FLAGS.includes('--help') || FLAGS.includes('-h')) {
    printHelp()
    return
  }

  await access(IMG_DIR).catch(() => {
    throw new Error(
      `No se encontró la carpeta de imágenes: ${IMG_DIR}\n` +
        `Podés apuntar otra con:  IMG_DIR="C:/otra/carpeta" node src/scripts/seed-stock.js`,
    )
  })
  const onDisk = new Set(
    (await readdir(IMG_DIR)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)),
  )
  const wanted = PRODUCTS.flatMap((p) => p.variants.map((v) => v.file).filter(Boolean))
  const missing = [...new Set(wanted)].filter((f) => !onDisk.has(f))
  if (missing.length) {
    throw new Error(`Faltan imágenes en ${IMG_DIR}:\n  - ${missing.join('\n  - ')}`)
  }
  const unassigned = [...onDisk].filter((f) => !wanted.includes(f))
  if (unassigned.length) {
    console.log(`⚠ Imágenes sin asignar a ningún producto: ${unassigned.join(', ')}`)
  }

  const variantCount = PRODUCTS.reduce((n, p) => n + p.variants.length, 0)
  const activeCount = PRODUCTS.filter((p) => p.active).length
  console.log(`\nImágenes : ${IMG_DIR} (${onDisk.size} archivos, ${new Set(wanted).size} usados)`)
  console.log(`Productos: ${PRODUCTS.length} (${variantCount} variantes), ${activeCount} visibles para clientes`)
  console.log(`Modo     : ${DRY_RUN ? 'DRY-RUN (sin escritura)' : 'producción'}${FORCE_UPLOAD ? ' + force-upload' : ''}`)

  if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.trim()) {
    throw new Error('Falta MONGODB_URI en server/.env')
  }
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✓ Conectado a MongoDB')

  const admin = await User.findOne({ email: 'admin@bronzaclub.com' }).select('email role')
  console.log(
    admin
      ? `✓ Admin ok: ${admin.email} (${admin.role}) — password NO modificada`
      : '⚠ No hay usuario admin. Si lo necesitás: node src/scripts/seed-admin.js',
  )

  const cache = await readCache()
  const cachedCount = [...new Set(wanted)].filter((f) => cache[f] && cache[f].url).length
  console.log(`\nCloudinary: ${cachedCount}/${new Set(wanted).size} imágenes ya subidas`)

  const imagesByFile = {}
  for (const file of new Set(wanted)) {
    imagesByFile[file] = DRY_RUN
      ? (cache[file] && cache[file].url) || `(subir ${file})`
      : (await ensureImages([file], cache))[0]
  }

  console.log('\nProductos:')
  let created = 0
  let updated = 0
  for (const p of PRODUCTS) {
    const payload = {
      name: p.name,
      description: p.description ?? '',
      category: CATEGORY,
      price: p.price,
      sizes: p.sizes,
      active: p.active,
      variants: p.variants.map((v) => ({
        color: v.color,
        images: v.file ? [imagesByFile[v.file]] : [],
        stock: v.stock,
      })),
    }

    if (DRY_RUN) {
      const existing = await Product.findOne({
        name: { $regex: `^${escapeRegex(p.name)}$`, $options: 'i' },
      })
      if (existing) {
        console.log(`   = ${p.name} → actualizaría (activo: ${existing.active})`)
        updated += 1
      } else {
        console.log(`   + ${p.name} → crearía (activo: ${p.active})`)
        created += 1
      }
      continue
    }

    const result = await upsertProduct(payload)
    if (result === 'created') created += 1
    else updated += 1
  }

  const total = await Product.countDocuments()
  const visible = await Product.countDocuments({ active: true })
  console.log(`\n✓ Listo — creados: ${created}, actualizados: ${updated}, total en DB: ${total}`)
  console.log(`  Visibles para clientes (active: true): ${visible}`)
  if (DRY_RUN) console.log('  (dry-run: no se modificó nada)')

  await mongoose.disconnect()
  process.exit(0)
}

main().catch(async (err) => {
  console.error(`\n✗ Error: ${(err && err.message) || err}`)
  try {
    await mongoose.disconnect()
  } catch {
    // ya desconectado
  }
  process.exit(1)
})
