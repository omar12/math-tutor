# Phase 6: PWA & Offline - Research

**Researched:** 2026-05-18
**Domain:** Progressive Web Apps — Web App Manifest, Service Workers, Workbox, iOS/iPadOS Safari PWA
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Use `public/favicon.svg` as icon source. Rasterize to PNG at 192×192, 512×512, and 180×180 (Apple touch icon) using a build script.
- **D-02:** The 512×512 icon must be maskable — ~10% padding on all sides, fox stays within safe zone. Mark `purpose: "maskable any"` in manifest.
- **D-03:** Do not attempt to extract from `src/assets/`. Only `public/favicon.svg` is used as source.
- **D-04:** Precache ALL audio at service worker install time. Full offline after one online load.
- **D-05:** Use `vite-plugin-pwa`'s `globPatterns` to glob `/audio/**` for automatic audio precache inclusion.
- **D-06:** If `/public/audio/` is empty at build time, zero glob entries — acceptable. Audio precached when real files are added.
- **D-07:** Silent auto-update. `skipWaiting: true` + `clientsClaim: true` — new SW activates on next launch with no user UI.
- **D-08:** Installed app name: `"Math Time!"`.
- **D-09:** `short_name: "Math Time"` (no exclamation mark, avoids truncation).
- **D-10:** Theme color / status bar: `#FF6B35`.
- **D-11:** Splash/background color: `#FFF8F0`.
- **D-12:** `display: "standalone"` — no browser chrome when launched from home screen.
- **D-13:** `start_url: "/"` and `scope: "/"`.

### Claude's Discretion

- Specific `vite-plugin-pwa` version — use latest stable compatible with Vite 8.
- Workbox strategy for non-audio assets (app shell) — `CacheFirst` for precached assets is standard.
- Whether to add `<meta name="apple-mobile-web-app-capable" content="yes">` to `index.html` — include it; required for Safari standalone mode.
- Apple touch icon size and placement in `index.html` — standard 180×180 `<link rel="apple-touch-icon">`.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PWA-01 | App can be installed via "Add to Home Screen" on iPad (PWA with Web App Manifest) | Web App Manifest + `display: standalone` + required meta tags in `index.html` + icons at 192, 512, 180px |
| PWA-02 | App works fully offline after first load via Service Worker | `vite-plugin-pwa` generateSW strategy with full precache glob covering JS, CSS, HTML, images, fonts, and audio |
</phase_requirements>

---

## Summary

Phase 6 wires up the Web App Manifest and a Workbox-powered service worker so the app is installable from Safari on iPad and fully offline after the first load. All prior phases are already local-first (IndexedDB + localStorage for data, Howler for audio from `/public/audio/`), so the only remaining offline gap is asset delivery — JS bundles, CSS, HTML, images, and audio files.

The standard tool for this project's Vite 8 SPA is `vite-plugin-pwa` 1.3.0, which auto-generates the service worker via Workbox's `generateSW` strategy and injects the manifest link into `index.html` at build time. Icon generation from the fox SVG is handled by `@vite-pwa/assets-generator` 1.0.2 using the `minimal-2023` preset.

The critical Safari-specific requirements are: (1) `<meta name="apple-mobile-web-app-capable" content="yes">` must be in `index.html` — vite-plugin-pwa does NOT inject this automatically; (2) the 180×180 Apple touch icon must be linked via `<link rel="apple-touch-icon">` since Safari historically ignores manifest icons for the home screen icon on older iOS; and (3) `registerType: 'autoUpdate'` plus `import { registerSW } from 'virtual:pwa-register'` in `main.tsx` are both needed for silent SW updates to reload clients.

