import type { Metadata } from 'next'
import SharedCV from '@/components/cv/SharedCV'

/* A shared CV belongs to whoever shared it; keep it out of search results. */
export const metadata: Metadata = {
  title: 'Shared CV',
  robots: { index: false, follow: false },
}

export default function SharedCVPage() {
  return <SharedCV />
}
