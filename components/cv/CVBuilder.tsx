'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { CVData, CVTemplate } from '@/app/cv/page'
import { portfolioData } from '@/data/portfolio'

type Skill = {
  name: string
  level: number
  category: string
  color: string
  included: boolean
}

const templates: { id: CVTemplate; label: string; desc: string }[] = [
  { id: 'dark-pro',       label: 'Dark Pro',       desc: 'Dark sidebar, skill bars' },
  { id: 'clean-minimal',  label: 'Clean Minimal',  desc: 'White, two-column elegant' },
  { id: 'tech-blue',      label: 'Tech Blue',      desc: 'Code editor aesthetic' },
  { id: 'executive',      label: 'Executive',      desc: 'Dark header, single column' },
  { id: 'sidebar-light',  label: 'Sidebar Light',  desc: 'Blue sidebar, photo header' },
  { id: 'timeline',       label: 'Timeline',       desc: 'Minimal with timeline dots' },
  { id: 'bold-header',    label: 'Bold Header',    desc: 'Dark banner, photo overlap' },
  { id: 'creative-panel', label: 'Creative Panel', desc: 'Dark left, white right' },
]

type Props = {
  cvData: CVData
  setCVData: React.Dispatch<React.SetStateAction<CVData>>
  selectedTemplate: CVTemplate
  setSelectedTemplate: (t: CVTemplate) => void
}

// ─── Mini thumbnail ────────────────────────────────────────────────────────────
const MINI_W = 120
const MINI_H = 170
const SCALE  = MINI_W / 794

function MiniPreview({ template, cvData }: { template: string; cvData: any }) {
  return (
    <div style={{
      width: MINI_W, height: MINI_H, overflow: 'hidden', borderRadius: 4,
      position: 'relative', flexShrink: 0,
      border: '1px solid rgba(255,255,255,0.1)', background: '#fff', margin: '0 auto',
    }}>
      <div style={{ width: 794, height: 794 * 1.414, transform: `scale(${SCALE})`, transformOrigin: 'top left', pointerEvents: 'none', userSelect: 'none' }}>
        <MiniCVLayout template={template} cvData={cvData} />
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }} />
    </div>
  )
}