**Primary recommendation:** Use `vite-plugin-pwa` with `generateSW` strategy and `registerType: 'autoUpdate'`. Extend `globPatterns` to include audio and image types. Generate icons via `@vite-pwa/assets-generator minimal-2023` preset. Inject Apple-specific meta tags manually into `index.html`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Web App Manifest | Build / Static | Browser | Manifest is a static JSON file served as a build artifact; browser reads it for install prompt |
| Service Worker Registration | Browser / Client | Build | SW is generated at build time by Workbox; registration code runs client-side in `main.tsx` |
| Asset Precaching | Service Worker | CDN / Static | SW intercepts fetch requests at runtime; precache manifest compiled by Workbox at build time |
| Icon Generation | Build Script | — | PNG icons derived from SVG at build time via `pwa-assets-generator`; output lands in `public/icons/` |
| Apple meta tags | Static HTML | — | `index.html` is the insertion point; vite-plugin-pwa does not auto-inject Apple-specific tags |
| Audio offline delivery | Service Worker | — | Audio served from `/public/audio/`; SW precaches all `.mp3` files via glob; Howler fetches from cache |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `vite-plugin-pwa` | 1.3.0 | Generates SW + injects manifest link + registers SW | Zero-config PWA for Vite; first-class Vite 8 support; Workbox-powered; widely adopted [VERIFIED: npm registry] |
| `workbox-window` | 7.4.1 | Client-side SW lifecycle management (register, update events) | Peer dep of `vite-plugin-pwa`; provides `registerSW` virtual module [VERIFIED: npm registry] |
| `@vite-pwa/assets-generator` | 1.0.2 | Generates PNG icons from SVG source at build time | Official companion tool; handles maskable + transparent variants; uses `sharp` [VERIFIED: npm registry] |
| `sharp` | 0.34.5 | Native image processing used by assets-generator | Required dependency for SVG→PNG rasterization [VERIFIED: npm registry] |

### Configuration Pattern

`vite-plugin-pwa` peer dependencies require `workbox-build ^7.4.1` and `workbox-window ^7.4.1` — both already at 7.4.1. [VERIFIED: npm registry]

`registerType: 'autoUpdate'` automatically forces `workbox.skipWaiting: true` and `workbox.clientsClaim: true` — no need to set these manually. [CITED: vite-pwa-org.netlify.app/guide/auto-update.html]

### Installation

```bash
# vite-plugin-pwa and workbox peer deps (vite-plugin-pwa already in package.json from slopcheck run)
npm install --save-dev vite-plugin-pwa workbox-window

# Icon generation (already in package.json from slopcheck run)
npm install --save-dev @vite-pwa/assets-generator
```

Note: `slopcheck` already added these to `package.json` and ran `npm install` during research. Verify `package.json` before installing again.

### Version Verification (run at build time)

```bash
npm view vite-plugin-pwa version     # 1.3.0 confirmed 2026-05-18
npm view workbox-window version      # 7.4.1 confirmed 2026-05-18
npm view @vite-pwa/assets-generator version  # 1.0.2 confirmed 2026-05-18
```

---

## Package Legitimacy Audit

> slopcheck ran successfully during research.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `vite-plugin-pwa` | npm | ~5 yrs (Aug 2020) | High — widely adopted Vite ecosystem tool | github.com/vite-pwa/vite-plugin-pwa | [OK] | Approved |
| `@vite-pwa/assets-generator` | npm | ~3 yrs (Jun 2023) | Moderate — official companion tool | github.com/vite-pwa/vite-plugin-pwa | [OK] | Approved |
| `sharp` | npm | ~12 yrs (Aug 2013) | Very high — image processing standard | github.com/lovell/sharp | [OK] | Approved |
| `workbox-window` | npm | ~7 yrs (Jan 2019) | Very high — Google Workbox core | github.com/GoogleChrome/workbox | [OK] | Approved |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
Browser (iPad Safari)
        │
        │ first online load
        ▼
  Vite Build Output (dist/)
  ┌────────────────────────────┐
  │ index.html                 │ ← manifest link, apple meta tags, SW register
  │ assets/*.js  assets/*.css  │
  │ public/icons/*.png         │ ← 192, 512, 180px (maskable + transparent)
  │ public/favicon.svg         │
  │ public/audio/**/*.mp3      │ (empty now; populated in Phase 3+)
  └────────────┬───────────────┘
               │
               ▼
  Service Worker (sw.js — Workbox generated)
  ┌────────────────────────────────────────┐
  │  Precache Manifest                     │
  │  ├── **/*.{js,css,html}               │
  │  ├── **/*.{png,svg,ico,webmanifest}   │
  │  └── audio/**/*.mp3                   │
  │                                        │
  │  Strategy: CacheFirst (precached)      │
  │  On install → cache all entries        │
  │  On fetch   → serve from cache first   │
  └────────────┬───────────────────────────┘
               │ offline fetch intercept
               ▼
  App Shell (React SPA)
  ├── React Router → screens
  ├── Dexie (IndexedDB) — already local-first
  ├── Howler → serves audio from SW cache
  └── localStorage — PIN, last lesson (already local-first)
