'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CVData } from '@/app/cv/page'
import type { CVDoc } from '@/hooks/useCVDocs'
import { useIsMobile } from '@/hooks/useIsMobile'
import MahmudLogo from '@/components/MahmudLogo'
import CVPreview from '../CVPreview'
import { buildTasks, progressOf, type Task } from '../NextSteps'
import { ROLE_PRESETS, applyVersion, createVersion, keywordsFor, tailor, type RoleVersion } from './model'
import { SECTIONS, SectionEditor, sectionStatus, type EditCtx, type SectionId, type Status } from './sections'
import { DesignPanel, JobMatchPanel, MiniCV, templateLabel } from './design'
import { Badge, Button, Chip, Eyebrow, Icon, IconButton, Segmented, Sheet, TextField, c, font, radius, shadow, useConfirm, useToast, type IconName } from './ui'

export type StudioApi = {
  hydrated: boolean
  docs: CVDoc[]
  activeId: string
  active: CVDoc | null
  activeVersion: RoleVersion | null
  setActiveData: (update: CVData | ((prev: CVData) => CVData)) => void
  select: (id: string) => void
  create: (preset?: 'blank' | 'sample') => string
  rename: (id: string, name: string) => void
  remove: (id: string) => void
  replaceActive: (data: CVData, name?: string, versions?: RoleVersion[]) => void
  selectVersion: (id: string) => void
  addVersion: (v: RoleVersion) => void
  updateVersion: (id: string, patch: Partial<RoleVersion> | ((v: RoleVersion) => Partial<RoleVersion>)) => void
  removeVersion: (id: string) => void
}

type Tab = 'edit' | 'design' | 'preview' | 'match'

const TASK_SECTION: Record<string, SectionId> = {
  personal: 'about',
  contact: 'contact',
  summary: 'summary',
  experience: 'work',
  education: 'education',
  skills: 'skills',
  projects: 'projects',
}

/** "Md. Abdulla Al Mahmud" → "Abdulla". Honorific prefixes are not what
 *  anyone is called. */
const firstName = (name: string) =>
  name.split(/\s+/).find((t) => t.length > 1 && !/^(md|mst|mr|mrs|ms|dr|mohammad|muhammad|mohammed|mohd)\.?$/i.test(t)) ?? ''

/**
 * The CV studio.
 *
 * Phone: an app — sections list, a style chooser, a preview and a job
 * matcher behind a floating tab bar, and a role switcher at the top of the
 * home screen. Desktop: the same pieces side by side — content on the left,
 * the live CV in the middle, design on the right.
 */
