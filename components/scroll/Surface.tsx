'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useMounted } from '@/hooks/useStage'
import { T, paperA } from '@/lib/theme'

export type SurfaceVariant = 'grid' | 'plain' | 'alt' | 'dark'

/**
 * Paints the band behind one section.
 *
 * The site used to sit on a single fixed grid that ran edge to edge for the
 * whole page, which flattened every section into the same field. Sections now
 * declare their own ground instead, so the page reads as a sequence:
 *
 *   grid  — drafting paper, for sections that want structure behind them
 *   plain — flat paper, for sections whose content is already busy
 *   alt   — a half-step darker, to separate two light sections
 *   dark  — inverted; the section's own text must be light
 *
 * The grid parallaxes gently inside its own band. Clipping happens on the grid
 * layer only — the wrapper stays overflow-free so the sticky stages nested
 * inside keep resolving against the viewport.
 */
export default function Surface({
  variant,
  children,
  id,
}: {
  variant: SurfaceVariant
  children: React.ReactNode
  id?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const mounted = useMounted()
  const reduced = mounted && !!prefersReduced

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // One major-rule step across the whole band: present, never distracting.
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -120])

  const dark = variant === 'dark'
  const rule = dark ? paperA(0.07) : T.grid
  const ruleStrong = dark ? paperA(0.11) : T.gridStrong

  const ground = dark ? T.ink : variant === 'alt' ? T.paperAlt : T.paper

  const showGrid = variant === 'grid' || dark

  return (
    <div
      id={id}
      ref={ref}
      style={{
        position: 'relative',
        background: ground,
        /* Deliberately no `overflow` here. The grid layer below clips itself,
           and every pinned stage in this tree depends on `position: sticky`
           resolving against the viewport — an overflow value on an ancestor is
           the fastest way to silently break that. */
        zIndex: 1,
      }}
    >
      {showGrid && (
        <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'clip', pointerEvents: 'none' }}>
          <motion.div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: -120,
              bottom: -120,
              y: reduced ? 0 : gridY,
              backgroundImage:
                `linear-gradient(${rule} 1px, transparent 1px),` +
                `linear-gradient(90deg, ${rule} 1px, transparent 1px),` +
                `linear-gradient(${ruleStrong} 1px, transparent 1px),` +
                `linear-gradient(90deg, ${ruleStrong} 1px, transparent 1px)`,
              backgroundSize: '24px 24px, 24px 24px, 120px 120px, 120px 120px',
            }}
          />
          {/* Fade the rule out at the band edges so neighbouring sections meet
              on flat colour instead of a hard seam. */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(to bottom, ${ground} 0%, transparent 14%, transparent 86%, ${ground} 100%)`,
            }}
          />
        </div>
      )}

      {/* Warm wash — only on light grid bands, and only ever one accent note. */}
      {variant === 'grid' && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(50% 40% at 78% 12%, ${T.accentSoft} 0%, transparent 70%)`,
            opacity: 0.7,
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}
