'use client'

import { motion, useTransform, type MotionValue } from 'framer-motion'
import { portfolioData } from '@/data/portfolio'
import { useStage } from '@/hooks/useStage'
import { useIsMobile } from '@/hooks/useIsMobile'
import { T, inkA } from '@/lib/theme'

type Project = (typeof portfolioData.projects)[number] & { image?: string }

/* Every project, not just the featured ones. Splitting them across a panel
   sequence and a separate grid meant half the work sat somewhere nobody
   scrolled to. `featured` still orders them — flagged projects come first. */
const all = [...portfolioData.projects].sort(
  (a, b) => Number(b.featured) - Number(a.featured)
) as Project[]
const N = all.length

/*
 * Fan and cascade spacing is capped so the deck always fits the frame.
 *
 * With four cards, `MINI * 62` gave a good overlap. With eleven it threw the
 * outermost card to ±93% of the panel width — right off screen. Taking the
 * lower of the two keeps the original look at small counts and compresses
 * automatically as projects are added.
 */
const span = (perCard: number, total: number) => Math.min(perCard, total / Math.max(1, N - 1))

/*
 * Four beats off one pinned stage:
 *
 *   0 → FAN_END       a squared-up deck fans into an arc
 *   → CASCADE_END     the arc falls into a diagonal stagger
 *   → per-slot        one project opens to full panel size while the rest
 *                     park at the top-right edge, peeking in
 *   → 1               ...repeated for each project in turn
 *
 * Cards live in the DOM at full panel size and are scaled DOWN for the fan and
 * cascade. Doing it the other way — small cards scaled up — rasterises the
 * layer at 1x and stretches the bitmap, so the hero panel would open blurry.
 *
 * All offsets are percentages of the panel box rather than pixels, so the
 * geometry holds at any viewport. framer applies translate before scale, so
 * these resolve against the unscaled card.
 */
const FAN_END = 0.24
const CASCADE_END = 0.44

/** Card size during fan/cascade, as a fraction of the full panel. */
const MINI = { desktop: 0.3, mobile: 0.42 } as const

/** The window in which project `i` holds the panel. */
function focusSlot(i: number) {
  const size = (1 - CASCADE_END) / N
  const start = CASCADE_END + i * size
  return { start, end: start + size, pad: size * 0.26 }
}

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

