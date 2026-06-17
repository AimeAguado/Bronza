import { v2 as cloudinary } from 'cloudinary'
import { createReadStream } from 'node:fs'
import { readdir, writeFile } from 'node:fs/promises'
import { join, extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMG_DIR = resolve(__dirname, '..', '..', '..', 'Img-Bronza')
const OUTPUT = resolve(__dirname, '..', '..', '..', 'images.json')

async function upload(filePath) {
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'bronza-products' },
      (err, result) => (err ? reject(err) : resolve(result)),
    )
    createReadStream(filePath).pipe(stream)
  })
  return result.secure_url
}

async function main() {
  const files = (await readdir(IMG_DIR))
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || '0')
      const nb = parseInt(b.match(/\d+/)?.[0] || '0')
      return na - nb
    })

  const urls = {}
  for (const file of files) {
    const filePath = join(IMG_DIR, file)
    console.log(`Subiendo ${file}...`)
    const url = await upload(filePath)
    const key = file.replace(extname(file), '')
    urls[key] = url
    console.log(`  ✓ ${url}`)
  }

  await writeFile(OUTPUT, JSON.stringify(urls, null, 2))
  console.log(`\nURLs guardadas en ${OUTPUT}`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
