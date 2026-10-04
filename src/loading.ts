import { useSyncExternalStore } from 'react'

// Real loading stages of the 3D world (no fake percentages):
// 0 fetching world code → 1 code loaded → 2 GPU context ready → 3 first frame rendered.
export const STAGES = 3
let stage = 0
const listeners = new Set<() => void>()

export const getStage = () => stage

export function setStage(n: number) {
  if (n <= stage) return
  stage = n
  listeners.forEach((l) => l())
}

export function useStage() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => stage,
    () => 0,
  )
}
