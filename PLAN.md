# PLAN — Harshad R · 3D Portfolio ("Dusk Voyage")

> On approval, the first action is to save this file unchanged as `PLAN.md` in the project repo root. No code before approval.

## 0. Things you must decide / fix before Phase 2

1. **Fresh repo.** The portfolio lives in its own new repository (`harshad-portfolio`).
2. **Repo names I could not find** (so those cards ship without a link until you answer): **CivicInsight AI**, **Real-time Facial Emotion Recognition**. LexGuard AI and CivoAI: no link, as you said.
3. **Project order.** I assume your list order 1→17 is already "newest first". Confirm.
4. **Skill→project mapping** is derived only from the tech you listed per project (see §9). Docker, Linux, Git, GitHub, SQL (generic), log analysis have no project listed → they will show "no linked project yet" unless you tell me which projects used them.
5. Package versions (checked on npm today): three 0.186, @react-three/fiber 9.8, drei 10.7, postprocessing 3.1, gsap 3.15, lenis 1.3, motion/framer-motion 14, vite 8.3, react 19.3, typescript 7.0. TS 7 is brand new; if eslint/vite tooling chokes I will drop to the latest 6.x and say so.
6. Domain: `harshad.me` must be one you own and can edit DNS for.

## 1. Research (Phase 1 step 1)

Verified by web search this session (links at bottom). Anything marked *(prior knowledge)* is from memory, not re-verified. Codrops articles returned 403, so I only use their search-result summaries.

| # | Site | What makes it work | Steal / avoid |
|---|---|---|---|
| 1 | **Bruno Simon — folio-2019** | A drivable low-poly world; visitors find work by driving to it. Blender low-poly visuals + separate primitive physics bodies, custom shader materials, glTF+Draco, all models <2 MB. | Steal: tiny asset budget, "work is a *place*", physical objects as links. Avoid: physics engine (too heavy, off-brief). |
| 2 | **Henry Heffernan** | Hand-modelled room; camera flies *into* the CRT, a real HTML/CSS3D screen mapped onto the glass. | Steal: the "dive into an object" transition. Avoid: retro-computer / terminal feel (banned theme). |
| 3 | **Oryzo (Lusion)** — Awwwards SOTM Apr 2026 | One hero object with inertia; scroll moves the camera through true Z depth, not 2D layers sliding. | Steal: weighty easing, depth-first scroll. |
| 4 | **Cartier Watches & Wonders** | Six 3D "alcoves"; scroll moves between rooms, each with its own shaders and audio. | Steal: each section = its own staged room with its own lighting. |
| 5 | **Shopify Editions** | Every section is a staged moment; type scatters, panels layer in depth. | Steal: choreographed text-in/out per section. |
| 6 | **Explore Primland** | Scroll-driven aerial glide over terrain with atmospheric fog. | Steal: fog as cheap depth and perf saver. |
| 7 | **Sleep Well Creative** | Scroll beats advance narrative and visuals together. | Steal: one story arc across the page. |
| 8 | **IVRESS** | WebGPU renderer with WebGL fallback, shaders written once in TSL. | Not now: WebGL2 only for compatibility; revisit later. |
| 9 | **Aimee's Papercraft World** (R3F + Blender) | Character follows a looping path through a handcrafted world; same stack as ours. | Steal: crafted-material look beats realism on a budget. |
| 10 | **Jesse Zhou (ramen shop), Niccolò Miranda (paper)** | Explorable scene where skills/work/links are *objects in the scene*. | Steal: objects-as-content. |

**Cross-cutting findings**
- *Scroll architecture:* Lenis + GSAP ScrollTrigger is the 2026 default; one scroll source drives the camera. Known failure mode: sites with Lenis+GSAP+R3F stutter on many devices (GSAP forum thread) → drive Lenis from `gsap.ticker`, one rAF, no per-frame React state.
- *Perf hygiene:* clamp DPR to ≤2 (I will use ≤1.5), pause rendering when the canvas is off-screen or the tab is hidden, animate transforms/opacity only for DOM.
- *Profile links in 3D (thin evidence):* the patterns I found are (a) props in the world, (b) zones you drive to, (c) a screen/portal you fly into. I found no portfolio giving each platform its own *metaphor object*, so §5 is original.

## 2. Three original world concepts

