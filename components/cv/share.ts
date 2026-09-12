import type { CVData, CVTemplate } from '@/app/cv/page'
import { DEFAULT_DOC_STYLE } from '@/app/cv/page'

/*
 * Share links.
 *
 * The CV is packed into a payload: only the fields that differ from a blank
 * CV, as JSON, deflated and base64url-encoded. With the short-link store
 * switched on the payload is kept on the server under an eight-letter id and
 * the link is /c/<id>. Without it the payload rides in the URL fragment of
 * /cv/view#..., which never reaches a server; the link is long, and it
 * freezes the CV as it was when shared.
 */

type Payload = { v: 1; t: CVTemplate; d: Partial<CVData> & Record<string, unknown> }

const SECTION_ORDER = ['summary', 'experience', 'projects', 'education']

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

/** Keep only what is set: empty strings, empty lists and defaults are restored on the other side. */
const filled = (o: Record<string, unknown>, defaults: Record<string, unknown> = {}) =>
  Object.fromEntries(Object.entries(o).filter(([k, v]) => v !== '' && v !== null && v !== undefined && v !== false && v !== defaults[k] && !(Array.isArray(v) && !v.length)))

function pack(cv: CVData, photo: string): Payload['d'] {
  const d: Record<string, unknown> = {
    personal: filled({ ...cv.personal, photo: '' } as Record<string, unknown>),
    skills: cv.skills.map((s) => filled(s as Record<string, unknown>, { level: 80, category: 'Skill', color: '#2563eb' })),
    projects: cv.projects.map((p) =>
      filled({ ...p, id: '', fullDesc: p.fullDesc === p.shortDesc ? '' : p.fullDesc } as Record<string, unknown>, { featured: true, category: 'Project', color: '#2563eb' })
    ),
    experience: cv.experience.map((e) => filled(e as Record<string, unknown>)),
    education: cv.education.map((e) => filled(e as Record<string, unknown>)),
    customSections: cv.customSections.filter((c) => c.title.trim() || c.content.trim()).map((c) => filled({ ...c, id: '' })),
    photo,
    docStyle: filled(cv.docStyle as Record<string, unknown>, DEFAULT_DOC_STYLE as unknown as Record<string, unknown>),
    showSections: Object.fromEntries(Object.entries(cv.showSections).filter(([, on]) => !on)),
  }
  if (cv.sectionOrder.join() !== SECTION_ORDER.join()) d.sectionOrder = cv.sectionOrder
  return filled(d) as Payload['d']
}

/** The inverse of `pack`: a complete CV with every default back in place. */
function unpack(d: Payload['d']): CVData {
  const personal = (d.personal ?? {}) as Partial<CVData['personal']>
  const skills = ((d.skills ?? []) as Partial<CVData['skills'][number]>[]).map((s) => ({ name: '', level: 80, category: 'Skill', color: '#2563eb', ...s }))
  return {
    personal: {
      name: '', shortName: '', fullName: '', role: '', tagline: '', email: '', phone: '', location: '',
      github: '', portfolio: '', upwork: '', linkedin: '', summary: '', photo: '', available: false,
      ...personal,
    } as CVData['personal'],
    skills: skills as CVData['skills'],
    projects: ((d.projects ?? []) as Partial<CVData['projects'][number]>[]).map((p, i) => ({
      name: '', shortDesc: '', github: '', live: '', category: 'Project', color: '#2563eb',
      ...p,
      id: `p${i}`,
      tech: p.tech ?? [],
      fullDesc: p.fullDesc || p.shortDesc || '',
      featured: p.featured ?? true,
    })) as CVData['projects'],
    experience: ((d.experience ?? []) as Partial<CVData['experience'][number]>[]).map((e) => ({ role: '', company: '', date: '', desc: '', current: false, ...e })) as CVData['experience'],
    education: ((d.education ?? []) as Partial<CVData['education'][number]>[]).map((e) => ({ degree: '', school: '', date: '', ...e })) as CVData['education'],
    customSections: ((d.customSections ?? []) as Partial<CVData['customSections'][number]>[]).map((c, i) => ({ title: '', content: '', ...c, id: `c${i}` })),
    sectionOrder: (d.sectionOrder as string[]) ?? SECTION_ORDER,
    selectedSkills: skills.map((s) => s.name),
    photo: (d.photo as string) ?? '',
    docStyle: { ...DEFAULT_DOC_STYLE, ...(d.docStyle ?? {}) } as CVData['docStyle'],
    showSections: { summary: true, experience: true, projects: true, skills: true, education: true, ...(d.showSections ?? {}) },
  }
}

export async function encodePayload(cv: CVData, template: CVTemplate, withPhoto: boolean) {
  const photo = withPhoto ? await shrink(cv.photo || cv.personal.photo) : ''
  const json = JSON.stringify({ v: 1, t: template, d: pack(cv, photo) } satisfies Payload)
  return canCompress() ? `z${toB64Url(await deflate(json))}` : `u${toB64Url(new TextEncoder().encode(json))}`
}

export async function decodePayload(raw: string): Promise<{ cv: CVData; template: CVTemplate }> {
  const body = raw.replace(/^#/, '')
  if (body.length < 10) throw new Error('empty')
  const bytes = fromB64Url(body.slice(1))
  const json = body[0] === 'z' ? await inflate(bytes) : new TextDecoder().decode(bytes)
  const o = JSON.parse(json) as Payload
  if (o?.v !== 1 || !o.d) throw new Error('not a CV link')
  return { cv: unpack(o.d), template: o.t }
}

/* ── Short links ───────────────────────────────────────────────────────── */

let enabled: Promise<boolean> | null = null

/** Asked once per page load: is the short-link store connected? */
export function shortLinksEnabled() {
  enabled ??= fetch('/api/share')
    .then((r) => (r.ok ? r.json() : { enabled: false }))
    .then((j) => Boolean(j.enabled))
    .catch(() => false)
  return enabled
}

const CACHE_KEY = 'cv-share-links'

async function digest(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('')
}

/* The same CV shared twice gets the same link rather than a second copy. */
function cached(): Record<string, string> {
  try {
    return JSON.parse(window.localStorage.getItem(CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function remember(hash: string, id: string) {
  try {
    const entries = Object.entries(cached()).filter(([h]) => h !== hash).slice(-29)
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries([...entries, [hash, id]])))
  } catch {}
}

/* Requests already on their way, by payload hash. React runs effects twice
   in development and a sheet can re-open quickly; either would otherwise
   store the same CV twice. */
const inFlight = new Map<string, Promise<string | null>>()

async function storeOnce(hash: string, payload: string) {
  const known = cached()[hash]
  if (known) return known
  let pending = inFlight.get(hash)
  if (!pending) {
    pending = fetch('/api/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ d: payload }) })
      .then(async (res) => (res.ok ? ((await res.json()) as { id: string }).id : null))
      .then((id) => {
        if (id) remember(hash, id)
        return id
      })
      .catch(() => null)
      .finally(() => inFlight.delete(hash))
    inFlight.set(hash, pending)
  }
  return pending
}

export async function createShareLink(cv: CVData, template: CVTemplate, withPhoto: boolean): Promise<{ url: string; short: boolean }> {
  const payload = await encodePayload(cv, template, withPhoto)
  const origin = window.location.origin

  if (await shortLinksEnabled()) {
    /* Offline or the store is down: fall through to the long link, which
       still works. */
    const id = await storeOnce(await digest(payload), payload).catch(() => null)
    if (id) return { url: `${origin}/c/${id}`, short: true }
  }
  return { url: `${origin}/cv/view#${payload}`, short: false }
}
