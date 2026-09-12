'use client'

import { useRef, useState } from 'react'
import type { CVData } from '@/app/cv/page'
import { ROLE_PRESETS, closestRoles, jobKey, keywordsFor, relevance, skillIdeas, summaryStarter, type RoleVersion } from './model'
import { Button, Chip, Icon, IconButton, TextArea, TextField, Toggle, c, downscaleImage, font, radius, type Confirm, type IconName } from './ui'

/*
 * The CV, one section at a time.
 *
 * The old builder showed every section, a checklist and a style panel at
 * once. Here the home screen is a list of sections with a one-line status
 * each, and tapping one opens only that section, the pattern people already
 * know from their phone's settings.
 */

export type SectionId = 'about' | 'contact' | 'summary' | 'work' | 'education' | 'skills' | 'projects'

export type EditCtx = {
  profile: CVData
  setProfile: (fn: (p: CVData) => CVData) => void
  cv: CVData
  version: RoleVersion
  role: string
  setRole: (role: string) => void
  /** Re-pick skills and projects for `next` (or the typed role). */
  commitRole: (next?: string) => void
  setHidden: (kind: 'skills' | 'projects' | 'experience', key: string, hide: boolean) => void
  updateVersion: (patch: Partial<RoleVersion>) => void
  toast: (m: string) => void
  confirm: Confirm
}

export const SECTIONS: { id: SectionId; title: string; icon: IconName; lead: string }[] = [
  { id: 'about', title: 'About you', icon: 'user', lead: 'Your name, photo and the job you want.' },
  { id: 'contact', title: 'Contact', icon: 'mail', lead: 'How recruiters reach you. Email matters most.' },
  { id: 'summary', title: 'Summary', icon: 'text', lead: 'Two or three lines at the top. Each role gets its own.' },
  { id: 'work', title: 'Work experience', icon: 'briefcase', lead: 'Most recent first. Freelance, part-time and internships count.' },
  { id: 'education', title: 'Education', icon: 'cap', lead: 'Degrees, diplomas, bootcamps and courses.' },
  { id: 'skills', title: 'Skills', icon: 'star', lead: 'Add everything once. Each role shows the ones that fit.' },
  { id: 'projects', title: 'Projects', icon: 'folder', lead: 'Work that proves your skills. Great early in a career.' },
]

export const ACTION_VERBS = ['Built', 'Led', 'Designed', 'Improved', 'Launched', 'Reduced', 'Automated', 'Managed', 'Delivered', 'Fixed']

const words = (s: string) => (s || '').trim().split(/\s+/).filter(Boolean).length

export type Status = { text: string; state: 'done' | 'todo' | 'warn' | 'optional' }

export function summaryOf(profile: CVData, version: RoleVersion) {
  return version.summary ?? profile.personal.summary ?? ''
}

/** A version inherits the profile summary until it gets its own, and that
 *  summary was usually written for another role. */
export function summaryOffRole(profile: CVData, version: RoleVersion) {
  const s = summaryOf(profile, version)
  return Boolean(version.role && s.trim() && relevance(s, keywordsFor(version.role)) === 0)
}