```

### Recommended Project Structure Changes

```
public/
├── favicon.svg           # existing — icon source
├── icons.svg             # existing — may contain symbol variants
├── icons/                # NEW — generated PNG icons
│   ├── icon-192.png      # transparent, purpose: any
│   ├── icon-512.png      # transparent, purpose: any
│   ├── icon-512-maskable.png  # white bg + padding, purpose: maskable
│   └── apple-touch-icon.png  # 180×180, white bg
└── audio/                # existing (empty until Phase 3 audio added)

src/
└── main.tsx              # add registerSW import

vite.config.ts            # add VitePWA() plugin
pwa-assets.config.ts      # NEW — assets generator config
index.html                # add PWA meta tags + apple-touch-icon link
```

### Pattern 1: VitePWA Plugin Configuration

**What:** Full `vite-plugin-pwa` configuration for this project
**When to use:** This is the definitive config for `vite.config.ts`

```typescript
// Source: vite-pwa-org.netlify.app/guide/service-worker-precache + /guide/auto-update.html
import { VitePWA } from 'vite-plugin-pwa'

VitePWA({
  registerType: 'autoUpdate',          // forces skipWaiting + clientsClaim automatically
  includeAssets: ['favicon.svg', 'icons/*.png'],
  manifest: {
    name: 'Math Time!',
    short_name: 'Math Time',
    description: 'Fun math practice for grades 1–3',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    theme_color: '#FF6B35',
    background_color: '#FFF8F0',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  },
  workbox: {
    globPatterns: [
      '**/*.{js,css,html,ico,svg,webmanifest}',
      '**/*.{png,jpg,jpeg,gif,webp}',
      'audio/**/*.{mp3,ogg,wav}',
    ],
    navigateFallback: 'index.html',
    cleanupOutdatedCaches: true,
  },
})
```

### Pattern 2: SW Registration in main.tsx

**What:** Import the virtual module from `vite-plugin-pwa` to enable auto-reload on SW update
**When to use:** Required — without this, `registerType: 'autoUpdate'` does not reload clients

```typescript
// Source: vite-pwa-org.netlify.app/guide/auto-update.html
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })
```

Add this at the top of `src/main.tsx` before the `ReactDOM.createRoot` call.

### Pattern 3: Required index.html Meta Tags

**What:** Apple-specific PWA meta tags — vite-plugin-pwa does NOT inject these automatically
**When to use:** Mandatory for iPadOS standalone mode

```html
<!-- Source: MDN + firt.dev/notes/pwa-ios/ -->
<!-- Inside <head>, after existing viewport meta -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Math Time" />
<meta name="theme-color" content="#FF6B35" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.webmanifest" />
```

Note: `vite-plugin-pwa` injects the `<link rel="manifest">` automatically during build. The `apple-mobile-web-app-*` tags and `<link rel="apple-touch-icon">` must be added manually to `index.html`.

### Pattern 4: Icon Generation Config

**What:** `pwa-assets.config.ts` for `@vite-pwa/assets-generator` using `minimal-2023` preset
**When to use:** Run once (or as a build script step) to generate PNG icons from `public/favicon.svg`

```typescript
// Source: vite-pwa-org.netlify.app/assets-generator/cli.html
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/favicon.svg'],
})
```

CLI usage:
```bash
npx pwa-assets-generator --preset minimal-2023 public/favicon.svg
```

The `minimal-2023` preset generates: 192×192 (transparent, purpose: any), 512×512 (transparent, purpose: any), 512×512 maskable (white bg + padding), 180×180 apple-touch-icon. [CITED: vite-pwa-org.netlify.app/assets-generator/]

**Maskable safe zone:** D-02 requires ~10% padding. The `minimal-2023` preset adds a white background and respects the maskable safe zone (the central 80% of the icon area). The fox SVG from `public/favicon.svg` will be inset automatically. [ASSUMED — verify the exact padding behavior of the preset with the specific SVG]

### Anti-Patterns to Avoid

- **Not importing `registerSW` in main.tsx:** `registerType: 'autoUpdate'` only generates a SW that skips waiting — it does NOT auto-reload open tabs without the `registerSW({ immediate: true })` call.
- **Using `includeAssets` alone for audio:** `includeAssets` only handles files in `publicDir`. Audio files served from `/public/audio/` also need `globPatterns` to include `audio/**/*.mp3` so the Workbox precache manifest picks them up from the final `dist/` output.
- **Relying on vite-plugin-pwa for Apple meta tags:** The plugin injects `<link rel="manifest">` but does NOT inject `<meta name="apple-mobile-web-app-capable">` — this must be in `index.html` manually. [CITED: github.com/vite-pwa/vite-plugin-pwa/issues/312]
- **Setting `skipWaiting` / `clientsClaim` manually when using `registerType: 'autoUpdate'`:** These are forced automatically; manually duplicating them is harmless but redundant.
- **Pointing `apple-touch-icon` at the SVG:** Safari does not support SVG apple-touch icons. Must use the 180×180 PNG.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service worker generation | Custom SW with fetch listeners | `vite-plugin-pwa` + Workbox `generateSW` | Workbox handles precache integrity hash checking, cache versioning, update detection, and cleanup of stale caches — hand-rolled SWs miss all of these |
| Precache manifest | Hardcoded list of file paths | Workbox `globPatterns` | Glob-based manifest updates automatically with each build; hardcoded lists go stale immediately |
| Icon resizing | Canvas/ImageMagick script | `@vite-pwa/assets-generator` | Handles maskable safe zone, correct background colors, and all required sizes in one preset |
| SW update UI | Custom prompt component | `registerType: 'autoUpdate'` + `registerSW` | Silent update is the right UX for a kids app; custom prompt is over-engineering |

**Key insight:** Workbox precache is not a simple "cache files" operation — it uses an integrity manifest with content hashes so stale entries are cleaned up on SW update. Hand-rolled fetch-event caching skips this, causing stale assets to persist across deploys.

---

## Common Pitfalls

### Pitfall 1: `globPatterns` excludes audio — offline lessons break

**What goes wrong:** Default `globPatterns: ['**/*.{js,css,html}']` does not include `.mp3` files. Audio requests fail when offline even though the SW is installed.
**Why it happens:** Workbox only precaches file types explicitly listed in the glob.
**How to avoid:** Include `'audio/**/*.{mp3,ogg,wav}'` in `globPatterns`. [CITED: vite-pwa-org.netlify.app/guide/service-worker-precache]
**Warning signs:** SW installs but Howler `onloaderror` fires when offline; network tab shows audio requests failing in offline mode.

### Pitfall 2: Safari doesn't show "Add to Home Screen" prompt automatically

**What goes wrong:** No browser-managed install prompt on iOS/iPadOS — it is always manual. App may not be installable if manifest or meta tags are malformed.
**Why it happens:** Apple does not implement the `beforeinstallprompt` event. iOS requires `<meta name="apple-mobile-web-app-capable">` and valid manifest with `display: standalone`.
**How to avoid:** Verify manifest is served at `/manifest.webmanifest`, `display: standalone` is set, and Apple meta tags are present. Use Safari DevTools > Manifest inspector to validate. [CITED: firt.dev/notes/pwa-ios/]
**Warning signs:** Safari "Share" menu does not show "Add to Home Screen" option (rare — usually shows regardless, but standalone mode is broken if manifest is invalid).

### Pitfall 3: App opens in Safari tab instead of standalone after install

**What goes wrong:** Installed app opens with browser chrome (address bar visible) instead of fullscreen standalone.
**Why it happens:** Missing `<meta name="apple-mobile-web-app-capable" content="yes">` or manifest `display` not set to `standalone`. The plugin alone does not inject this tag. [CITED: github.com/vite-pwa/vite-plugin-pwa/issues/312]
**How to avoid:** Manually add all three Apple meta tags to `index.html`.
**Warning signs:** After "Add to Home Screen" and launch, top of app shows Safari URL bar.

### Pitfall 4: iOS 7-day cache eviction clears audio offline cache

**What goes wrong:** Child opens app after a week without use — audio is gone because Safari evicted the service worker cache.
**Why it happens:** Safari ITP clears script-writable storage (including Cache Storage) after 7 days of non-use in the browser context. [CITED: webkit.org/blog/14403/updates-to-storage-policy/]
**How to avoid:** For the installed home screen PWA specifically, Safari 17+ gives standalone apps the same quota as browser apps (up to 60% disk). The 7-day ITP eviction applies to Safari tabs, not installed standalone apps. Document this in parent/teacher guidance. [CITED: webkit.org/blog/14403/updates-to-storage-policy/]
**Warning signs:** Offline test passes immediately after install but fails after 7+ days of non-use when accessed via browser tab (not home screen icon).

### Pitfall 5: TypeScript error on `virtual:pwa-register` import

**What goes wrong:** `Cannot find module 'virtual:pwa-register'` TypeScript error in `main.tsx`.
**Why it happens:** `vite-plugin-pwa` provides type declarations that need to be referenced in `tsconfig.app.json`.
**How to avoid:** Add `"vite-plugin-pwa/client"` to `compilerOptions.types` in `tsconfig.app.json`, or add `/// <reference types="vite-plugin-pwa/client" />` to `vite-env.d.ts`. [ASSUMED — standard pattern; verify against vite-plugin-pwa 1.3.0 release notes]
**Warning signs:** TypeScript build fails with module resolution error for `virtual:pwa-register`.

