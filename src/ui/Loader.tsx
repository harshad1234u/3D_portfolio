import { useEffect, useState } from 'react'
import { site } from '../data/content'
import { STAGES, useStage } from '../loading'

const LABELS = ['Loading the world', 'Raising the islands', 'Lighting the sky', 'Ready']
const MIN_MS = 1200
const FADE_MS = 700

// Cinematic loader: a horizon line fills with the world's real loading stages.
export default function Loader() {
  const stage = useStage()
  const [minDone, setMinDone] = useState(false)
  const [gone, setGone] = useState(false)
  const done = stage >= STAGES && minDone

  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), MIN_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setGone(true), FADE_MS)
    return () => clearTimeout(t)
  }, [done])

  if (gone) return null
  const pct = Math.round((stage / STAGES) * 100)
  return (
    <div className={`loader${done ? ' loader--out' : ''}`} role="status" aria-live="polite">
      <p className="loader-name" aria-hidden="true">
        {site.name}
      </p>
      <div className="loader-horizon" aria-hidden="true">
        <span style={{ transform: `scaleX(${stage / STAGES})` }} />
      </div>
      <p className="loader-label mono">
        {LABELS[stage]} · {pct}%
      </p>
    </div>
  )
}
