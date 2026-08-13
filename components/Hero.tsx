'use client'

import { motion, useTransform, type MotionValue } from 'framer-motion'
import { portfolioData } from '@/data/portfolio'
import { useStage } from '@/hooks/useStage'
import { useIsMobile } from '@/hooks/useIsMobile'
import { T, inkA } from '@/lib/theme'

const WORD = 'MAHMUD'

/**
 * The portrait sits in a centred column. The wordmark is rendered three times
 * at exactly the same position and clipped into three vertical bands: solid
 * either side, outline-only across the middle so the face reads through the
 * letterforms. Same trick as a printed cover — no masks, no compositing, and
 * it stays crisp at any size because it is real text the whole way.
 */
const BAND_START = 36 // % — left edge of the outlined letters
const BAND_END = 64 // % — right edge

/**
 * The portrait column, sized independently of the outline band.
 *
 * These used to share one pair of numbers, which meant the photo inherited a
 * 28%-wide column at 78vh tall. On a phone that is roughly 109x658 — an
 * aspect of 0.17 against the desktop's 0.54 — so `object-fit: cover` threw
 * away everything either side of the nose.
 *
 * Keeping them separate is also truer to the reference: the photo is meant to
 * be *wider* than the hollow letters, so solid type crosses the hair and
 * shoulders while only the face reads through the outlines.
 */
const PHOTO = {
  desktop: { left: 32, width: 36, height: 'min(78vh, 720px)', wordTop: '50%' },
  /* Taller and wider than desktop in percentage terms. The portrait is
     bottom-anchored, so its height decides where the composition starts —
     at 58vh everything below the top rail sat empty down to 42vh. Width grows
     with it to hold the aspect near 0.52 and keep `cover` off the face. */
  mobile: { left: 14, width: 72, height: 'min(70vh, 540px)', wordTop: '44%' },
} as const

/**
 * Feathers the portrait into the paper. Centred slightly above the middle and
 * narrower than it is tall, so the shoulders fade out before the frame edge
 * and the head stays fully solid.
 */
const PHOTO_MASK = 'radial-gradient(66% 56% at 50% 38%, #000 46%, rgba(0,0,0,0.55) 72%, transparent 96%)'

/** Shared by the sizer and all three layers so their geometry matches exactly. */
const WORD_TYPE: React.CSSProperties = {
  fontFamily: 'var(--font-bebas)',
  fontWeight: 900,
  fontSize: 'clamp(4.2rem, 19vw, 19rem)',
  lineHeight: 0.86,
  letterSpacing: '-0.03em',
  whiteSpace: 'nowrap',
  userSelect: 'none',
}

