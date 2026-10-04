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

export const stepTier = (t: Tier, d: 'down' | 'up'): Tier =>
  TIERS[Math.min(TIERS.length - 1, Math.max(0, TIERS.indexOf(t) + (d === 'up' ? 1 : -1)))]