**A. "Dusk Voyage" — floating clay-and-paper islands (RECOMMENDED).** A vast apricot-to-indigo sky. Camera sails along a spline between small floating islands, one per section. Scroll = time: warm sunset at the Hero deepens to starry night at Contact, where lanterns and profile objects light up.
- Why recommended: open sky means cheap depth (gradient + fog, few instanced clouds); soft clay/paper low-poly props are small to model and can be built procedurally; bloom/DOF read naturally on lanterns at night; scales to mobile by culling islands; the sunset→night arc gives the whole page one narrative and a payoff for the profile objects; nothing resembles cyber/terminal themes or Bruno's/Henry's worlds.

**B. "The Orrery" — brass-and-glass observatory.** Sections are celestial mechanisms inside a dome. Rejected: dark/brass cliché, needs transmission/glass (expensive), harder on mobile.

**C. "The Cartographer's Desk" — giant miniature workshop table, macro camera.** Rejected: too close to Henry Heffernan's "room" idea, camera range is narrow, so less "travelling through a world".

## 3. Art direction (Concept A)

- **Palette (tokens):** sky apricot `#FFC9A3` → rose `#F2A3A0` → dusty violet `#7C6BAF` → indigo `#1E1B4B`; clay terracotta `#D9774F`; paper cream `#F6EBDD`; sage `#9DB59A`; brass accent `#E2B15C`; ink `#1B1A2E`. Night phase swaps sky to indigo/near-black with warm lantern glow.
- **Light:** low warm directional sun (one 1024 shadow map on desktop; baked-style contact shadows on mobile), violet hemisphere fill, rim light on hero objects. Light colour/intensity keyframed against scroll.
- **Materials:** matte clay (roughness ~0.9), paper (thin-translucent look via emissive fake, not transmission), brass (metalness 0.8), a single frosted-glass hero object at most. No transmission on more than one mesh.
- **Type:** Fraunces (soft display serif, OFL) + Instrument Sans (UI). Self-hosted via fontsource, **no Google Fonts requests** (privacy). Hero name is extruded 3D text (Text3D, typeface JSON converted from Fraunces) with an SDF text fallback.
- **Motion language:** slow, weighty, expo/custom in-out easing; camera has faint breathing sway; mouse parallax ≤2° ; everything eases, nothing snaps (except under reduced motion).
- **Cursor:** small cream dot + ring; ring becomes a brass "lens" over interactive objects and shows a label (e.g. "Open GitHub ↗").
- **Loader:** a paper airship folds itself while progress fills a horizon line; text counts via `useProgress`; exits by the camera lifting off through cloud. Keeps minimum ~1.2 s so it reads as cinematic, never blocks past asset readiness.

## 4. Storyboard — section by section

Camera path = `CatmullRomCurve3` (position) + second curve (look-at target), sampled by one scroll progress value (0–1). Each section owns a progress range. Nav buttons call `lenis.scrollTo(sectionOffset)`, so the camera follows through the same scroll source (single source of truth).

