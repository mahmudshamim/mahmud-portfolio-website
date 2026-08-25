'use client'

import { useState } from 'react'
import { border, borderStrong, brand, brandSoft, buttonBase, surface, surfaceMuted, text, textMuted } from './CVBuilder'

/*
 * Control primitives for the document style panel.
 *
 * One shape throughout: a label on the left, its control on the right. Stacked
 * label-over-control eats vertical space a 288px column does not have, and it
 * makes a list of settings read as a form to fill in rather than a set of
 * knobs to nudge.
 */

export function Group({
  title,
  children,
  onReset,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  onReset?: () => void
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section style={{ borderTop: `1px solid ${border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px 9px' }}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          style={{
            ...buttonBase,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            padding: 0,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: textMuted,
            textAlign: 'left',
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transform: open ? 'none' : 'rotate(-90deg)', transition: 'transform 0.15s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {title}
        </button>

        {onReset && (
          <button
            onClick={onReset}
            title={`Reset ${title.toLowerCase()}`}
            style={{ ...buttonBase, background: 'transparent', color: textMuted, padding: 0, fontSize: 11, fontWeight: 600 }}
          >
            Reset
          </button>
        )}
      </div>

      {open && <div style={{ padding: '0 14px 12px', display: 'grid', gap: 9 }}>{children}</div>}
    </section>
  )
}

/**
 * `stack` puts the control on its own line under the label.
 *
 * A four-option segmented cannot survive sharing a 260px row with a label —
 * "Square" and "None" were simply cut off. The reference panels stack these
 * too; only sliders and single fields stay inline.
 */
export function Row({
  label,
  hint,
  stack,
  children,
}: {
  label: string
  hint?: string
  stack?: boolean
  children: React.ReactNode
}) {
  if (stack) {
    return (
      <div style={{ display: 'grid', gap: 5 }}>
        <div>
          <div style={{ fontSize: 12, color: text, fontFamily: 'var(--font-dm-sans)' }}>{label}</div>
          {hint && <div style={{ fontSize: 10.5, color: textMuted, marginTop: 1 }}>{hint}</div>}
        </div>
        {children}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 30 }}>
      <div style={{ minWidth: 0, flex: '0 0 82px' }}>
        <div style={{ fontSize: 12, color: text, fontFamily: 'var(--font-dm-sans)' }}>{label}</div>
        {hint && <div style={{ fontSize: 10.5, color: textMuted, marginTop: 1 }}>{hint}</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'flex-end' }}>{children}</div>
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string; title?: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        gap: 2,
        width: '100%',
        background: surfaceMuted,
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: 2,
      }}
    >
      {options.map((o) => {
        const on = value === o.value
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={on}
            title={o.title || o.label}
            style={{
              ...buttonBase,
              padding: '5px 2px',
              fontSize: 11,
              fontWeight: on ? 600 : 500,
              borderRadius: 6,
              background: on ? surface : 'transparent',
              color: on ? text : textMuted,
              boxShadow: on ? '0 1px 2px rgba(15,23,42,0.10)' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Slider with the value beside it, as in the reference panels. */
export function Slider({
  value,
  min,
  max,
  step,
  unit,
  onChange,
  format,
}: {
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ flex: 1, minWidth: 40, accentColor: brand }}
      />
      <span
        style={{
          flexShrink: 0,
          minWidth: 38,
          textAlign: 'right',
          fontSize: 11,
          fontWeight: 600,
          color: text,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {format ? format(value) : `${value}${unit ?? ''}`}
      </span>
    </div>
  )
}

/** Swatch plus hex, the pattern every reference uses for colour. */
export function ColorField({
  value,
  presets,
  onChange,
}: {
  value: string
  presets: string[]
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'grid', gap: 6, width: '100%' }}>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: surfaceMuted,
          border: `1px solid ${border}`,
          borderRadius: 8,
          padding: '4px 8px',
          cursor: 'pointer',
        }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 18, height: 18, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
        />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: text, textTransform: 'uppercase' }}>{value}</span>
      </label>

      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {presets.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            aria-label={c}
            aria-pressed={value.toLowerCase() === c.toLowerCase()}
            style={{
              width: 18,
              height: 18,
              padding: 0,
              borderRadius: 5,
              background: c,
              cursor: 'pointer',
              border: value.toLowerCase() === c.toLowerCase() ? `2px solid ${text}` : `1px solid ${borderStrong}`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      style={{
        width: 36,
        height: 21,
        flexShrink: 0,
        borderRadius: 999,
        border: 'none',
        background: on ? brand : '#cbd5e1',
        padding: 2,
        cursor: 'pointer',
        transition: 'background 0.2s',
      }}
    >
      <span
        style={{
          display: 'block',
          width: 17,
          height: 17,
          borderRadius: '50%',
          background: '#fff',
          transform: `translateX(${on ? 15 : 0}px)`,
          transition: 'transform 0.2s ease',
        }}
      />
    </button>
  )
}

export { brandSoft }
