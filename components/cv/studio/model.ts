import type { CVData, CVTemplate } from '@/app/cv/page'

/*
 * One profile, many role versions.
 *
 * People enter everything they have done once, every job, project and
 * skill, and then keep a version per role they apply for. A version is a
 * view over that profile: which items show, in what order, under which title,
 * with which summary and template. Change the role and the CV re-picks and
 * re-orders itself; nothing is copied, so fixing a typo in a job fixes it in
 * every version.
 *
 * Duplicating the whole CV per role (the only option before) meant editing
 * the same job five times and watching the copies drift apart.
 */

export type RoleVersion = {
  id: string
  role: string
  /** null = fall back to the profile summary */
  summary: string | null
  /** Keys of profile items this version leaves out. New items show by default. */
  hidden: { skills: string[]; projects: string[]; experience: string[] }
  template: CVTemplate
  /** A cover letter for this role, drafted from the CV and edited freely. */
  letter?: { company: string; manager: string; tone: 'formal' | 'friendly'; body: string }
}

type Job = CVData['experience'][number]
type Project = CVData['projects'][number]
type Skill = CVData['skills'][number]

export const newVersionId = () => `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

/** Content-derived, so it survives reordering. Editing the text makes it a
 *  "new" item, which is shown, the safe way to fail. */
export const jobKey = (j: Job) => `${j.role}@@${j.company}@@${j.date}`

export const ROLE_PRESETS: { title: string; keywords: string[] }[] = [
  { title: 'Frontend Developer', keywords: ['frontend', 'front-end', 'react', 'next.js', 'next', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'responsive', 'ui', 'web'] },
  { title: 'Backend Developer', keywords: ['backend', 'back-end', 'node', 'node.js', 'express', 'api', 'rest', 'graphql', 'mongodb', 'sql', 'mysql', 'postgresql', 'database', 'server', 'aws', 'docker', 'python', 'java'] },
  { title: 'Full-Stack Developer', keywords: ['full-stack', 'full stack', 'react', 'next.js', 'node', 'node.js', 'express', 'mongodb', 'javascript', 'typescript', 'api', 'sql', 'tailwind', 'html', 'css', 'aws', 'web'] },
  { title: 'Mobile App Developer', keywords: ['mobile', 'android', 'ios', 'flutter', 'dart', 'react native', 'kotlin', 'swift', 'app'] },
  { title: 'UI/UX Designer', keywords: ['ui', 'ux', 'design', 'designer', 'figma', 'wireframe', 'wireframing', 'prototype', 'prototyping', 'user research', 'usability', 'xd', 'sketch', 'interface', 'user experience'] },
  { title: 'Graphic Designer', keywords: ['graphic', 'design', 'photoshop', 'illustrator', 'canva', 'branding', 'logo', 'print', 'visual', 'typography'] },
  { title: 'WordPress Developer', keywords: ['wordpress', 'php', 'elementor', 'woocommerce', 'cms', 'theme', 'plugin', 'html', 'css', 'seo'] },
  { title: 'Digital Marketer', keywords: ['marketing', 'seo', 'sem', 'social media', 'content', 'ads', 'google ads', 'facebook', 'analytics', 'ga4', 'campaign', 'email', 'copywriting'] },
  { title: 'Project Manager', keywords: ['project', 'management', 'agile', 'scrum', 'jira', 'monday', 'planning', 'stakeholder', 'delivery', 'roadmap'] },
  { title: 'Data Analyst', keywords: ['data', 'analyst', 'analytics', 'sql', 'excel', 'python', 'power bi', 'tableau', 'dashboard', 'reporting', 'statistics'] },
  { title: 'Customer Support', keywords: ['customer', 'support', 'service', 'communication', 'crm', 'zendesk', 'client', 'helpdesk'] },
  { title: 'Sales Executive', keywords: ['sales', 'business development', 'client', 'crm', 'negotiation', 'lead', 'revenue', 'customer'] },
  { title: 'IT Support', keywords: ['it', 'support', 'network', 'hardware', 'troubleshooting', 'windows', 'helpdesk', 'system', 'administration'] },
  { title: 'Software Engineer', keywords: ['software', 'engineer', 'programming', 'javascript', 'typescript', 'python', 'java', 'c++', 'algorithms', 'data structures', 'api', 'sql', 'git', 'testing'] },
  { title: 'QA Engineer', keywords: ['qa', 'quality', 'testing', 'test cases', 'selenium', 'cypress', 'automation', 'manual testing', 'bug', 'jira', 'api testing'] },
  { title: 'DevOps Engineer', keywords: ['devops', 'docker', 'kubernetes', 'ci/cd', 'aws', 'linux', 'terraform', 'jenkins', 'github actions', 'monitoring', 'cloud'] },
  { title: 'Network Engineer', keywords: ['network', 'networking', 'cisco', 'ccna', 'routing', 'switching', 'firewall', 'mikrotik', 'lan', 'wan', 'vpn'] },
  { title: 'Business Analyst', keywords: ['business analysis', 'analyst', 'requirements', 'stakeholder', 'process', 'documentation', 'sql', 'excel', 'jira', 'user stories'] },
  { title: 'Content Writer', keywords: ['content', 'writing', 'writer', 'copywriting', 'seo', 'blog', 'editing', 'research', 'wordpress', 'social media'] },
  { title: 'Video Editor', keywords: ['video', 'editing', 'editor', 'premiere', 'after effects', 'davinci', 'motion graphics', 'youtube', 'color grading'] },
  { title: 'Social Media Manager', keywords: ['social media', 'facebook', 'instagram', 'tiktok', 'content', 'community', 'ads', 'canva', 'analytics', 'campaign'] },
  { title: 'HR Executive', keywords: ['hr', 'human resources', 'recruitment', 'hiring', 'onboarding', 'payroll', 'employee relations', 'training', 'performance', 'labour law'] },
  { title: 'Accountant', keywords: ['accounting', 'accountant', 'accounts', 'bookkeeping', 'tally', 'quickbooks', 'excel', 'vat', 'tax', 'audit', 'financial statements', 'reconciliation'] },
  { title: 'Admin Officer', keywords: ['admin', 'administration', 'office management', 'documentation', 'procurement', 'scheduling', 'ms office', 'coordination', 'vendor'] },
  { title: 'Teacher', keywords: ['teaching', 'teacher', 'lesson planning', 'classroom', 'curriculum', 'assessment', 'students', 'education', 'tutoring'] },
  { title: 'Merchandiser', keywords: ['merchandising', 'merchandiser', 'garments', 'apparel', 'buyer', 'sampling', 'costing', 'production', 'fabric', 'quality'] },
  { title: 'Supply Chain Officer', keywords: ['supply chain', 'procurement', 'purchase', 'inventory', 'logistics', 'warehouse', 'vendor', 'sap', 'import', 'export'] },
  { title: 'Civil Engineer', keywords: ['civil', 'engineer', 'autocad', 'structural', 'construction', 'site', 'estimation', 'etabs', 'surveying'] },
  { title: 'Electrical Engineer', keywords: ['electrical', 'engineer', 'plc', 'autocad', 'power', 'maintenance', 'wiring', 'substation', 'scada'] },
  { title: 'Bank Officer', keywords: ['banking', 'bank', 'customer service', 'credit', 'loan', 'compliance', 'kyc', 'aml', 'cash', 'accounts'] },
]

/** Real skill names to suggest per role. The matching keywords above include
 *  words like "designer" and "interface", useful for scoring, useless as a
 *  chip that says "+ Designer". */
const SKILL_IDEAS: Record<string, string[]> = {
  'Frontend Developer': ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'Redux', 'REST APIs', 'Responsive Design', 'Git', 'Jest'],
  'Backend Developer': ['Node.js', 'Express', 'REST APIs', 'GraphQL', 'PostgreSQL', 'MongoDB', 'MySQL', 'Docker', 'AWS', 'Redis', 'Python', 'Git'],
  'Full-Stack Developer': ['React', 'Next.js', 'Node.js', 'Express', 'TypeScript', 'MongoDB', 'PostgreSQL', 'REST APIs', 'Tailwind CSS', 'Docker', 'AWS', 'Git'],
  'Mobile App Developer': ['Flutter', 'Dart', 'React Native', 'Kotlin', 'Swift', 'Firebase', 'REST APIs', 'Android Studio', 'Xcode', 'Git'],
  'UI/UX Designer': ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Usability Testing', 'Design Systems', 'Interaction Design', 'Adobe XD', 'Information Architecture', 'Sketch'],
  'Graphic Designer': ['Adobe Photoshop', 'Adobe Illustrator', 'Canva', 'Branding', 'Logo Design', 'Typography', 'Print Design', 'Adobe InDesign', 'Social Media Graphics'],
  'WordPress Developer': ['WordPress', 'PHP', 'Elementor', 'WooCommerce', 'HTML', 'CSS', 'JavaScript', 'SEO', 'MySQL', 'Theme Customization'],
  'Digital Marketer': ['SEO', 'Google Ads', 'Facebook Ads', 'Social Media Marketing', 'Content Writing', 'Google Analytics (GA4)', 'Email Marketing', 'Copywriting', 'Keyword Research', 'Canva'],
  'Project Manager': ['Agile', 'Scrum', 'Jira', 'Monday.com', 'Stakeholder Management', 'Risk Management', 'Budgeting', 'Team Leadership', 'Reporting', 'Planning'],
  'Data Analyst': ['SQL', 'Excel', 'Python', 'Power BI', 'Tableau', 'Data Visualization', 'Statistics', 'Pandas', 'Dashboards', 'Reporting'],
  'Customer Support': ['Customer Service', 'Communication', 'CRM', 'Zendesk', 'Problem Solving', 'Live Chat', 'Email Support', 'Ticketing', 'Conflict Resolution'],
  'Sales Executive': ['Sales', 'Negotiation', 'Lead Generation', 'CRM', 'Business Development', 'Cold Calling', 'Client Relationships', 'Presentations'],
  'IT Support': ['Troubleshooting', 'Windows', 'Networking', 'Hardware', 'Active Directory', 'Microsoft 365', 'Help Desk', 'Linux', 'System Administration'],
  'Software Engineer': ['JavaScript', 'TypeScript', 'Python', 'Java', 'Data Structures', 'Algorithms', 'REST APIs', 'SQL', 'Git', 'Unit Testing'],
  'QA Engineer': ['Manual Testing', 'Test Cases', 'Selenium', 'Cypress', 'Postman', 'API Testing', 'Jira', 'Regression Testing', 'Bug Reporting'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux', 'Terraform', 'GitHub Actions', 'Jenkins', 'Nginx', 'Monitoring'],
  'Network Engineer': ['CCNA', 'Routing', 'Switching', 'Firewall', 'MikroTik', 'LAN/WAN', 'VPN', 'Network Security', 'Troubleshooting'],
  'Business Analyst': ['Requirements Gathering', 'Stakeholder Management', 'Process Mapping', 'User Stories', 'SQL', 'Excel', 'Jira', 'Documentation'],
  'Content Writer': ['Copywriting', 'SEO Writing', 'Blog Writing', 'Editing', 'Proofreading', 'Research', 'WordPress', 'Social Media Content'],
  'Video Editor': ['Adobe Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Motion Graphics', 'Colour Grading', 'Sound Editing', 'YouTube', 'Storytelling'],
  'Social Media Manager': ['Facebook Ads', 'Instagram', 'TikTok', 'Content Calendar', 'Community Management', 'Canva', 'Meta Business Suite', 'Analytics'],
  'HR Executive': ['Recruitment', 'Onboarding', 'Payroll', 'Employee Relations', 'HRIS', 'Performance Management', 'Training', 'Bangladesh Labour Law'],
  'Accountant': ['Bookkeeping', 'Tally', 'QuickBooks', 'Excel', 'VAT & Tax', 'Bank Reconciliation', 'Financial Statements', 'Audit Support'],
  'Admin Officer': ['Office Management', 'Documentation', 'MS Office', 'Procurement', 'Scheduling', 'Vendor Management', 'Record Keeping', 'Communication'],
  'Teacher': ['Lesson Planning', 'Classroom Management', 'Curriculum Design', 'Assessment', 'Student Mentoring', 'Communication', 'MS Office', 'Online Teaching'],
  'Merchandiser': ['Buyer Communication', 'Sampling', 'Costing', 'Time & Action Plan', 'Fabric Knowledge', 'Production Follow-up', 'Quality Control', 'Excel'],
  'Supply Chain Officer': ['Procurement', 'Inventory Management', 'Logistics', 'Vendor Management', 'SAP', 'Import & Export', 'Warehouse Management', 'Excel'],
  'Civil Engineer': ['AutoCAD', 'ETABS', 'Structural Design', 'Estimation', 'Site Supervision', 'Surveying', 'BOQ', 'Project Planning'],
  'Electrical Engineer': ['AutoCAD Electrical', 'PLC', 'SCADA', 'Power Systems', 'Maintenance', 'Wiring', 'Substation', 'Safety Compliance'],
  'Bank Officer': ['Customer Service', 'Account Opening', 'KYC', 'AML Compliance', 'Credit Analysis', 'Cash Handling', 'Banking Software', 'Sales'],
}

const STOP = new Set(
  ('the and for with you your our are will have has this that from into who what their they them about work working team role job ' +
    'years year experience ability skills strong good excellent must should can using use including etc also more other such well ' +
    'within across over under able based new high level we an a to of in on at by or as is be it its if not all any each per via plus ' +
    'looking seeking join help make build building across candidate position company preferred required responsibilities requirements')
    .split(' ')
)

export function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[.-]+|[.-]+$/g, ''))
    .filter((w) => w.length > 1 && !STOP.has(w))
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Does `keyword` appear in `text` as a word or phrase (not inside another word)? */
export function has(text: string, keyword: string) {
  if (!keyword) return false
  return new RegExp(`(^|[^a-z0-9])${esc(keyword.toLowerCase())}([^a-z0-9]|$)`).test((text || '').toLowerCase())
}

/** Keywords for a role: a preset if it matches, otherwise every preset that
 *  shares a word with it, plus the role's own words. */
export function keywordsFor(role: string): string[] {
  const r = (role || '').toLowerCase().trim()
  if (!r) return []
  const exact = ROLE_PRESETS.find((p) => p.title.toLowerCase() === r)
  if (exact) return exact.keywords
  const words = tokenize(r)
  const out = new Set(words)
  for (const preset of ROLE_PRESETS) {
    if (tokenize(preset.title).some((w) => words.includes(w))) preset.keywords.forEach((k) => out.add(k))
  }
  return Array.from(out)
}

/** Skills worth suggesting for a role: the matching preset's list, or the
 *  lists of presets that share a word with a custom title. */
export function skillIdeas(role: string): string[] {
  const r = (role || '').toLowerCase().trim()
  if (!r) return []
  const exact = ROLE_PRESETS.find((p) => p.title.toLowerCase() === r)
  const words = tokenize(r)
  const presets = exact ? [exact] : ROLE_PRESETS.filter((p) => tokenize(p.title).some((w) => words.includes(w)))
  return Array.from(new Set(presets.flatMap((p) => SKILL_IDEAS[p.title] ?? [])))
}

/**
 * Preset roles closest to what someone typed, best first.
 *
 * "acc" finds Accountant as the letters go in; "react developer" finds
 * Frontend and Full-Stack through their keywords. An empty result is a real
 * answer: the title works as typed, there is just no ready-made list for it.
 */
export function closestRoles(input: string, limit = 6) {
  const q = (input || '').toLowerCase().trim()
  if (!q) return []
  const words = tokenize(q)
  return ROLE_PRESETS.map((p) => {
    const title = p.title.toLowerCase()
    let score = title.includes(q) || q.includes(title) ? 10 : 0
    for (const w of words) {
      if (tokenize(title).some((t) => t.startsWith(w))) score += 4
      if (w.length > 2 && p.keywords.some((k) => k === w || k.startsWith(w))) score += 2
      if (w.length > 2 && (SKILL_IDEAS[p.title] ?? []).some((s) => s.toLowerCase().includes(w))) score += 1
    }
    return { p, score }
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p)
}

export function relevance(text: string, keywords: string[]) {
  let score = 0
  for (const k of keywords) if (has(text, k)) score += k.includes(' ') ? 2 : 1
  return score
}

export const skillText = (s: Skill) => `${s.name} ${s.category}`
export const projectText = (p: Project) => `${p.name} ${p.shortDesc} ${p.fullDesc} ${(p.tech || []).join(' ')} ${p.category}`

/**
 * Pick what a role version should leave out.
 *
 * Skills and projects with no connection to the role are hidden, but never
 * so many that a section empties. Jobs are never auto-hidden: a gap in work
 * history reads worse to a recruiter than an unrelated job does.
 */
export function tailor(profile: CVData, keywords: string[]): RoleVersion['hidden'] {
  const skills = profile.skills.map((s) => ({ key: s.name, score: relevance(skillText(s), keywords) }))
  const projects = profile.projects.map((p) => ({ key: p.id, score: relevance(projectText(p), keywords) }))

  const hideSkills = skills.filter((x) => x.score === 0).map((x) => x.key)
  const hideProjects = projects.filter((x) => x.score === 0).map((x) => x.key)

  return {
    skills: skills.length - hideSkills.length >= Math.min(3, skills.length) ? hideSkills : [],
    projects: projects.length - hideProjects.length >= 1 ? hideProjects : [],
    experience: [],
  }
}

export function createVersion(profile: CVData, role: string, template: CVTemplate, keywords?: string[]): RoleVersion {
  return {
    id: newVersionId(),
    role,
    summary: null,
    hidden: role ? tailor(profile, keywords ?? keywordsFor(role)) : { skills: [], projects: [], experience: [] },
    template,
  }
}

/** Keep original order among equals, so ties do not shuffle on every render. */
function byRelevance<T>(items: T[], text: (t: T) => string, keywords: string[]) {
  if (!keywords.length) return items
  return items
    .map((item, index) => ({ item, index, score: relevance(text(item), keywords) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((x) => x.item)
}

/** The CV a version produces: the profile, filtered and re-ordered for its role. */
export function applyVersion(profile: CVData, v: RoleVersion | null): CVData {
  if (!v) return profile
  const keywords = keywordsFor(v.role)
  const skills = byRelevance(
    profile.skills.filter((s) => !v.hidden.skills.includes(s.name)),
    skillText,
    keywords
  )
  const projects = byRelevance(
    profile.projects.filter((p) => !v.hidden.projects.includes(p.id)),
    projectText,
    keywords
  )
  return {
    ...profile,
    personal: {
      ...profile.personal,
      role: v.role || profile.personal.role,
      summary: v.summary ?? profile.personal.summary,
    },
    skills,
    projects,
    experience: profile.experience.filter((j) => !v.hidden.experience.includes(jobKey(j))),
    selectedSkills: skills.map((s) => s.name),
  }
}

/* ── Matching a job ad ─────────────────────────────────────────────────── */

/**
 * Only the person's own words.
 *
 * The previous checker padded every CV with a fixed string of my stack
 * ("react next.js node.js mongodb … khulna technologies") and fell back to my
 * name and summary for empty fields, so a marketer who had never touched
 * React scored as if they had.
 */
export function cvText(cv: CVData) {
  return [
    cv.personal.role,
    cv.personal.summary,
    ...cv.skills.map((s) => s.name),
    ...cv.experience.flatMap((j) => [j.role, j.company, j.desc]),
    ...cv.projects.flatMap((p) => [p.name, p.shortDesc, p.fullDesc, ...(p.tech || [])]),
    ...cv.education.flatMap((e) => [e.degree, e.school]),
    ...cv.customSections.flatMap((c) => [c.title, c.content]),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/** The terms a job ad actually cares about: known skills it names, plus
 *  anything it repeats. */
export function jobKeywords(ad: string) {
  const known = Array.from(new Set(ROLE_PRESETS.flatMap((p) => p.keywords))).filter((k) => has(ad, k))
  const counts = new Map<string, number>()
  for (const w of tokenize(ad)) if (w.length > 2) counts.set(w, (counts.get(w) ?? 0) + 1)
  const repeated = Array.from(counts.entries()).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).map(([w]) => w)
  return Array.from(new Set(known.concat(repeated))).slice(0, 30)
}

/**
 * Share of the ad's keywords the CV mentions. No floor, no bonus points:
 * the old checker started every score at 30% and added up to 25 on top, so
 * a CV that matched nothing still looked half-way there.
 */
export function matchJob(cv: CVData, ad: string) {
  const keywords = jobKeywords(ad)
  const text = cvText(cv)
  const matched = keywords.filter((k) => has(text, k))
  const missing = keywords.filter((k) => !matched.includes(k))
  return {
    keywords,
    matched,
    missing,
    score: keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0,
  }
}

/* ── Writing help ─────────────────────────────────────────────────────── */

/** A starting point built from what they have already entered. Clearly a
 *  draft to edit, not a finished summary. */
export function summaryStarter(cv: CVData, role: string) {
  const title = role || cv.personal.role || 'Professional'
  const top = cv.skills.slice(0, 3).map((s) => s.name)
  const job = cv.experience[0]
  const parts = [
    `${title}${top.length ? ` with hands-on experience in ${top.join(', ').replace(/, ([^,]*)$/, ' and $1')}` : ''}.`,
    job?.role && job?.company ? `Currently ${job.current ? 'working' : 'worked'} as ${job.role} at ${job.company}.` : '',
    `Looking for a ${title.toLowerCase()} role where I can take ownership and keep learning.`,
  ]
  return parts.filter(Boolean).join(' ')
}
