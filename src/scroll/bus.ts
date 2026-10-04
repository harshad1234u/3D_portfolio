// Lets the shell (nav) ask the lazily loaded world to scroll, without importing Lenis/GSAP.
type ScrollFn = (el: HTMLElement) => void

let impl: ScrollFn | null = null

export function setScroller(fn: ScrollFn | null) {
  impl = fn
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (impl) impl(el)
  else el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  history.replaceState(null, '', `#${id}`)
  // Move keyboard focus with the visitor, without a second jump.
  el.focus({ preventScroll: true })
}