### Pitfall 6: `navigateFallback` needed for SPA deep links offline

**What goes wrong:** User installs app, goes offline, app is at `/lesson/3` — refreshing shows a network error instead of the app.
**Why it happens:** The SW doesn't know to serve `index.html` for non-root URL paths unless `navigateFallback` is configured.
**How to avoid:** Set `workbox: { navigateFallback: 'index.html' }` in the plugin config. React Router handles client-side routing once the shell loads. [CITED: vite-pwa-org.netlify.app/workbox/generate-sw.html]
**Warning signs:** App works offline from `/` but crashes on refresh at any nested route.

---

## Code Examples

### Complete vite.config.ts with VitePWA

```typescript
// Source: vite-pwa-org.netlify.app/guide/ + /guide/service-worker-precache
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { existsSync } from 'fs'
import { join } from 'path'

const audioMissing404Plugin = { /* ... existing plugin unchanged ... */ }

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    audioMissing404Plugin,
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'Math Time!',
        short_name: 'Math Time',
        description: 'Fun math practice for grades 1–3',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#FF6B35',
        background_color: '#FFF8F0',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,svg,webmanifest}',
          '**/*.{png,jpg,jpeg,gif,webp}',
          'audio/**/*.{mp3,ogg,wav}',
        ],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

### index.html Apple meta tags

```html
<!-- Source: firt.dev/notes/pwa-ios/ + MDN -->
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="color-scheme" content="light" />

  <!-- PWA: theme color (Android + Safari tab tint) -->
  <meta name="theme-color" content="#FF6B35" />

  <!-- PWA: Safari standalone mode (required for fullscreen install) -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Math Time" />

  <!-- PWA: Apple touch icon (Safari uses this for home screen icon, not manifest) -->
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

  <!-- PWA: Manifest injected by vite-plugin-pwa at build time — do not add manually -->

  <title>Math Tutor</title>
