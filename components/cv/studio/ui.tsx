'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/*
 * Studio design tokens and primitives.
 *
 * Built for a thumb first. Inputs are 16px because iOS Safari zooms the whole
 * page into any field smaller than that and leaves it zoomed; the old
 * builder's 14px fields did exactly that on every tap. Touch targets are at
 * least 44px, and anything tappable is a pill or a circle so it reads as one.
 */
export const c = {
  canvas: '#f4f3f8',
  surface: '#ffffff',
  sunken: '#f6f5fa',
  line: '#ebe9f2',
  lineStrong: '#dcd9e6',
  ink: '#15131d',
  body: '#3d3a4a',
  muted: '#716d80',
  faint: '#a3a0b1',
  brand: '#5b47e0',
  brandInk: '#4636c4',
  brandSoft: '#efecfd',
  night: '#17161e',
  good: '#16a34a',
  goodSoft: '#effbf3',
  warn: '#b45309',
  warnSoft: '#fff7e8',
  bad: '#dc2626',
  badSoft: '#fef2f2',
}

export const font = 'var(--font-dm-sans), system-ui, sans-serif'

export const radius = { sm: 10, md: 14, lg: 22, xl: 28, pill: 999 }

export const shadow = {
  card: '0 1px 2px rgba(21,19,29,.04), 0 8px 24px rgba(21,19,29,.05)',
  float: '0 16px 44px rgba(21,19,29,.22)',
}

/* ── Icons ────────────────────────────────────────────────────────────────
   Inline strokes rather than an icon font or emoji: emoji render differently
   on every phone, and a font is another request on a slow connection. */
const PATHS: Record<string, React.ReactNode> = {
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>,
  text: <path d="M4 6h16M4 12h16M4 18h10" />,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="3" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" /></>,
  cap: <><path d="M2 9.5 12 4l10 5.5L12 15z" /><path d="M6 12v4.5c0 1.7 2.7 3 6 3s6-1.3 6-3V12" /></>,
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z" /><circle cx="7.5" cy="11" r="1.2" fill="currentColor" /><circle cx="10.5" cy="7" r="1.2" fill="currentColor" /><circle cx="15" cy="7.5" r="1.2" fill="currentColor" /></>,
  eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /></>,
  download: <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />,
  upload: <path d="M12 16V4M7 9l5-5 5 5M4 21h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  right: <path d="m9 6 6 6-6 6" />,
  left: <path d="m15 6-6 6 6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  dots: <><circle cx="5" cy="12" r="1.6" fill="currentColor" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="19" cy="12" r="1.6" fill="currentColor" /></>,
  check: <path d="M5 12.5 10 17l9-10" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  camera: <><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13.5" r="3.5" /></>,
  sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" /></>,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  dn: <path d="M12 5v14M6 13l6 6 6-6" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></>,
  file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>,
  alert: <><path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" /><path d="M12 10v4M12 17.5h.01" /></>,
  swap: <path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5" />,
  home: <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  link: <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />,
  shield: <><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  phone: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></>,
  share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></>,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" /></>,
  hand: <><path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v6" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.3l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15" /></>,
  sliders: <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />,
}

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 20, stroke = 1.9, style }: { name: IconName; size?: number; stroke?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0, display: 'block', ...style }}
    >
      {PATHS[name]}
    </svg>
  )
}

/* ── Surfaces ─────────────────────────────────────────────────────────── */

export function Card({
  children,
  title,
  subtitle,
  action,
  pad = 18,
  style,
}: {
  children: React.ReactNode
  title?: string
  subtitle?: React.ReactNode
  action?: React.ReactNode
  pad?: number
  style?: React.CSSProperties
}) {
  return (
    <section style={{ minWidth: 0, background: c.surface, border: `1px solid ${c.line}`, borderRadius: radius.lg, padding: pad, boxShadow: shadow.card, ...style }}>
      {(title || action) && (
        <header style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && <h3 style={{ margin: 0, fontFamily: font, fontSize: 16, fontWeight: 700, color: c.ink }}>{title}</h3>}
            {subtitle && <p style={{ margin: '4px 0 0', fontFamily: font, fontSize: 13, lineHeight: 1.5, color: c.muted }}>{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function Eyebrow({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontFamily: font, fontSize: 12, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: c.muted, ...style }}>
      {children}
    </div>
  )
}

/* ── Fields ───────────────────────────────────────────────────────────── */

export function Label({ children, htmlFor, hint }: { children: React.ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} style={{ display: 'block', marginBottom: 7 }}>
      <span style={{ fontFamily: font, fontSize: 13, fontWeight: 650, color: c.ink }}>{children}</span>
      {hint && <span style={{ fontFamily: font, fontSize: 12, color: c.faint, marginLeft: 6 }}>{hint}</span>}
    </label>
  )
}

const fieldBase: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: font,
  fontSize: 16,
  lineHeight: 1.4,
  color: c.ink,
  background: c.sunken,
  border: `1.5px solid ${c.sunken}`,
  borderRadius: radius.md,
  padding: '12px 14px',
  minHeight: 50,
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s, background .15s',
}

const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = c.brand
  e.currentTarget.style.background = c.surface
  e.currentTarget.style.boxShadow = `0 0 0 4px ${c.brand}1f`
}
const onBlurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = c.sunken
  e.currentTarget.style.background = c.sunken
  e.currentTarget.style.boxShadow = 'none'
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }

