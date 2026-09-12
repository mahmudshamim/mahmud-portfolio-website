'use client'

import { memo, useDeferredValue, useMemo, useState } from 'react'
import type { CVData, CVTemplate } from '@/app/cv/page'
import { DEFAULT_DOC_STYLE } from '@/app/cv/page'
import { CVDocument } from '../CVPreview'
import { matchJob, type RoleVersion } from './model'
import { Button, Eyebrow, Icon, Segmented, Slider, TextArea, TextField, Toggle, c, font, radius } from './ui'

export const TEMPLATES: { id: CVTemplate; label: string; note: string }[] = [
  { id: 'profile-split', label: 'Profile', note: 'Clean, two columns' },
  { id: 'ats-compact', label: 'ATS Simple', note: 'Safest for job portals' },
  { id: 'aurora', label: 'Aurora', note: 'Colour band header' },
  { id: 'soft-card', label: 'Soft Card', note: 'Tinted header card' },
  { id: 'elegant', label: 'Elegant', note: 'Centred and refined' },
  { id: 'metro', label: 'Metro', note: 'Numbered, bold timeline' },
  { id: 'monogram', label: 'Monogram', note: 'Initials badge' },
  { id: 'compact-pro', label: 'Compact Pro', note: 'Dense, fits one page' },
  { id: 'swiss-grid', label: 'Swiss', note: 'Minimal, typographic' },
  { id: 'accent-rule', label: 'Accent', note: 'One colour stripe' },
  { id: 'clean-minimal', label: 'Classic', note: 'Serif, centred' },
  { id: 'sidebar-light', label: 'Sidebar', note: 'Photo sidebar' },
  { id: 'timeline', label: 'Timeline', note: 'Dated timeline' },
  { id: 'executive', label: 'Executive', note: 'Dark header' },
  { id: 'dark-pro', label: 'Dark Pro', note: 'Dark sidebar' },
  { id: 'bold-header', label: 'Bold', note: 'Banner header' },
  { id: 'tech-blue', label: 'Code', note: 'Developer style' },
  { id: 'creative-panel', label: 'Creative', note: 'Dark left panel' },
]

export const templateLabel = (id: CVTemplate) => TEMPLATES.find((t) => t.id === id)?.label ?? 'Profile'

const ACCENTS = ['#2563eb', '#5b47e0', '#0f766e', '#be123c', '#b45309', '#111827', '#0891b2', '#16a34a', '#db2777', '#475569']

const INKS = [
  { v: '#222222', l: 'Black' },
  { v: '#374151', l: 'Graphite' },
  { v: '#1e293b', l: 'Navy' },
] as const

/* Templates drawn from the style variables. The older ones keep their own
   colours and type, so the panel says so instead of appearing broken. */
const STYLED = new Set<CVTemplate>(['profile-split', 'swiss-grid', 'ats-compact', 'accent-rule', 'aurora', 'soft-card', 'elegant', 'metro', 'monogram', 'compact-pro'])

const SECTION_TOGGLES: { k: keyof CVData['showSections']; l: string }[] = [
  { k: 'summary', l: 'Summary' },
  { k: 'experience', l: 'Work experience' },
  { k: 'projects', l: 'Projects' },
  { k: 'skills', l: 'Skills' },
  { k: 'education', l: 'Education' },
]

const DENSITY = {
  compact: { margin: 32, sectionGap: 16, lineHeight: 1.45, scale: 0.95 },
  comfortable: { margin: 44, sectionGap: 24, lineHeight: 1.65, scale: 1 },
  spacious: { margin: 54, sectionGap: 30, lineHeight: 1.8, scale: 1.05 },
} as const

