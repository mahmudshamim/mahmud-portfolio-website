'use client'

import type { CVData } from '@/app/cv/page'
import { DEFAULT_DOC_STYLE } from '@/app/cv/page'
import { ColorField, Group, Row, Segmented, Slider } from './StyleControls'
import {
  SECTION_PRESETS,
  blurStyle,
  border,
  borderStrong,
  brand,
  brandSoft,
  buttonBase,
  focusStyle,
  helperStyle,
  inputStyle,
  sectionLabelStyle,
  shadow,
  surface,
  surfaceMuted,
  text,
  textMuted,
} from './CVBuilder'

type Setter = React.Dispatch<React.SetStateAction<CVData>>

/**
 * Right column of the editor: what the document shows and in what order.
 *
 * These controls used to sit inside a final "Template & sections" wizard step,
 * where you could not see the document you were changing.
 */

/* ------------------------------------------------------------- right pane */

export function CVOptions({
  cvData,
  setCVData,
  isMobile,
}: {
  cvData: CVData
  setCVData: Setter
  isMobile: boolean
}) {
  const toggleSection = (key: keyof CVData['showSections']) =>
    setCVData((prev) => ({ ...prev, showSections: { ...prev.showSections, [key]: !prev.showSections[key] } }))

  const moveSectionOrder = (id: string, direction: -1 | 1) =>
    setCVData((prev) => {
      const index = prev.sectionOrder.indexOf(id)
      const target = index + direction
      if (index === -1 || target < 0 || target >= prev.sectionOrder.length) return prev
      const sectionOrder = [...prev.sectionOrder]
      const [moved] = sectionOrder.splice(index, 1)
      sectionOrder.splice(target, 0, moved)
      return { ...prev, sectionOrder }
    })

  const addCustomSection = (preset?: { title: string; content: string }) =>
    setCVData((prev) => {
      const id = `custom-${prev.customSections.length}-${prev.sectionOrder.length}`
      return {
        ...prev,
        customSections: [...prev.customSections, { id, title: preset?.title || '', content: preset?.content || '' }],
        sectionOrder: [...prev.sectionOrder, id],
      }
    })

  const removeCustomSection = (sectionId: string) =>
    setCVData((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((item) => item.id !== sectionId),
      sectionOrder: prev.sectionOrder.filter((item) => item !== sectionId),
    }))

  const setDoc = <K extends keyof CVData['docStyle']>(key: K, value: CVData['docStyle'][K]) =>
    setCVData((prev) => ({ ...prev, docStyle: { ...prev.docStyle, [key]: value } }))

  const ds = cvData.docStyle

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Label left, control right — the shape every editor panel uses, and
          the only one that fits a 288px column without stacking. */}
      <section style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, boxShadow: shadow, overflow: 'hidden' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: surfaceMuted }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...sectionLabelStyle, marginBottom: 2 }}>Document style</div>
            <div style={{ ...helperStyle, fontSize: 11 }}>
              Profile Split, Swiss Grid, ATS Compact and Accent Rule.
            </div>
          </div>
          <button
            onClick={() => setCVData((prev) => ({ ...prev, docStyle: { ...DEFAULT_DOC_STYLE } }))}
            style={{ ...buttonBase, background: surface, border: `1px solid ${border}`, color: text, padding: '5px 10px', fontSize: 11 }}
          >
            Reset all
          </button>
        </header>

        <Group title="Type">
          <Row label="Body font" stack>
            <Segmented
              value={ds.typeface}
              options={[
                { value: 'sans' as const, label: 'Sans' },
                { value: 'serif' as const, label: 'Serif' },
                { value: 'mono' as const, label: 'Mono' },
              ]}
              onChange={(v) => setDoc('typeface', v)}
            />
          </Row>
          <Row label="Headings" hint="Pair or match" stack>
            <Segmented
              value={ds.headingFont}
              options={[
                { value: 'match' as const, label: 'Match' },
                { value: 'sans' as const, label: 'Sans' },
                { value: 'serif' as const, label: 'Serif' },
                { value: 'mono' as const, label: 'Mono' },
              ]}
              onChange={(v) => setDoc('headingFont', v)}
            />
          </Row>
          <Row label="Heading case" stack>
            <Segmented
              value={ds.headingCase}
              options={[
                { value: 'normal' as const, label: 'Normal' },
                { value: 'upper' as const, label: 'UPPER' },
              ]}
              onChange={(v) => setDoc('headingCase', v)}
            />
          </Row>
          <Row label="Text size" stack>
            <Slider value={ds.scale} min={0.85} max={1.2} step={0.05} onChange={(v) => setDoc('scale', v)} format={(v) => `${Math.round(v * 100)}%`} />
          </Row>
          <Row label="Line height" stack>
            <Slider value={ds.lineHeight} min={1.3} max={2} step={0.05} onChange={(v) => setDoc('lineHeight', v)} format={(v) => v.toFixed(2)} />
          </Row>
          <Row label="Tracking" hint="Letter spacing" stack>
            <Slider value={ds.letterSpacing} min={-0.02} max={0.06} step={0.005} onChange={(v) => setDoc('letterSpacing', v)} format={(v) => `${(v * 1000).toFixed(0)}`} />
          </Row>
        </Group>

        <Group title="Colour">
          <Row label="Accent" hint="Rules and highlights" stack>
            <ColorField
              value={ds.accent}
              presets={['#2563eb', '#0f766e', '#b45309', '#be123c', '#6d28d9', '#111827']}
              onChange={(v) => setDoc('accent', v)}
            />
          </Row>
          <Row label="Text" hint="Pure black prints heavy" stack>
            <ColorField
              value={ds.ink}
              presets={['#222222', '#111827', '#334155', '#3f3f46', '#1c1917']}
              onChange={(v) => setDoc('ink', v)}
            />
          </Row>
          <Row label="Rule" stack>
            <Segmented
              value={ds.headingRule}
              options={[
                { value: 'short' as const, label: 'Short' },
                { value: 'full' as const, label: 'Full' },
                { value: 'none' as const, label: 'None' },
              ]}
              onChange={(v) => setDoc('headingRule', v)}
            />
          </Row>
        </Group>

        <Group title="Layout">
          <Row label="Page margin" hint="More room, fewer pages" stack>
            <Slider value={ds.margin} min={26} max={64} step={2} unit="px" onChange={(v) => setDoc('margin', v)} />
          </Row>
          <Row label="Section gap" stack>
            <Slider value={ds.sectionGap} min={12} max={40} step={2} unit="px" onChange={(v) => setDoc('sectionGap', v)} />
          </Row>
        </Group>

        <Group title="Photo">
          <Row label="Shape" stack>
            <Segmented
              value={ds.photoShape}
              options={[
                { value: 'circle' as const, label: 'Round' },
                { value: 'rounded' as const, label: 'Soft' },
                { value: 'square' as const, label: 'Square' },
                { value: 'hidden' as const, label: 'None' },
              ]}
              onChange={(v) => setDoc('photoShape', v)}
            />
          </Row>
          {ds.photoShape !== 'hidden' && (
            <Row label="Size" stack>
              <Slider value={ds.photoSize} min={64} max={128} step={4} unit="px" onChange={(v) => setDoc('photoSize', v)} />
            </Row>
          )}
        </Group>
      </section>

      <Panel title="Visible sections" hint="Turn a block off to drop it from the document and the PDF.">
        <div style={{ display: 'grid', gap: 8 }}>
          {(Object.keys(cvData.showSections) as Array<keyof CVData['showSections']>).map((key) => (
            <label
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 13, color: text, textTransform: 'capitalize' }}>{key}</span>
              <button
                onClick={() => toggleSection(key)}
                role="switch"
                aria-checked={cvData.showSections[key]}
                aria-label={`Show ${key}`}
                style={{
                  width: 38,
                  height: 22,
                  flexShrink: 0,
                  borderRadius: 999,
                  border: 'none',
                  background: cvData.showSections[key] ? brand : '#cbd5e1',
                  padding: 2,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#fff',
                    transform: `translateX(${cvData.showSections[key] ? 16 : 0}px)`,
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
            </label>
          ))}
        </div>
      </Panel>

      <Panel title="Section order" hint="Move a block up or down to reorder the document.">
        <div style={{ display: 'grid', gap: 6 }}>
          {cvData.sectionOrder.map((sectionId, index) => {
            const custom = cvData.customSections.find((item) => item.id === sectionId)
            const label = custom
              ? custom.title || `Custom ${index + 1}`
              : sectionId.charAt(0).toUpperCase() + sectionId.slice(1)

            return (
              <div
                key={sectionId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '7px 10px',
                  borderRadius: 8,
                  background: surfaceMuted,
                  border: `1px solid ${border}`,
                }}
              >
                <span style={{ fontSize: 13, color: text, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {label}
                </span>
                <span style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <NudgeButton label="Move up" disabled={index === 0} onClick={() => moveSectionOrder(sectionId, -1)} dir="up" />
                  <NudgeButton
                    label="Move down"
                    disabled={index === cvData.sectionOrder.length - 1}
                    onClick={() => moveSectionOrder(sectionId, 1)}
                    dir="down"
                  />
                </span>
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel title="Add a section" hint="Start from a preset or add a blank one.">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: cvData.customSections.length ? 12 : 0 }}>
          {SECTION_PRESETS.map((preset) => (
            <button
              key={preset.title}
              onClick={() => addCustomSection(preset)}
              style={{
                ...buttonBase,
                padding: '6px 11px',
                fontSize: 12,
                fontWeight: 500,
                background: surface,
                color: text,
                border: `1px solid ${borderStrong}`,
              }}
            >
              + {preset.title}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {cvData.customSections.map((section, index) => (
            <div key={section.id} style={{ padding: 12, borderRadius: 10, background: surfaceMuted, border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: textMuted }}>Custom {index + 1}</span>
                <button
                  onClick={() => removeCustomSection(section.id)}
                  style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Remove
                </button>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) =>
                    setCVData((prev) => ({
                      ...prev,
                      customSections: prev.customSections.map((item) =>
                        item.id === section.id ? { ...item, title: e.target.value } : item
                      ),
                    }))
                  }
                  placeholder="Section title"
                  style={{ ...inputStyle, fontSize: 13, padding: '9px 11px' }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
                <textarea
                  value={section.content}
                  onChange={(e) =>
                    setCVData((prev) => ({
                      ...prev,
                      customSections: prev.customSections.map((item) =>
                        item.id === section.id ? { ...item, content: e.target.value } : item
                      ),
                    }))
                  }
                  placeholder={'One point per line'}
                  rows={4}
                  style={{ ...inputStyle, fontSize: 13, padding: '9px 11px', resize: 'vertical' }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => addCustomSection()}
          style={{
            ...buttonBase,
            width: '100%',
            marginTop: 10,
            padding: '9px 14px',
            background: brandSoft,
            color: brand,
            border: `1px solid ${brand}33`,
          }}
        >
          Add blank section
        </button>
      </Panel>

      {isMobile && <div style={{ height: 8 }} />}
    </div>
  )
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: surface,
        border: `1px solid ${border}`,
        borderRadius: 14,
        boxShadow: shadow,
        overflow: 'hidden',
      }}
    >
      <header style={{ padding: '12px 14px', background: surfaceMuted, borderBottom: `1px solid ${border}` }}>
        <div style={{ ...sectionLabelStyle, marginBottom: hint ? 3 : 0 }}>{title}</div>
        {hint && <div style={{ ...helperStyle, fontSize: 11 }}>{hint}</div>}
      </header>
      <div style={{ padding: 14 }}>{children}</div>
    </section>
  )
}

function NudgeButton({
  label,
  dir,
  disabled,
  onClick,
}: {
  label: string
  dir: 'up' | 'down'
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        width: 24,
        height: 24,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 6,
        background: surface,
        border: `1px solid ${border}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        padding: 0,
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={text} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {dir === 'up' ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
      </svg>
    </button>
  )
}
