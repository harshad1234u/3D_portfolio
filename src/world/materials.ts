import {
  BufferGeometry,
  Color,
  DataTexture,
  Float32BufferAttribute,
  LinearFilter,
  MeshToonMaterial,
  RedFormat,
  type ColorRepresentation,
} from 'three'

// Shared, per-frame uniforms for every stylized material (one object, mutated by the World).
export const U = {
  uTime: { value: 0 },
  uWind: { value: 0.08 }, // grows with scroll speed
  uRimColor: { value: new Color('#e6f0ff') },
  uRimStrength: { value: 0.45 },
}

// Soft 3-band toon ramp; darkest band stays at 0.58 so shadowed clay never goes black.
const ramp = new DataTexture(new Uint8Array([148, 200, 255]), 3, 1, RedFormat)
ramp.minFilter = ramp.magFilter = LinearFilter
ramp.needsUpdate = true

type Opts = {
  vertexColors?: boolean
  wind?: boolean // sway vertices above y=0 (grass, canopies)
  flap?: boolean // flap vertices away from x=0 (bird wings)
  wave?: boolean // ripple along +x (flags)
  emissive?: ColorRepresentation
  emissiveIntensity?: number
  rim?: number // multiplier on the shared rim strength
  transparent?: boolean
  opacity?: number
}

export function clay(color: ColorRepresentation, o: Opts = {}) {
  const m = new MeshToonMaterial({
    color,
    gradientMap: ramp,
    vertexColors: o.vertexColors ?? false,
    emissive: o.emissive ?? 0x000000,
    emissiveIntensity: o.emissiveIntensity ?? 1,
    transparent: o.transparent ?? false,
    opacity: o.opacity ?? 1,
  })
  const rim = (o.rim ?? 1).toFixed(2)
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, U)
    s.vertexShader =
      'uniform float uTime;\nuniform float uWind;\n' +
      s.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        ${o.wind || o.flap || o.wave ? `
        vec4 wWorld = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        #ifdef USE_INSTANCING
          wWorld = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        #endif
        float wPhase = wWorld.x * 0.7 + wWorld.z * 0.43;` : ''}
        ${o.wind ? `
        float sway = sin(uTime * 1.6 + wPhase) * uWind * max(transformed.y, 0.0);
        transformed.x += sway;
        transformed.z += sway * 0.6;` : ''}
        ${o.flap ? `
        transformed.y += sin(uTime * 11.0 + wPhase * 3.0) * abs(transformed.x) * 0.9;` : ''}
        ${o.wave ? `
        transformed.z += sin(transformed.x * 4.0 - uTime * 5.0 + wPhase) * transformed.x * (0.12 + uWind * 0.5);` : ''}`,
      )
    s.fragmentShader =
      'uniform vec3 uRimColor;\nuniform float uRimStrength;\n' +
      s.fragmentShader.replace(
        '#include <opaque_fragment>',
        `float rimF = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 3.0);
        outgoingLight += uRimColor * uRimStrength * ${rim} * rimF;
        #include <opaque_fragment>`,
      )
  }
  // Different shader variants must not share a program cache key.
  m.customProgramCacheKey = () => `clay-${o.wind ? 1 : 0}${o.flap ? 1 : 0}${o.wave ? 1 : 0}-${rim}`
  return m
}

// Fake ambient occlusion: darken each geometry toward its base, baked once into vertex colours.
export function bakeAO(geo: BufferGeometry, strength = 0.35, tint?: { top: ColorRepresentation; bottom: ColorRepresentation }) {
  geo.computeBoundingBox()
  const { min, max } = geo.boundingBox!
  const pos = geo.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const top = new Color(tint?.top ?? '#ffffff')
  const bottom = new Color(tint?.bottom ?? '#ffffff')
  const c = new Color()
  for (let i = 0; i < pos.count; i++) {
    const h = (pos.getY(i) - min.y) / Math.max(1e-6, max.y - min.y)
    const ao = 1 - strength * (1 - Math.min(1, h / 0.45)) ** 2
    c.lerpColors(bottom, top, h).multiplyScalar(ao)
    c.toArray(colors, i * 3)
  }
  geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
  return geo
}
