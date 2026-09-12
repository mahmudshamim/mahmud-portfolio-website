/**
 * Printing: the CV, or a cover letter, as the whole document.
 *
 * Print, not html2canvas: the browser's own engine gives real text and real
 * links, which is what an applicant tracking system needs to read the file.
 * The element is cloned to the body because the on-screen copy sits inside a
 * scaled, scrolling column, and a transformed or clipped ancestor breaks
 * printing. Styles are inline, so the clone renders identically.
 *
 * The page itself has no margin (see globals.css). Browsers print their own
 * header and footer (the date, the page title, the web address) inside the
 * page margin, so a zero margin is the one thing that keeps them off the CV
 * whatever the print dialog is set to. Chrome and Edge name the saved file
 * from document.title, so it is set to the owner's name for the duration.
 */

function begin(title: string) {
  /* Safari fires afterprint unreliably; never print two stale copies. */
  document.getElementById('cv-print-root')?.remove()

  const previousTitle = document.title
  document.title = title

  const root = document.createElement('div')
  root.id = 'cv-print-root'
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
  return {
    root,
    print: () => {
      window.print()
      setTimeout(cleanup, 60000)
    },
  }
}

/** A single-page document, such as a cover letter. */
export function printElement(source: HTMLElement | null, title: string) {
  if (!source) return
  const job = begin(title)
  job.root.appendChild(source.cloneNode(true))
  job.print()
}

export type PrintPage = { start: number; end: number }

/**
 * A document split into A4 pages at the given break points, each page drawn
 * as its own sheet with the margin inside it. This is how page two gets a
 * top margin without the page margin that would let the browser's header
 * and footer back in.
 *
 * Each sheet holds a copy of the whole document, shifted and clipped to its
 * slice. Everything outside the slice is also made invisible, so it is not
 * painted at all: an ATS reading the PDF sees each line once.
 */
export function printPaged(source: HTMLElement | null, pages: PrintPage[], pageMargin: number, title: string) {
  if (!source) return
  if (pages.length < 2 || !pages.every((p) => p.end > p.start)) {
    printElement(source, title)
    return
  }

  const box = source.getBoundingClientRect()
  const spans = Array.from(source.querySelectorAll('*'), (el) => {
    const r = el.getBoundingClientRect()
    return [r.top - box.top, r.bottom - box.top] as const
  })

  const job = begin(title)
  pages.forEach((page, i) => {
    const copy = source.cloneNode(true) as HTMLElement
    copy.removeAttribute('id')
    copy.querySelectorAll<HTMLElement>('*').forEach((el, k) => {
      const [top, bottom] = spans[k] ?? [0, 0]
      if (bottom <= page.start + 0.5 || top >= page.end - 0.5) el.style.visibility = 'hidden'
    })

    const sheet = document.createElement('div')
    sheet.setAttribute('data-print-sheet', '')
    /* A hair under 297mm, so rounding never spills a sheet onto a second
       sheet of paper. */
    sheet.style.cssText = `position:relative;width:794px;height:296mm;overflow:hidden;background:#fff;${i < pages.length - 1 ? 'break-after:page;page-break-after:always;' : ''}`

    const window_ = document.createElement('div')
    window_.style.cssText = `position:absolute;left:0;right:0;top:${i ? pageMargin : 0}px;height:${page.end - page.start}px;overflow:hidden;`

    const shift = document.createElement('div')
    shift.style.cssText = `position:absolute;left:0;top:${-page.start}px;width:794px;`

    shift.appendChild(copy)
    window_.appendChild(shift)
    sheet.appendChild(window_)
    job.root.appendChild(sheet)
  })
  job.print()
}

/** "Md. Abdulla Al Mahmud" to "Md-Abdulla-Al-Mahmud", for a file name. */
export const fileSafe = (name: string) =>
  (name || '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
