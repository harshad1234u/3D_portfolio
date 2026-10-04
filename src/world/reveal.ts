import { animate, inView, stagger } from 'motion'

// Staggered entrances for the 3D view's text panels (Motion, formerly Framer Motion).
// Runs only inside the lazily loaded world, so the Simple view stays static and instant.
// Items are hidden here, not in CSS: if this code never loads, everything stays visible.

const EASE = [0.22, 1, 0.36, 1] as const
const ITEMS =
  ':scope > h1, :scope > h2, :scope > h3, :scope > p, :scope > .email, :scope > .card-grid > li, :scope > .list-cards > li, :scope > .timeline > li, :scope > .skill-domains > section, :scope > .profiles > li'

export function startReveal(heroDelay: number) {
  const stations = [...document.querySelectorAll<HTMLElement>('.station')]
  const revealed = new WeakSet<HTMLElement>()
  const items = (st: HTMLElement) => [...st.querySelectorAll<HTMLElement>(ITEMS)]

  for (const st of stations) {
    for (const el of items(st)) el.style.opacity = '0'
    if (!st.classList.contains('station--top')) st.style.opacity = '0'
  }

  const reveal = (st: HTMLElement, delay = 0) => {
    if (revealed.has(st)) return
    revealed.add(st)
    if (!st.classList.contains('station--top')) animate(st, { opacity: [0, 1], y: [48, 0] }, { duration: 0.8, delay, ease: EASE })
    animate(items(st), { opacity: [0, 1], y: [22, 0], filter: ['blur(6px)', 'blur(0px)'] }, { duration: 0.65, ease: EASE, delay: stagger(0.055, { startDelay: delay + 0.12 }) })
  }

  const hero = stations.find((s) => s.classList.contains('station--top'))
  if (hero) reveal(hero, heroDelay)
  const stops = stations.filter((s) => s !== hero).map((st) => inView(st, () => reveal(st), { amount: 0.12 }))

  // Keyboard users must never land on invisible content.
  const onFocus = (e: FocusEvent) => {
    const st = (e.target as HTMLElement).closest<HTMLElement>('.station')
    if (st) reveal(st)
  }
  document.addEventListener('focusin', onFocus)

  return () => {
    stops.forEach((stop) => stop())
    document.removeEventListener('focusin', onFocus)
    for (const st of stations) {
      st.style.removeProperty('opacity')
      st.style.removeProperty('transform')
      for (const el of items(st)) ['opacity', 'transform', 'filter'].forEach((p) => el.style.removeProperty(p))
    }
  }
}
