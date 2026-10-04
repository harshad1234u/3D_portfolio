import { Color, MathUtils, Vector3 } from 'three'
import { clay } from './materials'

// Emissive materials whose glow rises at night (bloom picks them up).
export const glow = {
  window: clay('#ffe2b0', { emissive: '#ffb45e', emissiveIntensity: 0.4 }),
  crystal: clay('#c9b2f5', { emissive: '#9f80f0', emissiveIntensity: 0.4, rim: 1.2 }),
  lamp: clay('#fff1d6', { emissive: '#ffcf86', emissiveIntensity: 1.2 }),
  lantern: clay('#ffe7c2', { emissive: '#ffb86b', emissiveIntensity: 0.6 }),
}
const GLOW_BASE = { window: [0.35, 2.2], crystal: [0.4, 1.3], lamp: [1.1, 2.6], lantern: [0.5, 2.4] } as const

// Sky and light keyframes along the voyage (station 0 = sunset at the Hero, 7 = night at Contact).
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

const KEYS: Key[] = [
  { s: 0, top: '#3b2f6b', horizon: '#ffb48a', bottom: '#f2a3a0', sun: '#ffd2a1', sunIntensity: 2.4, elevation: 0.12, hemiSky: '#ffd9c0', hemiGround: '#7c6baf' },
  { s: 2, top: '#2d2660', horizon: '#f29a8e', bottom: '#c98bb0', sun: '#ffb98a', sunIntensity: 2.0, elevation: 0.05, hemiSky: '#f6c2b8', hemiGround: '#6e5c9e' },
  { s: 4, top: '#1f1b4f', horizon: '#b77aa6', bottom: '#6e5c9e', sun: '#f29a8e', sunIntensity: 1.2, elevation: -0.02, hemiSky: '#b9a3d6', hemiGround: '#3d3470' },
  { s: 5.5, top: '#14123a', horizon: '#5a4a8a', bottom: '#2a2556', sun: '#aab4ff', sunIntensity: 0.6, elevation: 0.3, hemiSky: '#7f78b8', hemiGround: '#221e48' },
  { s: 7, top: '#0b0a24', horizon: '#2e2862', bottom: '#16143a', sun: '#c3c9ff', sunIntensity: 0.55, elevation: 0.45, hemiSky: '#6a64a8', hemiGround: '#16143a' },
]

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
