'use client'

import { useState } from 'react'
import { portfolioData } from '@/data/portfolio'
import CVBuilder from '@/components/cv/CVBuilder'
import CVPreview from '@/components/cv/CVPreview'
import ATSChecker from '@/components/cv/ATSChecker'
import Cursor from '@/components/Cursor'
import MahmudLogo from '@/components/MahmudLogo'
import { useIsMobile } from '@/hooks/useIsMobile'

export type CVTemplate = 'dark-pro' | 'clean-minimal' | 'tech-blue' | 'executive' | 'sidebar-light' | 'timeline' | 'bold-header' | 'creative-panel'

export type CVData = {
  personal: typeof portfolioData.personal
  skills: typeof portfolioData.skills
  projects: typeof portfolioData.projects
  experience: typeof portfolioData.experience
  education: typeof portfolioData.education
  selectedSkills: string[]
  photo: string
  showSections: {
    summary: boolean
    experience: boolean
    projects: boolean
    skills: boolean
    education: boolean
  }
}

const defaultCVData: CVData = {
  personal: { ...portfolioData.personal },
  skills: portfolioData.skills,
  projects: portfolioData.projects,
  experience: portfolioData.experience,
  education: portfolioData.education,
  selectedSkills: portfolioData.skills.map((s) => s.name),
  photo: '/images/mahmud-profile.jpg',
  showSections: {
    summary: true,
    experience: true,
    projects: true,
    skills: true,
    education: true,
  },
}

export default function CVPage() {
  const [cvData, setCVData]               = useState<CVData>(defaultCVData)
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate>('dark-pro')
  const [activeTab, setActiveTab]         = useState<'builder' | 'ats'>('builder')
  const [mobilePanel, setMobilePanel]     = useState<'controls' | 'preview'>('controls')
  const isMobile                          = useIsMobile()

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col">
      <Cursor />

      {/* Top navbar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 52,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: '#0d0d14', flexShrink: 0,
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      }}>
        {/* Left: back */}
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <MahmudLogo size="sm" />
          {!isMobile && (
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'var(--font-dm-sans)' }}>← Back</span>
          )}
        </a>

        {/* Center: tabs */}
        <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 3 }}>
          {([
            { id: 'builder', label: isMobile ? 'Builder' : 'CV Builder' },
            { id: 'ats',     label: isMobile ? 'ATS'     : 'ATS Checker' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: isMobile ? '5px 12px' : '6px 18px', borderRadius: 7, border: 'none',
                background: activeTab === tab.id ? '#4f8ef7' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.4)',
                fontSize: isMobile ? 12 : 13, fontWeight: activeTab === tab.id ? 600 : 400,
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
          <h1 className="text-white text-xl tracking-widest" style={{ fontFamily: 'var(--font-bebas)' }}>
            CV BUILDER
          </h1>
        ) : (
          /* Mobile: toggle Controls / Preview */
          <div style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 3 }}>
            {(['controls', 'preview'] as const).map(p => (
              <button
                key={p}
                onClick={() => setMobilePanel(p)}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', fontSize: 11,
                  background: mobilePanel === p ? 'rgba(79,142,247,0.25)' : 'transparent',
                  color: mobilePanel === p ? '#4f8ef7' : 'rgba(255,255,255,0.35)',
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
              <div style={{ height: '100%', overflowY: 'auto', background: '#0d0d14' }}>
                <CVBuilder cvData={cvData} setCVData={setCVData} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />
              </div>
            ) : (
              <div style={{ height: '100%', overflowY: 'auto', background: '#080810', padding: 16 }}>
                <CVPreview cvData={cvData} selectedTemplate={selectedTemplate} />
              </div>
            )
          ) : (
            mobilePanel === 'controls' ? (
              <div style={{ height: '100%', overflowY: 'auto', background: '#0d0d14' }}>
                <ATSChecker cvData={cvData} />
              </div>
            ) : (
              <div style={{ height: '100%', overflowY: 'auto', background: '#080810', padding: 16 }}>
                <CVPreview cvData={cvData} selectedTemplate={selectedTemplate} />
              </div>
            )
          )}
        </div>
      ) : (
        /* Desktop: side-by-side */
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', paddingTop: 52 }}>
          {activeTab === 'builder' ? (
            <>
              <div style={{ width: 340, minWidth: 340, height: '100%', overflowY: 'auto', overflowX: 'hidden', borderRight: '1px solid rgba(255,255,255,0.08)', background: '#0d0d14', flexShrink: 0 }}>
                <CVBuilder cvData={cvData} setCVData={setCVData} selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />
              </div>
              <div style={{ flex: 1, height: '100%', overflowY: 'auto', background: '#080810', padding: 24 }}>
                <CVPreview cvData={cvData} selectedTemplate={selectedTemplate} />
              </div>
            </>
          ) : (
            <>
              <div style={{ width: 420, minWidth: 420, height: '100%', overflowY: 'auto', overflowX: 'hidden', borderRight: '1px solid rgba(255,255,255,0.08)', background: '#0d0d14', flexShrink: 0 }}>
                <ATSChecker cvData={cvData} />
              </div>
              <div style={{ flex: 1, height: '100%', overflowY: 'auto', background: '#080810', padding: 24 }}>
                <CVPreview cvData={cvData} selectedTemplate={selectedTemplate} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