/** Your actual CV, shrunk to `width`, not a hand-drawn miniature. */
export const MiniCV = memo(function MiniCV({ cv, template, width }: { cv: CVData; template: CVTemplate; width: number }) {
  const scale = width / 794
  return (
    <div style={{ width, height: Math.round(width * 1.414), overflow: 'hidden', position: 'relative', background: '#fff' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
        <CVDocument cvData={cv} template={template} />
      </div>
    </div>
  )
})

function Thumb({ cv, t, active, onPick, width }: { cv: CVData; t: (typeof TEMPLATES)[number]; active: boolean; onPick: () => void; width: number }) {
  return (
    <button
      onClick={onPick}
      aria-pressed={active}
      aria-label={`${t.label}: ${t.note}`}
      style={{ flexShrink: 0, width, textAlign: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer', scrollSnapAlign: 'center' }}
    >
      <div
        style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          border: `2px solid ${active ? c.brand : c.line}`,
          boxShadow: active ? `0 0 0 4px ${c.brand}26, 0 8px 20px rgba(21,19,29,.12)` : '0 2px 8px rgba(21,19,29,.06)',
          transition: 'box-shadow .2s, border-color .2s',
        }}
      >
        <MiniCV cv={cv} template={t.id} width={width - 4} />
        {active && (
          <span style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: c.brand, color: '#fff', display: 'grid', placeItems: 'center' }}>
            <Icon name="check" size={13} stroke={3} />
          </span>
        )}
      </div>
      <div style={{ fontFamily: font, fontSize: 13, fontWeight: active ? 700 : 550, color: active ? c.brandInk : c.ink, marginTop: 7 }}>{t.label}</div>
    </button>
  )
}

/**
 * Template and style. `carousel` on a phone (the chooser from every mobile CV
 * app: big preview, a strip of styles under it), `grid` in the desktop panel.
 */
