'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BN } from './bn'

/*
 * English or Bangla, for the studio's own words.
 *
 * The English sentence is the key, gettext-style: `t('Build your CV')`.
 * A missing translation falls back to English instead of showing a key, so
 * adding a string never breaks the Bangla screen — it just stays English
 * until someone translates it.
 *
 * The CV itself is not translated: most CVs here are sent in English, and
 * what goes on the page is whatever the person typed.
 */

export type Lang = 'en' | 'bn'
type Vars = Record<string, string | number>
export type T = (s: string, vars?: Vars) => string

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
const bnNum = (n: number) => String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)])

/* Numbers passed as variables are written in Bangla digits on the Bangla
   screen, to match the digits already in the translated sentences. Text
   variables — a job title, a company — are left exactly as typed. */
const fill = (s: string, vars?: Vars, bn?: boolean) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? (bn && typeof vars[k] === 'number' ? bnNum(vars[k] as number) : String(vars[k])) : m)) : s

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: T; num: (n: number) => string }>({ lang: 'en', setLang: () => {}, t: fill, num: String })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('cv-studio-lang')
      if (saved === 'bn' || saved === 'en') setLangState(saved)
      else if (navigator.language?.toLowerCase().startsWith('bn')) setLangState('bn')
    } catch {}
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      window.localStorage.setItem('cv-studio-lang', l)
    } catch {}
  }, [])

  const t = useCallback<T>((s, vars) => (lang === 'bn' ? fill(BN[s] ?? s, vars, true) : fill(s, vars)), [lang])
  const num = useCallback((n: number) => (lang === 'bn' ? bnNum(n) : String(n)), [lang])
  const value = useMemo(() => ({ lang, setLang, t, num }), [lang, setLang, t, num])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
