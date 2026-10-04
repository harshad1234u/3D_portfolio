import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, Vector3 } from 'three'
import { scrollState } from './clock'
import { cameraCurves, ISLANDS } from './stations'

const LAST = ISLANDS.length - 1
const INTRO_DELAY = 1.2 // seconds — matches the loader's minimum time
const INTRO_LENGTH = 2.4

// Scratch vectors (single camera rig, so module scope is fine and allocation-free per frame).
const target = { pos: new Vector3(), look: new Vector3() }

// Camera follows the station value along the spline, with weight, mouse parallax and an intro lift.
export default function Rig({ reduced }: { reduced: boolean }) {
  const size = useThree((s) => s.size)
  const curves = useMemo(() => cameraCurves(size.height > size.width), [size.width, size.height])
  const look = useRef(new Vector3())
  const pos = useRef(new Vector3())
  const first = useRef(true)
  const start = useRef(-1)

  useFrame(({ camera, pointer, clock }, dt) => {
    if (start.current < 0) start.current = clock.elapsedTime
    const s = reduced ? Math.round(scrollState.s) : scrollState.s
    const t = MathUtils.clamp(s / LAST, 0, 1)
    curves.pos.getPoint(t, target.pos)
    curves.look.getPoint(t, target.look)

    if (!reduced) {
      // Intro: start low under the cloud deck, rise and push in.
      const k = MathUtils.clamp((clock.elapsedTime - start.current - INTRO_DELAY) / INTRO_LENGTH, 0, 1)
      const ease = 1 - Math.pow(1 - k, 3)
      target.pos.y -= (1 - ease) * 7
      target.pos.z += (1 - ease) * 12
      // Mouse parallax, kept under ~2°.
      target.pos.x += pointer.x * 0.6
      target.pos.y += pointer.y * 0.35
    }

    if (first.current || reduced) {
      pos.current.copy(target.pos)
      look.current.copy(target.look)
      first.current = false
    } else {
      const l = 1 - Math.exp(-3.2 * dt)
      pos.current.lerp(target.pos, l)
      look.current.lerp(target.look, l)
    }
    camera.position.copy(pos.current)
    camera.lookAt(look.current)
  })

  return null
}
