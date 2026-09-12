import type { CVData } from '@/app/cv/page'

/*
 * Turn an old CV or a LinkedIn profile into a starting point.
 *
 * Retyping a CV on a phone is the main reason people give up. This reads the
 * text, from a PDF, or pasted, and sorts it into sections by their
 * headings, then pulls jobs apart at their date ranges. It is a heuristic and
 * says so: the result is a draft to check, not a finished CV.
 *
 * Everything runs in the browser. The file is never uploaded.
 */

type Section = 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'other'

const HEADINGS: [Section, RegExp][] = [
  ['summary', /^(professional |career )?(summary|profile|about( me)?|objective|career objective|overview|introduction)$/],
  ['experience', /^((work|professional|relevant|employment) )?(experience|experiences|employment( history)?|work history|career history)$/],
  ['education', /^(education|educational (background|qualifications?)|academic( background| qualifications?)?|qualifications?|education (and|&) training)$/],
  ['skills', /^((top|key|core|technical|professional|soft|hard) )?(skills|skill set|competencies|expertise|skills (and|&) (tools|expertise|abilities)|tools|technologies)$/],
  ['projects', /^((personal|selected|key|academic|notable) )?projects$/],
  [
    'other',
    /^(certifications?|licenses( (and|&) certifications)?|languages?|awards?|honou?rs( (and|&) awards)?|references?|interests|hobbies|contact|contact (info|information|details)|volunteer(ing| experience)?|publications|achievements|trainings?|courses|extra[- ]curricular( activities)?|personal (details|information)|declaration)$/,
  ],
]

const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/
const LINKEDIN = /(https?:\/\/)?([a-z]{2,3}\.)?linkedin\.com\/in\/[\w%-]+\/?/i
const GITHUB = /(https?:\/\/)?(www\.)?github\.com\/[\w-]+/i
const URL_RE = /(https?:\/\/)?(www\.)?[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)*\.(com|dev|io|me|net|org|xyz|app|bd|co|site|tech|us|info|online|page)(\/[^\s,;)]*)?/i
const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?'
const DATE = `(?:${MONTH}\\s*,?\\s*)?(?:19|20)\\d{2}|(?:0?[1-9]|1[0-2])\\/(?:19|20)\\d{2}`
const RANGE = new RegExp(`(${DATE})\\s*(?:-|\u2013|\u2014|to|until)\\s*(${DATE}|present|current|now|ongoing|till date|to date)`, 'i')
const YEAR = /\b(19|20)\d{2}\b/
const BULLET = /^[•·●▪◦‣*>➤✓\-\u2013\u2014]\s*/
const TITLE_WORDS =
  /\b(developer|engineer|designer|manager|officer|executive|analyst|consultant|specialist|intern|assistant|lead|head|director|founder|entrepreneur|freelancer|marketer|writer|teacher|accountant|coordinator|administrator|support|representative|trainee|associate|architect|programmer|student)\b/i
const COMPANY_WORDS =
  /\b(ltd|limited|llc|inc|corp|corporation|company|co\.|technologies|technology|tech|solutions|group|agency|studio|bank|university|college|school|foundation|gallery|soft|software|systems|labs?|services|enterprise|international|ventures)\b/i
const DEGREE =
  /\b(bachelor|master|b\.?\s?sc|m\.?\s?sc|b\.?\s?a|m\.?\s?a|bba|mba|b\.?\s?s|m\.?\s?s|phd|doctorate|diploma|hsc|ssc|dakhil|alim|a[- ]levels?|o[- ]levels?|certificate|certification|course|bootcamp|degree|graduation|program|programme)\b/i
const SCHOOL = /\b(university|college|school|institute|academy|polytechnic|madrasa|madrasah|campus|hero|ostad|coursera|udemy|edx)\b/i

const clean = (s: string) => s.replace(/\s+/g, ' ').trim()
const strip = (s: string) => clean(s.replace(BULLET, ''))
const capWord = (s: string) => s.replace(/\b([a-z])/g, (m) => m.toUpperCase())
const normDate = (m: RegExpMatchArray) => `${capWord(clean(m[1]))} - ${capWord(clean(m[2]))}`

function headingOf(line: string): Section | null {
  const l = line
    .toLowerCase()
    .replace(/^[^a-z]+|[^a-z)]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!l || l.length > 40) return null
  for (const [s, re] of HEADINGS) if (re.test(l)) return s
  return null
}

