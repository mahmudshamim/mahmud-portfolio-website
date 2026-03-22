'use client'

import { useState } from 'react'
import { portfolioData } from '@/data/portfolio'

const EXAMPLE_JDS = {
  'Frontend Dev JD': `We are looking for a Frontend Developer with 2+ years of experience in React and Next.js. Must have strong TypeScript skills and experience with Tailwind CSS. Knowledge of Framer Motion and animation libraries is a big plus. Experience with REST APIs and Git is required. Bonus: Figma design handoff experience.`,
  'Full-Stack Dev JD': `Full-Stack Developer needed with expertise in Node.js, React, PostgreSQL and Supabase. Must be comfortable with TypeScript, REST APIs, and cloud deployment on Vercel or AWS. Three or more years of experience required. Nice to have: OpenAI API integration experience and GraphQL knowledge.`,
  'UI/UX Designer JD': `UI/UX Designer with strong Figma skills required. Must have portfolio showing wireframing, prototyping, and high-fidelity UI design. Experience with design systems a plus. Some frontend knowledge preferred. Graphic Design background is welcome.`,
}

const SOFT_SKILLS = ['communication','teamwork','leadership','problem solving','critical thinking','adaptability','collaboration','time management','detail-oriented','analytical','proactive']
const EXPERIENCE_KW = ['years','experience','senior','junior','lead','developer','engineer','specialist','full-stack','frontend','backend','remote']

function buildCVText(cvData: any) {
  const parts: string[] = []

  parts.push(cvData?.personal?.name || portfolioData.personal.name)
  parts.push(cvData?.personal?.role || portfolioData.personal.role)
  parts.push(cvData?.personal?.summary || portfolioData.personal.summary)

  const skills = cvData?.skills || portfolioData.skills
  skills.forEach((s: any) => {
    parts.push(s.name)
    parts.push(s.name)
    parts.push(s.name)
    parts.push(s.category)
  })

  const aliases: Record<string, string[]> = {
    'react':        ['react', 'react.js', 'reactjs'],
    'next.js':      ['next.js', 'nextjs', 'next js'],
    'node.js':      ['node.js', 'nodejs', 'node js'],
    'mongodb':      ['mongodb', 'mongo'],
    'javascript':   ['javascript', 'js', 'es6'],
    'typescript':   ['typescript', 'ts'],
    'tailwind css': ['tailwind css', 'tailwind', 'tailwindcss'],
    'ui design':    ['ui design', 'ui/ux', 'user interface'],
    'ux design':    ['ux design', 'ui/ux', 'user experience'],
    'figma':        ['figma', 'design tool'],
    'express':      ['express', 'express.js', 'expressjs'],
    'react.js':     ['react', 'react.js', 'reactjs'],
  }
  skills.forEach((s: any) => {
    const key = s.name.toLowerCase()
    if (aliases[key]) aliases[key].forEach(alias => parts.push(alias))
  })

  const exp = cvData?.experience || portfolioData.experience
  exp.forEach((e: any) => {
    parts.push(e.role || '')
    parts.push(e.company || '')
    parts.push(e.desc || '')
    parts.push(e.date || '')
  })

  const projects = cvData?.projects || portfolioData.projects
  projects.forEach((p: any) => {
    parts.push(p.name || '')
    parts.push(p.fullDesc || p.shortDesc || '')
    ;(p.tech || []).forEach((t: string) => { parts.push(t); parts.push(t) })
  })

  const edu = cvData?.education || portfolioData.education
  edu.forEach((e: any) => {
    parts.push(e.degree || '')
    parts.push(e.school || '')
  })

  parts.push('full-stack full stack developer web developer')
  parts.push('react next.js node.js mongodb javascript typescript')
  parts.push('ui ux design figma responsive web development')
  parts.push('git github api rest restful')
  parts.push('khulna technologies programming hero bootcamp')

  return parts.join(' ').toLowerCase()
}

function scoreColor(s: number) {
  return s >= 80 ? '#34d399' : s >= 60 ? '#f59e0b' : '#ff2d78'
}
function scoreLabel(s: number) {
  return s >= 80 ? 'Strong Match' : s >= 60 ? 'Good Match' : s >= 40 ? 'Partial Match' : 'Low Match'
}
function scoreSub(s: number) {
  if (s >= 80) return 'Excellent match! You should definitely apply for this position.'
  if (s >= 60) return 'Good match. Adding some keywords will improve your score.'
  return 'Your CV should be tailored more specifically for this JD.'
}

function ScoreRing({ score }: { score: number }) {
  const R = 40
  const circ = 2 * Math.PI * R
  const offset = circ - (score / 100) * circ
  const color = scoreColor(score)
  return (
    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
      <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="50" cy="50" r={R} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color }}>{score}%</div>
      </div>
    </div>
  )
}