export function sectionStatus(id: SectionId, profile: CVData, version: RoleVersion): Status {
  const p = profile.personal
  const role = version.role
  switch (id) {
    case 'about':
      return p.name && role ? { text: `${p.name} · ${role}`, state: 'done' } : { text: !p.name ? 'Add your name' : 'Add the job you want', state: 'todo' }
    case 'contact':
      return p.email ? { text: [p.email, p.phone].filter(Boolean).join(' · '), state: 'done' } : { text: 'Add your email', state: 'todo' }
    case 'summary': {
      const s = summaryOf(profile, version)
      if (!s.trim()) return { text: 'Write two or three lines', state: 'todo' }
      if (summaryOffRole(profile, version)) return { text: `Doesn’t mention ${role} yet`, state: 'warn' }
      if (words(s) < 20) return { text: 'A little short, aim for 30+ words', state: 'warn' }
      return { text: role ? `Written for ${role}` : 'Written', state: 'done' }
    }
    case 'work': {
      const n = profile.experience.length
      if (!n) return { text: 'Add a job, or skip if you are new', state: 'optional' }
      const shown = profile.experience.filter((j) => !version.hidden.experience.includes(jobKey(j))).length
      const jobs = (n === 1 ? `${n} job` : `${n} jobs`)
      return { text: shown < n ? `${jobs} · ${`${shown} shown`}` : jobs, state: 'done' }
    }
    case 'education': {
      const n = profile.education.length
      return n ? { text: (n === 1 ? `${n} entry` : `${n} entries`), state: 'done' } : { text: 'Add a degree or course', state: 'optional' }
    }
    case 'skills': {
      const n = profile.skills.length
      const shown = profile.skills.filter((s) => !version.hidden.skills.includes(s.name)).length
      if (shown < 3) return { text: n ? `Only ${shown} shown, add a few more` : 'Add at least three skills', state: 'todo' }
      return { text: role ? `${shown} of ${n} shown for ${role}` : `${shown} of ${n} shown`, state: 'done' }
    }
    case 'projects': {
      const n = profile.projects.length
      if (!n) return { text: 'Optional: one project helps you stand out', state: 'optional' }
      const shown = profile.projects.filter((x) => !version.hidden.projects.includes(x.id)).length
      return { text: `${shown} of ${n} shown`, state: 'done' }
    }
  }
}

export function SectionEditor({ id, ctx }: { id: SectionId; ctx: EditCtx }) {
  switch (id) {
    case 'about':
      return <AboutEditor ctx={ctx} />
    case 'contact':
      return <ContactEditor ctx={ctx} />
    case 'summary':
      return <SummaryEditor ctx={ctx} />
    case 'work':
      return <WorkEditor ctx={ctx} />
    case 'education':
      return <EducationEditor ctx={ctx} />
    case 'skills':
      return <SkillsEditor ctx={ctx} />
    case 'projects':
      return <ProjectsEditor ctx={ctx} />
  }
}

/* ── Shared bits ──────────────────────────────────────────────────────── */

function Note({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'warn' | 'good' | 'info' }) {
  const t = {
    muted: { fg: c.muted, bg: 'transparent', pad: 0 },
    info: { fg: c.brandInk, bg: c.brandSoft, pad: '10px 12px' },
    warn: { fg: c.warn, bg: c.warnSoft, pad: '10px 12px' },
    good: { fg: '#166534', bg: c.goodSoft, pad: '10px 12px' },
  }[tone]
  return (
    <p style={{ margin: 0, fontFamily: font, fontSize: 13.5, lineHeight: 1.55, color: t.fg, background: t.bg, padding: t.pad, borderRadius: radius.md }}>
      {children}
    </p>
  )
}

