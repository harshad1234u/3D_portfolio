import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DirectionalLight, Fog, HemisphereLight } from 'three'
import { setStage } from '../loading'
import { scrollState, startClock } from './clock'
import Islands from './Islands'
import { palette, samplePalette } from './palette'
import { newMonitor, sampleFrame, stepTier, TIERS, type Tier } from './quality'
import Rig from './Rig'
import Sky from './Sky'

setStage(1)

const DPR: Record<Tier, [number, number]> = { low: [1, 1], mid: [1, 1.25], high: [1, 1.5] }
const CLOUDS: Record<Tier, number> = { low: 24, mid: 42, high: 60 }

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

// Lights, fog and palette, all driven by the station value each frame.
function Atmosphere({ shadows }: { shadows: boolean }) {
  const sun = useRef<DirectionalLight>(null)
  const hemi = useRef<HemisphereLight>(null)
  const fog = useRef<Fog>(null)
  const firstFrame = useRef(true)

  useFrame(({ camera }) => {
    samplePalette(scrollState.s)
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
    }
    if (firstFrame.current) {
      firstFrame.current = false
      setStage(3)
    }
  })

  return (
    <>
      <fog ref={fog} attach="fog" args={['#ffb48a', 40, 190]} />
      <hemisphereLight ref={hemi} intensity={1.1} />
      <directionalLight
        ref={sun}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-far={140}
        shadow-bias={-0.0005}
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

  useEffect(() => startClock(reduced), [reduced])
  useEffect(() => {
    document.documentElement.dataset.quality = tier
  }, [tier])

  return (
    <Canvas
      className="world-canvas"
      aria-hidden="true"
      frameloop="never"
      flat
      dpr={DPR[tier]}
      shadows={tier === 'high' ? 'percentage' : false}
      camera={{ fov: 45, near: 0.1, far: 800, position: [-5, -5, 30] }}
      gl={{ antialias: tier !== 'low', powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        setStage(2)
        gl.domElement.addEventListener('webglcontextlost', onFail, { once: true })
      }}
    >
      {!pinned && <QualityMonitor onStep={(d) => setTier((t) => clampTier(stepTier(t, d)))} />}
      <Atmosphere shadows={tier === 'high'} />
      <Sky />
      <Islands clouds={CLOUDS[tier]} />
      <Rig reduced={reduced} />
    </Canvas>
  )
}
