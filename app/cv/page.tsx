'use client'

import { useEffect, useState } from 'react'
import { portfolioData } from '@/data/portfolio'
import CVBuilder from '@/components/cv/CVBuilder'
import CVPreview from '@/components/cv/CVPreview'
import ATSChecker from '@/components/cv/ATSChecker'
import { CVOptions } from '@/components/cv/CVPanels'
import Cursor from '@/components/Cursor'
import MahmudLogo from '@/components/MahmudLogo'
import { useIsMobile } from '@/hooks/useIsMobile'

export type CVTemplate =
  | 'profile-split'
  | 'swiss-grid'
  | 'ats-compact'
  | 'accent-rule'
  | 'dark-pro'
  | 'clean-minimal'
  | 'tech-blue'
  | 'executive'
  | 'sidebar-light'
  | 'timeline'
  | 'bold-header'
  | 'creative-panel'

export type CVData = {
  personal: typeof portfolioData.personal
  skills: typeof portfolioData.skills
  projects: typeof portfolioData.projects
  experience: typeof portfolioData.experience
  education: typeof portfolioData.education
  customSections: {
    id: string
    title: string
    content: string
  }[]
  sectionOrder: string[]
  selectedSkills: string[]
  photo: string
  /* Document appearance. The reference's right panel restyles a selected
     element; this template engine has no selection model, so these apply to
     the whole document instead. Consumed by the plain-paper templates. */
  docStyle: {
    accent: string
    typeface: 'sans' | 'serif' | 'mono'
    scale: number
    lineHeight: number
    photoShape: 'circle' | 'rounded' | 'square' | 'hidden'
  }
  showSections: {
    summary: boolean
    experience: boolean
    projects: boolean
    skills: boolean
    education: boolean
  }
}

const defaultCVData: CVData = buildDefaultCVData()

const CV_STORAGE_KEY = 'mahmud-cv-builder-data-v1'

function isValidStoredCVData(value: unknown): value is CVData {
  if (!value || typeof value !== 'object') return false

  const data = value as CVData

  return Boolean(
    data.personal &&
    data.skills &&
    data.projects &&
    data.experience &&
    data.education &&
    data.showSections
  )
}

function buildDefaultCVData(): CVData {
  return {
    personal: { ...portfolioData.personal },
    skills: portfolioData.skills,
    projects: portfolioData.projects,
    experience: portfolioData.experience,
    education: portfolioData.education,
    customSections: [],
    sectionOrder: ['summary', 'experience', 'projects', 'education'],
    selectedSkills: portfolioData.skills.map((s) => s.name),
    photo: '/images/mahmud-profile.jpg',
    docStyle: {
      accent: '#2563eb',
      typeface: 'sans',
      scale: 1,
      lineHeight: 1.65,
      photoShape: 'circle',
    },
    showSections: {
      summary: true,
      experience: true,
      projects: true,
      skills: true,
      education: true,
    },
  }
}

