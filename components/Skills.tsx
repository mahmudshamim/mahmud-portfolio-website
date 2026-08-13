'use client'

import { motion, useTransform, type MotionValue } from 'framer-motion'
import { portfolioData } from '@/data/portfolio'
import { useStage } from '@/hooks/useStage'
import { useIsMobile } from '@/hooks/useIsMobile'

const DEVICONS = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons'

const SKILL_ICONS: Record<string, string> = {
  'Figma': `${DEVICONS}/figma/figma-original.svg`,
  'Next.js': `${DEVICONS}/nextjs/nextjs-original.svg`,
  'WordPress': `${DEVICONS}/wordpress/wordpress-original.svg`,
  'React': `${DEVICONS}/react/react-original.svg`,
  'React.js': `${DEVICONS}/react/react-original.svg`,
  'Tailwind CSS': `${DEVICONS}/tailwindcss/tailwindcss-original.svg`,
  'Node.js': `${DEVICONS}/nodejs/nodejs-original.svg`,
  'MongoDB': `${DEVICONS}/mongodb/mongodb-original.svg`,
  'JavaScript': `${DEVICONS}/javascript/javascript-original.svg`,
  'TypeScript': `${DEVICONS}/typescript/typescript-original.svg`,
  'Express': `${DEVICONS}/express/express-original.svg`,
  'AWS Amplify': `${DEVICONS}/amazonwebservices/amazonwebservices-original-wordmark.svg`,
  'Cloudinary': `${DEVICONS}/cloudinary/cloudinary-original.svg`,
  'Graphic Design': `${DEVICONS}/photoshop/photoshop-original.svg`,
  'UI Design': `${DEVICONS}/figma/figma-original.svg`,
  'UX Design': `${DEVICONS}/adobexd/adobexd-original.svg`,
  'Wireframing': `${DEVICONS}/framer/framer-original.svg`,
  'Prototyping': `${DEVICONS}/framer/framer-original.svg`,
}

/** Order decides the order the camera meets them, so they arrive in waves. */
const CATEGORY_ORDER = ['Frontend', 'Backend', 'Design', 'CMS', 'Tools'] as const

const skills = (() => {
  const seen = new Set<string>()
  return portfolioData.skills
    .filter((s) => {
      if (!(s.name in SKILL_ICONS) || seen.has(s.name)) return false
      seen.add(s.name)
      return true
    })
    .sort(
      (a, b) =>
        CATEGORY_ORDER.indexOf(a.category as (typeof CATEGORY_ORDER)[number]) -
          CATEGORY_ORDER.indexOf(b.category as (typeof CATEGORY_ORDER)[number]) || b.level - a.level
    )
})()

const CAMERA_TRAVEL = 4200
const GOLDEN = 2.399963229728653

export default function Skills() {
  const { ref, progress, reduced } = useStage()
  const isMobile = useIsMobile()

  if (reduced) return <SkillsStatic />

  return (
    <div id="skills" ref={ref} style={{ position: 'relative', height: '320vh' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          perspective: isMobile ? 700 : 900,
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Heading — parked, fades as the flight starts */}
        <Heading progress={progress} />

        {/* The cloud */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformStyle: 'preserve-3d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ position: 'relative', width: 0, height: 0, transformStyle: 'preserve-3d' }}>
            {skills.map((s, i) => (
              <Node key={s.name} skill={s} index={i} total={skills.length} progress={progress} isMobile={isMobile} />
            ))}
          </div>
        </div>

        {/* Category readout — swaps as you pass through each layer */}
        <CategoryReadout progress={progress} />
      </div>
    </div>
  )
}

function Node({
  skill,
  index,
  total,
  progress,
  isMobile,
}: {
  skill: (typeof portfolioData.skills)[number]
  index: number
  total: number
  progress: MotionValue<number>
  isMobile: boolean
}) {
  // Golden-angle spiral keeps the nodes evenly spread around the flight path
  // without ever sitting dead centre (which would collide with the readout).
  const angle = index * GOLDEN
  const ring = 1 + (index % 3) * 0.42
  const radius = (isMobile ? 150 : 270) * ring

  // Rounded to whole pixels on purpose. These trig results run to full float
  // precision (-233.6070266333721), React serialises that into the SSR style
  // attribute verbatim, and the browser normalises it to -233.607px on parse —
  // so hydration compares two different numbers and reports a mismatch. Whole
  // pixels survive the round trip unchanged, and sub-pixel placement in a
  // scattered cloud buys nothing.
  const x = Math.round(Math.cos(angle) * radius)
  const y = Math.round(Math.sin(angle) * radius * 0.62)

  // Depth ordered by list position → the sorted categories arrive in waves.
  // Rounded for the same reason: this seeds the initial translateZ.
  const z0 = Math.round(-420 - (index / total) * 3400)

  const z = useTransform(progress, [0, 1], [z0, z0 + CAMERA_TRAVEL])
  const opacity = useTransform(z, [z0, -2400, -1500, -60, 200], [0, 0, 1, 1, 0])

  const icon = SKILL_ICONS[skill.name]

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        z,
        opacity,
        translateX: '-50%',
        translateY: '-50%',
        willChange: 'transform, opacity',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: isMobile ? 48 : 64,
          height: isMobile ? 48 : 64,
          borderRadius: 14,
          /* Opaque fill rather than a translucent one with backdrop-filter:
             there can be 20+ of these in flight at once and each blurred
             backdrop is recomputed every frame. */
          background: '#ffffff',
          border: `1px solid ${skill.color}40`,
          boxShadow: `0 0 28px ${skill.color}22, inset 0 0 20px ${skill.color}0d`,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={icon}
          alt=""
          loading="lazy"
          decoding="async"
          width={isMobile ? 24 : 32}
          height={isMobile ? 24 : 32}
          style={{ display: 'block', filter: 'drop-shadow(0 2px 6px rgba(22,21,15,0.13))' }}
        />
      </div>
      <span
        style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: isMobile ? 10 : 12,
          fontWeight: 600,
          color: 'rgba(22,21,15,0.72)',
          whiteSpace: 'nowrap',
          textShadow: '0 2px 10px rgba(244,243,239,0.9)',
        }}
      >
        {skill.name}
      </span>
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: 9,
          color: skill.color,
          letterSpacing: '0.08em',
        }}
      >
        {skill.level}%
      </span>
    </motion.div>
  )
}