export default function ATSChecker({ cvData }: { cvData: any }) {
  const [jd, setJd] = useState('')
  const [step, setStep] = useState<'input' | 'analyzing' | 'result'>('input')
  const [result, setResult] = useState<any>(null)

  const wordCount = jd.trim().split(/\s+/).filter(Boolean).length
  const canAnalyze = wordCount >= 30

  const handleAnalyze = () => {
    if (!canAnalyze) return
    setStep('analyzing')

    setTimeout(() => {
      const cvText = buildCVText(cvData)
      const jdLower = jd.toLowerCase()
      const allSkills = cvData?.skills || portfolioData.skills

      // Skills match — fuzzy check both ways
      const matchedSkills = allSkills.filter((s: any) => {
        const skillLower = s.name.toLowerCase()
        return jdLower.includes(skillLower) ||
          jdLower.includes(skillLower.replace('.js', '')) ||
          jdLower.includes(skillLower.replace(' ', '.')) ||
          jdLower.includes(skillLower.replace(' css', ''))
      }).map((s: any) => s.name)

      const jdWords = jdLower.match(/\b[a-z][a-z.+#]{2,}\b/g) || []
      const techWords = jdWords.filter(w =>
        ['react','next','node','mongodb','javascript','typescript',
         'python','java','angular','vue','docker','aws','gcp','sql',
         'postgresql','mysql','redis','graphql','figma','tailwind',
         'express','nestjs','laravel','php','swift','kotlin'
        ].includes(w)
      )
      const missingFromJD = techWords.filter(w => !cvText.includes(w)).slice(0, 6)
      const jdTechTotal = Array.from(new Set(techWords)).length

      const skillPct = jdTechTotal > 0
        ? Math.min(97, Math.max(30, Math.round((matchedSkills.length / jdTechTotal) * 100) + 10))
        : 75

      const missingSkills = missingFromJD.map(w => w.charAt(0).toUpperCase() + w.slice(1))

      // Role match
      const cvRole = (cvData?.personal?.role || portfolioData.personal.role).toLowerCase()
      const roleWords = cvRole.split(/\s+/).filter((w: string) => w.length > 3)
      const roleMatched = roleWords.filter((w: string) => jdLower.includes(w))
      const rolePct = Math.min(95, Math.round((roleMatched.length / Math.max(roleWords.length, 1)) * 100) + 25)

      // Experience match
      const expMatched = EXPERIENCE_KW.filter(kw => jdLower.includes(kw) && cvText.includes(kw))
      const expTotal = EXPERIENCE_KW.filter(kw => jdLower.includes(kw))
      const expPct = expTotal.length > 0
        ? Math.min(95, Math.round((expMatched.length / expTotal.length) * 100) + 30)
        : 70

      // Soft skills
      const softMatched = SOFT_SKILLS.filter(kw => jdLower.includes(kw) && cvText.includes(kw))
      const softTotal = SOFT_SKILLS.filter(kw => jdLower.includes(kw))
      const softPct = softTotal.length > 0
        ? Math.min(90, Math.round((softMatched.length / softTotal.length) * 100) + 15)
        : 65

      const total = Math.min(97, Math.max(20, Math.round(
        skillPct * 0.40 + rolePct * 0.25 + expPct * 0.20 + softPct * 0.15
      )))

      // Suggestions
      const suggestions: string[] = []
      if (total >= 80) suggestions.push('Add metrics to your Experience section — e.g. "improved load time by 40%", "handled 10k+ users"')
      if (skillPct < 60) suggestions.push(`Mention missing skills in your projects: ${missingSkills.slice(0, 3).join(', ')}`)
      if (rolePct < 60) suggestions.push('Align your CV role/title more closely with the JD.')
      if (softPct < 50 && softTotal.length > 0) suggestions.push(`Add identified soft skills to your summary: ${softTotal.slice(0, 3).join(', ')}`)
      suggestions.push('Rewrite your CV summary paragraph specifically for this job.')

      setResult({ total, skillPct, rolePct, expPct, softPct, matchedSkills, missingSkills, suggestions })
      setStep('result')
    }, 1000)
  }

  const handleReset = () => {
    setJd('')
    setResult(null)
    setStep('input')
  }

  const steps = [
    { label: 'Paste JD' },
    { label: 'Analyze' },
    { label: 'Results' },
  ]
  const stepIndex = step === 'input' ? 0 : step === 'analyzing' ? 1 : 2

  return (
    <div style={{ padding: 28, fontFamily: 'var(--font-dm-sans)', color: '#e2e2f0', minHeight: '100%' }}>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 14px', borderRadius: 20, fontSize: 12,
              fontWeight: 600, transition: 'all .2s', whiteSpace: 'nowrap',
              background: i < stepIndex ? 'rgba(52,211,153,0.15)' : i === stepIndex ? 'rgba(79,142,247,0.2)' : 'transparent',
              border: i === stepIndex ? '1px solid rgba(79,142,247,0.4)' : '1px solid transparent',
              color: i < stepIndex ? '#34d399' : i === stepIndex ? '#4f8ef7' : 'rgba(255,255,255,0.25)',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, flexShrink: 0,
                background: i < stepIndex ? '#34d399' : i === stepIndex ? '#4f8ef7' : 'rgba(255,255,255,0.08)',
                color: i <= stepIndex ? '#fff' : 'rgba(255,255,255,0.3)',
              }}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1, background: i < stepIndex ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.06)', margin: '0 4px', minWidth: 8 }} />
            )}
          </div>
        ))}
      </div>

      {/* INPUT STATE */}
      {step === 'input' && (
        <div>
          <div style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
              JOB DESCRIPTION
            </div>
            <textarea
              value={jd}
              onChange={e => setJd(e.target.value)}
              placeholder={`Paste Job Description here...
              
Copy the full description from the job posting and paste it here.`}
              style={{
                width: '100%', height: 160,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: 14,
                color: '#e2e2f0', fontSize: 13,
                resize: 'vertical', outline: 'none',
                fontFamily: 'var(--font-dm-sans)', lineHeight: 1.6,
                boxSizing: 'border-box', transition: 'border-color .15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#4f8ef7')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
            />
            <div style={{ fontSize: 11, marginTop: 8, color: canAnalyze ? 'rgba(52,211,153,0.7)' : 'rgba(255,255,255,0.25)' }}>
              {wordCount} words
              {!canAnalyze && wordCount > 0 && ` — ${30 - wordCount} more words needed`}
              {canAnalyze && ' — Ready to analyze!'}
            </div>
          </div>

          {/* Example JDs */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.07em', color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>
              Or try an example →
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.keys(EXAMPLE_JDS).map(key => (
                <button
                  key={key}
                  onClick={() => setJd(EXAMPLE_JDS[key as keyof typeof EXAMPLE_JDS])}
                  style={{
                    padding: '5px 14px', borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent', color: 'rgba(255,255,255,0.45)',
                    fontSize: 12, cursor: 'pointer', transition: 'all .15s',
                    fontFamily: 'var(--font-dm-sans)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(79,142,247,0.5)'
                    e.currentTarget.style.color = '#4f8ef7'
                    e.currentTarget.style.background = 'rgba(79,142,247,0.08)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            style={{
              width: '100%', padding: 14,
              background: canAnalyze ? '#4f8ef7' : 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: 10,
              color: canAnalyze ? '#fff' : 'rgba(255,255,255,0.2)',
              fontSize: 14, fontWeight: 600,
              cursor: canAnalyze ? 'pointer' : 'not-allowed',
              transition: 'all .2s', letterSpacing: '.02em',
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            {canAnalyze ? 'Analyze Match →' : `${Math.max(0, 30 - wordCount)} more words needed`}
          </button>
        </div>
      )}

      {/* ANALYZING STATE */}
      {step === 'analyzing' && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚡</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#4f8ef7', marginBottom: 8 }}>
            Analyzing your CV...
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Matching keywords and calculating your match score...
          </div>
        </div>
      )}

      {/* RESULT STATE */}
      {step === 'result' && result && (
        <div>
          {/* Score ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, background: '#0d0d18', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <ScoreRing score={result.total} />
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: scoreColor(result.total), marginBottom: 4 }}>
                {scoreLabel(result.total)}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                {scoreSub(result.total)}
              </div>
            </div>
          </div>

          {/* Breakdown 2x2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Technical Skills', pct: result.skillPct },
              { label: 'Role Match',       pct: result.rolePct },
              { label: 'Experience',       pct: result.expPct },
              { label: 'Soft Skills',      pct: result.softPct },
            ].map(cat => (
              <div key={cat.label} style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{cat.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: scoreColor(cat.pct), marginBottom: 6 }}>{cat.pct}%</div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${cat.pct}%`, background: scoreColor(cat.pct), borderRadius: 2, transition: 'width .8s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Matched skills */}
          {result.matchedSkills.length > 0 && (
            <div style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.07em', color: '#34d399', marginBottom: 10 }}>✓ MATCHED SKILLS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {result.matchedSkills.map((s: string) => (
                  <span key={s} style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', fontSize: 11 }}>✓ {s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Missing skills */}
          {result.missingSkills.length > 0 && (
            <div style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.07em', color: '#ff2d78', marginBottom: 10 }}>✗ SKILLS TO ADD</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {result.missingSkills.map((s: string) => (
                  <span key={s} style={{ padding: '3px 10px', borderRadius: 20, background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.25)', color: '#ff2d78', fontSize: 11 }}>+ {s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div style={{ background: '#0d0d18', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.07em', color: '#f59e0b', marginBottom: 10 }}>→ SUGGESTIONS</div>
            {result.suggestions.map((s: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, padding: '10px 12px' }}>
                <span style={{ color: '#f59e0b', flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleReset}
            style={{ width: '100%', padding: 12, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', transition: 'all .15s', fontFamily: 'var(--font-dm-sans)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >
            ← Check another Job Description
          </button>
        </div>
      )}
    </div>
  )
}