const nameLike = (l: string) => {
  const w = l.split(' ')
  return (
    /^[A-Za-z][A-Za-z.'\- ]{2,48}$/.test(l) &&
    w.length >= 2 &&
    w.length <= 5 &&
    !/\b(at|and|of|the|for|with|in|to)\b/.test(l) &&
    !TITLE_WORDS.test(l) &&
    !headingOf(l)
  )
}

const locationLike = (l: string) =>
  l.length < 60 &&
  !/\d{3,}/.test(l) &&
  !EMAIL.test(l) &&
  (/^[A-Za-z .'-]+,\s*[A-Za-z .'-]+(,\s*[A-Za-z .'-]+)?$/.test(l) ||
    /\b(bangladesh|dhaka|chittagong|chattogram|khulna|sylhet|rajshahi|india|pakistan|nepal|usa|united states|uk|united kingdom|canada|uae|dubai|malaysia|singapore|remote)\b/i.test(l))

const contactLike = (l: string) => EMAIL.test(l) || LINKEDIN.test(l) || GITHUB.test(l) || /(\+?\d[\d\s().-]{8,}\d)/.test(l)

type Job = CVData['experience'][number]
type School = CVData['education'][number]
type Project = CVData['projects'][number]

function parseJobs(lines: string[], linkedin: boolean): Job[] {
  const ls = lines.map((l) => clean(l.replace(/\(\s*\d+\s*(yrs?|years?|mos?|months?)[^)]*\)/gi, ''))).filter(Boolean)
  const dates = ls.map((l, i) => (RANGE.test(l) ? i : -1)).filter((i) => i >= 0)
  if (!dates.length) return []

  /* Pass 1: the heading lines of each job sit just above its date line. */
  const heads = dates.map((d, k) => {
    const prev = k ? dates[k - 1] : -1
    const m = ls[d].match(RANGE)!
    const rest = clean(ls[d].replace(RANGE, '').replace(/^[\s|,·\u2013\u2014-]+|[\s|,·\u2013\u2014-]+$/g, ''))
    const before: string[] = []
    for (let j = d - 1; j > prev && before.length < (rest ? 1 : 2); j--) {
      const l = ls[j]
      if (BULLET.test(l) || l.length > 90 || /[.;]$/.test(l)) break
      before.unshift(l)
    }
    return { d, m, rest, before, start: d - before.length }
  })

  return heads.map((h, k) => {
    const lines = h.rest ? [...h.before, h.rest] : h.before
    let role = ''
    let company = ''
    if (lines.length === 1) {
      const parts = lines[0].split(/\s+(?:at|@)\s+|\s*[|\u2013\u2014]\s*|\s+-\s+|,\s+/)
      role = parts[0] ?? ''
      company = parts[1] ?? ''
    } else if (lines.length >= 2) {
      const [a, b] = lines.slice(-2)
      /* LinkedIn prints the company above the title; most CVs do the opposite. */
      ;[company, role] = linkedin ? [a, b] : [b, a]
      /* A job-title word is the stronger signal: "Digital Marketing
         Executive" is a title even though "digital" sounds like a company. */
      if (TITLE_WORDS.test(company) && !TITLE_WORDS.test(role)) [role, company] = [company, role]
      else if (!TITLE_WORDS.test(role) && COMPANY_WORDS.test(role) && !COMPANY_WORDS.test(company)) [role, company] = [company, role]
    }

    const end = heads[k + 1]?.start ?? ls.length
    const body = ls.slice(h.d + 1, end)
    /* A location line often follows the dates. */
    if (body[0] && locationLike(body[0])) body.shift()

    return {
      role: clean(role),
      company: clean(company),
      date: normDate(h.m),
      desc: body.map(strip).filter(Boolean).join('\n'),
      current: /present|current|now|ongoing|date/i.test(h.m[2]),
    }
  })
}

function parseSchools(lines: string[]): School[] {
  const out: School[] = []
  let cur: School | null = null
  const open = () => {
    cur = { degree: '', school: '', date: '' }
    out.push(cur)
    return cur
  }
  for (const raw of lines) {
    const l = strip(raw)
    const range = l.match(RANGE)
    const year = l.match(YEAR)
    const text = clean(
      l
        .replace(RANGE, '')
        .replace(/\(\s*\)/g, '')
        .replace(/[,(\s]*\b(19|20)\d{2}\)?$/, '')
        .replace(/^[\s|,·\u2013\u2014-]+|[\s|,·\u2013\u2014-]+$/g, '')
    )
    const isDeg = DEGREE.test(text)
    const isSch = SCHOOL.test(text) && !isDeg
    let c: School = cur ?? open()
    if ((isDeg && c.degree) || (isSch && c.school)) c = open()
    if (isDeg) c.degree = text
    else if (isSch) c.school = text
    else if (text && text.length > 3 && !/^\d/.test(text)) {
      if (!c.degree) c.degree = text
      else if (!c.school) c.school = text
    }
    if (range) c.date = normDate(range)
    else if (!c.date && year) c.date = year[0]
  }
  return out.filter((s) => s.degree || s.school)
}

function parseProjects(lines: string[]): Project[] {
  const out: Project[] = []
  let cur: Project | null = null
  for (const raw of lines) {
    const bullet = BULLET.test(raw)
    const l = strip(raw)
    const tech = l.match(/^(tech(nologies)?|stack|built with|tools)\s*[:\-]\s*(.+)$/i)
    if (tech && cur) {
      cur.tech = tech[3].split(/\s*[,|·•]\s*/).filter(Boolean)
      continue
    }
    const url = l.match(URL_RE)
    if (!bullet && l.length <= 60 && !/\.$/.test(l) && (!cur || cur.shortDesc)) {
      cur = {
        id: `p-${Date.now().toString(36)}-${out.length}`,
        name: clean(l.replace(URL_RE, '').replace(/[\s|\u2013\u2014-]+$/, '')) || 'Project',
        shortDesc: '',
        fullDesc: '',
        tech: [],
        github: '',
        live: url ? url[0] : '',
        featured: true,
        category: 'Project',
        color: '#2563eb',
      }
      out.push(cur)
      continue
    }
    if (!cur) continue
    if (url && !cur.live) cur.live = url[0]
    if (!cur.shortDesc) cur.shortDesc = l
    else cur.fullDesc = cur.fullDesc ? `${cur.fullDesc}\n${l}` : l
  }
  return out.map((p) => ({ ...p, fullDesc: p.fullDesc || p.shortDesc }))
}

function parseSkills(lines: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of lines) {
    let l = strip(raw)
    /* "Languages: JavaScript, Python", keep what follows a short label. */
    const colon = l.indexOf(':')
    if (colon > 0 && colon < 26) l = l.slice(colon + 1)
    for (const part of l.split(/\s*[,•·|;]\s*|\s{2,}/)) {
      const s = clean(part.replace(/\(.*?\)/g, '').replace(/[.:]$/, ''))
      if (s.length < 2 || s.length > 40 || /^\d+%?$/.test(s) || s.split(' ').length > 5) continue
      const k = s.toLowerCase()
      if (seen.has(k)) continue
      seen.add(k)
      out.push(s)
    }
  }
  return out.slice(0, 40)
}

export type ImportResult = {
  data: CVData
  found: { name: boolean; email: boolean; phone: boolean; summary: boolean; jobs: number; schools: number; skills: number; projects: number }
}

export function parseCVText(text: string, blank: CVData): ImportResult {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map(clean)
    .filter((l) => l && !/^page \d+ of \d+$/i.test(l))
  const linkedin = /linkedin\.com\/in\//i.test(text) && /(top skills|page \d+ of \d+)/i.test(text)

  const buckets: Record<Section, string[]> = { header: [], summary: [], experience: [], education: [], skills: [], projects: [], other: [] }
  const order: { line: string; section: Section; i: number }[] = []
  let cur: Section = 'header'
  lines.forEach((l, i) => {
    const h = headingOf(l)
    if (h) {
      cur = h
      return
    }
    buckets[cur].push(l)
    order.push({ line: l, section: cur, i })
  })

  /* Name, headline and place. LinkedIn prints its sidebar (contact, top
     skills, languages) first, so the name sits just above "Summary" or
     "Experience" rather than at the top. */
  let name = ''
  let role = ''
  let location = ''
  const consumed = new Set<number>()
  const firstMain = lines.findIndex((l) => {
    const h = headingOf(l)
    return h === 'summary' || h === 'experience'
  })
  const window_ = linkedin && firstMain > 0 ? lines.slice(Math.max(0, firstMain - 6), firstMain).map((l, k) => ({ l, i: Math.max(0, firstMain - 6) + k })) : lines.slice(0, 12).map((l, i) => ({ l, i }))
  const nameAt = window_.find((x) => nameLike(x.l) && !contactLike(x.l))
  if (nameAt) {
    /* "AYESHA RAHMAN" → "Ayesha Rahman"; a name in capitals is a heading style. */
    name = nameAt.l === nameAt.l.toUpperCase() ? nameAt.l.toLowerCase().replace(/(^|[\s.'-])([a-z])/g, (m) => m.toUpperCase()) : nameAt.l
    consumed.add(nameAt.i)
    const after = lines.slice(nameAt.i + 1, nameAt.i + 5)
    for (let k = 0; k < after.length; k++) {
      const l = after[k]
      if (headingOf(l)) break
      if (!location && locationLike(l)) {
        location = l
        consumed.add(nameAt.i + 1 + k)
        continue
      }
      if (!role && !contactLike(l) && l.length < 120 && !RANGE.test(l)) {
        role = clean(l.split(/\s+\|\s+|\s+at\s+|\s+@\s+/)[0]).slice(0, 60)
        consumed.add(nameAt.i + 1 + k)
      }
    }
  }
  if (!location) location = lines.slice(0, 15).find(locationLike) ?? ''
  const unconsumed = (section: Section) => order.filter((o) => o.section === section && !consumed.has(o.i)).map((o) => o.line)

  const email = text.match(EMAIL)?.[0] ?? ''
  const linkedinUrl = text.match(LINKEDIN)?.[0] ?? ''
  const githubUrl = text.match(GITHUB)?.[0] ?? ''
  const phone =
    lines
      .map((l) => l.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0] ?? '')
      .find((p) => p.replace(/\D/g, '').length >= 9 && !RANGE.test(p) && !/^(19|20)\d{2}\s*[-\u2013\u2014]/.test(p)) ?? ''
  const emailDomain = email.split('@')[1] ?? ''
  const website =
    (text.match(new RegExp(URL_RE.source, 'gi')) ?? []).find(
      (u) => !/linkedin|github/i.test(u) && !(emailDomain && u.includes(emailDomain)) && !u.includes('@')
    ) ?? ''

  const summary = unconsumed('summary').join(' ')
  const skills = parseSkills(unconsumed('skills'))
  const experience = parseJobs(unconsumed('experience'), linkedin)
  const education = parseSchools(unconsumed('education'))
  const projects = parseProjects(unconsumed('projects'))

  const data: CVData = {
    ...blank,
    personal: {
      ...blank.personal,
      name,
      fullName: name,
      shortName: name.split(' ').slice(-1)[0] ?? '',
      role,
      email,
      phone: clean(phone),
      location,
      linkedin: linkedinUrl,
      github: githubUrl,
      portfolio: website,
      summary,
    },
    skills: skills.map((s) => ({ name: s, level: 80, category: 'Skill', color: '#2563eb' })) as CVData['skills'],
    experience,
    education,
    projects,
    selectedSkills: skills,
  }

  return {
    data,
    found: {
      name: Boolean(name),
      email: Boolean(email),
      phone: Boolean(phone),
      summary: Boolean(summary),
      jobs: experience.length,
      schools: education.length,
      skills: skills.length,
      projects: projects.length,
    },
  }
}

/**
 * Text out of a PDF, in reading order, in the browser.
 *
 * pdf.js is loaded only here, on demand, it is most of a megabyte, and
 * nobody who types their CV in should download it.
 */
export async function pdfToText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
  const doc = await task.promise
  let out = ''
  for (let p = 1; p <= Math.min(doc.numPages, 10); p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    let line = ''
    let lastY: number | null = null
    let lastEnd = 0
    for (const item of content.items) {
      if (!('str' in item)) continue
      const x = item.transform[4]
      const y = item.transform[5]
      if (lastY !== null && Math.abs(y - lastY) > 2.5) {
        out += `${line.trim()}\n`
        line = ''
      } else if (line && x - lastEnd > 1.5 && !line.endsWith(' ') && !item.str.startsWith(' ')) {
        line += ' '
      }
      line += item.str
      lastY = y
      lastEnd = x + item.width
      if (item.hasEOL) {
        out += `${line.trim()}\n`
        line = ''
        lastY = null
      }
    }
    if (line.trim()) out += `${line.trim()}\n`
    out += '\n'
  }
  await task.destroy()
  return out
}
