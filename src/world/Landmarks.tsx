import { useFrame } from '@react-three/fiber'
import { useMemo, useRef, type ReactNode } from 'react'
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Group,

  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
  type Material,
} from 'three'
import { clay, U } from './materials'
import { glow, palette } from './palette'
import Static from './Static'

const CANVAS_COLORS = ['#d9774f', '#7c6baf', '#9db59a']
const MIST = new Color('#cfe3f0')
const beamMat = new MeshBasicMaterial({ color: '#ffe0a8', transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, side: DoubleSide })

// One hand-composed set per section, built from primitives (no downloaded models).
const mat = {
  paper: clay('#f6ebdd'),
  clay: clay('#d9774f'),
  apricot: clay('#f2b48a'),
  sage: clay('#a9c79a'),
  plum: clay('#8f6aa8'),
  brass: clay('#e2b15c', { rim: 1.5 }),
  wood: clay('#9a6a52'),
  stone: clay('#e3c3ad'),
  canvas: CANVAS_COLORS.map((c) => clay(c)),
  bottle: clay('#cfe3d8', { rim: 2 }),
  flag: [clay('#d9774f', { wave: true }), clay('#f6ebdd', { wave: true }), clay('#a9c79a', { wave: true }), clay('#f2b48a', { wave: true })],
}

type MProps = { m: Material; p?: [number, number, number]; r?: [number, number, number]; s?: number | [number, number, number]; shadow?: boolean; children: ReactNode }
const M = ({ m, p, r, s, shadow = true, children }: MProps) => (
  <mesh material={m} position={p} rotation={r} scale={s} castShadow={shadow} receiveShadow>
    {children}
  </mesh>
)