export default function Studio({
  api,
  blank,
  sample,
  onExport,
  onImport,
}: {
  api: StudioApi
  blank: () => CVData
  sample: () => CVData
  onExport: () => void
  onImport: (file: File) => void
}) {
  const compact = useIsMobile(1180)
  const { toast, toastNode } = useToast()
  const { confirm, confirmNode } = useConfirm()
  const [tab, setTab] = useState<Tab>('edit')
  const [section, setSection] = useState<SectionId | null>(null)
  const [side, setSide] = useState<'design' | 'match'>('design')
  const [sheet, setSheet] = useState<null | 'roles' | 'newRole' | 'more' | 'download'>(null)
  const [download, setDownload] = useState<() => void>(() => () => {})
  const [started, setStarted] = useState(true)
  const restoreInput = useRef<HTMLInputElement>(null)
  const leftCol = useRef<HTMLDivElement>(null)

  const profile = api.active?.data ?? blank()
  const version = api.activeVersion
  const cv = useMemo(() => applyVersion(profile, version), [profile, version])
  const role = version?.role ?? ''
  const tasks = useMemo(() => buildTasks(cv), [cv])
  const progress = progressOf(tasks)
  const missing = tasks.filter((t) => t.required && !t.done)

  /* Re-pick skills and projects when the role is committed — on blur or a
     chip tap — not on every keystroke. */
  const committedRole = useRef(role)
  useEffect(() => {
    committedRole.current = version?.role ?? ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version?.id])

  const setRole = (r: string) => version && api.updateVersion(version.id, { role: r })

  const commitRole = (next?: string) => {
    if (!version) return
    const r = (next ?? role).trim()
    if (r === committedRole.current) return
    committedRole.current = r
    const hidden = tailor(profile, keywordsFor(r))
    api.updateVersion(version.id, { role: r, hidden })
    if (r) toast(`Re-picked for ${r}: ${profile.skills.length - hidden.skills.length} skills, ${profile.projects.length - hidden.projects.length} projects`)
  }

  const setHidden = (kind: 'skills' | 'projects' | 'experience', key: string, hide: boolean) =>
    version &&
    api.updateVersion(version.id, (v) => ({
      hidden: {
        ...v.hidden,
        [kind]: hide ? Array.from(new Set([...v.hidden[kind], key])) : v.hidden[kind].filter((k) => k !== key),
      },
    }))

  const makeVersion = (title: string, keywords?: string[]) => {
    const v = createVersion(profile, title, version?.template ?? 'profile-split', keywords)
    api.addVersion(v)
    toast(`New CV for ${title}: ${profile.skills.length - v.hidden.skills.length} skills, ${profile.projects.length - v.hidden.projects.length} projects picked`)
  }

  const switchVersion = (v: RoleVersion) => {
    if (v.id === version?.id) return
    api.selectVersion(v.id)
    toast(`Showing your ${v.role || 'untitled'} CV`)
  }

  const openSection = (id: SectionId | null) => {
    setSection(id)
    setTab('edit')
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0 })
      leftCol.current?.scrollTo({ top: 0 })
    })
  }

  const openTab = (t: Tab) => {
    setTab(t)
    if (t !== 'edit') setSection(null)
    requestAnimationFrame(() => window.scrollTo({ top: 0 }))
  }

  const fixTask = (t: Task) => {
    setSheet(null)
    openSection(TASK_SECTION[t.section] ?? 'about')
  }

  const runDownload = () => {
    setSheet(null)
    /* Let the sheet unmount first so the print dialog opens over the page. */
    setTimeout(() => download(), 60)
  }

  /* First visit: a blank CV and no decision made yet. */
  const isEmpty =
    !profile.personal.name && !profile.experience.length && !profile.skills.length && !profile.projects.length && !profile.education.length
  useEffect(() => {
    try {
      setStarted(Boolean(window.localStorage.getItem('cv-studio-started')))
    } catch {
      setStarted(true)
    }
  }, [])
  const markStarted = () => {
    try {
      window.localStorage.setItem('cv-studio-started', '1')
    } catch {}
    setStarted(true)
  }

  const restoreField = (
    <input
      ref={restoreInput}
      type="file"
      accept="application/json,.json"
      hidden
      onChange={(e) => {
        const f = e.target.files?.[0]
        e.target.value = ''
        if (!f) return
        onImport(f)
        markStarted()
        setSheet(null)
        toast('Backup restored')
      }}
    />
  )

  if (!api.hydrated) {
    return <div style={{ minHeight: '100vh', background: c.canvas }} />
  }

  if (!started && isEmpty) {
    return (
      <StartScreen
        sample={sample}
        onScratch={() => {
          markStarted()
          setSection('about')
        }}
        onExample={() => {
          api.create('sample')
          markStarted()
        }}
        onRestore={() => restoreInput.current?.click()}
        restoreInput={restoreField}
      />
    )
  }

  if (!version) return <div style={{ minHeight: '100vh', background: c.canvas }} />

  const ctx: EditCtx = {
    profile,
    setProfile: (fn) => api.setActiveData(fn),
    cv,
    version,
    role,
    setRole,
    commitRole,
    setHidden,
    updateVersion: (patch) => api.updateVersion(version.id, patch),
    toast,
    confirm,
  }

  const preview = <CVPreview cvData={cv} selectedTemplate={version.template} registerDownload={(run) => setDownload(() => run)} />

  const editHome = (
    <div style={{ display: 'grid', gap: 20, minWidth: 0 }}>
      <RoleBar
        versions={api.active?.versions ?? []}
        activeId={version.id}
        onPick={switchVersion}
        onAdd={() => setSheet('newRole')}
        onManage={() => setSheet('roles')}
      />
      <HeroCard
        cv={cv}
        version={version}
        progress={progress}
        withThumb={compact}
        onPreview={() => openTab('preview')}
        onDownload={() => setSheet('download')}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '2px 2px 12px' }}>
          <h2 style={{ margin: 0, fontFamily: font, fontSize: 19, fontWeight: 750, letterSpacing: '-.01em', color: c.ink }}>Sections</h2>
          <span style={{ fontFamily: font, fontSize: 13, color: c.muted }}>Tap one to edit</span>
        </div>
        <SectionList profile={profile} version={version} onOpen={openSection} />
      </div>
    </div>
  )

  const sectionIndex = section ? SECTIONS.findIndex((s) => s.id === section) : -1
  const nextSection = sectionIndex >= 0 ? SECTIONS[sectionIndex + 1] : undefined
  const sectionPage = section && (
    <SectionPage
      key={section}
      id={section}
      index={sectionIndex}
      ctx={ctx}
      sticky={compact}
      onBack={() => openSection(null)}
      footer={
        compact ? null : (
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <Button icon="left" onClick={() => openSection(null)}>
              All sections
            </Button>
            <span style={{ flex: 1 }} />
            {nextSection ? (
              <Button variant="dark" onClick={() => openSection(nextSection.id)}>
                Next: {nextSection.title}
              </Button>
            ) : (
              <Button variant="primary" icon="check" onClick={() => openSection(null)}>
                Done
              </Button>
            )}
          </div>
        )
      }
    />
  )

  const sheets = (
    <>
      <DownloadSheet open={sheet === 'download'} onClose={() => setSheet(null)} missing={missing} role={role} onFix={fixTask} onDownload={runDownload} />
      <RolesSheet
        open={sheet === 'roles'}
        onClose={() => setSheet(null)}
        versions={api.active?.versions ?? []}
        activeId={version.id}
        onPick={(v) => {
          switchVersion(v)
          setSheet(null)
        }}
        onAdd={() => setSheet('newRole')}
        onRemove={async (v) => {
          const ok = await confirm({
            title: `Delete the ${v.role || 'untitled'} CV?`,
            body: 'Only this version goes. Your jobs, skills and projects stay in the others.',
            confirmLabel: 'Delete',
          })
          if (ok) api.removeVersion(v.id)
        }}
      />
      <NewRoleSheet
        open={sheet === 'newRole'}
        onClose={() => setSheet(null)}
        taken={(api.active?.versions ?? []).map((v) => v.role)}
        onCreate={(title) => {
          makeVersion(title)
          setSheet(null)
        }}
      />
      <MoreSheet
        open={sheet === 'more'}
        onClose={() => setSheet(null)}
        docs={api.docs}
        activeId={api.activeId}
        onSelect={(id) => {
          api.select(id)
          setSheet(null)
          openSection(null)
        }}
        onNew={() => {
          api.create('blank')
          setSheet(null)
          openSection('about')
        }}
        onExample={() => {
          api.create('sample')
          setSheet(null)
          openSection(null)
          toast('Opened an example CV')
        }}
        onBackup={() => {
          onExport()
          toast('Backup downloaded')
        }}
        onRestore={() => restoreInput.current?.click()}
        onStartOver={async () => {
          setSheet(null)
          const ok = await confirm({
            title: 'Start over?',
            body: 'This clears everything in this CV. It cannot be undone — download a backup first if you might want it.',
            confirmLabel: 'Clear it',
          })
          if (!ok) return
          api.replaceActive(blank(), 'My CV')
          openSection('about')
          toast('Started a fresh CV')
        }}
      />
      {restoreField}
      {confirmNode}
      {toastNode}
    </>
  )

  /* ── Phone and tablet ─────────────────────────────────────────────── */
  if (compact) {
    const fname = firstName(profile.personal.name)
    return (
      <div className="native-cursor studio" style={{ minHeight: '100dvh', background: c.canvas, fontFamily: font }}>
        <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 16px', paddingBottom: 'calc(128px + env(safe-area-inset-bottom))' }}>
          {tab === 'edit' && !section && (
            <>
              <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0 4px' }}>
                <a href="/" aria-label="Back to portfolio" style={{ display: 'flex', textDecoration: 'none' }}>
                  <MahmudLogo size="sm" />
                </a>
                <span style={{ flex: 1 }} />
                <IconButton icon="dots" label="More: your CVs, backup, start over" onClick={() => setSheet('more')} />
              </header>
              <div style={{ margin: '14px 2px 20px' }}>
                <div style={{ fontFamily: font, fontSize: 15, color: c.muted }}>{fname ? `Hi ${fname} 👋` : 'Welcome 👋'}</div>
                <h1 style={{ margin: '4px 0 0', fontFamily: font, fontSize: 31, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-.025em', color: c.ink }}>Build your CV</h1>
              </div>
              {editHome}
            </>
          )}

          {tab === 'edit' && section && sectionPage}

          {tab === 'design' && (
            <>
              <TabHeader title="Design" sub="Tap a style — your CV changes instantly." action={<IconButton icon="eye" label="Preview" onClick={() => openTab('preview')} />} />
              <button
                onClick={() => openTab('preview')}
                aria-label="Open full preview"
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: '100%',
                  padding: '26px 0',
                  marginBottom: 16,
                  border: 'none',
                  borderRadius: radius.xl,
                  background: `radial-gradient(120% 90% at 50% 0%, #ffffff 0%, ${c.brandSoft} 70%)`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 18px 40px rgba(41,31,120,.22)' }}>
                  <MiniCV cv={cv} template={version.template} width={210} />
                </div>
              </button>
              <section style={{ background: c.surface, border: `1px solid ${c.line}`, borderRadius: radius.lg, padding: 18, boxShadow: shadow.card }}>
                <DesignPanel cv={cv} profile={profile} setProfile={ctx.setProfile} version={version} updateVersion={ctx.updateVersion} layout="carousel" />
              </section>
            </>
          )}

          {tab === 'match' && (
            <>
              <TabHeader title="Job match" sub="Check this CV against a real job advert." />
              <section style={{ background: c.surface, border: `1px solid ${c.line}`, borderRadius: radius.lg, padding: 18, boxShadow: shadow.card }}>
                <JobMatchPanel cv={cv} onTailor={(t, kw) => { makeVersion(t, kw); openTab('edit') }} />
              </section>
            </>
          )}

          {/* Always mounted: Download prints from this node, whichever tab is open. */}
          <div style={{ display: tab === 'preview' ? 'block' : 'none' }}>
            <TabHeader
              title="Preview"
              sub={`${role || 'Untitled'} · ${templateLabel(version.template)} template`}
              action={
                <Button size="sm" variant="primary" icon="download" onClick={() => setSheet('download')}>
                  PDF
                </Button>
              }
            />
            {preview}
            <p style={{ margin: '14px 4px 0', fontFamily: font, fontSize: 13, color: c.muted, textAlign: 'center', lineHeight: 1.5 }}>
              Pinch to zoom. A dashed line marks where a new page starts.
            </p>
          </div>
        </div>

        {tab === 'edit' && section ? (
          <div
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 60,
              padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
              background: 'rgba(255,255,255,.94)',
              backdropFilter: 'blur(12px)',
              borderTop: `1px solid ${c.line}`,
            }}
          >
            <div style={{ maxWidth: 620, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.5fr)', gap: 10 }}>
              <Button variant="muted" icon="eye" onClick={() => openTab('preview')}>
                Preview
              </Button>
              {nextSection ? (
                <Button variant="dark" onClick={() => openSection(nextSection.id)}>
                  Next: {nextSection.title}
                </Button>
              ) : (
                <Button variant="primary" icon="check" onClick={() => openSection(null)}>
                  Done
                </Button>
              )}
            </div>
          </div>
        ) : (
          <BottomNav tab={tab} onTab={openTab} onDownload={() => setSheet('download')} />
        )}

        {sheets}
      </div>
    )
  }

  /* ── Desktop: content | live CV | design ──────────────────────────── */
  return (
    <div className="native-cursor studio" style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: c.canvas, fontFamily: font }}>
      <header style={{ height: 68, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px', background: c.surface, borderBottom: `1px solid ${c.line}` }}>
        <a href="/" aria-label="Back to portfolio" style={{ display: 'flex', textDecoration: 'none' }}>
          <MahmudLogo size="sm" />
        </a>
        <span style={{ width: 1, height: 26, background: c.line }} />
        <button
          onClick={() => setSheet('more')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, padding: '8px 12px', borderRadius: radius.pill, border: 'none', background: 'transparent', cursor: 'pointer' }}
        >
          <span style={{ fontFamily: font, fontSize: 15, fontWeight: 700, color: c.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>
            {profile.personal.name ? `${profile.personal.name}’s CV` : api.active?.name || 'My CV'}
          </span>
          <Icon name="down" size={16} style={{ color: c.muted }} />
        </button>
        <span style={{ flex: 1 }} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: font, fontSize: 13, color: c.muted }}>
          <Icon name="shield" size={16} /> Saved on this device
        </span>
        <IconButton icon="dots" label="More: your CVs, backup, start over" onClick={() => setSheet('more')} />
        <Button variant="primary" icon="download" onClick={() => setSheet('download')}>
          Download PDF
        </Button>
      </header>

      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: 'clamp(340px, 27vw, 420px) minmax(0, 1fr) clamp(300px, 24vw, 370px)' }}>
        <aside ref={leftCol} style={{ minWidth: 0, overflowY: 'auto', padding: '22px 20px 48px', borderRight: `1px solid ${c.line}` }}>
          {section ? sectionPage : editHome}
        </aside>

        <main style={{ minWidth: 0, overflowY: 'auto', padding: '20px clamp(20px, 3vw, 44px) 56px', background: '#e9e7f1' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: font, fontSize: 13, fontWeight: 650, color: c.body }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.good, boxShadow: `0 0 0 4px ${c.good}22` }} />
                Live preview
              </span>
              <span style={{ fontFamily: font, fontSize: 13, color: c.muted }}>
                {role || 'Untitled'} · {templateLabel(version.template)} template
              </span>
            </div>
            {preview}
          </div>
        </main>

        <aside style={{ minWidth: 0, overflowY: 'auto', padding: '22px 20px 48px', borderLeft: `1px solid ${c.line}`, background: c.surface }}>
          <Segmented
            full
            value={side}
            options={[
              { v: 'design', l: 'Design' },
              { v: 'match', l: 'Job match' },
            ]}
            onChange={setSide}
          />
          <div style={{ marginTop: 22 }}>
            {side === 'design' ? (
              <DesignPanel cv={cv} profile={profile} setProfile={ctx.setProfile} version={version} updateVersion={ctx.updateVersion} layout="grid" />
            ) : (
              <JobMatchPanel cv={cv} onTailor={(t, kw) => makeVersion(t, kw)} />
            )}
          </div>
        </aside>
      </div>

      {sheets}
    </div>
  )
}

