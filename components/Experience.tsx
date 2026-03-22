'use client'

import { useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { portfolioData } from '@/data/portfolio'
import { useIsMobile } from '@/hooks/useIsMobile'

function EduCard({ ed, i }: { ed: typeof portfolioData.education[0]; i: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 300, damping: 30 })
  const glowX = useTransform(x, [-0.5, 0.5], ['0%', '100%'])
  const glowY = useTransform(y, [-0.5, 0.5], ['0%', '100%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current!.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: i * 0.08 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
        background: 'linear-gradient(135deg, #0d0d18 0%, #111128 100%)',
        border: '1px solid rgba(79,142,247,0.12)',
        borderRadius: 16,
        padding: '28px 28px 24px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        transformOrigin: 'center center',
      }}
    >
      {/* Dynamic glow that follows mouse */}
      <motion.div style={{
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'rgba(79,142,247,0.08)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
        left: glowX,
        top: glowY,
        transform: 'translate(-50%, -50%)',
      }} />

      {/* Accent top bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 3,
        background: 'linear-gradient(90deg, #4f8ef7, #a78bfa)',
        borderRadius: '16px 16px 0 0',
      }} />

      {/* Year badge */}
      <span style={{
        display: 'inline-block',
        fontFamily: 'var(--font-dm-sans)',
        fontSize: 11,
        fontWeight: 600,
        color: '#4f8ef7',
        background: 'rgba(79,142,247,0.1)',
        border: '1px solid rgba(79,142,247,0.25)',
        borderRadius: 100,
        padding: '3px 12px',
        letterSpacing: '0.08em',
        marginBottom: 16,
      }}>
        {ed.date}
      </span>

      <h4 style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: 20,
        color: '#e2e2f0',
        lineHeight: 1.2,
        marginBottom: 8,
      }}>
        {ed.degree}
      </h4>
      <p style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: 13,
        color: 'rgba(226,226,240,0.45)',
        lineHeight: 1.5,
      }}>
        {ed.school}
      </p>
    </motion.div>
  )
}

type RopePoint = {
  x: number; y: number
  oldX: number; oldY: number
  pinned: boolean
}

