import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, Vector3 } from 'three'
import { scrollState } from './clock'
import { cameraCurves, ISLANDS } from './stations'

const LAST = ISLANDS.length - 1
const INTRO_DELAY = 1.2 // s — matches the loader's minimum time
const INTRO_LENGTH = 2.6
const PARALLAX_YAW = MathUtils.degToRad(2) // mouse parallax never exceeds 2°
const PARALLAX_PITCH = MathUtils.degToRad(1.2)
const MAX_BANK = MathUtils.degToRad(7)

// Scratch objects (single camera rig, so module scope is fine and allocation-free per frame).
const target = { pos: new Vector3(), look: new Vector3() }
const vel = new Vector3()
const right = new Vector3()

// Camera follows the station value along the arcing spline: damped, banking into turns,
// breathing gently, with a mouse parallax of at most 2° and an intro lift on arrival.
export default function Rig({ reduced }: { reduced: boolean }) {
  const size = useThree((s) => s.size)
  const curves = useMemo(() => cameraCurves(size.height > size.width), [size.width, size.height])
  const pos = useRef(new Vector3())
  const look = useRef(new Vector3())
  const prev = useRef(new Vector3())
  const state = useRef({ first: true, start: -1, bank: 0, px: 0, py: 0 })

  useFrame(({ camera, pointer, clock }, dt) => {
    const st = state.current
    const t = clock.elapsedTime
    if (st.start < 0) st.start = t
    const s = reduced ? Math.round(scrollState.s) : scrollState.s
    const u = MathUtils.clamp(s / LAST, 0, 1)
    curves.pos.getPoint(u, target.pos)
    curves.look.getPoint(u, target.look)

    if (st.first || reduced) {
      pos.current.copy(target.pos)
      look.current.copy(target.look)
      prev.current.copy(target.pos)
      st.first = false
      camera.position.copy(pos.current)
      camera.lookAt(look.current)
      return
    }

    // Intro: start low under the cloud deck, rise and push in.
    const k = MathUtils.clamp((t - st.start - INTRO_DELAY) / INTRO_LENGTH, 0, 1)
    const intro = 1 - (1 - k) ** 3
    target.pos.y -= (1 - intro) * 7
    target.pos.z += (1 - intro) * 12

    // Damped follow (critically-damped feel, frame-rate independent).
    const l = 1 - Math.exp(-3 * dt)
    pos.current.lerp(target.pos, l)
    look.current.lerp(target.look, 1 - Math.exp(-3.6 * dt))

    // Breathing sway: tiny, slow, always on.
    camera.position.set(
      pos.current.x + Math.sin(t * 0.5) * 0.08,
      pos.current.y + Math.sin(t * 0.8) * 0.12,
      pos.current.z,
    )
    camera.lookAt(look.current)

    // Bank into lateral motion (relative to where the camera faces), damped.
    vel.subVectors(pos.current, prev.current).divideScalar(Math.max(dt, 1e-3))
    prev.current.copy(pos.current)
    right.set(1, 0, 0).applyQuaternion(camera.quaternion)
    const lateral = vel.dot(right)
    st.bank = MathUtils.damp(st.bank, MathUtils.clamp(-lateral * 0.012, -MAX_BANK, MAX_BANK), 2.5, dt)

    // Mouse parallax as a rotation (≤ 2° yaw, ≤ 1.2° pitch), damped.
    st.px = MathUtils.damp(st.px, pointer.x, 3, dt)
    st.py = MathUtils.damp(st.py, pointer.y, 3, dt)
    camera.rotateY(-st.px * PARALLAX_YAW)
    camera.rotateX(st.py * PARALLAX_PITCH)
    camera.rotateZ(st.bank + Math.sin(t * 0.6) * 0.004)
  })

  return null
}
