import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DRIFT, stationAt } from './station.ts'

const arrive = [0, 1000, 2000, 3000]
const depart = [400, 1400, 2400, 3400]
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≈ ${b}`)

test('stations are exact at arrival points', () => {
  assert.equal(stationAt(0, arrive, depart, 3500), 0)
  near(stationAt(1000, arrive, depart, 3500), 1)
  near(stationAt(2000, arrive, depart, 3500), 2)
  assert.equal(stationAt(9999, arrive, depart, 3500), 3)
})

test('camera only drifts while a panel is read', () => {
  near(stationAt(200, arrive, depart, 3500), DRIFT / 2)
  near(stationAt(400, arrive, depart, 3500), DRIFT)
})

test('flight eases: slow start, fast middle, symmetric', () => {
  const s = (y: number) => stationAt(y, arrive, depart, 3500)
  near(s(700), DRIFT + (1 - DRIFT) * 0.5) // midpoint of the flight
  const early = s(460) - s(400)
  const mid = s(730) - s(670)
  assert.ok(mid > early * 3, 'middle of the flight is much faster than its start')
})

test('monotonic over the whole page', () => {
  let prev = -1
  for (let y = 0; y <= 3500; y += 7) {
    const v = stationAt(y, arrive, depart, 3500)
    assert.ok(v >= prev - 1e-12)
    prev = v
  }
})

test('last station is reached at page end when its top cannot reach the arrive point', () => {
  assert.equal(stationAt(2600, arrive, depart, 2600), 3)
})

test('handles empty, negative and missing depart input', () => {
  assert.equal(stationAt(100, [], [], 0), 0)
  assert.equal(stationAt(-50, arrive, depart, 3500), 0)
  near(stationAt(1500, [0, 1000, 2000], [], 3000), 1 + DRIFT + (1 - DRIFT) * 0.5)
})