export default function Experience() {
  const { experience, education } = portfolioData
  const isMobile = useIsMobile()

  const timelineRef  = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rafRef       = useRef<number>(0)
  const windRef      = useRef(0)
  const lastScrollY  = useRef(0)
  const mouseRef     = useRef({ x: -999, y: -999 })

  const SEGMENTS   = 24
  const ITEM_COUNT = experience.length  // 2

  useEffect(() => {
    const canvas  = canvasRef.current
    const section = timelineRef.current
    if (!canvas || !section) return

    let points: RopePoint[] = []
    let sectionHeight = 0
    const canvasCenterX = 40

    function buildRope() {
      if (window.innerWidth < 768) {
        canvas!.width  = 0
        canvas!.height = 0
        return
      }
      sectionHeight  = section!.offsetHeight
      canvas!.width  = 80
      canvas!.height = sectionHeight
      const segLen = sectionHeight / (SEGMENTS - 1)

      points = Array.from({ length: SEGMENTS }, (_, i) => ({
        x:      canvasCenterX,
        y:      i * segLen,
        oldX:   canvasCenterX,
        oldY:   i * segLen,
        pinned: i === 0 || i === SEGMENTS - 1,
      }))
    }

    buildRope()

    function updateRope() {
      if (!points.length) return
      const segLen = sectionHeight / (SEGMENTS - 1)
      const wind   = windRef.current

      // Verlet integration
      points.forEach((p) => {
        if (p.pinned) return
        const vx = (p.x - p.oldX) * 0.98
        const vy = (p.y - p.oldY) * 0.98
        p.oldX = p.x
        p.oldY = p.y
        p.x += vx + wind * 0.25
        p.y += vy + 0.18
      })

      // Constraint relaxation
      for (let iter = 0; iter < 12; iter++) {
        for (let i = 0; i < points.length - 1; i++) {
          const a = points[i]
          const b = points[i + 1]
          const dx   = b.x - a.x
          const dy   = b.y - a.y
          const dist = Math.hypot(dx, dy) || 0.001
          const diff = (dist - segLen) / dist * 0.5
          if (!a.pinned) { a.x += dx * diff; a.y += dy * diff }
          if (!b.pinned) { b.x -= dx * diff; b.y -= dy * diff }
        }
      }

      // Mouse influence
      const sectionRect  = section!.getBoundingClientRect()
      const canvasLeft   = sectionRect.left + sectionRect.width / 2 - 40
      const localMouseX  = mouseRef.current.x - canvasLeft
      const localMouseY  = mouseRef.current.y - sectionRect.top

      points.forEach((p) => {
        if (p.pinned) return
        const dx   = p.x - localMouseX
        const dy   = p.y - localMouseY
        const dist = Math.hypot(dx, dy)
        if (dist < 60 && dist > 0) {
          const force = (60 - dist) / 60 * 0.4
          p.x += (dx / dist) * force
          p.y += (dy / dist) * force
        }
      })

      // Clamp X inside canvas
      points.forEach((p) => {
        if (p.pinned) return
        p.x = Math.max(8, Math.min(72, p.x))
      })

      // Decay wind
      windRef.current *= 0.94
    }

    function drawRope() {
      const ctx = canvas!.getContext('2d')
      if (!ctx || !points.length) return
      ctx.clearRect(0, 0, canvas!.width, canvas!.height)

      // Rope curve
      ctx.beginPath()
      ctx.moveTo(
        (points[0].x + points[1].x) / 2,
        (points[0].y + points[1].y) / 2
      )
      for (let i = 1; i < points.length - 1; i++) {
        const mx = (points[i].x + points[i + 1].x) / 2
        const my = (points[i].y + points[i + 1].y) / 2
        ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my)
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y)
      ctx.strokeStyle = '#4f8ef7'
      ctx.lineWidth   = 2
      ctx.shadowBlur  = 6
      ctx.shadowColor = '#4f8ef788'
      ctx.stroke()
      ctx.shadowBlur  = 0

      // Dot markers — one per experience item + endpoints
      for (let i = 0; i <= ITEM_COUNT; i++) {
        const t   = i / ITEM_COUNT
        const idx = Math.min(Math.round(t * (points.length - 1)), points.length - 1)
        const pt  = points[idx]

        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2)
        ctx.fillStyle  = '#4f8ef7'
        ctx.shadowBlur = 8
        ctx.shadowColor = '#4f8ef7'
        ctx.fill()
        ctx.shadowBlur = 0

        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
      }
    }

    function loop() {
      updateRope()
      drawRope()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    const onScroll = () => {
      const currentY = window.scrollY
      const delta    = currentY - lastScrollY.current
      windRef.current += delta * 0.004
      windRef.current  = Math.max(-3, Math.min(3, windRef.current))
      lastScrollY.current = currentY
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    const onResize = () => buildRope()

    window.addEventListener('scroll',    onScroll,    { passive: true })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('resize',    onResize)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('scroll',    onScroll)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize',    onResize)
    }
  }, [])

  return (
    <section style={{ background: '#050508', padding: 'clamp(60px, 10vw, 120px) clamp(16px, 4vw, 24px)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Heading */}
        <div style={{ marginBottom: 64, position: 'relative', zIndex: 1 }}>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 13,
              color: '#4f8ef7',
              letterSpacing: '0.15em',
              marginBottom: 12,
            }}
          >
            // Career
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(3rem, 6vw, 5rem)',
              color: '#e2e2f0',
              lineHeight: 1,
            }}
          >
            EXPERIENCE
          </h2>
        </div>

        {/* Timeline — canvas rope replaces the static line */}
        <div ref={timelineRef} style={{ position: 'relative' }}>

          {/* Physics rope canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: 0,
              width: 80,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {experience.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isMobile ? 0 : (i % 2 === 0 ? -40 : 40) }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              style={{
                display: 'flex',
                justifyContent: isMobile ? 'flex-start' : (i % 2 === 0 ? 'flex-start' : 'flex-end'),
                marginBottom: isMobile ? 24 : 48,
                position: 'relative',
                zIndex: 1,
                paddingLeft: isMobile ? 24 : 0,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  position: 'absolute',
                  left: isMobile ? 0 : '50%',
                  top: 20,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: item.current ? '#34d399' : '#4f8ef7',
                  border: '2px solid #050508',
                  transform: isMobile ? 'translateX(-50%)' : 'translateX(-50%)',
                  boxShadow: item.current ? '0 0 12px #34d399' : '0 0 12px #4f8ef7',
                  zIndex: 2,
                }}
              />

              <div
                style={{
                  width: isMobile ? '100%' : '44%',
                  background: '#0d0d18',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  padding: isMobile ? 16 : 24,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 8,
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-bebas)',
                      fontSize: 22,
                      color: '#e2e2f0',
                      lineHeight: 1.1,
                    }}
                  >
                    {item.role}
                  </h3>
                  {item.current && (
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'var(--font-dm-sans)',
                        fontWeight: 700,
                        color: '#34d399',
                        background: 'rgba(52,211,153,0.1)',
                        border: '1px solid rgba(52,211,153,0.3)',
                        borderRadius: 100,
                        padding: '3px 10px',
                        animation: 'currentPulse 2s ease-in-out infinite',
                      }}
                    >
                      Current
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 13,
                    color: '#4f8ef7',
                    marginBottom: 4,
                  }}
                >
                  {item.company}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 12,
                    color: 'rgba(226,226,240,0.3)',
                    marginBottom: 12,
                    letterSpacing: '0.05em',
                  }}
                >
                  {item.date}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 14,
                    color: 'rgba(226,226,240,0.6)',
                    lineHeight: 1.6,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Education */}
        <div style={{ marginTop: 100, position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#4f8ef7', letterSpacing: '0.15em', marginBottom: 8 }}>
              // Academic Background
            </p>
            <h3
              style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: '#e2e2f0',
                lineHeight: 1,
              }}
            >
              EDUCATION
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 20 }}>
            {education.map((ed, i) => (
              <EduCard key={i} ed={ed} i={i} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes currentPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
      `}</style>
    </section>
  )
}
