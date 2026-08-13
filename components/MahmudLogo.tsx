import React from 'react'

type Props = {
  size?: 'sm' | 'md' | 'lg'
  /** Overrides the default ink. Pass a light value to place it on a dark field. */
  color?: string
}

const sizes = {
  sm: { mark: 15, text: 17 },
  md: { mark: 21, text: 24 },
  lg: { mark: 31, text: 36 },
}

/**
 * Gap between mark and wordmark, as a fraction of the mark's height.
 *
 * Derived rather than fixed per size so the spacing reads the same at every
 * scale. It is deliberately tight: the bars lean right, so their lower half
 * pulls away from the "a" and the gap always looks wider than it measures.
 * Lower this to close it further.
 */
const GAP_RATIO = 0.1

/*
 * The mark is three slanted bars reading as a stylised M.
 *
 * Geometry, in the 0–100 tall viewBox: each bar is a parallelogram whose top
 * edge sits SLANT units right of its bottom edge (≈21°), BAR wide, repeating
 * every PITCH. Derived rather than hand-plotted so the proportions hold at
 * any size and stay easy to retune.
 */
const SLANT = 38
const BAR = 30
const PITCH = 46
const MARK_W = PITCH * 2 + SLANT + BAR // 160

const bars = [0, 1, 2].map((i) => {
  const x = i * PITCH
  return `M${x + SLANT} 0 L${x + SLANT + BAR} 0 L${x + BAR} 100 L${x} 100 Z`
})

export default function MahmudLogo({ size = 'md', color }: Props) {
  const s = sizes[size]

  return (
    <span
      role="img"
      aria-label="Mahmud"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.mark * GAP_RATIO,
        /* Not `currentColor`: the navbar renders this inside a <button>, and
           buttons do not inherit colour in every browser. */
        color: color ?? 'var(--ink)',
        lineHeight: 1,
      }}
    >
      <svg
        viewBox={`0 0 ${MARK_W} 100`}
        height={s.mark}
        width={(s.mark * MARK_W) / 100}
        fill="currentColor"
        aria-hidden
        focusable="false"
        style={{ display: 'block', flexShrink: 0 }}
      >
        {bars.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>

      <span
        aria-hidden
        style={{
          fontFamily: 'var(--font-logo), system-ui, sans-serif',
          fontWeight: 600,
          fontStyle: 'italic',
          fontSize: s.text,
          letterSpacing: '-0.005em',
          /* The reference face is wider than Exo 2 — a small horizontal
             stretch closes most of the gap without distorting the strokes. */
          transform: 'scaleX(1.06)',
          transformOrigin: 'left center',
          display: 'block',
          whiteSpace: 'nowrap',
        }}
      >
        ahmud
      </span>
    </span>
  )
}
