import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { BackSide, BufferAttribute, BufferGeometry, Color, Group, PointsMaterial, ShaderMaterial, Vector3 } from 'three'
import { palette } from './palette'

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uBottom;
  uniform vec3 uSunColor;
  uniform vec3 uSunDir;
  varying vec3 vDir;
  void main() {
    vec3 dir = normalize(vDir);
    float h = dir.y;
    vec3 col = mix(uHorizon, uTop, smoothstep(0.0, 0.55, h));
    col = mix(uBottom, col, smoothstep(-0.35, 0.02, h));
    float sd = max(dot(dir, uSunDir), 0.0);
    col += uSunColor * (pow(sd, 900.0) * 1.2 + pow(sd, 14.0) * 0.3);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

const STAR_COUNT = 700

// One sky per page, so its GPU resources live at module scope and are mutated per frame.
const material = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  side: BackSide,
  depthWrite: false,
  fog: false,
  uniforms: {
    uTop: { value: new Color() },
    uHorizon: { value: new Color() },
    uBottom: { value: new Color() },
    uSunColor: { value: new Color() },
    uSunDir: { value: new Vector3() },
  },
})

// Seeded PRNG (mulberry32): same sky on every visit, no visible patterns.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const stars = (() => {
  const pos = new Float32Array(STAR_COUNT * 3)
  const v = new Vector3()
  const rand = rng(20)
  for (let i = 0; i < STAR_COUNT; i++) {
    // Upper sky only (the camera looks ahead, so keep most stars low enough to be seen).
    const a = rand() * Math.PI * 2
    const y = 0.02 + rand() * 0.6
    const r = Math.sqrt(1 - y * y)
    v.set(Math.cos(a) * r, y, Math.sin(a) * r).multiplyScalar(380)
    v.toArray(pos, i * 3)
  }
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  return {
    geo,
    mat: new PointsMaterial({ color: '#f6ebdd', size: 2.2, sizeAttenuation: false, transparent: true, depthWrite: false, fog: false }),
  }
})()

// Sky dome, sun/moon glow and stars. Follows the camera so it is always "infinitely" far.
export default function Sky() {
  const group = useRef<Group>(null)

  useFrame(({ camera }) => {
    group.current?.position.copy(camera.position)
    const u = material.uniforms
    u.uTop.value.copy(palette.top)
    u.uHorizon.value.copy(palette.horizon)
    u.uBottom.value.copy(palette.bottom)
    u.uSunColor.value.copy(palette.sun)
    u.uSunDir.value.copy(palette.lightDir)
    stars.mat.opacity = palette.night
    stars.mat.visible = palette.night > 0.01
  })

  return (
    <group ref={group}>
      <mesh material={material} renderOrder={-1}>
        <sphereGeometry args={[400, 32, 16]} />
      </mesh>
      <points geometry={stars.geo} material={stars.mat} renderOrder={-1} />
    </group>
  )
}
