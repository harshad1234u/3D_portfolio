# Decisions and plan amendments

Approved answers to `PLAN.md` §0, plus changes. Where this file and `PLAN.md` disagree, **this file wins**.

## Answers
1. Project lives in this fresh repo (`harshad-portfolio`).
2. Repo names: CivicInsight AI = `CivicInsight_AI`; Facial Emotion Recognition = `realtime-facial-emotion-recognition`. LexGuard AI and CivoAI: no link (not public yet).
3. Project order: the 1–17 order from the brief, newest first.
4. Skill→project links, beyond what the tech lists give:
   - Docker → CarbonIQ (it has a Dockerfile).
   - SQL → CarbonIQ, AI Quiz App, Online Food Ordering AI Bot, Hospital Management System.
   - Git, GitHub → all 17 projects.
   - Log analysis → no project; linked to the Deloitte Cyber Job Simulation beacon in Experience.
   - Linux → shown with no linked project.
   - CNNs → CIFAKE, Facial Emotion Recognition.
   - Vite → CivicInsight AI, LexGuard AI, CarbonIQ.
   - Python → also CivoAI.
   - Prompt engineering → XtraGrad experience entry.
   - PostgreSQL via Supabase (CarbonIQ, AI Quiz App); Firebase via Firestore (PhishCatch).
5. Tooling: if TypeScript 7 breaks eslint or Vite, use the latest 6.x and report it. **Status: TypeScript 6.0.3 is installed** because `typescript-eslint@8.71.0` has the peer range `typescript >=4.8.4 <6.1.0`. Move to TS 7 when typescript-eslint supports it.
6. `harshad.me` is owned. ~~GitHub Pages with `public/CNAME` at launch~~: superseded by **Hosting (M2.7)** below. Hosting is Vercel, with no CNAME file.

## Amendments to the plan
- **No placeholder text on the public site, ever.**
  - XtraGrad (AI Intern): "Built LLM applications using prompt engineering and AI API integration."
  - CodSoft (Java Developer Intern): "Built Java applications using OOP, Collections and exception handling."
  - No dates until supplied. Deloitte (Forage, Feb 2026) keeps its stated date.
- **Skills (§6):** simple geometric totems (one primitive per domain family, not a bespoke model per skill) with the skill name always visible as a label.
- **World (§11):** procedural geometry only for now. Consider a CC0 pack only if a specific object looks weak; record its licence in `public/models/CREDITS.md`.
- **About copy:** written from the brief only: third-year CSE student, K. Ramakrishnan College of Technology, aspiring AI / cybersecurity / full-stack developer. Nothing else invented.
- **Privacy:** only the email, the five profile links and project repo links. No phone, city, marks, CGPA, resume file, or other personal data anywhere.
- **Milestone reports:** each ends with what was built, what was verified (real command output), and remaining placeholders.

## After M2
- **3D budget: 400 kB gzip** for the 3D code (world chunk + lazily loaded postprocessing chunk). Postprocessing loads only after the first frame, on idle, and only on mid/high tiers.
- `npm test` runs in CI. drei stays installed. Shadow map type is set explicitly (`PCFShadowMap`); R3F sets the removed soft type whenever `shadows` is a boolean, so it is always passed as an object.
- The remaining console warning, `THREE.Clock … deprecated`, comes from `new THREE.Clock()` inside R3F's own store; not fixable without patching the library.

## M2.5 visual upgrade
- **No video or web footage**, ever. Everything is real-time 3D: procedural geometry and shaders only (no downloaded models, so no third-party licences to credit yet).
- Stylized look: soft 3-band toon shading (darkest band 0.58, never black), shared rim light, baked vertex-colour AO; per-tier bloom on emissive lights.
- Performance decisions (measured on Intel UHD integrated graphics, 1440 px):
  - Bloom at half resolution, 5 mip levels, 8-bit buffer (full-res default cost ~30 fps).
  - High tier uses 2× MSAA in the composer (4× cost ~14 fps).
  - Shadows re-render every other frame (motion is slow enough to hide it), always on frames where the map is missing.
  - Static landmark parts are merged into one mesh per material at mount (`Static.tsx`): draw calls 240 → 163.
  - Adaptive quality steps down below 52 fps (target 60) and never steps back up after a step down.

