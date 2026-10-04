import { CatmullRomCurve3, Vector3 } from 'three'

// One floating island per section, in SECTIONS order. The voyage heads into -z.
export const ISLANDS: [number, number, number][] = [
  [0, 0, 0], // hero — launch pier
  [16, 4, -34], // about — lookout
  [-8, -2, -70], // projects — causeway
  [12, 6, -104], // skills — orrery
  [-14, 2, -138], // experience — waypoints
  [8, -1, -172], // events — festival pier
  [-10, 5, -206], // certifications — archive
  [0, 0, -240], // contact — harbour
]

// Camera stations. Landscape: island sits right of centre so the left-hand panel never covers it.
// Portrait: camera pulls back and centres the island above the panels.
export function cameraCurves(portrait: boolean) {
  const pos: Vector3[] = []
  const look: Vector3[] = []
  ISLANDS.forEach(([x, y, z], i) => {
    const hero = i === 0
    if (portrait) {
      pos.push(new Vector3(x, y + (hero ? 3 : 7), z + 28))
      look.push(new Vector3(x, y + (hero ? 3 : -5), z))
    } else {
      pos.push(new Vector3(x - 5, y + (hero ? 1.5 : 3.5), z + (hero ? 18 : 16)))
      look.push(new Vector3(x - 4.5, y + (hero ? 3 : 1.5), z))
    }
  })
  return {
    pos: new CatmullRomCurve3(pos, false, 'centripetal'),
    look: new CatmullRomCurve3(look, false, 'centripetal'),
  }
}
