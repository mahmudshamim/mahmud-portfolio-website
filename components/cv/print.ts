/**
 * Print one element as the whole document, the CV, or a cover letter.
 *
 * Print, not html2canvas: the browser's own engine gives real text, real
 * links and automatic pagination, which is what an applicant tracking system
 * needs to read the file. The element is cloned to the body because the
 * on-screen copy sits inside a scaled, scrolling column, and a transformed or
 * clipped ancestor breaks pagination. Styles are inline, so the clone renders
 * identically.
 *
 * Chrome and Edge name the saved file from document.title, so it is set to
 * the owner's name for the duration.
 */
export function printElement(source: HTMLElement | null, title: string) {
  if (!source) return
  /* Safari fires afterprint unreliably; never print two stale copies. */
  document.getElementById('cv-print-root')?.remove()

  const previousTitle = document.title
  document.title = title

  const root = document.createElement('div')
  root.id = 'cv-print-root'
  root.appendChild(source.cloneNode(true))
  document.body.appendChild(root)

  let done = false
  const cleanup = () => {
    if (done) return
    done = true
    root.remove()
    document.title = previousTitle
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.print()
  setTimeout(cleanup, 60000)
}

/** "Md. Abdulla Al Mahmud" → "Md-Abdulla-Al-Mahmud", for a file name. */
export const fileSafe = (name: string) =>
  (name || '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
