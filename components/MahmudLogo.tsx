import React from 'react'

type Props = {
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { svgH: 18, textFont: 17, gap: 7 },
  md: { svgH: 26, textFont: 24, gap: 10 },
  lg: { svgH: 38, textFont: 36, gap: 13 },
}

export default function MahmudLogo({ size = 'md' }: Props) {
  const s = sizes[size]
  const svgW = s.svgH * 1.4

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {/* Refined Signature Logo (Crown removed per request, color matched to theme) */}
      <span
        style={{
          fontFamily: 'var(--font-signature)',
          fontSize: s.textFont * 1.5,
          fontWeight: 400,
          background: 'linear-gradient(90deg, #ffffff 0%, #4f8ef7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'inline-block',
          textShadow: '0 0 20px rgba(79,142,247,0.2)',
        }}
      >
        Mahmud
      </span>
    </span>
  )
}