export function DesignPanel({
  cv,
  profile,
  setProfile,
  version,
  updateVersion,
  layout,
}: {
  cv: CVData
  profile: CVData
  setProfile: (fn: (p: CVData) => CVData) => void
  version: RoleVersion
  updateVersion: (patch: Partial<RoleVersion>) => void
  layout: 'carousel' | 'grid'
}) {
  /* Twelve full CVs re-render on every keystroke otherwise. Deferring lets
     typing stay instant and the thumbnails catch up a beat later. */
  const lazy = useDeferredValue(cv)
  const ds = profile.docStyle
  const setDoc = (patch: Partial<CVData['docStyle']>) => setProfile((p) => ({ ...p, docStyle: { ...p.docStyle, ...patch } }))
  const density = (Object.keys(DENSITY) as (keyof typeof DENSITY)[]).find((k) => DENSITY[k].margin === ds.margin && DENSITY[k].sectionGap === ds.sectionGap)
  const current = TEMPLATES.find((t) => t.id === version.template) ?? TEMPLATES[0]
  const styled = STYLED.has(version.template)
  const customAccent = !ACCENTS.includes(ds.accent)
  const [fine, setFine] = useState(false)

  return (
    <div style={{ display: 'grid', gap: 22, minWidth: 0 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <Eyebrow>Template</Eyebrow>
          <span style={{ fontFamily: font, fontSize: 13, color: c.muted }}>
            {current.label} · {current.note}
          </span>
        </div>
        {layout === 'carousel' ? (
          <div
            className="studio-scroll-row"
            style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '6px 4px 10px', margin: '0 -4px', scrollbarWidth: 'none' }}
          >
            {TEMPLATES.map((tp) => (
              <Thumb key={tp.id} cv={lazy} t={tp} width={112} active={version.template === tp.id} onPick={() => updateVersion({ template: tp.id })} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            {TEMPLATES.map((tp) => (
              <GridThumb key={tp.id} cv={lazy} t={tp} active={version.template === tp.id} onPick={() => updateVersion({ template: tp.id })} />
            ))}
          </div>
        )}
      </div>

      {!styled && (
        <p style={{ margin: '-8px 0 0', padding: '10px 12px', borderRadius: radius.md, background: c.sunken, fontFamily: font, fontSize: 13, lineHeight: 1.5, color: c.body }}>
          {`${current.label} keeps its own colours and type, so colour, font and size below change the other templates. Photo and sections work everywhere.`}
        </p>
      )}

      <div style={{ display: 'grid', gap: 22, opacity: styled ? 1 : 0.55, transition: 'opacity .2s' }}>
        <div>
          <Eyebrow style={{ marginBottom: 12 }}>Colour</Eyebrow>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {ACCENTS.map((a) => (
              <button
                key={a}
                onClick={() => setDoc({ accent: a })}
                aria-label={`Colour ${a}`}
                aria-pressed={ds.accent === a}
                style={{ width: 34, height: 34, borderRadius: '50%', background: a, cursor: 'pointer', border: 'none', boxShadow: ds.accent === a ? `0 0 0 3px ${c.surface}, 0 0 0 5.5px ${a}` : 'inset 0 0 0 1px rgba(0,0,0,.08)', transition: 'box-shadow .15s' }}
              />
            ))}
            <label
              title="Pick any colour"
              style={{
                position: 'relative',
                width: 34,
                height: 34,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                cursor: 'pointer',
                background: customAccent ? ds.accent : 'conic-gradient(#ef4444, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #ef4444)',
                boxShadow: customAccent ? `0 0 0 3px ${c.surface}, 0 0 0 5.5px ${ds.accent}` : 'none',
              }}
            >
              {!customAccent && <Icon name="plus" size={16} stroke={2.6} />}
              <input
                type="color"
                aria-label="Pick any colour"
                value={/^#[0-9a-f]{6}$/i.test(ds.accent) ? ds.accent : '#2563eb'}
                onChange={(e) => setDoc({ accent: e.target.value })}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', border: 'none', padding: 0 }}
              />
            </label>
          </div>
        </div>

        <div>
          <Eyebrow style={{ marginBottom: 10 }}>Text colour</Eyebrow>
          <Segmented full value={INKS.find((i) => i.v === ds.ink)?.v ?? ''} options={INKS.map((i) => ({ v: i.v, l: i.l }))} onChange={(v) => setDoc({ ink: v })} />
        </div>

        <div>
          <Eyebrow style={{ marginBottom: 10 }}>Font</Eyebrow>
          <Segmented
            full
            value={ds.typeface}
            options={[
              { v: 'sans', l: 'Modern' },
              { v: 'serif', l: 'Classic' },
              { v: 'mono', l: 'Technical' },
            ]}
            onChange={(v) => setDoc({ typeface: v })}
          />
        </div>

        <div>
          <Eyebrow style={{ marginBottom: 10 }}>Headings</Eyebrow>
          <Segmented
            full
            value={ds.headingFont}
            options={[
              { v: 'match', l: 'Same font' },
              { v: 'sans', l: 'Modern' },
              { v: 'serif', l: 'Classic' },
            ]}
            onChange={(v) => setDoc({ headingFont: v })}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
            <Eyebrow>Spacing</Eyebrow>
            <span style={{ fontFamily: font, fontSize: 12.5, color: c.muted }}>Compact helps fit one page</span>
          </div>
          <Segmented
            full
            value={density ?? ''}
            options={[
              { v: 'compact', l: 'Compact' },
              { v: 'comfortable', l: 'Normal' },
              { v: 'spacious', l: 'Airy' },
            ]}
            onChange={(v) => setDoc(DENSITY[v])}
          />
          <button
            onClick={() => setFine((f) => !f)}
            aria-expanded={fine}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 12, fontFamily: font, fontSize: 13.5, fontWeight: 650, color: c.brandInk, background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer' }}
          >
            <Icon name="sliders" size={16} />
            {fine ? 'Hide fine-tuning' : 'Fine-tune size and spacing'}
          </button>
          {fine && (
            <div style={{ display: 'grid', gap: 14, marginTop: 10, padding: 14, borderRadius: radius.md, background: c.sunken }}>
              <Slider label="Text size" value={ds.scale} min={0.85} max={1.2} step={0.01} format={(v) => `${Math.round(v * 100)}%`} onChange={(v) => setDoc({ scale: v })} />
              <Slider label="Line spacing" value={ds.lineHeight} min={1.3} max={2} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => setDoc({ lineHeight: v })} />
              <Slider label="Page margins" value={ds.margin} min={24} max={72} step={2} format={(v) => `${v}px`} onChange={(v) => setDoc({ margin: v })} />
              <Slider label="Space between sections" value={ds.sectionGap} min={8} max={44} step={2} format={(v) => `${v}px`} onChange={(v) => setDoc({ sectionGap: v })} />
            </div>
          )}
        </div>
      </div>

      <div>
        <Eyebrow style={{ marginBottom: 10 }}>Photo</Eyebrow>
        <Segmented
          full
          value={ds.photoShape}
          options={[
            { v: 'circle', l: 'Round' },
            { v: 'rounded', l: 'Soft' },
            { v: 'square', l: 'Square' },
            { v: 'hidden', l: 'Hide' },
          ]}
          onChange={(v) => setDoc({ photoShape: v })}
        />
        <div style={{ marginTop: 12 }}>
          <Slider label="Photo size" value={ds.photoSize} min={60} max={140} step={2} format={(v) => `${v}px`} disabled={ds.photoShape === 'hidden'} onChange={(v) => setDoc({ photoSize: v })} />
        </div>
      </div>

      <div>
        <Eyebrow style={{ marginBottom: 6 }}>Sections on the CV</Eyebrow>
        <div style={{ display: 'grid' }}>
          {SECTION_TOGGLES.map(({ k, l }, i) => (
            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? `1px solid ${c.line}` : 'none', fontFamily: font, fontSize: 14.5, color: c.body, cursor: 'pointer' }}>
              <span style={{ flex: 1 }}>{l}</span>
              <Toggle on={profile.showSections[k]} onChange={(v) => setProfile((p) => ({ ...p, showSections: { ...p.showSections, [k]: v } }))} label={`Show ${l} on the CV`} />
            </label>
          ))}
        </div>
        <p style={{ margin: '4px 0 0', fontFamily: font, fontSize: 12.5, lineHeight: 1.5, color: c.muted }}>Turning a section off hides it in every version of this CV.</p>
      </div>

      <button
        onClick={() => setDoc({ ...DEFAULT_DOC_STYLE })}
        style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: font, fontSize: 13.5, color: c.muted, background: 'none', border: 'none', padding: '6px 0', cursor: 'pointer' }}
      >
        <Icon name="swap" size={15} /> Reset the design
      </button>
    </div>
  )
}

