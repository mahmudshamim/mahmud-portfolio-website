'use client'

import { useEffect, useRef, useState } from 'react'
import {
  useScroll,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion'

/**
 * True only after the first client render. `useReducedMotion` reads matchMedia,
 * which is unavailable on the server — so a component that swaps its whole
 * tree on it would render one thing during SSR and another during hydration.
 * Gating on mount keeps the first client render identical to the server's,
 * then lets the static layout take over on the next paint.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

/**
 * A "stage" is a tall section whose inner content is sticky at 100vh.
 * Scrolling through the tall outer element scrubs `progress` from 0 → 1,
 * which drives every transform inside. This is the whole cinematic system —
 * no video, no frame sequences, no extra bytes.
 *
 * `progress` is spring-smoothed so fast wheel/trackpad flicks glide instead
 * of snapping. We smooth the derived value rather than hijacking the page
 * scroll itself, so native scrolling, keyboard nav, and mobile momentum all
 * keep working untouched.
 */
export function useStage() {
  const ref = useRef<HTMLDivElement>(null)
  const prefersReduced = useReducedMotion()
  const mounted = useMounted()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  const smooth = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 42,
    restDelta: 0.0005,
  })

  const reduced = mounted && !!prefersReduced

  return {
    ref,
    progress: (reduced ? scrollYProgress : smooth) as MotionValue<number>,
    reduced,
  }
}

/**
 * Build a 4-point keyframe range for item `i` of `count` inside a stage:
 * [fully off-screen ahead, docked, still docked, gone past camera].
 * `hold` is the fraction of each slot the item stays parked at center.
 */
export function slot(i: number, count: number, hold = 0.34) {
  const size = 1 / count
  const start = i * size
  const pad = (size * (1 - hold)) / 2
  return [start, start + pad, start + size - pad, start + size] as const
}
