/**
 * seed-bikinis.js — Crea/actualiza los 12 bikinis de Summer 27 en MongoDB.
 *
 * Uso:
 *   cd server && node src/scripts/seed-bikinis.js [--dry-run] [--force-upload]
 *
 * Flags:
 *   --dry-run       No escribe en MongoDB ni sube imágenes. Solo imprime el plan.
 *   --force-upload  Vuelve a subir todas las imágenes aunque estén en el cache.
 *
 * Comportamiento:
 *   - Lee las imágenes de IMG_DIR (default: ~/OneDrive/Desktop/Img-Bronza)
 *   - Sube cada una a Cloudinary (folder bronza-products/bikinis) solo si falta
 *     (cache en bikinis-images.json) y con public_id fijo + overwrite, así
 *     re-ejecutar no duplica assets.
 *   - Upsert por nombre: NO borra ni desactiva productos existentes.
 *   - NUNCA toca usuarios ni contraseñas (ojo: seed-admin.js resetea la password
 *     del admin a "123456" si ya existe).
 *
 * Requiere en server/.env: MONGODB_URI (y CLOUDINARY_URL si hay que subir fotos).
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

// ── Env: siempre server/.env, sin importar desde dónde se ejecute ──────────
loadEnv({ path: resolve(__dirname, '..', '..', '.env') })
loadEnv() // fallback: .env del cwd (no pisa lo anterior)

// ── CLI ────────────────────────────────────────────────────────────────────
const FLAGS = process.argv.slice(2)
const DRY_RUN = FLAGS.includes('--dry-run')
const FORCE_UPLOAD = FLAGS.includes('--force-upload')

// ── Config ─────────────────────────────────────────────────────────────────
const IMG_DIR = process.env.IMG_DIR
  ? resolve(process.env.IMG_DIR)
  : join(homedir(), 'OneDrive', 'Desktop', 'Img-Bronza')

const CACHE_FILE = resolve(__dirname, 'bikinis-images.json')
const CLOUD_FOLDER = 'bronza-products/bikinis'

const CATEGORY = 'Bikinis'
const PRICE = 25000
const SIZES = ['S', 'M', 'L', 'XL']
const STOCK_PER_SIZE = 10
const COLOR = 'Único'

// Los 16 archivos de IMG_DIR agrupados en 12 productos.
// El orden de `files` es el orden del carrusel en el modal (primera = portada).
// EDITÁ ACÁ los nombres de mostración antes de la primera corrida.
const PRODUCTS = [
  { name: 'BRL', files: ['bkn-brl.jpeg'] },
  { name: 'Coco', files: ['bkn-coco.jpeg'] },
  { name: 'Gina', files: ['bkn-gina.jpeg'] },
  { name: 'Lana', files: ['bkn-lana.jpeg', 'bkn-lana (2).jpeg'] },
  { name: 'Lupe', files: ['bkn-lupe.jpeg', 'bkn-lupe (2).jpeg'] },
  { name: 'Mery', files: ['bkn-mery.jpeg', 'bkn-mery2.jpeg', 'bkn-mery3.jpeg'] },
  { name: 'Mixe', files: ['bkn-mixe.jpeg'] },
  { name: 'Nina', files: ['bkn-nina.jpeg'] },
  { name: 'Rina', files: ['bkn-rina.jpeg'] },
  { name: 'Vera', files: ['bkn-vera.jpeg'] },
  { name: 'Zia', files: ['bkn-zia.jpeg'] },
  { name: 'Zoe', files: ['bkn-zoe.jpeg'] },
]

// Descripción por producto (se puede pisar agregando `description:` a cualquier entrada)
function productDescription(name) {
  return (
    `${name} — bikini de la colección Summer 27. Tela suave, elástica y de secado rápido, ` +
    `doble capa y toalla interior, para el sol, la playa y el agua. ` +
    `Disponible en talle ${SIZES[0]} a ${SIZES[SIZES.length - 1]}, color ${COLOR}.`
  )
}

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

// Sube solo lo que falte y va guardando el cache tras cada upload (si se corta, no repite).
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

// Upsert por nombre. Preserva _id, createdAt y `active`; solo normaliza los campos sembrados.
async function upsertProduct(payload) {
  const existing = await Product.findOne({
    name: { $regex: `^${escapeRegex(payload.name)}$`, $options: 'i' },
  })

  if (!existing) {
    const doc = await Product.create(payload)
    console.log(`   + creado       ${doc.name} (${doc._id})`)
    return 'created'
  }

  existing.name = payload.name
  existing.description = payload.description
  existing.category = payload.category
  existing.price = payload.price
  existing.sizes = payload.sizes
  existing.set('variants', payload.variants)
  await existing.save()
  console.log(`   = actualizado  ${existing.name} (${existing._id})`)
  return 'updated'
}

function printHelp() {
  console.log(`
seed-bikinis.js — crea/actualiza los 12 bikinis de Summer 27

Uso:  node src/scripts/seed-bikinis.js [--dry-run] [--force-upload]

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

  // 1) Imágenes en disco
  await access(IMG_DIR).catch(() => {
    throw new Error(
      `No se encontró la carpeta de imágenes: ${IMG_DIR}\n` +
        `Podés apuntar otra con:  IMG_DIR="C:/otra/carpeta" node src/scripts/seed-bikinis.js`,
    )
  })
  const onDisk = new Set(
    (await readdir(IMG_DIR)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)),
  )
  const wanted = PRODUCTS.flatMap((p) => p.files)
  const missing = wanted.filter((f) => !onDisk.has(f))
  if (missing.length) {
    throw new Error(`Faltan imágenes en ${IMG_DIR}:\n  - ${missing.join('\n  - ')}`)
  }
  const unassigned = [...onDisk].filter((f) => !wanted.includes(f))
  if (unassigned.length) {
    console.log(`⚠ Imágenes sin asignar a ningún producto: ${unassigned.join(', ')}`)
  }

  console.log(`\nImágenes : ${IMG_DIR} (${onDisk.size} archivos, ${wanted.length} usados)`)
  console.log(`Modo     : ${DRY_RUN ? 'DRY-RUN (sin escritura)' : 'producción'}${FORCE_UPLOAD ? ' + force-upload' : ''}`)

  // 2) MongoDB
  if (!process.env.MONGODB_URI || !process.env.MONGODB_URI.trim()) {
    throw new Error('Falta MONGODB_URI en server/.env')
  }
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✓ Conectado a MongoDB')

  // 3) Admin: SOLO lectura — nunca tocamos passwords
  const admin = await User.findOne({ email: 'admin@bronzaclub.com' }).select('email role')
  console.log(
    admin
      ? `✓ Admin ok: ${admin.email} (${admin.role}) — password NO modificada`
      : '⚠ No hay usuario admin. Si lo necesitás: node src/scripts/seed-admin.js ' +
        '(ATENCIÓN: eso deja la password en "123456").',
  )

  // 4) Imágenes → Cloudinary (solo las que falten)
  const cache = await readCache()
  const cachedCount = wanted.filter((f) => cache[f] && cache[f].url).length
  console.log(`\nCloudinary: ${cachedCount}/${wanted.length} imágenes ya subidas`)

  const imagesByProduct = {}
  for (const p of PRODUCTS) {
    imagesByProduct[p.name] = DRY_RUN
      ? p.files.map((f) => (cache[f] && cache[f].url) || `(subir ${f})`)
      : await ensureImages(p.files, cache)
  }

  // 5) Upsert
  console.log('\nProductos:')
  let created = 0
  let updated = 0
  for (const p of PRODUCTS) {
    const payload = {
      name: p.name,
      description: p.description || productDescription(p.name),
      category: CATEGORY,
      price: PRICE,
      sizes: SIZES,
      variants: [
        {
          color: COLOR,
          images: imagesByProduct[p.name],
          stock: Object.fromEntries(SIZES.map((s) => [s, STOCK_PER_SIZE])),
        },
      ],
    }

    if (DRY_RUN) {
      const existing = await Product.findOne({
        name: { $regex: `^${escapeRegex(p.name)}$`, $options: 'i' },
      })
      if (existing) {
        console.log(`   = ${p.name} → actualizaría (${existing._id})`)
        updated += 1
      } else {
        console.log(`   + ${p.name} → crearía`)
        created += 1
      }
      continue
    }

    const result = await upsertProduct(payload)
    if (result === 'created') created += 1
    else updated += 1
  }

  const total = await Product.countDocuments()
  console.log(`\n✓ Listo — creados: ${created}, actualizados: ${updated}, total en DB: ${total}`)
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