/** One job / school / project: a summary row that opens into its fields. */
function ItemCard({
  title,
  sub,
  open,
  onToggleOpen,
  shown,
  onShow,
  showLabel,
  hiddenNote,
  children,
}: {
  title: string
  sub: string
  open: boolean
  onToggleOpen: () => void
  shown?: boolean
  onShow?: (v: boolean) => void
  showLabel?: string
  hiddenNote?: string
  children: React.ReactNode
}) {
  const visible = shown ?? true
  return (
    <div
      style={{
        minWidth: 0,
        border: `1.5px solid ${open ? c.brand : c.line}`,
        borderRadius: 18,
        background: visible ? c.surface : c.sunken,
        transition: 'border-color .15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px 12px 16px' }}>
        <button
          onClick={onToggleOpen}
          aria-expanded={open}
          style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', background: 'none', border: 'none', padding: '2px 0', cursor: 'pointer' }}
        >
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: font, fontSize: 15.5, fontWeight: 650, color: visible ? c.ink : c.faint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </span>
            <span style={{ display: 'block', fontFamily: font, fontSize: 13, color: c.muted, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {!visible && hiddenNote ? hiddenNote : sub}
            </span>
          </span>
          <span style={{ color: c.faint, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
            <Icon name="down" size={18} />
          </span>
        </button>
        {onShow && <Toggle on={visible} onChange={onShow} label={showLabel ?? 'Show in this CV'} />}
      </div>
      {open && <div style={{ padding: '4px 16px 16px', display: 'grid', gap: 14, borderTop: `1px solid ${c.line}`, paddingTop: 16 }}>{children}</div>}
    </div>
  )
}

function ItemActions({ onUp, onDown, onDelete, first, last }: { onUp?: () => void; onDown?: () => void; onDelete: () => void; first?: boolean; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {onUp && (
        <span style={{ opacity: first ? 0.35 : 1, pointerEvents: first ? 'none' : undefined }}>
          <IconButton icon="up" label="Move up" variant="soft" size={40} onClick={onUp} />
        </span>
      )}
      {onDown && (
        <span style={{ opacity: last ? 0.35 : 1, pointerEvents: last ? 'none' : undefined }}>
          <IconButton icon="dn" label="Move down" variant="soft" size={40} onClick={onDown} />
        </span>
      )}
      <span style={{ flex: 1 }} />
      <Button size="sm" variant="danger" icon="trash" onClick={onDelete}>
        Delete
      </Button>
    </div>
  )
}

/** The switches are per version; say so once rather than on every card. */
function SwitchHint({ role }: { role: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: radius.md, background: c.brandSoft, fontFamily: font, fontSize: 13, lineHeight: 1.45, color: c.brandInk }}>
      <span aria-hidden style={{ position: 'relative', width: 34, height: 20, flexShrink: 0, borderRadius: radius.pill, background: c.brand }}>
        <span style={{ position: 'absolute', top: 3, right: 3, width: 14, height: 14, borderRadius: '50%', background: '#fff' }} />
      </span>
      <span>{`The switch shows or hides an item in your ${role || 'current'} CV only. Your other versions keep their own choice.`}</span>
    </div>
  )
}

/**
 * A job title field with ready-made titles under it.
 *
 * Any title works. The presets only decide which skills and projects a new
 * version starts with, so a title with no preset (Nurse, Pilot) is not an
 * error: the CV simply keeps everything, and the note says so. As someone
 * types, the chips narrow to the closest presets instead of listing all of
 * them.
 */
export function RolePicker({
  value,
  onChange,
  onPick,
  onCommit,
  label = 'Job title',
  hint,
}: {
  value: string
  onChange: (v: string) => void
  onPick: (title: string) => void
  onCommit?: () => void
  label?: string
  hint?: string
}) {
  const [all, setAll] = useState(false)
  const q = value.trim()
  const exact = ROLE_PRESETS.find((r) => r.title.toLowerCase() === q.toLowerCase())
  const typing = Boolean(q) && !exact
  const matches = typing ? closestRoles(q) : []
  const chips = typing ? matches : all ? ROLE_PRESETS : ROLE_PRESETS.slice(0, 8)

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <TextField
        label={label}
        hint={hint}
        placeholder="Type any job, e.g. Accountant"
        value={value}
        autoComplete="organization-title"
        autoCapitalize="words"
        enterKeyHint="done"
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onCommit?.()}
        onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
      />
      {typing && matches.length > 0 && (
        <div style={{ fontFamily: font, fontSize: 12.5, color: c.muted }}>Close matches. Tap one, or keep your own title.</div>
      )}
      {chips.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {chips.map((r) => (
            <Chip key={r.title} active={exact?.title === r.title} onClick={() => onPick(r.title)}>
              {r.title}
            </Chip>
          ))}
          {!typing && !all && (
            <Chip dashed icon="plus" onClick={() => setAll(true)}>
              {`${ROLE_PRESETS.length - 8} more jobs`}
            </Chip>
          )}
        </div>
      )}
      {typing && (
        <Note tone="info">
          {matches.length
            ? `“${q}” works as it is. Picking a close match only helps choose your skills.`
            : `There is no ready-made list for “${q}”, and that is fine. Your CV keeps all your skills and projects, and you can hide any that do not fit.`}
        </Note>
      )}
    </div>
  )
}

function ScrollRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="studio-scroll-row" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 2px 4px', margin: '0 -2px', scrollbarWidth: 'none' }}>
      {children}
    </div>
  )
}

const move = <T,>(list: T[], i: number, d: -1 | 1) => {
  const n = [...list]
  const t = i + d
  if (t < 0 || t >= n.length) return list
  ;[n[i], n[t]] = [n[t], n[i]]
  return n
}

/* ── About ────────────────────────────────────────────────────────────── */

function AboutEditor({ ctx }: { ctx: EditCtx }) {
  const { profile, setProfile, role, setRole, commitRole, toast } = ctx
  const p = profile.personal
  const file = useRef<HTMLInputElement>(null)
  const set = (field: keyof CVData['personal']) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((prev) => ({ ...prev, personal: { ...prev.personal, [field]: e.target.value } }))

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14, borderRadius: 20, background: c.sunken }}>
        <button
          onClick={() => file.current?.click()}
          aria-label={profile.photo ? 'Change photo' : 'Add a photo'}
          style={{
            width: 78,
            height: 78,
            flexShrink: 0,
            padding: 0,
            borderRadius: '50%',
            overflow: 'hidden',
            border: profile.photo ? `3px solid ${c.surface}` : `2px dashed ${c.lineStrong}`,
            boxShadow: profile.photo ? '0 4px 14px rgba(21,19,29,.15)' : 'none',
            background: c.surface,
            color: c.brand,
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          {profile.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Icon name="camera" size={26} />
          )}
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: font, fontSize: 15, fontWeight: 650, color: c.ink }}>{profile.photo ? 'Your photo' : 'Add a photo'}</div>
          <div style={{ fontFamily: font, fontSize: 13, color: c.muted, lineHeight: 1.45, marginTop: 2 }}>Optional. Many recruiters prefer CVs without one.</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <Button size="sm" onClick={() => file.current?.click()}>
              {profile.photo ? 'Change' : 'Choose photo'}
            </Button>
            {profile.photo && (
              <Button size="sm" variant="ghost" onClick={() => setProfile((prev) => ({ ...prev, photo: '' }))}>
                Remove
              </Button>
            )}
          </div>
        </div>
        <input
          ref={file}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (!f) return
            try {
              const photo = await downscaleImage(f)
              setProfile((prev) => ({ ...prev, photo }))
              toast('Photo added')
            } catch {
              toast('That image could not be read. Try a JPG or PNG.')
            }
          }}
        />
      </div>

      <TextField label="Full name" placeholder="e.g. Ayesha Rahman" value={p.name} onChange={set('name')} autoComplete="name" autoCapitalize="words" enterKeyHint="next" />

      <div style={{ display: 'grid', gap: 10 }}>
        <RolePicker
          label="Job you want"
          hint="shapes the whole CV"
          value={role}
          onChange={setRole}
          onCommit={() => commitRole()}
          onPick={(title) => {
            setRole(title)
            commitRole(title)
          }}
        />
        <Note>Change it and your skills and projects re-pick themselves for the new role. Nothing is deleted.</Note>
      </div>
    </div>
  )
}

/* ── Contact ──────────────────────────────────────────────────────────── */

