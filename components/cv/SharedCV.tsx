'use client'

import { useEffect, useState } from 'react'
import type { CVData, CVTemplate } from '@/app/cv/page'
import MahmudLogo from '@/components/MahmudLogo'
import CVPreview from './CVPreview'
import { decodePayload } from './share'

const brand = '#5b47e0'
const font = 'var(--font-dm-sans), system-ui, sans-serif'

/**
 * What someone sees when they open a shared CV link.
 *
 * `payload` comes from the server for a short link (/c/<id>): a string, or
 * null when the id is unknown or expired. Left undefined, the CV is read
 * from the URL fragment of a long link (/cv/view#...).
 */
export default function SharedCV({ payload }: { payload?: string | null }) {
  const [state, setState] = useState<{ cv: CVData; template: CVTemplate } | 'loading' | 'error'>('loading')
  const [download, setDownload] = useState<() => void>(() => () => {})

  useEffect(() => {
    if (payload === null) {
      setState('error')
      return
    }
    const read = () =>
      decodePayload(payload ?? window.location.hash)
        .then(setState)
        .catch(() => setState('error'))
    read()
    if (payload !== undefined) return
    window.addEventListener('hashchange', read)
    return () => window.removeEventListener('hashchange', read)
  }, [payload])

  useEffect(() => {
    if (typeof state === 'object' && state.cv.personal.name) document.title = `${state.cv.personal.name} | CV`
  }, [state])

  return (
    <div className="studio" style={{ minHeight: '100dvh', background: '#e9e7f1', fontFamily: font }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: 'rgba(255,255,255,.94)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #ebe9f2',
        }}
      >
        <a href="/" aria-label="Home" style={{ display: 'flex' }}>
          <MahmudLogo size="sm" />
        </a>
        <span style={{ flex: 1 }} />
        {typeof state === 'object' && (
          <button
            onClick={() => download()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 999, border: 'none', background: brand, color: '#fff', fontFamily: font, fontSize: 15, fontWeight: 650, cursor: 'pointer' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
            </svg>
            Download PDF
          </button>
        )}
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '20px 16px 40px' }}>
        {state === 'loading' && <p style={{ textAlign: 'center', color: '#716d80', marginTop: 80 }}>Opening CV…</p>}

        {state === 'error' && (
          <div style={{ maxWidth: 420, margin: '80px auto', textAlign: 'center', background: '#fff', borderRadius: 24, padding: 28 }}>
            <h1 style={{ margin: 0, fontSize: 22, color: '#15131d' }}>This link doesn’t open a CV</h1>
            <p style={{ color: '#716d80', lineHeight: 1.6 }}>
              {payload === null
                ? 'The link may have expired, or a letter in it may be wrong. Ask the sender to share it again.'
                : 'It may have been cut short when it was copied. Ask the sender to share it again.'}
            </p>
            <a href="/cv" style={{ display: 'inline-block', marginTop: 8, padding: '12px 20px', borderRadius: 999, background: brand, color: '#fff', textDecoration: 'none', fontWeight: 650 }}>
              Make your own CV
            </a>
          </div>
        )}

        {typeof state === 'object' && (
          <>
            <CVPreview cvData={state.cv} selectedTemplate={state.template} registerDownload={(run) => setDownload(() => run)} />
            <a
              href="/cv"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginTop: 24,
                padding: 18,
                borderRadius: 22,
                background: '#fff',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(21,19,29,.06)',
              }}
            >
              <span style={{ width: 46, height: 46, borderRadius: 15, background: '#efecfd', color: brand, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                  <path d="M14 3v6h6M8 13h8M8 17h5" />
                </svg>
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#15131d' }}>Make a CV like this for free</span>
                <span style={{ display: 'block', fontSize: 13.5, color: '#716d80', marginTop: 2 }}>No sign-up. Works on your phone.</span>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a3a0b1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m9 6 6 6-6 6" />
              </svg>
            </a>
          </>
        )}
      </main>
    </div>
  )
}
