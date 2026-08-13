'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useTransform, type MotionValue } from 'framer-motion'
import { portfolioData } from '@/data/portfolio'
import { useStage, slot } from '@/hooks/useStage'
import { useIsMobile } from '@/hooks/useIsMobile'

type Project = (typeof portfolioData.projects)[number] & { image?: string }

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

export default function Projects() {
  const featured = portfolioData.projects.filter((p) => p.featured) as Project[]
  const { ref, progress, reduced } = useStage()
  const isMobile = useIsMobile()

  if (reduced) return <ProjectsStatic featured={featured} />

  return (
    <div
      id="projects"
      ref={ref}
      style={{ position: 'relative', height: `${featured.length * 115}vh` }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: isMobile ? 1100 : 1600,
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Section title — parked top-left, fades once the first window docks */}
        <SectionTitle progress={progress} count={featured.length} />

        {/* Depth rail: the "track" the windows travel along */}
        {!isMobile && <Track progress={progress} count={featured.length} />}

        {/* The windows */}
        <div
          style={{
            position: 'relative',
            width: 'min(1000px, 88vw)',
            height: 'min(620px, 62vh)',
            transformStyle: 'preserve-3d',
          }}
        >
          {featured.map((p, i) => (
            <Window
              key={p.id}
              project={p}
              index={i}
              count={featured.length}
              progress={progress}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Progress rail */}
        <Counter progress={progress} featured={featured} />
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- window */

function Window({
  project,
  index,
  count,
  progress,
  isMobile,
}: {
  project: Project
  index: number
  count: number
  progress: MotionValue<number>
  isMobile: boolean
}) {
  const [t0, t1, t2, t3] = slot(index, count, 0.46)
  const fadeIn = t0 + (t1 - t0) * 0.55
  const fadeOut = t2 + (t3 - t2) * 0.45

  // Approach from deep space → dock dead centre → bank away past the camera.
  const z = useTransform(progress, [t0, t1, t2, t3], [-2400, 0, 0, 620])
  const x = useTransform(progress, [t0, t1, t2, t3], ['34%', '0%', '0%', '-42%'])
  const rotateY = useTransform(progress, [t0, t1, t2, t3], isMobile ? [14, 0, 0, -12] : [36, 0, 0, -32])
  const rotateX = useTransform(progress, [t0, t1, t2, t3], [10, 0, 0, -6])
  const opacity = useTransform(progress, [t0, fadeIn, fadeOut, t3], [0, 1, 1, 0])

  // While docked, the screenshot scrolls inside the frame — the illusion that
  // you are browsing the live site rather than looking at a still.
  const viewportRef = useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = useState(0)
  const shotY = useTransform(progress, [t1, t2], [0, -scrollable])

  const measure = (img: HTMLImageElement) => {
    const vp = viewportRef.current
    if (!vp || !img.naturalWidth) return
    const rendered = vp.clientWidth * (img.naturalHeight / img.naturalWidth)
    setScrollable(Math.max(0, rendered - vp.clientHeight))
  }

  useEffect(() => {
    const onResize = () => {
      const img = viewportRef.current?.querySelector('img')
      if (img) measure(img as HTMLImageElement)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const host = project.live ? new URL(project.live).host : `${project.id}.local`

  return (
    <motion.article
      style={{
        position: 'absolute',
        inset: 0,
        z,
        x,
        rotateY,
        rotateX,
        opacity,
        transformStyle: 'preserve-3d',
        willChange: 'transform, opacity',
        borderRadius: 14,
        overflow: 'hidden',
        background: '#ffffff',
        border: `1px solid ${project.color}2e`,
        boxShadow: `0 40px 120px rgba(22,21,15,0.16), 0 0 0 1px ${project.color}14, 0 0 90px ${project.color}12`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'rgba(22,21,15,0.04)',
          borderBottom: '1px solid rgba(22,21,15,0.07)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.85 }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            maxWidth: 380,
            margin: '0 auto',
            background: 'rgba(22,21,15,0.06)',
            borderRadius: 6,
            padding: '4px 12px',
            fontFamily: 'monospace',
            fontSize: 11,
            color: 'rgba(22,21,15,0.5)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {host}
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: project.color,
            background: project.color + '18',
            border: `1px solid ${project.color}33`,
            borderRadius: 4,
            padding: '2px 7px',
            flexShrink: 0,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Site viewport */}
      <div ref={viewportRef} style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#f4f3ef' }}>
        {project.image ? (
          <motion.img
            src={project.image}
            alt={project.name}
            loading="lazy"
            decoding="async"
            onLoad={(e) => measure(e.currentTarget)}
            style={{ width: '100%', height: 'auto', display: 'block', y: shotY }}
          />
        ) : (
          <CodeShot project={project} />
        )}

        {/* Bottom scrim + meta */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.72) 26%, transparent 52%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 'clamp(16px, 3vw, 30px)' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.16em',
              color: project.color,
              textTransform: 'uppercase',
              marginBottom: 8,
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            {project.category}
          </div>
          <h3
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(1.6rem, 3.4vw, 2.8rem)',
              color: '#16150f',
              lineHeight: 1.05,
              marginBottom: 10,
            }}
          >
            {project.name}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 'clamp(12px, 1.3vw, 14px)',
              color: 'rgba(22,21,15,0.6)',
              lineHeight: 1.6,
              maxWidth: 520,
              marginBottom: 16,
            }}
          >
            {project.shortDesc}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {project.tech.slice(0, 4).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: 'rgba(22,21,15,0.55)',
                  background: 'rgba(22,21,15,0.06)',
                  border: '1px solid rgba(22,21,15,0.1)',
                  borderRadius: 3,
                  padding: '3px 8px',
                }}
              >
                {t}
              </span>
            ))}
            <span style={{ flex: 1 }} />
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  color: 'rgba(22,21,15,0.6)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-dm-sans)',
                }}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  color: project.color,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-dm-sans)',
                  fontWeight: 600,
                }}
              >
                <ExternalIcon /> Visit
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

