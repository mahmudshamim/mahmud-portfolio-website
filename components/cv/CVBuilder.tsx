'use client'

import type { CSSProperties, Dispatch, FocusEvent, ReactNode, SetStateAction } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CVData, CVTemplate } from '@/app/cv/page'
import { useIsMobile } from '@/hooks/useIsMobile'

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
}

type BuilderStepId =
  | 'personal'
  | 'contact'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'summary'
  | 'finish'

const templates: { id: CVTemplate; label: string; desc: string }[] = [
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
  '#ef4444',
  '#22c55e',
  '#ec4899',
]

const SECTION_PRESETS = [
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
  {
    id: 'finish',
    number: 8,
    title: 'Template & sections',
    shortTitle: 'Finish',
    description: 'Choose the template and decide which resume sections to show.',
  },
]

const surface = '#10131d'
const surfaceMuted = '#171b27'
const border = '#252b3b'
const text = '#f4f7ff'
const textMuted = '#96a0b8'
const brand = '#2f66f3'
const shadow = '0 24px 60px rgba(0, 0, 0, 0.3)'

const inputStyle: CSSProperties = {
  width: '100%',
  background: '#0d1018',
  border: `1px solid ${border}`,
  borderRadius: 18,
  padding: '16px 18px',
  color: text,
  fontFamily: 'var(--font-dm-sans)',
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
}

const sectionLabelStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: text,
  marginBottom: 8,
  fontFamily: 'var(--font-dm-sans)',
}

const helperStyle: CSSProperties = {
  fontSize: 12,
  color: textMuted,
  lineHeight: 1.6,
  fontFamily: 'var(--font-dm-sans)',
}

