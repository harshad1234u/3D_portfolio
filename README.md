# Harshad R — 3D portfolio

Work in progress. Concept and roadmap: [PLAN.md](PLAN.md). Approved changes: [DECISIONS.md](DECISIONS.md).

## Setup

```bash
npm install
npm run dev       # local dev server
npm run lint
npm run build     # type-check, build to dist/, create dist/404.html
npm run preview   # serve the built site
npm run strip-meta  # remove EXIF/metadata from images in public/
```

Requires Node 20+ (developed on Node 24).

## Deployment

GitHub Actions builds and deploys `dist/` to GitHub Pages on every push to `main`
(`.github/workflows/deploy.yml`). Full GitHub and DNS settings are documented at the launch milestone.