function ContactEditor({ ctx }: { ctx: EditCtx }) {
  const { profile, setProfile } = ctx
  const p = profile.personal
  const set = (field: keyof CVData['personal']) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile((prev) => ({ ...prev, personal: { ...prev.personal, [field]: e.target.value } }))

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField label="Email" type="email" inputMode="email" autoComplete="email" autoCapitalize="off" placeholder="you@example.com" value={p.email} onChange={set('email')} enterKeyHint="next" />
      <TextField label="Phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+880 1XXX XXXXXX" value={p.phone} onChange={set('phone')} enterKeyHint="next" />
      <TextField label="City" autoComplete="address-level2" placeholder="Dhaka, Bangladesh" value={p.location} onChange={set('location')} enterKeyHint="next" />
      <TextField label="Website or portfolio" hint="optional" type="url" inputMode="url" autoCapitalize="off" placeholder="yourname.com" value={p.portfolio} onChange={set('portfolio')} />
      <TextField label="LinkedIn" hint="optional" type="url" inputMode="url" autoCapitalize="off" placeholder="linkedin.com/in/yourname" value={p.linkedin} onChange={set('linkedin')} />
      <TextField label="GitHub" hint="optional" type="url" inputMode="url" autoCapitalize="off" placeholder="github.com/yourname" value={p.github} onChange={set('github')} />
    </div>
  )
}

/* ── Summary ──────────────────────────────────────────────────────────── */

function SummaryEditor({ ctx }: { ctx: EditCtx }) {
  const { profile, cv, version, role, updateVersion, confirm } = ctx
  const summary = summaryOf(profile, version)
  const n = words(summary)
  const offRole = summaryOffRole(profile, version)

  const draft = async () => {
    if (summary.trim()) {
      const ok = await confirm({
        title: 'Replace your summary?',
        body: 'We will write a starter from your jobs and skills. You can edit it after.',
        confirmLabel: 'Replace',
        tone: 'warn',
        icon: 'sparkle',
      })
      if (!ok) return
    }
    updateVersion({ summary: summaryStarter(cv, role) })
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <TextArea
        aria-label="Professional summary"
        placeholder="e.g. Frontend developer with two years building React apps for clients…"
        value={summary}
        rows={7}
        onChange={(e) => updateVersion({ summary: e.target.value })}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Button variant="soft" icon="sparkle" onClick={draft}>
          Write a draft for me
        </Button>
        <span style={{ fontFamily: font, fontSize: 13, color: n === 0 ? c.faint : n < 20 || n > 90 ? c.warn : c.good }}>
          {`${n} words`} {n > 0 && (n < 20 ? '· a bit short' : n > 90 ? '· trim it down' : '· good length')}
        </span>
      </div>
      {offRole ? (
        <Note tone="warn">{`This summary doesn’t mention anything a ${role} would. Rewrite it, or tap “Write a draft for me”.`}</Note>
      ) : (
        <Note>{`Only the ${role || 'current'} version uses this text. Name the tools you want to be hired for. Screening software reads this first.`}</Note>
      )}
    </div>
  )
}

/* ── Work ─────────────────────────────────────────────────────────────── */

type Job = CVData['experience'][number]
type School = CVData['education'][number]
type Project = CVData['projects'][number]

