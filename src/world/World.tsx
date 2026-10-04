import { Canvas, useFrame } from '@react-three/fiber'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { AmbientLight, Color, DirectionalLight, Fog, HemisphereLight, MathUtils, PCFShadowMap } from 'three'
import { getStage, setStage, STAGES } from '../loading'
import Birds from './Birds'
import { scrollState, startClock } from './clock'
import Clouds from './Clouds'
import { startCursor } from './cursor'
import Islands from './Islands'
import { updateLandmarks } from './Landmarks'
import { U } from './materials'
import { palette, samplePalette } from './palette'
import Particles from './Particles'
import { newMonitor, sampleFrame, stepTier, TIERS, type Tier } from './quality'
import { startReveal } from './reveal'
import Rig from './Rig'
import Sky from './Sky'

setStage(1)

const Effects = lazy(() => import('./Effects'))

type TierCfg = { dpr: [number, number]; shadows: number; clouds: number; sea: number; particles: number; bloom: boolean; msaa: number }
const CFG: Record<Tier, TierCfg> = {
  low: { dpr: [1, 1], shadows: 0, clouds: 0.45, sea: 1, particles: 220, bloom: false, msaa: 0 },
  mid: { dpr: [1, 1.25], shadows: 1024, clouds: 0.75, sea: 2, particles: 450, bloom: true, msaa: 0 },
  high: { dpr: [1, 1.5], shadows: 2048, clouds: 1, sea: 2, particles: 700, bloom: true, msaa: 2 },
}

// ?quality=low|mid|high pins a tier (testing and support); otherwise it adapts.
const forcedTier = new URLSearchParams(location.search).get('quality') as Tier | null
const pinned = forcedTier !== null && TIERS.includes(forcedTier)

// Phones and small screens start low and never go above mid (lighter scene, battery).
const small = matchMedia('(pointer: coarse)').matches || innerWidth < 768

function initialTier(): Tier {
  if (pinned) return forcedTier!
  if (small) return 'low'
  return (navigator.hardwareConcurrency ?? 4) <= 4 ? 'mid' : 'high'
}

const clampTier = (t: Tier): Tier => (small && t === 'high' ? 'mid' : t)

const MOON_RIM = new Color('#7f86c8')

// Lights, fog, palette and the shared shader uniforms, all driven by scroll each frame.
function Atmosphere({ shadowSize }: { shadowSize: number }) {
  const sun = useRef<DirectionalLight>(null)
  const hemi = useRef<HemisphereLight>(null)
  const amb = useRef<AmbientLight>(null)
  const fog = useRef<Fog>(null)
  const firstFrame = useRef(true)
  const frame = useRef(0)

  useFrame(({ camera, clock, gl }, dt) => {
    // Shadows refresh every other frame (measured ~half their cost; motion is slow enough to hide it).
    // Always render it when the map doesn't exist yet (first frame, or after a tier change).
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = frame.current++ % 2 === 0 || !sun.current?.shadow.map
    samplePalette(scrollState.s)
    U.uTime.value = clock.elapsedTime
    // Scroll speed stirs the world: grass, canopies, flags, clouds, orrery, particles.
    U.uWind.value = MathUtils.damp(U.uWind.value, 0.08 + Math.min(Math.abs(scrollState.v) * 0.006, 0.45), 2, dt)
    U.uRimColor.value.copy(palette.sun).lerp(palette.horizon, 0.3).lerp(MOON_RIM, palette.night * 0.5)
    U.uRimStrength.value = 0.42 - palette.night * 0.25

    fog.current?.color.copy(palette.horizon)
    if (sun.current) {
      sun.current.color.copy(palette.sun)
      sun.current.intensity = palette.sunIntensity
      // Light (and its shadow box) travels with the camera.
      sun.current.target.position.copy(camera.position).setZ(camera.position.z - 16)
      sun.current.position.copy(sun.current.target.position).addScaledVector(palette.lightDir, 60)
      sun.current.target.updateMatrixWorld()
    }
    if (hemi.current) {
      hemi.current.color.copy(palette.hemiSky)
      hemi.current.groundColor.copy(palette.hemiGround)
      hemi.current.intensity = 1.35 - palette.night * 0.8 // night stays dark; lamps and crystals carry it
    }
    if (amb.current) amb.current.intensity = 0.25 - palette.night * 0.13
    updateLandmarks()
    if (firstFrame.current) {
      firstFrame.current = false
      setStage(3)
    }
  })

  return (
    <>
      <fog ref={fog} attach="fog" args={['#ffb48a', 45, 230]} />
      <hemisphereLight ref={hemi} intensity={1.35} />
      <ambientLight ref={amb} intensity={0.25} color="#ffe9dc" />
      <directionalLight
        ref={sun}
        castShadow={shadowSize > 0}
        shadow-mapSize={[shadowSize || 512, shadowSize || 512]}
        shadow-radius={4}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-far={150}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
    </>
  )
}

function QualityMonitor({ onStep }: { onStep: (d: 'down' | 'up') => void }) {
  const m = useRef(newMonitor())
  useFrame((_, dt) => {
    const d = sampleFrame(m.current, dt)
    if (d) onStep(d)
  })
  return null
}

export default function World({ onFail }: { onFail: () => void }) {
  const reduced = useMemo(() => matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const [tier, setTier] = useState<Tier>(initialTier)
  const [postReady, setPostReady] = useState(false)
  const cfg = CFG[tier]

  useEffect(() => startClock(reduced), [reduced])
  useEffect(() => (reduced ? undefined : startReveal(1.35)), [reduced])
  useEffect(() => startCursor(), [])
  useEffect(() => {
    document.documentElement.dataset.quality = tier
  }, [tier])

  // Postprocessing loads only after the first frame is on screen, when the browser is idle.
  useEffect(() => {
    let idle = 0
    const wait = setInterval(() => {
      if (getStage() < STAGES) return
      clearInterval(wait)
      idle = (window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200)))(() => setPostReady(true))
    }, 100)
    return () => {
      clearInterval(wait)
      ;(window.cancelIdleCallback ?? clearTimeout)(idle)
    }
  }, [])

  return (
    <Canvas
      className="world-canvas"
      aria-hidden="true"
      frameloop="never"
      flat
      dpr={cfg.dpr}
      shadows={{ enabled: cfg.shadows > 0, type: PCFShadowMap }}
      camera={{ fov: 45, near: 0.1, far: 900, position: [-5, -5, 30] }}
      gl={{ antialias: tier !== 'low', powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        setStage(2)
        gl.domElement.addEventListener('webglcontextlost', onFail, { once: true })
      }}
    >
      {!pinned && <QualityMonitor onStep={(d) => setTier((t) => clampTier(stepTier(t, d)))} />}
      <Atmosphere shadowSize={cfg.shadows} />
      <Sky />
      <Clouds key={`c-${tier}`} density={cfg.clouds} seaLayers={cfg.sea} />
      <Islands />
      <Particles count={cfg.particles} />
      <Birds />
      <Rig reduced={reduced} />
      {postReady && cfg.bloom && (
        <Suspense fallback={null}>
          <Effects msaa={cfg.msaa} />
        </Suspense>
      )}
    </Canvas>
  )
}
