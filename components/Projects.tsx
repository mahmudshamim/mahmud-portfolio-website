'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { portfolioData } from '@/data/portfolio'

type Ripple    = { x: number; y: number; r: number; life: number }
type CardState = { ripples: Ripple[]; hovered: boolean }

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

export default function Projects() {
  const featured = portfolioData.projects.filter((p) => p.featured)

  const cardCanvasRefs = useRef<(HTMLCanvasElement | null)[]>([])
  const cardStates     = useRef<CardState[]>(
    featured.map(() => ({ ripples: [], hovered: false }))
  )
  const rafRef = useRef<number>(0)
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (isMobile) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x    = e.clientX - rect.left
    const y    = e.clientY - rect.top
    const lx   = x / rect.width  - 0.5
    const ly   = y / rect.height - 0.5

    e.currentTarget.style.transform =
      `perspective(600px) rotateX(${-ly * 8}deg) rotateY(${lx * 8}deg) translateY(-4px)`

    const color = featured[index].color
    e.currentTarget.style.boxShadow =
      `0 0 24px ${color}66, 0 8px 32px rgba(0,0,0,0.4)`
    e.currentTarget.style.borderColor = color + '44'

    const state = cardStates.current[index]
    state.hovered = true
    const last = state.ripples[state.ripples.length - 1]
    if (!last || Math.hypot(x - last.x, y - last.y) > 8) {
      state.ripples.push({ x, y, r: 0, life: 1 })
      if (state.ripples.length > 15) state.ripples.shift()
    }

    const canvas = cardCanvasRefs.current[index]
    if (canvas) {
      canvas.width  = rect.width
      canvas.height = rect.height
    }
  }

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const el = e.currentTarget
    el.style.transform   = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px)'
    el.style.boxShadow   = 'none'
    el.style.borderColor = 'rgba(255,255,255,0.06)'
    cardStates.current[index].hovered = false
  }

  useEffect(() => {
    const loop = () => {
      cardStates.current.forEach((state, i) => {
        const canvas = cardCanvasRefs.current[i]
        if (!canvas || !state.hovered) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        state.ripples = state.ripples.filter((r) => r.life > 0)
        state.ripples.forEach((rip) => {
          rip.r    += 3
          rip.life -= 0.03
          ctx.beginPath()
          ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255,255,255,${rip.life * 0.15})`
          ctx.lineWidth = 1
          ctx.stroke()
        })
      })
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <section style={{ background: '#07070d', padding: 'clamp(60px, 10vw, 120px) clamp(16px, 4vw, 24px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 64 }}>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 13,
              color: '#4f8ef7',
              letterSpacing: '0.15em',
              marginBottom: 12,
            }}
          >
            // Featured
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(3rem, 6vw, 5rem)',
              color: '#e2e2f0',
              lineHeight: 1,
            }}
          >
            SELECTED WORK
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))',
            gap: 24,
          }}
        >
          {featured.map((project, i) => (
            <motion.div
              key={project.id}
              className="project-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onMouseMove={(e) => handleCardMouseMove(e, i)}
              onMouseLeave={(e) => handleCardMouseLeave(e, i)}
              style={{
                position: 'relative',
                overflow: 'hidden',
                background: '#13131a',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
              }}
            >
              {/* Ripple canvas overlay */}
              <canvas
                ref={(el) => { cardCanvasRefs.current[i] = el }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 1,
                  borderRadius: 'inherit',
                }}
              />

              {/* Card content */}
              <div style={{ position: 'relative', zIndex: 2, padding: 32 }}>
                {/* Category badge */}
                <div
                  style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontFamily: 'var(--font-dm-sans)',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: project.color,
                    background: project.color + '18',
                    border: `1px solid ${project.color}33`,
                    borderRadius: 100,
                    padding: '4px 12px',
                    marginBottom: 20,
                  }}
                >
                  {project.category}
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-bebas)',
                    fontSize: 32,
                    color: '#e2e2f0',
                    lineHeight: 1.1,
                    marginBottom: 12,
                  }}
                >
                  {project.name}
                </h3>

                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 15,
                    color: 'rgba(226,226,240,0.55)',
                    lineHeight: 1.6,
                    marginBottom: 24,
                  }}
                >
                  {project.shortDesc}
                </p>

                {/* Tech stack */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 11,
                        fontFamily: 'monospace',
                        color: 'rgba(226,226,240,0.4)',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 4,
                        padding: '3px 8px',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div style={{ display: 'flex', gap: 16 }}>
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'rgba(226,226,240,0.5)',
                        transition: 'color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        fontFamily: 'var(--font-dm-sans)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e2f0')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(226,226,240,0.5)')}
                    >
                      <GitHubIcon /> Code
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: project.color,
                        transition: 'opacity 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 13,
                        fontFamily: 'var(--font-dm-sans)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <ExternalIcon /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
