'use client'

import { useEffect, useRef } from 'react'

const NAME = 'MAHMUD'
const FONT_SIZE = 120
const FONT = `900 ${FONT_SIZE}px 'Bebas Neue', sans-serif`
const ACCENT = '#4f8ef7'

type LetterBody = {
  x: number; y: number
  angle: number
  vx: number; vy: number
  va: number
  targetX: number; targetY: number
  w: number
  char: string
  assembling: boolean
  assembled: boolean
}

export default function NameReveal() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const W = container.offsetWidth || 700
    const H = 200
    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext('2d')!
    let rafId = 0
    let engineRef: any = null
    let letters: LetterBody[] = []
    let settleTimer: ReturnType<typeof setTimeout> | null = null
    let isAssembled = false

    // Measure letter widths
    ctx.font = FONT
    const charWidths = Array.from(NAME).map((c) => ctx.measureText(c).width)
    const totalW = charWidths.reduce((a, b) => a + b, 0) + (NAME.length - 1) * 8
    let startX = (W - totalW) / 2

    const targetPositions: { x: number; y: number }[] = []
    let cx = startX
    for (let i = 0; i < NAME.length; i++) {
      targetPositions.push({ x: cx + charWidths[i] / 2, y: H / 2 + FONT_SIZE * 0.3 })
      cx += charWidths[i] + 8
    }

    import('matter-js').then((Matter) => {
      const engine = Matter.Engine.create({ gravity: { x: 0, y: 2.5 } })
      engineRef = engine

      const wallOpts = { isStatic: true, restitution: 0.3, friction: 0.5 }
      const floor  = Matter.Bodies.rectangle(W / 2, H + 25, W * 2, 50, wallOpts)
      const wallL  = Matter.Bodies.rectangle(-25, H / 2, 50, H * 2, wallOpts)
      const wallR  = Matter.Bodies.rectangle(W + 25, H / 2, 50, H * 2, wallOpts)
      Matter.World.add(engine.world, [floor, wallL, wallR])

      // Create letter bodies
      for (let i = 0; i < NAME.length; i++) {
        const bw = charWidths[i]
        const bh = FONT_SIZE * 0.8
        const rx = Math.random() * (W - bw) + bw / 2
        const ry = -Math.random() * H - 50
        const body = Matter.Bodies.rectangle(rx, ry, bw, bh, {
          restitution: 0.4,
          friction: 0.4,
          frictionAir: 0.01,
          angle: (Math.random() - 0.5) * Math.PI,
        }) as any
        body.letterIndex = i
        Matter.World.add(engine.world, body)

        letters.push({
          x: rx, y: ry,
          angle: body.angle,
          vx: 0, vy: 0, va: 0,
          targetX: targetPositions[i].x,
          targetY: targetPositions[i].y,
          w: bw,
          char: NAME[i],
          assembling: false,
          assembled: false,
        })
      }

      let assembleTriggered = false

      // Trigger assembly after 1.2s regardless of settling
      setTimeout(() => {
        if (assembleTriggered) return
        assembleTriggered = true
        const bodies = Matter.Composite.allBodies(engine.world).filter((b: any) => b.letterIndex !== undefined)
        bodies.forEach((b: any, idx: number) => {
          setTimeout(() => {
            letters[b.letterIndex].assembling = true
          }, idx * 80)
        })
        setTimeout(() => { isAssembled = true }, bodies.length * 80 + 400)
      }, 1200)

      const loop = () => {
        Matter.Engine.update(engine, 1000 / 60)

        ctx.clearRect(0, 0, W, H)

        const bodies = Matter.Composite.allBodies(engine.world).filter((b: any) => b.letterIndex !== undefined)

        // Update assembling letters
        for (const body of bodies as any[]) {
          const L = letters[body.letterIndex]
          if (!L) continue

          if (L.assembling && !L.assembled) {
            const tx = L.targetX, ty = L.targetY
            const px = body.position.x, py = body.position.y
            const dist = Math.hypot(px - tx, py - ty)

            Matter.Body.setPosition(body, {
              x: px + (tx - px) * 0.18,
              y: py + (ty - py) * 0.18,
            })
            Matter.Body.setAngle(body, body.angle * 0.82)
            Matter.Body.setVelocity(body, { x: body.velocity.x * 0.5, y: body.velocity.y * 0.5 })

            if (dist < 2) L.assembled = true
          }

          L.x = body.position.x
          L.y = body.position.y
          L.angle = body.angle
        }

        // Draw letters
        for (const L of letters) {
          ctx.save()
          ctx.translate(L.x, L.y)
          ctx.rotate(L.angle)

          const distToTarget = Math.hypot(L.x - L.targetX, L.y - L.targetY)
          const glowFactor = L.assembling ? Math.max(0, 1 - distToTarget / 200) : 0

          if (glowFactor > 0.05) {
            ctx.shadowBlur = 20 * glowFactor
            ctx.shadowColor = ACCENT
          } else {
            ctx.shadowBlur = 0
          }

          ctx.font = FONT
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'

          if (isAssembled || L.assembled) {
            ctx.fillStyle = ACCENT
            ctx.shadowBlur = 12
            ctx.shadowColor = ACCENT
          } else {
            const alpha = 0.7 + glowFactor * 0.3
            ctx.fillStyle = `rgba(210,210,235,${alpha})`
          }

          ctx.fillText(L.char, 0, 0)
          ctx.shadowBlur = 0
          ctx.restore()
        }

        rafId = requestAnimationFrame(loop)
      }

      rafId = requestAnimationFrame(loop)

      // Click to explode + reassemble
      const handleClick = () => {
        if (!assembleTriggered) return
        isAssembled = false
        assembleTriggered = false
        for (const L of letters) { L.assembling = false; L.assembled = false }

        const cx = W / 2, cy = H / 2
        for (const body of Matter.Composite.allBodies(engine.world).filter((b: any) => b.letterIndex !== undefined) as any[]) {
          const dx = body.position.x - cx
          const dy = body.position.y - cy
          const dist = Math.hypot(dx, dy) || 1
          Matter.Body.applyForce(body, body.position, {
            x: (dx / dist) * 0.08,
            y: (dy / dist) * 0.08 - 0.05,
          })
          Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3)
        }
      }

      canvas.addEventListener('click', handleClick)

      return () => {
        canvas.removeEventListener('click', handleClick)
      }
    })

    return () => {
      cancelAnimationFrame(rafId)
      if (settleTimer) clearTimeout(settleTimer)
      if (engineRef) {
        import('matter-js').then((Matter) => Matter.Engine.clear(engineRef))
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: 200, position: 'relative' }}
      title="Click to explode"
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  )
}
