// Decides between the 3D world and the Simple view, and remembers the visitor's choice.

export type View = { mode: 'simple' | '3d'; notice: boolean; glOk: boolean }

const KEY = 'view'

function readPref(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function savePref(mode: View['mode']) {
  try {
    localStorage.setItem(KEY, mode)
  } catch {
    /* storage blocked: choice lasts for this page only */
  }
}

// GPU name reported by the browser (empty if masked); the world uses it to pick a start tier.
export let gpuRenderer = ''

// 'software' = WebGL runs on the CPU (SwiftShader/llvmpipe), far too slow for the world.
export function webglStatus(): 'ok' | 'software' | 'unavailable' {
  try {
    const gl = document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true })
    if (!gl) return document.createElement('canvas').getContext('webgl2') ? 'software' : 'unavailable'
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = (gpuRenderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '')
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer) ? 'software' : 'ok'
  } catch {
    return 'unavailable'
  }
}

export function initialView(): View {
  const params = new URLSearchParams(location.search)
  const forced = params.has('simple') ? 'simple' : params.get('view')
  const gl = webglStatus()
  const glOk = gl === 'ok' || (gl === 'software' && forced === '3d')

  if (forced === 'simple') return { mode: 'simple', notice: false, glOk }
  if (!glOk) return { mode: 'simple', notice: true, glOk }
  if (forced === '3d') return { mode: '3d', notice: false, glOk }

  const pref = readPref()
  if (pref === 'simple' || pref === '3d') return { mode: pref, notice: false, glOk }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return { mode: 'simple', notice: false, glOk }
  return { mode: '3d', notice: false, glOk }
}
