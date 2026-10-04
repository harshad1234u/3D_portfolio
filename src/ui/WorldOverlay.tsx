import { site } from '../data/content'
import { Section, SECTIONS } from '../sections'

// The real, semantic content of the 3D view: panels that scroll over the world.
export default function WorldOverlay() {
  return (
    <>
      <main id="main" className="world-main" tabIndex={-1}>
        {SECTIONS.map((def) => (
          <Section key={def.id} def={def} className={`station station--${def.id}`} />
        ))}
      </main>
      <footer className="site-footer world-footer">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
      </footer>
    </>
  )
}
