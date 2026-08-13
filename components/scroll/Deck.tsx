'use client'

import { T } from '@/lib/theme'

/**
 * The base ground under everything.
 *
 * This used to carry the page-wide grid and a travelling perspective floor.
 * That gave every section the same field, so the texture stopped registering
 * — the whole page read as one flat sheet. The grid now lives in
 * `components/scroll/Surface.tsx`, declared per section, and this is only the
 * colour that shows through anywhere a section does not paint its own.
 *
 * Static and free: no hooks, no animation, no compositing cost.
 */
export default function Deck() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: T.paper,
      }}
    />
  )
}
