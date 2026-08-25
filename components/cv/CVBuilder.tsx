'use client'

import type { CSSProperties, Dispatch, FocusEvent, ReactNode, SetStateAction } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CVData, CVTemplate } from '@/app/cv/page'
import { useIsMobile } from '@/hooks/useIsMobile'
import { buildTasks, nextTask, progressOf, type Task } from './NextSteps'

type Skill = {
  name: string
  level: number
  category: string
  color: string
  included: boolean
}

type Props = {
  cvData: CVData
  setCVData: Dispatch<SetStateAction<CVData>>
  selectedTemplate: CVTemplate
  setSelectedTemplate: (t: CVTemplate) => void
  saveState: 'saving' | 'saved'
  savedAt: string
  onReset: () => void
  onLoadSample: () => void
  /** The pane is narrow: stack the rail above the fields. */
  compact?: boolean
}

type BuilderStepId =
  | 'personal'
  | 'contact'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'summary'

export const templates: { id: CVTemplate; label: string; desc: string }[] = [
  { id: 'profile-split', label: 'Profile Split', desc: 'White, photo header, two columns' },
  { id: 'swiss-grid', label: 'Swiss Grid', desc: 'Typographic, label gutter, rules' },
  { id: 'ats-compact', label: 'ATS Compact', desc: 'One column, dense, parser-safe' },
  { id: 'accent-rule', label: 'Accent Rule', desc: 'White with one colour spine' },
  { id: 'dark-pro', label: 'Dark Pro', desc: 'Dark sidebar, skill bars' },
  { id: 'clean-minimal', label: 'Clean Minimal', desc: 'White, two-column elegant' },
  { id: 'tech-blue', label: 'Tech Blue', desc: 'Code editor aesthetic' },
  { id: 'executive', label: 'Executive', desc: 'Dark header, single column' },
  { id: 'sidebar-light', label: 'Sidebar Light', desc: 'Blue sidebar, photo header' },
  { id: 'timeline', label: 'Timeline', desc: 'Minimal with timeline dots' },
  { id: 'bold-header', label: 'Bold Header', desc: 'Dark banner, photo overlap' },
  { id: 'creative-panel', label: 'Creative Panel', desc: 'Dark left, white right' },
]

const AUTO_COLORS = [
  '#2563eb',
  '#0ea5e9',
  '#14b8a6',
  '#f97316',
  '#8b5cf6',
  '#c0392b',
  '#22c55e',
  '#ec4899',
]

export const SECTION_PRESETS = [
  { title: 'Certifications', content: 'AWS Certified Developer\nGoogle Analytics Certification' },
  { title: 'Achievements', content: 'Built and shipped high-impact product features\nImproved performance and delivery speed' },
  { title: 'Languages', content: 'Bangla - Native\nEnglish - Professional working proficiency' },
  { title: 'Volunteer', content: 'Community mentoring\nEvent coordination' },
  { title: 'References', content: 'Available on request' },
]

const steps: {
  id: BuilderStepId
  number: number
  title: string
  shortTitle: string
  description: string
}[] = [
  {
    id: 'personal',
    number: 1,
    title: 'Personal details',
    shortTitle: 'Personal',
    description: 'Add your name, desired role, and a photo to shape the first impression.',
  },
  {
    id: 'contact',
    number: 2,
    title: 'Contact info',
    shortTitle: 'Contact',
    description: 'Include the contact links recruiters will use to reach you quickly.',
  },
  {
    id: 'experience',
    number: 3,
    title: 'Work experience',
    shortTitle: 'Experience',
    description: 'List your strongest roles with clear outcomes and recent impact.',
  },
  {
    id: 'projects',
    number: 4,
    title: 'Projects',
    shortTitle: 'Projects',
    description: 'Show projects that prove your skills with real examples and stack details.',
  },
  {
    id: 'skills',
    number: 5,
    title: 'Skills',
    shortTitle: 'Skills',
    description: 'Pick the tools you want highlighted and adjust their strength.',
  },
  {
    id: 'education',
    number: 6,
    title: 'Education',
    shortTitle: 'Education',
    description: 'Add academic or bootcamp history that supports your target role.',
  },
  {
    id: 'summary',
    number: 7,
    title: 'Professional summary',
    shortTitle: 'Summary',
    description: 'Wrap your profile into a short recruiter-friendly pitch.',
  },
]

/*
 * Editor design system — a light workspace, deliberately separate from the
 * portfolio's warm paper palette.
 *
 * The builder is a tool, not a page: it wants neutral cool greys so the
 * document being edited is the only warm thing on screen, and a single blue
 * for anything actionable. Radii are tighter than the old dark build (10/14
 * rather than 18/28) so dense forms do not read as a pile of lozenges.
 */
export const canvas = '#f4f6fa'
export const surface = '#ffffff'
export const surfaceMuted = '#f7f9fc'
export const border = '#e4e8f0'
export const borderStrong = '#d3dae6'
export const text = '#0f172a'
export const textMuted = '#64748b'
export const brand = '#2563eb'
export const brandSoft = '#eff4ff'
export const positive = '#16a34a'
export const danger = '#dc2626'
export const shadow = '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)'

export const inputStyle: CSSProperties = {
  width: '100%',
  background: surface,
  border: `1px solid ${borderStrong}`,
  borderRadius: 10,
  padding: '11px 14px',
  /* The dark build set this to a near-white; once the field background went
     light, typed text was white on white and effectively invisible. */
  color: text,
  fontFamily: 'var(--font-dm-sans)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

export const sectionLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: text,
  marginBottom: 7,
  fontFamily: 'var(--font-dm-sans)',
}

export const helperStyle: CSSProperties = {
  fontSize: 12,
  color: textMuted,
  lineHeight: 1.6,
  fontFamily: 'var(--font-dm-sans)',
}