| # | Section (place) | Camera move | 3D set | UI content (real HTML text) |
|---|---|---|---|---|
| 1 | **Hero — Launch Pier** | Start low under cloud deck, rise and push in to the pier at sunset. | Extruded clay "HARSHAD R" on a pier, tethered paper airship bobbing, distant islands in haze. | Name, "Third-year CSE student · aspiring AI / cybersecurity / full-stack developer", college, scroll cue. |
| 2 | **About — The Lookout** | Curve right and up around a lighthouse-cottage island, slow orbit. | Small cottage + lantern, desk with paper stacks, a kite. | 2–3 short paragraphs from your content only; K. Ramakrishnan College of Technology. |
| 3 | **Projects — The Causeway** | Camera locks on a straight forward-sideways track; **section is pinned**, scroll drives horizontal card travel while camera drifts laterally and slightly tilts. | A long chain of stepping-stone islets and floating frames; parallax layers of clouds and spires at 3 depths. | 17 DOM cards slide in from the right (§7). Progress bar, prev/next. |
| 4 | **Skills — The Orrery of Skills** | Pull back to a wide shot, then slow dolly into the centre. | Six concentric rings around a lamp; skill totems ride the rings; 17 project "buoys" float in the back arc (§6). | Domain label, hovered-skill panel listing projects. |
| 5 | **Experience — The Waypoints** | Glide along a bridge of three beacons, pausing at each. | Three lighthouse-style beacons that light when reached. | AI Intern (XtraGrad); Java Developer Intern (CodSoft); Deloitte Cyber Job Simulation (Forage, Feb 2026). **Dates/durations for the first two are placeholders.** |
| 6 | **Hackathons & Events — The Festival Pier** | Sweep down a pier of banner masts. | Five flag masts (PromptWars largest). Flags ripple with a vertex shader. | The five events with only your stated facts (rank #65 of 19,000+, Challenge 2 Top 100, Exclusive Edition; 150 of 768 selected, etc.). |
| 7 | **Certifications — The Archive** | Rise inside a lantern-lit archive island. | Floating shelves with engraved clay tablets that tilt toward the cursor. | Vodafone Idea Foundation Cybersecurity; Oracle Java; Microsoft Learn (cybersecurity, AI/GenAI); HackerRank (Java, Python, MySQL); NPTEL. |
| 8 | **Contact — The Harbour at Night** | Descend to a quay under stars; sky is now night. | A mail-bottle that uncorks for the email; the five profile objects (§5) as harbour landmarks, lit by lanterns. | Email (assembled in JS; copy + mailto), "Find me online" with the five real `<a>` links. |

Section transitions: HTML panels animate in with Motion (opacity/translate/blur), 3D props enter with GSAP timelines keyed to the same ScrollTrigger; sky and light keyframes interpolate continuously (no hard cuts).

## 5. Profile-link objects ("Find me online")

Layout: five objects on a quay in the Harbour section, each ~1.2 m in scene units, each with a small floating label ("GitHub", etc.) and a **real `<a href>`** in the DOM list directly below the canvas panel (keyboard/screen-reader/reduced-motion path). Brand colour appears only as a small tinted accent light/emissive band, muted to fit the palette.

| Platform | Object | Idle | Hover | Click ("dive") |
|---|---|---|---|---|
| **GitHub** | **Contribution skyline**: a 7×~20 grid of instanced clay towers (one `InstancedMesh`, heights from a deterministic pseudo-random pattern; **not real contribution data**, labelled decorative). | Slow wave of heights. | Ripple radiates from the cursor hit-point; towers lift. | Camera descends between the towers to street level, towers rise past the lens, then opens link. |
| **LinkedIn** | **Network of ~24 nodes** with instanced lines; nodes are small paper lanterns. | Gentle pulse travels along edges. | Nearest cluster brightens, edges thicken, nodes draw toward cursor. | Camera pushes into the densest node; connections streak by, then opens link. |
| **LeetCode** | **Block sorter**: ~16 stacked bars of varied height that bubble/insertion-sort themselves in a loop (real algorithm driving the animation). | Sorts, pauses sorted, reshuffles. | Speeds up and highlights the compared pair. | Blocks snap into a perfect staircase, camera climbs the staircase, then opens link. |
| **HackerRank** | **Medal**: brass hexagon medal on a ribbon, embossed with a generic hex/“H”-less mark (no trademarked logo asset). | Slow rotation on a stand. | Tilts to the cursor, specular sweep. | Medal lifts, stamps down onto a ledger plate with a camera shake + dust puff, then opens link. |
| **TryHackMe** | **Vault door**: round clay-and-brass door, concentric rings, wheel handle. | Dial ticks idly. | Rings counter-rotate, keyhole glows. | Rings align, bolts retract, door swings open, camera travels through the light, then opens link. |

**Click flow (all five):** `click` → GSAP camera dive (≤900 ms) → `window.open(url, '_blank', 'noopener,noreferrer')` → camera eases back out. Real risks:
- Browsers can block `window.open` after async delay (Safari stricter than Chrome). Mitigation: keep the dive ≤900 ms; if the open fails, show a "Continue to GitHub ↗" overlay anchor (real `<a rel="noopener noreferrer" target="_blank">`).
- Under `prefers-reduced-motion`, or on keyboard activation, **skip the dive** and let the plain anchor work.
Perf: all five are procedural (primitives, instancing, shaders), ~0 KB of GLB.

## 6. Skills — interactive 3D design (no lists, tags, badges or bars)

**"Orrery of Skills."** Six concentric rings around a central lamp, one ring per domain (Languages, AI/ML, Backend & Web, Data, Security, Tools). Each skill is a small distinctive clay/brass **totem** riding its ring (e.g., a snake-coil for Python, a cup for Java, a "C" cut-out ring for C, a neural-lattice for CNNs, a lock for prompt-injection resistance, a shield-and-hook for phishing detection). Seventeen **project buoys** float in the back arc, matching the 17 cards.
- **Idle:** rings rotate at different speeds; inner rings faster.
- **Hover (desktop) / tap (mobile):** the ring slows, the totem rises and glows, an arc of light draws to each buoy that used it, unrelated buoys dim. A side panel shows the skill and the project names.
- **Click:** pins the selection; panel gains "View in gallery" which scrolls to those cards (they get a subtle ring highlight). Click empty space to clear.
- **Cross-link:** when a card in the gallery is hovered, the Skills scene is not visible, so the reverse link shows as tech tags highlighted on the card. Tags are real text.
- **Mapping data:** one `skills.ts` file with each skill's `projectIds` computed from the tech arrays you gave (see §9). I will not guess unlisted usage.
- **Accessibility:** the same data is rendered as a visually-hidden but focusable `<button>` list; focus/hover produce identical highlighting. In Simple view it is a grouped plain text list with the project names under each skill.

## 7. Projects — pinned horizontal gallery

- ScrollTrigger pins the section; `x` of a track holding 17 cards is scrubbed from 0 to `-(trackWidth - viewport)`. Lenis drives it.
- **Card (DOM, not canvas):** image (16:10), name, 1–2 line description, tech tags, repo link (if any: `rel="noopener noreferrer"`), index "01 / 17". Cards use CSS 3D tilt toward the cursor. DOM was chosen over canvas planes for crisp text, SEO, accessibility, and cheaper rendering.
- **World reacting:** same scroll progress drives camera lateral drift (parallax by depth layer), cloud banks at 3 speeds, islets rotating slightly, hover on a card pulses its matching islet.
- **Controls:** progress bar, `← →` buttons and keyboard arrows (these scroll to the next card's pin offset), counter.
- **Order:** newest first (your list, assuming #1 = newest).
- **Images:** `<img src="/projects/<slug>.png">`; if it 404s, fall back to a **generated cover** (deterministic SVG: gradient from the palette by category, large monogram, motif glyph, project name). Every card works day one.
- **Images I need from you** (1600×1000 PNG screenshots, no personal data in frame, I will strip metadata): `civicinsight-ai`, `lexguard-ai`, `civoai`, `cifake`, `carboniq`, `phishcatch-kiosk`, `ai-quiz-app`, `facial-emotion-recognition`, `sentinelai-soc`, `face-attendance-system`, `network-scanner`, `food-ordering-ai-bot`, `voterflow`, `student-attendance-alert-system`, `hospital-management-system`, `workforce-management-system`, `tetris-game`. (Screenshots of the face-recognition projects must not show real people's faces.)

### Repository links (base `https://github.com/harshad1234u/`)

| Project | Repo | Status |
|---|---|---|
| CivicInsight AI | ? | **ASK** |
| LexGuard AI | — | no link (private) |
| CivoAI | — | no link (private) |
| CIFAKE | `CIFAKE` | ok |
| CarbonIQ | `carboniq` | ok |
| PhishCatch Kiosk | `PhishCatch-Kiosk` | ok |
| AI Quiz App | `quiz-app` | ok |
| Facial Emotion Recognition | ? | **ASK** |
| SentinelAI SOC | `SentinelAI-SOC-AI-Powered-Honeypot` | ok |
| Face Attendance System | `ATTENDENCE_USING_FACE` | ok (spelling is as on GitHub) |
| Network Scanner | `Network_scan` | ok |
| Food Ordering AI Bot | `online_Food_ordering_AIBOT` | ok |
| VoterFlow | `voterflow` | ok |
| Student Attendance Alert System | `Student-Attendance-Alert-System` | ok |
| Hospital Management System | `hospital-management-system` | ok |
| Workforce Management System | `Workforce_management_system` | ok |
| Tetris Game | `TETRIS_GAME` | ok |

Note: the text file's descriptions sometimes differ from your pasted brief (e.g. PhishCatch is "heuristic" there, "LLM" in your brief). **I use only your pasted brief for site copy.**

## 8. Stack and architecture

React 19 + TypeScript + Vite; three + R3F + drei + @react-three/postprocessing; GSAP + ScrollTrigger; Lenis; Motion (Framer Motion) for UI.

- **One clock:** `gsap.ticker.add(t => lenis.raf(t*1000))`, `gsap.ticker.lagSmoothing(0)`, Lenis→`ScrollTrigger.update`. R3F `frameloop="always"` with `advance` paused when canvas is off-screen/tab hidden.
- **Scroll→3D:** a mutable `scrollState = { progress, sectionProgress[] }` ref updated by ScrollTrigger; `useFrame` reads it. No React state per frame.
- **Lazy loading:** shell (HTML content, loader, nav, cursor) ships first; the 3D chunk (`React.lazy` + dynamic `import('three')` path), postprocessing, models and KTX2 transcoder load after first paint. Per-island assets load by proximity to scroll progress.
- **Adaptive quality:** drei `PerformanceMonitor` → 3 tiers: **high** (bloom + DOF + shadow map, DPR ≤1.5), **mid** (bloom only), **low** (no postprocessing, no shadows, DPR 1, fewer instances). Mobile starts at *low-mid*.
- **WebGL failure fallback:** feature-detect WebGL2 and software renderers (`SwiftShader`, `llvmpipe`) → auto Simple view with a one-line notice.
- **Simple view:** toggle in the nav and `?simple`; remembered in `localStorage` (wrapped in try/catch). It is the same React content components in plain CSS with **no three.js loaded**. It is also the default for `prefers-reduced-motion` *only if* the visitor has not chosen otherwise; 3D with camera cuts (no flights) remains available.
- **Email:** parts split across strings and joined at runtime, rendered into the DOM after first user interaction or idle; copy button (Clipboard API with fallback), `mailto:` link. Honest limit: this stops dumb regex scrapers, not headless browsers.
- **No source maps** (`build.sourcemap:false`), no analytics, no third-party requests, `.gitignore` covers `.env*` and `*.pdf`.

## 9. Content data model (single source: `src/data/*.ts`)

`projects.ts` (17 entries: id, slug, name, description ≤2 lines, tech[], repo?, category), `skills.ts` (domain → skill → projectIds derived from `tech[]`), `events.ts`, `experience.ts`, `certs.ts`, `links.ts` (the five profile URLs), `site.ts` (name, college, email parts). Initial skill→project examples straight from your tech lists: FastAPI → CivicInsight, LexGuard, CarbonIQ; React → CivicInsight, LexGuard, CarbonIQ; TypeScript → CivicInsight; Streamlit → CIFAKE, PhishCatch, AI Quiz; Pytest → CarbonIQ; OpenCV → Emotion Recognition, Face Attendance; TensorFlow/Keras → CIFAKE, Emotion Recognition; MySQL → Food Bot, Hospital; Python → all Python projects as listed; etc. Full table is generated and shown to you in M4 for confirmation.

## 10. Folder structure

```
harshad-portfolio/
  .github/workflows/deploy.yml
  public/ CNAME(harshad.me) 404.html(generated) robots.txt sitemap.xml
         og.png favicon.svg projects/<slug>.png models/*.glb(draco) textures/*.ktx2
  scripts/ strip-metadata.mjs (sharp, strips EXIF) copy-404.mjs gen-og.mjs optimize-models.sh
  src/
    main.tsx App.tsx
    data/ projects.ts skills.ts events.ts experience.ts certs.ts links.ts site.ts
    scroll/ lenis.ts scrollState.ts sections.ts cameraPath.ts
    world/ Scene.tsx Sky.tsx Rig.tsx Quality.tsx Post.tsx
           islands/ Hero.tsx About.tsx Projects.tsx Skills.tsx Experience.tsx Events.tsx Certs.tsx Contact.tsx
           links/ GithubSkyline.tsx LinkedInNet.tsx LeetBlocks.tsx HackerMedal.tsx ThmVault.tsx dive.ts
    ui/ Loader.tsx Nav.tsx Cursor.tsx ProjectCard.tsx ProjectCover.tsx EmailReveal.tsx SimpleToggle.tsx
    simple/ SimpleView.tsx
    styles/ tokens.css base.css
  index.html vite.config.ts tsconfig.json README.md PLAN.md
```

## 11. Asset sources

- **Procedural first:** islands, clouds, towers, nodes, blocks, medal, vault, totems built from primitives/extrusions in code (zero download cost, perfectly on-palette).
- **A handful of hero GLBs** (airship, cottage/lighthouse, pier): either (a) modelled by you or me in Blender if you want; I cannot run Blender here, so otherwise (b) CC0 low-poly packs (Kenney, Quaternius, Poly Pizza, each licence checked and recorded in `public/models/CREDITS.md`), re-textured to the palette. Pipeline: `gltf-transform` → dedupe, prune, Draco (geometry), KTX2/Basis (textures), quantize.
- **Fonts:** Fraunces + Instrument Sans (OFL) via fontsource, subset to Latin.
- **OG image:** rendered from the scene (name + "Portfolio" only), 1200×630, metadata stripped.

## 12. Performance budget

| Metric | Desktop | Mobile |
|---|---|---|
| Initial JS (shell, gz) | ≤ 90 KB | ≤ 90 KB |
| 3D chunk (three+R3F+drei+post, gz) | ≤ 320 KB, lazy | ≤ 320 KB, lazy |
| GLB total / KTX2 total | ≤ 1.5 MB / ≤ 1 MB | ≤ 0.8 MB / ≤ 0.5 MB |
| Draw calls / triangles | ≤ 150 / ≤ 300k | ≤ 80 / ≤ 100k |
| DPR | ≤ 1.5 | 1 |
| Frame rate | 60 fps on mid-range laptop | 30–60 fps |
Verification: `rollup-plugin-visualizer`, `r3f-perf` in dev, Chrome Performance traces, Lighthouse CI on the built site.

**Lighthouse reality check:** Lighthouse runs on a software-GL headless browser. LCP will be the real-HTML hero heading (rendered before any 3D), and the 3D chunk loads after idle so TBT stays low. If the 85+ Performance target fails *only because of software WebGL*, the auto-Simple-view detection above is what makes the audited page fast. I will report scores for both Simple and 3D modes honestly.

## 13. Mobile strategy

Lower tier by default; no DOF; fewer instances (towers, nodes, clouds halved); DPR 1; touch hover → tap with a first-tap highlight and second-tap action; the horizontal gallery stays pinned but swipe-friendly; viewport 360 px layouts get compact HTML panels over a camera that sits slightly farther back; `touch-action` managed so Lenis doesn't fight the browser.

## 14. Accessibility and SEO

- Semantic `<header>/<nav>/<main>/<section id>` in DOM order with real text (visually laid over the canvas); skip link; one `h1`; landmarks; alt text on project images; visible focus rings; contrast ≥ 4.5:1 on all panels (panels get an opaque-ish cream/ink backdrop).
- Loader has `role="status"` and `aria-live="polite"`; canvas is `aria-hidden` with equivalent content in DOM.
- `prefers-reduced-motion`: camera cuts instead of flights, no profile dive, no autoplay sway, pinned gallery becomes a native horizontally scrollable strip.
- **SEO:** title/description, canonical, Open Graph + Twitter card, JSON-LD `Person` (name, college, `sameAs` the five profile URLs; **no email, phone, address**), `sitemap.xml`, `robots.txt`; build-time static render of content to HTML (`renderToString` post-build) so crawlers see text without running WebGL.

## 15. Deployment (static, GitHub Pages, `harshad.me`)

- `vite.config.ts`: `base: '/'` (custom domain at root; `VITE_BASE` env override if you ever serve from `/<repo>/`), `build.sourcemap: false`.
- `public/CNAME` = `harshad.me`. `scripts/copy-404.mjs` copies built `index.html` to `404.html` (SPA fallback).
- `.github/workflows/deploy.yml`: on push to `main` → `npm ci` → `npm run build` → `actions/upload-pages-artifact` → `actions/deploy-pages` (permissions `pages: write`, `id-token: write`).
- **GitHub settings you must change (all documented in README too):**
  1. Create the repo (public, unless you have Pages on a private repo plan), push `main`.
  2. Settings → Pages → **Build and deployment → Source: GitHub Actions**.
  3. Settings → Pages → **Custom domain: `harshad.me`** → Save; tick **Enforce HTTPS** once the cert is issued.
  4. Settings → Pages → verify the domain (Account → Settings → Pages → Add a domain → TXT record) to prevent takeover.
  5. Settings → Actions → General → allow Actions; Workflow permissions: read is fine (the workflow requests what it needs).
  6. Settings → Environments → `github-pages` → keep deployment branch rule on `main`.
  7. **DNS at your registrar:** apex `harshad.me` A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` and AAAA `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`; `www` CNAME → `harshad1234u.github.io`. (I will re-check these against GitHub docs when writing the README.)
  8. Never commit `.env*` or any PDF (blocked in `.gitignore`).

## 16. Milestones (commit after each; placeholder list at the end of each)

| M | Deliverable |
|---|---|
| M0 | New repo, Vite+TS scaffold, tokens, fonts, lint, `.gitignore`, CI deploy skeleton, `PLAN.md`. |
| M1 | Data files with all content; Simple view complete (semantic HTML, all 8 sections, 17 projects, generated covers). Deployable baseline. |
| M2 | Lenis+GSAP clock, `Canvas`, sky, camera spline, island stubs, nav → camera, quality tiers, WebGL fallback, loader. |
| M3 | Hero, About, Experience, Events, Certs islands + panel transitions + custom cursor. |
| M4 | Projects pinned gallery (cards, covers, progress, prev/next) + world reacting; Skills Orrery + mapping review. |
| M5 | Contact + email reveal + five profile objects + dive flow + reduced-motion paths. |
| M6 | Postprocessing (bloom/DOF), day→night arc polish, audio none (not requested). |
| M7 | Perf pass (budgets, GLB/KTX2 pipeline, lazy per-island), mobile pass. |
| M8 | A11y/SEO pass, OG image, sitemap, JSON-LD, prerender, metadata strip, Lighthouse report. |
| M9 | README, Pages settings guide, final QA at 360px–4K, release. |

## 17. Placeholders so far (will be re-listed each milestone)

- Repo names: CivicInsight AI, Facial Emotion Recognition (**needed**).
- 17 project screenshots (generated covers until supplied).
- Experience dates/duration and bullets for XtraGrad and CodSoft (not provided → shown as "[details to add]").
- One-paragraph "About" copy (only your brief's sentence exists; I will write 2–3 neutral sentences from it and flag them for your edit).
- Skill→project links for Docker, Linux, Git, GitHub, log analysis.
- Hero GLB source decision (you model / CC0 pack / procedural only).

## 18. Verification (Phase 2, per milestone)

`npm run build` clean; `npm run preview` + Playwright MCP screenshots at 360, 768, 1440, 3840 px; keyboard-only run through nav, projects, skills, links; reduced-motion emulation; WebGL-disabled run; Lighthouse (desktop) on 3D and Simple; grep of `dist/` for forbidden strings (phone/CGPA/email in plain text/`.map` files/`.pdf`); `exiftool` over `public/` images shows no metadata.

## Sources
- [Best Three.js Websites 2026](https://www.utsubo.com/blog/best-threejs-websites-2026)
- [Bruno Simon portfolio case study](https://medium.com/@bruno_simon/bruno-simon-portfolio-case-study-960402cc259b)
- [Bruno Simon — Awwwards SOTM](https://www.awwwards.com/bruno-simon-portfolio-wins-site-of-the-month-november.html)
- [Codrops — Scroll-Driven 3D World](https://tympanus.net/codrops/2026/04/28/more-than-a-portfolio-building-a-scroll-driven-3d-world-with-something-to-say/) (search summary only)
- [Codrops — Trionn architecture](https://tympanus.net/codrops/2026/07/15/the-architecture-behind-trionn-coordinating-gsap-three-js-lenis-and-web-audio/) (search summary only)
- [Henry Heffernan–inspired forks / CRT approach](https://discourse.threejs.org/t/a-low-poly-room-where-you-fly-into-the-crt/92694)
- [GSAP forum: perf with R3F](https://gsap.com/community/forums/topic/43299-performance-issues-on-desktop-and-mobile-devices-using-gsap-with-react-three-fiber/)
- [Best 3D Websites of 2026](https://mdx.so/blog/best-3d-websites-2026-examples), [Creative Dev Jobs examples](https://www.creativedevjobs.com/blog/best-threejs-portfolio-examples-2025)
