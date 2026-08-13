import { ImageResponse } from 'next/og'

/**
 * Raster fallback for browsers that do not take an SVG favicon (Safari before
 * 16, older Android). Generated at build time from the same geometry as
 * public/favicon.svg and components/MahmudLogo.tsx — one mark, three sources,
 * so a tweak to the bars only needs repeating, never re-drawing.
 */
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#16150f',
        }}
      >
        <svg width="416" height="260" viewBox="0 0 160 100" fill="#f4f3ef">
          <path d="M38 0 L68 0 L30 100 L0 100 Z" />
          <path d="M84 0 L114 0 L76 100 L46 100 Z" />
          <path d="M130 0 L160 0 L122 100 L92 100 Z" />
        </svg>
      </div>
    ),
    size
  )
}
