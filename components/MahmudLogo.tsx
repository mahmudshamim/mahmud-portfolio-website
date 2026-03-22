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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap }}>
      {/* Geometric M mark */}
      <svg
        width={svgW}
        height={s.svgH}
        viewBox="0 0 28 20"
        fill="none"
        style={{ flexShrink: 0, display: 'block' }}
      >
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Filled geometric M */}
        <path
          d="M0,20 L0,0 L14,11 L28,0 L28,20 L24,20 L14,6 L4,20 Z"
          fill="#4f8ef7"
          filter="url(#glow)"
        />
        {/* Subtle inner highlight */}
        <path
          d="M0,0 L14,11 L28,0"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      {/* Wordmark */}
      <span
        style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: s.textFont,
          letterSpacing: '0.18em',
          lineHeight: 1,
          background: 'linear-gradient(90deg, #ffffff 30%, #4f8ef7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        MAHMUD
      </span>
    </span>
  )
}
