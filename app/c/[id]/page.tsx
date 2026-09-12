import { cache } from 'react'
import type { Metadata } from 'next'
import SharedCV from '@/components/cv/SharedCV'
import { getShare, readPayload } from '@/lib/shareStore'

type Props = { params: Promise<{ id: string }> }

/* Metadata and the page both need the CV; fetch it once per request. */
const load = cache(async (id: string) => getShare(id).catch(() => null))

/* The name and role go into the title so a link pasted into WhatsApp or
   an email shows whose CV it is. Shared CVs are never indexed. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const raw = await load(id)
  const person = raw ? readPayload(raw)?.d.personal : undefined
  return {
    title: { absolute: person?.name ? `${person.name} | CV` : 'Shared CV' },
    description: person?.role ? `${person.role} CV` : undefined,
    robots: { index: false, follow: false },
  }
}

export default async function ShortCVPage({ params }: Props) {
  const { id } = await params
  return <SharedCV payload={await load(id)} />
}
