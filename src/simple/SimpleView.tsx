import { site } from '../data/content'
import { Section, SECTIONS } from '../sections'

export default function SimpleView({ notice }: { notice: boolean }) {
  return (
    <>
      <main id="main" tabIndex={-1}>
        {notice && (
          <p className="notice" role="status">
            3D graphics aren’t available on this device, so you’re seeing the simple view.
          </p>
        )}
        {SECTIONS.map((def) => (
          <Section key={def.id} def={def} className={def.id === 'top' ? 'hero' : 'section'} />
        ))}
      </main>
      <footer className="site-footer">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
      </footer>
    </>
  )
}
