'use client'

import { useRef } from 'react'
import { CVData, CVTemplate } from '@/app/cv/page'

const templates: { id: CVTemplate; label: string; desc: string }[] = [
  { id: 'dark-pro',      label: 'Dark Pro',       desc: 'Dark header, sidebar skills' },
  { id: 'clean-minimal', label: 'Clean Minimal',  desc: 'White, two-column elegant' },
  { id: 'tech-blue',     label: 'Tech Blue',       desc: 'Monospace, code aesthetic' },
  { id: 'executive',     label: 'Executive',       desc: 'Dark header, single column' },
  { id: 'sidebar-light',  label: 'Sidebar Light',   desc: 'Blue sidebar, photo header' },
  { id: 'timeline',       label: 'Timeline',         desc: 'Minimal with timeline dots' },
  { id: 'bold-header',    label: 'Bold Header',      desc: 'Dark banner, photo overlap' },
  { id: 'creative-panel', label: 'Creative Panel',   desc: 'Dark left, white right' },
]

type Props = {
  cvData: CVData
  setCVData: React.Dispatch<React.SetStateAction<CVData>>
  selectedTemplate: CVTemplate
  setSelectedTemplate: (t: CVTemplate) => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0d0d18',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6,
  padding: '8px 12px',
  color: '#e2e2f0',
  fontFamily: 'var(--font-dm-sans)',
  fontSize: 13,
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans)',
  fontSize: 11,
  color: 'rgba(226,226,240,0.4)',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
}

export default function CVBuilder({ cvData, setCVData, selectedTemplate, setSelectedTemplate }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCVData((prev) => ({ ...prev, photo: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const updatePersonal = (field: string, value: string) => {
    setCVData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }))
  }

  const toggleSkill = (name: string) => {
    setCVData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(name)
        ? prev.selectedSkills.filter((s) => s !== name)
        : [...prev.selectedSkills, name],
    }))
  }

  const toggleSection = (key: keyof CVData['showSections']) => {
    setCVData((prev) => ({
      ...prev,
      showSections: { ...prev.showSections, [key]: !prev.showSections[key] },
    }))
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Templates */}
      <div style={{ marginBottom: 32 }}>
        <h3
          style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 20,
            color: '#e2e2f0',
            marginBottom: 16,
            letterSpacing: '0.05em',
          }}
        >
          TEMPLATE
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              style={{
                background: selectedTemplate === t.id ? 'rgba(79,142,247,0.15)' : '#0d0d18',
                border: `1px solid ${selectedTemplate === t.id ? '#4f8ef7' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8,
                padding: '10px 12px',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 12,
                  fontWeight: 700,
                  color: selectedTemplate === t.id ? '#4f8ef7' : '#e2e2f0',
                  marginBottom: 2,
                }}
              >
                {t.label}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 10,
                  color: 'rgba(226,226,240,0.35)',
                  lineHeight: 1.3,
                }}
              >
                {t.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Photo Upload */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: 20, color: '#e2e2f0', marginBottom: 16, letterSpacing: '0.05em' }}>
          PHOTO
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {cvData.photo ? (
            <img
              src={cvData.photo}
              alt="CV photo"
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid #4f8ef7' }}
            />
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#0d0d18', border: '2px dashed rgba(79,142,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(226,226,240,0.2)', fontSize: 24,
            }}>
              +
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                fontFamily: 'var(--font-dm-sans)', fontSize: 12, fontWeight: 600,
                color: '#4f8ef7', background: 'rgba(79,142,247,0.1)',
                border: '1px solid rgba(79,142,247,0.3)', borderRadius: 6,
                padding: '6px 14px', cursor: 'pointer',
              }}
            >
              {cvData.photo ? 'Change Photo' : 'Upload Photo'}
            </button>
            {cvData.photo && (
              <button
                onClick={() => setCVData((prev) => ({ ...prev, photo: '' }))}
                style={{
                  fontFamily: 'var(--font-dm-sans)', fontSize: 11,
                  color: 'rgba(226,226,240,0.35)', background: 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Personal Info */}
      <div style={{ marginBottom: 32 }}>
        <h3
          style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 20,
            color: '#e2e2f0',
            marginBottom: 16,
            letterSpacing: '0.05em',
          }}
        >
          PERSONAL INFO
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(
            [
              ['name', 'Full Name'],
              ['role', 'Role'],
              ['email', 'Email'],
              ['location', 'Location'],
              ['github', 'GitHub URL'],
              ['portfolio', 'Portfolio URL'],
              ['summary', 'Summary'],
            ] as [keyof CVData['personal'], string][]
          ).map(([field, label]) => (
            <div key={field}>
              <label style={labelStyle}>{label}</label>
              {field === 'summary' ? (
                <textarea
                  value={cvData.personal[field] as string}
                  onChange={(e) => updatePersonal(field, e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              ) : (
                <input
                  type="text"
                  value={cvData.personal[field] as string}
                  onChange={(e) => updatePersonal(field, e.target.value)}
                  style={inputStyle}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div style={{ marginBottom: 32 }}>
        <h3
          style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 20,
            color: '#e2e2f0',
            marginBottom: 16,
            letterSpacing: '0.05em',
          }}
        >
          SKILLS
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {cvData.skills.map((skill) => {
            const selected = cvData.selectedSkills.includes(skill.name)
            return (
              <button
                key={skill.name}
                onClick={() => toggleSkill(skill.name)}
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-dm-sans)',
                  fontWeight: 600,
                  color: selected ? skill.color : 'rgba(226,226,240,0.35)',
                  background: selected ? skill.color + '18' : 'transparent',
                  border: `1px solid ${selected ? skill.color + '55' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 100,
                  padding: '4px 12px',
                  transition: 'all 0.2s',
                }}
              >
                {skill.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Section visibility */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 20,
            color: '#e2e2f0',
            marginBottom: 16,
            letterSpacing: '0.05em',
          }}
        >
          SECTIONS
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(Object.keys(cvData.showSections) as Array<keyof CVData['showSections']>).map((key) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 13,
                  color: '#e2e2f0',
                  textTransform: 'capitalize',
                }}
              >
                {key}
              </span>
              <button
                onClick={() => toggleSection(key)}
                style={{
                  width: 40,
                  height: 22,
                  borderRadius: 11,
                  background: cvData.showSections[key] ? '#4f8ef7' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 3,
                    left: cvData.showSections[key] ? 20 : 3,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