export default function Projects() {
  const { ref, progress, reduced } = useStage()
  const isMobile = useIsMobile()

  if (reduced) return <ProjectsStatic />

  const mini = isMobile ? MINI.mobile : MINI.desktop

  /* Three constraints so the panel plus its heading and controls always fit:
     a hard cap, the viewport width, and the viewport height via the 16:9
     ratio (105vh wide => ~59vh tall). */
  const panelWidth = isMobile ? 'min(92vw, 78vh)' : 'min(980px, 86vw, 105vh)'

  return (
    <div id="projects" ref={ref} style={{ position: 'relative', height: `${N * 72 + 70}vh` }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? 14 : 20,
          padding: '0 clamp(16px, 4vw, 40px)',
        }}
      >
        <Intro progress={progress} />

        {/* Heading rail — cross-fades to whichever project holds the panel. */}
        <div style={{ position: 'relative', width: panelWidth, height: isMobile ? 56 : 84 }}>
          {all.map((p, i) => (
            <PanelHeading key={p.id} project={p} index={i} progress={progress} isMobile={isMobile} />
          ))}
        </div>

        {/* Panel box. Cards are absolutely positioned to fill it. */}
        <div style={{ position: 'relative', width: panelWidth, aspectRatio: '16 / 9' }}>
          {all.map((p, i) => (
            <Card key={p.id} project={p} index={i} progress={progress} mini={mini} isMobile={isMobile} />
          ))}
        </div>

        {/* Controls rail */}
        <div
          style={{
            position: 'relative',
            width: panelWidth,
            height: isMobile ? 38 : 44,
          }}
        >
          {all.map((p, i) => (
            <PanelControls key={p.id} project={p} index={i} progress={progress} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ card */

function Card({
  project,
  index,
  progress,
  mini,
  isMobile,
}: {
  project: Project
  index: number
  progress: MotionValue<number>
  mini: number
  isMobile: boolean
}) {
  const mid = (N - 1) / 2
  const off = index - mid
  const { start, end, pad } = focusSlot(index)

  // Arc: spread sideways, edges dipping. Multiplied by `mini` so the spacing
  // is relative to the shrunken card, not the full panel.
  const fanX = off * span(mini * 62, 84)
  const fanY = off * off * span(mini * 9, 16)
  const fanR = off * span(isMobile ? 5 : 8, 34)

  // Staircase: same order, falling left to right.
  const casX = off * span(mini * 56, 78)
  const casY = off * span(mini * 46, 56)
  const casR = index % 2 === 0 ? -3.5 : 3.5

  // Parked: tucked against the top-right edge, half out of frame.
  const parkX = 42 + (index / Math.max(1, N - 1)) * 16
  const parkY = -38 + (index / Math.max(1, N - 1)) * 12
  const parkR = -9 + (index / Math.max(1, N - 1)) * 18
  const parkScale = mini * 0.66

  const points = [0, FAN_END, CASCADE_END, start, start + pad, end - pad, end, 1]

  const x = useTransform(progress, points, [0, fanX, casX, parkX, 0, 0, parkX, parkX].map(v => `${v}%`))
  const y = useTransform(progress, points, [0, fanY, casY, parkY, 0, 0, parkY, parkY].map(v => `${v}%`))
  const rotate = useTransform(progress, points, [0, fanR, casR, parkR, 0, 0, parkR, parkR])
  const scale = useTransform(progress, points, [mini * 0.9, mini, mini, parkScale, 1, 1, parkScale, parkScale])
  const opacity = useTransform(progress, points, [1, 1, 1, 0.55, 1, 1, 0.55, 0.55])

  /* Stepped, not eased: this only decides which card sits on top.
     Resting order is reversed — `N - index`, not `index` — so the first
     project is the one in front of the fan rather than the one buried under
     every other card. The focused card still outranks all of them. */
  const zIndex = useTransform(
    progress,
    [start, start + 0.001, end, end + 0.001],
    [N - index, 100, 100, N - index]
  )

  return (
    <motion.a
      href={project.live || project.github || undefined}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${project.name} — ${project.shortDesc}`}
      style={{
        position: 'absolute',
        inset: 0,
        x,
        y,
        rotate,
        scale,
        opacity,
        zIndex,
        willChange: 'transform, opacity',
        borderRadius: isMobile ? 14 : 20,
        overflow: 'hidden',
        background: T.card,
        border: `1px solid ${inkA(0.08)}`,
        boxShadow: `0 24px 60px ${inkA(0.14)}`,
        display: 'block',
        textDecoration: 'none',
      }}
    >
      {project.image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={project.image}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            background: `linear-gradient(150deg, ${project.color}1c, ${T.paperAlt})`,
            fontFamily: 'var(--font-bebas)',
            fontSize: 'clamp(28px, 6vw, 64px)',
            color: project.color,
          }}
        >
          {project.name}
        </div>
      )}

      {/* Name pill — the reference tags every card this way. It reads as a
          label on the mini cards and as a caption on the open panel. */}
      <div
        style={{
          position: 'absolute',
          left: 14,
          bottom: 14,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '6px 12px',
          borderRadius: 100,
          background: T.card,
          boxShadow: `0 2px 12px ${inkA(0.16)}`,
          fontFamily: 'var(--font-dm-sans)',
          fontSize: 12,
          fontWeight: 600,
          color: T.ink,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: project.color }} />
        {project.name}
      </div>
    </motion.a>
  )
}

/* ------------------------------------------------------------- furniture */

/** Section title, shown over the fan and gone by the time the panel opens. */
function Intro({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.03, FAN_END, CASCADE_END], [0, 1, 1, 0])
  const y = useTransform(progress, [0, CASCADE_END], [0, -50])

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 'clamp(70px, 15vh, 140px)',
        left: 0,
        right: 0,
        zIndex: 60,
        opacity,
        y,
        pointerEvents: 'none',
        textAlign: 'center',
        padding: '0 20px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: T.accent,
          marginBottom: 10,
        }}
      >
        Selected work
      </p>
      <h2
        style={{
          fontFamily: 'var(--font-bebas)',
          fontWeight: 800,
          fontSize: 'clamp(1.9rem, 4.6vw, 3.6rem)',
          lineHeight: 1.06,
          letterSpacing: '-0.02em',
          color: T.ink,
          maxWidth: 740,
          margin: '0 auto',
        }}
      >
        A place to display <span style={{ color: T.muted }}>the things I have shipped.</span>
      </h2>
    </motion.div>
  )
}

function PanelHeading({
  project,
  index,
  progress,
  isMobile,
}: {
  project: Project
  index: number
  progress: MotionValue<number>
  isMobile: boolean
}) {
  const { start, end, pad } = focusSlot(index)
  const opacity = useTransform(progress, [start, start + pad, end - pad, end], [0, 1, 1, 0])
  const y = useTransform(progress, [start, start + pad, end - pad, end], [16, 0, 0, -16])

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        opacity,
        y,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: isMobile ? 9 : 11,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: T.muted,
          marginBottom: isMobile ? 4 : 8,
        }}
      >
        {project.category} · {project.tech.slice(0, 3).join(' / ')}
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-bebas)',
          fontWeight: 800,
          fontSize: isMobile ? '1.7rem' : 'clamp(2rem, 4vw, 3.1rem)',
          lineHeight: 1,
          letterSpacing: '-0.025em',
          color: T.ink,
          margin: 0,
        }}
      >
        {project.name}{' '}
        <span style={{ color: T.muted, fontWeight: 700 }}>{project.shortDesc.split(' ').slice(0, 4).join(' ')}</span>
      </h3>
    </motion.div>
  )
}

function PanelControls({ project, index, progress }: { project: Project; index: number; progress: MotionValue<number> }) {
  const { start, end, pad } = focusSlot(index)
  const opacity = useTransform(progress, [start, start + pad, end - pad, end], [0, 1, 1, 0])

  return (
    <motion.div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      {project.live || project.github ? (
        <a
          href={project.live || project.github}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 100,
            background: T.ink,
            color: T.paper,
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Visit site <ExternalIcon />
        </a>
      ) : (
        <span />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
        {all.map((q, j) => (
          <span
            key={q.id}
            style={{
              width: j === index ? 22 : 6,
              height: 6,
              borderRadius: 100,
              background: j === index ? project.color : inkA(0.18),
              transition: 'width 0.3s, background 0.3s',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* --------------------------------------------- prefers-reduced-motion fallback */

function ProjectsStatic() {
  return (
    <section id="projects" style={{ padding: 'clamp(60px, 10vw, 120px) clamp(16px, 4vw, 24px)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: T.accent,
            marginBottom: 10,
          }}
        >
          Selected work
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-bebas)',
            fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            color: T.ink,
            marginBottom: 48,
          }}
        >
          A place to display the things I have shipped.
        </h2>

        <div style={{ display: 'grid', gap: 28 }}>
          {all.map((p) => (
            <a
              key={p.id}
              href={p.live || p.github || undefined}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                background: T.card,
                border: `1px solid ${inkA(0.08)}`,
                borderRadius: 20,
                overflow: 'hidden',
                textDecoration: 'none',
              }}
            >
              {p.image && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={p.image}
                  alt=""
                  style={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                />
              )}
              <div style={{ padding: 22 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: p.color,
                    marginBottom: 8,
                  }}
                >
                  {p.category}
                </div>
                <h3 style={{ fontFamily: 'var(--font-bebas)', fontSize: '1.6rem', color: T.ink, marginBottom: 6 }}>
                  {p.name}
                </h3>
                <p style={{ fontSize: 13, color: T.body, lineHeight: 1.6, margin: 0 }}>{p.shortDesc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
