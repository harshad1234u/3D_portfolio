import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react'
import { getStage, STAGES } from './loading'
import SimpleView from './simple/SimpleView'
import './styles/site.css'
import './styles/world.css'
import Loader from './ui/Loader'
import SiteHeader from './ui/SiteHeader'
import WorldOverlay from './ui/WorldOverlay'
import { initialView, savePref, type View } from './view'

const World = lazy(() => import('./world/World'))
const LOAD_TIMEOUT_MS = 15000

// Any crash inside the 3D world (or a failed chunk download) drops to the Simple view.
class WorldBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function App() {
  const [view, setView] = useState<View>(initialView)
  const fail = useCallback(() => setView((v) => ({ ...v, mode: 'simple', notice: true })), [])
  const is3d = view.mode === '3d'

  useEffect(() => {
    document.documentElement.classList.toggle('is-3d', is3d)
    if (!is3d) return
    const t = setTimeout(() => getStage() < STAGES && fail(), LOAD_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [is3d, fail])

  const toggle = () => {
    const mode = is3d ? 'simple' : '3d'
    savePref(mode)
    setView((v) => ({ ...v, mode, notice: false }))
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader mode={view.mode} canToggle={view.glOk} onToggle={toggle} />
      {is3d ? (
        <>
          <WorldBoundary onError={fail}>
            <Suspense fallback={null}>
              <World onFail={fail} />
            </Suspense>
          </WorldBoundary>
          <Loader />
          <WorldOverlay />
        </>
      ) : (
        <SimpleView notice={view.notice} />
      )}
    </>
  )
}
