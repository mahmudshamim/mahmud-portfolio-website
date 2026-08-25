'use client'

import { useEffect, useRef, useState } from 'react'
import type { CVDoc } from '@/hooks/useCVDocs'
import { border, borderStrong, brand, brandSoft, buttonBase, surface, surfaceMuted, text, textMuted } from './CVBuilder'

/**
 * Document switcher for the toolbar.
 *
 * People tailor a CV per application, so the builder has to hold more than
 * one. Everything here is local to the browser — there is no account and no
 * server copy.
 */
export default function DocumentBar({
  docs,
  activeId,
  onSelect,
  onCreate,
  onDuplicate,
  onRename,
  onDelete,
  onExport,
  onImport,
  compact,
}: {
  docs: CVDoc[]
  activeId: string
  onSelect: (id: string) => void
  onCreate: (preset: 'blank' | 'sample') => void
  onDuplicate: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onExport: () => void
  onImport: (file: File) => void
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const file = useRef<HTMLInputElement>(null)
  const activeDoc = docs.find((d) => d.id === activeId)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const item: React.CSSProperties = {
    ...buttonBase,
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    color: text,
    fontSize: 13,
    fontWeight: 500,
    padding: '8px 10px',
    borderRadius: 8,
  }

  return (
    <div ref={wrap} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          ...buttonBase,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          maxWidth: compact ? 130 : 220,
          padding: '7px 12px',
          borderRadius: 999,
          background: surface,
          border: `1px solid ${border}`,
          color: text,
          fontSize: 13,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeDoc?.name || 'My CV'}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2.6" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            width: 268,
            zIndex: 200,
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 12,
            boxShadow: '0 12px 40px rgba(15,23,42,0.16)',
            padding: 6,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: textMuted, padding: '8px 10px 6px' }}>
            Your CVs · {docs.length}
          </div>

          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {docs.map((doc) => {
              const isActive = doc.id === activeId
              return (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    borderRadius: 8,
                    background: isActive ? brandSoft : 'transparent',
                  }}
                >
                  <button
                    onClick={() => {
                      onSelect(doc.id)
                      setOpen(false)
                    }}
                    style={{ ...item, color: isActive ? brand : text, fontWeight: isActive ? 600 : 500, minWidth: 0 }}
                  >
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.name}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      const next = window.prompt('Rename this CV', doc.name)
                      if (next?.trim()) onRename(doc.id, next.trim())
                    }}
                    aria-label={`Rename ${doc.name}`}
                    title="Rename"
                    style={{ ...buttonBase, background: 'transparent', color: textMuted, padding: '6px 6px', fontSize: 12 }}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => onDuplicate(doc.id)}
                    aria-label={`Duplicate ${doc.name}`}
                    title="Duplicate"
                    style={{ ...buttonBase, background: 'transparent', color: textMuted, padding: '6px 6px', fontSize: 12 }}
                  >
                    ⧉
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${doc.name}"? This cannot be undone.`)) onDelete(doc.id)
                    }}
                    aria-label={`Delete ${doc.name}`}
                    title="Delete"
                    style={{ ...buttonBase, background: 'transparent', color: '#dc2626', padding: '6px 8px', fontSize: 12 }}
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>

          <div style={{ height: 1, background: border, margin: '6px 0' }} />

          <button onClick={() => { onCreate('blank'); setOpen(false) }} style={item}>+ New blank CV</button>
          <button onClick={() => { onCreate('sample'); setOpen(false) }} style={item}>+ New from example</button>

          <div style={{ height: 1, background: border, margin: '6px 0' }} />

          <button onClick={() => { onExport(); setOpen(false) }} style={item}>Download backup (.json)</button>
          <button onClick={() => file.current?.click()} style={item}>Restore from backup…</button>
          <div style={{ fontSize: 11, color: textMuted, lineHeight: 1.5, padding: '4px 10px 8px' }}>
            Your CVs are stored in this browser only. A backup file is how you move them to another device.
          </div>

          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onImport(f)
              e.target.value = ''
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
