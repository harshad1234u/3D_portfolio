import { useEffect, useState, type MouseEvent } from 'react'
import { site } from '../data/content'
import { SECTIONS } from '../sections'
import { scrollToSection } from '../scroll/bus'

type Props = { mode: 'simple' | '3d'; canToggle: boolean; onToggle: () => void }

export default function SiteHeader({ mode, canToggle, onToggle }: Props) {
  // Active section: the last one whose top has passed 40% (portrait: 60%) of the viewport (so it stays set in the sky gaps).
  const [active, setActive] = useState('')
  useEffect(() => {
    // Section positions are measured only when the layout changes, never per scroll frame.
    let tops: number[] = []
    let raf = 0
    const update = () => {
      raf = 0
      const line = scrollY + innerHeight * (innerHeight > innerWidth ? 0.6 : 0.4) // panels arrive lower on portrait
      let id = ''
      SECTIONS.forEach((s, i) => tops[i] <= line && (id = s.id))
      setActive(id)
    }
    const onScroll = () => (raf ||= requestAnimationFrame(update))
    const measure = () => {
      tops = SECTIONS.map((s) => (document.getElementById(s.id)?.getBoundingClientRect().top ?? 1e9) + scrollY)
      onScroll()
    }
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      ro.disconnect()
      removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [mode])

  // In 3D mode, nav goes through the world's smooth scroll so the camera flies there.
  const go = (id: string) => (e: MouseEvent) => {
    if (mode !== '3d') return
    e.preventDefault()
    scrollToSection(id)
  }

  return (
    <header className={`site-header site-header--${mode}`}>
      <a className="brand" href="#top" onClick={go('top')}>
        {site.name}
      </a>
      <nav aria-label="Sections">
        <ul>
          {SECTIONS.filter((s) => s.nav).map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} onClick={go(s.id)} aria-current={active === s.id ? 'location' : undefined}>
                {s.nav}
              </a>
            </li>
          ))}
          {canToggle && (
            <li>
              <button type="button" className="view-toggle" onClick={onToggle}>
                {mode === '3d' ? 'Simple view' : '3D view'}
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  )
}
