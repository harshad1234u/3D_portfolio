import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import { UnsignedByteType } from 'three'

// Gentle bloom on emissive lights (lamps, windows, crystals, fireflies) plus a soft vignette.
// Its own chunk, loaded only after the first frame and only on mid/high tiers.
// Tuned for integrated GPUs (measured): half-resolution bloom with 5 mip levels and an 8-bit
// buffer cost ~1/3 of the full-resolution default.
export default function Effects({ msaa }: { msaa: number }) {
  return (
    <EffectComposer multisampling={msaa} enableNormalPass={false} frameBufferType={UnsignedByteType}>
      <Bloom mipmapBlur levels={5} resolutionScale={0.5} intensity={0.7} luminanceThreshold={0.8} luminanceSmoothing={0.25} radius={0.7} />
      <Vignette offset={0.32} darkness={0.42} />
    </EffectComposer>
  )
}
