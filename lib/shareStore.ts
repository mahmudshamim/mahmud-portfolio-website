import { randomInt } from 'node:crypto'
import { inflateRawSync } from 'node:zlib'

/*
 * Short share links.
 *
 * A CV shared as a link used to travel inside the URL itself, which made the
 * link hundreds of characters long. With a store connected, the same
 * compressed CV is kept under an eight-letter id and the link becomes
 * /c/<id>. The store is Upstash Redis, which the Vercel marketplace connects
 * to a project in one click and which answers plain HTTPS, so no client
 * library is needed.
 *
 * Without the environment variables nothing here runs: the share sheet falls
 * back to the long, self-contained link.
 */

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ''
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''

/** A year: long enough for a job hunt, short enough not to keep CVs forever. */
const TTL_SECONDS = 60 * 60 * 24 * 365
const MAX_PAYLOAD = 60_000
const MAX_PER_HOUR = 40
/* No 0/O, 1/l/I: people read these links aloud and type them. */
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const shareEnabled = () => Boolean(REDIS_URL && REDIS_TOKEN)

async function redis(command: (string | number)[]) {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`store answered ${res.status}`)
  return (await res.json()).result as unknown
}

export type SharePayload = { v: 1; t: string; d: { personal?: { name?: string; role?: string } } & Record<string, unknown> }

/** Decode and sanity-check a payload, so the store only ever holds CVs. */
export function readPayload(raw: string): SharePayload | null {
  if (typeof raw !== 'string' || raw.length > MAX_PAYLOAD || !/^[zu][A-Za-z0-9_-]{8,}$/.test(raw)) return null
  try {
    const bytes = Buffer.from(raw.slice(1), 'base64url')
    const json = raw[0] === 'z' ? inflateRawSync(bytes, { maxOutputLength: 500_000 }).toString('utf8') : bytes.toString('utf8')
    const o = JSON.parse(json) as SharePayload
    return o?.v === 1 && o.d && typeof o.d === 'object' ? o : null
  } catch {
    return null
  }
}

const newId = () => Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')

/** Store a payload and return its id, or null when this address has made too many links. */
export async function putShare(payload: string, ip: string): Promise<string | null> {
  const key = `cv:rl:${ip}`
  const count = Number(await redis(['INCR', key]))
  if (count === 1) await redis(['EXPIRE', key, 3600])
  if (count > MAX_PER_HOUR) return null

  for (let attempt = 0; attempt < 4; attempt++) {
    const id = newId()
    const ok = await redis(['SET', `cv:share:${id}`, payload, 'EX', TTL_SECONDS, 'NX'])
    if (ok === 'OK') return id
  }
  throw new Error('could not find a free id')
}

export async function getShare(id: string): Promise<string | null> {
  if (!shareEnabled() || !/^[A-Za-z0-9]{6,12}$/.test(id)) return null
  const value = await redis(['GET', `cv:share:${id}`])
  return typeof value === 'string' ? value : null
}
