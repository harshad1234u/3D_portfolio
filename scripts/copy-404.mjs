// SPA fallback for GitHub Pages: unknown paths serve the app shell.
import { copyFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')
