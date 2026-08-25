'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CVData } from '@/app/cv/page'

export type CVDoc = {
  id: string
  name: string
  updatedAt: number
  data: CVData
}

type Store = {
  docs: CVDoc[]
  activeId: string
}

const KEY = 'cv-builder-docs-v2'
/** The single-document key this replaces; imported once, then left alone. */
const LEGACY_KEY = 'mahmud-cv-builder-data-v1'

const newId = () => `cv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

function isCVData(value: unknown): value is CVData {
  if (!value || typeof value !== 'object') return false
  const d = value as CVData
  return Boolean(d.personal && d.showSections)
}

/**
 * Fill in anything a stored CV predates.
 *
 * Saved documents are whatever the schema looked like on the day they were
 * written. When `docStyle` later gained `ink` and `headingFont`, every CV
 * saved before that had them missing, and the colour control read
 * `undefined.toLowerCase()` and took the page down. Merging the current
 * defaults under each stored object means adding a field can never break an
 * existing CV.
 */
function normalise(data: CVData, blank: CVData): CVData {
  return {
    ...blank,
    ...data,
    personal: { ...blank.personal, ...data.personal },
    docStyle: { ...blank.docStyle, ...data.docStyle },
    showSections: { ...blank.showSections, ...data.showSections },
    skills: Array.isArray(data.skills) ? data.skills : blank.skills,
    projects: Array.isArray(data.projects) ? data.projects : blank.projects,
    experience: Array.isArray(data.experience) ? data.experience : blank.experience,
    education: Array.isArray(data.education) ? data.education : blank.education,
    customSections: Array.isArray(data.customSections) ? data.customSections : blank.customSections,
    sectionOrder: Array.isArray(data.sectionOrder) ? data.sectionOrder : blank.sectionOrder,
    selectedSkills: Array.isArray(data.selectedSkills) ? data.selectedSkills : blank.selectedSkills,
  }
}

/**
 * Owns every CV the browser holds.
 *
 * One tool, many documents: people tailor a CV per application, and the old
 * single-key store meant editing for one job destroyed the version written for
 * another. Everything stays in localStorage — a CV is full of personal data,
 * and keeping it on the device means there is no server copy to secure,
 * export, or delete on request.
 */
export function useCVDocs(makeBlank: () => CVData, makeSample: () => CVData) {
  const [store, setStore] = useState<Store | null>(null)
  const hydrated = store !== null

  useEffect(() => {
    let next: Store | null = null

    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Store
        if (Array.isArray(parsed?.docs) && parsed.docs.length) {
          const blank = makeBlank()
          next = {
            docs: parsed.docs
              .filter((d) => d && isCVData(d.data))
              .map((d) => ({ ...d, data: normalise(d.data, blank) })),
            activeId: parsed.activeId,
          }
        }
      }

      /* Carry over the single CV the previous version stored. */
      if (!next) {
        const legacy = window.localStorage.getItem(LEGACY_KEY)
        if (legacy) {
          const parsed = JSON.parse(legacy)
          if (isCVData(parsed)) {
            const id = newId()
            next = {
              docs: [{ id, name: parsed.personal?.name ? `${parsed.personal.name}'s CV` : 'My CV', updatedAt: Date.now(), data: normalise(parsed, makeBlank()) }],
              activeId: id,
            }
          }
        }
      }
    } catch {
      /* Corrupted storage falls through to a fresh document. */
    }

    if (!next || !next.docs.length) {
      const id = newId()
      next = { docs: [{ id, name: 'My CV', updatedAt: Date.now(), data: makeBlank() }], activeId: id }
    }

    if (!next.docs.some((d) => d.id === next!.activeId)) {
      next.activeId = next.docs[0].id
    }

    setStore(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Writes are debounced: every keystroke re-serialises every document, and
     on a phone that is enough to make typing stutter. */
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!store) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(store))
      } catch {
        /* Quota or private mode — the session still works, it just will not
           survive a reload. */
      }
    }, 400)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [store])

  const active = store?.docs.find((d) => d.id === store.activeId) ?? null

  const setActiveData = useCallback((update: CVData | ((prev: CVData) => CVData)) => {
    setStore((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        docs: prev.docs.map((doc) =>
          doc.id === prev.activeId
            ? {
                ...doc,
                data: typeof update === 'function' ? (update as (p: CVData) => CVData)(doc.data) : update,
                updatedAt: Date.now(),
              }
            : doc
        ),
      }
    })
  }, [])

  const select = useCallback((id: string) => {
    setStore((prev) => (prev ? { ...prev, activeId: id } : prev))
  }, [])

  const create = useCallback((preset: 'blank' | 'sample' = 'blank') => {
    const id = newId()
    setStore((prev) => {
      if (!prev) return prev
      const doc: CVDoc = {
        id,
        name: preset === 'sample' ? 'Example CV' : `CV ${prev.docs.length + 1}`,
        updatedAt: Date.now(),
        data: preset === 'sample' ? makeSample() : makeBlank(),
      }
      return { docs: [...prev.docs, doc], activeId: id }
    })
    return id
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const duplicate = useCallback((id: string) => {
    setStore((prev) => {
      if (!prev) return prev
      const source = prev.docs.find((d) => d.id === id)
      if (!source) return prev
      const copy: CVDoc = {
        id: newId(),
        name: `${source.name} copy`,
        updatedAt: Date.now(),
        data: JSON.parse(JSON.stringify(source.data)),
      }
      return { docs: [...prev.docs, copy], activeId: copy.id }
    })
  }, [])

  const rename = useCallback((id: string, name: string) => {
    setStore((prev) =>
      prev ? { ...prev, docs: prev.docs.map((d) => (d.id === id ? { ...d, name } : d)) } : prev
    )
  }, [])

  const remove = useCallback((id: string) => {
    setStore((prev) => {
      if (!prev) return prev
      const docs = prev.docs.filter((d) => d.id !== id)
      /* Never leave the editor with nothing to edit. */
      if (!docs.length) {
        const fresh: CVDoc = { id: newId(), name: 'My CV', updatedAt: Date.now(), data: makeBlank() }
        return { docs: [fresh], activeId: fresh.id }
      }
      return { docs, activeId: prev.activeId === id ? docs[0].id : prev.activeId }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const replaceActive = useCallback((data: CVData, name?: string) => {
    setStore((prev) =>
      prev
        ? {
            ...prev,
            docs: prev.docs.map((d) =>
              d.id === prev.activeId ? { ...d, data, name: name ?? d.name, updatedAt: Date.now() } : d
            ),
          }
        : prev
    )
  }, [])

  return {
    hydrated,
    docs: store?.docs ?? [],
    activeId: store?.activeId ?? '',
    active,
    setActiveData,
    select,
    create,
    duplicate,
    rename,
    remove,
    replaceActive,
  }
}
