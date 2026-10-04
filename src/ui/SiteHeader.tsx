import type { MouseEvent } from 'react'
import { site } from '../data/content'
import { SECTIONS } from '../sections'
import { scrollToSection } from '../scroll/bus'

type Props = { mode: 'simple' | '3d'; canToggle: boolean; onToggle: () => void }

export default function SiteHeader({ mode, canToggle, onToggle }: Props) {
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
              <a href={`#${s.id}`} onClick={go(s.id)}>
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
