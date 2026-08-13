'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdEmail, MdPhone } from 'react-icons/md'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { SiUpwork } from 'react-icons/si'
import { portfolioData } from '@/data/portfolio'
import { useMagnetic } from '@/hooks/useMagnetic'
import { useScramble } from '@/hooks/useScramble'
import MahmudLogo from '@/components/MahmudLogo'

export default function Contact() {
  const { personal } = portfolioData
  const sendRef = useMagnetic() as React.RefObject<HTMLButtonElement>
  const { display: headingDisplay, scramble: headingScramble, isScrambling: headingScrambling } = useScramble("LET'S BUILD SOMETHING")
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({ name: false, email: false, message: false })
  const [success, setSuccess] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    await navigator.clipboard.writeText(personal.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = {
      name: !form.name.trim(),
      email: !form.email.trim(),
      message: !form.message.trim(),
    }
    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) return

    setSending(true)
    setSendError(false)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSuccess(true)
      setForm({ name: '', email: '', message: '' })
    } catch {
      setSendError(true)
    } finally {
      setSending(false)
    }
    setTimeout(() => setSuccess(false), 5000)
  }

  return (
    <section
      style={{
        /* The flight lands here: the grid stays visible at the top edge and the
           ground solidifies under the form. */
        background: 'transparent',
        padding: 'clamp(120px, 16vw, 200px) clamp(16px, 4vw, 24px) clamp(60px, 10vw, 120px)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 64 }}
        >
          <p
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 13,
              color: '#e2701f',
              letterSpacing: '0.15em',
              marginBottom: 12,
            }}
          >
            // Get in touch
          </p>
          <h2
            onMouseEnter={headingScramble}
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              lineHeight: 1,
              color: headingScrambling ? '#e2701f' : '#16150f',
              letterSpacing: headingScrambling ? '0.04em' : '0.02em',
              transition: 'color 0.2s, letter-spacing 0.3s',
            }}
          >
            {headingDisplay}
          </h2>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(32px, 6vw, 64px)',
          }}
        >
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: 15,
                color: 'rgba(22,21,15,0.5)',
                lineHeight: 1.8,
                marginBottom: 40,
              }}
            >
              {personal.summary}
            </p>

            {/* Email */}
            <div style={{ marginBottom: 32 }}>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 11,
                  color: 'rgba(22,21,15,0.3)',
                  letterSpacing: '0.15em',
                  marginBottom: 8,
                }}
              >
                EMAIL
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <MdEmail size={18} color="#e2701f" />
                <span
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 16,
                    color: '#16150f',
                  }}
                >
                  {personal.email}
                </span>
                <button
                  onClick={copyEmail}
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-dm-sans)',
                    color: copied ? '#2f8f5b' : '#e2701f',
                    background: 'none',
                    border: `1px solid ${copied ? '#2f8f5b' : '#e2701f'}`,
                    borderRadius: 4,
                    padding: '3px 10px',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 12,
                  color: 'rgba(22,21,15,0.3)',
                  marginTop: 6,
                }}
              >
                Usually replies within 24 hours
              </p>
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: 'rgba(22,21,15,0.3)', letterSpacing: '0.15em', marginBottom: 8 }}>
                PHONE
              </p>
              <a
                href={`tel:${(personal as any).phone?.replace(/\s/g, '')}`}
                style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 16, color: '#16150f', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <MdPhone size={18} color="#e2701f" />
                {(personal as any).phone}
              </a>
            </div>

            {/* Social links */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'GitHub',   href: personal.github,   icon: <FaGithub size={16} /> },
                { label: 'Upwork',   href: personal.upwork,   icon: <SiUpwork size={16} /> },
                { label: 'LinkedIn', href: personal.linkedin, icon: <FaLinkedin size={16} /> },
              ]
                .filter((l) => l.href)
                .map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: 14,
                      color: 'rgba(22,21,15,0.5)',
                      textDecoration: 'none',
                      border: '1px solid rgba(22,21,15,0.08)',
                      borderRadius: 6,
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'color 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#e2701f'
                      e.currentTarget.style.borderColor = '#e2701f'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(22,21,15,0.5)'
                      e.currentTarget.style.borderColor = 'rgba(22,21,15,0.08)'
                    }}
                  >
                    {link.icon}
                    {link.label}
                  </a>
                ))}
            </div>
          </motion.div>

          {/* Right column — Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {(['name', 'email'] as const).map((field) => (
                <div key={field}>
                  <label
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: 11,
                      color: 'rgba(22,21,15,0.4)',
                      letterSpacing: '0.12em',
                      display: 'block',
                      marginBottom: 8,
                      textTransform: 'uppercase',
                    }}
                  >
                    {field}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field]}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, [field]: e.target.value }))
                      setErrors((prev) => ({ ...prev, [field]: false }))
                    }}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: `1px solid ${errors[field] ? '#ff4444' : 'rgba(22,21,15,0.08)'}`,
                      borderRadius: 8,
                      padding: '12px 16px',
                      color: '#16150f',
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = errors[field] ? '#ff4444' : '#e2701f')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = errors[field] ? '#ff4444' : 'rgba(22,21,15,0.08)')}
                  />
                </div>
              ))}

              <div>
                <label
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 11,
                    color: 'rgba(22,21,15,0.4)',
                    letterSpacing: '0.12em',
                    display: 'block',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                  }}
                >
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, message: e.target.value }))
                    setErrors((prev) => ({ ...prev, message: false }))
                  }}
                  rows={5}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: `1px solid ${errors.message ? '#ff4444' : 'rgba(22,21,15,0.08)'}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                    color: '#16150f',
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = errors.message ? '#ff4444' : '#e2701f')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.message ? '#ff4444' : 'rgba(22,21,15,0.08)')}
                />
              </div>

              <button
                ref={sendRef}
                type="submit"
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#f4f3ef',
                  background: '#e2701f',
                  border: 'none',
                  borderRadius: 8,
                  padding: '14px 32px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  alignSelf: 'flex-start',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(226,112,31,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>

              {sendError && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 14,
                    color: '#ff5f57',
                    background: 'rgba(255,95,87,0.08)',
                    border: '1px solid rgba(255,95,87,0.2)',
                    borderRadius: 8,
                    padding: '12px 16px',
                  }}
                >
                  Something went wrong. Please try again or email directly.
                </motion.p>
              )}

              {success && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 14,
                    color: '#2f8f5b',
                    background: 'rgba(47,143,91,0.1)',
                    border: '1px solid rgba(47,143,91,0.3)',
                    borderRadius: 8,
                    padding: '12px 16px',
                  }}
                >
                  Message sent! I&apos;ll get back to you within 24 hours.
                </motion.p>
              )}
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 100,
            paddingTop: 32,
            borderTop: '1px solid rgba(22,21,15,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <MahmudLogo size="sm" />
          <p
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 13,
              color: 'rgba(22,21,15,0.25)',
            }}
          >
            &copy; {new Date().getFullYear()} Mahmud. Built with Next.js &amp; Matter.js
          </p>
        </div>
      </div>
    </section>
  )
}