function WorkEditor({ ctx }: { ctx: EditCtx }) {
  const { profile, setProfile, version, setHidden, role, confirm } = ctx
  const [open, setOpen] = useState<number | null>(profile.experience.length ? null : -1)
  const update = (i: number, patch: Partial<Job>) =>
    setProfile((p) => ({ ...p, experience: p.experience.map((j, k) => (k === i ? { ...j, ...patch } : j)) }))

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {profile.experience.length > 0 && <SwitchHint role={role} />}
      {profile.experience.map((job, i) => {
        const shown = !version.hidden.experience.includes(jobKey(job))
        const n = words(job.desc)
        return (
          <ItemCard
            key={i}
            title={job.role || 'Untitled job'}
            sub={[job.company, job.date].filter(Boolean).join(' · ') || 'Tap to add details'}
            open={open === i}
            onToggleOpen={() => setOpen(open === i ? null : i)}
            shown={shown}
            onShow={(v) => setHidden('experience', jobKey(job), !v)}
            showLabel={`Show in the ${role || 'current'} CV`}
            hiddenNote={`Hidden in the ${role || 'current'} CV`}
          >
            <TextField label="Job title" placeholder="e.g. Web Developer" value={job.role} onChange={(e) => update(i, { role: e.target.value })} autoCapitalize="words" />
            <TextField label="Company" placeholder="e.g. Khulna Technologies" value={job.company} onChange={(e) => update(i, { company: e.target.value })} autoCapitalize="words" />
            <TextField label="Dates" placeholder="Jan 2024 - Present" value={job.date} onChange={(e) => update(i, { date: e.target.value })} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: font, fontSize: 14.5, color: c.body }}>
              <Toggle on={Boolean(job.current)} onChange={(v) => update(i, { current: v })} label="I work here now" />
              I work here now
            </label>
            <TextArea label="What you did" hint="one point per line" placeholder={'Built …\nImproved …\nLed …'} value={job.desc} rows={5} onChange={(e) => update(i, { desc: e.target.value })} />
            <div>
              <div style={{ fontFamily: font, fontSize: 12.5, color: c.muted, marginBottom: 6 }}>Start a line with</div>
              <ScrollRow>
                {ACTION_VERBS.map((v) => (
                  <Chip
                    key={v}
                    dashed
                    onClick={() => {
                      const base = job.desc.trimEnd()
                      update(i, { desc: base ? `${base}\n${v} ` : `${v} ` })
                    }}
                  >
                    + {v}
                  </Chip>
                ))}
              </ScrollRow>
            </div>
            <Note tone={n === 0 ? 'muted' : n < 15 || n > 80 ? 'warn' : 'good'}>
              {n === 0
                ? 'Say what you built and what changed because of it: a number, a time saved, a problem fixed.'
                : n < 15
                  ? `${n} words. One more concrete point would help.`
                  : n > 80
                    ? `${n} words. Keep the 3-4 strongest points so it stays easy to scan.`
                    : `${n} words, good length.`}
            </Note>
            <ItemActions
              first={i === 0}
              last={i === profile.experience.length - 1}
              onUp={() => setProfile((p) => ({ ...p, experience: move(p.experience, i, -1) }))}
              onDown={() => setProfile((p) => ({ ...p, experience: move(p.experience, i, 1) }))}
              onDelete={async () => {
                const ok = await confirm({ title: `Delete ${job.role || 'this job'}?`, body: 'It will be removed from every version of your CV.', confirmLabel: 'Delete' })
                if (!ok) return
                setProfile((p) => ({ ...p, experience: p.experience.filter((_, k) => k !== i) }))
                setOpen(null)
              }}
            />
          </ItemCard>
        )
      })}

      <Button
        variant="muted"
        block
        icon="plus"
        onClick={() => {
          setProfile((p) => ({ ...p, experience: [...p.experience, { role: '', company: '', date: '', desc: '', current: false }] }))
          setOpen(profile.experience.length)
        }}
      >
        Add a job
      </Button>
      {!profile.experience.length && <Note>No work experience yet? That is fine. Projects and education can carry a first CV.</Note>}
    </div>
  )
}

/* ── Education ────────────────────────────────────────────────────────── */