function GridThumb({ cv, t, active, onPick }: { cv: CVData; t: (typeof TEMPLATES)[number]; active: boolean; onPick: () => void }) {
  /* Fixed 94px render inside a fluid cell: measuring each cell would cost a
     ResizeObserver per thumbnail for a difference nobody can see. */
  return (
    <button
      onClick={onPick}
      aria-pressed={active}
      aria-label={`${t.label}: ${t.note}`}
      style={{ minWidth: 0, textAlign: 'center', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '1 / 1.414',
          borderRadius: 10,
          overflow: 'hidden',
          background: '#fff',
          border: `2px solid ${active ? c.brand : c.line}`,
          boxShadow: active ? `0 0 0 3px ${c.brand}26` : '0 1px 4px rgba(21,19,29,.06)',
        }}
      >
        <MiniCV cv={cv} template={t.id} width={94} />
        {active && (
          <span style={{ position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: '50%', background: c.brand, color: '#fff', display: 'grid', placeItems: 'center' }}>
            <Icon name="check" size={12} stroke={3} />
          </span>
        )}
      </div>
      <div style={{ fontFamily: font, fontSize: 12.5, fontWeight: active ? 700 : 550, color: active ? c.brandInk : c.body, marginTop: 6 }}>{t.label}</div>
    </button>
  )
}

/* ── Job match ────────────────────────────────────────────────────────── */

