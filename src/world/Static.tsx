import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { Group, Matrix4, Mesh, type BufferGeometry, type Material } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Lets landmarks be written as readable JSX, then bakes every non-moving mesh inside into
// one mesh per material (draw calls: ~150 → ~40). Children must not animate or change.
export default function Static({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null)

  useLayoutEffect(() => {
    const root = ref.current
    const parent = root?.parent
    if (!root || !parent) return
    root.updateMatrixWorld(true)
    const toRoot = new Matrix4()
    const inv = root.matrixWorld.clone().invert()
    const buckets = new Map<Material, BufferGeometry[]>()
    root.traverse((o) => {
      const m = o as Mesh
      if (!m.isMesh) return
      const geo = m.geometry.clone().applyMatrix4(toRoot.multiplyMatrices(inv, m.matrixWorld))
      const mat = m.material as Material
      if (!buckets.has(mat)) buckets.set(mat, [])
      buckets.get(mat)!.push(geo)
    })

    const baked = new Group()
    baked.position.copy(root.position)
    baked.quaternion.copy(root.quaternion)
    baked.scale.copy(root.scale)
    for (const [mat, geos] of buckets) {
      const geo = mergeGeometries(geos)
      geos.forEach((g) => g.dispose())
      if (!geo) continue
      const mesh = new Mesh(geo, mat)
      mesh.castShadow = mesh.receiveShadow = true
      baked.add(mesh)
    }
    // Originals stay mounted for React but are skipped by rendering and matrix updates.
    root.visible = false
    root.matrixWorldAutoUpdate = false
    parent.add(baked)
    return () => {
      parent.remove(baked)
      baked.children.forEach((c) => (c as Mesh).geometry.dispose())
      root.visible = true
      root.matrixWorldAutoUpdate = true
    }
  }, [])

  return <group ref={ref}>{children}</group>
}
