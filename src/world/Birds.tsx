import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { BufferGeometry, DoubleSide, Float32BufferAttribute, InstancedMesh, Object3D } from 'three'
import { clay } from './materials'
import { ISLANDS } from './stations'

// A few small flocks circling islands; wings flap in the vertex shader.
const FLOCKS = [1, 3, 5].map((i) => ({ c: ISLANDS[i], r: 15 + i, speed: 0.1 + i * 0.01, h: 9 + i }))
const PER = 6
const V = [
  [0, 0],
  [-0.9, 0.7],
  [0.9, 0.7],
  [-1.8, 1.4],
  [1.8, 1.4],
  [0, 1.6],
] // V formation offsets (side, back)

function birdGeometry() {
  // body sliver + two wing triangles; x = span (flap amount grows with |x|)
  const v = [
    0, 0, -0.35, 0.06, 0, 0.25, -0.06, 0, 0.25, // body
    0, 0, -0.12, 0, 0, 0.15, -0.95, 0.05, 0.05, // left wing
    0, 0, 0.15, 0, 0, -0.12, 0.95, 0.05, 0.05, // right wing
  ]
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(v, 3))
  g.computeVertexNormals()
  return g
}

const geo = birdGeometry()
const mat = clay('#5a4870', { flap: true, rim: 0.4 })
mat.side = DoubleSide
const d = new Object3D()

export default function Birds() {
  const ref = useRef<InstancedMesh>(null)

  useFrame(({ clock }) => {
    const mesh = ref.current
    if (!mesh) return
    const t = clock.elapsedTime
    FLOCKS.forEach((f, k) => {
      const a = t * f.speed + k * 2.1
      const cx = f.c[0] + Math.cos(a) * f.r
      const cz = f.c[2] + Math.sin(a) * f.r
      const heading = Math.PI - a // model faces -z; this aligns it with the circle tangent
      for (let b = 0; b < PER; b++) {
        const [side, back] = V[b]
        const ox = Math.cos(heading) * side + Math.sin(heading) * back
        const oz = -Math.sin(heading) * side + Math.cos(heading) * back
        d.position.set(cx + ox, f.c[1] + f.h + Math.sin(t * 0.7 + b) * 0.25, cz + oz)
        d.rotation.set(0, heading, Math.sin(t * 0.5 + k) * 0.15)
        d.scale.setScalar(0.55)
        d.updateMatrix()
        mesh.setMatrixAt(k * PER + b, d.matrix)
      }
    })
    mesh.instanceMatrix.needsUpdate = true
  })

  return <instancedMesh ref={ref} args={[geo, mat, FLOCKS.length * PER]} frustumCulled={false} />
}
