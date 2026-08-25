'use client'

import { useEffect, useRef, useState } from 'react'
import { portfolioData } from '@/data/portfolio'
import CVBuilder from '@/components/cv/CVBuilder'
import CVPreview from '@/components/cv/CVPreview'
import ATSChecker from '@/components/cv/ATSChecker'
import { CVOptions } from '@/components/cv/CVPanels'
import Cursor from '@/components/Cursor'
import MahmudLogo from '@/components/MahmudLogo'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useCVDocs } from '@/hooks/useCVDocs'
import DocumentBar from '@/components/cv/DocumentBar'

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

/** Shared so the panel's Reset and a new CV agree on what "default" means. */
export const DEFAULT_DOC_STYLE = {
  accent: '#2563eb',
  ink: '#222222',
  typeface: 'sans',
  headingFont: 'match',
  scale: 1,
  lineHeight: 1.65,
  letterSpacing: 0,
  margin: 44,
  sectionGap: 24,
  headingCase: 'normal',
  headingRule: 'short',
  photoShape: 'circle',
  photoSize: 92,
} as const

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
    /** Body text colour. Pure black prints heavier than most people expect. */
    ink: string
    typeface: 'sans' | 'serif' | 'mono'
    /** `match` follows the body face; anything else pairs against it. */
    headingFont: 'match' | 'sans' | 'serif' | 'mono'
    scale: number
    lineHeight: number
    letterSpacing: number
    /** Page padding in px, and the gap between sections. */
    margin: number
    sectionGap: number
    headingCase: 'normal' | 'upper'
    headingRule: 'short' | 'full' | 'none'
    photoShape: 'circle' | 'rounded' | 'square' | 'hidden'
    photoSize: number
  }
  showSections: {
    summary: boolean
    experience: boolean
    projects: boolean
    skills: boolean
    education: boolean
  }
}

/**
 * A blank CV, because this is a tool anyone can open.
 *
 * It used to seed itself from `portfolioData`, so a stranger's first screen
 * was my name, photo, phone number and job history, which they had to delete
 * before they could start. The sample is still one click away.
 */
function buildDefaultCVData(): CVData {
  return {
    personal: {
      ...portfolioData.personal,
      name: '',
      shortName: '',
      fullName: '',
      role: '',
      tagline: '',
      email: '',
      phone: '',
      location: '',
      github: '',
      portfolio: '',
      upwork: '',
      linkedin: '',
      summary: '',
      photo: '',
    },
    skills: [],
    projects: [],
    experience: [],
    education: [],
    customSections: [],
    sectionOrder: ['summary', 'experience', 'projects', 'education'],
    selectedSkills: [],
    photo: '',
    docStyle: { ...DEFAULT_DOC_STYLE },
    showSections: {
      summary: true,
      experience: true,
      projects: true,
      skills: true,
      education: true,
    },
  }
}

/** The filled-in example, offered from the toolbar. */
function buildSampleCVData(): CVData {
  return {
    ...buildDefaultCVData(),
    personal: { ...portfolioData.personal },
    skills: portfolioData.skills,
    projects: portfolioData.projects,
    experience: portfolioData.experience,
    education: portfolioData.education,
    selectedSkills: portfolioData.skills.map((skill) => skill.name),
    photo: portfolioData.personal.photo,
  }
}

const EMPTY_CV: CVData = buildDefaultCVData()

