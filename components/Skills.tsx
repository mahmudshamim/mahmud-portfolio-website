'use client'

import { useEffect, useRef } from 'react'
import Matter, { Engine, World, Bodies, Body, Runner, Mouse, MouseConstraint } from 'matter-js'
import { portfolioData } from '@/data/portfolio'

const additionalTech = [
  { name: "Node.js", level: 60, category: "Backend", color: "#339933" },
  { name: "MongoDB", level: 58, category: "Backend", color: "#47A248" },
  { name: "JavaScript", level: 70, category: "Frontend", color: "#F7DF1E" },
  { name: "TypeScript", level: 50, category: "Frontend", color: "#3178C6" },
  { name: "Express", level: 55, category: "Backend", color: "#888888" },
  { name: "MySQL", level: 52, category: "Backend", color: "#4479A1" },
]

const DEVICONS = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons'

const SKILL_ICONS: Record<string, string> = {
  'Figma': `${DEVICONS}/figma/figma-original.svg`,
  'Next.js': `${DEVICONS}/nextjs/nextjs-original.svg`,
  'WordPress': `${DEVICONS}/wordpress/wordpress-original.svg`,
  'React.js': `${DEVICONS}/react/react-original.svg`,
  'Tailwind CSS': `${DEVICONS}/tailwindcss/tailwindcss-original.svg`,
  'Node.js': `${DEVICONS}/nodejs/nodejs-original.svg`,
  'MongoDB': `${DEVICONS}/mongodb/mongodb-original.svg`,
  'JavaScript': `${DEVICONS}/javascript/javascript-original.svg`,
  'TypeScript': `${DEVICONS}/typescript/typescript-original.svg`,
  'Express': `${DEVICONS}/express/express-original.svg`,
  'MySQL': `${DEVICONS}/mysql/mysql-original.svg`,
  'AWS Amplify': `${DEVICONS}/amazonwebservices/amazonwebservices-original-wordmark.svg`,
  'Cloudinary': `${DEVICONS}/cloudinary/cloudinary-original.svg`,
  'Graphic Design': `${DEVICONS}/photoshop/photoshop-original.svg`,
  'UI Design': `${DEVICONS}/figma/figma-original.svg`,
  'UX Design': `${DEVICONS}/adobexd/adobexd-original.svg`,
  'Wireframing': `${DEVICONS}/framer/framer-original.svg`,
  'Prototyping': `${DEVICONS}/framer/framer-original.svg`,
}

const allSkills = [...portfolioData.skills, ...additionalTech].filter(s => s.name in SKILL_ICONS)

