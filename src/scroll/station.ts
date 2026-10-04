// Maps a scroll position to a continuous "station" value: 0 = Hero … n-1 = last section.
//
// For each section i:  arrive[i] = scroll where its panel settles into view,
//                      depart[i] = scroll where its panel is mostly read.
// Between arrive and depart the camera only drifts (DRIFT of the way), so the island stays put
// while the visitor reads; from depart to the next arrive it flies the rest with ease-in-out
// (slow start, fast middle, slow landing — the speed ramp).
// The last station is reached at the end of the page even if its top can't reach the arrive point.
export const DRIFT = 0.12

const ease = (k: number) => k * k * (3 - 2 * k)

export function stationAt(y: number, arrive: number[], depart: number[], maxScroll: number): number {
  const n = arrive.length
  if (n === 0) return 0
  const tops = arrive.map((o) => Math.min(o, maxScroll))
  if (y <= tops[0]) return 0
  for (let i = 0; i < n - 1; i++) {
    const a = tops[i]
    const b = tops[i + 1]
    if (y >= b) continue
    if (b <= a) return i + 1
    const d = Math.min(Math.max(depart[i] ?? a, a), b)
    if (y < d) return i + DRIFT * ((y - a) / (d - a))
    return i + DRIFT + (1 - DRIFT) * ease((y - d) / (b - d))
  }
  return n - 1
}