export default function Hero() {
  const { personal } = portfolioData
  const { ref, progress, reduced } = useStage()
  const isMobile = useIsMobile()

  // Scroll pushes the camera through the wordmark: the solid halves part, the
  // outlined middle opens up and swallows the frame.
  const leftX = useTransform(progress, [0, 1], ['0%', '-58%'])
  const rightX = useTransform(progress, [0, 1], ['0%', '58%'])
  const midScale = useTransform(progress, [0, 1], [1, 3.4])
  const midOpacity = useTransform(progress, [0, 0.55, 0.9], [1, 0.7, 0])
  const halvesOpacity = useTransform(progress, [0, 0.5, 0.85], [1, 0.9, 0])

  const photoScale = useTransform(progress, [0, 1], [1, 1.34])
  const photoOpacity = useTransform(progress, [0, 0.45, 0.8], [1, 0.75, 0])

  const chromeOpacity = useTransform(progress, [0, 0.16], [1, 0])
  const captionY = useTransform(progress, [0, 1], [0, -70])

  const strokeW = isMobile ? 1.5 : 2.5
  const photo = isMobile ? PHOTO.mobile : PHOTO.desktop

  return (
    <div id="hero" ref={ref} style={{ position: 'relative', height: reduced ? 'auto' : '200vh' }}>
      <div
        style={{
          position: reduced ? 'relative' : 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          /* Top pad only has to clear the 60px fixed navbar; it was reserving
             12vh, which on a tall phone is another 40px of nothing. */
          padding: 'clamp(74px, 9vh, 120px) clamp(18px, 5vw, 64px) clamp(24px, 5vh, 48px)',
        }}
      >
        {/* ── Top rail ─────────────────────────────────────────── */}
        <motion.div
          style={{
            opacity: chromeOpacity,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            position: 'relative',
            zIndex: 4,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: 'clamp(11px, 1.2vw, 13px)',
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: T.ink,
              }}
            >
              {personal.role}
            </div>
            <div
              style={{
                marginTop: 6,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                fontFamily: 'var(--font-dm-sans)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: T.accentInk,
                background: T.accentSoft,
                border: `1px solid ${T.accent}44`,
                borderRadius: 100,
                padding: '4px 11px',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: T.accent,
                  animation: 'pulse 2s ease-in-out infinite',
                  display: 'inline-block',
                }}
              />
              Available for work
            </div>
          </div>

          <div
            style={{
              textAlign: 'right',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 'clamp(10px, 1.1vw, 12px)',
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: T.muted,
              lineHeight: 1.9,
            }}
          >
            <div>{personal.location}</div>
            <div style={{ color: T.faint }}>2026 — Portfolio</div>
          </div>
        </motion.div>

        {/* ── Centre: portrait + wordmark ──────────────────────── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {/* Portrait column — behind the type */}
          <motion.div
            style={{
              position: 'absolute',
              left: `${photo.left}%`,
              width: `${photo.width}%`,
              bottom: 0,
              height: photo.height,
              scale: photoScale,
              opacity: photoOpacity,
              transformOrigin: '50% 100%',
              zIndex: 1,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={personal.photo}
              alt={personal.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                display: 'block',
                /* The source is a studio portrait on white. Grayscale flattens
                   it into the palette; the sepia/brightness pair walks that
                   white down onto the paper tone so the two grounds match
                   instead of the photo reading as a lit panel. */
                filter: 'grayscale(1) contrast(1.05) sepia(0.14) brightness(0.965)',
                /* An ellipse biased upward, so every edge dissolves and the
                   bottom goes first. A straight bottom-only fade left the
                   other three sides as hard rectangle edges — that boxed-in
                   look was the actual problem, not the whiteness. */
                maskImage: PHOTO_MASK,
                WebkitMaskImage: PHOTO_MASK,
              }}
            />
          </motion.div>

          {/* Wordmark — three clipped copies, identical geometry */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: photo.wordTop,
              transform: 'translateY(-50%)',
              zIndex: 2,
            }}
          >
            {/* In-flow sizer. The three layers are absolutely positioned, so
                without something holding the box open they would collapse to
                zero height and `inset: 0` would give them nothing to fill. */}
            <span aria-hidden style={{ ...WORD_TYPE, visibility: 'hidden', display: 'flex', justifyContent: 'center' }}>
              {WORD}
            </span>

            {/* The real heading. The visible wordmark is decorative — this is
                what search engines and screen readers get. */}
            <h1
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                margin: -1,
                padding: 0,
                overflow: 'hidden',
                clip: 'rect(0 0 0 0)',
                clipPath: 'inset(50%)',
                whiteSpace: 'nowrap',
                border: 0,
              }}
            >
              {personal.name} — {personal.role}
            </h1>

            {/* Solid left */}
            <WordLayer
              clip={`inset(0 ${100 - BAND_START}% 0 0)`}
              style={{ color: T.ink }}
              x={leftX}
              opacity={halvesOpacity}
            />
            {/* Outline across the portrait */}
            <WordLayer
              clip={`inset(0 ${100 - BAND_END}% 0 ${BAND_START}%)`}
              style={{
                color: 'transparent',
                WebkitTextStroke: `${strokeW}px ${T.ink}`,
              }}
              scale={midScale}
              opacity={midOpacity}
            />
            {/* Solid right */}
            <WordLayer
              clip={`inset(0 0 0 ${BAND_END}%)`}
              style={{ color: T.ink }}
              x={rightX}
              opacity={halvesOpacity}
            />
          </div>
        </div>

        {/* ── Bottom rail ──────────────────────────────────────── */}
        <motion.div
          style={{
            opacity: chromeOpacity,
            y: captionY,
            position: 'relative',
            zIndex: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 24,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 360 }}>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: 'clamp(13px, 1.5vw, 15px)',
                color: T.body,
                lineHeight: 1.65,
                marginBottom: 18,
              }}
            >
              {personal.tagline}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: T.paper,
                  background: T.ink,
                  border: `1px solid ${T.ink}`,
                  borderRadius: 6,
                  padding: '11px 24px',
                  pointerEvents: 'auto',
                  transition: 'background 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = T.accent
                  e.currentTarget.style.borderColor = T.accent
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = T.ink
                  e.currentTarget.style.borderColor = T.ink
                }}
              >
                View Work
              </button>
              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: T.ink,
                  background: 'transparent',
                  border: `1px solid ${T.line}`,
                  borderRadius: 6,
                  padding: '11px 24px',
                  pointerEvents: 'auto',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.accent)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.line)}
              >
                Hire Me
              </button>
            </div>
          </div>

          <div
            style={{
              textAlign: 'right',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 'clamp(10px, 1.1vw, 12px)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: T.muted,
              lineHeight: 1.9,
            }}
          >
            <div style={{ color: T.ink, fontWeight: 600 }}>{personal.name}</div>
            <div>{personal.portfolio}</div>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={{
            opacity: chromeOpacity,
            position: 'absolute',
            bottom: 'clamp(10px, 2vh, 18px)',
            left: '50%',
            translateX: '-50%',
            zIndex: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 10,
            letterSpacing: '0.24em',
            color: T.faint,
          }}
        >
          <span style={{ width: 34, height: 1, background: inkA(0.2) }} />
          SCROLL
          <span style={{ width: 34, height: 1, background: inkA(0.2) }} />
        </motion.div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.45; transform: scale(0.8); }
        }
      `}</style>
    </div>
  )
}

function WordLayer({
  clip,
  style,
  x,
  scale,
  opacity,
}: {
  clip: string
  style: React.CSSProperties
  x?: MotionValue<string>
  scale?: MotionValue<number>
  opacity: MotionValue<number>
}) {
  return (
    <motion.div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        clipPath: clip,
        WebkitClipPath: clip,
        x,
        scale,
        opacity,
        display: 'flex',
        justifyContent: 'center',
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      <span style={WORD_TYPE}>{WORD}</span>
    </motion.div>
  )
}
