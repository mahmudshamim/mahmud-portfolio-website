'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import MahmudLogo from '@/components/MahmudLogo'

const navLinks = [
  { label: 'Work', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [visible, setVisible] = useState(true)
  const [activeSection, setActiveSection] = useState('hero')
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setVisible(currentY < lastScrollY.current || currentY < 80)
      lastScrollY.current = currentY

      const sections = ['hero', 'skills', 'projects', 'experience', 'contact']
      for (const id of sections.reverse()) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 200) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (href: string) => {
    const id = href.replace('#', '')
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(5,5,8,0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => scrollTo('#hero')}
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <MahmudLogo size="md" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              style={{
                background: 'none',
                border: 'none',
                color: activeSection === link.href.replace('#', '') ? '#4f8ef7' : '#e2e2f0',
                fontSize: 14,
                fontFamily: 'var(--font-dm-sans)',
                fontWeight: 500,
                letterSpacing: '0.05em',
                opacity: activeSection === link.href.replace('#', '') ? 1 : 0.7,
                transition: 'color 0.2s, opacity 0.2s',
              }}
            >
              {link.label}
            </button>
          ))}
          <Link
            href="/cv"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 14,
              fontWeight: 600,
              color: '#4f8ef7',
              border: '1px solid #4f8ef7',
              borderRadius: 6,
              padding: '6px 16px',
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
          >
            CV
          </Link>
        </div>
      </div>
    </nav>
  )
}