</head>
```

### main.tsx SW registration

```typescript
// Source: vite-pwa-org.netlify.app/guide/auto-update.html
import { registerSW } from 'virtual:pwa-register'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import './index.css'

// Silent auto-update: new SW activates and reloads on next app launch
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

### pwa-assets.config.ts

```typescript
// Source: vite-pwa-org.netlify.app/assets-generator/cli.html
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/favicon.svg'],
})
```

Run: `npx pwa-assets-generator` — outputs PNG icons to `public/` (rename/move to `public/icons/` after generation).

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hand-written SW with `cache.addAll()` | Workbox `generateSW` via `vite-plugin-pwa` | 2019+ | Automatic content-hash-based precache; stale cache cleanup on update |
| Separate `manifest.json` file | `manifest` object in `VitePWA()` config | 2020+ | Single source of truth; plugin injects `<link rel="manifest">` automatically |
| Manual apple-touch-icon at every size | `@vite-pwa/assets-generator` preset | 2023 | One SVG source → all required sizes; maskable handled automatically |
| `display: "fullscreen"` for iOS | `display: "standalone"` | iOS 11.3+ | `standalone` is correct for app-like feel with status bar; `fullscreen` hides status bar |

**Deprecated/outdated:**
- `apple-mobile-web-app-status-bar-style: "black"`: Use `"black-translucent"` to allow `viewport-fit=cover` to work correctly with the status bar overlay on notched iPads.
- `workbox-webpack-plugin`: Webpack-specific; replaced by `vite-plugin-pwa` for Vite projects.
- `Workbox CDN imports in SW`: Replaced by Workbox modules compiled into the generated SW at build time.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `minimal-2023` preset adds ~10% padding for maskable safe zone automatically | Architecture Patterns (Pattern 4) | If wrong, fox mascot may be cropped by circular/squircle icon masks on Android/iOS — icons must be regenerated with manual padding |
| A2 | TypeScript needs `"vite-plugin-pwa/client"` in `tsconfig.app.json` types or a triple-slash reference for `virtual:pwa-register` | Pitfall 5 | If wrong, fix is trivial (TS error makes it obvious); no functional impact |
| A3 | Generated assets output directory — `minimal-2023` preset may output to `public/` root, not `public/icons/` | Standard Stack / icon generation | If wrong, icon paths in manifest must match actual output location — easy to fix post-generation |

