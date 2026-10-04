import { Color, MathUtils, Vector3 } from 'three'
import { theme } from '../theme'
import { clay } from './materials'

// Scene colours. Islands are cool slate and sage-teal in both themes; the sky and the accent differ.
// Windows and lanterns (#FFD58A) are the only warm lights.
const ACCENT = theme === 'b' ? '#2dd4bf' : '#4f8cff'
const ACCENT_2 = theme === 'b' ? '#4f8cff' : '#2dd4bf'
export const C = {
  accent: ACCENT,
  accent2: ACCENT_2,
  rockTop: '#64748b',
  rockBottom: '#334155',
  grassTop: '#8fb3a6',
  grassBottom: '#6b9488',
  leaf: ['#7fa89a', '#6b988c', '#94b8a8', '#5e8c80', '#a3c2b5'],
  tuft: '#9cbfb2',
  wood: '#6b5f5a',
  stone: '#94a3b8',
  wall: '#e2e8f0',
  roof: '#4a5d7e',
  steel: '#3a5ba0',
  silver: '#a8b8d0',
  mist: '#e6f0ff',
  cloudTop: '#ffffff',
  cloudBottom: '#c8d6ee',
  bird: '#334155',
  warm: '#ffd58a',
}

// Emissive materials whose glow rises at night (bloom picks them up).
export const glow = {
  window: clay(C.warm, { emissive: '#ffb547', emissiveIntensity: 0.4 }),
  crystal: clay(theme === 'b' ? '#b5f5ea' : '#cfe0ff', { emissive: ACCENT, emissiveIntensity: 0.4, rim: 1.2 }),
  lamp: clay('#eef4ff', { emissive: '#a9c6ff', emissiveIntensity: 1.2 }),
  // Saturated base + orange-leaning emissive so the lit colour stays #FFD58A-warm instead of clipping to white.
  lantern: clay(C.warm, { emissive: '#ffb547', emissiveIntensity: 0.6 }),
}
const GLOW_BASE = { window: [0.35, 1.5], crystal: [0.35, 1.1], lamp: [1.0, 2.4], lantern: [0.5, 1.4] } as const

// Sky and light keyframes along the voyage (station 0 = clear blue at the Hero, 7 = night at Contact).
type Key = {
  s: number
  top: string
  horizon: string
  bottom: string
  sun: string
  sunIntensity: number
  elevation: number // radians above horizon of the visible light (sun, later moon)
  hemiSky: string
  hemiGround: string
}

// Theme A "Blue hour": pale blue → steel blue → deep navy. No warm sky tones.
const BLUE_HOUR: Key[] = [
  { s: 0, top: '#7fa8e8', horizon: '#bfd7ff', bottom: '#a9c4ee', sun: '#f4f8ff', sunIntensity: 2.3, elevation: 0.32, hemiSky: '#dce8ff', hemiGround: '#5b6b8a' },
  { s: 2, top: '#5c82c8', horizon: '#a2bfeb', bottom: '#86a5d8', sun: '#e8f0ff', sunIntensity: 2.0, elevation: 0.22, hemiSky: '#c9daf7', hemiGround: '#4c5c7c' },
  { s: 4, top: '#3a5ba0', horizon: '#7090c8', bottom: '#4a67a0', sun: '#c9d8ff', sunIntensity: 1.35, elevation: 0.1, hemiSky: '#a3b8de', hemiGround: '#34446a' },
  { s: 5.5, top: '#16244a', horizon: '#33507f', bottom: '#1c2c52', sun: '#b8c8f0', sunIntensity: 0.6, elevation: 0.3, hemiSky: '#6f84b0', hemiGround: '#1c2a48' },
  { s: 7, top: '#0b1020', horizon: '#1c2a4a', bottom: '#0f1830', sun: '#c8d4f5', sunIntensity: 0.55, elevation: 0.45, hemiSky: '#5d6f98', hemiGround: '#0f1830' },
]

// Theme B "Graphite and teal": pale cool grey → slate → graphite.
const GRAPHITE: Key[] = [
  { s: 0, top: '#8a9aa4', horizon: '#d0d9de', bottom: '#b4c0c6', sun: '#f4f8f8', sunIntensity: 2.3, elevation: 0.32, hemiSky: '#e0e8ea', hemiGround: '#56636b' },
  { s: 2, top: '#6b7b85', horizon: '#aebbc1', bottom: '#93a1a8', sun: '#eaf1f2', sunIntensity: 2.0, elevation: 0.22, hemiSky: '#cfd9dc', hemiGround: '#4a565e' },
  { s: 4, top: '#3c4952', horizon: '#73838b', bottom: '#56646c', sun: '#d0dcdf', sunIntensity: 1.35, elevation: 0.1, hemiSky: '#a6b4ba', hemiGround: '#323d44' },
  { s: 5.5, top: '#1a2229', horizon: '#36444d', bottom: '#222c33', sun: '#bcc9cc', sunIntensity: 0.6, elevation: 0.3, hemiSky: '#728188', hemiGround: '#1d252b' },
  { s: 7, top: '#0f1419', horizon: '#212c34', bottom: '#151c22', sun: '#cbd5d8', sunIntensity: 0.55, elevation: 0.45, hemiSky: '#5f6d74', hemiGround: '#151c22' },
]

const KEYS = theme === 'b' ? GRAPHITE : BLUE_HOUR

const COLOR_KEYS = ['top', 'horizon', 'bottom', 'sun', 'hemiSky', 'hemiGround'] as const
const parsed = KEYS.map((k) => Object.fromEntries(COLOR_KEYS.map((c) => [c, new Color(k[c])])) as Record<(typeof COLOR_KEYS)[number], Color>)

export const palette = {
  top: new Color(),
  horizon: new Color(),
  bottom: new Color(),
  sun: new Color(),
  hemiSky: new Color(),
  hemiGround: new Color(),
  sunIntensity: 0,
  lightDir: new Vector3(),
  night: 0,
}

const AZIMUTH = 0.35 // light sits ahead of the voyage, slightly right

// Writes the interpolated palette for station s into `palette` (no allocations per frame).
export function samplePalette(s: number) {
  let i = 0
  while (i < KEYS.length - 2 && s > KEYS[i + 1].s) i++
  const a = KEYS[i]
  const b = KEYS[i + 1]
  const t = MathUtils.clamp((s - a.s) / (b.s - a.s), 0, 1)
  for (const c of COLOR_KEYS) palette[c].lerpColors(parsed[i][c], parsed[i + 1][c], t)
  palette.sunIntensity = MathUtils.lerp(a.sunIntensity, b.sunIntensity, t)
  const el = MathUtils.lerp(a.elevation, b.elevation, t)
  palette.lightDir.set(Math.sin(AZIMUTH) * Math.cos(el), Math.sin(el), -Math.cos(AZIMUTH) * Math.cos(el)).normalize()
  palette.night = MathUtils.smoothstep(s, 4.5, 6.5)
  for (const k of Object.keys(glow) as (keyof typeof glow)[]) {
    const [day, night] = GLOW_BASE[k]
    glow[k].emissiveIntensity = MathUtils.lerp(day, night, MathUtils.smoothstep(s, 3, 6.5))
  }
  return palette
}