function EducationEditor({ ctx }: { ctx: EditCtx }) {
  const { profile, setProfile, confirm } = ctx
  const [open, setOpen] = useState<number | null>(profile.education.length ? null : -1)
  const update = (i: number, patch: Partial<School>) =>
    setProfile((p) => ({ ...p, education: p.education.map((s, k) => (k === i ? { ...s, ...patch } : s)) }))

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {profile.education.map((s, i) => (
        <ItemCard
          key={i}
          title={s.degree || 'Untitled qualification'}
          sub={[s.school, s.date].filter(Boolean).join(' · ') || 'Tap to add details'}
          open={open === i}
          onToggleOpen={() => setOpen(open === i ? null : i)}
        >
          <TextField label="Qualification" placeholder="e.g. BSc in Computer Science" value={s.degree} onChange={(e) => update(i, { degree: e.target.value })} />
          <TextField label="School or institute" placeholder="e.g. University of Dhaka" value={s.school} onChange={(e) => update(i, { school: e.target.value })} autoCapitalize="words" />
          <TextField label="Dates" placeholder="2019 - 2023" value={s.date} onChange={(e) => update(i, { date: e.target.value })} />
          <ItemActions
            first={i === 0}
            last={i === profile.education.length - 1}
            onUp={() => setProfile((p) => ({ ...p, education: move(p.education, i, -1) }))}
            onDown={() => setProfile((p) => ({ ...p, education: move(p.education, i, 1) }))}
            onDelete={async () => {
              const ok = await confirm({ title: `Delete ${s.degree || 'this entry'}?`, body: 'It will be removed from every version of your CV.', confirmLabel: 'Delete' })
              if (!ok) return
              setProfile((p) => ({ ...p, education: p.education.filter((_, k) => k !== i) }))
              setOpen(null)
            }}
          />
        </ItemCard>
      ))}
      <Button
        variant="muted"
        block
        icon="plus"
        onClick={() => {
          setProfile((p) => ({ ...p, education: [...p.education, { degree: '', school: '', date: '' }] }))
          setOpen(profile.education.length)
        }}
      >
        Add education
      </Button>
    </div>
  )
}

/* ── Skills ───────────────────────────────────────────────────────────── */

