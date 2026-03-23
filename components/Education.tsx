'use client'
import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const educationData = [
  {
    year: '25',
    range: '2025',
    title: 'Complete Web Development — 6 Month Bootcamp',
    school: 'Programming Hero · Batch WEB12',
    tag: 'Bootcamp',
    tagColor: '#4f8ef7',
    color: 'blue',
  },
  {
    year: '24',
    range: '2024',
    title: 'UI/UX Graduation Program — 6 Month Course',
    school: 'Ostad',
    tag: 'Design',
    tagColor: '#a855f7',
    color: 'purple',
  },
  {
    year: '23',
    range: '2022 — 2023',
    title: 'Master of Business Administration (MBA)',
    school: 'Shamsur Rahman College, Gosairhat, Shariatpur',
    tag: 'Academic',
    tagColor: null,
    color: 'gray',
  },
  {
    year: '20',
    range: '2015 — 2020',
    title: 'Bachelor of Business Administration (BBA)',
    school: 'National University, Bangladesh',
    tag: 'Academic',
    tagColor: null,
    color: 'gray',
  },
]

// ── Helper components ──────────────────────────────────────────
function Line({ children, indent = 0 }: { children: React.ReactNode; indent?: number }) {
  return (
    <div style={{ paddingLeft: `${indent * 14}px` }}>
      {children}
    </div>
  )
}
function Key({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#4f8ef7' }}>"{children}"</span>
}
function Colon() {
  return <span style={{ color: 'rgba(255,255,255,0.35)' }}>: </span>
}
function Comma() {
  return <span style={{ color: 'rgba(255,255,255,0.25)' }}>,</span>
}
function Str({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#a855f7' }}>"{children}"</span>
}
function Num({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#34d399' }}>{children}</span>
}
function Bool({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#f59e0b' }}>{children}</span>
}
function Tag({ children }: { children: React.ReactNode }) {
  return <span style={{ color: '#ff2d78' }}>"{children}"</span>
}
function Cursor() {
  return (
    <span style={{
      display: 'inline-block', width: '8px', height: '15px',
      background: '#4f8ef7', verticalAlign: 'text-bottom',
      animation: 'cursorBlink 0.8s step-end infinite',
    }} />
  )
}

// ── Year column helpers ────────────────────────────────────────
function getYearGradient(color: string) {
  if (color === 'blue') return 'linear-gradient(135deg, #4f8ef7, #a855f7)'
  if (color === 'purple') return 'linear-gradient(135deg, #a855f7, #ec4899)'
  return 'none'
}
function getDotColor(color: string) {
  if (color === 'blue') return '#4f8ef7'
  if (color === 'purple') return '#a855f7'
  return 'rgba(255,255,255,0.18)'
}
function getTagStyle(tagColor: string | null): React.CSSProperties {
  if (tagColor) {
    const hex = tagColor.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return {
      background: `rgba(${r},${g},${b},0.12)`,
      border: `1px solid rgba(${r},${g},${b},0.25)`,
      color: tagColor,
    }
  }
  return {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.35)',
  }
}

// ── Main component ─────────────────────────────────────────────
export default function Education() {
  const sectionRef  = useRef<HTMLElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const isInView    = useInView(sectionRef,  { once: true, margin: '-80px' })
  const termInView  = useInView(terminalRef, { once: true, margin: '-60px' })

  const TOTAL_LINES = 20
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (!termInView) return
    let count = 0
    const interval = setInterval(() => {
      count++
      setVisibleLines(count)
      if (count >= TOTAL_LINES) clearInterval(interval)
    }, 60)
    return () => clearInterval(interval)
  }, [termInView])

  const show = (n: number) => ({ opacity: visibleLines >= n ? 1 : 0, transition: 'opacity 0.15s' })

  return (
    <section
      ref={sectionRef}
      id="education"
      style={{ padding: '100px 0', background: '#050508' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '48px' }}
        >
          <div style={{ fontSize: '11px', color: '#4f8ef7', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'var(--font-dm-sans)' }}>
            // Academic Background
          </div>
          <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#e2e2f0', margin: 0, letterSpacing: '0.02em' }}>
            EDUCATION
          </h2>
        </motion.div>

        {/* Two-column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
          gap: '48px',
          alignItems: 'start',
        }}>

          {/* ── Left: Year timeline ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'clamp(64px, 10vw, 88px) 1fr', gap: 0 }}>

            {/* Year numbers */}
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '20px' }}>
              {educationData.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  style={{ marginBottom: i < educationData.length - 1 ? '40px' : 0, position: 'relative' }}
                >
                  <div style={{
                    fontSize: 'clamp(26px, 5vw, 36px)', fontWeight: '800', lineHeight: 1, marginBottom: '4px',
                    background: getYearGradient(item.color),
                    WebkitBackgroundClip: item.color !== 'gray' ? 'text' : 'unset',
                    WebkitTextFillColor: item.color !== 'gray' ? 'transparent' : 'unset',
                    color: item.color === 'gray' ? 'rgba(255,255,255,0.18)' : 'transparent',
                  }}>
                    {item.year}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '.05em', fontWeight: '500', fontFamily: 'var(--font-dm-sans)' }}>
                    {item.range}
                  </div>
                  <div style={{
                    position: 'absolute', right: '-26px', top: '12px',
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: getDotColor(item.color), border: '2px solid #050508',
                    boxShadow: item.color !== 'gray' ? `0 0 0 3px ${getDotColor(item.color)}33` : 'none',
                    zIndex: 1,
                  }} />
                </motion.div>
              ))}
            </div>

            {/* Content */}
            <div style={{ paddingLeft: '28px' }}>
              {educationData.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.1 + 0.05 }}
                  style={{ marginBottom: i < educationData.length - 1 ? '40px' : 0, paddingTop: '4px' }}
                >
                  <div style={{ fontSize: 'clamp(13px, 2vw, 15px)', fontWeight: '600', color: '#e2e2f0', lineHeight: '1.4', marginBottom: '5px', fontFamily: 'var(--font-dm-sans)' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '8px', fontFamily: 'var(--font-dm-sans)' }}>
                    {item.school}
                  </div>
                  <span style={{
                    display: 'inline-block', fontSize: '10px', fontWeight: '600',
                    padding: '3px 10px', borderRadius: '20px', letterSpacing: '.04em',
                    fontFamily: 'var(--font-dm-sans)', ...getTagStyle(item.tagColor),
                  }}>
                    {item.tag}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ── Right: Terminal ── */}
          <motion.div
            ref={terminalRef}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div style={{
              background: '#0a0a12',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              overflow: 'hidden',
              fontFamily: "'Courier New', 'Fira Code', monospace",
            }}>
              {/* Title bar */}
              <div style={{
                background: '#13131f', padding: '8px 14px',
                display: 'flex', alignItems: 'center', gap: '6px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                {['#ff5f57', '#ffbd2e', '#28c840'].map((c, i) => (
                  <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
                ))}
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginLeft: '6px', letterSpacing: '.04em' }}>
                  mahmud@portfolio ~ education.json
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '14px 16px', fontSize: '12px', lineHeight: '1.75' }}>

                {/* Prompt */}
                <div style={{ ...show(1), display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ color: '#34d399', flexShrink: 0 }}>$</span>
                  <span style={{ color: '#e2e2f0' }}>cat education.json</span>
                </div>

                <div style={{ ...show(2), color: 'rgba(255,255,255,0.4)' }}>{'{'}</div>

                <div style={show(3)}><Line indent={1}><Key>developer</Key><Colon /><Str>Md. Abdulla Al Mahmud</Str><Comma /></Line></div>

                <div style={show(4)}><Line indent={1}><Key>qualifications</Key><Colon /><span style={{ color: 'rgba(255,255,255,0.4)' }}>[</span></Line></div>

                <div style={show(5)}><Line indent={2}><span style={{ color: 'rgba(255,255,255,0.4)' }}>{'{'}</span></Line></div>
                <div style={show(6)}><Line indent={3}><Key>year</Key><Colon /><Num>2025</Num><Comma /></Line></div>
                <div style={show(7)}><Line indent={3}><Key>title</Key><Colon /><Str>Web Dev Bootcamp</Str><Comma /></Line></div>
                <div style={show(8)}><Line indent={3}><Key>school</Key><Colon /><Str>Programming Hero</Str><Comma /></Line></div>
                <div style={show(9)}><Line indent={3}><Key>tag</Key><Colon /><Tag>Bootcamp</Tag></Line></div>
                <div style={show(10)}><Line indent={2}><span style={{ color: 'rgba(255,255,255,0.4)' }}>{'}'}</span><Comma /></Line></div>

                <div style={show(11)}><Line indent={2}><span style={{ color: 'rgba(255,255,255,0.4)' }}>{'{'}</span></Line></div>
                <div style={show(12)}><Line indent={3}><Key>year</Key><Colon /><Num>2024</Num><Comma /></Line></div>
                <div style={show(13)}><Line indent={3}><Key>title</Key><Colon /><Str>UI/UX Program</Str><Comma /></Line></div>
                <div style={show(14)}><Line indent={3}><Key>school</Key><Colon /><Str>Ostad</Str><Comma /></Line></div>
                <div style={show(15)}><Line indent={3}><Key>tag</Key><Colon /><Tag>Design</Tag></Line></div>
                <div style={show(16)}><Line indent={2}><span style={{ color: 'rgba(255,255,255,0.4)' }}>{'}'}</span></Line></div>

                <div style={show(17)}><Line indent={1}><span style={{ color: 'rgba(255,255,255,0.4)' }}>]</span><Comma /></Line></div>

                <div style={show(18)}><Line indent={1}><Key>bootcamps</Key><Colon /><Num>2</Num><Comma /></Line></div>
                <div style={show(18)}><Line indent={1}><Key>degrees</Key><Colon /><Num>2</Num><Comma /></Line></div>
                <div style={show(19)}><Line indent={1}><Key>learning</Key><Colon /><Bool>true</Bool><Comma /></Line></div>
                <div style={show(20)}><Line indent={1}><Key>status</Key><Colon /><Str>always_growing</Str></Line></div>

                <div style={{ ...show(20), color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>{'}'}</div>

                {/* Blinking cursor */}
                <div style={{ ...show(20), display: 'flex', gap: '6px' }}>
                  <span style={{ color: '#34d399' }}>$</span>
                  <Cursor />
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
