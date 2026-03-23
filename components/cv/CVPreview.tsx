'use client'

import { useState } from 'react'
import { CVData, CVTemplate } from '@/app/cv/page'
import { MdEmail, MdPhone, MdLocationOn, MdLanguage, MdPerson, MdWork, MdSchool, MdCode, MdBuild } from 'react-icons/md'

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
      if (!element) return
      // A4 at 96dpi = 794 × 1122px. Clamp canvas capture to exactly one A4 page
      // so html2pdf never overflows into a second blank page.
      const A4_H = 1122
      await html2pdf()
        .set({
          margin: 0,
          filename: `Mahmud-CV-${selectedTemplate}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            height: A4_H,
            windowHeight: A4_H,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save()
    } finally {
      setIsGenerating(false)
    }
  }

  const { personal, skills, projects, experience, education, showSections, photo } = cvData
  const activeSkills = skills.filter((s: any) => s.included !== false)

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
        <div id="cv-preview-content" style={{ width: '100%' }}>
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
          {selectedTemplate === 'sidebar-light' && (
            <SidebarLightTemplate personal={personal} skills={activeSkills} projects={projects} experience={experience} education={education} showSections={showSections} photo={photo} />
          )}
          {selectedTemplate === 'timeline' && (
            <TimelineTemplate personal={personal} skills={activeSkills} projects={projects} experience={experience} education={education} showSections={showSections} photo={photo} />
          )}
          {selectedTemplate === 'bold-header' && (
            <BoldHeaderTemplate personal={personal} skills={activeSkills} projects={projects} experience={experience} education={education} showSections={showSections} photo={photo} />
          )}
          {selectedTemplate === 'creative-panel' && (
            <CreativePanelTemplate personal={personal} skills={activeSkills} projects={projects} experience={experience} education={education} showSections={showSections} photo={photo} />
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
  // Syntax highlight colors (VSCode Dark+ palette)
  const c = {
    bg:       '#0d1117',
    sidebar:  '#161b22',
    line:     '#21262d',
    blue:     '#79c0ff',
    green:    '#a5d6a7',
    orange:   '#ffa657',
    purple:   '#d2a8ff',
    red:      '#ff7b72',
    gray:     '#8b949e',
    white:    '#e6edf3',
    dimWhite: '#c9d1d9',
    string:   '#a5d6a7',
    num:      '#79c0ff',
  }

  let lineNum = 1
  const ln = () => (
    <span style={{ color: c.gray, userSelect: 'none', minWidth: 28, display: 'inline-block', textAlign: 'right', marginRight: 20, opacity: 0.5 }}>
      {lineNum++}
    </span>
  )

  const key = (k: string) => <span style={{ color: c.blue }}>"{k}"</span>
  const str = (v: string) => <span style={{ color: c.string }}>"{v}"</span>
  const num = (v: number) => <span style={{ color: c.num }}>{v}</span>
  const sym = (s: string) => <span style={{ color: c.gray }}>{s}</span>
  const kw  = (s: string) => <span style={{ color: c.purple }}>{s}</span>

  const Line = ({ children, indent = 0 }: { children: React.ReactNode; indent?: number }) => (
    <div style={{ display: 'flex', lineHeight: '22px', paddingLeft: indent * 16 }}>
      {ln()}
      <span>{children}</span>
    </div>
  )

  return (
    <div style={{ fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace', fontSize: 11.5, color: c.dimWhite, background: c.bg }}>

      {/* Editor chrome — window bar */}
      <div style={{ background: c.sidebar, borderBottom: `1px solid ${c.line}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
        </div>
        <span style={{ color: c.gray, fontSize: 11 }}>profile.json — CV Builder</span>
      </div>

      {/* Tab bar */}
      <div style={{ background: c.sidebar, borderBottom: `1px solid ${c.line}`, display: 'flex' }}>
        <div style={{ padding: '6px 20px', fontSize: 11, color: c.white, borderBottom: `2px solid #388bfd`, borderRight: `1px solid ${c.line}` }}>
          📄 profile.json
        </div>
        <div style={{ padding: '6px 20px', fontSize: 11, color: c.gray, borderRight: `1px solid ${c.line}` }}>
          📄 experience.json
        </div>
      </div>

      <div style={{ display: 'flex' }}>

        {/* File explorer sidebar */}
        <div style={{ width: 180, background: c.sidebar, borderRight: `1px solid ${c.line}`, padding: '16px 0', fontSize: 11, minHeight: 1000 }}>
          <p style={{ color: c.gray, padding: '0 16px', marginBottom: 10, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Explorer</p>
          <div style={{ color: c.gray, padding: '3px 16px', fontSize: 10 }}>▾ CV_BUILDER</div>
          {['profile.json','experience.json','skills.json','projects.json','education.json'].map((f) => (
            <div key={f} style={{ padding: '3px 28px', color: f === 'profile.json' ? c.white : c.gray, fontSize: 11, cursor: 'default' }}>
              {f === 'profile.json' ? '📄' : '  '} {f}
            </div>
          ))}

          {/* Photo if available */}
          {photo && (
            <div style={{ padding: '16px', marginTop: 16, borderTop: `1px solid ${c.line}` }}>
              <img src={photo} alt="Profile" style={{ width: 80, height: 80, borderRadius: 6, objectFit: 'cover', border: `2px solid #388bfd`, display: 'block', margin: '0 auto' }} />
              <p style={{ color: c.gray, fontSize: 9, textAlign: 'center', marginTop: 6 }}>avatar.jpg</p>
            </div>
          )}
        </div>

        {/* Code editor */}
        <div style={{ flex: 1, padding: '16px 0', overflowX: 'hidden' }}>
          <Line>{sym('{')}</Line>
          <Line indent={1}>{key('name')}{sym(': ')}{str(personal.name)}{sym(',')}</Line>
          <Line indent={1}>{key('role')}{sym(': ')}{str(personal.role)}{sym(',')}</Line>
          <Line indent={1}>{key('email')}{sym(': ')}{str(personal.email)}{sym(',')}</Line>
          <Line indent={1}>{key('location')}{sym(': ')}{str(personal.location)}{sym(',')}</Line>
          {personal.portfolio && <Line indent={1}>{key('portfolio')}{sym(': ')}{str(personal.portfolio)}{sym(',')}</Line>}
          <Line>&nbsp;</Line>

          {showSections.summary && (
            <>
              <Line indent={1}>{sym('// ')}<span style={{ color: c.gray, fontStyle: 'italic' }}>Career Summary</span></Line>
              <Line indent={1}>{key('summary')}{sym(': ')}<span style={{ color: c.string }}>"{personal.summary.slice(0, 80)}…"</span>{sym(',')}</Line>
              <Line>&nbsp;</Line>
            </>
          )}

          {showSections.skills && skills.length > 0 && (
            <>
              <Line indent={1}>{key('skills')}{sym(': [')}</Line>
              {skills.map((s, i) => (
                <Line key={s.name} indent={2}>
                  {sym('{ ')}{key('name')}{sym(': ')}{str(s.name)}{sym(', ')}{key('level')}{sym(': ')}{num(s.level)}{sym(i < skills.length - 1 ? ' },' : ' }')}
                </Line>
              ))}
              <Line indent={1}>{sym('],')} </Line>
              <Line>&nbsp;</Line>
            </>
          )}

          {showSections.experience && (
            <>
              <Line indent={1}>{key('experience')}{sym(': [')}</Line>
              {experience.map((e, i) => (
                <div key={i}>
                  <Line indent={2}>{sym('{')}</Line>
                  <Line indent={3}>{key('role')}{sym(': ')}{str(e.role)}{sym(',')}</Line>
                  <Line indent={3}>{key('company')}{sym(': ')}{str(e.company)}{sym(',')}</Line>
                  <Line indent={3}>{key('date')}{sym(': ')}{str(e.date)}{sym(',')}</Line>
                  <Line indent={3}>{key('desc')}{sym(': ')}<span style={{ color: c.string }}>"{e.desc.slice(0, 60)}…"</span></Line>
                  <Line indent={2}>{sym(i < experience.length - 1 ? '},' : '}')}</Line>
                </div>
              ))}
              <Line indent={1}>{sym('],')} </Line>
              <Line>&nbsp;</Line>
            </>
          )}

          {showSections.projects && (
            <>
              <Line indent={1}>{key('projects')}{sym(': [')}</Line>
              {projects.filter((p) => p.featured).map((p, i, arr) => (
                <div key={p.id}>
                  <Line indent={2}>{sym('{')}</Line>
                  <Line indent={3}>{key('name')}{sym(': ')}{str(p.name)}{sym(',')}</Line>
                  <Line indent={3}>{key('category')}{sym(': ')}{str(p.category)}{sym(',')}</Line>
                  <Line indent={3}>{key('tech')}{sym(': [')}{p.tech.map((t, j) => <span key={t}><span style={{ color: c.string }}>"{t}"</span>{j < p.tech.length - 1 ? <span style={{ color: c.gray }}>, </span> : null}</span>)}{sym(']')}</Line>
                  <Line indent={2}>{sym(i < arr.length - 1 ? '},' : '}')}</Line>
                </div>
              ))}
              <Line indent={1}>{sym('],')} </Line>
              <Line>&nbsp;</Line>
            </>
          )}

          {showSections.education && (
            <>
              <Line indent={1}>{key('education')}{sym(': [')}</Line>
              {education.map((e, i) => (
                <div key={i}>
                  <Line indent={2}>{sym('{')}</Line>
                  <Line indent={3}>{key('degree')}{sym(': ')}{str(e.degree)}{sym(',')}</Line>
                  <Line indent={3}>{key('school')}{sym(': ')}{str(e.school)}{sym(',')}</Line>
                  <Line indent={3}>{key('date')}{sym(': ')}{str(e.date)}</Line>
                  <Line indent={2}>{sym(i < education.length - 1 ? '},' : '}')}</Line>
                </div>
              ))}
              <Line indent={1}>{sym(']')}</Line>
            </>
          )}

          <Line>{sym('}')}</Line>
        </div>
      </div>

      {/* Status bar */}
      <div style={{ background: '#388bfd', padding: '3px 16px', display: 'flex', gap: 20, fontSize: 10, color: '#fff', position: 'sticky', bottom: 0 }}>
        <span>⎇ main</span>
        <span>JSON</span>
        <span>UTF-8</span>
        <span style={{ marginLeft: 'auto' }}>Ln {lineNum}, Col 1</span>
      </div>
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

// ─── Template 5: Sidebar Light ────────────────────────────────────────────────
function SidebarLightTemplate({ personal, skills, projects, experience, education, showSections, photo }: TemplateProps) {
  const sidebarBg = '#dce8f0'
  const accentBg  = '#b0cfe0'

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#2a2a2a', background: '#fff', display: 'flex' }}>

      {/* Left sidebar */}
      <div style={{ width: 230, background: sidebarBg, padding: '32px 20px 32px', display: 'flex', flexDirection: 'column', gap: 24, flexShrink: 0 }}>

        {/* Contact */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', borderBottom: '1px solid #b0c4d0', paddingBottom: 6, marginBottom: 10 }}>Contact</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#444', display: 'flex', alignItems: 'center', gap: 5 }}><MdPhone size={13} /> {personal.phone || personal.email}</span>
            <span style={{ fontSize: 11, color: '#444', display: 'flex', alignItems: 'center', gap: 5 }}><MdEmail size={13} /> {personal.email}</span>
            <span style={{ fontSize: 11, color: '#444', display: 'flex', alignItems: 'center', gap: 5 }}><MdLocationOn size={13} /> {personal.location}</span>
          </div>
        </div>

        {/* Education */}
        {showSections.education && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', borderBottom: '1px solid #b0c4d0', paddingBottom: 6, marginBottom: 10 }}>Education</p>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 12 }}>{e.degree}</strong>
                <p style={{ fontSize: 11, color: '#555', margin: '2px 0' }}>{e.school}</p>
                <p style={{ fontSize: 10, color: '#888' }}>{e.date}</p>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {showSections.skills && skills.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#555', borderBottom: '1px solid #b0c4d0', paddingBottom: 6, marginBottom: 10 }}>Skills</p>
            {skills.map((s) => (
              <p key={s.name} style={{ fontSize: 11, color: '#444', marginBottom: 4 }}>• {s.name}</p>
            ))}
          </div>
        )}
      </div>

      {/* Right main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header banner */}
        <div style={{ background: accentBg, padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 20, minHeight: 110 }}>
          {photo && (
            <img
              src={photo}
              alt="Profile"
              style={{
                width: 86,
                height: 86,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #fff',
                flexShrink: 0,
              }}
            />
          )}
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: '0.04em', color: '#1a2e3a' }}>{personal.name.toUpperCase()}</h1>
            <p style={{ fontSize: 13, color: '#3a6070', margin: '6px 0 0', fontWeight: 500 }}>{personal.role}</p>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '28px 32px', flex: 1 }}>

          {showSections.summary && (
            <LightSection title="About Me">
              <p style={{ lineHeight: 1.8, color: '#444' }}>{personal.summary}</p>
            </LightSection>
          )}

          {showSections.experience && (
            <LightSection title="Work Experience">
              {experience.map((e, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: 13 }}>{e.role}</strong>
                    <span style={{ fontSize: 10, color: '#888' }}>{e.date}</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#5a8090', margin: '2px 0 6px' }}>{e.company}</p>
                  <p style={{ color: '#555', lineHeight: 1.7 }}>{e.desc}</p>
                </div>
              ))}
            </LightSection>
          )}

          {showSections.projects && (
            <LightSection title="Projects">
              {projects.filter((p) => p.featured).map((p) => (
                <div key={p.id} style={{ marginBottom: 14 }}>
                  <strong>{p.name}</strong>
                  <p style={{ color: '#555', margin: '3px 0', lineHeight: 1.6 }}>{p.shortDesc}</p>
                  <p style={{ fontSize: 10, color: '#999', fontFamily: 'monospace' }}>{p.tech.join(' · ')}</p>
                </div>
              ))}
            </LightSection>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Template 6: Timeline ─────────────────────────────────────────────────────
function TimelineTemplate({ personal, skills, projects, experience, education, showSections, photo }: TemplateProps) {
  return (
    <div style={{ fontFamily: '"Georgia", serif', fontSize: 12, color: '#1a1a1a', background: '#fff', padding: '36px 0' }}>

      {/* Top name block */}
      <div style={{ padding: '0 32px 24px', borderBottom: '2px solid #1a1a1a', marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, fontFamily: 'sans-serif', margin: 0, letterSpacing: '0.02em' }}>{personal.name.toUpperCase()}</h1>
        <p style={{ fontSize: 13, color: '#666', fontFamily: 'sans-serif', margin: '4px 0 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{personal.role}</p>
      </div>

      <div style={{ display: 'flex', gap: 0 }}>

        {/* Left sidebar */}
        <div style={{ width: 210, padding: '0 24px 32px 32px', flexShrink: 0, borderRight: '1px solid #e0e0e0' }}>

          {photo && (
            <img src={photo} alt="Profile" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 20px' }} />
          )}

          {/* Contact */}
          <div style={{ marginBottom: 22 }}>
            <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: '1.5px solid #1a1a1a', paddingBottom: 4, marginBottom: 10 }}>Contact</p>
            <p style={{ fontSize: 11, color: '#555', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}><MdPhone size={13} /> {personal.phone || personal.email}</p>
            <p style={{ fontSize: 11, color: '#555', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}><MdEmail size={13} /> {personal.email}</p>
            <p style={{ fontSize: 11, color: '#555', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}><MdLocationOn size={13} /> {personal.location}</p>
            <p style={{ fontSize: 11, color: '#555', display: 'flex', alignItems: 'center', gap: 5 }}><MdLanguage size={13} /> {personal.portfolio}</p>
          </div>

          {/* Skills */}
          {showSections.skills && skills.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: '1.5px solid #1a1a1a', paddingBottom: 4, marginBottom: 10 }}>Skills</p>
              {skills.map((s) => (
                <p key={s.name} style={{ fontSize: 11, color: '#444', marginBottom: 4 }}>• {s.name}</p>
              ))}
            </div>
          )}

          {/* Education */}
          {showSections.education && (
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', borderBottom: '1.5px solid #1a1a1a', paddingBottom: 4, marginBottom: 10 }}>Education</p>
              {education.map((e, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <strong style={{ fontSize: 11, fontFamily: 'sans-serif' }}>{e.degree}</strong>
                  <p style={{ fontSize: 10, color: '#666', margin: '2px 0' }}>{e.school}</p>
                  <p style={{ fontSize: 10, color: '#999' }}>{e.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right main — timeline */}
        <div style={{ flex: 1, padding: '0 32px 32px 28px' }}>

          {showSections.summary && (
            <TimelineSection title="Profile" icon={<MdPerson size={14} color="#fff" />}>
              <p style={{ lineHeight: 1.8, color: '#444', fontSize: 12 }}>{personal.summary}</p>
            </TimelineSection>
          )}

          {showSections.experience && (
            <TimelineSection title="Work Experience" icon={<MdWork size={14} color="#fff" />}>
              {experience.map((e, i) => (
                <div key={i} style={{ marginBottom: 20, paddingLeft: 16, position: 'relative' }}>
                  {/* Timeline dot */}
                  <div style={{ position: 'absolute', left: -20, top: 4, width: 8, height: 8, borderRadius: '50%', border: '2px solid #1a1a1a', background: '#fff' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ fontFamily: 'sans-serif', fontSize: 12 }}>{e.company}</strong>
                    <span style={{ fontSize: 10, color: '#888', fontFamily: 'sans-serif' }}>{e.date}</span>
                  </div>
                  <p style={{ fontSize: 12, fontFamily: 'sans-serif', color: '#444', margin: '2px 0 6px', fontStyle: 'italic' }}>{e.role}</p>
                  <p style={{ color: '#555', lineHeight: 1.7, fontSize: 11 }}>{e.desc}</p>
                </div>
              ))}
            </TimelineSection>
          )}

          {showSections.projects && (
            <TimelineSection title="Projects" icon={<MdCode size={14} color="#fff" />}>
              {projects.filter((p) => p.featured).map((p, i) => (
                <div key={p.id} style={{ marginBottom: 16, paddingLeft: 16, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -20, top: 4, width: 8, height: 8, borderRadius: '50%', border: '2px solid #1a1a1a', background: '#fff' }} />
                  <strong style={{ fontFamily: 'sans-serif', fontSize: 12 }}>{p.name}</strong>
                  <p style={{ color: '#555', lineHeight: 1.6, margin: '3px 0 4px', fontSize: 11 }}>{p.shortDesc}</p>
                  <p style={{ fontSize: 10, color: '#999', fontFamily: 'monospace' }}>{p.tech.join(' · ')}</p>
                </div>
              ))}
            </TimelineSection>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Template 7: Bold Header ──────────────────────────────────────────────────
function BoldHeaderTemplate({ personal, skills, projects, experience, education, showSections, photo }: TemplateProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#222', background: '#fff' }}>

      {/* Dark header banner */}
      <div style={{ background: '#1c2b3a', position: 'relative', padding: '32px 40px 32px 180px', minHeight: 120 }}>
        {/* Overlapping round photo */}
        {photo && (
          <img
            src={photo}
            alt="Profile"
            style={{
              position: 'absolute',
              left: 40,
              top: 20,
              width: 110,
              height: 110,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid #fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          />
        )}
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {personal.name}
        </h1>
        <p style={{ fontSize: 13, color: '#7eb8d4', margin: '0 0 14px', fontWeight: 600 }}>{personal.role}</p>
        <div style={{ display: 'flex', gap: 20, fontSize: 11, color: '#aac4d4', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MdEmail size={13} /> {personal.email}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MdLocationOn size={13} /> {personal.location}</span>
          {personal.portfolio && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MdLanguage size={13} /> {personal.portfolio}</span>}
        </div>
      </div>

      {/* Thin accent strip */}
      <div style={{ height: 4, background: 'linear-gradient(90deg, #2980b9, #6dd5fa)' }} />

      {/* Body — two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 0 }}>

        {/* Left column */}
        <div style={{ padding: '28px 24px', borderRight: '1px solid #eee' }}>

          {showSections.skills && skills.length > 0 && (
            <BoldSection title="Skills" color="#2980b9">
              {skills.map((s) => (
                <div key={s.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    <span style={{ color: '#999' }}>{s.level}%</span>
                  </div>
                  <div style={{ height: 4, background: '#e8e8e8', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${s.level}%`, background: `linear-gradient(90deg, #2980b9, #6dd5fa)`, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </BoldSection>
          )}

          {showSections.education && (
            <BoldSection title="Education" color="#2980b9">
              {education.map((e, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <strong style={{ fontSize: 12 }}>{e.degree}</strong>
                  <p style={{ color: '#2980b9', fontSize: 11, margin: '2px 0' }}>{e.school}</p>
                  <p style={{ color: '#999', fontSize: 10 }}>{e.date}</p>
                </div>
              ))}
            </BoldSection>
          )}
        </div>

        {/* Right column */}
        <div style={{ padding: '28px 28px' }}>

          {showSections.summary && (
            <BoldSection title="Profile" color="#2980b9">
              <p style={{ lineHeight: 1.8, color: '#444' }}>{personal.summary}</p>
            </BoldSection>
          )}

          {showSections.experience && (
            <BoldSection title="Work Experience" color="#2980b9">
              {experience.map((e, i) => (
                <div key={i} style={{ marginBottom: 18, paddingLeft: 12, borderLeft: '3px solid #e8f4fb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong style={{ fontSize: 13 }}>{e.role}</strong>
                    <span style={{ fontSize: 10, color: '#999', whiteSpace: 'nowrap' }}>{e.date}</span>
                  </div>
                  <p style={{ color: '#2980b9', fontSize: 11, margin: '2px 0 6px', fontWeight: 600 }}>{e.company}</p>
                  <p style={{ color: '#555', lineHeight: 1.7 }}>{e.desc}</p>
                </div>
              ))}
            </BoldSection>
          )}

          {showSections.projects && (
            <BoldSection title="Projects" color="#2980b9">
              {projects.filter((p) => p.featured).map((p) => (
                <div key={p.id} style={{ marginBottom: 14, paddingLeft: 12, borderLeft: '3px solid #e8f4fb' }}>
                  <strong style={{ fontSize: 12 }}>{p.name}</strong>
                  <span style={{ marginLeft: 8, fontSize: 10, color: p.color, background: p.color + '18', padding: '1px 6px', borderRadius: 3 }}>{p.category}</span>
                  <p style={{ color: '#555', margin: '4px 0', lineHeight: 1.5 }}>{p.shortDesc}</p>
                  <p style={{ fontSize: 10, color: '#999', fontFamily: 'monospace' }}>{p.tech.join(' · ')}</p>
                </div>
              ))}
            </BoldSection>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Template 8: Creative Panel ───────────────────────────────────────────────
function CreativePanelTemplate({ personal, skills, projects, experience, education, showSections, photo }: TemplateProps) {
  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 12, color: '#222', background: '#fff', display: 'flex' }}>

      {/* Dark left panel */}
      <div style={{ width: 250, background: '#1a1f2e', color: '#e0e6f0', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 28, flexShrink: 0 }}>

        {/* Photo + name */}
        <div style={{ textAlign: 'center' }}>
          {photo ? (
            <img src={photo} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid #4a90d9', display: 'block', margin: '0 auto 16px' }} />
          ) : (
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#2a3248', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#4a90d9' }}>
              {personal.name.charAt(0)}
            </div>
          )}
          <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 6px', lineHeight: 1.2 }}>{personal.name}</h2>
          <p style={{ fontSize: 11, color: '#4a90d9', fontWeight: 600, margin: 0 }}>{personal.role}</p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />

        {/* Contact */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4a90d9', marginBottom: 12 }}>Contact</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#c0cce0', display: 'flex', alignItems: 'center', gap: 5 }}><MdEmail size={13} /> {personal.email}</span>
            <span style={{ fontSize: 11, color: '#c0cce0', display: 'flex', alignItems: 'center', gap: 5 }}><MdLocationOn size={13} /> {personal.location}</span>
            {personal.portfolio && <span style={{ fontSize: 11, color: '#c0cce0', display: 'flex', alignItems: 'center', gap: 5 }}><MdLanguage size={13} /> {personal.portfolio}</span>}
          </div>
        </div>

        {/* Skills */}
        {showSections.skills && skills.length > 0 && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4a90d9', marginBottom: 12 }}>Skills</p>
            {skills.map((s) => (
              <div key={s.name} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#c0cce0', marginBottom: 3 }}>
                  <span>{s.name}</span>
                  <span style={{ color: '#7aa8d4' }}>{s.level}%</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${s.level}%`, background: '#4a90d9', borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {showSections.education && (
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4a90d9', marginBottom: 12 }}>Education</p>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <strong style={{ fontSize: 11, color: '#fff' }}>{e.degree}</strong>
                <p style={{ fontSize: 10, color: '#8aa8c8', margin: '2px 0' }}>{e.school}</p>
                <p style={{ fontSize: 10, color: '#607080' }}>{e.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right white content */}
      <div style={{ flex: 1, padding: '40px 32px' }}>

        {showSections.summary && (
          <PanelSection title="About Me">
            <p style={{ lineHeight: 1.9, color: '#444' }}>{personal.summary}</p>
          </PanelSection>
        )}

        {showSections.experience && (
          <PanelSection title="Work Experience">
            {experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: i < experience.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: 13, color: '#1a1f2e' }}>{e.role}</strong>
                    <p style={{ color: '#4a90d9', fontSize: 11, margin: '3px 0', fontWeight: 600 }}>{e.company}</p>
                  </div>
                  <span style={{ fontSize: 10, color: '#fff', background: '#1a1f2e', padding: '3px 10px', borderRadius: 20, whiteSpace: 'nowrap', marginLeft: 12 }}>{e.date}</span>
                </div>
                <p style={{ color: '#555', lineHeight: 1.7, marginTop: 6 }}>{e.desc}</p>
              </div>
            ))}
          </PanelSection>
        )}

        {showSections.projects && (
          <PanelSection title="Projects">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {projects.filter((p) => p.featured).map((p) => (
                <div key={p.id} style={{ background: '#f8f9fc', borderRadius: 8, padding: '12px 14px', borderTop: `3px solid ${p.color}` }}>
                  <strong style={{ fontSize: 12 }}>{p.name}</strong>
                  <p style={{ color: '#666', margin: '4px 0 6px', lineHeight: 1.5, fontSize: 11 }}>{p.shortDesc}</p>
                  <p style={{ fontSize: 10, color: '#999', fontFamily: 'monospace' }}>{p.tech.join(', ')}</p>
                </div>
              ))}
            </div>
          </PanelSection>
        )}
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

function LightSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a2e3a', borderBottom: '1.5px solid #b0cfe0', paddingBottom: 5, marginBottom: 14 }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function TimelineSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
          {icon}
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 800, fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{title}</h2>
      </div>
      <div style={{ paddingLeft: 20, borderLeft: '1.5px solid #d0d0d0', marginLeft: 12 }}>
        {children}
      </div>
    </div>
  )
}

function BoldSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color, borderBottom: `2px solid ${color}`, paddingBottom: 5, marginBottom: 14 }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 4, height: 20, background: '#4a90d9', borderRadius: 2 }} />
        <h2 style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1a1f2e', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}
