import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial } from 'three'
import { U } from './materials'
import { palette } from './palette'
import { rng } from './rng'

// Dust motes by day that become warm fireflies at night. One draw call, all motion on the GPU.
export default function Particles({ count }: { count: number }) {
  const dpr = useThree((s) => s.viewport.dpr)
  const { geo, mat } = useMemo(() => {
    const rand = rng(7)
    const pos = new Float32Array(count * 3)
    const seed = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * 70
      pos[i * 3 + 1] = -5 + rand() * 18
      pos[i * 3 + 2] = 25 - rand() * 290
      seed[i] = rand()
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(pos, 3))
    geo.setAttribute('aSeed', new BufferAttribute(seed, 1))
    const mat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uTime: U.uTime, uWind: U.uWind, uNight: { value: 0 }, uDpr: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        uniform float uWind;
        uniform float uNight;
        uniform float uDpr;
        varying float vTw;
        void main() {
          vec3 p = position;
          float s = aSeed * 6.2831;
          p.x += sin(uTime * 0.3 + s) * 0.8;
          p.y += sin(uTime * 0.45 + s * 2.0) * 0.9 + uWind * sin(s) * 6.0;
          p.z += cos(uTime * 0.25 + s * 3.0) * 0.8;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vTw = 0.55 + 0.45 * sin(uTime * (1.5 + aSeed * 2.5) + s);
          gl_PointSize = mix(2.2, 4.5, uNight) * uDpr * (28.0 / max(1.0, -mv.z)) * (0.6 + aSeed * 0.8);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uNight;
        varying float vTw;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          vec3 dust = vec3(1.0, 0.93, 0.85);
          vec3 fly = vec3(1.0, 0.72, 0.38);
          float strength = mix(0.28, 1.1 * vTw, uNight);
          gl_FragColor = vec4(mix(dust, fly, uNight) * a * strength, 1.0);
          #include <colorspace_fragment>
        }`,
    })
    return { geo, mat }
  }, [count])

  const ref = useRef<Points<BufferGeometry, ShaderMaterial>>(null)
  useFrame(() => {
    const u = ref.current?.material.uniforms
    if (!u) return
    u.uNight.value = palette.night
    u.uDpr.value = dpr
  })

  return <points ref={ref} geometry={geo} material={mat} renderOrder={3} />
}