function SkillsEditor({ ctx }: { ctx: EditCtx }) {
  const { profile, setProfile, version, setHidden, role, toast } = ctx
  const [draft, setDraft] = useState('')

  const have = new Set(profile.skills.map((s) => s.name.toLowerCase().replace(/\.js$/, '')))
  const ideas = skillIdeas(role)
  const suggestions = ideas
    .filter((k) => !have.has(k.toLowerCase().replace(/\.js$/, '')))
    .slice(0, 12)
  const shown = profile.skills.filter((s) => !version.hidden.skills.includes(s.name)).length

  const add = (raw: string) => {
    const names = raw.split(',').map((s) => s.trim()).filter(Boolean)
    if (!names.length) return
    setProfile((p) => {
      const existing = new Set(p.skills.map((s) => s.name.toLowerCase()))
      const fresh = names.filter((n) => !existing.has(n.toLowerCase())).map((name) => ({ name, level: 80, category: 'Skill', color: '#2563eb' }))
      return { ...p, skills: [...p.skills, ...fresh] }
    })
    setDraft('')
  }

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          add(draft)
        }}
        style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <TextField aria-label="Add a skill" placeholder="Type a skill, e.g. Figma" value={draft} enterKeyHint="done" onChange={(e) => setDraft(e.target.value)} />
        </div>
        <Button type="submit" variant="primary" disabled={!draft.trim()} style={{ minHeight: 50 }}>
          Add
        </Button>
      </form>

      {suggestions.length > 0 && (
        <div>
          <div style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: c.body, marginBottom: 8 }}>{`Popular for ${role || 'this role'}`}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {suggestions.map((s) => (
              <Chip key={s} dashed onClick={() => add(s)}>
                + {s}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {role && ideas.length === 0 && (
        <Note>{`No suggestions for “${role}” yet. Type your skills above, separated by commas.`}</Note>
      )}

      {profile.skills.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: font, fontSize: 13, fontWeight: 600, color: c.body }}>Your skills</span>
            <span style={{ fontFamily: font, fontSize: 12.5, color: c.muted }}>
              {`${shown} of ${profile.skills.length} in this CV · tap to show or hide`}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {profile.skills.map((s) => {
              const on = !version.hidden.skills.includes(s.name)
              return (
                <span
                  key={s.name}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    maxWidth: '100%',
                    borderRadius: radius.pill,
                    border: `1.5px solid ${on ? c.brand : c.line}`,
                    background: on ? c.brandSoft : c.sunken,
                  }}
                >
                  <button
                    onClick={() => setHidden('skills', s.name, on)}
                    aria-pressed={on}
                    title={on ? 'In this CV. Tap to hide.' : 'Hidden. Tap to show.'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      minWidth: 0,
                      minHeight: 40,
                      fontFamily: font,
                      fontSize: 14,
                      fontWeight: on ? 600 : 500,
                      padding: '0 4px 0 13px',
                      border: 'none',
                      background: 'none',
                      color: on ? c.brandInk : c.faint,
                      cursor: 'pointer',
                    }}
                  >
                    {on && <Icon name="check" size={14} stroke={2.6} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfile((p) => ({ ...p, skills: p.skills.filter((x) => x.name !== s.name) }))
                      toast(`Removed ${s.name}`)
                    }}
                    aria-label={`Delete ${s.name}`}
                    style={{ display: 'grid', placeItems: 'center', width: 34, height: 40, border: 'none', background: 'none', color: c.faint, cursor: 'pointer' }}
                  >
                    <Icon name="x" size={14} />
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Projects ─────────────────────────────────────────────────────────── */

function ProjectsEditor({ ctx }: { ctx: EditCtx }) {
  const { profile, setProfile, version, setHidden, role, confirm } = ctx
  const [open, setOpen] = useState<string | null>(null)
  const update = (id: string, patch: Partial<Project>) =>
    setProfile((p) => ({ ...p, projects: p.projects.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {profile.projects.length > 0 && <SwitchHint role={role} />}
      {profile.projects.map((p, i) => {
        const shown = !version.hidden.projects.includes(p.id)
        return (
          <ItemCard
            key={p.id}
            title={p.name || 'Untitled project'}
            sub={p.shortDesc || 'Tap to add details'}
            open={open === p.id}
            onToggleOpen={() => setOpen(open === p.id ? null : p.id)}
            shown={shown}
            onShow={(v) => setHidden('projects', p.id, !v)}
            showLabel={`Show in the ${role || 'current'} CV`}
            hiddenNote={`Hidden in the ${role || 'current'} CV`}
          >
            <TextField label="Project name" value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} />
            <TextField label="One line about it" placeholder="What it is and who it is for" value={p.shortDesc} onChange={(e) => update(p.id, { shortDesc: e.target.value, fullDesc: e.target.value })} />
            <TextField
              label="Built with"
              hint="comma separated"
              placeholder="React, Node.js, MongoDB"
              value={(p.tech || []).join(', ')}
              onChange={(e) => update(p.id, { tech: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
            />
            <TextField label="Link" hint="optional" type="url" inputMode="url" autoCapitalize="off" placeholder="https://" value={p.live} onChange={(e) => update(p.id, { live: e.target.value })} />
            <ItemActions
              first={i === 0}
              last={i === profile.projects.length - 1}
              onUp={() => setProfile((prev) => ({ ...prev, projects: move(prev.projects, i, -1) }))}
              onDown={() => setProfile((prev) => ({ ...prev, projects: move(prev.projects, i, 1) }))}
              onDelete={async () => {
                const ok = await confirm({ title: `Delete ${p.name || 'this project'}?`, body: 'It will be removed from every version of your CV.', confirmLabel: 'Delete' })
                if (!ok) return
                setProfile((prev) => ({ ...prev, projects: prev.projects.filter((x) => x.id !== p.id) }))
                setOpen(null)
              }}
            />
          </ItemCard>
        )
      })}
      <Button
        variant="muted"
        block
        icon="plus"
        onClick={() => {
          const id = `p-${Date.now().toString(36)}`
          setProfile((prev) => ({
            ...prev,
            projects: [...prev.projects, { id, name: '', shortDesc: '', fullDesc: '', tech: [], github: '', live: '', featured: true, category: 'Project', color: '#2563eb' }],
          }))
          setOpen(id)
        }}
      >
        Add a project
      </Button>
    </div>
  )
}
