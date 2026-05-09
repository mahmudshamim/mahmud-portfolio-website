'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { portfolioData } from '@/data/portfolio'

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function ArrowIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {dir === 'left'
        ? <><polyline points="15 18 9 12 15 6" /></>
        : <><polyline points="9 18 15 12 9 6" /></>}
    </svg>
  )
}

export default function Projects() {
  const featured = portfolioData.projects.filter((p) => p.featured)
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState(1)
  const touchStartX = useRef(0)

  const go = (next: number) => {
    setDir(next > active ? 1 : -1)
    setActive(next)
  }

  const prev = () => go((active - 1 + featured.length) % featured.length)
  const next = () => go((active + 1) % featured.length)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
  }

  const project = featured[active]

  return (
    <section id="work" style={{ background: '#07070d', padding: 'clamp(60px, 10vw, 120px) clamp(16px, 4vw, 24px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 72 }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 13,
            color: '#4f8ef7',
            letterSpacing: '0.15em',
            marginBottom: 12,
          }}>
            // Featured
          </p>
          <h2 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            color: '#e2e2f0',
            lineHeight: 1,
          }}>
            SELECTED WORK
          </h2>
        </div>

        {/* Showcase */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 64,
          alignItems: 'center',
        }}
          className="projects-grid"
        >
          {/* Left: info panel */}
          <div>
            {/* Number */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active + '-num'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: 'clamp(4rem, 8vw, 7rem)',
                  lineHeight: 1,
                  color: 'transparent',
                  WebkitTextStroke: `2px ${project.color}55`,
                  marginBottom: 8,
                  userSelect: 'none',
                }}>
                  {String(active + 1).padStart(2, '0')}
                </div>

                {/* Category */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontFamily: 'var(--font-dm-sans)',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: project.color,
                  background: project.color + '15',
                  border: `1px solid ${project.color}30`,
                  borderRadius: 100,
                  padding: '4px 12px',
                  marginBottom: 20,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: project.color, display: 'inline-block' }} />
                  {project.category}
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                  color: '#e2e2f0',
                  lineHeight: 1.1,
                  marginBottom: 16,
                }}>
                  {project.name}
                </h3>

                {/* Description */}
                <p style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 15,
                  color: 'rgba(226,226,240,0.55)',
                  lineHeight: 1.7,
                  marginBottom: 28,
                  maxWidth: 420,
                }}>
                  {project.shortDesc}
                </p>

                {/* Tech */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
                  {project.tech.map((t) => (
                    <span key={t} style={{
                      fontSize: 11,
                      fontFamily: 'monospace',
                      color: 'rgba(226,226,240,0.45)',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 4,
                      padding: '3px 10px',
                    }}>
                      {t}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  {project.github && (
                    <a href={project.github} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 13, fontFamily: 'var(--font-dm-sans)',
                        color: 'rgba(226,226,240,0.5)',
                        transition: 'color 0.2s',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#e2e2f0')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(226,226,240,0.5)')}
                    >
                      <GitHubIcon /> Code
                    </a>
                  )}
                  {project.live && (
                    <a href={project.live} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 13, fontFamily: 'var(--font-dm-sans)',
                        color: project.color,
                        transition: 'opacity 0.2s',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <ExternalIcon /> Live Demo
                    </a>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Right: card deck + nav below */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Fanned card deck */}
          {/* overflow:visible so rotated back-cards peek right of the column */}
          <div
            style={{ position: 'relative', height: 420, overflow: 'visible' }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* All cards same position, same size; rotation fans them right from bottom-left pivot */}
            {/* Render deepest first so active renders last (on top) */}
            {[2, 1].map((offset) => {
              const idx = (active + offset) % featured.length
              const p = featured[idx]
              const rotations = [0, 6, 12]
              const opacities  = [1, 0.55, 0.32]
              return (
                <motion.div
                  key={`fan-${idx}-${offset}`}
                  animate={{ rotate: rotations[offset], opacity: opacities[offset] }}
                  transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                  onClick={() => go(idx)}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    background: '#1e1e2e',
                    borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.14)',
                    overflow: 'hidden',
                    transformOrigin: 'bottom left',
                    cursor: 'pointer',
                    zIndex: offset === 2 ? 1 : 2,
                  }}
                  whileHover={{ opacity: opacities[offset] + 0.12 }}
                >
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: p.color + '55',
                    borderRadius: '20px 20px 0 0',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 28, left: 28,
                    fontFamily: 'var(--font-bebas)', fontSize: 20,
                    color: 'rgba(226,226,240,0.18)', lineHeight: 1,
                    pointerEvents: 'none',
                  }}>
                    {p.name}
                  </div>
                </motion.div>
              )
            })}

            {/* Active card — AnimatePresence for slide transition */}
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={active}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ x: d > 0 ? 260 : -260, opacity: 0, scale: 0.94 }),
                  center: { x: 0, opacity: 1, scale: 1 },
                  exit:  (d: number) => ({ x: d > 0 ? -260 : 260, opacity: 0, scale: 0.94 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '100%', height: '100%',
                  background: '#1a1a2e',
                  borderRadius: 20,
                  border: `1px solid ${project.color}28`,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  transformOrigin: 'bottom left',
                  zIndex: 10,
                  boxShadow: `0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px ${project.color}12`,
                }}
              >
                {/* Accent bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg, ${project.color}, ${project.color}55)`,
                  borderRadius: '20px 20px 0 0',
                }} />

                {/* Ghost number */}
                <div style={{
                  position: 'absolute', top: 20, right: 24,
                  fontFamily: 'var(--font-bebas)', fontSize: 96,
                  color: 'transparent',
                  WebkitTextStroke: `1px ${project.color}16`,
                  lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                  zIndex: 1,
                }}>
                  {String(active + 1).padStart(2, '0')}
                </div>

                {/* Full-card screenshot */}
                {(project as typeof project & { image?: string }).image ? (
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 20 }}>
                    <img
                      src={(project as typeof project & { image?: string }).image}
                      alt={project.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top center' }}
                    />
                    {/* strong bottom fade so text is readable */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(7,7,13,1) 28%, rgba(7,7,13,0.3) 60%, transparent 100%)',
                    }} />
                  </div>
                ) : (
                  <div style={{
                    position: 'absolute', top: '38%', left: '38%',
                    width: 240, height: 240, borderRadius: '50%',
                    background: `radial-gradient(circle, ${project.color}14 0%, transparent 70%)`,
                    transform: 'translate(-50%,-50%)', pointerEvents: 'none',
                  }} />
                )}

                {/* Bottom info overlay */}
                <div style={{
                  padding: '28px 32px',
                  position: 'relative', zIndex: 2,
                }}>
                  <div style={{
                    fontSize: 10, fontFamily: 'var(--font-dm-sans)', fontWeight: 700,
                    letterSpacing: '0.14em', color: project.color,
                    marginBottom: 6, textTransform: 'uppercase',
                  }}>
                    {project.category}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-bebas)', fontSize: 30,
                    color: '#e2e2f0', lineHeight: 1.1, marginBottom: 14,
                  }}>
                    {project.name}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {project.tech.slice(0, 4).map(t => (
                      <span key={t} style={{
                        fontSize: 10, fontFamily: 'monospace',
                        color: 'rgba(226,226,240,0.55)',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 3, padding: '2px 7px',
                      }}>{t}</span>
                    ))}
                  </div>
                </div>

                {/* Clickable overlay → open live/github */}
                {(project.live || project.github) && (
                  <a
                    href={project.live || project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      position: 'absolute', inset: 0, zIndex: 5,
                      borderRadius: 20,
                    }}
                    aria-label={`Open ${project.name}`}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Right-edge next arrow — sits on card boundary, above fan cards */}
            <button
              onClick={next}
              style={{
                position: 'absolute',
                right: -22,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 20,
                width: 44, height: 44,
                borderRadius: '50%',
                background: 'rgba(30,30,42,0.92)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(226,226,240,0.75)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(50,50,70,0.95)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#e2e2f0'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(30,30,42,0.92)'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(226,226,240,0.75)'
              }}
            >
              <ArrowIcon dir="right" />
            </button>
          </div>

          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .projects-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
