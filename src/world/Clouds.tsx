import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import { Color, Group, IcosahedronGeometry, InstancedMesh, Mesh, Object3D, PlaneGeometry, ShaderMaterial } from 'three'
import { bakeAO, clay, U } from './materials'
import { palette } from './palette'
import { rng } from './rng'

// ---------- cloud banks: three depth bands that parallax naturally as the camera travels ----------

const puff = bakeAO(new IcosahedronGeometry(1, 1), 0.3, { top: '#fff8f0', bottom: '#dcc6d8' })
const puffMat = clay('#ffffff', { vertexColors: true, rim: 1.6 })

type Band = { clusters: number; xMin: number; xMax: number; yMin: number; yMax: number; scale: number }
const BANDS: Band[] = [
  { clusters: 12, xMin: 26, xMax: 44, yMin: -7, yMax: 5, scale: 1.4 }, // near
  { clusters: 14, xMin: 55, xMax: 95, yMin: -12, yMax: 10, scale: 3 }, // mid
  { clusters: 10, xMin: 120, xMax: 190, yMin: -25, yMax: 18, scale: 6.5 }, // far
]

function CloudBand({ band, seed, density }: { band: Band; seed: number; density: number }) {
  const ref = useRef<InstancedMesh>(null)
  const count = Math.round(band.clusters * density) * 6
  useLayoutEffect(() => {
    const rand = rng(seed)
    const d = new Object3D()
    for (let c = 0, i = 0; i < count; c++) {
      const side = c % 2 ? 1 : -1
      const cx = side * (band.xMin + rand() * (band.xMax - band.xMin))
      const cy = band.yMin + rand() * (band.yMax - band.yMin)
      const cz = 30 - rand() * 300
      for (let k = 0; k < 6 && i < count; k++, i++) {
        // a flat-bottomed cluster: big puffs in the middle, small ones at the ends
        const t = k / 5 - 0.5
        const s = band.scale * (1.1 - Math.abs(t) * 0.9) * (0.8 + rand() * 0.4)
        d.position.set(cx + t * band.scale * 3.2, cy + s * 0.35 + rand() * band.scale * 0.3, cz + (rand() - 0.5) * band.scale * 1.5)
        d.scale.set(s * 1.2, s, s)
        d.rotation.set(0, rand() * 6.28, 0)
        d.updateMatrix()
        ref.current!.setMatrixAt(i, d.matrix)
      }
    }
    ref.current!.instanceMatrix.needsUpdate = true
  }, [band, seed, count])
  return <instancedMesh ref={ref} args={[puff, puffMat, count]} />
}

// ---------- cloud sea: two noise layers below the islands (layered fog) ----------

const seaShader = (opacity: number, scale: number) =>
  new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    uniforms: { uTime: U.uTime, uLow: { value: new Color() }, uHigh: { value: new Color() }, uHorizon: { value: new Color() } },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uLow;
      uniform vec3 uHigh;
      uniform vec3 uHorizon;
      varying vec3 vWorld;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
        return v;
      }
      void main() {
        vec2 p = vWorld.xz * ${scale.toFixed(4)} + vec2(uTime * 0.012, uTime * 0.006);
        float n = fbm(p);
        float d = length(vWorld.xz - cameraPosition.xz);
        vec3 col = mix(uLow, uHigh, smoothstep(0.3, 0.8, n));
        col = mix(col, uHorizon, smoothstep(60.0, 340.0, d));
        float a = smoothstep(0.32, 0.7, n) * ${opacity.toFixed(2)} * (1.0 - smoothstep(320.0, 440.0, d));
        gl_FragColor = vec4(col, a);
        #include <colorspace_fragment>
      }`,
  })

const WHITE = new Color('#fff4ea')
const seas = [seaShader(0.95, 0.018), seaShader(0.55, 0.03)]
const seaGeo = new PlaneGeometry(900, 900).rotateX(-Math.PI / 2)

export default function Clouds({ density, seaLayers }: { density: number; seaLayers: number }) {
  const bands = useRef<Group>(null)
  const sea = useRef<Group>(null)

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime
    // Bands drift at different speeds (more parallax depth); scrolling stirs them a little.
    bands.current?.children.forEach((b, i) => {
      b.position.x = Math.sin(t * 0.04 + i * 2) * (2 + i * 3) + U.uWind.value * (i + 1) * 4
    })
    sea.current?.children.forEach((m) => {
      ;(m as Mesh).position.x = camera.position.x
      ;(m as Mesh).position.z = camera.position.z
    })
    for (const s of seas) {
      s.uniforms.uLow.value.copy(palette.bottom)
      s.uniforms.uHigh.value.copy(WHITE).lerp(palette.horizon, 0.45 + palette.night * 0.5).multiplyScalar(1 - palette.night * 0.35)
      s.uniforms.uHorizon.value.copy(palette.horizon)
    }
  })

  return (
    <>
      <group ref={bands}>
        {BANDS.map((b, i) => (
          <CloudBand key={i} band={b} seed={101 + i * 17} density={density} />
        ))}
      </group>
      <group ref={sea}>
        {seas.slice(0, seaLayers).map((m, i) => (
          <mesh key={i} geometry={seaGeo} material={m} position={[0, i ? -15 : -24, 0]} renderOrder={1} />
        ))}
      </group>
    </>
  )
}
