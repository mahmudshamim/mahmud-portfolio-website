'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { portfolioData } from '@/data/portfolio'
import { useMagnetic } from '@/hooks/useMagnetic'

const NameReveal = dynamic(() => import('@/components/NameReveal'), { ssr: false })

const floatingWords = [
  { word: 'CREATIVE',  speed: 0.04, x: '10%', y: '20%' },
  { word: 'DEVELOPER', speed: 0.02, x: '75%', y: '15%' },
  { word: 'DESIGN',    speed: 0.06, x: '80%', y: '70%' },
  { word: 'CODE',      speed: 0.03, x: '15%', y: '75%' },
  { word: 'MOTION',    speed: 0.05, x: '50%', y: '85%' },
]

type Dot = { x: number; y: number; vx: number; vy: number; r: number }

export default function Hero() {
  const { personal } = portfolioData
  const [mouse, setMouse]   = useState({ x: 0, y: 0 })
  const [tilt, setTilt]     = useState({ x: 0, y: 0 })
  const heroRef             = useRef<HTMLElement>(null)
  const convasRef           = useRef<HTMLCanvasElement>(null)
  const mouseRef            = useRef({ x: -999, y: -999 })
  const viewWorkRef         = useMagnetic() as React.RefObject<HTMLButtonElement>
  const hireMeRef           = useMagnetic() as React.RefObject<HTMLButtonElement>

  // Parallax / tilt mouse tracking
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const dx = e.clientX - window.innerWidth / 2
      const dy = e.clientY - window.innerHeight / 2
      setMouse({ x: dx, y: dy })
      setTilt({
        x:  (dy / window.innerHeight) * 5,
        y: -(dx / window.innerWidth)  * 5,
      })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  // Constellation canvas
  useEffect(() => {
    const canvas = convasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const dots: Dot[] = Array.from({ length: 80 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r:  Math.random() * 2 + 1,
    }))

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouseMove)

    let rafId = 0

    const loop = () => {
      const ctx = canvas.getContext('2d')!
      const W = canvas.width
      const H = canvas.height
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      // Move + bounce
      for (const dot of dots) {
        dot.x += dot.vx
        dot.y += dot.vy
        if (dot.x < 0 || dot.x > W) dot.vx *= -1
        if (dot.y < 0 || dot.y > H) dot.vy *= -1

        // Mouse repulsion
        const dx   = dot.x - mx
        const dy   = dot.y - my
        const dist = Math.hypot(dx, dy)
        if (dist < 100 && dist > 0) {
          dot.x += (dx / dist) * 0.015 * (100 - dist)
          dot.y += (dy / dist) * 0.015 * (100 - dist)
        }
      }

      ctx.clearRect(0, 0, W, H)

      // Dot-to-dot connections
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const d = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(dots[i].x, dots[i].y)
            ctx.lineTo(dots[j].x, dots[j].y)
            ctx.strokeStyle = `rgba(79,142,247,${(1 - d / 120) * 0.5})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // Mouse-to-dot connections
      for (const dot of dots) {
        const d = Math.hypot(dot.x - mx, dot.y - my)
        if (d < 150) {
          ctx.beginPath()
          ctx.moveTo(dot.x, dot.y)
          ctx.lineTo(mx, my)
          ctx.strokeStyle = `rgba(255,45,120,${(1 - d / 150) * 0.6})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }

      // Draw dots
      for (const dot of dots) {
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(200,210,255,0.7)'
        ctx.fill()
      }

      // Mouse dot
      if (mx > 0) {
        ctx.beginPath()
        ctx.arc(mx, my, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#ff2d78'
        ctx.fill()
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={heroRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#050508',
      }}
    >
      {/* Constellation canvas — z-index 0, behind everything */}
      <canvas
        ref={convasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Grid lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          backgroundImage:
            'linear-gradient(rgba(79,142,247,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,142,247,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}
      />

      {/* Color blobs */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: 'clamp(180px, 30vw, 400px)', height: 'clamp(180px, 30vw, 400px)', borderRadius: '50%', background: 'rgba(79,142,247,0.12)', filter: 'blur(80px)', animation: 'blobFloat 8s ease-in-out infinite', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', top: '50%', right: '5%', width: 'clamp(150px, 25vw, 350px)', height: 'clamp(150px, 25vw, 350px)', borderRadius: '50%', background: 'rgba(167,139,250,0.1)', filter: 'blur(80px)', animation: 'blobFloat 10s ease-in-out infinite reverse', pointerEvents: 'none', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '40%', width: 'clamp(120px, 20vw, 300px)', height: 'clamp(120px, 20vw, 300px)', borderRadius: '50%', background: 'rgba(255,45,120,0.08)', filter: 'blur(80px)', animation: 'blobFloat 12s ease-in-out infinite 2s', pointerEvents: 'none', zIndex: 1 }} />

      {/* Floating words */}
      {floatingWords.map(({ word, speed, x, y }) => (
        <div
          key={word}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            zIndex: 2,
            transform: `translate(${mouse.x * speed}px, ${mouse.y * speed}px)`,
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(14px, 2vw, 22px)',
            color: 'rgba(255,255,255,0.06)',
            letterSpacing: '0.3em',
            pointerEvents: 'none',
            userSelect: 'none',
            transition: 'transform 0.1s linear',
          }}
        >
          {word}
        </div>
      ))}

      {/* Hero content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          padding: '0 clamp(16px, 5vw, 24px)',
          marginTop: 'clamp(-120px, -15vh, 0px)',
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.1s linear',
        }}
      >
        {/* Available badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(52,211,153,0.1)',
            border: '1px solid rgba(52,211,153,0.3)',
            borderRadius: 100,
            padding: '6px 16px',
            marginBottom: 32,
            fontSize: 13,
            color: '#34d399',
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#34d399',
              animation: 'pulse 2s ease-in-out infinite',
              display: 'inline-block',
            }}
          />
          Available for Work
        </div>

        {/* Name */}
        <NameReveal />

        {/* Role */}
        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 'clamp(14px, 1.5vw, 18px)',
            color: 'rgba(226,226,240,0.6)',
            letterSpacing: '0.1em',
            marginBottom: 48,
            textTransform: 'uppercase',
          }}
        >
          {personal.role}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            ref={viewWorkRef}
            onClick={() => scrollTo('projects')}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 15,
              fontWeight: 600,
              color: '#050508',
              background: '#4f8ef7',
              border: 'none',
              borderRadius: 8,
              padding: '14px 32px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,142,247,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            View Work
          </button>
          <button
            ref={hireMeRef}
            onClick={() => scrollTo('contact')}
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 15,
              fontWeight: 600,
              color: '#e2e2f0',
              background: 'transparent',
              border: '1px solid rgba(226,226,240,0.2)',
              borderRadius: 8,
              padding: '14px 32px',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(79,142,247,0.6)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(226,226,240,0.2)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Hire Me
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          zIndex: 10,
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 1,
            height: 48,
            background: 'linear-gradient(to bottom, rgba(79,142,247,0.6), transparent)',
            animation: 'scrollLine 2s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontSize: 10,
            letterSpacing: '0.2em',
            color: 'rgba(226,226,240,0.3)',
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          SCROLL
        </span>
      </div>

      <style>{`
        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(20px, -20px) scale(1.05); }
          66%       { transform: translate(-15px, 15px) scale(0.95); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes scrollLine {
          0%   { height: 0; opacity: 1; }
          100% { height: 48px; opacity: 0; }
        }
      `}</style>
    </section>
  )
}