export default function CVPage() {
  const [cvData, setCVData]               = useState<CVData>(defaultCVData)
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate>('profile-split')
  const [activeTab, setActiveTab]         = useState<'builder' | 'ats'>('builder')
  const [mobilePanel, setMobilePanel]     = useState<'controls' | 'preview'>('controls')
  const [builderWidth, setBuilderWidth]   = useState(460)
  const [isResizing, setIsResizing]       = useState(false)
  const [hasHydrated, setHasHydrated]     = useState(false)
  const [saveState, setSaveState]         = useState<'saving' | 'saved'>('saved')
  const [savedAt, setSavedAt]             = useState<string>('Not saved yet')
  const [download, setDownload]           = useState<{ run: () => void; busy: boolean }>({ run: () => {}, busy: false })
  const [shared, setShared]               = useState(false)
  const isMobile                          = useIsMobile()
  /* Editor greys, matching components/cv/CVBuilder.tsx. The controls pane sets
     its own ground too; this is what shows in any gap. The preview pane is a
     half-step darker so the white document reads as a sheet on a desk. */
  const paneBorder                        = '#e4e8f0'
  const builderControlsBg                 = '#f4f6fa'
  const builderPreviewBg                  = '#eef1f6'

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CV_STORAGE_KEY)
      if (!stored) {
        setHasHydrated(true)
        return
      }

      const parsed = JSON.parse(stored)
      if (!isValidStoredCVData(parsed)) {
        setHasHydrated(true)
        return
      }

      setCVData({
        ...defaultCVData,
        ...parsed,
        personal: { ...defaultCVData.personal, ...parsed.personal },
        showSections: { ...defaultCVData.showSections, ...parsed.showSections },
        docStyle: { ...defaultCVData.docStyle, ...parsed.docStyle },
        customSections: Array.isArray(parsed.customSections) ? parsed.customSections : [],
        sectionOrder: Array.isArray(parsed.sectionOrder) ? parsed.sectionOrder : defaultCVData.sectionOrder,
        selectedSkills: Array.isArray(parsed.selectedSkills) ? parsed.selectedSkills : defaultCVData.selectedSkills,
      })
    } catch {
      // Ignore corrupted saved data and fall back to defaults.
    } finally {
      setHasHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hasHydrated) return

    setSaveState('saving')
    window.localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(cvData))
    setSaveState('saved')
    setSavedAt('Saved just now')
  }, [cvData, hasHydrated])

  useEffect(() => {
    if (isMobile || activeTab !== 'builder' || !isResizing) return

    const handlePointerMove = (event: MouseEvent) => {
      const nextWidth = Math.min(Math.max(event.clientX, 380), window.innerWidth - 700)
      setBuilderWidth(nextWidth)
    }

    const stopResizing = () => setIsResizing(false)

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', stopResizing)

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', stopResizing)
    }
  }, [activeTab, isMobile, isResizing])

  /* Named "Copy link" rather than "Share" on purpose. The CV lives in this
     browser's localStorage and is never uploaded, so a shared link would open
     an empty builder for anyone else — the button says exactly what it does.
     A real share needs the document persisted server-side behind /cv/<id>. */
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      /* Clipboard blocked (insecure origin, denied permission) — stay quiet. */
    }
  }

  const handleResetCV = () => {
    const resetData = buildDefaultCVData()
    setCVData(resetData)
    window.localStorage.removeItem(CV_STORAGE_KEY)
    setSavedAt('Reset complete')
    setSaveState('saved')
  }

  return (
    <div className="min-h-screen bg-[#f4f3ef] flex flex-col">
      <Cursor />

      {/* Top navbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 52,
        borderBottom: '1px solid rgba(22,21,15,0.07)',
        background: '#ffffff', flexShrink: 0,
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      }}>
        {/* Left: back */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <MahmudLogo size="sm" />
          {!isMobile && (
            <span style={{ color: 'rgba(22,21,15,0.4)', fontSize: 13, fontFamily: 'var(--font-dm-sans)' }}>← Back</span>
          )}
        </a>

        {/* Center: tabs */}
        <div style={{ display: 'flex', gap: 3, background: 'rgba(22,21,15,0.05)', borderRadius: 10, padding: 3 }}>
          {([
            { id: 'builder', label: 'Edit' },
            { id: 'ats',     label: isMobile ? 'ATS' : 'ATS Checker' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: isMobile ? '5px 12px' : '6px 18px', borderRadius: 7, border: 'none',
                /* Editor blue, not the site's orange: everything below this bar
                   is the builder workspace, which runs on its own palette. */
                background: activeTab === tab.id ? '#ffffff' : 'transparent',
                boxShadow: activeTab === tab.id ? '0 1px 3px rgba(15,23,42,0.12)' : 'none',
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                fontSize: isMobile ? 12 : 13, fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: 'pointer', transition: 'all 0.15s',
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right */}
        {!isMobile ? (
          /* Was `text-white` on a white bar — invisible once the page went
             light. Now a breadcrumb, matching the reference toolbar. */
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-dm-sans)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748b' }}>
              Documents
              <span style={{ color: '#cbd5e1' }}>/</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>My Resume</span>
            </span>

            <span style={{ width: 1, height: 22, background: '#e4e8f0' }} />

            <button
              onClick={download.run}
              disabled={download.busy}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 999,
                border: '1px solid #e4e8f0', background: '#ffffff',
                color: download.busy ? '#94a3b8' : '#0f172a',
                fontSize: 13, fontWeight: 600,
                cursor: download.busy ? 'wait' : 'pointer',
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {download.busy ? 'Generating…' : 'Download'}
            </button>

            <button
              onClick={handleShare}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '7px 16px', borderRadius: 999,
                border: 'none', background: '#2563eb', color: '#ffffff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              {/* A link, not a paper plane: nothing is sent anywhere. */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              {shared ? 'Copied' : 'Copy link'}
            </button>
          </div>
        ) : (
          /* Mobile: toggle Controls / Preview */
          <div style={{ display: 'flex', gap: 3, background: 'rgba(22,21,15,0.05)', borderRadius: 8, padding: 3 }}>
            {(['controls', 'preview'] as const).map(p => (
              <button
                key={p}
                onClick={() => setMobilePanel(p)}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: 11,
                  background: mobilePanel === p ? 'rgba(37,99,235,0.25)' : 'transparent',
                  color: mobilePanel === p ? '#e2701f' : 'rgba(22,21,15,0.35)',
                  cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', fontWeight: 500,
                  textTransform: 'capitalize',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {isMobile ? (
        /* Mobile: single panel at a time */
        <div style={{ paddingTop: 52, height: '100vh', overflow: 'hidden' }}>
          {activeTab === 'builder' ? (
            mobilePanel === 'controls' ? (
              <div style={{ height: '100%', overflowY: 'auto', background: builderControlsBg }}>
                <CVBuilder cvData={cvData} setCVData={setCVData} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} saveState={saveState} savedAt={savedAt} onReset={handleResetCV} />
                <div style={{ padding: '0 12px 110px' }}>
                  <CVOptions cvData={cvData} setCVData={setCVData} isMobile />
                </div>
              </div>
            ) : (
              <div style={{ height: '100%', overflowY: 'auto', background: builderPreviewBg, padding: 16 }}>
                <CVPreview cvData={cvData} selectedTemplate={selectedTemplate} registerDownload={(run, busy) => setDownload({ run, busy })} />
              </div>
            )
          ) : (
            mobilePanel === 'controls' ? (
              <div style={{ height: '100%', overflowY: 'auto', background: '#f4f6fa' }}>
                <ATSChecker cvData={cvData} />
              </div>
            ) : (
              <div style={{ height: '100%', overflowY: 'auto', background: '#eef1f6', padding: 16 }}>
                <CVPreview cvData={cvData} selectedTemplate={selectedTemplate} registerDownload={(run, busy) => setDownload({ run, busy })} />
              </div>
            )
          )}
        </div>
      ) : (
        /* Desktop */
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', paddingTop: 52 }}>
          {activeTab === 'builder' ? (
            /* Three columns: fields, document, display controls. The document
               sits in the middle so every edit is visible while you make it —
               it used to be pushed to one side behind the form. */
            <>
              <div
                style={{
                  width: builderWidth,
                  minWidth: 380,
                  maxWidth: 'calc(100vw - 700px)',
                  height: '100%',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  background: builderControlsBg,
                  borderRight: `1px solid ${paneBorder}`,
                  flexShrink: 0,
                }}
              >
                <CVBuilder cvData={cvData} setCVData={setCVData} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} saveState={saveState} savedAt={savedAt} onReset={handleResetCV} compact={builderWidth < 720} />
              </div>

              <div
                onMouseDown={() => setIsResizing(true)}
                style={{
                  width: 8,
                  cursor: 'col-resize',
                  background: isResizing ? 'rgba(37,99,235,0.16)' : 'transparent',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 3,
                    height: 56,
                    borderRadius: 999,
                    background: isResizing ? '#2563eb' : '#cbd5e1',
                  }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0, height: '100%', overflowY: 'auto', background: builderPreviewBg, padding: 24 }}>
                <CVPreview cvData={cvData} selectedTemplate={selectedTemplate} registerDownload={(run, busy) => setDownload({ run, busy })} />
              </div>

              <aside
                style={{
                  width: 288,
                  flexShrink: 0,
                  height: '100%',
                  overflowY: 'auto',
                  background: builderControlsBg,
                  borderLeft: `1px solid ${paneBorder}`,
                  padding: 16,
                }}
              >
                <CVOptions cvData={cvData} setCVData={setCVData} isMobile={false} />
              </aside>
            </>
          ) : (
            <>
              <div style={{ width: 440, minWidth: 440, height: '100%', overflowY: 'auto', overflowX: 'hidden', borderRight: '1px solid #e4e8f0', background: '#f4f6fa', flexShrink: 0 }}>
                <ATSChecker cvData={cvData} />
              </div>
              <div style={{ flex: 1, height: '100%', overflowY: 'auto', background: '#eef1f6', padding: 24 }}>
                <CVPreview cvData={cvData} selectedTemplate={selectedTemplate} registerDownload={(run, busy) => setDownload({ run, busy })} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
