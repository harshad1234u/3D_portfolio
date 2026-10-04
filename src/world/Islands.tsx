import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  BoxGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Object3D,
  OctahedronGeometry,
  type BufferGeometry,
  type Material,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import Landmarks from './Landmarks'
import { bakeAO, clay } from './materials'
import { C, glow } from './palette'
import { rng } from './rng'
import { ISLANDS } from './stations'

// ---------- island body ----------

// Smooth, seam-free radial wobble (integer frequencies wrap cleanly at ±π).
const wobble = (a: number, seed: number) => 1 + Math.sin(a * 3 + seed) * 0.07 + Math.sin(a * 5 + seed * 1.7) * 0.05 + Math.sin(a * 9 + seed * 0.3) * 0.025

function islandGeometries(seed: number) {
  const rock = new ConeGeometry(5.9, 8.5, 16, 5)
  rock.rotateX(Math.PI)
  rock.translate(0, -4.2, 0)
  const p = rock.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const z = p.getZ(i)
    const y = p.getY(i)
    const a = Math.atan2(z, x)
    const depth = -y / 8.5 // 0 at top rim → 1 at tip
    const w = wobble(a, seed) * (1 + Math.sin(a * 11 + y * 1.3 + seed) * 0.06 * depth)
    p.setXYZ(i, x * w, y - Math.sin(a * 4 + seed) * 0.5 * depth, z * w)
  }
  rock.computeVertexNormals()
  bakeAO(rock, 0.15, { top: C.rockTop, bottom: C.rockBottom })

  const cap = new CylinderGeometry(6.1, 5.95, 0.9, 16, 1)
  const c = cap.attributes.position
  for (let i = 0; i < c.count; i++) {
    const a = Math.atan2(c.getZ(i), c.getX(i))
    const w = wobble(a, seed) * 1.02
    c.setXYZ(i, c.getX(i) * w, c.getY(i) + (c.getY(i) < 0 ? Math.sin(a * 7 + seed) * 0.18 : 0), c.getZ(i) * w)
  }
  cap.translate(0, -0.05, 0)
  cap.computeVertexNormals()
  bakeAO(cap, 0.3, { top: C.grassTop, bottom: C.grassBottom })
  return { rock, cap }
}

const islandMat = { rock: clay('#ffffff', { vertexColors: true, rim: 1.2 }), cap: clay('#ffffff', { vertexColors: true, rim: 0.6 }) }

// ---------- dressing (instanced per island) ----------

const g = {
  trunk: bakeAO(new CylinderGeometry(0.1, 0.16, 1, 5).translate(0, 0.5, 0), 0.3),
  round: bakeAO(new IcosahedronGeometry(0.75, 1).scale(1, 1.1, 1).translate(0, 1.55, 0), 0.4),
  pine: bakeAO(mergeGeometries([new ConeGeometry(0.7, 1.1, 7).translate(0, 1.2, 0), new ConeGeometry(0.5, 0.9, 7).translate(0, 1.85, 0)]), 0.4),
  tuft: bakeAO(
    mergeGeometries([
      new ConeGeometry(0.07, 0.55, 3).translate(0, 0.27, 0),
      new ConeGeometry(0.06, 0.42, 3).rotateZ(0.35).translate(0.09, 0.2, 0.02),
      new ConeGeometry(0.06, 0.45, 3).rotateZ(-0.3).translate(-0.08, 0.21, -0.03),
    ]),
    0.45,
  ),
  rock: bakeAO(new DodecahedronGeometry(0.42, 0).scale(1, 0.7, 1), 0.35),
  wall: bakeAO(new BoxGeometry(1, 0.8, 0.9).translate(0, 0.4, 0), 0.3),
  roof: bakeAO(new ConeGeometry(0.85, 0.65, 4).rotateY(Math.PI / 4).translate(0, 1.12, 0), 0.25),
  window: mergeGeometries([new BoxGeometry(0.2, 0.22, 0.03).translate(-0.24, 0.45, 0.46), new BoxGeometry(0.2, 0.22, 0.03).translate(0.24, 0.45, 0.46)]),
  crystal: bakeAO(new OctahedronGeometry(0.32, 0).scale(1, 2.4, 1).translate(0, 0.7, 0), 0.2),
}

const m = {
  wood: clay(C.wood, { vertexColors: true }),
  leaf: clay('#ffffff', { vertexColors: true, wind: true, rim: 0.9 }),
  tuft: clay(C.tuft, { vertexColors: true, wind: true, rim: 0.5 }),
  stone: clay(C.stone, { vertexColors: true }),
  wall: clay(C.wall, { vertexColors: true }),
  roof: clay(C.roof, { vertexColors: true }),
}

const LEAF = C.leaf.map((c) => new Color(c))

