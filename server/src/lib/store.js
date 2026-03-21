import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '../../data')
const USERS_FILE = join(DATA_DIR, 'users.json')

const defaultData = { users: [] }

let writeChain = Promise.resolve()

async function ensureDataFile() {
  await mkdir(DATA_DIR, { recursive: true })
  try {
    await readFile(USERS_FILE, 'utf8')
  } catch {
    await writeFile(USERS_FILE, JSON.stringify(defaultData, null, 2), 'utf8')
  }
}

export async function readUsers() {
  await ensureDataFile()
  const raw = await readFile(USERS_FILE, 'utf8')
  try {
    const data = JSON.parse(raw)
    return Array.isArray(data.users) ? data.users : []
  } catch {
    return []
  }
}

/** Serializa escrituras para evitar condiciones de carrera simples. */
export function writeUsers(users) {
  writeChain = writeChain.then(async () => {
    await mkdir(DATA_DIR, { recursive: true })
    await writeFile(
      USERS_FILE,
      JSON.stringify({ users }, null, 2),
      'utf8',
    )
  })
  return writeChain
}