export function TextField({ label, hint, id, onBlur, style, ...rest }: InputProps) {
  const fid = id || (label ? `f-${label.replace(/\W+/g, '-').toLowerCase()}` : undefined)
  return (
    <div style={{ minWidth: 0 }}>
      {label && <Label htmlFor={fid} hint={hint}>{label}</Label>}
      <input
        id={fid}
        {...rest}
        onFocus={onFocus}
        onBlur={(e) => {
          onBlurStyle(e)
          onBlur?.(e)
        }}
        style={{ ...fieldBase, ...style }}
      />
    </div>
  )
}

type AreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; hint?: string }

export function TextArea({ label, hint, id, style, ...rest }: AreaProps) {
  const fid = id || (label ? `a-${label.replace(/\W+/g, '-').toLowerCase()}` : undefined)
  return (
    <div style={{ minWidth: 0 }}>
      {label && <Label htmlFor={fid} hint={hint}>{label}</Label>}
      <textarea
        id={fid}
        rows={4}
        {...rest}
        onFocus={onFocus}
        onBlur={onBlurStyle}
        style={{ ...fieldBase, resize: 'vertical', minHeight: 116, lineHeight: 1.55, ...style }}
      />
    </div>
  )
}

/* ── Buttons ──────────────────────────────────────────────────────────── */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'dark' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'muted'
  size?: 'lg' | 'md' | 'sm'
  block?: boolean
  icon?: IconName
}

const press = {
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => (e.currentTarget.style.transform = 'scale(0.97)'),
  onPointerUp: (e: React.PointerEvent<HTMLElement>) => (e.currentTarget.style.transform = ''),
  onPointerLeave: (e: React.PointerEvent<HTMLElement>) => (e.currentTarget.style.transform = ''),
}

export function Button({ variant = 'secondary', size = 'md', block, icon, children, style, disabled, ...rest }: ButtonProps) {
  const palette = {
    primary: { bg: c.brand, fg: '#fff', border: c.brand },
    dark: { bg: c.night, fg: '#fff', border: c.night },
    secondary: { bg: c.surface, fg: c.ink, border: c.lineStrong },
    soft: { bg: c.brandSoft, fg: c.brandInk, border: c.brandSoft },
    ghost: { bg: 'transparent', fg: c.body, border: 'transparent' },
    danger: { bg: c.badSoft, fg: c.bad, border: c.badSoft },
    muted: { bg: '#eceaf1', fg: c.ink, border: '#eceaf1' },
  }[variant]
  const h = size === 'lg' ? 56 : size === 'sm' ? 38 : 48

  return (
    <button
      disabled={disabled}
      {...press}
      {...rest}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: block ? '100%' : undefined,
        minHeight: h,
        padding: size === 'sm' ? '0 14px' : '0 22px',
        fontFamily: font,
        fontSize: size === 'lg' ? 16 : size === 'sm' ? 13.5 : 15,
        fontWeight: 650,
        color: palette.fg,
        background: palette.bg,
        border: `1.5px solid ${palette.border}`,
        borderRadius: radius.pill,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        whiteSpace: 'nowrap',
        transition: 'transform .08s, background .15s, opacity .15s',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children}
    </button>
  )
}