// What each island carries, kept clear of its landmark (inner radius) and walkways.
type Spec = { inner: number; trees: number; tufts: number; rocks: number; houses: number; crystals: number; clear?: (x: number, z: number) => boolean }
const SPECS: Spec[] = [
  { inner: 2.2, trees: 5, tufts: 34, rocks: 4, houses: 1, crystals: 0, clear: (x, z) => z > 0 && Math.abs(x + 1) < 1.8 }, // pier
  { inner: 2.4, trees: 6, tufts: 30, rocks: 5, houses: 1, crystals: 0 },
  { inner: 3.6, trees: 4, tufts: 26, rocks: 4, houses: 0, crystals: 2 },
  { inner: 3.8, trees: 3, tufts: 22, rocks: 6, houses: 0, crystals: 5 },
  { inner: 3.8, trees: 5, tufts: 28, rocks: 3, houses: 0, crystals: 3 },
  { inner: 4.0, trees: 3, tufts: 24, rocks: 3, houses: 2, crystals: 0 },
  { inner: 2.8, trees: 4, tufts: 24, rocks: 4, houses: 0, crystals: 6 },
  { inner: 3.8, trees: 4, tufts: 26, rocks: 4, houses: 1, crystals: 4, clear: (_x, z) => z > 0.6 },
]

type Item = { x: number; z: number; rot: number; s: number }

function scatter(spec: Spec, seed: number) {
  const rand = rng(seed)
  const used: Item[] = []
  const place = (n: number, minGap: number, sMin: number, sMax: number) => {
    const out: Item[] = []
    for (let tries = 0; out.length < n && tries < n * 40; tries++) {
      const a = rand() * Math.PI * 2
      const r = spec.inner + Math.sqrt(rand()) * (5.1 - spec.inner)
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r
      if (spec.clear?.(x, z)) continue
      if (used.some((u) => (u.x - x) ** 2 + (u.z - z) ** 2 < minGap * minGap)) continue
      const it = { x, z, rot: rand() * Math.PI * 2, s: sMin + rand() * (sMax - sMin) }
      out.push(it)
      used.push(it)
    }
    return out
  }
  // Big things first so small things fill around them.
  return {
    houses: place(spec.houses, 1.6, 0.9, 1.1),
    trees: place(spec.trees, 1.1, 0.8, 1.35),
    crystals: place(spec.crystals, 0.5, 0.7, 1.4),
    rocks: place(spec.rocks, 0.6, 0.6, 1.4),
    tufts: place(spec.tufts, 0.25, 0.7, 1.3),
  }
}

function Instances({ geo, mat, items, colors, shadow = true }: { geo: BufferGeometry; mat: Material; items: Item[]; colors?: Color[]; shadow?: boolean }) {
  const ref = useRef<InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return // no items: nothing is rendered
    const d = new Object3D()
    items.forEach((it, i) => {
      d.position.set(it.x, 0.35, it.z)
      d.rotation.set(0, it.rot, 0)
      d.scale.setScalar(it.s)
      d.updateMatrix()
      mesh.setMatrixAt(i, d.matrix)
      if (colors) mesh.setColorAt(i, colors[i % colors.length])
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [items, colors])
  if (!items.length) return null
  return <instancedMesh ref={ref} args={[geo, mat, items.length]} castShadow={shadow} receiveShadow />
}

function Dressing({ index }: { index: number }) {
  const d = useMemo(() => scatter(SPECS[index], index * 977 + 13), [index])
  const half = Math.ceil(d.trees.length / 2)
  const leafColors = useMemo(() => d.trees.map((_, i) => LEAF[(i * 3 + index) % LEAF.length]), [d, index])
  return (
    <>
      <Instances geo={g.trunk} mat={m.wood} items={d.trees} />
      <Instances geo={g.round} mat={m.leaf} items={d.trees.slice(0, half)} colors={leafColors} />
      <Instances geo={g.pine} mat={m.leaf} items={d.trees.slice(half)} colors={leafColors.slice(half).reverse()} />
      <Instances geo={g.tuft} mat={m.tuft} items={d.tufts} shadow={false} />
      <Instances geo={g.rock} mat={m.stone} items={d.rocks} />
      <Instances geo={g.wall} mat={m.wall} items={d.houses} />
      <Instances geo={g.roof} mat={m.roof} items={d.houses} />
      <Instances geo={g.window} mat={glow.window} items={d.houses} shadow={false} />
      <Instances geo={g.crystal} mat={glow.crystal} items={d.crystals} shadow={false} />
    </>
  )
}

function Island({ index }: { index: number }) {
  const geo = useMemo(() => islandGeometries(index * 2.3 + 1), [index])
  return (
    <group position={ISLANDS[index]}>
      <mesh geometry={geo.rock} material={islandMat.rock} castShadow receiveShadow />
      <mesh geometry={geo.cap} material={islandMat.cap} receiveShadow castShadow />
      <Dressing index={index} />
      <Landmarks index={index} />
    </group>
  )
}

export default function Islands() {
  const group = useRef<Group>(null)

  // Out-of-phase bob and a slow, slight rock on each island.
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    group.current?.children.forEach((c, i) => {
      c.position.y = ISLANDS[i][1] + Math.sin(t * 0.55 + i * 1.9) * 0.3
      c.rotation.z = Math.sin(t * 0.35 + i * 2.7) * 0.012
      c.rotation.x = Math.cos(t * 0.3 + i * 1.3) * 0.01
    })
  })

  return (
    <group ref={group}>
      {ISLANDS.map((_, i) => (
        <Island key={i} index={i} />
      ))}
    </group>
  )
}
