import { advance } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { setScroller } from '../scroll/bus'
import { stationAt } from '../scroll/station'
import { SECTIONS } from '../sections'

// One clock: GSAP's ticker drives Lenis, then the station value, then the R3F render (frameloop="never").
// s = station (0..7), v = scroll velocity in px/frame (drives wind, spin, drift).
export const scrollState = { s: 0, v: 0 }

// A section "arrives" when its top is this far down the viewport, and the camera "departs"
// for the next island once its bottom has risen to this fraction of the viewport.
// Portrait screens keep the panel in the lower half so the island stays visible above it.
const portrait = () => innerHeight > innerWidth
const arriveAt = () => (portrait() ? 0.55 : 0.2)
const departAt = () => (portrait() ? 0.4 : 0.55)

export function startClock(reduced: boolean) {
  gsap.registerPlugin(ScrollTrigger)
  const lenis = reduced ? null : new Lenis({ autoRaf: false, lerp: 0.09 })

  let offsets: number[] = []
  let departs: number[] = []
  let maxScroll = 0
  const measure = () => {
    const arrive = innerHeight * arriveAt()
    const depart = innerHeight * departAt()
    const rects = SECTIONS.map((d) => document.getElementById(d.id)?.getBoundingClientRect())
    offsets = rects.map((r) => (r ? Math.max(0, r.top + scrollY - arrive) : 0))
    departs = rects.map((r) => (r ? Math.max(0, r.bottom + scrollY - depart) : 0))
    maxScroll = document.documentElement.scrollHeight - innerHeight
  }
  ScrollTrigger.addEventListener('refresh', measure)
  measure()
  document.fonts.ready.then(() => ScrollTrigger.refresh())

  lenis?.on('scroll', ScrollTrigger.update)

  let lastY = scrollY
  const tick = (time: number) => {
    lenis?.raf(time * 1000)
    const y = lenis ? lenis.scroll : scrollY
    scrollState.v = y - lastY
    lastY = y
    scrollState.s = stationAt(y, offsets, departs, maxScroll)
    // With frameloop="never", R3F takes this timestamp in seconds (it becomes clock.elapsedTime).
    advance(time)
  }
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  setScroller((el) => {
    const i = SECTIONS.findIndex((d) => d.id === el.id)
    const target = i >= 0 ? offsets[i] : el
    if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) })
    else scrollTo(0, typeof target === 'number' ? target : el.offsetTop)
  })

  if (location.hash) {
    const el = document.getElementById(location.hash.slice(1))
    if (el && lenis) lenis.scrollTo(el, { immediate: true })
    else el?.scrollIntoView()
  }

  return () => {
    gsap.ticker.remove(tick)
    lenis?.destroy()
    ScrollTrigger.removeEventListener('refresh', measure)
    ScrollTrigger.getAll().forEach((t) => t.kill())
    setScroller(null)
  }
}