export const buttonBase: CSSProperties = {
  border: 'none',
  borderRadius: 10,
  fontFamily: 'var(--font-dm-sans)',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

const MINI_W = 120
const MINI_H = 170
const SCALE = MINI_W / 794

function withIncluded(skill: CVData['skills'][number] | Skill): Skill {
  return {
    ...skill,
    included: !('included' in skill) || skill.included !== false,
  }
}

function areSkillsEqual(a: Skill[], b: Skill[]) {
  if (a.length !== b.length) return false

  return a.every((skill, index) => {
    const other = b[index]
    if (!other) return false

    return (
      skill.name === other.name &&
      skill.level === other.level &&
      skill.category === other.category &&
      skill.color === other.color &&
      skill.included === other.included
    )
  })
}

export function focusStyle(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = brand
  e.target.style.boxShadow = `0 0 0 3px ${brand}1f`
}

export function blurStyle(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = borderStrong
  e.target.style.boxShadow = 'none'
}

export function MiniPreview({ template, cvData }: { template: string; cvData: CVData }) {
  return (
    <div
      style={{
        width: MINI_W,
        height: MINI_H,
        overflow: 'hidden',
        borderRadius: 14,
        position: 'relative',
        flexShrink: 0,
        border: '1px solid rgba(15,23,42,0.08)',
        background: '#fff',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: 794,
          height: 794 * 1.414,
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <MiniCVLayout template={template} cvData={cvData} />
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }} />
    </div>
  )
}

function MiniCVLayout({ template, cvData }: { template: string; cvData: CVData }) {
  const name = cvData?.personal?.name || 'Your Name'
  const role = cvData?.personal?.role || 'Your Role'
  const skills = (cvData?.skills || []).filter((s) => !('included' in s) || s.included !== false).slice(0, 5)
  const experience = cvData?.experience?.slice(0, 2) || []
  const initial = name.charAt(0)

  /* Plain-paper set. These share one skeleton — the differences that matter at
     120px wide are the header shape and where the rules sit. */
  const paper = (opts: {
    spine?: string
    accent: string
    header: 'split' | 'stack' | 'plain'
  }) => (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'sans-serif', background: '#fff' }}>
      {opts.spine && <div style={{ width: 26, background: opts.spine, flexShrink: 0 }} />}
      <div style={{ flex: 1, padding: 44, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 30 }}>
          {opts.header === 'split' && (
            <div style={{ width: 74, height: 74, borderRadius: '50%', background: '#e5e7eb', flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: opts.header === 'plain' ? 30 : 34, fontWeight: 800, color: '#111', lineHeight: 1.05 }}>{name}</div>
            <div style={{ fontSize: 15, color: '#6b7280', marginTop: 6 }}>{role}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: opts.header === 'plain' ? '1fr' : '1fr 1.6fr', gap: 26 }}>
          {opts.header !== 'plain' && (
            <div>
              <div style={{ width: 40, height: 4, background: opts.accent, marginBottom: 10 }} />
              {[70, 55, 62, 48].map((w, i) => (
                <div key={i} style={{ height: 8, width: `${w}%`, background: '#e5e7eb', borderRadius: 2, marginBottom: 8 }} />
              ))}
            </div>
          )}
          <div>
            {[0, 1, 2].map((b) => (
              <div key={b} style={{ marginBottom: 20 }}>
                <div style={{ width: 40, height: 4, background: opts.accent, marginBottom: 10 }} />
                {[96, 88, 72].map((w, i) => (
                  <div key={i} style={{ height: 8, width: `${w}%`, background: '#eceff3', borderRadius: 2, marginBottom: 7 }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (template === 'profile-split') return paper({ accent: '#2563eb', header: 'split' })
  if (template === 'swiss-grid') return paper({ accent: '#111111', header: 'stack' })
  if (template === 'ats-compact') return paper({ accent: '#9ca3af', header: 'plain' })
  if (template === 'accent-rule') return paper({ accent: '#0f766e', header: 'split', spine: '#0f766e' })

  if (template === 'dark-pro') return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ width: 240, background: '#14161f', padding: '32px 20px', flexShrink: 0 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e2701f', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff' }}>{initial}</div>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>{name}</div>
        <div style={{ color: '#e2701f', fontSize: 11, textAlign: 'center', marginBottom: 24 }}>{role}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', marginBottom: 10 }}>SKILLS</div>
        {skills.map((s, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: 10, marginBottom: 3 }}>
              <span>{s.name}</span><span>{s.level}%</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.14)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${s.level}%`, background: s.color || '#e2701f', borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '32px 28px', background: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#e2701f', letterSpacing: '0.1em', marginBottom: 6 }}>EXPERIENCE</div>
        <div style={{ height: 1, background: '#e2701f', marginBottom: 14 }} />
        {experience.map((e, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{e.role}</div>
              <div style={{ fontSize: 10, color: '#999' }}>{e.date}</div>
            </div>
            <div style={{ fontSize: 11, color: '#e2701f', marginBottom: 4 }}>{e.company}</div>
            <div style={{ fontSize: 10, color: '#555', lineHeight: 1.5 }}>{e.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )

  if (template === 'clean-minimal') return (
    <div style={{ padding: 48, background: '#fff', fontFamily: 'Georgia, serif', height: '100%' }}>
      <div style={{ borderBottom: '2px solid #111', paddingBottom: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 42, fontWeight: 700, color: '#111', letterSpacing: -1 }}>{name}</div>
        <div style={{ fontSize: 16, color: '#555', marginTop: 6 }}>{role}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#111', marginBottom: 12 }}>EXPERIENCE</div>
          {experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{e.role}</div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{e.company} · {e.date}</div>
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5 }}>{e.desc}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#111', marginBottom: 12 }}>SKILLS</div>
          {skills.map((s, i) => (
            <div key={i} style={{ fontSize: 12, color: '#333', padding: '5px 0', borderBottom: '1px solid #eee' }}>{s.name}</div>
          ))}
        </div>
      </div>
    </div>
  )

  if (template === 'tech-blue') return (
    <div style={{ padding: 40, background: '#ffffff', fontFamily: 'monospace', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
      </div>
      <div style={{ color: '#8b949e', fontSize: 13, marginBottom: 4 }}>$ cat profile.json</div>
      <div style={{ color: '#79c0ff', fontSize: 40, fontWeight: 900, marginBottom: 4 }}>{name}</div>
      <div style={{ color: '#a5d6a7', fontSize: 14, marginBottom: 28 }}>"{role}"</div>
      {experience.map((e, i) => (
        <div key={i} style={{ marginBottom: 14, borderLeft: '2px solid #388bfd', paddingLeft: 14 }}>
          <div style={{ color: '#8b949e', fontSize: 10 }}>{e.date}</div>
          <div style={{ color: '#e6edf3', fontSize: 13, fontWeight: 700 }}>{e.role}</div>
          <div style={{ color: '#79c0ff', fontSize: 11 }}>{e.company}</div>
        </div>
      ))}
      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {skills.map((s, i) => (
          <span key={i} style={{ background: 'rgba(121,192,255,0.1)', border: '1px solid rgba(121,192,255,0.3)', color: '#79c0ff', fontSize: 10, padding: '3px 10px', borderRadius: 4 }}>{s.name}</span>
        ))}
      </div>
    </div>
  )

  if (template === 'executive') return (
    <div style={{ background: '#fff', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ background: 'linear-gradient(135deg,#eceae4,#16213e)', padding: '40px 48px' }}>
        <div style={{ fontSize: 44, fontWeight: 300, color: '#fff', letterSpacing: 4, textTransform: 'uppercase' }}>{name}</div>
        <div style={{ color: '#e2701f', fontSize: 14, letterSpacing: 2, marginTop: 8, textTransform: 'uppercase' }}>{role}</div>
      </div>
      <div style={{ padding: '40px 48px' }}>
        {experience.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 24, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #eee' }}>
            <div style={{ width: 100, fontSize: 11, color: '#999', flexShrink: 0 }}>{e.date}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{e.role}</div>
              <div style={{ fontSize: 12, color: '#e2701f', marginBottom: 6 }}>{e.company}</div>
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5 }}>{e.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (template === 'sidebar-light') return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ width: 230, background: '#dce8f0', padding: '140px 20px 32px', flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Skills</div>
        {skills.map((s, i) => (
          <div key={i} style={{ fontSize: 11, color: '#444', marginBottom: 4 }}>• {s.name}</div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#b0cfe0', padding: '28px 32px', minHeight: 100 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#1a2e3a', textTransform: 'uppercase' }}>{name}</div>
          <div style={{ fontSize: 13, color: '#3a6070', marginTop: 6 }}>{role}</div>
        </div>
        <div style={{ padding: '20px 28px' }}>
          {experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{e.role}</div>
              <div style={{ fontSize: 11, color: '#5a8090' }}>{e.company} · {e.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (template === 'timeline') return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#fff', padding: '36px 0', height: '100%' }}>
      <div style={{ padding: '0 32px 24px', borderBottom: '2px solid #1a1a1a', marginBottom: 24 }}>
        <div style={{ fontSize: 30, fontWeight: 900, fontFamily: 'sans-serif' }}>{name}</div>
        <div style={{ fontSize: 13, color: '#666', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{role}</div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: 200, padding: '0 24px 0 32px', borderRight: '1px solid #e0e0e0' }}>
          {skills.map((s, i) => (
            <div key={i} style={{ fontSize: 11, color: '#444', marginBottom: 6 }}>• {s.name}</div>
          ))}
        </div>
        <div style={{ flex: 1, padding: '0 24px', borderLeft: '1.5px solid #d0d0d0', marginLeft: 12 }}>
          {experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 16, paddingLeft: 16, position: 'relative' }}>
              <div style={{ position: 'absolute', left: -20, top: 4, width: 8, height: 8, borderRadius: '50%', border: '2px solid #1a1a1a', background: '#fff' }} />
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'sans-serif' }}>{e.company}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{e.role} · {e.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (template === 'bold-header') return (
    <div style={{ fontFamily: 'sans-serif', background: '#fff', height: '100%' }}>
      <div style={{ background: '#1c2b3a', padding: '32px 40px', minHeight: 110 }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>{name}</div>
        <div style={{ fontSize: 13, color: '#7eb8d4', marginTop: 6 }}>{role}</div>
      </div>
      <div style={{ height: 4, background: 'linear-gradient(90deg,#2980b9,#6dd5fa)' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 0 }}>
        <div style={{ padding: '20px 16px', borderRight: '1px solid #eee' }}>
          {skills.map((s, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>{s.name}</span><span style={{ color: '#999' }}>{s.level}%</span>
              </div>
              <div style={{ height: 4, background: '#e8e8e8', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${s.level}%`, background: 'linear-gradient(90deg,#2980b9,#6dd5fa)', borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '20px 20px' }}>
          {experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 14, paddingLeft: 10, borderLeft: '3px solid #e8f4fb' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{e.role}</div>
              <div style={{ fontSize: 11, color: '#2980b9' }}>{e.company} · {e.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  /* Fallback so an unrecognised id never renders an empty tile. */
  if (template !== 'creative-panel') return paper({ accent: '#2563eb', header: 'split' })

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ width: 250, background: '#1a1f2e', color: '#e0e6f0', padding: '40px 24px', flexShrink: 0 }}>
        <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#2a3248', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#4a90d9', border: '3px solid #4a90d9' }}>{initial}</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: 4 }}>{name}</div>
        <div style={{ fontSize: 11, color: '#4a90d9', textAlign: 'center', marginBottom: 20 }}>{role}</div>
        {skills.map((s, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#c0cce0', marginBottom: 3 }}>
              <span>{s.name}</span><span>{s.level}%</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.14)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${s.level}%`, background: '#4a90d9', borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '40px 28px', background: '#fff' }}>
        {experience.map((e, i) => (
          <div key={i} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: i < experience.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{e.role}</div>
              <span style={{ fontSize: 10, color: '#fff', background: '#1a1f2e', padding: '3px 10px', borderRadius: 20 }}>{e.date}</span>
            </div>
            <div style={{ fontSize: 11, color: '#4a90d9', fontWeight: 600, marginTop: 3 }}>{e.company}</div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ padding: 40, background: '#fff', height: '100%' }}>
      <div style={{ fontSize: 32, fontWeight: 700 }}>{name}</div>
      <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>{role}</div>
    </div>
  )
}

/** Numbered dot that becomes a tick once the step is behind you. */
function ExperienceCard({
  item,
  index,
  onChange,
  onRemove,
  isMobile,
}: {
  item: CVData['experience'][number]
  index: number
  onChange: (value: CVData['experience'][number]) => void
  onRemove: () => void
  isMobile: boolean
}) {
  return (
    <div style={{ padding: 18, border: `1px solid ${border}`, borderRadius: 22, background: surfaceMuted }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: text, fontFamily: 'var(--font-dm-sans)' }}>Role {index + 1}</div>
        <button onClick={onRemove} style={{ background: 'transparent', border: 'none', color: '#d14343', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Remove
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <input type="text" value={item.role} onChange={(e) => onChange({ ...item, role: e.target.value })} placeholder="Job title" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        <input type="text" value={item.company} onChange={(e) => onChange({ ...item, company: e.target.value })} placeholder="Company name" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
      </div>
      <div style={{ marginBottom: 12 }}>
        <input type="text" value={item.date} onChange={(e) => onChange({ ...item, date: e.target.value })} placeholder="Jan 2024 - Present" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
      </div>
      <textarea
        value={item.desc}
        onChange={(e) => onChange({ ...item, desc: e.target.value })}
        placeholder={'Write one bullet per line\nBuilt reusable UI in Next.js\nImproved load speed by 35%\nCollaborated with design and product'}
        rows={4}
        style={{ ...inputStyle, resize: 'vertical' }}
        onFocus={focusStyle}
        onBlur={blurStyle}
      />
    </div>
  )
}

function EducationCard({
  item,
  index,
  onChange,
  onRemove,
  isMobile,
}: {
  item: CVData['education'][number]
  index: number
  onChange: (value: CVData['education'][number]) => void
  onRemove: () => void
  isMobile: boolean
}) {
  return (
    <div style={{ padding: 18, border: `1px solid ${border}`, borderRadius: 22, background: surfaceMuted }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: text, fontFamily: 'var(--font-dm-sans)' }}>Education {index + 1}</div>
        <button onClick={onRemove} style={{ background: 'transparent', border: 'none', color: '#d14343', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Remove
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <input type="text" value={item.degree} onChange={(e) => onChange({ ...item, degree: e.target.value })} placeholder="Degree or course" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        <input type="text" value={item.school} onChange={(e) => onChange({ ...item, school: e.target.value })} placeholder="School or institute" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
      </div>
      <input type="text" value={item.date} onChange={(e) => onChange({ ...item, date: e.target.value })} placeholder="2022 - 2024" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
    </div>
  )
}

function ProjectCard({
  item,
  index,
  onChange,
  onRemove,
}: {
  item: CVData['projects'][number]
  index: number
  onChange: (value: CVData['projects'][number]) => void
  onRemove: () => void
}) {
  return (
    <div style={{ padding: 18, border: `1px solid ${border}`, borderRadius: 22, background: surfaceMuted }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: text, fontFamily: 'var(--font-dm-sans)' }}>Project {index + 1}</div>
        <button onClick={onRemove} style={{ background: 'transparent', border: 'none', color: '#d14343', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Remove
        </button>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        <input type="text" value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value })} placeholder="Project name" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        <input type="text" value={item.shortDesc} onChange={(e) => onChange({ ...item, shortDesc: e.target.value })} placeholder="Short description" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        <input type="text" value={item.category} onChange={(e) => onChange({ ...item, category: e.target.value })} placeholder="Category" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        <input
          type="text"
          value={item.tech.join(', ')}
          onChange={(e) => onChange({ ...item, tech: e.target.value.split(',').map((part) => part.trim()).filter(Boolean) })}
          placeholder="React, Next.js, Node.js"
          style={inputStyle}
          onFocus={focusStyle}
          onBlur={blurStyle}
        />
      </div>
    </div>
  )
}

export default function CVBuilder({ cvData, setCVData, selectedTemplate, setSelectedTemplate, saveState, savedAt, onReset, onLoadSample, compact = false }: Props) {
  const viewportIsMobile = useIsMobile()
  const isMobile = viewportIsMobile || compact
  const fileInputRef = useRef<HTMLInputElement>(null)
  const newSkillInputRef = useRef<HTMLInputElement>(null)
  const dragIndexRef = useRef<number | null>(null)
  const dragOverIndexRef = useRef<number | null>(null)

  const [skills, setSkills] = useState<Skill[]>(() => cvData.skills.map(withIncluded))
  const [activeSkill, setActiveSkill] = useState<string | null>(null)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState(70)
  const [leftMode, setLeftMode] = useState<'create' | 'templates'>('create')
  /* Accordion, not a wizard: several sections can be open at once, and the
     document stays visible the whole time. */
  const [openSections, setOpenSections] = useState<BuilderStepId[]>(['personal'])
  const toggleOpen = (id: BuilderStepId) =>
    setOpenSections((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  useEffect(() => {
    const nextSkills = cvData.skills.map(withIncluded)
    setSkills((prev) => areSkillsEqual(prev, nextSkills) ? prev : nextSkills)
  }, [cvData.skills])

  useEffect(() => {
    const selectedSkills = skills.filter((s) => s.included).map((s) => s.name)

    setCVData((prev) => {
      const previousSkills = prev.skills.map(withIncluded)
      const sameSkills = areSkillsEqual(previousSkills, skills)
      const sameSelectedSkills =
        prev.selectedSkills.length === selectedSkills.length &&
        prev.selectedSkills.every((skill, index) => skill === selectedSkills[index])

      if (sameSkills && sameSelectedSkills) return prev

      return {
        ...prev,
        skills,
        selectedSkills,
      }
    })
  }, [setCVData, skills])

  const memoizedCvData = useMemo(() => ({
    ...cvData,
    skills,
  }), [cvData, skills])

  /* Progress, the hint and the checklist all read one model, so they cannot
     disagree. The first version measured which wizard step was open and
     reported 14% on a finished CV. */
  const tasks = useMemo(() => buildTasks(cvData), [cvData])
  const progress = progressOf(tasks)
  const next = nextTask(tasks)

  const updatePersonal = (field: keyof CVData['personal'], value: string) =>
    setCVData((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } }))

  const updateExperience = (index: number, value: CVData['experience'][number]) =>
    setCVData((prev) => ({
      ...prev,
      experience: prev.experience.map((item, itemIndex) => itemIndex === index ? value : item),
    }))

  const updateEducation = (index: number, value: CVData['education'][number]) =>
    setCVData((prev) => ({
      ...prev,
      education: prev.education.map((item, itemIndex) => itemIndex === index ? value : item),
    }))

  const updateProject = (index: number, value: CVData['projects'][number]) =>
    setCVData((prev) => ({
      ...prev,
      projects: prev.projects.map((item, itemIndex) => itemIndex === index ? value : item),
    }))

  const addExperience = () =>
    setCVData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { role: '', company: '', date: '', desc: '', current: false },
      ],
    }))

  const addEducation = () =>
    setCVData((prev) => ({
      ...prev,
      education: [...prev.education, { degree: '', school: '', date: '' }],
    }))

  const addProject = () =>
    setCVData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          id: `project-${Date.now()}`,
          name: '',
          shortDesc: '',
          fullDesc: '',
          tech: [],
          github: '',
          live: '',
          featured: true,
          category: 'Project',
          color: AUTO_COLORS[prev.projects.length % AUTO_COLORS.length],
        },
      ],
    }))

  const removeExperience = (index: number) =>
    setCVData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, itemIndex) => itemIndex !== index),
    }))

  const removeEducation = (index: number) =>
    setCVData((prev) => ({
      ...prev,
      education: prev.education.filter((_, itemIndex) => itemIndex !== index),
    }))

  const removeProject = (index: number) =>
    setCVData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, itemIndex) => itemIndex !== index),
    }))

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCVData((prev) => ({ ...prev, photo: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const toggleSection = (key: keyof CVData['showSections']) =>
    setCVData((prev) => ({ ...prev, showSections: { ...prev.showSections, [key]: !prev.showSections[key] } }))

  const moveSectionOrder = (id: string, direction: -1 | 1) =>
    setCVData((prev) => {
      const index = prev.sectionOrder.indexOf(id)
      const target = index + direction
      if (index === -1 || target < 0 || target >= prev.sectionOrder.length) return prev
      const sectionOrder = [...prev.sectionOrder]
      const [moved] = sectionOrder.splice(index, 1)
      sectionOrder.splice(target, 0, moved)
      return { ...prev, sectionOrder }
    })

  const addCustomSection = (preset?: { title: string; content: string }) =>
    setCVData((prev) => {
      const id = `custom-${Date.now()}-${prev.customSections.length}`
      return {
        ...prev,
        customSections: [
          ...prev.customSections,
          {
            id,
            title: preset?.title || '',
            content: preset?.content || '',
          },
        ],
        sectionOrder: [...prev.sectionOrder, id],
      }
    })

  const removeCustomSection = (sectionId: string) =>
    setCVData((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((item) => item.id !== sectionId),
      sectionOrder: prev.sectionOrder.filter((item) => item !== sectionId),
    }))

  const handleAddSkill = () => {
    const name = newSkillName.trim()
    if (!name) return
    if (skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase())) {
      newSkillInputRef.current?.focus()
      return
    }
    const color = AUTO_COLORS[skills.length % AUTO_COLORS.length]
    setSkills((prev) => [
      ...prev,
      {
        name,
        level: Math.min(99, Math.max(10, newSkillLevel)),
        category: 'Custom',
        color,
        included: true,
      },
    ])
    setNewSkillName('')
    setNewSkillLevel(70)
    newSkillInputRef.current?.focus()
  }




  return (
    <div
      style={{
        minHeight: '100%',
        padding: isMobile ? '14px 12px 24px' : '16px 20px 32px',
        background: canvas,
        fontFamily: 'var(--font-dm-sans)',
      }}
    >
      {/* Toolbar: state on the left, actions on the right, one line on desktop */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: 14,
          padding: isMobile ? 12 : '12px 16px',
          marginBottom: isMobile ? 14 : 16,
          boxShadow: shadow,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: text, lineHeight: 1.2 }}>Build your CV</div>
          <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>{next ? next.label : 'Ready to download'}</div>
        </div>

        {/* Save state */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            color: saveState === 'saving' ? '#b45309' : positive,
            background: saveState === 'saving' ? '#fffbeb' : '#f0fdf4',
            border: `1px solid ${saveState === 'saving' ? '#fde68a' : '#bbf7d0'}`,
            borderRadius: 999,
            padding: '5px 11px',
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: saveState === 'saving' ? '#d97706' : positive,
              flexShrink: 0,
            }}
          />
          {saveState === 'saving' ? 'Saving…' : savedAt}
        </div>

        {/* Progress — the number and the bar, not a card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginLeft: isMobile ? 0 : 'auto',
            flex: isMobile ? '1 1 100%' : '0 1 240px',
            minWidth: 150,
          }}
        >
          <div style={{ flex: 1, height: 6, borderRadius: 999, background: surfaceMuted, overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: 999,
                background: brand,
                transition: 'width 0.3s',
              }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: text, minWidth: 34, textAlign: 'right' }}>{progress}%</span>
        </div>

        <button
          onClick={onLoadSample}
          style={{
            ...buttonBase,
            padding: '9px 14px',
            background: surface,
            color: text,
            border: `1px solid ${border}`,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = surfaceMuted)}
          onMouseLeave={(e) => (e.currentTarget.style.background = surface)}
        >
          Load example
        </button>

        <button
          onClick={onReset}
          style={{
            ...buttonBase,
            padding: '9px 14px',
            background: surface,
            color: danger,
            border: `1px solid ${border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fef2f2'
            e.currentTarget.style.borderColor = '#fecaca'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = surface
            e.currentTarget.style.borderColor = border
          }}
        >
          Reset
        </button>
      </div>

      <ModeToggle mode={leftMode} setMode={setLeftMode} />

      {leftMode === 'create' && (
        <Checklist
          tasks={tasks}
          onGo={(section) => {
            setOpenSections((prev) => (prev.includes(section) ? prev : [...prev, section]))
            requestAnimationFrame(() => {
              document.getElementById(`cv-section-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            })
          }}
        />
      )}

      {leftMode === 'templates' ? (
        <TemplateList cvData={memoizedCvData} selected={selectedTemplate} onSelect={setSelectedTemplate} />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {steps.map((step) => (
            <Accordion
              key={step.id}
              id={`cv-section-${step.id}`}
              title={step.title}
              description={step.description}
              open={openSections.includes(step.id)}
              onToggle={() => toggleOpen(step.id)}
            >
            {step.id === 'personal' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <div style={sectionLabelStyle}>First name</div>
                    <input
                      type="text"
                      value={cvData.personal.name.split(' ').slice(0, -1).join(' ') || cvData.personal.name}
                      onChange={(e) => {
                        const lastName = cvData.personal.name.split(' ').slice(-1).join(' ')
                        updatePersonal('name', `${e.target.value}${lastName ? ` ${lastName}` : ''}`.trim())
                      }}
                      placeholder="Md. Abdulla"
                      style={inputStyle}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </div>
                  <div>
                    <div style={sectionLabelStyle}>Last name</div>
                    <input
                      type="text"
                      value={cvData.personal.name.split(' ').slice(-1).join(' ')}
                      onChange={(e) => {
                        const first = cvData.personal.name.split(' ').slice(0, -1).join(' ')
                        updatePersonal('name', `${first} ${e.target.value}`.trim())
                      }}
                      placeholder="Mahmud"
                      style={inputStyle}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <div style={sectionLabelStyle}>Desired job title</div>
                  <input
                    type="text"
                    value={cvData.personal.role}
                    onChange={(e) => updatePersonal('role', e.target.value)}
                    placeholder="Full-Stack Developer"
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 16, padding: 16, borderRadius: 12, background: surfaceMuted, border: `1px solid ${border}` }}>
                  {cvData.photo ? (
                    <img src={cvData.photo} alt="CV photo" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: `1px solid ${borderStrong}` }} />
                  ) : (
                    <div style={{ width: 72, height: 72, borderRadius: 12, background: surface, border: `1px solid ${borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted, fontSize: 30 }}>
                      +
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={sectionLabelStyle}>Photo</div>
                    <div style={{ ...helperStyle, marginBottom: 10 }}>A clean headshot helps your CV feel more complete, but it is optional.</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {/* Was pale blue text on a pale blue fill — the label
                          simply was not there once the panel went light. */}
                      <button onClick={() => fileInputRef.current?.click()} style={{ ...buttonBase, background: brand, color: '#fff', padding: '9px 16px' }}>
                        {cvData.photo ? 'Change photo' : 'Add photo'}
                      </button>
                      {cvData.photo && (
                        <button onClick={() => setCVData((prev) => ({ ...prev, photo: '' }))} style={{ ...buttonBase, background: '#ffffff', color: textMuted, border: `1px solid ${border}`, padding: '12px 18px' }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </>
            )}

            {step.id === 'contact' && (
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <div style={sectionLabelStyle}>Email</div>
                  <input type="text" value={cvData.personal.email} onChange={(e) => updatePersonal('email', e.target.value)} placeholder="name@email.com" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                  <div style={sectionLabelStyle}>Phone</div>
                  <input type="text" value={cvData.personal.phone || ''} onChange={(e) => updatePersonal('phone', e.target.value)} placeholder="+880 1XXXXXXXXX" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                  <div style={sectionLabelStyle}>Location</div>
                  <input type="text" value={cvData.personal.location} onChange={(e) => updatePersonal('location', e.target.value)} placeholder="Dhaka, Bangladesh" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                  <div style={sectionLabelStyle}>GitHub URL</div>
                  <input type="text" value={cvData.personal.github} onChange={(e) => updatePersonal('github', e.target.value)} placeholder="https://github.com/username" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                  <div style={sectionLabelStyle}>Portfolio URL</div>
                  <input type="text" value={cvData.personal.portfolio} onChange={(e) => updatePersonal('portfolio', e.target.value)} placeholder="yourportfolio.com" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
                <div>
                  <div style={sectionLabelStyle}>LinkedIn URL</div>
                  <input type="text" value={cvData.personal.linkedin || ''} onChange={(e) => updatePersonal('linkedin', e.target.value)} placeholder="https://linkedin.com/in/username" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
                </div>
              </div>
            )}

            {step.id === 'experience' && (
              <>
                <div style={{ display: 'grid', gap: 16 }}>
                  {cvData.experience.map((item, index) => (
                    <ExperienceCard
                      key={`${item.company}-${item.role}-${index}`}
                      item={item}
                      index={index}
                      onChange={(value) => updateExperience(index, value)}
                      onRemove={() => removeExperience(index)}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
                <button onClick={addExperience} style={{ ...buttonBase, marginTop: 16, background: '#e2ebff', color: brand, padding: '12px 18px' }}>
                  Add another role
                </button>
              </>
            )}

            {step.id === 'projects' && (
              <>
                <div style={{ display: 'grid', gap: 16 }}>
                  {cvData.projects.map((item, index) => (
                    <ProjectCard
                      key={`${item.id}-${index}`}
                      item={item}
                      index={index}
                      onChange={(value) => updateProject(index, value)}
                      onRemove={() => removeProject(index)}
                    />
                  ))}
                </div>
                <button onClick={addProject} style={{ ...buttonBase, marginTop: 16, background: 'rgba(47,102,243,0.18)', color: '#cfdcff', padding: '12px 18px' }}>
                  Add project
                </button>
              </>
            )}

            {step.id === 'skills' && (
              <>
                <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                  <input
                    ref={newSkillInputRef}
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill() }}
                    placeholder="Add a new skill"
                    style={{ ...inputStyle, flex: '1 1 220px' }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                  <input
                    type="number"
                    min={10}
                    max={99}
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                    style={{ ...inputStyle, width: 100 }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                  <button onClick={handleAddSkill} style={{ ...buttonBase, background: brand, color: '#fff', padding: '0 18px' }}>
                    Add
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {skills.map((skill, index) => (
                    <div
                      key={skill.name}
                      draggable
                      onDragStart={() => { dragIndexRef.current = index }}
                      onDragEnter={() => { dragOverIndexRef.current = index }}
                      onDragEnd={() => {
                        const from = dragIndexRef.current
                        const to = dragOverIndexRef.current
                        if (from === null || to === null || from === to) return
                        const reordered = [...skills]
                        const [moved] = reordered.splice(from, 1)
                        reordered.splice(to, 0, moved)
                        setSkills(reordered)
                        dragIndexRef.current = null
                        dragOverIndexRef.current = null
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      style={{ position: 'relative' }}
                    >
                      <button
                        onClick={() => setSkills((prev) => prev.map((item) => item.name === skill.name ? { ...item, included: !item.included } : item))}
                        onMouseEnter={() => setActiveSkill(skill.name)}
                        onMouseLeave={() => setActiveSkill(null)}
                        style={{
                          borderRadius: 999,
                          border: `1px solid ${skill.included ? `${skill.color}55` : '#d9deec'}`,
                          background: skill.included ? `${skill.color}15` : '#fff',
                          color: skill.included ? skill.color : '#99a1b2',
                          padding: '11px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          cursor: 'pointer',
                          fontSize: 14,
                          fontFamily: 'var(--font-dm-sans)',
                        }}
                      >
                        <span style={{ opacity: 0.45 }}>⋮⋮</span>
                        <span>{skill.name}</span>
                        <span style={{ padding: '3px 8px', borderRadius: 999, background: skill.included ? `${skill.color}22` : '#f1f4fa', fontSize: 12 }}>
                          {skill.level}%
                        </span>
                        {skill.category === 'Custom' && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation()
                              setSkills((prev) => prev.filter((item) => item.name !== skill.name))
                            }}
                            style={{ fontWeight: 700 }}
                          >
                            ×
                          </span>
                        )}
                      </button>

                      {activeSkill === skill.name && (
                        <div
                          onMouseEnter={() => setActiveSkill(skill.name)}
                          onMouseLeave={() => setActiveSkill(null)}
                          style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 10px)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            minWidth: 180,
                            background: '#1f2430',
                            color: '#fff',
                            borderRadius: 10,
                            padding: 14,
                            boxShadow: '0 18px 40px rgba(15,23,42,0.25)',
                            zIndex: 20,
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#dfe5ff' }}>{skill.name}</div>
                          <input
                            type="range"
                            min={10}
                            max={99}
                            value={skill.level}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              const value = Number(e.target.value)
                              setSkills((prev) => prev.map((item) => item.name === skill.name ? { ...item, level: value } : item))
                            }}
                            style={{ width: '100%', accentColor: skill.color }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#b9c0d3' }}>
                            <span>10%</span>
                            <span>{skill.level}%</span>
                            <span>99%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {step.id === 'education' && (
              <>
                <div style={{ display: 'grid', gap: 16 }}>
                  {cvData.education.map((item, index) => (
                    <EducationCard
                      key={`${item.school}-${item.degree}-${index}`}
                      item={item}
                      index={index}
                      onChange={(value) => updateEducation(index, value)}
                      onRemove={() => removeEducation(index)}
                      isMobile={isMobile}
                    />
                  ))}
                </div>
                <button onClick={addEducation} style={{ ...buttonBase, marginTop: 16, background: 'rgba(47,102,243,0.18)', color: '#cfdcff', padding: '12px 18px' }}>
                  Add education
                </button>
              </>
            )}

            {step.id === 'summary' && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div style={sectionLabelStyle}>Professional summary</div>
                  <textarea
                    value={cvData.personal.summary}
                    onChange={(e) => updatePersonal('summary', e.target.value)}
                    rows={7}
                    placeholder="Summarize your strengths, experience, and what makes you valuable."
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div style={{ padding: 16, borderRadius: 20, background: surfaceMuted, border: `1px solid ${border}`, color: textMuted, fontSize: 13, lineHeight: 1.7 }}>
                  Keep it short and specific. Mention your years of experience, core tools, and the value you bring.
                </div>
              </>
            )}

            </Accordion>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------- left-panel parts */

/** `Create | Templates`, sitting above the section list as in the reference. */
function ModeToggle({
  mode,
  setMode,
}: {
  mode: 'create' | 'templates'
  setMode: (m: 'create' | 'templates') => void
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 3,
        background: surfaceMuted,
        border: `1px solid ${border}`,
        borderRadius: 10,
        padding: 3,
        marginBottom: 12,
      }}
    >
      {(['create', 'templates'] as const).map((m) => {
        const isActive = mode === m
        return (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              ...buttonBase,
              padding: '8px 12px',
              fontSize: 13,
              textTransform: 'capitalize',
              background: isActive ? surface : 'transparent',
              color: isActive ? text : textMuted,
              boxShadow: isActive ? '0 1px 3px rgba(15,23,42,0.10)' : 'none',
            }}
          >
            {m}
          </button>
        )
      })}
    </div>
  )
}

/**
 * One collapsible section. Closed shows just the title and a `+`; open swaps
 * to `−` and reveals the fields. Any number can be open at once — the old
 * wizard forced you through seven steps to change one line.
 */
function Accordion({
  id,
  title,
  description,
  open,
  onToggle,
  children,
}: {
  id?: string
  title: string
  description: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section
      id={id}
      style={{
        scrollMarginTop: 12,
        background: surface,
        border: `1px solid ${open ? borderStrong : border}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: open ? shadow : 'none',
        transition: 'border-color 0.15s',
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: 'transparent',
          border: 'none',
          padding: '14px 16px',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: text, fontFamily: 'var(--font-dm-sans)' }}>
            {title}
          </span>
          {open && <span style={{ ...helperStyle, display: 'block', marginTop: 3 }}>{description}</span>}
        </span>

        <span
          aria-hidden
          style={{
            width: 22,
            height: 22,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 6,
            background: open ? brandSoft : surfaceMuted,
            color: open ? brand : textMuted,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            {!open && <line x1="12" y1="5" x2="12" y2="19" />}
          </svg>
        </span>
      </button>

      {open && <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${border}`, paddingTop: 16 }}>{children}</div>}
    </section>
  )
}

/** Template picker, sized for the left column rather than a full-width page. */
function TemplateList({
  cvData,
  selected,
  onSelect,
}: {
  cvData: CVData
  selected: CVTemplate
  onSelect: (t: CVTemplate) => void
}) {
  return (
    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
      {templates.map((template) => {
        const isActive = selected === template.id
        return (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            aria-pressed={isActive}
            style={{
              border: `1.5px solid ${isActive ? brand : border}`,
              background: surface,
              borderRadius: 12,
              padding: 10,
              cursor: 'pointer',
              textAlign: 'left',
              boxShadow: isActive ? `0 0 0 3px ${brand}1f` : 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          >
            <div style={{ display: 'grid', placeItems: 'center', background: surfaceMuted, borderRadius: 8, padding: 8 }}>
              <MiniPreview template={template.id} cvData={cvData} />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: isActive ? brand : text }}>
              {template.label}
              {isActive && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, color: brand }}>· in use</span>}
            </div>
            <div style={{ marginTop: 2, fontSize: 11, color: textMuted, lineHeight: 1.45 }}>{template.desc}</div>
          </button>
        )
      })}
    </div>
  )
}


/**
 * What is left to do, in the order worth doing it.
 *
 * A progress bar tells you that you are not finished; it does not tell you
 * what to type next. Each row jumps to the section that fixes it.
 */
function Checklist({ tasks, onGo }: { tasks: Task[]; onGo: (section: Task['section']) => void }) {
  const [open, setOpen] = useState(true)
  const remaining = tasks.filter((t) => !t.done)
  const next = remaining[0]

  if (!next) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 12,
          fontFamily: 'var(--font-dm-sans)',
          fontSize: 13,
          color: '#166534',
          fontWeight: 500,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Everything is filled in. Download when you are ready.
      </div>
    )
  }

  return (
    <section
      style={{
        background: surface,
        border: `1px solid ${border}`,
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        boxShadow: shadow,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          background: brandSoft,
          border: 'none',
          padding: '11px 14px',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: brand, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Next up
          </span>
          <span style={{ display: 'block', fontSize: 13, color: text, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {next.label}
          </span>
        </span>
        <span style={{ fontSize: 12, fontWeight: 600, color: brand, flexShrink: 0 }}>
          {remaining.length} left {open ? '▾' : '▸'}
        </span>
      </button>

      {open && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 8, display: 'grid', gap: 2 }}>
          {tasks.map((task) => (
            <li key={task.id}>
              <button
                onClick={() => onGo(task.section)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 9,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = surfaceMuted)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span
                  aria-hidden
                  style={{
                    width: 16,
                    height: 16,
                    marginTop: 1,
                    flexShrink: 0,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: task.done ? positive : 'transparent',
                    border: task.done ? 'none' : `1.5px solid ${borderStrong}`,
                  }}
                >
                  {task.done && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: task.done ? 400 : 500,
                      color: task.done ? textMuted : text,
                      textDecoration: task.done ? 'line-through' : 'none',
                    }}
                  >
                    {task.label}
                    {!task.required && !task.done && (
                      <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 600, color: textMuted }}>optional</span>
                    )}
                  </span>
                  {!task.done && (
                    <span style={{ display: 'block', fontSize: 11.5, color: textMuted, lineHeight: 1.5, marginTop: 2 }}>
                      {task.why}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