/* ── Pieces ───────────────────────────────────────────────────────────── */

function TabHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 2px 16px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ margin: 0, fontFamily: font, fontSize: 28, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-.025em', color: c.ink }}>{title}</h1>
        {sub && <p style={{ margin: '5px 0 0', fontFamily: font, fontSize: 14, color: c.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</p>}
      </div>
      {action}
    </header>
  )
}

function RoleBar({
  versions,
  activeId,
  onPick,
  onAdd,
  onManage,
}: {
  versions: RoleVersion[]
  activeId: string
  onPick: (v: RoleVersion) => void
  onAdd: () => void
  onManage: () => void
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 2px 10px' }}>
        <Eyebrow>CV for which job?</Eyebrow>
        <button onClick={onManage} style={{ fontFamily: font, fontSize: 13, fontWeight: 650, color: c.brandInk, background: 'none', border: 'none', padding: '4px 2px', cursor: 'pointer' }}>
          Manage
        </button>
      </div>
      <div className="studio-scroll-row" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px', margin: '0 -2px', scrollbarWidth: 'none' }}>
        {versions.map((v) => (
          <Chip key={v.id} tone="dark" active={v.id === activeId} icon={v.id === activeId ? 'check' : undefined} onClick={() => onPick(v)}>
            {v.role || 'Pick a job'}
          </Chip>
        ))}
        <Chip dashed icon="plus" onClick={onAdd}>
          Another job
        </Chip>
      </div>
      {versions.length === 1 && (
        <p style={{ margin: '10px 2px 0', fontFamily: font, fontSize: 13, lineHeight: 1.5, color: c.muted }}>
          Applying for different jobs? Add one — your skills and projects re-pick themselves for it.
        </p>
      )}
    </div>
  )
}