// ---------- waterfall: scrolling stripes + mist, real-time shader ----------
const waterfallMat = new ShaderMaterial({
  transparent: true,
  depthWrite: false,
  side: DoubleSide,
  uniforms: { uTime: U.uTime, uTint: { value: new Color() } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 p = position;
      p.z += (1.0 - uv.y) * (1.0 - uv.y) * 1.6; // arc outward as it falls
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec3 uTint;
    varying vec2 vUv;
    float h(float n) { return fract(sin(n) * 43758.5453); }
    void main() {
      float col = floor(vUv.x * 9.0);
      float speed = 0.9 + h(col) * 0.6;
      float streak = smoothstep(0.35, 1.0, fract(vUv.y * 3.0 + uTime * speed + h(col + 7.0)));
      float edge = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
      float fade = smoothstep(0.0, 0.45, vUv.y);
      float a = (0.35 + streak * 0.5) * edge * fade;
      gl_FragColor = vec4(mix(uTint, vec3(1.0), 0.35 + streak * 0.4), a);
      #include <colorspace_fragment>
    }`,
})

function Waterfall({ p, r = 0 }: { p: [number, number, number]; r?: number }) {
  const geo = useMemo(() => new PlaneGeometry(1.3, 9, 1, 16).translate(0, -4.5, 0), [])
  return <mesh geometry={geo} material={waterfallMat} position={p} rotation={[0, r, 0]} renderOrder={2} />
}

// ---------- landmarks ----------

function Pier() {
  const ship = useRef<Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!ship.current) return
    ship.current.position.y = 6.5 + Math.sin(t * 0.8) * 0.35
    ship.current.rotation.z = Math.sin(t * 0.6) * 0.05
    ship.current.rotation.y = -0.5 + Math.sin(t * 0.25) * 0.08
  })
  return (
    <group>
      <Static>
      {/* deck runs off the island edge over the void */}
      <M m={mat.wood} p={[-1, 0.45, 5.2]}>
        <boxGeometry args={[2, 0.16, 6.2]} />
      </M>
      {[4.8, 7.6].map((z) =>
        [-1.9, -0.1].map((x) => (
          <M key={`${z}${x}`} m={mat.wood} p={[x, -0.2, z]}>
            <cylinderGeometry args={[0.09, 0.09, 1.6, 6]} />
          </M>
        )),
      )}
      {[-1.9, -0.1].map((x) => (
        <group key={x} position={[x, 0.55, 8]}>
          <M m={mat.wood} p={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1.2, 5]} />
          </M>
          <M m={glow.lantern} p={[0, 1.3, 0]} shadow={false}>
            <boxGeometry args={[0.22, 0.3, 0.22]} />
          </M>
        </group>
      ))}
      </Static>
      {/* tethered paper airship */}
      <group ref={ship} position={[6.5, 6.5, -4]} scale={0.85}>
        <Static>
        <M m={mat.paper} s={[2.4, 1, 1]}>
          <sphereGeometry args={[1, 20, 12]} />
        </M>
        {[-1.2, 0, 1.2].map((x) => (
          <M key={x} m={mat.brass} p={[x, 0, 0]} r={[0, Math.PI / 2, 0]} s={[1, 1, 1]}>
            <torusGeometry args={[Math.sqrt(1 - (x / 2.4) ** 2) * 1.01, 0.03, 4, 28]} />
          </M>
        ))}
        <M m={mat.clay} p={[-2.3, 0, 0]} r={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.55, 0.6, 4]} />
        </M>
        <M m={mat.wood} p={[0, -1.35, 0]}>
          <boxGeometry args={[1.1, 0.35, 0.5]} />
        </M>
        {[-0.45, 0.45].map((x) => (
          <M key={x} m={mat.wood} p={[x, -1.05, 0]} shadow={false}>
            <cylinderGeometry args={[0.015, 0.015, 0.6, 4]} />
          </M>
        ))}
        <M m={glow.lantern} p={[0.55, -1.35, 0.26]} shadow={false}>
          <boxGeometry args={[0.12, 0.12, 0.04]} />
        </M>
        </Static>
      </group>
    </group>
  )
}

function Lighthouse() {
  const beam = useRef<Group>(null)
  useFrame((_, dt) => {
    if (beam.current) beam.current.rotation.y += dt * 0.6
  })
  return (
    <group position={[-0.6, 0.4, -0.4]}>
      <Static>
      {[0, 1, 2, 3].map((i) => (
        <M key={i} m={i % 2 ? mat.clay : mat.paper} p={[0, 0.7 + i * 1.2, 0]}>
          <cylinderGeometry args={[0.95 - (i + 1) * 0.08, 0.95 - i * 0.08, 1.2, 12]} />
        </M>
      ))}
      <M m={mat.brass} p={[0, 5.15, 0]} r={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.75, 0.06, 6, 24]} />
      </M>
      <M m={glow.lamp} p={[0, 5.55, 0]} shadow={false}>
        <cylinderGeometry args={[0.5, 0.5, 0.75, 10]} />
      </M>
      <M m={mat.clay} p={[0, 6.25, 0]}>
        <coneGeometry args={[0.72, 0.75, 10]} />
      </M>
      {/* keeper's cottage */}
      <group position={[2.4, 0, 0.6]} rotation={[0, -0.5, 0]}>
        <M m={mat.paper} p={[0, 0.55, 0]}>
          <boxGeometry args={[1.6, 1.1, 1.2]} />
        </M>
        <M m={mat.clay} p={[0, 1.45, 0]} r={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.25, 0.8, 4]} />
        </M>
        <M m={glow.window} p={[0.3, 0.6, 0.61]} shadow={false}>
          <boxGeometry args={[0.3, 0.3, 0.03]} />
        </M>
      </group>
      </Static>
      <group ref={beam} position={[0, 5.55, 0]}>
        <mesh material={beamMat} position={[4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[1.2, 8, 16, 1, true]} />
        </mesh>
      </group>
    </group>
  )
}


function Easels() {
  const ref = useRef<Group>(null)
  useFrame(({ clock }) => {
    ref.current?.children.forEach((c, i) => (c.rotation.y = -0.35 + i * 0.35 + Math.sin(clock.elapsedTime * 0.5 + i) * 0.04))
  })
  return (
    <group>
      <group ref={ref}>
        {[-2.6, 0, 2.6].map((x, i) => (
          <group key={x} position={[x, 0.4, -0.4 + Math.abs(x) * 0.3]}>
            <Static>
            {[-0.45, 0.45].map((lx) => (
              <M key={lx} m={mat.wood} p={[lx, 0.9, 0.15]} r={[-0.15, 0, lx * 0.2]}>
                <cylinderGeometry args={[0.04, 0.05, 1.9, 5]} />
              </M>
            ))}
            <M m={mat.brass} p={[0, 1.7, 0]}>
              <boxGeometry args={[1.5, 1.05, 0.08]} />
            </M>
            <M m={mat.canvas[i]} p={[0, 1.7, 0.05]}>
              <boxGeometry args={[1.3, 0.85, 0.02]} />
            </M>
            </Static>
          </group>
        ))}
      </group>
      {/* stepping stones drifting off the edge */}
      <Static>
        {[0, 1, 2, 3].map((i) => (
          <M key={i} m={mat.stone} p={[-6.5 - i * 1.6, -0.2 - i * 0.35, 1.5 + i * 0.6]}>
            <cylinderGeometry args={[0.6, 0.35, 0.4, 7]} />
          </M>
        ))}
      </Static>
    </group>
  )
}

function Orrery() {
  const rings = useRef<Group>(null)
  useFrame((_, dt) => {
    const speed = 1 + U.uWind.value * 6 // spins faster while scrolling
    rings.current?.children.forEach((c, i) => (c.rotation.y += dt * (0.5 - i * 0.12) * speed))
  })
  return (
    <group position={[0, 0.4, 0]}>
      <Static>
      <M m={mat.stone} p={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.7, 1, 1, 8]} />
      </M>
      <M m={mat.brass} p={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.8, 6]} />
      </M>
      <M m={glow.lamp} p={[0, 3, 0]} shadow={false}>
        <icosahedronGeometry args={[0.5, 2]} />
      </M>
      </Static>
      <group ref={rings} position={[0, 3, 0]}>
        {[1.3, 2.1, 2.9].map((r, i) => (
          <group key={r} rotation={[0.25 * i, 0, 0.18 * (i - 1)]}>
            <Static>
            <M m={mat.brass} r={[Math.PI / 2, 0, 0]} shadow={false}>
              <torusGeometry args={[r, 0.05, 6, 64]} />
            </M>
            <M m={[mat.clay, mat.sage, mat.plum][i]} p={[r, 0, 0]}>
              <sphereGeometry args={[0.22 + i * 0.05, 14, 10]} />
            </M>
            </Static>
          </group>
        ))}
      </group>
    </group>
  )
}

function Beacons() {
  return (
    <Static>
      {[-3, 0, 3].map((x, i) => (
        <group key={x} position={[x, 0.4, -0.8 + (i === 1 ? -0.8 : 0)]}>
          <M m={mat.stone} p={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.35, 0.5, 2.2, 6]} />
          </M>
          <M m={mat.brass} p={[0, 2.25, 0]}>
            <cylinderGeometry args={[0.55, 0.4, 0.15, 6]} />
          </M>
          <M m={glow.crystal} p={[0, 2.9, 0]} s={[1, 1.7, 1]} shadow={false}>
            <octahedronGeometry args={[0.38, 0]} />
          </M>
        </group>
      ))}
      {/* arched footbridges between beacons */}
      {[-1.5, 1.5].map((x) => (
        <M key={x} m={mat.wood} p={[x, 0.4, -1.2]} r={[0, x > 0 ? 0.25 : -0.25, 0]}>
          <torusGeometry args={[1.25, 0.1, 5, 14, Math.PI]} />
        </M>
      ))}
    </Static>
  )
}

const MASTS = [-3, -1, 1, 3]

function Festival() {
  return (
    <group position={[0, 0.4, 0]}>
      {/* flags stay separate: their wave shader needs each flag's own local x */}
      {MASTS.map((x, i) => (
        <mesh key={x} material={mat.flag[i]} position={[x + 0.03, 3.35, -0.5 + (i % 2) * 0.6]} castShadow>
          <planeGeometry args={[1.3, 0.75, 10, 1]} />
        </mesh>
      ))}
      <Static>
      {MASTS.map((x, i) => (
        <group key={x} position={[x, 0, -0.5 + (i % 2) * 0.6]}>
          <M m={mat.wood} p={[0, 1.9, 0]}>
            <cylinderGeometry args={[0.06, 0.08, 3.8, 6]} />
          </M>
          <M m={mat.brass} p={[0, 3.85, 0]}>
            <sphereGeometry args={[0.1, 8, 6]} />
          </M>
        </group>
      ))}
      {/* string lights between masts */}
      {Array.from({ length: 21 }, (_, k) => {
        const x = -3 + (k / 20) * 6
        const sag = Math.sin(((k % 7) / 6) * Math.PI) * 0.35
        return (
          <M key={k} m={glow.lantern} p={[x, 2.9 - sag, -0.5 + (Math.floor(k / 7) % 2) * 0.6 * ((k % 7) / 6)]} shadow={false}>
            <sphereGeometry args={[0.06, 6, 4]} />
          </M>
        )
      })}
      </Static>
    </group>
  )
}

function Archive() {
  const tablets = useRef<Group>(null)
  useFrame((_, dt) => {
    if (tablets.current) tablets.current.rotation.y += dt * (0.15 + U.uWind.value * 1.5)
  })
  return (
    <group position={[0, 0.4, 0]}>
      <Static>
      <M m={mat.paper} p={[0, 1.4, 0]}>
        <cylinderGeometry args={[1.3, 1.45, 2.8, 14]} />
      </M>
      <M m={mat.clay} p={[0, 2.8, 0]}>
        <sphereGeometry args={[1.32, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </M>
      <M m={mat.brass} p={[0, 4.2, 0]}>
        <coneGeometry args={[0.12, 0.5, 6]} />
      </M>
      <M m={glow.window} p={[0, 0.7, 1.42]} shadow={false}>
        <boxGeometry args={[0.55, 1, 0.05]} />
      </M>
      </Static>
      <group ref={tablets} position={[0, 3.2, 0]}>
        <Static>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2
          return (
            <group key={i} position={[Math.cos(a) * 2.6, Math.sin(i * 1.7) * 0.4, Math.sin(a) * 2.6]} rotation={[0, -a + Math.PI / 2, 0.1]}>
              <M m={mat.brass}>
                <boxGeometry args={[0.62, 0.82, 0.06]} />
              </M>
              <M m={mat.paper} p={[0, 0, 0.035]}>
                <boxGeometry args={[0.5, 0.7, 0.02]} />
              </M>
            </group>
          )
        })}
        </Static>
      </group>
    </group>
  )
}

function Harbour() {
  const boat = useRef<Group>(null)
  useFrame(({ clock }) => {
    if (!boat.current) return
    boat.current.position.y = -0.3 + Math.sin(clock.elapsedTime * 0.9) * 0.15
    boat.current.rotation.z = Math.sin(clock.elapsedTime * 0.7) * 0.06
  })
  return (
    <group>
      <Static>
      <M m={mat.wood} p={[0, 0.5, 4.8]}>
        <boxGeometry args={[6.5, 0.18, 2]} />
      </M>
      {[-2.8, -0.95, 0.95, 2.8].map((x) => (
        <group key={x} position={[x, 0.6, 5.6]}>
          <M m={mat.wood} p={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 1.5, 6]} />
          </M>
          <M m={glow.lantern} p={[0, 1.6, 0]} shadow={false}>
            <boxGeometry args={[0.26, 0.34, 0.26]} />
          </M>
        </group>
      ))}
      {/* message in a bottle for the email */}
      <M m={mat.bottle} p={[1.6, 0.75, 4.4]} r={[0, 0, Math.PI / 2.3]}>
        <cylinderGeometry args={[0.16, 0.16, 0.6, 10]} />
      </M>
      </Static>
      <group ref={boat} position={[-6.2, -0.3, 5.4]} rotation={[0, 0.4, 0]}>
        <Static>
        {/* half-cylinder hull lying along x, open side up */}
        <M m={mat.wood} r={[0, 0, -Math.PI / 2]} s={[0.55, 1, 1]}>
          <cylinderGeometry args={[0.8, 0.8, 2.6, 10, 1, false, 0, Math.PI]} />
        </M>
        <M m={mat.wood} p={[0, 1.1, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 2.2, 5]} />
        </M>
        <mesh material={mat.paper} position={[0.45, 1.35, 0]}>
          <planeGeometry args={[0.8, 1.3]} />
        </mesh>
        </Static>
      </group>
    </group>
  )
}

const SETS = [Pier, Lighthouse, Easels, Orrery, Beacons, Festival, Archive, Harbour]
const FALLS: Record<number, { p: [number, number, number]; r: number }> = {
  1: { p: [4.6, 0.35, 3.2], r: 0.95 },
  4: { p: [-4.7, 0.35, 3], r: -0.9 },
  7: { p: [4.8, 0.35, 2.6], r: 1.1 },
}

export default function Landmarks({ index }: { index: number }) {
  const Set = SETS[index]
  const fall = FALLS[index]
  return (
    <>
      <Set />
      {fall && <Waterfall p={fall.p} r={fall.r} />}
    </>
  )
}

// Waterfall tint follows the sky (called once per frame from the World).
export function updateLandmarks() {
  waterfallMat.uniforms.uTint.value.copy(palette.horizon).lerp(MIST, 0.5)
  beamMat.opacity = 0.02 + palette.night * 0.16
  beamMat.visible = beamMat.opacity > 0.03
}