/** Fallback panel for projects with no screenshot. */
function CodeShot({ project }: { project: Project }) {
  const lines = [
    ['const', ' app', ' = ', 'express', '()'],
    ['app', '.use', '(', 'auth', ')'],
    ['await', ' db.', 'connect', '(', 'MONGO_URI', ')'],
    ['export', ' default', ' ', project.name, ''],
  ]
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        padding: 'clamp(20px, 4vw, 44px)',
        fontFamily: 'monospace',
        fontSize: 'clamp(11px, 1.2vw, 14px)',
        lineHeight: 2.1,
        color: 'rgba(22,21,15,0.28)',
        background: `radial-gradient(70% 60% at 30% 25%, ${project.color}12, transparent 70%)`,
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>
          <span style={{ color: 'rgba(22,21,15,0.14)', marginRight: 16 }}>{String(i + 1).padStart(2, '0')}</span>
          {l.map((tok, j) => (
            <span key={j} style={{ color: j === 3 ? project.color : undefined }}>
              {tok}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------ furniture */

function SectionTitle({ progress, count }: { progress: MotionValue<number>; count: number }) {
  const [, t1] = slot(0, count, 0.46)
  const opacity = useTransform(progress, [0, 0.03, t1 * 0.9, t1], [0, 1, 1, 0.28])
  const y = useTransform(progress, [0, t1], [0, -20])

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 'clamp(24px, 6vh, 64px)',
        left: 'clamp(16px, 5vw, 64px)',
        zIndex: 20,
        opacity,
        y,
        pointerEvents: 'none',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: 12,
          color: '#e2701f',
          letterSpacing: '0.18em',
          marginBottom: 6,
        }}
      >
        // Featured
      </p>
      <h2
        style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(2rem, 5vw, 4rem)',
          color: '#16150f',
          lineHeight: 1,
        }}
      >
        SELECTED WORK
      </h2>
    </motion.div>
  )
}

