'use client'

import { useState } from 'react'
import { border, borderStrong, brand, brandSoft, buttonBase, surface, surfaceMuted, text, textMuted } from './CVBuilder'

/**
 * Writing help, kept next to the field it is about.
 *
 * Most people do not stall on the form — they stall on the wording. A tip in
 * a help centre is a tip nobody reads; a tip under the textarea is one they
 * act on.
 */

export const ACTION_VERBS = [
  'Built', 'Shipped', 'Led', 'Migrated', 'Automated', 'Reduced', 'Improved',
  'Designed', 'Launched', 'Owned', 'Rewrote', 'Scaled', 'Fixed', 'Cut',
]

/** Collapsed by default: help should be available, not in the way. */
export function Hint({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ marginTop: 6 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          ...buttonBase,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          background: 'transparent',
          color: brand,
          padding: 0,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: brandSoft,
            color: brand,
            fontSize: 10,
            fontWeight: 700,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          ?
        </span>
        {title}
      </button>

      {open && (
        <div
          style={{
            marginTop: 6,
            background: surfaceMuted,
            border: `1px solid ${border}`,
            borderRadius: 8,
            padding: '10px 12px',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: 12,
            lineHeight: 1.65,
            color: textMuted,
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

/** Good/bad pair. Showing the weak version is what makes the strong one land. */
export function Compare({ weak, strong }: { weak: string; strong: string }) {
  return (
    <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 7 }}>
        <span style={{ color: '#dc2626', fontWeight: 700, flexShrink: 0 }}>✕</span>
        <span style={{ textDecoration: 'line-through' }}>{weak}</span>
      </div>
      <div style={{ display: 'flex', gap: 7 }}>
        <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓</span>
        <span style={{ color: text }}>{strong}</span>
      </div>
    </div>
  )
}

/** Insert an opener at the cursor so the blank page is never blank. */
export function VerbPicker({ onPick }: { onPick: (verb: string) => void }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 11, color: textMuted, marginBottom: 5 }}>Start a line with:</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {ACTION_VERBS.map((verb) => (
          <button
            key={verb}
            onClick={() => onPick(verb)}
            style={{
              ...buttonBase,
              padding: '4px 9px',
              fontSize: 11,
              fontWeight: 500,
              background: surface,
              color: text,
              border: `1px solid ${borderStrong}`,
              borderRadius: 999,
            }}
          >
            {verb}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Length feedback. Deliberately advisory: a hard limit on a CV field is a
 * guess about someone's career, and it is usually wrong.
 */
export function LengthMeter({ value, ideal, unit = 'words' }: { value: string; ideal: [number, number]; unit?: 'words' | 'characters' }) {
  const count =
    unit === 'words' ? (value || '').trim().split(/\s+/).filter(Boolean).length : (value || '').length
  const [min, max] = ideal
  const state = count === 0 ? 'empty' : count < min ? 'short' : count > max ? 'long' : 'good'

  const copy = {
    empty: `Aim for ${min}–${max} ${unit}.`,
    short: `${count} ${unit} — a little more would help (${min}–${max}).`,
    good: `${count} ${unit} — good length.`,
    long: `${count} ${unit} — trim towards ${max} so it stays scannable.`,
  }[state]

  const colour = state === 'good' ? '#16a34a' : state === 'long' ? '#b45309' : textMuted

  return (
    <div style={{ marginTop: 6, fontSize: 11.5, color: colour, fontFamily: 'var(--font-dm-sans)' }}>{copy}</div>
  )
}
