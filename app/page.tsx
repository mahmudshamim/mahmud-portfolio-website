import Cursor from '@/components/Cursor'
import Navbar from '@/components/Navbar'
import Deck from '@/components/scroll/Deck'
import Surface from '@/components/scroll/Surface'
import Hero from '@/components/Hero'
import Skills from '@/components/Skills'
import Projects from '@/components/Projects'
import Experience from '@/components/Experience'
import Education from '@/components/Education'
import Contact from '@/components/Contact'

/**
 * The page is a sequence of grounds, not one continuous field:
 *
 *   Hero        grid    drafting paper behind the wordmark
 *   Skills      plain   the icon cloud is busy enough on its own
 *   Projects    grid    structure behind the browser windows
 *   Experience  alt     a half-step darker, to break two light bands
 *   Education   —       owns its ground: the one dark section, unwrapped
 *   Contact     plain   lands flat and quiet
 *
 * `Deck` is only the colour showing through anywhere a section leaves a gap.
 */
export default function Home() {
  return (
    <>
      <Deck />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Cursor />
        <Navbar />

        <Surface variant="grid">
          <Hero />
        </Surface>

        <Surface variant="plain">
          <Skills />
        </Surface>

        <Surface variant="grid">
          <Projects />
        </Surface>

        <Surface variant="alt" id="experience">
          <Experience />
        </Surface>

        {/* No Surface: Education keeps its own full-bleed dark ground, so a
            wrapper would only paint a band nothing ever sees. */}
        <Education />

        <Surface variant="plain" id="contact">
          <Contact />
        </Surface>
      </main>
    </>
  )
}
