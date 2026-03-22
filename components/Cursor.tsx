'use client'

import { useEffect, useRef, useState } from 'react'

const COLORS = ['#4f8ef7', '#ff2d78', '#34d399', '#a78bfa', '#f59e0b']

type Particle = {
  x: number; y: number
  vx: number; vy: number
  r: number; life: number
  color: string
}

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const particleCanvasRef = useRef<HTMLCanvasElement>(null)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const rippleId = useRef(0)
  const ringPos = useRef({ x: 0, y: 0 })
  const mousePos = useRef({ x: 0, y: 0 })
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const particleRafRef = useRef<number>(0)

  // Cursor ring + dot animation
  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
      dot.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 5}px)`

      // Spawn 3 particles
      for (let i = 0; i < 3; i++) {
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3 - 1.5,
          r: Math.random() * 5 + 3,
          life: 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        })
      }
    }

    const onMouseDown = () => { if (dot) dot.style.width = dot.style.height = '20px' }
    const onMouseUp   = () => { if (dot) dot.style.width = dot.style.height = '10px' }

    const onClick = (e: MouseEvent) => {
      const id = rippleId.current++
      setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, 600)
    }

    const animateRing = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15
      ring.style.transform = `translate(${ringPos.current.x - 18}px, ${ringPos.current.y - 18}px)`
      animRef.current = requestAnimationFrame(animateRing)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('click', onClick)
    animRef.current = requestAnimationFrame(animateRing)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('click', onClick)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  // Particle canvas animation
  useEffect(() => {
    const canvas = particleCanvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0)

      for (const p of particlesRef.current) {
        p.x  += p.vx
        p.y  += p.vy
        p.vy += 0.08
        p.vx *= 0.97
        p.r  *= 0.97
        p.life -= 0.025

        const alpha = Math.max(0, p.life)
        const hex = Math.round(alpha * 255).toString(16).padStart(2, '0')
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(0, p.r), 0, Math.PI * 2)
        ctx.fillStyle = p.color + hex
        ctx.fill()
      }

      particleRafRef.current = requestAnimationFrame(draw)
    }

    particleRafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(particleRafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      {/* Particle canvas */}
      <canvas
        ref={particleCanvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9996,
        }}
      />

      {/* Dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: '#4f8ef7',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'width 0.1s, height 0.1s',
          willChange: 'transform',
        }}
      />

      {/* Ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1.5px solid #4f8ef7',
          opacity: 0.6,
          pointerEvents: 'none',
          zIndex: 9998,
          willChange: 'transform',
        }}
      />

      {/* Click ripples */}
      {ripples.map((r) => (
        <div
          key={r.id}
          style={{
            position: 'fixed',
            top: r.y,
            left: r.x,
            width: 0,
            height: 0,
            borderRadius: '50%',
            border: '2px solid #4f8ef7',
            pointerEvents: 'none',
            zIndex: 9997,
            transform: 'translate(-50%, -50%)',
            animation: 'rippleExpand 0.6s ease-out forwards',
          }}
        />
      ))}

      <style>{`
        @keyframes rippleExpand {
          from { width: 0; height: 0; opacity: 0.8; }
          to { width: 80px; height: 80px; opacity: 0; }
        }
      `}</style>
    </>
  )
}
