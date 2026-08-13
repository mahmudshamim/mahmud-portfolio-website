import { ImageResponse } from 'next/og'

/**
 * iOS home-screen icon. iOS ignores transparency and applies its own corner
 * mask, so this is drawn edge-to-edge on solid ink with the mark inset.
 */
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
        <svg width="132" height="83" viewBox="0 0 160 100" fill="#f4f3ef">
          <path d="M38 0 L68 0 L30 100 L0 100 Z" />
          <path d="M84 0 L114 0 L76 100 L46 100 Z" />
          <path d="M130 0 L160 0 L122 100 L92 100 Z" />
        </svg>
      </div>
    ),
    size
  )
}
