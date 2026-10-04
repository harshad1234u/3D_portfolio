import gsap from 'gsap'

// Magnetic custom cursor: a dot that tracks the pointer and a ring that lags behind,
// snaps around links/buttons and gently pulls small targets toward the pointer.
// Fine pointers only and never under reduced motion; keyboard focus rings are untouched.

const MAGNET = 'a, button'
const PULL = 0.18 // how far a target follows the pointer
const MAX_TARGET = 260 // px — big things (cards) don't move

export function startCursor() {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const dot = document.createElement('div')
  const ring = document.createElement('div')
  dot.className = 'cursor-dot'
  ring.className = 'cursor-ring'
  dot.setAttribute('aria-hidden', 'true')
  ring.setAttribute('aria-hidden', 'true')
  document.body.append(ring, dot)
  document.documentElement.classList.add('has-cursor')

  let x = innerWidth / 2
  let y = innerHeight / 2
  let rx = x
  let ry = y
  let size = 34
  let target: HTMLElement | null = null
  let visible = false

  const release = () => {
    if (target) target.style.transform = ''
    target = null
  }

  const onMove = (e: PointerEvent) => {
    x = e.clientX
    y = e.clientY
    if (!visible) {
      visible = true
      dot.style.opacity = ring.style.opacity = '1'
    }
    const t = (e.target as Element | null)?.closest<HTMLElement>(MAGNET) ?? null
    if (t !== target) release()
    target = t
  }
  const onLeave = () => {
    visible = false
    dot.style.opacity = ring.style.opacity = '0'
    release()
  }

  // Runs on the shared GSAP ticker (the site's single clock).
  const tick = () => {
    let tx = x
    let ty = y
    let ts = 34
    if (target) {
      const r = target.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      if (r.width < MAX_TARGET) {
        target.style.transform = `translate(${(x - cx) * PULL}px, ${(y - cy) * PULL}px)`
        tx = cx + (x - cx) * 0.3
        ty = cy + (y - cy) * 0.3
        ts = Math.min(90, Math.max(r.width, r.height) + 18)
      } else ts = 54
    }
    rx += (tx - rx) * 0.2
    ry += (ty - ry) * 0.2
    size += (ts - size) * 0.2
    dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`
    ring.style.width = ring.style.height = `${size}px`
    ring.classList.toggle('cursor-ring--active', !!target)
  }

  addEventListener('pointermove', onMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  gsap.ticker.add(tick)

  return () => {
    gsap.ticker.remove(tick)
    removeEventListener('pointermove', onMove)
    document.documentElement.removeEventListener('pointerleave', onLeave)
    release()
    dot.remove()
    ring.remove()
    document.documentElement.classList.remove('has-cursor')
  }
}
