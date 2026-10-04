// Adaptive quality: steps the render tier down when frames are slow, back up when there is headroom.
// Fixed 60 fps targets (not "fraction of max refresh"), so 144 Hz screens aren't held to 100 fps.

export type Tier = 'low' | 'mid' | 'high'
export const TIERS: Tier[] = ['low', 'mid', 'high']

const GRACE = 3 // s — ignore loader, shader compile and the intro
const WINDOW = 1.5 // s per sample
const STALL = 0.25 // s — a single frame this long is a tab switch / GC / capture, not steady load
const DOWN_BELOW = 52 // fps — the target is 60; sustained 45–52 fps is not good enough
const UP_FROM = 57 // fps, for 3 consecutive windows
const MAX_UPS = 2

// Steps up only while it has never stepped down (a tier that failed once is not retried,
// which would otherwise flip-flop and hitch on every switch).
export const newMonitor = () => ({ age: 0, t: 0, n: 0, good: 0, ups: 0, downs: 0 })
export type Monitor = ReturnType<typeof newMonitor>

// Restart the grace period (after a recompile); keeps the up/down history.
export function regrace(m: Monitor) {
  m.age = m.t = m.n = m.good = 0
}

export function sampleFrame(m: Monitor, dt: number): 'down' | 'up' | null {
  if (dt > STALL) {
    m.t = 0
    m.n = 0
    return null
  }
  m.age += dt
  if (m.age < GRACE) return null
  m.t += dt
  m.n++
  if (m.t < WINDOW) return null
  const fps = m.n / m.t
  m.t = 0
  m.n = 0
  if (fps < DOWN_BELOW) {
    m.good = 0
    m.downs++
    return 'down'
  }
  if (fps >= UP_FROM && m.downs === 0 && ++m.good >= 3 && m.ups < MAX_UPS) {
    m.good = 0
    m.ups++
    return 'up'
  }
  if (fps < UP_FROM) m.good = 0
  return null
}

// Integrated / mobile GPUs, judged from the renderer string the browser reports
// (e.g. "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 ...)"). They start on mid and are capped
// there: high on Intel UHD measured ~50 fps, and stepping down from it hitches for 2–6 s.
// ponytail: name heuristic; masked renderer strings fall through to the adaptive monitor.
export const isIntegratedGpu = (renderer: string) =>
  /intel|uhd|iris|hd graphics|radeon\(tm\) graphics|vega \d+ graphics|mali|adreno|powervr/i.test(renderer)

export const stepTier =(t: Tier, d: 'down' | 'up'): Tier =>
  TIERS[Math.min(TIERS.length - 1, Math.max(0, TIERS.indexOf(t) + (d === 'up' ? 1 : -1)))]
