import assert from 'node:assert/strict'
import { test } from 'node:test'
import { stationAt } from './station.ts'

const offsets = [0, 1000, 2000, 3000]

test('maps scroll position to fractional station', () => {
  assert.equal(stationAt(0, offsets, 3500), 0)
  assert.equal(stationAt(500, offsets, 3500), 0.5)
  assert.equal(stationAt(1000, offsets, 3500), 1)
  assert.equal(stationAt(2750, offsets, 3500), 2.75)
  assert.equal(stationAt(9999, offsets, 3500), 3)
})

test('last station is reached at page end when its top cannot reach the viewport top', () => {
  // maxScroll 2600 < last offset 3000: station 3 maps to 2600
  assert.equal(stationAt(2300, offsets, 2600), 2.5)
  assert.equal(stationAt(2600, offsets, 2600), 3)
})

test('handles empty and negative input', () => {
  assert.equal(stationAt(100, [], 0), 0)
  assert.equal(stationAt(-50, offsets, 3500), 0)
})
