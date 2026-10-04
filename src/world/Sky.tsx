import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { BackSide, BufferAttribute, BufferGeometry, Color, Group, PointsMaterial, ShaderMaterial, Vector3 } from 'three'
import { U } from './materials'
import { palette } from './palette'
import { rng } from './rng'

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
  uniform float uTime;
  uniform float uRays;
  varying vec3 vDir;
  void main() {
    vec3 dir = normalize(vDir);
    float h = dir.y;
    vec3 col = mix(uHorizon, uTop, smoothstep(0.0, 0.55, h));
    col = mix(uBottom, col, smoothstep(-0.35, 0.02, h));
    float sd = max(dot(dir, uSunDir), 0.0);
    col += uSunColor * (pow(sd, 900.0) * 1.2 + pow(sd, 14.0) * 0.3);
    // Crepuscular rays: soft angular streaks fanning out around the sun, slowly turning.
    vec3 t1 = normalize(cross(uSunDir, vec3(0.0, 1.0, 0.0)));
    vec3 t2 = cross(t1, uSunDir);
    vec3 q = dir - uSunDir * dot(dir, uSunDir);
    float ang = atan(dot(q, t2), dot(q, t1));
    float streaks = pow(0.5 + 0.5 * sin(ang * 11.0 + sin(ang * 4.0 + uTime * 0.05) * 2.5), 5.0);
    float near = smoothstep(0.55, 0.98, dot(dir, uSunDir)) * smoothstep(-0.15, 0.1, h);
    col += uSunColor * streaks * near * 0.22 * uRays;
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
    uTime: U.uTime,
    uRays: { value: 1 },
  },
})

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
    u.uRays.value = 1 - palette.night // sun rays only; the moon gets glow, not rays
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
