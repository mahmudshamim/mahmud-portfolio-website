'use client'

import { portfolioData } from '@/data/portfolio'
import { useCVDocs } from '@/hooks/useCVDocs'
import Studio from '@/components/cv/studio/Studio'

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

/**
 * The CV studio.
 *
 * An app on a phone, three panes on a desktop, and a version per role.
 * Everything that used to compete for the screen at once — a three-column
 * editor, a ten-item checklist, fifteen typography controls, two tab strips —
 * is now a section list, a design tab, or behind "More".
 */
export default function CVPage() {
  const api = useCVDocs(buildDefaultCVData, buildSampleCVData)

  const handleExport = () => {
    const doc = api.active
    if (!doc) return
    /* The backup carries the versions too, so tailoring survives a move. */
    const blob = new Blob([JSON.stringify({ ...doc.data, __versions: doc.versions }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const base = (doc.data.personal.name || 'cv').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || 'cv'
    a.href = url
    a.download = `${base}-cv-backup.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text())
      if (!parsed?.personal || !parsed?.showSections) throw new Error('not a CV backup')
      const { __versions, ...data } = parsed
      api.replaceActive(
        { ...buildDefaultCVData(), ...data },
        data.personal?.name ? `${data.personal.name}'s CV` : undefined,
        Array.isArray(__versions) ? __versions : undefined
      )
    } catch {
      window.alert('That file is not a CV backup made here.')
    }
  }

  return <Studio api={api} blank={buildDefaultCVData} sample={buildSampleCVData} onExport={handleExport} onImport={handleImport} />
}
