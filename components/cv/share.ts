import type { CVData, CVTemplate } from '@/app/cv/page'

/*
 * A share link with the CV inside it.
 *
 * There is no database, so the link carries the CV itself: the tailored
 * version's data, compressed and base64url-encoded into the URL fragment.
 * The fragment never reaches a server, not even ours, so sharing leaks
 * nothing beyond the person you send it to. The trade-off is honest and
 * shown in the UI: the link is long, and it freezes the CV as it was when
 * shared.
 */

type Payload = { v: 1; t: CVTemplate; d: CVData }

function toB64Url(bytes: Uint8Array) {
  let bin = ''
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...Array.from(bytes.subarray(i, i + 0x8000)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromB64Url(s: string) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

const canCompress = () => typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined'

async function deflate(text: string) {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function inflate(bytes: Uint8Array) {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Response(stream).text()
}

/** A photo small enough to ride in a link: 120px JPEG. */
async function shrink(src: string, max = 120): Promise<string> {
  if (!src) return ''
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = src
    })
    const scale = Math.min(1, max / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.72)
  } catch {
    return ''
  }
}

export async function buildShareLink(cv: CVData, template: CVTemplate, withPhoto: boolean) {
  const photo = withPhoto ? await shrink(cv.photo || cv.personal.photo) : ''
  const d: CVData = {
    ...cv,
    photo,
    personal: { ...cv.personal, photo: '' },
    /* The share view shows one document; the rest is the editor's business. */
    projects: cv.projects.map((p) => ({ ...p, fullDesc: p.fullDesc === p.shortDesc ? '' : p.fullDesc })),
  }
  const json = JSON.stringify({ v: 1, t: template, d } satisfies Payload)
  const body = canCompress() ? `z${toB64Url(await deflate(json))}` : `u${toB64Url(new TextEncoder().encode(json))}`
  return `${window.location.origin}/cv/view#${body}`
}

export async function readShareLink(hash: string): Promise<{ cv: CVData; template: CVTemplate }> {
  const raw = hash.replace(/^#/, '')
  if (raw.length < 10) throw new Error('empty')
  const bytes = fromB64Url(raw.slice(1))
  const json = raw[0] === 'z' ? await inflate(bytes) : new TextDecoder().decode(bytes)
  const o = JSON.parse(json) as Payload
  if (o?.v !== 1 || !o.d?.personal) throw new Error('not a CV link')
  const d = o.d
  d.projects = (d.projects || []).map((p) => ({ ...p, fullDesc: p.fullDesc || p.shortDesc }))
  return { cv: d, template: o.t }
}