export default function Skills() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let canvasWidth = container.clientWidth
    // Scale ball sizes based on screen width (mobile: smaller, desktop: full size)
    const ballScale = Math.min(1, canvasWidth / 900)
    let canvasHeight = 600
    const floorY = canvasHeight

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    const ctx = canvas.getContext('2d')!

    // Preload icons
    const iconImages: Record<string, HTMLImageElement> = {}
    const iconPromises = Object.entries(SKILL_ICONS).map(([name, url]) =>
      new Promise<void>((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => { iconImages[name] = img; resolve() }
        img.onerror = () => resolve()
        img.src = url
      })
    )

    // Engine
    const engine = Engine.create({ gravity: { x: 0, y: 1.2 } })
    const world = engine.world

    // Dynamic walls for resizing
    let floor = Bodies.rectangle(canvasWidth / 2, canvasHeight + 25, canvasWidth, 50, { isStatic: true, friction: 0.3, restitution: 0.4 })
    let wallL = Bodies.rectangle(-25, canvasHeight / 2, 50, canvasHeight * 2, { isStatic: true, friction: 0.3, restitution: 0.4 })
    let wallR = Bodies.rectangle(canvasWidth + 25, canvasHeight / 2, 50, canvasHeight * 2, { isStatic: true, friction: 0.3, restitution: 0.4 })
    World.add(world, [floor, wallL, wallR])

    // Skill balls
    const skillBalls: { body: Matter.Body; skill: typeof allSkills[0]; R: number }[] = []

    allSkills.forEach((skill, i) => {
      const R = (35 + (skill.level / 100) * 25) * ballScale
      const x = 100 + Math.random() * (canvasWidth - 200)
      const y = -100 - i * 90 - Math.random() * 150

      const body = Bodies.circle(x, y, R, {
        restitution: 0.78,
        friction: 0.05,
        frictionAir: 0.012,
        label: skill.name,
      });

      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 5,
        y: Math.random() * 3,
      })

      World.add(world, body)
      skillBalls.push({ body, skill, R })
    })

    // Resize listener
    const handleResize = () => {
      if (!container || !canvas) return
      canvasWidth = container.clientWidth
      canvas.width = canvasWidth
      
      // Update walls
      Body.setPosition(floor, { x: canvasWidth / 2, y: canvasHeight + 25 })
      Body.setPosition(wallL, { x: -25, y: canvasHeight / 2 })
      Body.setPosition(wallR, { x: canvasWidth + 25, y: canvasHeight / 2 })
    }
    window.addEventListener('resize', handleResize)

    // Mouse constraint
    const mouse = Mouse.create(canvas)
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    })
    World.add(world, mouseConstraint)

    // Click — explode nearby balls
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = (e.clientX - rect.left) * (canvas.width / rect.width)
      const clickY = (e.clientY - rect.top) * (canvas.height / rect.height)
      skillBalls.forEach(({ body }) => {
        const dx = body.position.x - clickX
        const dy = body.position.y - clickY
        const dist = Math.hypot(dx, dy) || 1
        if (dist < 160) {
          const force = 0.055 / dist
          Body.applyForce(body, body.position, {
            x: (dx / dist) * force,
            y: (dy / dist) * force - 0.008,
          })
        }
      })
    })

    // Gravity tilt on mousemove
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) / rect.width
      const my = (e.clientY - rect.top) / rect.height
      engine.gravity.x = (mx - 0.5) * 1.2
      engine.gravity.y = 0.6 + my * 0.8
    })

    canvas.addEventListener('mouseleave', () => {
      engine.gravity.x = 0
      engine.gravity.y = 1.2
    })

    // Render loop
    const runner = Runner.create()
    Runner.run(runner, engine)

    let animFrameId: number

    const draw = () => {
      animFrameId = requestAnimationFrame(draw)

      // Dark background
      ctx.fillStyle = '#050508'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      skillBalls.forEach(({ body, skill, R }) => {
        const img = iconImages[skill.name]
        if (!img) return  // skip balls whose icon failed to load

        const x = body.position.x
        const y = body.position.y
        const angle = body.angle

        // Parse skill color
        const hex = skill.color.replace('#', '')
        const r = parseInt(hex.slice(0, 2), 16)
        const g = parseInt(hex.slice(2, 4), 16)
        const b = parseInt(hex.slice(4, 6), 16)

        // Floor shadow
        const shadowDist = floorY - y
        if (shadowDist > 0 && shadowDist < 300) {
          const shadowOpacity = Math.max(0, 0.3 * (1 - shadowDist / 300))
          const shadowScale = Math.max(0.3, 1 - shadowDist / 400)
          ctx.save()
          ctx.translate(x, floorY - 4)
          ctx.scale(shadowScale, 0.2)
          const shadowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, R)
          shadowGrad.addColorStop(0, `rgba(0,0,0,${shadowOpacity})`)
          shadowGrad.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.beginPath()
          ctx.arc(0, 0, R, 0, Math.PI * 2)
          ctx.fillStyle = shadowGrad
          ctx.fill()
          ctx.restore()
        }

        // Outer color glow (behind sphere)
        ctx.save()
        ctx.translate(x, y)
        const glowGrad = ctx.createRadialGradient(0, 0, R * 0.8, 0, 0, R * 1.5)
        glowGrad.addColorStop(0, `rgba(${r},${g},${b}, 0.15)`)
        glowGrad.addColorStop(0.5, `rgba(${r},${g},${b}, 0.06)`)
        glowGrad.addColorStop(1, `rgba(${r},${g},${b}, 0)`)
        ctx.beginPath()
        ctx.arc(0, 0, R * 1.5, 0, Math.PI * 2)
        ctx.fillStyle = glowGrad
        ctx.fill()
        ctx.restore()

        // 3D sphere (rotates with body)
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(angle)

        // Base — pure white core fading to very light grey at edge
        const baseGrad = ctx.createRadialGradient(
          -R * 0.3, -R * 0.3, R * 0.02,
           R * 0.1,  R * 0.1,  R * 1.0
        )
        baseGrad.addColorStop(0,    'rgba(255,255,255,1)')
        baseGrad.addColorStop(0.5,  'rgba(250,252,255,1)')
        baseGrad.addColorStop(0.85, 'rgba(220,228,245,1)')
        baseGrad.addColorStop(1,    'rgba(185,198,228,1)')
        ctx.beginPath()
        ctx.arc(0, 0, R, 0, Math.PI * 2)
        ctx.fillStyle = baseGrad
        ctx.fill()

        // Very subtle color tint — just a hint at the bottom edge
        const tintGrad = ctx.createRadialGradient(R * 0.1, R * 0.3, 0, R * 0.1, R * 0.3, R * 1.1)
        tintGrad.addColorStop(0,   `rgba(${r},${g},${b}, 0.06)`)
        tintGrad.addColorStop(0.6, `rgba(${r},${g},${b}, 0.04)`)
        tintGrad.addColorStop(1,   `rgba(${r},${g},${b}, 0.14)`)
        ctx.beginPath()
        ctx.arc(0, 0, R, 0, Math.PI * 2)
        ctx.fillStyle = tintGrad
        ctx.fill()

        // Main specular — large bright spot top-left
        const specMain = ctx.createRadialGradient(
          -R * 0.42, -R * 0.42, 0,
          -R * 0.28, -R * 0.28, R * 0.65
        )
        specMain.addColorStop(0,    'rgba(255,255,255,1)')
        specMain.addColorStop(0.15, 'rgba(255,255,255,0.9)')
        specMain.addColorStop(0.4,  'rgba(255,255,255,0.4)')
        specMain.addColorStop(0.75, 'rgba(255,255,255,0.05)')
        specMain.addColorStop(1,    'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.arc(0, 0, R, 0, Math.PI * 2)
        ctx.fillStyle = specMain
        ctx.fill()

        // Small sharp glint at top-left
        const glint = ctx.createRadialGradient(
          -R * 0.45, -R * 0.45, 0,
          -R * 0.45, -R * 0.45, R * 0.18
        )
        glint.addColorStop(0,   'rgba(255,255,255,1)')
        glint.addColorStop(0.5, 'rgba(255,255,255,0.6)')
        glint.addColorStop(1,   'rgba(255,255,255,0)')
        ctx.beginPath()
        ctx.arc(0, 0, R, 0, Math.PI * 2)
        ctx.fillStyle = glint
        ctx.fill()

        // Rim shadow — dark only at the very edge
        const rimGrad = ctx.createRadialGradient(0, 0, R * 0.72, 0, 0, R)
        rimGrad.addColorStop(0,   'rgba(0,0,0,0)')
        rimGrad.addColorStop(0.8, 'rgba(0,0,0,0)')
        rimGrad.addColorStop(1,   'rgba(10,10,30,0.45)')
        ctx.beginPath()
        ctx.arc(0, 0, R, 0, Math.PI * 2)
        ctx.fillStyle = rimGrad
        ctx.fill()

        ctx.restore()

        // Icon — upright, clipped to circle
        if (img) {
          ctx.save()
          ctx.translate(x, y)
          ctx.beginPath()
          ctx.arc(0, 0, R * 0.72, 0, Math.PI * 2)
          ctx.clip()
          const iconSize = R * 0.95
          ctx.globalAlpha = 0.82
          ctx.drawImage(img, -iconSize / 2, -iconSize / 2, iconSize, iconSize)
          ctx.globalAlpha = 1
          ctx.restore()
        }
      })
    }

    // Start loop (icons load async — draw loop runs immediately, icons appear as they load)
    Promise.allSettled(iconPromises).then(() => { })
    draw()

    return () => {
      cancelAnimationFrame(animFrameId)
      window.removeEventListener('resize', handleResize)
      Runner.stop(runner)
      skillBalls.forEach(({ body }) => World.remove(world, body))
      World.clear(world, false)
      Engine.clear(engine)
    }
  }, [])

  return (
    <section
      style={{
        background: '#050508',
        padding: '120px 24px 80px',
        position: 'relative',
        minHeight: '800px',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 13,
            color: '#4f8ef7',
            letterSpacing: '0.15em',
            marginBottom: 12,
            textTransform: 'uppercase',
          }}>
            // Technical Arsenal
          </p>
          <h2 style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            color: '#e2e2f0',
            lineHeight: 1,
            marginBottom: 16,
          }}>
            MY SKILLS
          </h2>
          <p style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 14,
            color: 'rgba(226,226,240,0.4)',
            letterSpacing: '0.05em',
          }}>
            Click or move mouse to interact · Drag the balls
          </p>
        </div>

        <div ref={containerRef} style={{ width: '100%', background: '#050508', borderRadius: 12, overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: '100%',
              height: '600px',
              cursor: 'grab',
              borderRadius: 12,
            }}
          />
        </div>
      </div>
    </section>
  )
}
