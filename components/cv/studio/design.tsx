'use client'

import { memo, useDeferredValue, useMemo, useState } from 'react'
import type { CVData, CVTemplate } from '@/app/cv/page'
import { DEFAULT_DOC_STYLE } from '@/app/cv/page'
import { CVDocument } from '../CVPreview'
import { matchJob, type RoleVersion } from './model'
import { Button, Eyebrow, Icon, Segmented, TextArea, TextField, c, font, radius } from './ui'
import { useLang } from './i18n'

export const TEMPLATES: { id: CVTemplate; label: string; note: string }[] = [
  { id: 'profile-split', label: 'Profile', note: 'Clean, two columns' },
  { id: 'ats-compact', label: 'ATS Simple', note: 'Safest for job portals' },
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

const ACCENTS = ['#2563eb', '#5b47e0', '#0f766e', '#be123c', '#b45309', '#111827']

const DENSITY = {
  compact: { margin: 32, sectionGap: 16, lineHeight: 1.45, scale: 0.95 },
  comfortable: { margin: 44, sectionGap: 24, lineHeight: 1.65, scale: 1 },
  spacious: { margin: 54, sectionGap: 30, lineHeight: 1.8, scale: 1.05 },
} as const

/** Your actual CV, shrunk to `width` — not a hand-drawn miniature. */
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
  const { t: tr } = useLang()
  return (
    <button
      onClick={onPick}
      aria-pressed={active}
      aria-label={`${t.label} — ${tr(t.note)}`}
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
  const { t } = useLang()
  const lazy = useDeferredValue(cv)
  const ds = profile.docStyle
  const setDoc = (patch: Partial<CVData['docStyle']>) => setProfile((p) => ({ ...p, docStyle: { ...p.docStyle, ...patch } }))
  const density = (Object.keys(DENSITY) as (keyof typeof DENSITY)[]).find((k) => DENSITY[k].margin === ds.margin && DENSITY[k].sectionGap === ds.sectionGap)
  const current = TEMPLATES.find((t) => t.id === version.template) ?? TEMPLATES[0]

  return (
    <div style={{ display: 'grid', gap: 22, minWidth: 0 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
          <Eyebrow>{t('Template')}</Eyebrow>
          <span style={{ fontFamily: font, fontSize: 13, color: c.muted }}>
            {current.label} · {t(current.note)}
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

      <div>
        <Eyebrow style={{ marginBottom: 12 }}>{t('Colour')}</Eyebrow>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {ACCENTS.map((a) => (
            <button
              key={a}
              onClick={() => setDoc({ accent: a })}
              aria-label={t('Colour {c}', { c: a })}
              aria-pressed={ds.accent === a}
              style={{ width: 38, height: 38, borderRadius: '50%', background: a, cursor: 'pointer', border: 'none', boxShadow: ds.accent === a ? `0 0 0 3px ${c.surface}, 0 0 0 5.5px ${a}` : 'inset 0 0 0 1px rgba(0,0,0,.08)', transition: 'box-shadow .15s' }}
            />
          ))}
        </div>
      </div>

      <div>
        <Eyebrow style={{ marginBottom: 10 }}>{t('Font')}</Eyebrow>
        <Segmented
          full
          value={ds.typeface === 'serif' ? 'serif' : 'sans'}
          options={[
            { v: 'sans', l: t('Modern') },
            { v: 'serif', l: t('Classic') },
          ]}
          onChange={(v) => setDoc({ typeface: v, headingFont: 'match' })}
        />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
          <Eyebrow>{t('Spacing')}</Eyebrow>
          <span style={{ fontFamily: font, fontSize: 12.5, color: c.muted }}>{t('Compact helps fit one page')}</span>
        </div>
        <Segmented
          full
          value={density ?? ''}
          options={[
            { v: 'compact', l: t('Compact') },
            { v: 'comfortable', l: t('Normal') },
            { v: 'spacious', l: t('Airy') },
          ]}
          onChange={(v) => setDoc(DENSITY[v])}
        />
      </div>

      <div>
        <Eyebrow style={{ marginBottom: 10 }}>{t('Photo')}</Eyebrow>
        <Segmented
          full
          value={ds.photoShape === 'hidden' ? 'hidden' : ds.photoShape === 'circle' ? 'circle' : 'square'}
          options={[
            { v: 'circle', l: t('Round') },
            { v: 'square', l: t('Square') },
            { v: 'hidden', l: t('Hide') },
          ]}
          onChange={(v) => setDoc({ photoShape: v })}
        />
      </div>

      <button
        onClick={() => setDoc({ ...DEFAULT_DOC_STYLE })}
        style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: font, fontSize: 13.5, color: c.muted, background: 'none', border: 'none', padding: '6px 0', cursor: 'pointer' }}
      >
        <Icon name="swap" size={15} /> {t('Reset colour, font and spacing')}
      </button>
    </div>
  )
}

function GridThumb({ cv, t, active, onPick }: { cv: CVData; t: (typeof TEMPLATES)[number]; active: boolean; onPick: () => void }) {
  const { t: tr } = useLang()
  /* Fixed 94px render inside a fluid cell: measuring each cell would cost a
     ResizeObserver per thumbnail for a difference nobody can see. */
  return (
    <button
      onClick={onPick}
      aria-pressed={active}
      aria-label={`${t.label} — ${tr(t.note)}`}
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
  const { t } = useLang()
  const [ad, setAd] = useState('')
  const [title, setTitle] = useState('')
  const enough = ad.trim().split(/\s+/).length >= 25
  const result = useMemo(() => (enough ? matchJob(cv, ad) : null), [cv, ad, enough])

  return (
    <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>
      <p style={{ margin: 0, fontFamily: font, fontSize: 14.5, lineHeight: 1.55, color: c.body }}>
        {t('Paste a job advert. We show which of its keywords your CV already covers — counted honestly, from your own words only.')}
      </p>
      <TextArea aria-label={t('Job advert')} placeholder={t('Paste the job description here…')} value={ad} rows={7} onChange={(e) => setAd(e.target.value)} />
      {ad.trim() && !result && <p style={{ margin: 0, fontFamily: font, fontSize: 13.5, color: c.muted }}>{t('Paste a bit more of the advert to check it.')}</p>}

      {result && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 20, background: c.sunken }}>
            <Ring value={result.score} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: font, fontSize: 16, fontWeight: 700, color: c.ink }}>
                {result.score >= 70 ? t('Strong match') : result.score >= 40 ? t('Partial match') : t('Weak match')}
              </div>
              <div style={{ fontFamily: font, fontSize: 13.5, color: c.muted, marginTop: 3, lineHeight: 1.45 }}>
                {t('{m} of {k} keywords from the advert are in this CV.', { m: result.matched.length, k: result.keywords.length })}
              </div>
            </div>
          </div>

          {result.missing.length > 0 && (
            <div>
              <div style={{ fontFamily: font, fontSize: 13.5, fontWeight: 650, color: c.ink, marginBottom: 8 }}>{t('Missing — add the ones that are true')}</div>
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
              <div style={{ fontFamily: font, fontSize: 13.5, fontWeight: 650, color: c.ink, marginBottom: 8 }}>{t('Already in your CV')}</div>
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
            <TextField label={t('Job title in the advert')} placeholder="e.g. Junior React Developer" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Button variant="primary" block icon="sparkle" disabled={!title.trim()} onClick={() => onTailor(title.trim(), result.keywords)}>
              {t('Make a CV version for this job')}
            </Button>
          </div>
        </div>
      )}

      {!ad.trim() && (
        <div style={{ display: 'grid', gap: 8 }}>
          {[t('Paste the whole advert, not just the title'), t('Add missing keywords only if they are true'), t('Then make a version for that job in one tap')].map((tip, i) => (
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