function HeroCard({
  cv,
  version,
  progress,
  withThumb,
  onPreview,
  onDownload,
}: {
  cv: CVData
  version: RoleVersion
  progress: number
  withThumb: boolean
  onPreview: () => void
  onDownload: () => void
}) {
  const ready = progress === 100
  const stats = [
    { n: cv.experience.length, l: 'Jobs' },
    { n: cv.skills.length, l: 'Skills' },
    { n: cv.projects.length, l: 'Projects' },
  ]
  return (
    <section style={{ minWidth: 0, background: c.surface, border: `1px solid ${c.line}`, borderRadius: 24, padding: 16, boxShadow: shadow.card }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        {withThumb && (
          <button onClick={onPreview} aria-label="Open preview" style={{ flexShrink: 0, padding: 0, border: `1px solid ${c.line}`, borderRadius: 10, overflow: 'hidden', background: '#fff', cursor: 'pointer', boxShadow: '0 6px 16px rgba(21,19,29,.10)' }}>
            <MiniCV cv={cv} template={version.template} width={86} />
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: radius.pill,
              background: ready ? c.goodSoft : c.brandSoft,
              color: ready ? '#166534' : c.brandInk,
              fontFamily: font,
              fontSize: 12.5,
              fontWeight: 700,
            }}
          >
            {ready && <Icon name="check" size={13} stroke={3} />}
            {ready ? 'Ready to send' : `${progress}% ready`}
          </span>
          <div style={{ marginTop: 8, fontFamily: font, fontSize: 18, fontWeight: 750, color: c.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {cv.personal.name || 'Your name'}
          </div>
          <div style={{ marginTop: 2, fontFamily: font, fontSize: 14, color: c.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {version.role || 'Pick the job you want'}
          </div>
          <div style={{ marginTop: 10, height: 6, borderRadius: 6, background: '#ebe9f1', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', borderRadius: 6, background: ready ? c.good : c.brand, transition: 'width .4s' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${c.line}` }}>
        {stats.map((s, i) => (
          <div key={s.l} style={{ paddingLeft: i ? 14 : 2, borderLeft: i ? `1px solid ${c.line}` : 'none' }}>
            <div style={{ fontFamily: font, fontSize: 20, fontWeight: 750, color: c.ink }}>{s.n}</div>
            <div style={{ fontFamily: font, fontSize: 12.5, color: c.muted }}>{s.l}</div>
          </div>
        ))}
      </div>

      {withThumb && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 10, marginTop: 16 }}>
          <Button variant="muted" icon="eye" onClick={onPreview}>
            Preview
          </Button>
          <Button variant="primary" icon="download" onClick={onDownload}>
            Download
          </Button>
        </div>
      )}
    </section>
  )
}

function StatusMark({ state }: { state: Status['state'] }) {
  if (state === 'done')
    return (
      <span style={{ width: 24, height: 24, borderRadius: '50%', background: c.good, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon name="check" size={14} stroke={3} />
      </span>
    )
  if (state === 'warn')
    return <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff1d6', color: '#d97706', display: 'grid', placeItems: 'center', flexShrink: 0, fontFamily: font, fontSize: 14, fontWeight: 800 }}>!</span>
  if (state === 'todo') return <span style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${c.brand}`, flexShrink: 0 }} />
  return <span style={{ width: 22, height: 22, borderRadius: '50%', border: `2px dashed ${c.lineStrong}`, flexShrink: 0 }} />
}

function SectionList({ profile, version, onOpen }: { profile: CVData; version: RoleVersion; onOpen: (id: SectionId) => void }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {SECTIONS.map((s) => {
        const st = sectionStatus(s.id, profile, version)
        return (
          <button
            key={s.id}
            onClick={() => onOpen(s.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              width: '100%',
              minWidth: 0,
              textAlign: 'left',
              padding: 14,
              borderRadius: 20,
              border: `1px solid ${c.line}`,
              background: c.surface,
              boxShadow: shadow.card,
              cursor: 'pointer',
            }}
          >
            <span style={{ width: 46, height: 46, borderRadius: 15, background: c.brandSoft, color: c.brand, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <Icon name={s.icon} size={22} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: font, fontSize: 16, fontWeight: 650, color: c.ink }}>{s.title}</span>
              <span
                style={{
                  display: 'block',
                  marginTop: 3,
                  fontFamily: font,
                  fontSize: 13,
                  color: st.state === 'warn' ? c.warn : st.state === 'todo' ? c.brandInk : c.muted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {st.text}
              </span>
            </span>
            <StatusMark state={st.state} />
            <Icon name="right" size={18} style={{ color: c.faint }} />
          </button>
        )
      })}
    </div>
  )
}

function SectionPage({
  id,
  index,
  ctx,
  sticky,
  onBack,
  footer,
}: {
  id: SectionId
  index: number
  ctx: EditCtx
  sticky: boolean
  onBack: () => void
  footer: React.ReactNode
}) {
  const s = SECTIONS[index]
  return (
    <div style={{ minWidth: 0 }}>
      <header
        style={{
          position: sticky ? 'sticky' : 'static',
          top: 0,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: sticky ? '12px 0' : '0 0 8px',
          margin: sticky ? '0 -16px' : 0,
          paddingLeft: sticky ? 16 : 0,
          paddingRight: sticky ? 16 : 0,
          background: sticky ? 'rgba(244,243,248,.92)' : 'transparent',
          backdropFilter: sticky ? 'blur(12px)' : undefined,
        }}
      >
        <IconButton icon="left" label="Back to all sections" onClick={onBack} />
        <span style={{ flex: 1, fontFamily: font, fontSize: 15, fontWeight: 650, color: c.body, textAlign: 'center' }}>{sticky ? s.title : ''}</span>
        <span style={{ minWidth: 44, textAlign: 'right', fontFamily: font, fontSize: 13, fontWeight: 600, color: c.muted }}>
          {index + 1}/{SECTIONS.length}
        </span>
      </header>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '10px 2px 18px' }}>
        <span style={{ width: 52, height: 52, borderRadius: 17, background: c.brand, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: `0 8px 20px ${c.brand}40` }}>
          <Icon name={s.icon} size={24} />
        </span>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: font, fontSize: 25, lineHeight: 1.15, fontWeight: 800, letterSpacing: '-.02em', color: c.ink }}>{s.title}</h1>
          <p style={{ margin: '4px 0 0', fontFamily: font, fontSize: 14, lineHeight: 1.45, color: c.muted }}>{s.lead}</p>
        </div>
      </div>

      <section style={{ background: c.surface, border: `1px solid ${c.line}`, borderRadius: radius.lg, padding: 18, boxShadow: shadow.card, minWidth: 0 }}>
        <SectionEditor id={id} ctx={ctx} />
      </section>
      {footer}
    </div>
  )
}

function BottomNav({ tab, onTab, onDownload }: { tab: Tab; onTab: (t: Tab) => void; onDownload: () => void }) {
  const item = (id: Tab, label: string, icon: IconName) => {
    const on = tab === id
    return (
      <button
        key={id}
        onClick={() => onTab(id)}
        aria-current={on ? 'page' : undefined}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          height: 54,
          margin: '0 2px',
          borderRadius: 27,
          border: 'none',
          background: on ? 'rgba(255,255,255,.12)' : 'transparent',
          color: on ? '#fff' : '#9d9aab',
          fontFamily: font,
          fontSize: 11,
          fontWeight: on ? 700 : 550,
          cursor: 'pointer',
          transition: 'background .15s, color .15s',
        }}
      >
        <Icon name={icon} size={21} />
        {label}
      </button>
    )
  }
  return (
    <nav
      aria-label="Studio"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 60,
        display: 'flex',
        justifyContent: 'center',
        padding: '26px 14px calc(12px + env(safe-area-inset-bottom))',
        background: `linear-gradient(to top, ${c.canvas} 55%, rgba(244,243,248,0))`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          width: '100%',
          maxWidth: 440,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 70px 1fr 1fr',
          alignItems: 'center',
          height: 68,
          padding: '0 7px',
          borderRadius: 34,
          background: c.night,
          boxShadow: shadow.float,
        }}
      >
        {item('edit', 'Edit', 'edit')}
        {item('design', 'Design', 'palette')}
        <button
          onClick={onDownload}
          aria-label="Download PDF"
          style={{ justifySelf: 'center', width: 56, height: 56, borderRadius: '50%', border: 'none', background: c.brand, color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: `0 8px 22px ${c.brand}66` }}
        >
          <Icon name="download" size={24} stroke={2.2} />
        </button>
        {item('preview', 'Preview', 'eye')}
        {item('match', 'Match', 'target')}
      </div>
    </nav>
  )
}

/* ── Sheets ───────────────────────────────────────────────────────────── */

function DownloadSheet({
  open,
  onClose,
  missing,
  role,
  onFix,
  onDownload,
}: {
  open: boolean
  onClose: () => void
  missing: Task[]
  role: string
  onFix: (t: Task) => void
  onDownload: () => void
}) {
  const gaps = missing.length > 0
  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ textAlign: 'center' }}>
        <Badge icon={gaps ? 'alert' : 'download'} tone={gaps ? 'warn' : 'brand'} />
        <h2 style={{ margin: 0, fontFamily: font, fontSize: 21, fontWeight: 800, color: c.ink }}>{gaps ? 'Almost there' : 'Your CV is ready'}</h2>
        <p style={{ margin: '8px auto 0', maxWidth: 340, fontFamily: font, fontSize: 14.5, lineHeight: 1.55, color: c.muted }}>
          {gaps
            ? `${missing.length} thing${missing.length > 1 ? 's' : ''} recruiters look for ${missing.length > 1 ? 'are' : 'is'} still empty.`
            : `Your ${role || ''} CV has everything recruiters look for. Download it as a PDF job portals can read.`}
        </p>
      </div>

      {gaps && (
        <div style={{ display: 'grid', gap: 8, marginTop: 18 }}>
          {missing.map((t) => (
            <button
              key={t.id}
              onClick={() => onFix(t)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 16, border: `1px solid ${c.line}`, background: c.surface, cursor: 'pointer' }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontFamily: font, fontSize: 15, fontWeight: 650, color: c.ink }}>{t.label}</span>
                <span style={{ display: 'block', fontFamily: font, fontSize: 12.5, color: c.muted, marginTop: 2 }}>{t.why}</span>
              </span>
              <Icon name="right" size={18} style={{ color: c.faint }} />
            </button>
          ))}
        </div>
      )}

      <div style={{ marginTop: 18, padding: 14, borderRadius: 16, background: c.sunken, fontFamily: font, fontSize: 13.5, lineHeight: 1.6, color: c.body }}>
        <b style={{ color: c.ink }}>In the print window that opens:</b>
        <div>1. Destination → <b>Save as PDF</b></div>
        <div>2. Turn off <b>Headers and footers</b>, so no web address prints on your CV</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 10, marginTop: 18 }}>
        {gaps ? (
          <Button variant="muted" onClick={() => onFix(missing[0])}>
            Fix first
          </Button>
        ) : (
          <Button variant="muted" onClick={onClose}>
            Close
          </Button>
        )}
        <Button variant="dark" icon="download" onClick={onDownload}>
          {gaps ? 'Download anyway' : 'Download PDF'}
        </Button>
      </div>
    </Sheet>
  )
}

function RolesSheet({
  open,
  onClose,
  versions,
  activeId,
  onPick,
  onAdd,
  onRemove,
}: {
  open: boolean
  onClose: () => void
  versions: RoleVersion[]
  activeId: string
  onPick: (v: RoleVersion) => void
  onAdd: () => void
  onRemove: (v: RoleVersion) => void
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Your CV versions">
      <p style={{ margin: '-4px 0 16px', fontFamily: font, fontSize: 14, color: c.muted, lineHeight: 1.55 }}>
        One CV, a version for each job. Your jobs and skills are shared — each version shows the ones that fit its role. To rename one, change “Job you want” in About you.
      </p>
      <div style={{ display: 'grid', gap: 8 }}>
        {versions.map((v) => {
          const on = v.id === activeId
          return (
            <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: `1.5px solid ${on ? c.brand : c.line}`, background: on ? c.brandSoft : c.surface, borderRadius: 18, padding: '4px 6px 4px 14px' }}>
              <button onClick={() => onPick(v)} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', background: 'none', border: 'none', padding: '12px 0', cursor: 'pointer' }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${on ? c.brand : c.lineStrong}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {on && <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.brand }} />}
                </span>
                <span style={{ fontFamily: font, fontSize: 15.5, fontWeight: on ? 700 : 550, color: on ? c.brandInk : c.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.role || 'Untitled'}</span>
              </button>
              {versions.length > 1 && <IconButton icon="trash" label={`Delete the ${v.role || 'untitled'} version`} variant="plain" size={40} onClick={() => onRemove(v)} />}
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 16 }}>
        <Button variant="primary" block icon="plus" onClick={onAdd}>
          CV for another job
        </Button>
      </div>
    </Sheet>
  )
}

function NewRoleSheet({ open, onClose, onCreate, taken }: { open: boolean; onClose: () => void; onCreate: (title: string) => void; taken: string[] }) {
  const [title, setTitle] = useState('')
  useEffect(() => {
    if (open) setTitle('')
  }, [open])
  const t = title.trim()
  const dup = taken.some((r) => r.trim().toLowerCase() === t.toLowerCase())
  return (
    <Sheet open={open} onClose={onClose} title="CV for another job">
      <p style={{ margin: '-4px 0 16px', fontFamily: font, fontSize: 14, color: c.muted, lineHeight: 1.55 }}>
        Pick a job. We choose the skills and projects that fit it and put the strongest first — you can change anything after.
      </p>
      <TextField label="Job title" placeholder="e.g. UI/UX Designer" value={title} onChange={(e) => setTitle(e.target.value)} list="role-presets-2" enterKeyHint="done" />
      <datalist id="role-presets-2">
        {ROLE_PRESETS.map((r) => (
          <option key={r.title} value={r.title} />
        ))}
      </datalist>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '14px 0 18px' }}>
        {ROLE_PRESETS.map((r) => (
          <Chip key={r.title} active={title === r.title} onClick={() => setTitle(r.title)}>
            {r.title}
          </Chip>
        ))}
      </div>
      {dup && <p style={{ margin: '0 0 12px', fontFamily: font, fontSize: 13, color: c.warn }}>You already have a CV for {t}.</p>}
      <Button variant="primary" block size="lg" icon="sparkle" disabled={!t || dup} onClick={() => onCreate(t)}>
        {t ? `Create CV for ${t}` : 'Create CV'}
      </Button>
    </Sheet>
  )
}

function MoreSheet({
  open,
  onClose,
  docs,
  activeId,
  onSelect,
  onNew,
  onExample,
  onBackup,
  onRestore,
  onStartOver,
}: {
  open: boolean
  onClose: () => void
  docs: CVDoc[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
  onExample: () => void
  onBackup: () => void
  onRestore: () => void
  onStartOver: () => void
}) {
  const row = (icon: IconName, label: string, sub: string, onClick: () => void, tone?: 'bad') => (
    <button
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '12px 4px', border: 'none', borderBottom: `1px solid ${c.line}`, background: 'none', cursor: 'pointer' }}
    >
      <span style={{ width: 40, height: 40, borderRadius: 13, background: tone === 'bad' ? c.badSoft : c.sunken, color: tone === 'bad' ? c.bad : c.body, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={19} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: font, fontSize: 15, fontWeight: 650, color: tone === 'bad' ? c.bad : c.ink }}>{label}</span>
        <span style={{ display: 'block', fontFamily: font, fontSize: 12.5, color: c.muted, marginTop: 1 }}>{sub}</span>
      </span>
      <Icon name="right" size={17} style={{ color: c.faint }} />
    </button>
  )

  return (
    <Sheet open={open} onClose={onClose} title="Your CVs">
      <div style={{ display: 'grid', gap: 8 }}>
        {docs.map((d) => {
          const on = d.id === activeId
          return (
            <button
              key={d.id}
              onClick={() => onSelect(d.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '12px 14px', borderRadius: 18, border: `1.5px solid ${on ? c.brand : c.line}`, background: on ? c.brandSoft : c.surface, cursor: 'pointer' }}
            >
              <span style={{ width: 40, height: 40, borderRadius: 13, background: on ? c.brand : c.sunken, color: on ? '#fff' : c.body, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="file" size={19} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontFamily: font, fontSize: 15, fontWeight: 650, color: c.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.data.personal.name || d.name}
                </span>
                <span style={{ display: 'block', fontFamily: font, fontSize: 12.5, color: c.muted, marginTop: 1 }}>
                  {d.versions.map((v) => v.role || 'Untitled').join(' · ')}
                </span>
              </span>
              {on && <Icon name="check" size={18} style={{ color: c.brand }} />}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 8, marginTop: 10 }}>
        <Button icon="plus" onClick={onNew}>
          New CV
        </Button>
        <Button onClick={onExample}>See example</Button>
      </div>

      <Eyebrow style={{ margin: '24px 2px 4px' }}>Keep it safe</Eyebrow>
      <p style={{ margin: '0 2px 4px', fontFamily: font, fontSize: 13, color: c.muted, lineHeight: 1.5 }}>
        Your CV is saved in this browser only — nothing is uploaded. A backup file moves it to another phone or computer.
      </p>
      {row('download', 'Download backup', 'A small file with this CV and all its versions', onBackup)}
      {row('upload', 'Restore backup', 'Open a backup file made here', onRestore)}
      {row('trash', 'Start over', 'Clear this CV and begin again', onStartOver, 'bad')}
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 18, fontFamily: font, fontSize: 14, fontWeight: 600, color: c.muted, textDecoration: 'none' }}>
        <Icon name="home" size={16} /> Back to portfolio
      </a>
    </Sheet>
  )
}

/* ── First visit ──────────────────────────────────────────────────────── */

function StartScreen({
  sample,
  onScratch,
  onExample,
  onRestore,
  restoreInput,
}: {
  sample: () => CVData
  onScratch: () => void
  onExample: () => void
  onRestore: () => void
  restoreInput: React.ReactNode
}) {
  const demo = useMemo(() => sample(), [sample])
  const features: { icon: IconName; t: string }[] = [
    { icon: 'bolt', t: 'Ready in minutes' },
    { icon: 'swap', t: 'One CV, every job' },
    { icon: 'shield', t: 'Stays on your device' },
  ]
  return (
    <div className="native-cursor studio" style={{ minHeight: '100dvh', background: c.canvas, fontFamily: font, display: 'flex', justifyContent: 'center', padding: '16px 16px 32px' }}>
      <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <header style={{ display: 'flex', alignItems: 'center', padding: '4px 0' }}>
          <a href="/" aria-label="Back to portfolio" style={{ display: 'flex' }}>
            <MahmudLogo size="sm" />
          </a>
        </header>

        <div
          aria-hidden
          style={{
            position: 'relative',
            height: 300,
            borderRadius: 32,
            overflow: 'hidden',
            background: 'linear-gradient(150deg, #7b6af3 0%, #5b47e0 48%, #3d2db8 100%)',
          }}
        >
          <span style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: '#fcd34d', top: -30, right: -24 }} />
          <span style={{ position: 'absolute', width: 90, height: 90, borderRadius: 26, background: '#fb7185', bottom: -26, left: 26, transform: 'rotate(18deg)' }} />
          <span style={{ position: 'absolute', width: 54, height: 54, borderRadius: '50%', background: '#38bdf8', bottom: 40, right: 22 }} />
          {[
            { t: 'executive' as const, x: -118, r: -11, y: 44 },
            { t: 'sidebar-light' as const, x: 118, r: 11, y: 44 },
            { t: 'profile-split' as const, x: 0, r: 0, y: 26 },
          ].map((f) => (
            <div
              key={f.t}
              style={{
                position: 'absolute',
                left: '50%',
                top: f.y,
                transform: `translateX(calc(-50% + ${f.x}px)) rotate(${f.r}deg)`,
                borderRadius: 10,
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(20,10,80,.35)',
              }}
            >
              <MiniCV cv={demo} template={f.t} width={f.x ? 138 : 158} />
            </div>
          ))}
        </div>

        <div>
          <h1 style={{ margin: 0, fontFamily: font, fontSize: 32, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-.03em', color: c.ink }}>Make a CV that fits the job</h1>
          <p style={{ margin: '12px 0 0', fontFamily: font, fontSize: 16, lineHeight: 1.6, color: c.body }}>
            Fill it in once. Pick the job you want, and your CV picks the right skills and projects for it. Free, no sign-up.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
          {features.map((f) => (
            <div key={f.t} style={{ padding: '12px 10px', borderRadius: 18, background: c.surface, border: `1px solid ${c.line}`, textAlign: 'center' }}>
              <span style={{ width: 36, height: 36, borderRadius: 12, background: c.brandSoft, color: c.brand, display: 'grid', placeItems: 'center', margin: '0 auto 6px' }}>
                <Icon name={f.icon} size={18} />
              </span>
              <span style={{ fontFamily: font, fontSize: 12.5, fontWeight: 600, color: c.body, lineHeight: 1.3 }}>{f.t}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          <Button variant="primary" size="lg" block onClick={onScratch}>
            Start my CV
          </Button>
          <Button size="lg" block onClick={onExample}>
            See an example first
          </Button>
          <Button variant="ghost" block icon="upload" onClick={onRestore}>
            I have a backup file
          </Button>
        </div>
        {restoreInput}
      </div>
    </div>
  )
}