function Heading({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.04, 0.14, 0.2], [0, 1, 1, 0])
  const z = useTransform(progress, [0, 0.2], [0, 420])

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        zIndex: 20,
        opacity,
        z,
        pointerEvents: 'none',
        textAlign: 'center',
        padding: '0 24px',
      }}
    >
      <div>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: '#7a5bd6', letterSpacing: '0.18em', marginBottom: 8 }}>
          // Toolkit
        </p>
        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', color: '#16150f', lineHeight: 1 }}>
          WHAT I BUILD WITH
        </h2>
      </div>
    </motion.div>
  )
}

/** The category you are currently flying through. */
function CategoryReadout({ progress }: { progress: MotionValue<number> }) {
  // Where each category's block of nodes sits along the flight, derived from
  // the same sort order the nodes use.
  const bounds = CATEGORY_ORDER.map((cat) => {
    const first = skills.findIndex((s) => s.category === cat)
    const count = skills.filter((s) => s.category === cat).length
    return { cat, start: first / skills.length, end: (first + count) / skills.length, count }
  }).filter((b) => b.count > 0)

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 'clamp(28px, 8vh, 72px)',
        left: 0,
        right: 0,
        display: 'grid',
        placeItems: 'center',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <div style={{ position: 'relative', height: 44 }}>
        {bounds.map((b) => (
          <CategoryLabel key={b.cat} label={b.cat} start={b.start} end={b.end} progress={progress} />
        ))}
      </div>
    </div>
  )
}

function CategoryLabel({
  label,
  start,
  end,
  progress,
}: {
  label: string
  start: number
  end: number
  progress: MotionValue<number>
}) {
  // Nodes become readable roughly a third of the way after they spawn, so the
  // label leads its block slightly.
  const lead = 0.12
  const a = Math.max(0, start - lead)
  const b = Math.max(0, end - lead)
  const fade = (b - a) * 0.22

  const opacity = useTransform(progress, [a, a + fade, b - fade, b], [0, 1, 1, 0])
  const y = useTransform(progress, [a, b], [14, -14])

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        translateX: '-50%',
        opacity,
        y,
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-bebas)',
        fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
        letterSpacing: '0.14em',
        color: '#16150f',
        textShadow: '0 4px 24px rgba(244,243,239,0.9)',
      }}
    >
      {label.toUpperCase()}
    </motion.div>
  )
}

function SkillsStatic() {
  return (
    <section id="skills" style={{ padding: 'clamp(60px, 10vw, 120px) clamp(16px, 4vw, 24px)', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#7a5bd6', letterSpacing: '0.15em', marginBottom: 12 }}>
          // Toolkit
        </p>
        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#16150f', lineHeight: 1, marginBottom: 48 }}>
          WHAT I BUILD WITH
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {skills.map((s) => (
            <span
              key={s.name}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 10,
                background: '#ffffff',
                border: `1px solid ${s.color}40`,
                fontFamily: 'var(--font-dm-sans)',
                fontSize: 13,
                color: 'rgba(22,21,15,0.8)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={SKILL_ICONS[s.name]} alt="" width={18} height={18} />
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
