'use client'

import { useState } from 'react'
import { CVData, CVTemplate } from '@/app/cv/page'

type Props = {
  cvData: CVData
  selectedTemplate: CVTemplate
}

export default function CVPreview({ cvData, selectedTemplate }: Props) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default as any
      const element = document.getElementById('cv-preview-content')
      await html2pdf()
        .set({
          margin: 0,
          filename: `Mahmud-CV-${selectedTemplate}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save()
    } finally {
      setIsGenerating(false)
    }
  }

  const { personal, skills, projects, experience, education, selectedSkills, showSections, photo } = cvData
  const activeSkills = skills.filter((s) => selectedSkills.includes(s.name))

  return (
    <div>
      {/* Download button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 14,
            fontWeight: 700,
            color: isGenerating ? 'rgba(226,226,240,0.4)' : '#050508',
            background: isGenerating ? 'rgba(255,255,255,0.1)' : '#4f8ef7',
            border: 'none',
            borderRadius: 8,
            padding: '10px 24px',
            transition: 'all 0.2s',
          }}
        >
          {isGenerating ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      {/* CV Preview */}
      <div
        style={{
          width: 794,
          maxWidth: '100%',
          minHeight: 1123,
          margin: '0 auto',
          background: '#fff',
          boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div id="cv-preview-content" style={{ width: '100%', minHeight: 1123 }}>
          {selectedTemplate === 'dark-pro' && (
            <DarkProTemplate personal={personal} skills={activeSkills} projects={projects} experience={experience} education={education} showSections={showSections} photo={photo} />
          )}
          {selectedTemplate === 'clean-minimal' && (
            <CleanMinimalTemplate personal={personal} skills={activeSkills} projects={projects} experience={experience} education={education} showSections={showSections} photo={photo} />
          )}
          {selectedTemplate === 'tech-blue' && (
            <TechBlueTemplate personal={personal} skills={activeSkills} projects={projects} experience={experience} education={education} showSections={showSections} photo={photo} />
          )}
          {selectedTemplate === 'executive' && (
            <ExecutiveTemplate personal={personal} skills={activeSkills} projects={projects} experience={experience} education={education} showSections={showSections} photo={photo} />
          )}
        </div>
      </div>
    </div>
  )
}

type TemplateProps = {
  personal: CVData['personal']
  skills: CVData['skills']
  projects: CVData['projects']
  experience: CVData['experience']
  education: CVData['education']
  showSections: CVData['showSections']
  photo: string
}

// ─── Template 1: Dark Pro ─────────────────────────────────────────────────────
function DarkProTemplate({ personal, skills, projects, experience, education, showSections, photo }: TemplateProps) {
  return (
    <div style={{ display: 'flex', fontFamily: 'sans-serif', fontSize: 12, color: '#111' }}>
      {/* Sidebar */}
      <div
        style={{
          width: 220,
          background: '#1a1a2e',
          color: '#e2e2f0',
          padding: 24,
          minHeight: 1123,
        }}
      >
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          {photo && (
            <img src={photo} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #4f8ef7', marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
          )}
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: 0 }}>
            {personal.name}
          </h1>
          <p style={{ fontSize: 11, color: '#4f8ef7', marginTop: 6 }}>{personal.role}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>{personal.email}</p>
          <p style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>{personal.location}</p>
          <p style={{ fontSize: 10, color: '#666', marginBottom: 4 }}>{personal.portfolio}</p>
        </div>

        {showSections.skills && skills.length > 0 && (
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: '#4f8ef7', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>
              Skills
            </h3>
            {skills.map((s) => (
              <div key={s.name} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#ccc', marginBottom: 4 }}>
                  <span>{s.name}</span>
                  <span style={{ color: '#888' }}>{s.level}%</span>
                </div>
                <div style={{ height: 3, background: '#333', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${s.level}%`, background: s.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: 32 }}>
        {showSections.summary && (
          <Section title="Summary">
            <p style={{ fontSize: 12, lineHeight: 1.7, color: '#444' }}>{personal.summary}</p>
          </Section>
        )}
        {showSections.experience && (
          <Section title="Experience">
            {experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{e.role}</strong>
                  <span style={{ color: '#888', fontSize: 11 }}>{e.date}</span>
                </div>
                <p style={{ color: '#4f8ef7', fontSize: 11, margin: '2px 0' }}>{e.company}</p>
                <p style={{ color: '#555', lineHeight: 1.6 }}>{e.desc}</p>
              </div>
            ))}
          </Section>
        )}
        {showSections.projects && (
          <Section title="Projects">
            {projects.filter((p) => p.featured).map((p) => (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <strong style={{ fontSize: 13 }}>{p.name}</strong>
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 10,
                    color: p.color,
                    background: p.color + '18',
                    padding: '1px 6px',
                    borderRadius: 4,
                  }}
                >
                  {p.category}
                </span>
                <p style={{ color: '#555', margin: '4px 0', lineHeight: 1.5 }}>{p.shortDesc}</p>
                <p style={{ fontSize: 10, color: '#999', fontFamily: 'monospace' }}>
                  {p.tech.join(' · ')}
                </p>
              </div>
            ))}
          </Section>
        )}
        {showSections.education && (
          <Section title="Education">
            {education.map((e, i) => (
              <div key={i}>
                <strong>{e.degree}</strong>
                <p style={{ color: '#555' }}>{e.school} &mdash; {e.date}</p>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}

// ─── Template 2: Clean Minimal ────────────────────────────────────────────────
function CleanMinimalTemplate({ personal, skills, projects, experience, education, showSections, photo }: TemplateProps) {
  return (
    <div style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: '#222', padding: 40 }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #222', paddingBottom: 20, marginBottom: 28 }}>
        {photo && (
          <img src={photo} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #222', marginBottom: 12, display: 'block', margin: '0 auto 12px' }} />
        )}
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>{personal.name.toUpperCase()}</h1>
        <p style={{ fontSize: 13, color: '#555', margin: '8px 0 4px', fontStyle: 'italic' }}>{personal.role}</p>
        <p style={{ fontSize: 11, color: '#777' }}>
          {personal.email} &nbsp;·&nbsp; {personal.location} &nbsp;·&nbsp; {personal.portfolio}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          {showSections.summary && (
            <MinSection title="Profile">
              <p style={{ lineHeight: 1.8, color: '#444' }}>{personal.summary}</p>
            </MinSection>
          )}
          {showSections.experience && (
            <MinSection title="Experience">
              {experience.map((e, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <strong style={{ fontSize: 13 }}>{e.role}</strong>
                  <p style={{ color: '#777', fontSize: 11, margin: '2px 0' }}>{e.company} &mdash; {e.date}</p>
                  <p style={{ color: '#444', lineHeight: 1.6 }}>{e.desc}</p>
                </div>
              ))}
            </MinSection>
          )}
          {showSections.education && (
            <MinSection title="Education">
              {education.map((e, i) => (
                <div key={i}>
                  <strong>{e.degree}</strong>
                  <p style={{ color: '#555' }}>{e.school}</p>
                  <p style={{ color: '#888', fontSize: 11 }}>{e.date}</p>
                </div>
              ))}
            </MinSection>
          )}
        </div>
        <div>
          {showSections.skills && (
            <MinSection title="Skills">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {skills.map((s) => (
                  <span key={s.name} style={{ fontSize: 11, border: '1px solid #ccc', borderRadius: 3, padding: '2px 8px' }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </MinSection>
          )}
          {showSections.projects && (
            <MinSection title="Projects">
              {projects.filter((p) => p.featured).map((p) => (
                <div key={p.id} style={{ marginBottom: 14 }}>
                  <strong>{p.name}</strong>
                  <p style={{ color: '#555', lineHeight: 1.5 }}>{p.shortDesc}</p>
                  <p style={{ fontSize: 10, color: '#999', fontFamily: 'monospace', marginTop: 4 }}>
                    {p.tech.join(', ')}
                  </p>
                </div>
              ))}
            </MinSection>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Template 3: Tech Blue ────────────────────────────────────────────────────
function TechBlueTemplate({ personal, skills, projects, experience, education, showSections, photo }: TemplateProps) {
  return (
    <div style={{ fontFamily: '"Courier New", monospace', fontSize: 11, color: '#0a0a14', background: '#fff', padding: 36 }}>
      <div style={{ borderBottom: '3px solid #0057ff', paddingBottom: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
        {photo && (
          <img src={photo} alt="Profile" style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover', border: '3px solid #0057ff', flexShrink: 0 }} />
        )}
        <div>
          <p style={{ fontSize: 11, color: '#0057ff', margin: '0 0 4px' }}>$ cat profile.json</p>
          <h1 style={{ fontSize: 30, fontWeight: 900, color: '#0057ff', margin: 0 }}>&gt; {personal.name}</h1>
          <p style={{ fontSize: 12, color: '#333', margin: '4px 0' }}>// {personal.role}</p>
          <p style={{ fontSize: 10, color: '#888' }}>{personal.email} | {personal.location} | {personal.portfolio}</p>
        </div>
      </div>

      {showSections.summary && (
        <CodeSection title="summary">
          <p style={{ lineHeight: 1.8, color: '#444' }}>{personal.summary}</p>
        </CodeSection>
      )}
      {showSections.skills && (
        <CodeSection title="skills">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {skills.map((s) => (
              <span key={s.name} style={{ color: s.color, fontSize: 11 }}>
                [{s.name}:{s.level}%]
              </span>
            ))}
          </div>
        </CodeSection>
      )}
      {showSections.experience && (
        <CodeSection title="experience">
          {experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <p style={{ color: '#0057ff', margin: 0 }}>&gt; {e.role} @ {e.company}</p>
              <p style={{ color: '#888', margin: '2px 0' }}>// {e.date}</p>
              <p style={{ color: '#444', lineHeight: 1.6 }}>{e.desc}</p>
            </div>
          ))}
        </CodeSection>
      )}
      {showSections.projects && (
        <CodeSection title="projects">
          {projects.filter((p) => p.featured).map((p) => (
            <div key={p.id} style={{ marginBottom: 12 }}>
              <p style={{ color: '#0057ff', margin: 0 }}>&gt; {p.name}</p>
              <p style={{ color: '#444', margin: '2px 0', lineHeight: 1.5 }}>// {p.shortDesc}</p>
              <p style={{ color: '#888' }}>{p.tech.map((t) => `"${t}"`).join(', ')}</p>
            </div>
          ))}
        </CodeSection>
      )}
      {showSections.education && (
        <CodeSection title="education">
          {education.map((e, i) => (
            <p key={i} style={{ margin: '2px 0' }}>
              &gt; {e.degree} | {e.school} | {e.date}
            </p>
          ))}
        </CodeSection>
      )}
    </div>
  )
}

// ─── Template 4: Executive ────────────────────────────────────────────────────
function ExecutiveTemplate({ personal, skills, projects, experience, education, showSections, photo }: TemplateProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#222' }}>
      {/* Dark header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          padding: '40px 48px',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
        }}
      >
        {photo && (
          <img src={photo} alt="Profile" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid #4f8ef7', flexShrink: 0 }} />
        )}
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: '0.03em' }}>{personal.name.toUpperCase()}</h1>
          <p style={{ fontSize: 14, color: '#4f8ef7', margin: '8px 0 16px' }}>{personal.role}</p>
          <div style={{ display: 'flex', gap: 24, fontSize: 11, color: '#aaa', flexWrap: 'wrap' }}>
            <span>{personal.email}</span>
            <span>{personal.location}</span>
            <span>{personal.portfolio}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 48px 40px' }}>
        {showSections.summary && (
          <ExecSection title="Executive Summary">
            <p style={{ lineHeight: 1.8, color: '#444', fontSize: 13 }}>{personal.summary}</p>
          </ExecSection>
        )}
        {showSections.experience && (
          <ExecSection title="Professional Experience">
            {experience.map((e, i) => (
              <div
                key={i}
                style={{
                  paddingLeft: 16,
                  borderLeft: '3px solid #4f8ef7',
                  marginBottom: 20,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 14 }}>{e.role}</strong>
                  <span style={{ color: '#888', fontSize: 11 }}>{e.date}</span>
                </div>
                <p style={{ color: '#4f8ef7', margin: '2px 0 6px', fontSize: 12 }}>{e.company}</p>
                <p style={{ color: '#555', lineHeight: 1.7 }}>{e.desc}</p>
              </div>
            ))}
          </ExecSection>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {showSections.skills && (
            <ExecSection title="Core Competencies">
              {skills.map((s) => (
                <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span>{s.name}</span>
                  <span style={{ color: s.color, fontWeight: 700 }}>{s.level}%</span>
                </div>
              ))}
            </ExecSection>
          )}
          <div>
            {showSections.projects && (
              <ExecSection title="Key Projects">
                {projects.filter((p) => p.featured).slice(0, 3).map((p) => (
                  <div key={p.id} style={{ marginBottom: 12 }}>
                    <strong style={{ color: p.color }}>{p.name}</strong>
                    <p style={{ color: '#555', margin: '2px 0', lineHeight: 1.5 }}>{p.shortDesc}</p>
                  </div>
                ))}
              </ExecSection>
            )}
            {showSections.education && (
              <ExecSection title="Education">
                {education.map((e, i) => (
                  <div key={i}>
                    <strong>{e.degree}</strong>
                    <p style={{ color: '#555' }}>{e.school}</p>
                    <p style={{ color: '#888', fontSize: 11 }}>{e.date}</p>
                  </div>
                ))}
              </ExecSection>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helper section components ────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: '#111',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          borderBottom: '2px solid #4f8ef7',
          paddingBottom: 4,
          marginBottom: 14,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

function MinSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: '#888',
          borderBottom: '1px solid #ddd',
          paddingBottom: 4,
          marginBottom: 12,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

function CodeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ color: '#0057ff', margin: '0 0 8px', fontSize: 11 }}>
        {'/* '}{title.toUpperCase()}{' */'}
      </p>
      {children}
    </div>
  )
}

function ExecSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: '#888',
          marginBottom: 12,
          paddingBottom: 6,
          borderBottom: '1px solid #eee',
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}
