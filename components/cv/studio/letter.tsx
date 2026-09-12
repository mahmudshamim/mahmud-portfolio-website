'use client'

import { useEffect, useRef, useState } from 'react'
import type { CVData } from '@/app/cv/page'
import { fileSafe, printElement } from '../print'
import { matchJob, type RoleVersion } from './model'
import type { EditCtx } from './sections'
import { Button, Icon, Label, Segmented, TextArea, TextField, c, font, radius } from './ui'

/*
 * A cover letter per role version.
 *
 * It is drafted from what the CV already says, the current job, the skills
 * this version shows, a project or two, so it can never claim something the
 * CV does not. The draft is a starting point in an ordinary text box; the
 * page it prints on carries the same name, contact line and accent colour as
 * the CV, so the two read as a set.
 */

export type Letter = NonNullable<RoleVersion['letter']>

export const emptyLetter: Letter = { company: '', manager: '', tone: 'formal', body: '' }

const ACRONYM = /^(ui|ux|css|html|sql|api|apis|aws|seo|sem|crm|php|gcp|ga4)$/i

const list = (a: string[]) => (a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`)
const lowerFirst = (s: string) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s)
const VERB = /^(built|led|designed|developed|created|launched|managed|improved|reduced|increased|grew|ran|delivered|shipped|automated|migrated|wrote|owned|fixed|cut|scaled|implemented|maintained|supported|handled|trained|organi[sz]ed|coordinated|planned|taught)\b/i

/** The first concrete point in a job description. */
const firstPoint = (desc: string) =>
  desc
    .split(/\n|\s·\s|•|;|\.\s/)
    .map((x) => x.trim().replace(/^[-•*]\s*/, '').replace(/\.$/, ''))
    .find((x) => x.split(' ').length >= 3) ?? ''

export function letterDraft(cv: CVData, role: string, o: { company: string; manager: string; ad: string; tone: Letter['tone'] }) {
  const friendly = o.tone === 'friendly'
  const co = o.company.trim()
  const company = co || 'your company'
  const title = role || cv.personal.role || 'this'

  const greet = o.manager.trim() ? `Dear ${o.manager.trim()},` : friendly ? `Hello ${co ? `${co} team` : 'there'},` : 'Dear Hiring Manager,'
  const open = friendly
    ? `I was excited to see the ${title} role at ${company}, and I would love to be considered for it.`
    : `I am writing to apply for the ${title} position at ${company}.`

  const job = cv.experience[0]
  let now = ''
  if (job?.role) {
    const where = job.current ? `In my current role as ${job.role}${job.company ? ` at ${job.company}` : ''}` : `As ${job.role}${job.company ? ` at ${job.company}` : ''}`
    const point = firstPoint(job.desc || '')
    now = point
      ? VERB.test(point)
        ? `${where}, I ${lowerFirst(point)}.`
        : `${where}, my work has included ${lowerFirst(point)}.`
      : `${where}, I have built the hands-on experience this role needs.`
  } else if (cv.education[0]?.degree) {
    const e = cv.education[0]
    now = `I recently completed ${e.degree}${e.school ? ` at ${e.school}` : ''}, and I am ready to put it to work.`
  }

  const skills = cv.skills.slice(0, 5).map((s) => s.name)
  /* Say the advert's words back, but only the ones the CV really has, and in
     the CV's own spelling ("Next.js", not "next.js"). */
  const asked = o.ad.trim().split(/\s+/).length >= 25 ? matchJob(cv, o.ad).matched : []
  const spelled = asked
    .map((k) => cv.skills.find((s) => s.name.toLowerCase() === k)?.name ?? (ACRONYM.test(k) ? k.toUpperCase() : k.length > 3 ? k[0].toUpperCase() + k.slice(1) : ''))
    .filter(Boolean)
    .slice(0, 4)
  let middle = skills.length ? `The skills I would bring to the team are ${list(skills)}.` : ''
  if (spelled.length) middle += ` Your advert asks for ${list(spelled)}, and ${friendly ? 'these are things I work with every day' : 'these are areas where I already have practical experience'}.`

  const projects = cv.projects.filter((p) => p.name).slice(0, 2)
  const proof = projects.length
    ? `Recent work I am proud of includes ${list(projects.map((p) => (p.shortDesc ? `${p.name} (${lowerFirst(p.shortDesc.replace(/\.$/, ''))})` : p.name)))}.`
    : ''

  const close = friendly
    ? `I would really enjoy talking about how I could help ${company}. Thank you for reading, and I hope to hear from you soon.`
    : `I would welcome the opportunity to discuss how I can contribute to ${company}. Thank you for your time and consideration.`
  const sign = `${friendly ? 'Best regards,' : 'Sincerely,'}\n${cv.personal.name || ''}`.trim()

  return [greet, [open, now].filter(Boolean).join(' '), [middle, proof].filter(Boolean).join(' '), close, sign].filter(Boolean).join('\n\n')
}

/** The letter as it prints: same name, contact line and accent as the CV. */
export function LetterDocument({ cv, letter, id, innerRef }: { cv: CVData; letter: Letter; id?: string; innerRef?: React.Ref<HTMLDivElement> }) {
  const p = cv.personal
  const ds = cv.docStyle
  const family = ds.typeface === 'serif' ? 'Georgia, "Times New Roman", serif' : ds.typeface === 'mono' ? '"SF Mono", Menlo, Consolas, monospace' : 'Helvetica, Arial, sans-serif'
  const contact = [p.email, p.phone, p.location, p.portfolio].filter(Boolean)
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div
      id={id}
      ref={innerRef}
      style={{ width: 794, minHeight: 1122, boxSizing: 'border-box', padding: '72px 78px', background: '#fff', color: ds.ink || '#222', fontFamily: family }}
    >
      <header style={{ borderBottom: `2px solid ${ds.accent}`, paddingBottom: 18, marginBottom: 30 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#111', letterSpacing: '-.01em' }}>{p.name || 'Your name'}</div>
        {p.role && <div style={{ fontSize: 14, fontWeight: 600, color: ds.accent, marginTop: 4 }}>{p.role}</div>}
        {contact.length > 0 && <div style={{ fontSize: 12.5, color: '#555', marginTop: 10 }}>{contact.join('   ·   ')}</div>}
      </header>
      <div style={{ fontSize: 13, color: '#555', marginBottom: 22 }}>{date}</div>
      {(letter.manager || letter.company) && (
        <div style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 26 }}>
          {letter.manager && <div>{letter.manager}</div>}
          {letter.company && <div>{letter.company}</div>}
        </div>
      )}
      <div style={{ fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{letter.body || ' '}</div>
    </div>
  )
}

/** The letter, scaled to its column. */
export function LetterPreview({ cv, letter }: { cv: CVData; letter: Letter }) {
  const frame = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.45)
  const [height, setHeight] = useState(1122)

  useEffect(() => {
    const f = frame.current
    const i = inner.current
    if (!f || !i) return
    const measure = () => {
      setScale(Math.min(1, f.clientWidth / 794))
      setHeight(Math.max(1122, i.scrollHeight))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(f)
    ro.observe(i)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={frame} style={{ width: '100%' }}>
      <div style={{ position: 'relative', height: height * scale }}>
        <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left', boxShadow: '0 8px 32px rgba(15,23,42,.12)', borderRadius: 4, overflow: 'hidden' }}>
          <LetterDocument cv={cv} letter={letter} id="cv-letter-content" innerRef={inner} />
        </div>
      </div>
    </div>
  )
}

export const downloadLetter = (cv: CVData) =>
  printElement(document.getElementById('cv-letter-content'), `${fileSafe(cv.personal.name) || 'Cover'}-Cover-Letter`)

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    /* Older iOS without clipboard permission: fall back to a hidden field. */
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

export function LetterEditor({ ctx, inlinePreview }: { ctx: EditCtx; inlinePreview: boolean }) {
  const { cv, version, role, updateVersion, confirm, toast } = ctx
  const letter = version.letter ?? emptyLetter
  const [ad, setAd] = useState('')
  const [adOpen, setAdOpen] = useState(false)
  const set = (patch: Partial<Letter>) => updateVersion({ letter: { ...letter, ...patch } })
  const words = letter.body.trim() ? letter.body.trim().split(/\s+/).length : 0

  const write = async () => {
    if (letter.body.trim()) {
      const ok = await confirm({
        title: 'Replace your letter?',
        body: 'We will write a new draft from your CV. Your current text will be replaced.',
        confirmLabel: 'Replace',
        tone: 'warn',
        icon: 'sparkle',
      })
      if (!ok) return
    }
    set({ body: letterDraft(cv, role, { company: letter.company, manager: letter.manager, ad, tone: letter.tone }) })
    toast('Draft written. Read it through and make it yours.')
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Company name" placeholder="e.g. Brain Station 23" value={letter.company} onChange={(e) => set({ company: e.target.value })} autoCapitalize="words" />
      <TextField label="Hiring manager" hint="optional" placeholder="e.g. Ms. Nusrat Jahan" value={letter.manager} onChange={(e) => set({ manager: e.target.value })} autoCapitalize="words" />
      <div>
        <Label>Tone</Label>
        <Segmented
          full
          value={letter.tone}
          options={[
            { v: 'formal', l: 'Formal' },
            { v: 'friendly', l: 'Friendly' },
          ]}
          onChange={(v) => set({ tone: v })}
        />
      </div>

      {adOpen ? (
        <TextArea label="Job advert" hint="optional" placeholder="Paste the job description here…" value={ad} rows={5} onChange={(e) => setAd(e.target.value)} />
      ) : (
        <button
          onClick={() => setAdOpen(true)}
          style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: font, fontSize: 14, fontWeight: 600, color: c.brandInk, background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer' }}
        >
          <Icon name="plus" size={16} /> Paste the job advert, so the letter mentions what it asks for
        </button>
      )}

      <Button variant="primary" icon="sparkle" block onClick={write}>
        {letter.body.trim() ? 'Write a new draft' : 'Write my letter'}
      </Button>

      <TextArea
        label="Your letter"
        placeholder="Tap “Write my letter” for a draft, or write your own here."
        value={letter.body}
        rows={14}
        onChange={(e) => set({ body: e.target.value })}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: font, fontSize: 13, color: words === 0 ? c.faint : words < 150 || words > 400 ? c.warn : c.good }}>
          {`${words} words`} {words > 0 && (words < 150 ? '· a bit short' : words > 400 ? '· keep it under one page' : '· good length')}
        </span>
        <span style={{ flex: 1 }} />
        <Button
          size="sm"
          icon="file"
          disabled={!letter.body.trim()}
          onClick={async () => {
            const ok = await copyText(letter.body)
            toast(ok ? 'Letter copied' : 'Could not copy. Select the text and copy it.')
          }}
        >
          Copy text
        </Button>
      </div>
      <p style={{ margin: 0, fontFamily: font, fontSize: 13, lineHeight: 1.55, color: c.muted }}>
        {`Each CV version keeps its own letter. This one is for ${role || 'this role'}.`}
      </p>

      {inlinePreview && letter.body.trim() && (
        <div style={{ marginTop: 6, padding: 12, borderRadius: radius.lg, background: '#e9e7f1' }}>
          <LetterPreview cv={cv} letter={letter} />
        </div>
      )}
    </div>
  )
}
