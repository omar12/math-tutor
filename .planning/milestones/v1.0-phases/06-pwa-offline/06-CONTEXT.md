# Phase 6: PWA & Offline - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the app installable to the iPad home screen (Web App Manifest + PWA metadata) and fully functional offline after the first online load. All app assets — JS, CSS, HTML, images, and audio — must be cached by the service worker. No features are degraded or hidden when the device is offline.

Data (IndexedDB/localStorage) is already local-first from prior phases. The remaining offline gap is asset delivery.

</domain>

<decisions>
## Implementation Decisions

### App Icon
- **D-01:** Use `public/favicon.svg` as the icon source. Rasterize to PNG at 192×192, 512×512, and 180×180 (Apple touch icon) using a build script.
- **D-02:** The 512×512 icon must be maskable — add ~10% padding on all sides so the fox stays within the safe zone for circle/squircle crops. Mark as `purpose: "maskable any"` in the manifest.
- **D-03:** Do not attempt to extract from the React component in `src/assets/`. Only `public/favicon.svg` is used as source.

### Audio Caching
- **D-04:** Precache ALL audio at service worker install time. After one online load, all lessons work fully offline.
- **D-05:** Use `vite-plugin-pwa`'s `globPatterns` to glob `/audio/**` so new audio files are automatically included in the precache manifest without manual updates to SW config.
- **D-06:** If `/public/audio/` is empty at build time, the glob produces zero entries — that is acceptable. Audio will be precached when real files are added.

### SW Update Behavior
- **D-07:** Silent auto-update. `skipWaiting: true` + `clientsClaim: true` — new SW activates on next app launch with no user-facing UI. Appropriate for a kids app where parents handle updates passively.

### Installed App Identity
- **D-08:** Installed app name: `"Math Time!"` (matches the in-app greeting, kids-facing brand).
- **D-09:** `short_name: "Math Time"` (no exclamation mark in short name — avoids truncation).
- **D-10:** Theme color and status bar: `#FF6B35` (matches `--color-primary`, consistent with buttons and interactive elements).
- **D-11:** Splash/background color: `#FFF8F0` (matches `--color-surface`, same as app background).
- **D-12:** `display: "standalone"` — no browser chrome when launched from home screen (required for PWA-01).
- **D-13:** `start_url: "/"` and `scope: "/"`.

### Claude's Discretion
- Specific vite-plugin-pwa version to install — use latest stable compatible with Vite 8.
- Workbox strategy for non-audio assets (app shell) — `CacheFirst` for precached assets is standard.
- Whether to add `<meta name="apple-mobile-web-app-capable" content="yes">` to `index.html` — include it; required for Safari standalone mode.
- Apple touch icon size and placement in `index.html` — standard 180×180 `<link rel="apple-touch-icon">`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §PWA-01, PWA-02 — installability and offline requirements
- `.planning/ROADMAP.md` §Phase 6 — success criteria (standalone mode, airplane mode test, full offline lesson+practice)

### Existing Code (integration points)
- `src/index.css` — `--color-primary: #FF6B35`, `--color-surface: #FFF8F0` (use these for manifest theme_color and background_color)
- `index.html` — needs `<link rel="manifest">`, `<meta name="theme-color">`, `<meta name="apple-mobile-web-app-capable">`, and `<link rel="apple-touch-icon">` injected
- `vite.config.ts` — existing plugins (react, tailwindcss, audioMissing404Plugin); add VitePWA plugin here
- `public/favicon.svg` — icon source for PNG generation script

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `public/favicon.svg` — sole icon source; no existing PNG icons
- `public/icons.svg` — may contain symbol variants (inspect before rasterizing)

### Established Patterns
- Vite 8 SPA — `vite-plugin-pwa` is the standard integration (injectManifest or generateSW mode)
- No existing service worker, no existing manifest file
- All data access is IndexedDB (Dexie) — zero network calls for app features
- Audio served from `/public/audio/` via Howler.js — must be included in precache glob

### Integration Points
- `vite.config.ts` — add `VitePWA()` to `plugins[]` array
- `index.html` — PWA meta tags (manifest link, theme-color, apple-mobile-web-app)
- `public/` — new files: `manifest.webmanifest`, `icons/icon-192.png`, `icons/icon-512.png`, `icons/apple-touch-icon.png`
- Build process — add icon generation step (script or vite plugin) before `vite build`

</code_context>

<specifics>
## Specific Ideas

- App name is `"Math Time!"` (exclamation mark included) — not `"Math Tutor"` (project name) or `"Remy's Math"` (mascot name)
- Icons derived from fox mascot SVG — keeps home screen icon consistent with in-app character
- Full precache strategy (not cache-on-demand) — the offline guarantee is unconditional after first load

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 6-PWA & Offline*
*Context gathered: 2026-05-17*