function Ring({ value }: { value: number }) {
  const r = 34
  const len = 2 * Math.PI * r
  const tone = value >= 70 ? c.good : value >= 40 ? '#d97706' : c.bad
  return (
    <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
      <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden>
        <circle cx="42" cy="42" r={r} fill="none" stroke="#ebe9f1" strokeWidth="8" />
        <circle cx="42" cy="42" r={r} fill="none" stroke={tone} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(value / 100) * len} ${len}`} transform="rotate(-90 42 42)" style={{ transition: 'stroke-dasharray .5s' }} />
      </svg>
      <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: font, fontSize: 20, fontWeight: 750, color: c.ink }}>{value}%</span>
    </div>
  )
}

/** Paste a job ad, see what it asks for, and spin off a version aimed at it. */
export function JobMatchPanel({ cv, onTailor }: { cv: CVData; onTailor: (role: string, keywords: string[]) => void }) {
  const [ad, setAd] = useState('')
  const [title, setTitle] = useState('')
  const enough = ad.trim().split(/\s+/).length >= 25
  const result = useMemo(() => (enough ? matchJob(cv, ad) : null), [cv, ad, enough])

  return (
    <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>
      <p style={{ margin: 0, fontFamily: font, fontSize: 14.5, lineHeight: 1.55, color: c.body }}>
        Paste a job advert. We show which of its keywords your CV already covers, counted honestly from your own words only.
      </p>
      <TextArea aria-label="Job advert" placeholder="Paste the job description here…" value={ad} rows={7} onChange={(e) => setAd(e.target.value)} />
      {ad.trim() && !result && <p style={{ margin: 0, fontFamily: font, fontSize: 13.5, color: c.muted }}>Paste a bit more of the advert to check it.</p>}

      {result && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 20, background: c.sunken }}>
            <Ring value={result.score} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: font, fontSize: 16, fontWeight: 700, color: c.ink }}>
                {result.score >= 70 ? 'Strong match' : result.score >= 40 ? 'Partial match' : 'Weak match'}
              </div>
              <div style={{ fontFamily: font, fontSize: 13.5, color: c.muted, marginTop: 3, lineHeight: 1.45 }}>
                {`${result.matched.length} of ${result.keywords.length} keywords from the advert are in this CV.`}
              </div>
            </div>
          </div>

          {result.missing.length > 0 && (
            <div>
              <div style={{ fontFamily: font, fontSize: 13.5, fontWeight: 650, color: c.ink, marginBottom: 8 }}>Missing: add the ones that are true</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {result.missing.map((k) => (
                  <span key={k} style={{ fontFamily: font, fontSize: 13, padding: '6px 11px', borderRadius: radius.pill, background: c.warnSoft, color: c.warn, border: '1px solid #fde68a' }}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
          {result.matched.length > 0 && (
            <div>
              <div style={{ fontFamily: font, fontSize: 13.5, fontWeight: 650, color: c.ink, marginBottom: 8 }}>Already in your CV</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {result.matched.map((k) => (
                  <span key={k} style={{ fontFamily: font, fontSize: 13, padding: '6px 11px', borderRadius: radius.pill, background: c.goodSoft, color: '#166534', border: '1px solid #bbf7d0' }}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gap: 10, paddingTop: 16, borderTop: `1px solid ${c.line}` }}>
            <TextField label="Job title in the advert" placeholder="e.g. Junior React Developer" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Button variant="primary" block icon="sparkle" disabled={!title.trim()} onClick={() => onTailor(title.trim(), result.keywords)}>
              Make a CV version for this job
            </Button>
          </div>
        </div>
      )}

      {!ad.trim() && (
        <div style={{ display: 'grid', gap: 8 }}>
          {['Paste the whole advert, not just the title', 'Add missing keywords only if they are true', 'Then make a version for that job in one tap'].map((tip, i) => (
            <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: font, fontSize: 13.5, color: c.body }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: c.brandSoft, color: c.brandInk, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
              {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