const buttonBase: CSSProperties = {
  border: 'none',
  borderRadius: 18,
  fontFamily: 'var(--font-dm-sans)',
  fontSize: 16,
  fontWeight: 700,
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

function focusStyle(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = '#9ab4ff'
  e.target.style.boxShadow = '0 0 0 4px rgba(47,102,243,0.1)'
}

function blurStyle(e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = border
  e.target.style.boxShadow = 'none'
}

function MiniPreview({ template, cvData }: { template: string; cvData: CVData }) {
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

  if (template === 'dark-pro') return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ width: 240, background: '#1a1a2e', padding: '32px 20px', flexShrink: 0 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#4f8ef7', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff' }}>{initial}</div>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>{name}</div>
        <div style={{ color: '#4f8ef7', fontSize: 11, textAlign: 'center', marginBottom: 24 }}>{role}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', marginBottom: 10 }}>SKILLS</div>
        {skills.map((s, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: 10, marginBottom: 3 }}>
              <span>{s.name}</span><span>{s.level}%</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${s.level}%`, background: s.color || '#4f8ef7', borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '32px 28px', background: '#fff' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4f8ef7', letterSpacing: '0.1em', marginBottom: 6 }}>EXPERIENCE</div>
        <div style={{ height: 1, background: '#4f8ef7', marginBottom: 14 }} />
        {experience.map((e, i) => (
          <div key={i} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{e.role}</div>
              <div style={{ fontSize: 10, color: '#999' }}>{e.date}</div>
            </div>
            <div style={{ fontSize: 11, color: '#4f8ef7', marginBottom: 4 }}>{e.company}</div>
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
    <div style={{ padding: 40, background: '#0d1117', fontFamily: 'monospace', height: '100%' }}>
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
      <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', padding: '40px 48px' }}>
        <div style={{ fontSize: 44, fontWeight: 300, color: '#fff', letterSpacing: 4, textTransform: 'uppercase' }}>{name}</div>
        <div style={{ color: '#4f8ef7', fontSize: 14, letterSpacing: 2, marginTop: 8, textTransform: 'uppercase' }}>{role}</div>
      </div>
      <div style={{ padding: '40px 48px' }}>
        {experience.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 24, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #eee' }}>
            <div style={{ width: 100, fontSize: 11, color: '#999', flexShrink: 0 }}>{e.date}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{e.role}</div>
              <div style={{ fontSize: 12, color: '#4f8ef7', marginBottom: 6 }}>{e.company}</div>
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

  if (template === 'creative-panel') return (
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
            <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
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

function StepRail({
  activeStep,
  completedCount,
  setActiveStep,
  isMobile,
}: {
  activeStep: BuilderStepId
  completedCount: number
  setActiveStep: (step: BuilderStepId) => void
  isMobile: boolean
}) {
  if (isMobile) {
    return (
      <div style={{ width: '100%', overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{ display: 'flex', gap: 10, minWidth: 'max-content' }}>
          {steps.map((step, index) => {
            const isActive = step.id === activeStep
            const isComplete = index < completedCount

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                style={{
                  minWidth: 116,
                  borderRadius: 16,
                  border: `1px solid ${isActive ? '#4c78ff' : isComplete ? '#314c90' : '#2a3040'}`,
                  background: isActive ? 'rgba(47,102,243,0.18)' : isComplete ? 'rgba(47,102,243,0.1)' : '#0f1320',
                  color: isActive ? '#fff' : isComplete ? '#bcd0ff' : '#7f8ba8',
                  padding: '12px 14px',
                  textAlign: 'left',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 12, marginBottom: 4, opacity: 0.9 }}>Step {step.number}</div>
                <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-dm-sans)' }}>{step.shortTitle}</div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: 220, flexShrink: 0 }}>
      {steps.map((step, index) => {
        const isActive = step.id === activeStep
        const isComplete = index < completedCount

        return (
          <div key={step.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <button
                onClick={() => setActiveStep(step.id)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  border: `1px solid ${isActive ? '#4c78ff' : isComplete ? '#314c90' : '#2a3040'}`,
                  background: isActive ? 'rgba(47,102,243,0.18)' : isComplete ? 'rgba(47,102,243,0.1)' : '#0f1320',
                  color: isActive ? '#fff' : isComplete ? '#bcd0ff' : '#7f8ba8',
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 10px 25px rgba(47,102,243,0.15)' : 'none',
                }}
              >
                {step.number}
              </button>
              {index < steps.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 24, background: '#252b3b', marginTop: 8 }} />
              )}
            </div>
            <button
              onClick={() => setActiveStep(step.id)}
              style={{
                flex: 1,
                background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: 'none',
                borderRadius: 18,
                padding: '14px 16px',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: isActive ? text : '#8a90a1', fontFamily: 'var(--font-dm-sans)' }}>
                {step.title}
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}

function SectionCard({
  title,
  description,
  children,
  isMobile,
}: {
  title: string
  description: string
  children: ReactNode
  isMobile: boolean
}) {
  return (
    <div
      style={{
        background: surface,
        border: `1px solid ${border}`,
        borderRadius: isMobile ? 22 : 28,
        padding: isMobile ? 18 : 28,
        boxShadow: shadow,
      }}
    >
      <h2 style={{ fontSize: isMobile ? 20 : 26, lineHeight: 1.15, color: text, margin: 0, fontFamily: 'var(--font-dm-sans)' }}>{title}</h2>
      <p style={{ ...helperStyle, marginTop: 10, marginBottom: 24, maxWidth: 560 }}>{description}</p>
      {children}
    </div>
  )
}

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

export default function CVBuilder({ cvData, setCVData, selectedTemplate, setSelectedTemplate, saveState, savedAt, onReset }: Props) {
  const isMobile = useIsMobile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const newSkillInputRef = useRef<HTMLInputElement>(null)
  const dragIndexRef = useRef<number | null>(null)
  const dragOverIndexRef = useRef<number | null>(null)

  const [skills, setSkills] = useState<Skill[]>(() => cvData.skills.map(withIncluded))
  const [activeSkill, setActiveSkill] = useState<string | null>(null)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState(70)
  const [activeStep, setActiveStep] = useState<BuilderStepId>('personal')

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

  const activeStepIndex = steps.findIndex((step) => step.id === activeStep)
  const progress = Math.round(((activeStepIndex + 1) / steps.length) * 100)
  const currentStep = steps[activeStepIndex]

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

  const goNext = () => {
    if (activeStepIndex < steps.length - 1) setActiveStep(steps[activeStepIndex + 1].id)
  }

  const goPrev = () => {
    if (activeStepIndex > 0) setActiveStep(steps[activeStepIndex - 1].id)
  }

  const completionHint =
    !cvData.personal.name ? 'Add your name' :
    !cvData.personal.role ? 'Add a target role' :
    !cvData.personal.email ? 'Add contact info' :
    cvData.experience.length === 0 ? 'Add your first role' :
    skills.filter((skill) => skill.included).length < 3 ? 'Select a few skills' :
    !cvData.personal.summary ? 'Write a quick summary' :
    'Looking good'

  return (
    <div
      style={{
        minHeight: '100%',
        padding: isMobile ? '18px 14px 110px' : '28px 24px 36px',
        background: 'radial-gradient(circle at top left, rgba(79,142,247,0.18) 0%, rgba(79,142,247,0.04) 28%, #0b0b13 58%, #080810 100%)',
        fontFamily: 'var(--font-dm-sans)',
      }}
    >
      <div style={{ marginBottom: 26 }}>
        <div style={{ fontSize: 14, color: textMuted, marginBottom: 8 }}>Your resume</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? 32 : 46, lineHeight: 1, color: text }}>Build your CV</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginLeft: 'auto' }}>
            <div style={{ padding: '10px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: `1px solid ${border}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: saveState === 'saving' ? '#facc15' : '#7ee787' }}>
                {saveState === 'saving' ? 'Saving...' : savedAt}
              </div>
            </div>
            <button
              onClick={onReset}
              style={{ ...buttonBase, padding: '10px 16px', background: '#151926', color: '#ffb4b4', border: `1px solid ${border}` }}
            >
              Reset
            </button>
          </div>
          <div
            style={{
              minWidth: isMobile ? '100%' : 230,
              width: isMobile ? '100%' : undefined,
              background: 'rgba(16,19,29,0.9)',
              border: `1px solid ${border}`,
              borderRadius: 999,
              padding: '10px 14px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.22)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: textMuted }}>Progress</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: text }}>{progress}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: '#e7ebf4' }}>
              <div style={{ width: `${progress}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #4f8ef7 0%, #6f9eff 100%)' }} />
            </div>
            <div style={{ ...helperStyle, marginTop: 6 }}>{completionHint}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <StepRail activeStep={activeStep} completedCount={activeStepIndex} setActiveStep={setActiveStep} isMobile={isMobile} />

        <div style={{ flex: '1 1 520px', minWidth: 0, width: isMobile ? '100%' : undefined }}>
          <SectionCard title={currentStep.title} description={currentStep.description} isMobile={isMobile}>
            {activeStep === 'personal' && (
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

                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: 16, padding: 18, borderRadius: 22, background: surfaceMuted }}>
                  {cvData.photo ? (
                    <img src={cvData.photo} alt="CV photo" style={{ width: 76, height: 76, borderRadius: 24, objectFit: 'cover', border: '3px solid #c2d2ff' }} />
                  ) : (
                    <div style={{ width: 76, height: 76, borderRadius: 24, background: '#e4e9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7d89a6', fontSize: 32 }}>
                      +
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={sectionLabelStyle}>Photo</div>
                    <div style={{ ...helperStyle, marginBottom: 10 }}>A clean headshot helps your CV feel more complete, but it is optional.</div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button onClick={() => fileInputRef.current?.click()} style={{ ...buttonBase, background: 'rgba(47,102,243,0.18)', color: '#cfdcff', padding: '12px 18px' }}>
                        {cvData.photo ? 'Change photo' : 'Add photo'}
                      </button>
                      {cvData.photo && (
                        <button onClick={() => setCVData((prev) => ({ ...prev, photo: '' }))} style={{ ...buttonBase, background: '#0d1018', color: textMuted, border: `1px solid ${border}`, padding: '12px 18px' }}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              </>
            )}

            {activeStep === 'contact' && (
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

            {activeStep === 'experience' && (
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

            {activeStep === 'projects' && (
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

            {activeStep === 'skills' && (
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
                            borderRadius: 18,
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

            {activeStep === 'education' && (
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

            {activeStep === 'summary' && (
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
                <div style={{ padding: 16, borderRadius: 20, background: '#141a27', color: textMuted, fontSize: 13, lineHeight: 1.7 }}>
                  Keep it short and specific. Mention your years of experience, core tools, and the value you bring.
                </div>
              </>
            )}

            {activeStep === 'finish' && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ ...sectionLabelStyle, marginBottom: 12 }}>Choose template</div>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        style={{
                          border: `1.5px solid ${selectedTemplate === template.id ? brand : border}`,
                          background: selectedTemplate === template.id ? '#edf3ff' : '#fff',
                          borderRadius: 22,
                          padding: 12,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <MiniPreview template={template.id} cvData={memoizedCvData} />
                        <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: text }}>{template.label}</div>
                        <div style={{ marginTop: 4, fontSize: 12, color: textMuted, lineHeight: 1.5 }}>{template.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ ...sectionLabelStyle, marginBottom: 12 }}>Visible sections</div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {(Object.keys(cvData.showSections) as Array<keyof CVData['showSections']>).map((key) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 18, background: surfaceMuted, border: `1px solid ${border}` }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: text, textTransform: 'capitalize' }}>{key}</div>
                          <div style={{ fontSize: 12, color: textMuted }}>Show this block in the CV preview and PDF.</div>
                        </div>
                        <button
                          onClick={() => toggleSection(key)}
                          style={{
                            width: 54,
                            height: 30,
                            borderRadius: 999,
                            border: 'none',
                            background: cvData.showSections[key] ? brand : '#d7dce8',
                            padding: 3,
                            cursor: 'pointer',
                          }}
                        >
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: '#fff',
                              transform: `translateX(${cvData.showSections[key] ? 24 : 0}px)`,
                              transition: 'transform 0.2s ease',
                            }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <div style={{ ...sectionLabelStyle, marginBottom: 12 }}>Section order</div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {cvData.sectionOrder.map((sectionId, index) => {
                      const customSection = cvData.customSections.find((item) => item.id === sectionId)
                      const label = customSection ? (customSection.title || `Custom section ${index + 1}`) : sectionId.charAt(0).toUpperCase() + sectionId.slice(1)

                      return (
                        <div key={sectionId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', borderRadius: 16, background: surfaceMuted, border: `1px solid ${border}` }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: text }}>{label}</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => moveSectionOrder(sectionId, -1)} style={{ ...buttonBase, padding: '8px 12px', background: '#0d1018', color: text, border: `1px solid ${border}` }}>Up</button>
                            <button onClick={() => moveSectionOrder(sectionId, 1)} style={{ ...buttonBase, padding: '8px 12px', background: '#0d1018', color: text, border: `1px solid ${border}` }}>Down</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <div style={{ ...sectionLabelStyle, marginBottom: 12 }}>Add section</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                    {SECTION_PRESETS.map((preset) => (
                      <button
                        key={preset.title}
                        onClick={() => addCustomSection(preset)}
                        style={{ ...buttonBase, padding: '10px 14px', background: '#151926', color: '#cfdcff', border: `1px solid ${border}`, fontSize: 13 }}
                      >
                        {preset.title}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {cvData.customSections.map((section, index) => (
                      <div key={section.id} style={{ padding: 16, borderRadius: 18, background: surfaceMuted, border: `1px solid ${border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: text }}>Custom section {index + 1}</div>
                          <button
                            onClick={() => removeCustomSection(section.id)}
                            style={{ background: 'transparent', border: 'none', color: '#ff7d7d', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Remove
                          </button>
                        </div>
                        <div style={{ display: 'grid', gap: 12 }}>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => setCVData((prev) => ({
                              ...prev,
                              customSections: prev.customSections.map((item) => item.id === section.id ? { ...item, title: e.target.value } : item),
                            }))}
                            placeholder="Section title"
                            style={inputStyle}
                            onFocus={focusStyle}
                            onBlur={blurStyle}
                          />
                          <textarea
                            value={section.content}
                            onChange={(e) => setCVData((prev) => ({
                              ...prev,
                              customSections: prev.customSections.map((item) => item.id === section.id ? { ...item, content: e.target.value } : item),
                            }))}
                            placeholder={'Add each point on a new line\nCertification\nAchievement\nVolunteer work'}
                            rows={5}
                            style={{ ...inputStyle, resize: 'vertical' }}
                            onFocus={focusStyle}
                            onBlur={blurStyle}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => addCustomSection()}
                    style={{ ...buttonBase, marginTop: 14, background: 'rgba(47,102,243,0.18)', color: '#cfdcff', padding: '12px 18px' }}
                  >
                    Add section
                  </button>
                </div>
              </>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                marginTop: 28,
                flexWrap: 'wrap',
                position: isMobile ? 'fixed' : 'static',
                left: isMobile ? 0 : undefined,
                right: isMobile ? 0 : undefined,
                bottom: isMobile ? 0 : undefined,
                padding: isMobile ? '14px' : 0,
                background: isMobile ? 'linear-gradient(180deg, rgba(8,8,16,0) 0%, rgba(8,8,16,0.94) 24%, rgba(8,8,16,1) 100%)' : 'transparent',
                zIndex: isMobile ? 20 : 'auto',
              }}
            >
              <button
                onClick={goPrev}
                disabled={activeStepIndex === 0}
                style={{
                  ...buttonBase,
                  background: '#0d1018',
                  color: activeStepIndex === 0 ? '#b4bac9' : text,
                  border: `1px solid ${border}`,
                  padding: '14px 20px',
                  flex: isMobile ? 1 : undefined,
                  cursor: activeStepIndex === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Back
              </button>
              <button
                onClick={goNext}
                disabled={activeStepIndex === steps.length - 1}
                style={{
                  ...buttonBase,
                  background: activeStepIndex === steps.length - 1 ? '#d5ddec' : brand,
                  color: '#fff',
                  padding: '14px 26px',
                  flex: isMobile ? 1.25 : undefined,
                  cursor: activeStepIndex === steps.length - 1 ? 'not-allowed' : 'pointer',
                }}
              >
                {activeStepIndex === steps.length - 2 ? 'Review finish' : activeStepIndex === steps.length - 1 ? 'Ready' : 'Next'}
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
