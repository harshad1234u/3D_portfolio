import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from the domain root on Vercel, so Vite's default base ('/') applies.
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    // Never inline fonts as data: URIs (keeps the CSP's font-src 'self', and unused subsets out of the CSS).
    assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined),
  },
})