export function IconButton({
  icon,
  label,
  onClick,
  variant = 'white',
  size = 44,
  style,
}: {
  icon: IconName
  label: string
  onClick?: () => void
  variant?: 'white' | 'soft' | 'dark' | 'plain'
  size?: number
  style?: React.CSSProperties
}) {
  const palette = {
    white: { bg: c.surface, fg: c.ink, border: c.line },
    soft: { bg: c.sunken, fg: c.body, border: c.sunken },
    dark: { bg: c.night, fg: '#fff', border: c.night },
    plain: { bg: 'transparent', fg: c.muted, border: 'transparent' },
  }[variant]
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      {...press}
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: '50%',
        border: `1px solid ${palette.border}`,
        background: palette.bg,
        color: palette.fg,
        cursor: 'pointer',
        transition: 'transform .08s',
        ...style,
      }}
    >
      <Icon name={icon} size={Math.round(size * 0.42)} />
    </button>
  )
}

export function Chip({
  active,
  onClick,
  children,
  dashed,
  icon,
  tone = 'brand',
}: {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
  dashed?: boolean
  icon?: IconName
  tone?: 'brand' | 'dark'
}) {
  const on = tone === 'dark' ? { bg: c.night, fg: '#fff', border: c.night } : { bg: c.brandSoft, fg: c.brandInk, border: c.brand }
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      {...press}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
        minHeight: 40,
        padding: '0 15px',
        fontFamily: font,
        fontSize: 14,
        fontWeight: active ? 650 : 500,
        borderRadius: radius.pill,
        border: `1.5px ${dashed ? 'dashed' : 'solid'} ${active ? on.border : dashed ? c.lineStrong : c.line}`,
        background: active ? on.bg : c.surface,
        color: active ? on.fg : c.body,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'transform .08s, background .15s',
      }}
    >
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  )
}

