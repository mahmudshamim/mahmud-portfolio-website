import type { CVData } from '@/app/cv/page'

export type StepId =
  | 'personal'
  | 'contact'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'summary'

export type Task = {
  id: string
  /** Which accordion section to open when someone acts on this. */
  section: StepId
  label: string
  /** Why it matters, in one line. Shown under the label. */
  why: string
  done: boolean
  /** Required tasks gate the progress bar; the rest are advice. */
  required: boolean
}

const words = (v?: string) => (v || '').trim().split(/\s+/).filter(Boolean).length

/**
 * The single source of "what should I do next".
 *
 * Progress, the toolbar hint and the checklist all read from this, so they can
 * never disagree — the old progress bar measured which wizard step was open,
 * and reported 14% on a finished CV.
 */
export function buildTasks(cv: CVData): Task[] {
  const p = cv.personal
  const skills = cv.skills.filter((s) => (s as { included?: boolean }).included !== false)
  const summaryWords = words(p.summary)
  const hasBullets = cv.experience.some((e) => (e.desc || '').includes('\n') || words(e.desc) > 12)

  return [
    { id: 'name', section: 'personal', label: 'Add your name', why: 'It is the first thing a recruiter looks for.', done: Boolean(p.name?.trim()), required: true },
    { id: 'role', section: 'personal', label: 'Add the job title you want', why: 'Match it to the role you are applying for, not the one you have.', done: Boolean(p.role?.trim()), required: true },
    { id: 'email', section: 'contact', label: 'Add an email address', why: 'Without it nobody can reply to you.', done: Boolean(p.email?.trim()), required: true },
    { id: 'phone', section: 'contact', label: 'Add a phone number', why: 'Recruiters often call before they email.', done: Boolean(p.phone?.trim()), required: false },
    { id: 'experience', section: 'experience', label: 'Add a job', why: 'Most of a CV is what you did and what changed because of it.', done: cv.experience.length > 0, required: true },
    {
      id: 'bullets',
      section: 'experience',
      label: 'Describe a job in more than one line',
      why: 'One line per role reads as a job list. Say what you built and what it changed.',
      done: hasBullets,
      required: false,
    },
    { id: 'skills', section: 'skills', label: 'Add at least three skills', why: 'Screening software matches these against the posting.', done: skills.length >= 3, required: true },
    { id: 'education', section: 'education', label: 'Add education or training', why: 'A bootcamp or course counts.', done: cv.education.length > 0, required: false },
    {
      id: 'summary',
      section: 'summary',
      label: 'Write a short summary',
      why: 'Three or four lines: who you are, what you build, what you are after.',
      done: summaryWords >= 20,
      required: true,
    },
    {
      id: 'projects',
      section: 'projects',
      label: 'Add a project',
      why: 'Proof beats claims, especially early in a career.',
      done: cv.projects.length > 0,
      required: false,
    },
  ]
}

export function progressOf(tasks: Task[]) {
  const required = tasks.filter((t) => t.required)
  const done = required.filter((t) => t.done).length
  return Math.round((done / Math.max(1, required.length)) * 100)
}

/** The one thing worth doing next, required work first. */
export function nextTask(tasks: Task[]) {
  return tasks.find((t) => t.required && !t.done) ?? tasks.find((t) => !t.done) ?? null
}