---

## Open Questions

1. **SVG fox mascot complexity vs. icon generation**
   - What we know: `public/favicon.svg` is the declared icon source (D-03); `@vite-pwa/assets-generator` uses `sharp` to rasterize SVGs.
   - What's unclear: If the SVG uses CSS variables, external fonts, or `<use>` references that `sharp` cannot resolve, rasterization may produce a blank or broken icon.
   - Recommendation: Run `pwa-assets-generator` early in Wave 1 and inspect output PNGs before committing. If broken, a simple standalone copy of the SVG with inlined styles may be needed as the icon source.

2. **Audio file count and total precache size**
   - What we know: `/public/audio/` is currently empty (D-06). When Phase 3 audio is added, all `.mp3` files will be precached.
   - What's unclear: Total audio size is unknown. If audio files total >50MB, the 50MB Cache Storage cap reported for non-standalone iOS PWAs could be a concern.
   - Recommendation: For an installed home screen app on Safari 17+, the quota is 60% of disk — not the 50MB figure. Document this in implementation notes. If audio grows large, audio is still the right candidate for precache (offline requirement is unconditional).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build / vite-plugin-pwa | ✓ | v24.8.0 | — |
| Vite 8 | vite-plugin-pwa peer dep | ✓ | 8.0.12 (in package.json) | — |
| `sharp` (native binary) | @vite-pwa/assets-generator | ✓ | 0.34.5 | — |
| Safari on iPad | PWA-01/02 manual verification | — | — | Use Chrome DevTools PWA audit for initial build verification; Safari required for final iOS validation |