## M2.6 professional restyle
This section replaces the visual direction of `PLAN.md` §3 (palette, type, surfaces). The world, camera and motion are unchanged.
- **Themes:** two token sets in `src/styles/tokens.css` and `src/world/palette.ts`, switched with `?theme=a|b`.
  - A "Blue hour" (default): sky goes from pale blue at the Hero (#BFD7FF → #7FA8E8) through steel blue (#3A5BA0) to navy at Contact (#0B1020). Text #F1F5F9 / #A8B3C7, accent #4F8CFF, teal #2DD4BF used sparingly.
  - B "Graphite and teal": graphite (#0F1419) and charcoal surfaces, teal accent #2DD4BF, cooler near-white text.
  - No pink, rose, orange, apricot or gold anywhere. Islands are slate rock with sage-teal grass. Windows and lanterns (#FFD58A) are the only warm light.
- **Type:** Inter (headings and body) and JetBrains Mono (index numbers, tags, dates), self-hosted through fontsource. No Google requests. Fraunces and Instrument Sans removed.
- **Surfaces:** one radius scale (14 px panels and cards, 8 px buttons and tags) and one 4-based spacing scale.
- **Frosted glass is high tier only.** Blurring the live WebGL canvas cost about 20 fps on low at 1440 on Intel UHD (90 vs 111 fps).
  - High tier: `rgba(15,23,42,0.72)` with `blur(16px) saturate(140%) brightness(0.3)`. The backdrop dimming keeps text ≥ 4.5:1 even over white cloud.
  - Low and mid tiers: the same colour at 0.92 opacity with no backdrop filter, which gives the same worst-case contrast.
- **Contrast:** measured on the rendered page. All text is ≥ 4.5:1, and large text is ≥ 3:1 at day, dusk and night positions, in both themes, both views, 1440 and 360 px, and on mid and high tiers.
- **Integrated GPUs** (Intel UHD/Iris, AMD Radeon(TM) Graphics, mobile GPUs) are recognised from the WebGL renderer string. They start on mid and are capped at mid. `?quality=` still pins a tier.
- **Adaptive monitor:**
  - It restarts its grace period when the scene recompiles (postprocessing arrives, tier switch), so one-off shader-compile hitches are not counted as a slow device.
  - Panel reveals animate opacity and position only, with no CSS blur. The project grid reveals as one block; 17 separately animated cards caused a one-time dip that made the monitor step down.
- **OG image:** `public/og.png` (1200×630) is rendered from the real hero scene with the site's own fonts, then metadata is stripped. The OG/Twitter meta tags need the final absolute URL, so they are added in M8.

## Hosting (M2.7): Vercel
This section replaces `PLAN.md` §15 (GitHub Pages).
- **Repo:** `https://github.com/harshad1234u/3D_portfolio`. Vercel's Git integration deploys `main` to production and every other branch or PR to a preview URL. Dashboard and DNS steps are in the README.
- **Base path:** Vite's default `/`. The `VITE_BASE` logic, the Pages deploy workflow and the `404.html` copy step are removed.
- **No SPA rewrite:** the site has no client-side routes (only `#section` hashes and `?query` options), so unknown paths correctly return 404.
- **`vercel.json`** (checked against the official schema at `openapi.vercel.sh/vercel.json`):
  - `framework: vite`, `installCommand: npm ci`, `buildCommand: npm run build`, `outputDirectory: dist`.
  - **Cache:** `/assets/*` (hashed JS, CSS and fonts) is `public, max-age=31536000, immutable`; `/` and `/index.html` are `no-cache`.
  - **Security headers:** `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `X-Frame-Options: DENY`.
  - **Content-Security-Policy:** `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`. Tested with the 3D view (all tiers, both themes, postprocessing, nav flights, clipboard copy) and the Simple view: zero violations.
    - To keep `font-src 'self'`, Vite never inlines fonts as `data:` URIs (`assetsInlineLimit`).
    - Adding any third-party script, font or embed later means updating this policy.
- **Node:** `.nvmrc` is 22, and CI uses it. `engines.node` is `^20.19.0 || ^22.12.0`: the floor is Vite 8's minimum, and the cap keeps Vercel on 22.x. Vercel lets `engines` override the dashboard setting, and an open range like `>=20.19` would deploy on 24.x. Set the Vercel project's Node.js version to 22.x as well. On Node 24 locally, npm prints an `EBADENGINE` warning only.
- **Images:** `strip-meta` (sharp) runs locally before committing images. It is not part of the build, which needs no native image tooling, secrets or local paths.
- **Project screenshots:** these move from `public/projects/` to `src/assets/projects/<slug>.png`, bundled through `import.meta.glob`. A missing screenshot no longer makes a request, so there are no more 404s in the console. Screenshots get hashed, immutable URLs, and file names are matched case-insensitively against the lowercase slug.