/** Perspective rails receding to the vanishing point — the track. */
function Track({ progress, count }: { progress: MotionValue<number>; count: number }) {
  const opacity = useTransform(progress, [0, 0.06, 0.94, 1], [0, 0.5, 0.5, 0])
  const dashY = useTransform(progress, [0, 1], [0, 120 * count * 8])

  return (
    <motion.div
      aria-hidden
      style={{ position: 'absolute', inset: 0, opacity, pointerEvents: 'none', perspective: 600, overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', inset: 0, perspectiveOrigin: '50% 50%' }}>
        <motion.div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 340,
            height: '300vh',
            marginLeft: -170,
            transformOrigin: '50% 0%',
            rotateX: 82,
            y: dashY,
            backgroundImage:
              'linear-gradient(90deg, rgba(226,112,31,0.35) 2px, transparent 2px),' +
              'linear-gradient(90deg, transparent calc(100% - 2px), rgba(226,112,31,0.35) calc(100% - 2px)),' +
              'repeating-linear-gradient(0deg, rgba(22,21,15,0.16) 0 40px, transparent 40px 120px)',
            backgroundSize: '100% 100%, 100% 100%, 3px 120px',
            backgroundPosition: '0 0, 0 0, 50% 0',
            backgroundRepeat: 'no-repeat, no-repeat, repeat-y',
            maskImage: 'linear-gradient(to bottom, transparent, #000 12%, #000 40%, transparent 70%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 12%, #000 40%, transparent 70%)',
          }}
        />
      </div>
    </motion.div>
  )
}

function Counter({ progress, featured }: { progress: MotionValue<number>; featured: Project[] }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: 'clamp(14px, 4vw, 52px)',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        pointerEvents: 'none',
      }}
    >
      {featured.map((p, i) => (
        <Tick key={p.id} project={p} index={i} count={featured.length} progress={progress} />
      ))}
    </div>
  )
}

function Tick({
  project,
  index,
  count,
  progress,
}: {
  project: Project
  index: number
  count: number
  progress: MotionValue<number>
}) {
  const [t0, t1, t2, t3] = slot(index, count, 0.46)
  const active = useTransform(progress, [t0, t1, t2, t3], [0, 1, 1, 0])
  const scaleY = useTransform(active, [0, 1], [0.35, 1])
  const bg = useTransform(active, [0, 1], ['rgba(22,21,15,0.18)', project.color])

  return (
    <motion.span
      style={{
        display: 'block',
        width: 3,
        height: 30,
        borderRadius: 2,
        background: bg,
        scaleY,
        transformOrigin: '50% 50%',
      }}
    />
  )
}

/* --------------------------------------------- prefers-reduced-motion fallback */

function ProjectsStatic({ featured }: { featured: Project[] }) {
  return (
    <section id="projects" style={{ padding: 'clamp(60px, 10vw, 120px) clamp(16px, 4vw, 24px)', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#e2701f', letterSpacing: '0.15em', marginBottom: 12 }}>
          // Featured
        </p>
        <h2 style={{ fontFamily: 'var(--font-bebas)', fontSize: 'clamp(3rem, 6vw, 5rem)', color: '#16150f', lineHeight: 1, marginBottom: 56 }}>
          SELECTED WORK
        </h2>
        <div style={{ display: 'grid', gap: 32 }}>
          {featured.map((p) => (
            <a
              key={p.id}
              href={p.live || p.github || undefined}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: '#ffffff',
                border: `1px solid ${p.color}2e`,
                borderRadius: 14,
                padding: 28,
                textDecoration: 'none',
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', color: p.color, textTransform: 'uppercase', marginBottom: 8 }}>
                {p.category}
              </div>
              <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '2rem', color: '#16150f', marginBottom: 8 }}>{p.name}</h3>
              <p style={{ color: 'rgba(22,21,15,0.6)', fontSize: 14, lineHeight: 1.6 }}>{p.shortDesc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
