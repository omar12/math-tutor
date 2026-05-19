---
phase: 06-pwa-offline
plan: 01
subsystem: pwa
tags: [pwa, service-worker, icons, workbox, vite-plugin-pwa, offline, safari]
dependency_graph:
  requires: []
  provides: [PWA-01, PWA-02]
  affects: [vite.config.ts, index.html, src/main.tsx, tsconfig.app.json]
tech_stack:
  added:
    - vite-plugin-pwa@1.3.0
    - "@vite-pwa/assets-generator@1.0.2"
    - workbox-window@7.4.1
    - sharp@0.34.5
  patterns:
    - VitePWA generateSW with autoUpdate registerType
    - Workbox precache with globPatterns covering audio
    - pwaOptions named export for testability
key_files:
  created:
    - pwa-assets.config.ts
    - public/icons/icon-192.png
    - public/icons/icon-512.png
    - public/icons/icon-512-maskable.png
    - public/icons/apple-touch-icon.png
    - public/favicon.ico
    - src/test/pwa.test.ts
  modified:
    - vite.config.ts
    - index.html
    - tsconfig.app.json
    - src/main.tsx
decisions:
  - Export pwaOptions as named export from vite.config.ts to enable direct config inspection in tests without plugin introspection
  - Move generated icons from public/ root to public/icons/ to match manifest icon src paths (/icons/*)
  - favicon.ico retained as bonus artifact from pwa-assets-generator run (does not conflict with existing favicon.svg)
metrics:
  duration: "~15 minutes"
  completed: "2026-05-18"
  tasks_completed: 2
  files_created: 7
  files_modified: 4
---

# Phase 6 Plan 1: PWA Infrastructure Summary

**One-liner:** Complete PWA infrastructure with vite-plugin-pwa (Workbox generateSW), four PNG icons from SVG source, Apple meta tags in index.html, silent SW auto-update, and 6 passing config tests.

## What Was Built

### Task 1: Icon Generation

Created `pwa-assets.config.ts` using `@vite-pwa/assets-generator` with the `minimal2023Preset`. Ran `npx pwa-assets-generator` which rasterized `public/favicon.svg` (a purple lightning bolt icon) via `sharp` into four PNG files:

| File | Size | Dimensions |
|------|------|------------|
| `public/icons/icon-192.png` | 4.2 KB | 192×192, transparent |
| `public/icons/icon-512.png` | 23.6 KB | 512×512, transparent |
| `public/icons/icon-512-maskable.png` | 12.7 KB | 512×512, white bg + padding |
| `public/icons/apple-touch-icon.png` | 2.2 KB | 180×180, white bg |

The generator also produced `favicon.ico` (retained) and `pwa-64x64.png` (removed — not needed by the manifest).

The icons were moved from the generator's default output location (`public/`) to `public/icons/` to match the manifest icon src paths (`/icons/icon-*.png`).

### Task 2: VitePWA Plugin + Config + Registration

**`vite.config.ts`:** Added `import { VitePWA } from 'vite-plugin-pwa'` and a named export `pwaOptions` containing the full VitePWA configuration. The `pwaOptions` object is passed to `VitePWA(pwaOptions)` in the plugins array. Manifest: name `'Math Time!'`, short_name `'Math Time'`, display `'standalone'`, theme_color `'#FF6B35'`, background_color `'#FFF8F0'`, start_url `/`, scope `/`, three icon entries. Workbox: globPatterns cover js/css/html/ico/svg/webmanifest/png/jpg/jpeg/gif/webp and `audio/**/*.{mp3,ogg,wav}`, navigateFallback `'index.html'`, cleanupOutdatedCaches `true`.

**`index.html`:** Five Apple PWA tags inserted after `<meta name="color-scheme">` and before `<title>`: `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` (black-translucent), `apple-mobile-web-app-title`, and `<link rel="apple-touch-icon">` pointing to the 180×180 PNG. No manual `<link rel="manifest">` — vite-plugin-pwa injects this at build time.

**`tsconfig.app.json`:** Added `"vite-plugin-pwa/client"` to the `types` array to resolve `virtual:pwa-register` module import in `main.tsx`.

**`src/main.tsx`:** Prepended `import { registerSW } from 'virtual:pwa-register'` and `registerSW({ immediate: true })` as the first two lines, before all existing imports.

## Tests Written and Results

### TDD Cycle

**RED commit:** `5aef2cf` — 6 failing tests in `src/test/pwa.test.ts`. Tests import `pwaOptions` named export (not yet exported) — all 6 fail with import/undefined errors as expected.

**GREEN commit:** `337f2f9` — After adding `pwaOptions` export and VitePWA plugin, all 6 tests pass.

### Test Results

```
npx vitest run src/test/pwa.test.ts
Test Files  1 passed (1)
Tests  6 passed (6)
```

| Test | ID | Status |
|------|----|--------|
| pwaOptions has registerType autoUpdate | PWA-01 | PASS |
| manifest has correct name, short_name, display, theme_color, background_color, start_url, scope | PWA-01 | PASS |
| manifest.icons has 192x192 (any), 512x512 (any), 512x512 (maskable) entries | PWA-01 | PASS |
| workbox.globPatterns includes audio/**/*.{mp3,ogg,wav} | PWA-02 | PASS |
| workbox.navigateFallback is 'index.html' | PWA-02 | PASS |
| workbox.cleanupOutdatedCaches is true | PWA-02 | PASS |

### Full Suite

```
npx vitest run
Test Files  34 passed (34)
Tests  292 passed | 2 todo (294)
```

Zero regressions. 6 new tests added on top of prior 286 passing tests.

## Files Modified

| File | Type | Change |
|------|------|--------|
| `pwa-assets.config.ts` | Created | Icon generator config with minimal2023Preset |
| `public/icons/icon-192.png` | Created | 192×192 transparent PNG |
| `public/icons/icon-512.png` | Created | 512×512 transparent PNG |
| `public/icons/icon-512-maskable.png` | Created | 512×512 maskable PNG with white bg |
| `public/icons/apple-touch-icon.png` | Created | 180×180 PNG for Safari home screen |
| `public/favicon.ico` | Created | Bonus ICO from generator run |
| `src/test/pwa.test.ts` | Created | 6 PWA config tests |
| `vite.config.ts` | Modified | VitePWA import + pwaOptions export + plugin |
| `index.html` | Modified | 5 Apple PWA meta/link tags |
| `tsconfig.app.json` | Modified | Added vite-plugin-pwa/client to types |
| `src/main.tsx` | Modified | Prepended registerSW import and call |

## Commits

| Hash | Message |
|------|---------|
| `d8e1272` | feat(06-01): generate PWA icon PNGs and add pwa-assets.config.ts |
| `5aef2cf` | test(06-01): add failing tests for PWA config validation (RED) |
| `337f2f9` | feat(06-01): wire VitePWA plugin, meta tags, SW registration, and TypeScript types |

## Deviations from Plan

### Auto-handled Issues

**1. [Rule 3 - Deviation] Generator outputs icons to public/ root with different filenames**
- **Found during:** Task 1
- **Issue:** `@vite-pwa/assets-generator` with `minimal2023Preset` outputs to `public/` root with filenames like `pwa-192x192.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png` — not to `public/icons/` with the names expected by the manifest config
- **Fix:** After generation, created `public/icons/` directory and moved/renamed all four files. Removed extra `pwa-64x64.png` (not needed by manifest). This was anticipated in RESEARCH.md Assumption A3.
- **Files modified:** `public/icons/` (new directory), four icon files moved and renamed

**2. [Rule 1 - Note] favicon.ico retained**
- The generator also produced `public/favicon.ico`. This was committed (not removed) as it replaces no existing file and serves as a valid browser fallback icon for non-Safari browsers. No conflict with existing `favicon.svg`.

All other plan instructions were followed exactly.

## Known Stubs

None — all manifest values are wired to real config, all icon files are real PNGs from the SVG source, all code changes are functional.

## Threat Flags

None — no new network endpoints, auth paths, or trust boundary surfaces introduced. Threat model mitigations T-06-01 (scope: '/') and T-06-02 (cleanupOutdatedCaches + autoUpdate) are both present in the VitePWA config.

## Self-Check: PASSED

All files verified present:
- `pwa-assets.config.ts` - FOUND
- `public/icons/icon-192.png` - FOUND (4,299 bytes)
- `public/icons/icon-512.png` - FOUND (24,177 bytes)
- `public/icons/icon-512-maskable.png` - FOUND (13,047 bytes)
- `public/icons/apple-touch-icon.png` - FOUND (2,202 bytes)
- `src/test/pwa.test.ts` - FOUND
- `vite.config.ts` updated - FOUND (contains VitePWA, pwaOptions)
- `index.html` updated - FOUND (contains apple-mobile-web-app-capable)
- `tsconfig.app.json` updated - FOUND (contains vite-plugin-pwa/client)
- `src/main.tsx` updated - FOUND (line 1: import { registerSW })

All commits verified:
- `d8e1272` - FOUND
- `5aef2cf` - FOUND
- `337f2f9` - FOUND