**Missing dependencies with no fallback:**
- Safari on iPad for final PWA-01/PWA-02 acceptance testing — not a build dependency, but required for the success criteria.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 + @testing-library/react |
| Config file | `vite.config.ts` (test section) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PWA-01 | Manifest is generated with correct name, display, theme_color, icons | Unit (build artifact check) | `npx vitest run src/test/pwa.test.ts` | ❌ Wave 0 |
| PWA-02 | globPatterns includes audio extension; navigateFallback is set | Unit (config check) | `npx vitest run src/test/pwa.test.ts` | ❌ Wave 0 |
| PWA-01 | App opens in standalone mode (no browser chrome) | Manual — Safari iPad only | N/A — manual | N/A |
| PWA-02 | App works offline in airplane mode after first load | Manual — Safari iPad only | N/A — manual | N/A |

**Note on service worker testing:** Vitest (jsdom) cannot test actual SW registration or offline cache interception — these require a real browser. The automated tests should validate the build-time configuration (manifest values, glob patterns) using vite config inspection or by building and checking the output. The manual test on iPad is the acceptance gate. [CITED: vite-pwa-org.netlify.app/guide/testing-service-worker]

### Sampling Rate

- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green + manual iPad Safari offline test before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/test/pwa.test.ts` — covers PWA-01 and PWA-02 config validation
- [ ] Icon files: `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-512-maskable.png`, `public/icons/apple-touch-icon.png` — must exist before vite build

*(No framework install gap — Vitest already in project)*

---

## Security Domain

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — |
| V3 Session Management | no | — |
| V4 Access Control | no | — |
| V5 Input Validation | no | PWA phase adds no user input surfaces |
| V6 Cryptography | no | SW precache uses Workbox integrity hashes — not custom crypto |

**Threat patterns specific to service workers:**

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SW scope too broad — intercepts unintended origins | Tampering | Set `scope: '/'` scoped to app root only |
| Stale assets served after deploy | Information Disclosure | `cleanupOutdatedCaches: true` + `registerType: 'autoUpdate'` |
| Third-party resources cached without integrity | Tampering | This app has no CDN dependencies in the critical path (Google Fonts is decorative; audio is local) — no runtime caching of third-party assets needed |

---

## Sources

### Primary (HIGH confidence)
- [vite-pwa-org.netlify.app/guide/](https://vite-pwa-org.netlify.app/guide/) — VitePWA plugin configuration, registerType, autoUpdate
- [vite-pwa-org.netlify.app/guide/auto-update.html](https://vite-pwa-org.netlify.app/guide/auto-update.html) — skipWaiting/clientsClaim behavior, registerSW requirement
- [vite-pwa-org.netlify.app/guide/service-worker-precache](https://vite-pwa-org.netlify.app/guide/service-worker-precache) — globPatterns defaults and audio extension inclusion
- [vite-pwa-org.netlify.app/assets-generator/cli.html](https://vite-pwa-org.netlify.app/assets-generator/cli.html) — pwa-assets-generator CLI and config file
- [webkit.org/blog/14403/updates-to-storage-policy/](https://webkit.org/blog/14403/updates-to-storage-policy/) — Safari 17 storage quotas for standalone PWAs

### Secondary (MEDIUM confidence)
- [firt.dev/notes/pwa-ios/](https://firt.dev/notes/pwa-ios/) — iOS/iPadOS PWA feature support matrix; standalone mode since iOS 11.3; apple-mobile-web-app-capable optional since 11.3
- [github.com/vite-pwa/vite-plugin-pwa/issues/312](https://github.com/vite-pwa/vite-plugin-pwa/issues/312) — Confirmed apple-mobile-web-app-capable must be manually added; plugin does not inject it
- [magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide) — iOS cache limits, 7-day eviction, standalone exception

### Tertiary (LOW confidence)
- WebSearch community examples — manifest configuration patterns (cross-verified with official docs)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via npm registry + slopcheck + official vite-pwa docs
- Architecture: HIGH — vite-plugin-pwa is the standard Vite 8 PWA solution; Workbox patterns are well-documented
- Safari-specific requirements: MEDIUM — firt.dev is authoritative but not Apple's official source; meta tag requirements verified via GitHub issue + community cross-reference
- Pitfalls: HIGH — globPatterns, navigateFallback, and Apple meta tag omission are all documented failure modes from official sources

**Research date:** 2026-05-18
**Valid until:** 2026-06-18 (stable ecosystem — vite-plugin-pwa and Workbox are mature)