/** A pill track, "Modern | Classic". */
export function Segmented<T extends string>({ value, options, onChange, full }: { value: T | ''; options: { v: T; l: string }[]; onChange: (v: T) => void; full?: boolean }) {
  return (
    <div role="radiogroup" style={{ display: full ? 'grid' : 'inline-grid', gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`, gap: 4, padding: 4, borderRadius: radius.pill, background: '#ebe9f1', width: full ? '100%' : undefined }}>
      {options.map((o) => {
        const on = value === o.v
        return (
          <button
            key={o.v}
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.v)}
            style={{
              minHeight: 38,
              padding: '0 14px',
              fontFamily: font,
              fontSize: 14,
              fontWeight: on ? 650 : 500,
              borderRadius: radius.pill,
              border: 'none',
              background: on ? c.surface : 'transparent',
              color: on ? c.ink : c.muted,
              boxShadow: on ? '0 1px 3px rgba(21,19,29,.12)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background .15s',
            }}
          >
            {o.l}
          </button>
        )
      })}
    </div>
  )
}

/** A labelled range with its value on the right. Styled in globals.css. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  disabled,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  format?: (v: number) => string
  disabled?: boolean
}) {
  const pct = ((Math.min(max, Math.max(min, value)) - min) / (max - min)) * 100
  return (
    <label style={{ display: 'grid', gap: 6, opacity: disabled ? 0.45 : 1 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontFamily: font, fontSize: 13.5, color: c.body }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: c.muted, fontVariantNumeric: 'tabular-nums' }}>{format ? format(value) : value}</span>
      </span>
      <input
        type="range"
        className="studio-range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ ['--pct' as string]: `${pct}%` } as React.CSSProperties}
      />
    </label>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      onClick={() => onChange(!on)}
      style={{
        width: 48,
        height: 28,
        flexShrink: 0,
        borderRadius: radius.pill,
        border: 'none',
        padding: 3,
        background: on ? c.brand : '#d6d3df',
        cursor: 'pointer',
        transition: 'background .2s',
      }}
    >
      <span
        style={{
          display: 'block',
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(21,19,29,.25)',
          transform: `translateX(${on ? 20 : 0}px)`,
          transition: 'transform .2s',
        }}
      />
    </button>
  )
}

/* ── Sheets ───────────────────────────────────────────────────────────── */

/** Bottom sheet on a phone, centred card on a wide screen. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  wide?: boolean
}) {
  const [narrow, setNarrow] = useState(true)
  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 720)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(21,19,29,.42)',
        display: 'flex',
        alignItems: narrow ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: narrow ? 0 : 24,
        animation: 'studioFade .18s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: wide ? 640 : 460,
          maxHeight: narrow ? '90vh' : '86vh',
          overflowY: 'auto',
          background: c.surface,
          borderRadius: narrow ? `${radius.xl}px ${radius.xl}px 0 0` : radius.xl,
          padding: narrow ? '8px 20px calc(20px + env(safe-area-inset-bottom))' : '10px 24px 24px',
          boxShadow: shadow.float,
          animation: narrow ? 'studioRise .24s cubic-bezier(.2,.8,.2,1)' : 'studioFade .18s ease-out',
        }}
      >
        <div style={{ width: 42, height: 5, borderRadius: 5, background: c.lineStrong, margin: '6px auto 14px', opacity: narrow ? 1 : 0 }} />
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <h2 style={{ flex: 1, margin: 0, fontFamily: font, fontSize: 20, fontWeight: 750, letterSpacing: '-.01em', color: c.ink }}>{title}</h2>
            <IconButton icon="x" label="Close" variant="soft" size={38} onClick={onClose} />
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

/** The big round badge at the top of a dialog, download, warning, done. */
export function Badge({ icon, tone = 'brand' }: { icon: IconName; tone?: 'brand' | 'warn' | 'bad' | 'good' }) {
  const t = {
    brand: { bg: c.brandSoft, fg: c.brand },
    warn: { bg: '#fff1d6', fg: '#d97706' },
    bad: { bg: c.badSoft, fg: c.bad },
    good: { bg: '#dcfce7', fg: c.good },
  }[tone]
  return (
    <div style={{ width: 68, height: 68, borderRadius: '50%', background: t.bg, color: t.fg, display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
      <Icon name={icon} size={32} stroke={2} />
    </div>
  )
}

type ConfirmOpts = { title: string; body?: string; confirmLabel?: string; tone?: 'bad' | 'warn' | 'brand'; icon?: IconName }

/** window.confirm, but one people can read on a phone. */
export function useConfirm() {
  const [opts, setOpts] = useState<ConfirmOpts | null>(null)
  const resolver = useRef<((v: boolean) => void) | null>(null)

  const confirm = useCallback((o: ConfirmOpts) => {
    setOpts(o)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const settle = (v: boolean) => {
    resolver.current?.(v)
    resolver.current = null
    setOpts(null)
  }

  const node = (
    <Sheet open={Boolean(opts)} onClose={() => settle(false)}>
      {opts && (
        <div style={{ textAlign: 'center', padding: '4px 0 2px' }}>
          <Badge icon={opts.icon ?? (opts.tone === 'bad' ? 'trash' : 'alert')} tone={opts.tone ?? 'bad'} />
          <h2 style={{ margin: 0, fontFamily: font, fontSize: 20, fontWeight: 750, color: c.ink }}>{opts.title}</h2>
          {opts.body && <p style={{ margin: '8px auto 0', maxWidth: 340, fontFamily: font, fontSize: 14.5, lineHeight: 1.55, color: c.muted }}>{opts.body}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 22 }}>
            <Button variant="muted" onClick={() => settle(false)}>Cancel</Button>
            <Button variant={opts.tone === 'bad' ? 'danger' : 'dark'} onClick={() => settle(true)} style={opts.tone === 'bad' ? { background: c.bad, color: '#fff', borderColor: c.bad } : undefined}>
              {opts.confirmLabel ?? 'Yes'}
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  )

  return { confirm, confirmNode: node }
}

export type Confirm = ReturnType<typeof useConfirm>['confirm']

/** A short-lived confirmation. One at a time; the latest wins. */
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2800)
    return () => clearTimeout(t)
  }, [msg])

  const node = msg ? (
    <div
      role="status"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 'calc(104px + env(safe-area-inset-bottom))',
        zIndex: 400,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 16px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          maxWidth: 520,
          background: c.night,
          color: '#fff',
          fontFamily: font,
          fontSize: 14,
          lineHeight: 1.4,
          padding: '12px 18px',
          borderRadius: radius.pill,
          boxShadow: shadow.float,
          animation: 'studioRise .22s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <span style={{ width: 20, height: 20, borderRadius: '50%', background: c.good, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon name="check" size={13} stroke={3} />
        </span>
        {msg}
      </div>
    </div>
  ) : null

  return { toast: setMsg, toastNode: node }
}

/** Shrink a phone photo before it goes anywhere near localStorage.
 *  A raw camera image is several MB of base64, past the ~5 MB quota, and
 *  the save would silently fail, taking the whole CV with it. */
export async function downscaleImage(file: File, max = 480): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = reject
      i.src = url
    })
    const scale = Math.min(1, max / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}
