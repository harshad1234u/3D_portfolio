# Harshad R — 3D portfolio

Work in progress. Concept and roadmap: [PLAN.md](PLAN.md). Approved changes (these win over the plan): [DECISIONS.md](DECISIONS.md).

## Setup

Node 22 (see `.nvmrc`; `nvm use` picks it up). The build works on Node `^20.19.0 || ^22.12.0` (Vite 8's minimum); `npm test` needs Node 22.18+ because it runs the TypeScript tests directly.

```bash
npm ci              # install exactly what package-lock.json records
npm run dev         # local dev server
npm run lint
npm test            # node:test unit checks (scroll stations, adaptive quality)
npm run build       # type-check and build to dist/
npm run preview     # serve the built site
npm run strip-meta  # remove EXIF/metadata from images in public/ and src/assets/ (run before committing images)
```

Project screenshots go in `src/assets/projects/<slug>.png` (1600×1000, lowercase slug as in `src/data/content.ts`). They are bundled with hashed names; a project without one shows its generated cover.

### URL options

| Parameter | Effect |
|---|---|
| `?simple` or `?view=simple` | Simple view (no 3D code is downloaded) |
| `?view=3d` | 3D view, even on a software (CPU) WebGL renderer |
| `?quality=low\|mid\|high` | Pin the render tier instead of adapting |
| `?theme=a\|b` | Colour theme: `a` Blue hour (default), `b` Graphite and teal |

## Deployment (Vercel)

Vercel builds and deploys from GitHub (`harshad1234u/3D_portfolio`): every push to `main` goes to production, and every other branch or pull request gets a preview URL. GitHub Actions (`.github/workflows/ci.yml`) only checks the code: it runs `npm ci`, lint, tests and build on every push and pull request. `vercel.json` sets the framework, the build, the cache headers and the security headers.

### Vercel dashboard, one time

1. Sign in at vercel.com with GitHub, then **Add New… → Project**.
2. Under **Import Git Repository**, pick `harshad1234u/3D_portfolio`. If it isn't listed, choose **Adjust GitHub App Permissions** and grant access to that repository.
3. On the configure screen:
   - **Framework Preset:** Vite.
   - **Root Directory:** `./`.
   - **Build Command:** `npm run build`. **Output Directory:** `dist`. **Install Command:** `npm ci`. These are already in `vercel.json`, so leave the overrides off.
   - **Environment Variables:** none.
4. Click **Deploy**.
5. Open **Settings → Build and Deployment → Node.js Version** and select **22.x**. `engines` in `package.json` (`^20.19.0 || ^22.12.0`) also keeps Vercel on 22.x; a range open above 22 would make Vercel use 24.x.
6. Optional: under **Settings → Git**, keep the production branch as `main`.

Leave Vercel Analytics and Speed Insights **off**: the site has no analytics or trackers.

### Custom domain `harshad.me`

No `CNAME` file is needed; Vercel handles the domain.

1. In the project, open **Settings → Domains → Add Domain**, enter `harshad.me` and confirm.
2. Accept Vercel's prompt to also add `www.harshad.me`, and set **`www.harshad.me` to redirect to `harshad.me`** (308).
3. At your registrar's DNS panel, create the records shown on each domain card. They are project-specific, so copy them from the dashboard:
   - **Apex `harshad.me`:** an `A` record, host `@`, with the value from the card (Vercel's documented default is `76.76.21.21`).
   - **`www`:** a `CNAME` record, host `www`, with the value from the card (a project-specific `….vercel-dns-0xx.com` target).
   - Remove any other `A`, `AAAA` or `CNAME` records on `@` and `www`, for example old GitHub Pages records. Keep your MX and TXT records for email.
   - Alternative: switch the domain's nameservers to Vercel's (shown under **Nameservers**). Copy your other DNS records to Vercel first.
4. If Vercel asks you to verify the domain (it is used by another Vercel account), add the `TXT` record it shows.
5. Wait for both cards to show **Valid Configuration**. Vercel issues the HTTPS certificate automatically.
