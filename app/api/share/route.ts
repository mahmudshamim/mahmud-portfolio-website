import { NextResponse } from 'next/server'
import { putShare, readPayload, shareEnabled } from '@/lib/shareStore'

/** Whether short links are switched on, so the share sheet knows what to offer. */
export async function GET() {
  return NextResponse.json({ enabled: shareEnabled() })
}

/** Keep a shared CV under a short id. */
export async function POST(req: Request) {
  if (!shareEnabled()) return NextResponse.json({ error: 'Short links are not set up' }, { status: 501 })

  let payload: unknown
  try {
    payload = (await req.json())?.d
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
  if (typeof payload !== 'string' || !readPayload(payload)) {
    return NextResponse.json({ error: 'That is not a CV' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  try {
    const id = await putShare(payload, ip)
    if (!id) return NextResponse.json({ error: 'Too many links, try again in an hour' }, { status: 429 })
    return NextResponse.json({ id })
  } catch {
    return NextResponse.json({ error: 'Could not save the link' }, { status: 502 })
  }
}
