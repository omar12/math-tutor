---
status: testing
phase: 06-pwa-offline
source: [06-01-SUMMARY.md, 06-02-SUMMARY.md]
started: 2026-05-19T00:00:00.000Z
updated: 2026-05-19T00:00:00.000Z
---

## Current Test

number: 1
name: PWA Config Tests Pass
expected: |
  Run `npx vitest run src/test/pwa.test.ts` — all 6 tests pass with exit 0.
awaiting: user response

## Tests

### 1. PWA Config Tests Pass
expected: Run `npx vitest run src/test/pwa.test.ts` — all 6 tests pass with exit 0.
result: pending

### 2. Icon Files Present and Correct Dimensions
expected: |
  public/icons/ contains 4 PNG files.
  `file public/icons/icon-192.png` reports "192 x 192".
  `file public/icons/apple-touch-icon.png` reports "180 x 180".
  All files > 500 bytes (not blank).
result: pending

### 3. Apple PWA Meta Tags in index.html
expected: |
  index.html contains all 5 Apple PWA tags:
  - `apple-mobile-web-app-capable`
  - `apple-mobile-web-app-status-bar-style` with content `black-translucent`
  - `apple-mobile-web-app-title` with content `Math Time`
  - `<link rel="apple-touch-icon"` pointing to `/icons/apple-touch-icon.png`
  - `theme-color` with content `#FF6B35`
  No `<link rel="manifest">` present (vite-plugin-pwa injects it at build time).
result: pending

### 4. Service Worker Registered in main.tsx
expected: |
  src/main.tsx line 1 is `import { registerSW } from 'virtual:pwa-register'`.
  Line 2 is `registerSW({ immediate: true })`.
  These appear before all other imports.
result: pending

### 5. Production Build Produces PWA Artifacts
expected: |
  Running `npx vite build` exits 0.
  dist/manifest.webmanifest exists with name "Math Time!", display "standalone", theme_color "#FF6B35".
  dist/sw.js exists (Workbox service worker).
  dist/icons/icon-192.png exists (icons copied to build).
result: pending

### 6. generate-icons Script in package.json
expected: |
  package.json scripts section contains `"generate-icons": "pwa-assets-generator"`.
  Running `npm run generate-icons` runs the generator without error.
result: pending

### 7. Full Vitest Suite — No Regressions
expected: |
  `npx vitest run` passes all 292 tests across 34 test files.
  Zero regressions from phases 01–05.
  6 new PWA tests included in the count.
result: pending

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0

## Gaps

[none yet]
