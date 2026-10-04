// Maps a scroll position to a continuous "station" value: 0 = Hero … n-1 = last section.
// Station i runs from section i's top reaching the viewport top to section i+1's top doing so.
// The last station is reached at the end of the page even if its top can't reach the viewport top.
export function stationAt(y: number, offsets: number[], maxScroll: number): number {
  const n = offsets.length
  if (n === 0) return 0
  const tops = offsets.map((o) => Math.min(o, maxScroll))
  if (y <= tops[0]) return 0
  for (let i = 0; i < n - 1; i++) {
    const a = tops[i]
    const b = tops[i + 1]
    if (y < b) return b > a ? i + (y - a) / (b - a) : i + 1
  }
  return n - 1
}
