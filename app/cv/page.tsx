'use client'

import { useState } from 'react'
import { portfolioData } from '@/data/portfolio'
import CVBuilder from '@/components/cv/CVBuilder'
import CVPreview from '@/components/cv/CVPreview'
import Cursor from '@/components/Cursor'
import MahmudLogo from '@/components/MahmudLogo'

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
  photo: '',
  showSections: {
    summary: true,
    experience: true,
    projects: true,
    skills: true,
    education: true,
  },
}

export default function CVPage() {
  const [cvData, setCVData] = useState<CVData>(defaultCVData)
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate>('dark-pro')

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col">
      <Cursor />
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#050508]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <MahmudLogo size="sm" />
          <span className="text-white/40 text-sm font-normal" style={{ fontFamily: 'var(--font-dm-sans)' }}>← Back to Portfolio</span>
        </a>
        <h1
          className="text-white text-xl tracking-widest"
          style={{ fontFamily: 'var(--font-bebas)' }}
        >
          CV BUILDER
        </h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-0 pt-16 h-screen overflow-hidden">
        <div className="lg:w-[320px] w-full overflow-y-auto bg-[#0a0a12] border-r border-white/10">
          <CVBuilder
            cvData={cvData}
            setCVData={setCVData}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
          />
        </div>
        <div className="flex-1 overflow-y-auto bg-[#111118] p-6">
          <CVPreview cvData={cvData} selectedTemplate={selectedTemplate} />
        </div>
      </div>
    </div>
  )
}
