# Harshad R — 3D portfolio

Work in progress. Concept and roadmap: [PLAN.md](PLAN.md). Approved changes: [DECISIONS.md](DECISIONS.md).

## Setup

```bash
npm install
npm run dev       # local dev server
npm run lint
npm test          # node:test unit checks (scroll stations, adaptive quality)
npm run build     # type-check, build to dist/, create dist/404.html
npm run preview   # serve the built site
npm run strip-meta  # remove EXIF/metadata from images in public/
```

Requires Node 22.6+ for `npm test` (runs TypeScript directly; developed on Node 24).

### URL options

| Parameter | Effect |
|---|---|
| `?simple` or `?view=simple` | Simple view (no 3D code is downloaded) |
| `?view=3d` | 3D view, even on a software (CPU) WebGL renderer |
| `?quality=low\|mid\|high` | Pin the render tier instead of adapting |
| `?theme=a\|b` | Colour theme: `a` Blue hour (default), `b` Graphite and teal |

## Deployment

GitHub Actions builds and deploys `dist/` to GitHub Pages on every push to `main`
(`.github/workflows/deploy.yml`). Full GitHub and DNS settings are documented at the launch milestone.
