'use client'

import { useEffect, useRef } from 'react'
import { portfolioData } from '@/data/portfolio'

type SoftBall = {
  pts: any[]
  center: any
  constraints: any[]
  skill: typeof portfolioData.skills[0]
  R: number
}

export default function Skills() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const cleanupRef   = useRef<(() => void) | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas    = canvasRef.current
    if (!container || !canvas) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !cleanupRef.current) {
          initPhysics()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(container)

    function initPhysics() {
      const W = container!.offsetWidth  || 900
      const H = container!.offsetHeight || 550
      canvas!.width  = W
      canvas!.height = H

      const softBalls: SoftBall[] = []
      let animFrameId = 0
      let engineInstance: any = null

      import('matter-js').then((Matter) => {
        const { Engine, Bodies, Body, World, Constraint } = Matter

        const engine = Engine.create({ gravity: { x: 0, y: 1.2 } })
        engineInstance = engine
        const world = engine.world

        // Walls
        const wallOpts = { isStatic: true, restitution: 0.5, friction: 0.3 }
        World.add(world, [
          Bodies.rectangle(W / 2, H + 25,  W * 2, 50, wallOpts),
          Bodies.rectangle(W / 2, -25,     W * 2, 50, wallOpts),
          Bodies.rectangle(-25,   H / 2,   50, H * 2, wallOpts),
          Bodies.rectangle(W + 25, H / 2,  50, H * 2, wallOpts),
        ])

        // Soft body creation
        portfolioData.skills.forEach((skill, index) => {
          const N  = 8
          const R  = 30 + (skill.level / 100) * 20
          const sx = 80 + Math.random() * (W - 160)
          const sy = -60 - index * 90 - Math.random() * 100

          const pts = Array.from({ length: N }, (_, j) => {
            const angle = (j / N) * Math.PI * 2
            return Bodies.circle(
              sx + Math.cos(angle) * R * 0.55,
              sy + Math.sin(angle) * R * 0.55,
              6,
              { restitution: 0.5, friction: 0.1, frictionAir: 0.012, label: `soft-${skill.name}-pt` }
            )
          })

          const center = Bodies.circle(sx, sy, R * 0.28, {
            restitution: 0.5, friction: 0.1, frictionAir: 0.012,
            collisionFilter: { mask: 0 },
            label: `soft-${skill.name}-center`,
          })

          const constraints: any[] = []
          pts.forEach((p, j) => {
            constraints.push(Constraint.create({ bodyA: p, bodyB: pts[(j + 1) % N], stiffness: 0.3, damping: 0.05, length: R * 0.82 }))
            constraints.push(Constraint.create({ bodyA: p, bodyB: center, stiffness: 0.08, damping: 0.02, length: R * 0.55 }))
          })

          World.add(world, [...pts, center, ...constraints])
          softBalls.push({ pts, center, constraints, skill, R })
        })

        // Manual drag state
        let dragging: any = null
        let dragOffX = 0, dragOffY = 0

        const getCanvasPos = (e: MouseEvent) => {
          const rect = canvas!.getBoundingClientRect()
          return { x: (e.clientX - rect.left) * (W / rect.width), y: (e.clientY - rect.top) * (H / rect.height) }
        }

        const onMouseDown = (e: MouseEvent) => {
          const { x, y } = getCanvasPos(e)
          for (const ball of softBalls) {
            for (const p of ball.pts) {
              const dx = p.position.x - x, dy = p.position.y - y
              if (Math.hypot(dx, dy) < 20) {
                dragging = p
                dragOffX = dx; dragOffY = dy
                return
              }
            }
          }
        }
        const onMouseMove = (e: MouseEvent) => {
          // Gravity tilt
          const rect = container!.getBoundingClientRect()
          const mx = e.clientX - rect.left, my = e.clientY - rect.top
          engine.gravity.x = (mx / W - 0.5) * 1.5
          engine.gravity.y = 1.0 + (my / H - 0.5) * 0.5
          container!.style.transform = `perspective(1200px) rotateX(${((my/H)-0.5)*6}deg) rotateY(${-((mx/W)-0.5)*6}deg)`
          // Drag
          if (dragging) {
            const { x, y } = getCanvasPos(e)
            Body.setPosition(dragging, { x: x + dragOffX, y: y + dragOffY })
            Body.setVelocity(dragging, { x: 0, y: 0 })
          }
        }
        const onMouseUp = () => { dragging = null }
        const onMouseLeave = () => {
          dragging = null
          engine.gravity.x = 0
          engine.gravity.y = 1.2
          container!.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)'
        }
        const onClick = (e: MouseEvent) => {
          const { x, y } = getCanvasPos(e)
          softBalls.forEach((ball) => {
            ball.pts.forEach((p) => {
              const dx = p.position.x - x, dy = p.position.y - y
              const dist = Math.hypot(dx, dy) || 1
              if (dist < 180) {
                const force = 0.06 / dist
                Body.applyForce(p, p.position, { x: (dx/dist)*force, y: (dy/dist)*force - 0.005 })
              }
            })
          })
        }

        canvas!.addEventListener('mousedown', onMouseDown)
        canvas!.addEventListener('mousemove', onMouseMove)
        canvas!.addEventListener('mouseup', onMouseUp)
        container!.addEventListener('mousemove', onMouseMove)
        container!.addEventListener('mouseleave', onMouseLeave)
        canvas!.addEventListener('click', onClick)

        // Render loop
        const ctx = canvas!.getContext('2d')!
        const loop = () => {
          Engine.update(engine, 1000 / 60)
          ctx.clearRect(0, 0, W, H)

          softBalls.forEach((ball) => {
            const { pts, skill } = ball
            const cx = pts.reduce((s: number, p: any) => s + p.position.x, 0) / pts.length
            const cy = pts.reduce((s: number, p: any) => s + p.position.y, 0) / pts.length

            ctx.save()
            ctx.shadowBlur  = 14
            ctx.shadowColor = skill.color + '66'
            ctx.beginPath()
            const p0 = pts[0], pL = pts[pts.length - 1]
            ctx.moveTo((p0.position.x + pL.position.x) / 2, (p0.position.y + pL.position.y) / 2)
            pts.forEach((p: any, i: number) => {
              const next = pts[(i + 1) % pts.length]
              ctx.quadraticCurveTo(p.position.x, p.position.y, (p.position.x + next.position.x) / 2, (p.position.y + next.position.y) / 2)
            })
            ctx.closePath()
            ctx.fillStyle   = skill.color + '2e'
            ctx.fill()
            ctx.strokeStyle = skill.color + 'cc'
            ctx.lineWidth   = 2
            ctx.stroke()
            ctx.shadowBlur  = 0

            const isDragged = pts.some((p: any) => p === dragging)
            if (isDragged) {
              ctx.beginPath()
              pts.forEach((p: any, i: number) => {
                const next = pts[(i + 1) % pts.length]
                const mx = (p.position.x + next.position.x) / 2, my = (p.position.y + next.position.y) / 2
                if (i === 0) ctx.moveTo(mx, my)
                ctx.quadraticCurveTo(p.position.x, p.position.y, mx, my)
              })
              ctx.closePath()
              ctx.strokeStyle = '#4f8ef7'
              ctx.lineWidth   = 2.5
              ctx.stroke()
            }

            ctx.fillStyle    = '#ffffff'
            ctx.font         = 'bold 11px sans-serif'
            ctx.textAlign    = 'center'
            ctx.textBaseline = 'middle'
            ctx.shadowBlur   = 4
            ctx.shadowColor  = 'rgba(0,0,0,0.8)'
            ctx.fillText(skill.name, cx, cy)
            ctx.shadowBlur   = 0
            ctx.restore()
          })

          animFrameId = requestAnimationFrame(loop)
        }
        animFrameId = requestAnimationFrame(loop)

        cleanupRef.current = () => {
          cancelAnimationFrame(animFrameId)
          canvas!.removeEventListener('mousedown', onMouseDown)
          canvas!.removeEventListener('mousemove', onMouseMove)
          canvas!.removeEventListener('mouseup', onMouseUp)
          container!.removeEventListener('mousemove', onMouseMove)
          container!.removeEventListener('mouseleave', onMouseLeave)
          canvas!.removeEventListener('click', onClick)
          Matter.Engine.clear(engine)
        }
      })
    }

    return () => {
      observer.disconnect()
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [])

  return (
    <section style={{ background: '#050508', padding: '120px 24px', position: 'relative' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#4f8ef7', letterSpacing: '0.15em', marginBottom: 12 }}>
            // Technical Arsenal
          </p>
          <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(3rem, 6vw, 5rem)', color: '#e2e2f0', lineHeight: 1, marginBottom: 16 }}>
            MY SKILLS
          </h2>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'rgba(226,226,240,0.4)', letterSpacing: '0.05em' }}>
            Drag the blobs &middot; Click to explode &middot; Tilt to shift gravity
          </p>
        </div>

        <div
          ref={containerRef}
          style={{
            width: '100%',
            maxWidth: 900,
            height: 550,
            margin: '0 auto',
            borderRadius: 16,
            border: '1px solid rgba(79,142,247,0.15)',
            boxShadow: '0 0 40px rgba(79,142,247,0.05)',
            overflow: 'hidden',
            transition: 'transform 0.1s linear',
          }}
        >
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>
      </div>
    </section>
  )
}
