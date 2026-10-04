import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BASE: '/' on the custom domain; '/<repo>/' while testing on github.io.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  build: { sourcemap: false },
})
