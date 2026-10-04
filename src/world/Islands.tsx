import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { Group, IcosahedronGeometry, InstancedMesh, MeshStandardMaterial, Object3D } from 'three'
import { ISLANDS } from './stations'

// Procedural clay-and-paper materials (shared; one shader program each).
const mat = {
  rock: new MeshStandardMaterial({ color: '#d9774f', roughness: 0.95, flatShading: true }),
  grass: new MeshStandardMaterial({ color: '#9db59a', roughness: 0.9, flatShading: true }),
  paper: new MeshStandardMaterial({ color: '#f6ebdd', roughness: 0.85, flatShading: true }),
  brass: new MeshStandardMaterial({ color: '#e2b15c', roughness: 0.4, metalness: 0.7, flatShading: true }),
  ink: new MeshStandardMaterial({ color: '#3a3557', roughness: 0.9, flatShading: true }),
  glow: new MeshStandardMaterial({ color: '#ffd2a1', emissive: '#ffb46b', emissiveIntensity: 1.5 }),
  cloud: new MeshStandardMaterial({ color: '#fff4ea', roughness: 1, flatShading: true }),
}

// M2 landmark stubs: one simple silhouette per section; real sets arrive in M3–M5.
const LANDMARKS: ReactNode[] = [
  // Hero: pier with posts
  <group key="pier">
    <mesh material={mat.paper} position={[-1, 0.9, 2.5]} castShadow>
      <boxGeometry args={[2.2, 0.25, 9]} />
    </mesh>
    {[-1, 2, 5].map((z) => (
      <mesh key={z} material={mat.ink} position={[-2, 0.5, z]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.6, 6]} />
      </mesh>
    ))}
  </group>,
  // About: lighthouse
  <group key="lighthouse">
    <mesh material={mat.paper} position={[0, 3, 0]} castShadow>
      <cylinderGeometry args={[0.8, 1.2, 5, 8]} />
    </mesh>
    <mesh material={mat.glow} position={[0, 5.8, 0]}>
      <cylinderGeometry args={[0.7, 0.7, 0.7, 8]} />
    </mesh>
    <mesh material={mat.rock} position={[0, 6.6, 0]} castShadow>
      <coneGeometry args={[1, 1, 8]} />
    </mesh>
  </group>,
  // Projects: floating frames
  <group key="frames">
    {[-3, 0, 3].map((x, i) => (
      <mesh key={x} material={i === 1 ? mat.brass : mat.paper} position={[x, 2.6 + i * 0.4, 0]} rotation={[0, -0.3, 0]} castShadow>
        <boxGeometry args={[2.2, 1.5, 0.12]} />
      </mesh>
    ))}
  </group>,
  // Skills: orrery rings
  <group key="orrery" position={[0, 3, 0]}>
    <mesh material={mat.glow}>
      <icosahedronGeometry args={[0.6, 1]} />
    </mesh>
    {[1.6, 2.4, 3.2].map((r, i) => (
      <mesh key={r} material={mat.brass} rotation={[Math.PI / 2 + i * 0.25, i * 0.4, 0]}>
        <torusGeometry args={[r, 0.06, 6, 48]} />
      </mesh>
    ))}
  </group>,
  // Experience: three beacons
  <group key="beacons">
    {[-3, 0, 3].map((x) => (
      <group key={x} position={[x, 0, x * -0.3]}>
        <mesh material={mat.paper} position={[0, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.5, 2.6, 6]} />
        </mesh>
        <mesh material={mat.glow} position={[0, 3.1, 0]}>
          <octahedronGeometry args={[0.35, 0]} />
        </mesh>
      </group>
    ))}
  </group>,
  // Events: flag masts
  <group key="masts">
    {[-3, -1, 1, 3].map((x, i) => (
      <group key={x} position={[x, 0, 0]}>
        <mesh material={mat.ink} position={[0, 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 3.8, 5]} />
        </mesh>
        <mesh material={i % 2 ? mat.paper : mat.rock} position={[0.55, 3.6, 0]}>
          <boxGeometry args={[1, 0.6, 0.03]} />
        </mesh>
      </group>
    ))}
  </group>,
  // Certifications: archive shelves
  <group key="shelves">
    {[0, 1, 2].map((i) => (
      <mesh key={i} material={i === 1 ? mat.brass : mat.paper} position={[0, 1.2 + i * 1.1, 0]} castShadow>
        <boxGeometry args={[4 - i * 0.8, 0.2, 1.2]} />
      </mesh>
    ))}
  </group>,
  // Contact: quay with lanterns
  <group key="quay">
    <mesh material={mat.paper} position={[0, 0.6, 2]} castShadow>
      <boxGeometry args={[7, 0.3, 2]} />
    </mesh>
    {[-3, -1, 1, 3].map((x) => (
      <group key={x} position={[x, 0.75, 2.6]}>
        <mesh material={mat.ink} position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.6, 5]} />
        </mesh>
        <mesh material={mat.glow} position={[0, 1.7, 0]}>
          <boxGeometry args={[0.3, 0.4, 0.3]} />
        </mesh>
      </group>
    ))}
  </group>,
]

function Island({ index, children }: { index: number; children: ReactNode }) {
  return (
    <group position={ISLANDS[index]}>
      {/* rocky underside */}
      <mesh material={mat.rock} position={[0, -3.6, 0]} rotation={[Math.PI, index, 0]} castShadow>
        <coneGeometry args={[6, 7, 7, 2]} />
      </mesh>
      {/* grassy top */}
      <mesh material={mat.grass} position={[0, 0.1, 0]} rotation={[0, index, 0]} receiveShadow>
        <cylinderGeometry args={[6, 6, 0.6, 7]} />
      </mesh>
      {children}
    </group>
  )
}

function Clouds({ count }: { count: number }) {
  const ref = useRef<InstancedMesh>(null)
  const geo = useMemo(() => new IcosahedronGeometry(1, 1), [])

  useLayoutEffect(() => {
    const dummy = new Object3D()
    // Deterministic scatter in puffs of three along the voyage, kept clear of the camera path.
    for (let i = 0; i < count; i++) {
      const puff = Math.floor(i / 3)
      const f = (puff * 0.381966) % 1
      const side = puff % 2 ? 1 : -1
      dummy.position.set(side * (26 + f * 30) + (i % 3) * 2.2, -8 + ((puff * 7) % 13), -8 - ((puff * 37) % 260))
      dummy.scale.setScalar(2.2 + ((i * 13) % 7) * 0.4)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    }
    ref.current!.instanceMatrix.needsUpdate = true
  }, [count])

  return <instancedMesh ref={ref} args={[geo, mat.cloud, count]} />
}

export default function Islands({ clouds }: { clouds: number }) {
  const group = useRef<Group>(null)

  // Gentle bob; each island offset in phase.
  useFrame(({ clock }) => {
    group.current?.children.forEach((c, i) => {
      if (i < ISLANDS.length) c.position.y = ISLANDS[i][1] + Math.sin(clock.elapsedTime * 0.6 + i * 1.7) * 0.25
    })
  })

  return (
    <>
      <group ref={group}>
        {LANDMARKS.map((l, i) => (
          <Island key={i} index={i}>
            {l}
          </Island>
        ))}
      </group>
      <Clouds key={clouds} count={clouds} />
    </>
  )
}
