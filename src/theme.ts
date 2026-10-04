// Colour theme: ?theme=a "Blue hour" (default) or ?theme=b "Graphite and teal".
// CSS reads it from <html data-theme>, the 3D scene from `theme`.
export type Theme = 'a' | 'b'

export const theme: Theme = new URLSearchParams(location.search).get('theme') === 'b' ? 'b' : 'a'
document.documentElement.dataset.theme = theme