function MiniCVLayout({ template, cvData }: { template: string; cvData: any }) {
  const name       = cvData?.personal?.name || 'Your Name'
  const role       = cvData?.personal?.role || 'Your Role'
  const skills     = (cvData?.skills || []).filter((s: any) => s.included !== false).slice(0, 5)
  const experience = cvData?.experience?.slice(0, 2) || []
  const initial    = name.charAt(0)

  if (template === 'dark-pro') return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ width: 240, background: '#1a1a2e', padding: '32px 20px', flexShrink: 0 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#4f8ef7', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff' }}>{initial}</div>
        <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>{name}</div>
        <div style={{ color: '#4f8ef7', fontSize: 11, textAlign: 'center', marginBottom: 24 }}>{role}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', marginBottom: 10 }}>SKILLS</div>
        {skills.map((s: any, i: number) => (
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
        {experience.map((e: any, i: number) => (
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
          {experience.map((e: any, i: number) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{e.role}</div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{e.company} · {e.date}</div>
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5 }}>{e.desc}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#111', marginBottom: 12 }}>SKILLS</div>
          {skills.map((s: any, i: number) => (
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
      {experience.map((e: any, i: number) => (
        <div key={i} style={{ marginBottom: 14, borderLeft: '2px solid #388bfd', paddingLeft: 14 }}>
          <div style={{ color: '#8b949e', fontSize: 10 }}>{e.date}</div>
          <div style={{ color: '#e6edf3', fontSize: 13, fontWeight: 700 }}>{e.role}</div>
          <div style={{ color: '#79c0ff', fontSize: 11 }}>{e.company}</div>
        </div>
      ))}
      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {skills.map((s: any, i: number) => (
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
        {experience.map((e: any, i: number) => (
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
        {skills.map((s: any, i: number) => (
          <div key={i} style={{ fontSize: 11, color: '#444', marginBottom: 4 }}>• {s.name}</div>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#b0cfe0', padding: '28px 32px', minHeight: 100 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#1a2e3a', textTransform: 'uppercase' }}>{name}</div>
          <div style={{ fontSize: 13, color: '#3a6070', marginTop: 6 }}>{role}</div>
        </div>
        <div style={{ padding: '20px 28px' }}>
          {experience.map((e: any, i: number) => (
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
          {skills.map((s: any, i: number) => (
            <div key={i} style={{ fontSize: 11, color: '#444', marginBottom: 6 }}>• {s.name}</div>
          ))}
        </div>
        <div style={{ flex: 1, padding: '0 24px', borderLeft: '1.5px solid #d0d0d0', marginLeft: 12 }}>
          {experience.map((e: any, i: number) => (
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
          {skills.map((s: any, i: number) => (
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
          {experience.map((e: any, i: number) => (
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
        {skills.map((s: any, i: number) => (
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
        {experience.map((e: any, i: number) => (
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

// ─── Shared styles ─────────────────────────────────────────────────────────────
const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', padding: '20px 20px 8px', textTransform: 'uppercase', fontFamily: 'var(--font-dm-sans)' }}>
    {children}
  </div>
)

const Divider = () => (
  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
)

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '9px 12px', color: '#e2e2f0', fontFamily: 'var(--font-dm-sans)',
  fontSize: 13, outline: 'none', boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.35)',
  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6, fontFamily: 'var(--font-dm-sans)',
}

const AUTO_COLORS = [
  '#4f8ef7', '#34d399', '#a78bfa', '#ff2d78',
  '#f59e0b', '#61dafb', '#84cc16', '#ff6b35',
]

// ─── Main builder ──────────────────────────────────────────────────────────────
export default function CVBuilder({ cvData, setCVData, selectedTemplate, setSelectedTemplate }: Props) {
  const fileInputRef    = useRef<HTMLInputElement>(null)
  const newSkillInputRef = useRef<HTMLInputElement>(null)
  const dragIndexRef    = useRef<number | null>(null)
  const dragOverIndexRef = useRef<number | null>(null)

  const [skills, setSkills] = useState<Skill[]>(() =>
    cvData.skills.map(s => ({ ...s, included: true }))
  )
  const [activeSkill, setActiveSkill]     = useState<string | null>(null)
  const [newSkillName, setNewSkillName]   = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState(70)

  // Sync local skills → parent cvData
  useEffect(() => {
    setCVData(prev => ({
      ...prev,
      skills,
      selectedSkills: skills.filter(s => s.included).map(s => s.name),
    }))
  }, [skills])

  // Only re-render thumbnails when name/role/skills/experience change
  const memoizedCvData = useMemo(() => cvData, [
    cvData.personal.name,
    cvData.personal.role,
    cvData.skills.length,
    cvData.experience.length,
  ])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCVData((prev) => ({ ...prev, photo: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  const updatePersonal = (field: string, value: string) =>
    setCVData((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } }))

  const toggleSection = (key: keyof CVData['showSections']) =>
    setCVData((prev) => ({ ...prev, showSections: { ...prev.showSections, [key]: !prev.showSections[key] } }))

  const handleAddSkill = () => {
    const name = newSkillName.trim()
    if (!name) return
    if (skills.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      newSkillInputRef.current?.focus()
      return
    }
    const color = AUTO_COLORS[skills.length % AUTO_COLORS.length]
    setSkills(prev => [...prev, {
      name,
      level: Math.min(99, Math.max(10, newSkillLevel)),
      category: 'Custom',
      color,
      included: true,
    }])
    setNewSkillName('')
    setNewSkillLevel(70)
    newSkillInputRef.current?.focus()
  }

  return (
    <div style={{ paddingBottom: 32 }}>

      {/* Sticky header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#0d0d14', zIndex: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'var(--font-dm-sans)' }}>
          Customize
        </div>
      </div>

      {/* Template cards */}
      <SectionHeading>Template</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px 16px' }}>
        {templates.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelectedTemplate(t.id)}
            style={{
              background: selectedTemplate === t.id ? 'rgba(79,142,247,0.12)' : 'rgba(255,255,255,0.03)',
              border: `${selectedTemplate === t.id ? '1.5px solid #4f8ef7' : '1px solid rgba(255,255,255,0.07)'}`,
              borderRadius: 10, padding: 10, cursor: 'pointer',
              transition: 'all 0.15s', display: 'flex', flexDirection: 'column', gap: 8, position: 'relative',
            }}
          >
            <MiniPreview template={t.id} cvData={memoizedCvData} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: selectedTemplate === t.id ? '#4f8ef7' : 'rgba(255,255,255,0.85)', marginBottom: 2, fontFamily: 'var(--font-dm-sans)' }}>
                {t.label}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', lineHeight: 1.4, fontFamily: 'var(--font-dm-sans)' }}>
                {t.desc}
              </div>
            </div>
            {selectedTemplate === t.id && (
              <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: '#4f8ef7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', zIndex: 3 }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      <Divider />

      {/* Photo */}
      <SectionHeading>Photo</SectionHeading>
      <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
        {cvData.photo ? (
          <img src={cvData.photo} alt="CV photo" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #4f8ef7', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(79,142,247,0.08)', border: '2px dashed rgba(79,142,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 22, flexShrink: 0 }}>+</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => fileInputRef.current?.click()} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, fontWeight: 600, color: '#4f8ef7', background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.3)', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>
            {cvData.photo ? 'Change Photo' : 'Upload Photo'}
          </button>
          {cvData.photo && (
            <button onClick={() => setCVData((prev) => ({ ...prev, photo: '' }))} style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Remove</button>
          )}
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />

      <Divider />

      {/* Personal Info */}
      <SectionHeading>Personal Info</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {([ ['name','Full Name'], ['role','Role'], ['email','Email'], ['location','Location'], ['github','GitHub URL'], ['portfolio','Portfolio URL'], ['summary','Summary'] ] as [keyof CVData['personal'], string][]).map(([field, label]) => (
          <div key={field} style={{ padding: '0 16px', marginBottom: 12 }}>
            <label style={labelStyle}>{label}</label>
            {field === 'summary' ? (
              <textarea value={cvData.personal[field] as string} onChange={(e) => updatePersonal(field, e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            ) : (
              <input type="text" value={cvData.personal[field] as string} onChange={(e) => updatePersonal(field, e.target.value)} style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#4f8ef7')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            )}
          </div>
        ))}
      </div>

      <Divider />

      {/* Skills */}
      <SectionHeading>Skills</SectionHeading>

      {/* Add new skill */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px', alignItems: 'center' }}>
        <input
          ref={newSkillInputRef}
          value={newSkillName}
          onChange={e => setNewSkillName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAddSkill() }}
          placeholder="New skill..."
          style={{
            flex: 1, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
            padding: '8px 12px', color: '#e2e2f0', fontSize: 12, outline: 'none',
            boxSizing: 'border-box', fontFamily: 'var(--font-dm-sans)',
          }}
          onFocus={e => (e.target.style.borderColor = '#4f8ef7')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
        />
        <input
          type="number" min={10} max={99}
          value={newSkillLevel}
          onChange={e => setNewSkillLevel(Number(e.target.value))}
          style={{
            width: 52, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
            padding: '8px', color: '#e2e2f0', fontSize: 12, outline: 'none', textAlign: 'center',
          }}
        />
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: -4 }}>%</span>
        <button
          onClick={handleAddSkill}
          disabled={!newSkillName.trim()}
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: newSkillName.trim() ? '#4f8ef7' : 'rgba(255,255,255,0.06)',
            border: 'none',
            color: newSkillName.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
            fontSize: 18, cursor: newSkillName.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s',
          }}
        >
          +
        </button>
      </div>

      {/* Skill chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 16px 16px' }}>
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
            onDragOver={e => e.preventDefault()}
            style={{ position: 'relative', cursor: 'grab', userSelect: 'none' }}
          >
            {/* Chip */}
            <div
              onClick={() => setSkills(prev => prev.map(s => s.name === skill.name ? { ...s, included: !s.included } : s))}
              onMouseEnter={() => setActiveSkill(skill.name)}
              onMouseLeave={() => setActiveSkill(null)}
              style={{
                padding: '5px 10px', borderRadius: 20,
                border: skill.included ? `1px solid ${skill.color}88` : '1px solid rgba(255,255,255,0.08)',
                background: skill.included ? `${skill.color}18` : 'rgba(255,255,255,0.03)',
                color: skill.included ? skill.color : 'rgba(255,255,255,0.3)',
                fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: 10, opacity: 0.3, cursor: 'grab', lineHeight: 1 }}>⠿</span>
              {skill.name}
              <span style={{
                fontSize: 10,
                background: skill.included ? `${skill.color}30` : 'rgba(255,255,255,0.06)',
                color: skill.included ? skill.color : 'rgba(255,255,255,0.25)',
                padding: '1px 5px', borderRadius: 10,
              }}>
                {skill.level}%
              </span>
              {skill.category === 'Custom' && (
                <span
                  onClick={e => { e.stopPropagation(); setSkills(prev => prev.filter(s => s.name !== skill.name)) }}
                  style={{ fontSize: 11, opacity: 0.4, cursor: 'pointer', marginLeft: 1, lineHeight: 1 }}
                >
                  ×
                </span>
              )}
            </div>

            {/* Hover slider popup */}
            {activeSkill === skill.name && (
              <div
                onMouseEnter={() => setActiveSkill(skill.name)}
                onMouseLeave={() => setActiveSkill(null)}
                style={{
                  position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#1a1a2e', border: `1px solid ${skill.color}44`,
                  borderRadius: 10, padding: '10px 14px',
                  zIndex: 100, minWidth: 160,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: skill.color, marginBottom: 8, textAlign: 'center' }}>
                  {skill.name}
                </div>
                <input
                  type="range" min={10} max={99}
                  value={skill.level}
                  onClick={e => e.stopPropagation()}
                  onChange={e => {
                    const newLevel = Number(e.target.value)
                    setSkills(prev => prev.map(s => s.name === skill.name ? { ...s, level: newLevel } : s))
                  }}
                  style={{ width: '100%', accentColor: skill.color, cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>10%</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: skill.color }}>{skill.level}%</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>99%</span>
                </div>
                {/* Arrow */}
                <div style={{
                  position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                  width: 10, height: 6, background: '#1a1a2e',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <Divider />

      {/* Sections */}
      <SectionHeading>Sections</SectionHeading>
      <div style={{ padding: '0 16px 16px' }}>
        {(Object.keys(cvData.showSections) as Array<keyof CVData['showSections']>).map((key) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-dm-sans)', textTransform: 'capitalize' }}>{key}</span>
            <div onClick={() => toggleSection(key)} style={{ width: 36, height: 20, borderRadius: 10, background: cvData.showSections[key] ? '#4f8ef7' : 'rgba(255,255,255,0.15)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 2, left: cvData.showSections[key] ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