export default function CVPage() {
  const {
    hydrated,
    docs,
    activeId,
    active,
    setActiveData,
    select,
    create,
    duplicate,
    rename,
    remove,
    replaceActive,
  } = useCVDocs(buildDefaultCVData, buildSampleCVData)

  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate>('profile-split')
  const [activeTab, setActiveTab]         = useState<'builder' | 'ats'>('builder')
  const [mobilePanel, setMobilePanel]     = useState<'controls' | 'preview'>('controls')
  const [builderWidth, setBuilderWidth]   = useState(460)
  const [isResizing, setIsResizing]       = useState(false)
  const [download, setDownload]           = useState<{ run: () => void; busy: boolean }>({ run: () => {}, busy: false })
  const [shared, setShared]               = useState(false)
  const fileInput                         = useRef<HTMLInputElement>(null)
  const isMobile                          = useIsMobile()

  /* Editor greys, matching components/cv/CVBuilder.tsx. */
  const paneBorder                        = '#e4e8f0'
  const builderControlsBg                 = '#f4f6fa'
  const builderPreviewBg                  = '#eef1f6'

  const cvData = active?.data ?? EMPTY_CV
  const setCVData = setActiveData
  const saveState: 'saving' | 'saved' = 'saved'
  const savedAt = hydrated ? 'Saved on this device' : 'Loading…'

  /* Backup and restore stand in for a server: a file the person keeps, rather
     than a copy of their CV on someone else's machine. */
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(active?.data ?? EMPTY_CV, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const base = (cvData.personal.name || 'cv').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || 'cv'
    a.href = url
    a.download = `${base}-backup.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text())
      if (!parsed?.personal || !parsed?.showSections) throw new Error('not a CV backup')
      replaceActive({ ...buildDefaultCVData(), ...parsed }, parsed.personal?.name ? `${parsed.personal.name}'s CV` : undefined)
    } catch {
      window.alert('That file is not a CV backup exported from here.')
    }
  }

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

  const handleLoadSample = () => replaceActive(buildSampleCVData(), 'Example CV')

  const handleResetCV = () => replaceActive(buildDefaultCVData())

  return (
    <div className="min-h-screen bg-[#f4f3ef] flex flex-col">
      <Cursor />

      {/* Top navbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0 10px' : '0 16px', height: 52, gap: 8, overflow: 'hidden',
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

        {/* Center: tabs. Mobile gets these in the bottom bar instead. */}
        <div style={{ display: isMobile ? 'none' : 'flex', gap: 3, background: 'rgba(22,21,15,0.05)', borderRadius: 10, padding: 3 }}>
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
            <DocumentBar
              docs={docs}
              activeId={activeId}
              onSelect={select}
              onCreate={create}
              onDuplicate={duplicate}
              onRename={rename}
              onDelete={remove}
              onExport={handleExport}
              onImport={handleImportFile}
            />

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
          /* The panel toggle moved to a bottom bar within thumb reach; the
             top bar keeps what you need to know, not what you tap. */
          <DocumentBar
            docs={docs}
            activeId={activeId}
            onSelect={select}
            onCreate={create}
            onDuplicate={duplicate}
            onRename={rename}
            onDelete={remove}
            onExport={handleExport}
            onImport={handleImportFile}
            compact
          />
        )}
      </div>

      {/* Content */}
      {isMobile ? (
        /* Mobile: single panel at a time */
        <div style={{ paddingTop: 52, paddingBottom: 64, height: '100vh', overflow: 'hidden', boxSizing: 'border-box' }}>
          {activeTab === 'builder' ? (
            /* Both panels stay mounted and are toggled with `display`. The
               preview owns the print logic and the node it clones, so
               unmounting it left Download doing nothing whenever someone was
               on the Edit tab — which is most of the time. */
            <>
              <div
                style={{
                  display: mobilePanel === 'controls' ? 'block' : 'none',
                  height: '100%',
                  overflowY: 'auto',
                  background: builderControlsBg,
                }}
              >
                <CVBuilder cvData={cvData} setCVData={setCVData} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} saveState={saveState} savedAt={savedAt} onReset={handleResetCV} onLoadSample={handleLoadSample} />
                <div style={{ padding: '0 12px 24px' }}>
                  <CVOptions cvData={cvData} setCVData={setCVData} isMobile />
                </div>
              </div>
              <div
                style={{
                  display: mobilePanel === 'preview' ? 'block' : 'none',
                  height: '100%',
                  overflowY: 'auto',
                  background: builderPreviewBg,
                  padding: 16,
                }}
              >
                <CVPreview cvData={cvData} selectedTemplate={selectedTemplate} registerDownload={(run, busy) => setDownload({ run, busy })} />
              </div>
            </>
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
                <CVBuilder cvData={cvData} setCVData={setCVData} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} saveState={saveState} savedAt={savedAt} onReset={handleResetCV} onLoadSample={handleLoadSample} compact={builderWidth < 720} />
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
                  width: 300,
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

      {/* Mobile action bar. Editing, checking and downloading are the three
          things people actually do, and on a phone they belong under the
          thumb rather than in a 4px-tall strip beside the logo. */}
      {isMobile && (
        <nav
          aria-label="CV actions"
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px calc(8px + env(safe-area-inset-bottom))',
            background: '#ffffff',
            borderTop: `1px solid ${paneBorder}`,
            boxShadow: '0 -4px 20px rgba(15,23,42,0.06)',
          }}
        >
          <div style={{ display: 'flex', flex: 1, gap: 3, background: '#f1f5f9', borderRadius: 10, padding: 3 }}>
            {([
              { id: 'edit', label: 'Edit' },
              { id: 'preview', label: 'Preview' },
              { id: 'ats', label: 'ATS' },
            ] as const).map((tab) => {
              const on =
                tab.id === 'ats'
                  ? activeTab === 'ats'
                  : activeTab === 'builder' && mobilePanel === (tab.id === 'edit' ? 'controls' : 'preview')
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'ats') {
                      setActiveTab('ats')
                      setMobilePanel('controls')
                    } else {
                      setActiveTab('builder')
                      setMobilePanel(tab.id === 'edit' ? 'controls' : 'preview')
                    }
                  }}
                  aria-pressed={on}
                  style={{
                    flex: 1,
                    padding: '9px 6px',
                    borderRadius: 8,
                    border: 'none',
                    background: on ? '#ffffff' : 'transparent',
                    boxShadow: on ? '0 1px 3px rgba(15,23,42,0.12)' : 'none',
                    color: on ? '#2563eb' : '#64748b',
                    fontSize: 13,
                    fontWeight: on ? 600 : 500,
                    fontFamily: 'var(--font-dm-sans)',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          <button
            onClick={download.run}
            disabled={download.busy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: '#2563eb',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-dm-sans)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PDF
          </button>
        </nav>
      )}
    </div>
  )
}
