'use client'
import { useRef } from 'react'
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

export default function Education() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section
      ref={sectionRef}
      id="education"
      style={{ padding: '100px 0', background: '#050508' }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '48px' }}
        >
          <div style={{
            fontSize: '11px',
            color: '#4f8ef7',
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            marginBottom: '8px',
            fontFamily: 'var(--font-dm-sans)',
          }}>
            // Academic Background
          </div>
          <h2 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            color: '#e2e2f0',
            margin: 0,
            letterSpacing: '0.02em',
          }}>
            EDUCATION
          </h2>
        </motion.div>

        {/* Year column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'clamp(64px, 10vw, 88px) 1fr',
          gap: 0,
        }}>

          {/* Left — year numbers */}
          <div style={{
            borderRight: '1px solid rgba(255,255,255,0.06)',
            paddingRight: '20px',
          }}>
            {educationData.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                style={{
                  marginBottom: i < educationData.length - 1 ? '40px' : 0,
                  position: 'relative',
                }}
              >
                {/* Big year number */}
                <div style={{
                  fontSize: 'clamp(26px, 5vw, 36px)',
                  fontWeight: '800',
                  lineHeight: 1,
                  marginBottom: '4px',
                  background: getYearGradient(item.color),
                  WebkitBackgroundClip: item.color !== 'gray' ? 'text' : 'unset',
                  WebkitTextFillColor: item.color !== 'gray' ? 'transparent' : 'unset',
                  color: item.color === 'gray' ? 'rgba(255,255,255,0.18)' : 'transparent',
                }}>
                  {item.year}
                </div>

                {/* Year range */}
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.2)',
                  letterSpacing: '.05em',
                  fontWeight: '500',
                  fontFamily: 'var(--font-dm-sans)',
                }}>
                  {item.range}
                </div>

                {/* Dot connector */}
                <div style={{
                  position: 'absolute',
                  right: '-26px',
                  top: '12px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: getDotColor(item.color),
                  border: '2px solid #050508',
                  boxShadow: item.color !== 'gray'
                    ? `0 0 0 3px ${getDotColor(item.color)}33`
                    : 'none',
                  zIndex: 1,
                }} />
              </motion.div>
            ))}
          </div>

          {/* Right — content */}
          <div style={{ paddingLeft: '28px' }}>
            {educationData.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 + 0.05 }}
                style={{
                  marginBottom: i < educationData.length - 1 ? '40px' : 0,
                  paddingTop: '4px',
                }}
              >
                <div style={{
                  fontSize: 'clamp(13px, 2vw, 15px)',
                  fontWeight: '600',
                  color: '#e2e2f0',
                  lineHeight: '1.4',
                  marginBottom: '5px',
                  fontFamily: 'var(--font-dm-sans)',
                }}>
                  {item.title}
                </div>

                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.35)',
                  marginBottom: '8px',
                  fontFamily: 'var(--font-dm-sans)',
                }}>
                  {item.school}
                </div>

                <span style={{
                  display: 'inline-block',
                  fontSize: '10px',
                  fontWeight: '600',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  letterSpacing: '.04em',
                  fontFamily: 'var(--font-dm-sans)',
                  ...getTagStyle(item.tagColor),
                }}>
                  {item.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
