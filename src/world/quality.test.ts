import assert from 'node:assert/strict'
import { test } from 'node:test'
import { newMonitor, sampleFrame, stepTier } from './quality.ts'

// Feed `seconds` of frames at `fps`, collect decisions.
function run(m: ReturnType<typeof newMonitor>, fps: number, seconds: number) {
  const out: string[] = []
  for (let i = 0; i < fps * seconds; i++) {
    const d = sampleFrame(m, 1 / fps)
    if (d) out.push(d)
  }
  return out
}

test('no decisions during the grace period', () => {
  assert.deepEqual(run(newMonitor(), 20, 2.9), [])
})

test('slow frames step down once per window, repeatedly', () => {
  const m = newMonitor()
  run(m, 60, 3) // grace
  assert.deepEqual(run(m, 30, 3.1), ['down', 'down'])
})

test('a 144 Hz screen at 60+ fps never steps down', () => {
  const m = newMonitor()
  run(m, 60, 3)
  assert.ok(!run(m, 70, 20).includes('down'))
})

test('stalls (screenshot, tab switch) are ignored', () => {
  const m = newMonitor()
  run(m, 60, 3)
  for (let i = 0; i < 10; i++) assert.equal(sampleFrame(m, 0.5), null)
  assert.ok(!run(m, 60, 3).includes('down'))
})

test('steps up after sustained headroom, at most twice', () => {
  const m = newMonitor()
  run(m, 60, 3)
  assert.deepEqual(run(m, 60, 30), ['up', 'up'])
})

test('stepTier clamps at the ends', () => {
  assert.equal(stepTier('low', 'down'), 'low')
  assert.equal(stepTier('high', 'up'), 'high')
  assert.equal(stepTier('high', 'down'), 'mid')
})
