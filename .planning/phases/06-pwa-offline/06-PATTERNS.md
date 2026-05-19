# Phase 6: PWA & Offline - Pattern Map

**Mapped:** 2026-05-18
**Files analyzed:** 6 new/modified files
**Analogs found:** 4 / 6 (2 have no codebase analog — new file types)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `vite.config.ts` | config | — | `vite.config.ts` (self — modification) | exact |
| `index.html` | config/static | — | `index.html` (self — modification) | exact |
| `src/main.tsx` | entry/bootstrap | — | `src/main.tsx` (self — modification) | exact |
| `tsconfig.app.json` | config | — | `tsconfig.app.json` (self — modification) | exact |
| `pwa-assets.config.ts` | config | — | none — first config file of this type | no analog |
| `src/test/pwa.test.ts` | test | — | `src/App.test.tsx` + `src/db/db.test.ts` | role-match |

---

## Pattern Assignments

### `vite.config.ts` (config — modification)

**Analog:** `vite.config.ts` (existing file, lines 1–39)

**Existing imports pattern** (lines 1–6):
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync } from 'fs'
import { join } from 'path'
```

**Existing plugins array** (lines 29–33):
```typescript
plugins: [
  react(),
  tailwindcss(),
  audioMissing404Plugin,
],
```

**Addition — new import to prepend**:
```typescript
import { VitePWA } from 'vite-plugin-pwa'
```

**Addition — VitePWA() appended to plugins array after audioMissing404Plugin**:
```typescript
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
```

**Critical note:** `audioMissing404Plugin` must remain in `plugins[]` — it is a dev-only server middleware. `VitePWA()` is added after it. The `test` section at lines 34–38 is unchanged.

---

### `index.html` (static — modification)

**Analog:** `index.html` (existing file, lines 1–17)

**Existing `<head>` structure** (lines 3–11):
```html
<meta charset="UTF-8" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, viewport-fit=cover"
/>
<meta name="color-scheme" content="light" />
<title>Math Tutor</title>
```

**Addition — PWA meta tags inserted after `<meta name="color-scheme">` and before `</head>`**:
```html
<!-- PWA: theme color (Android + Safari tab tint) -->
<meta name="theme-color" content="#FF6B35" />

<!-- PWA: Safari standalone mode (required for fullscreen install on iPadOS) -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Math Time" />

<!-- PWA: Apple touch icon (Safari uses this for home screen icon, ignores manifest icons) -->
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

<!-- PWA: Manifest link is injected automatically by vite-plugin-pwa at build time -->
```

**Critical notes:**
- Do NOT add `<link rel="manifest">` manually — `vite-plugin-pwa` injects it during build. Adding it manually causes a duplicate.
- `apple-mobile-web-app-status-bar-style` must be `"black-translucent"` (not `"black"`) to allow `viewport-fit=cover` to render correctly under the status bar on notched iPads.
- The apple touch icon must point to the 180×180 PNG, not `favicon.svg` — Safari does not support SVG touch icons.

---

### `src/main.tsx` (entry/bootstrap — modification)

**Analog:** `src/main.tsx` (existing file, lines 1–13)

**Existing file** (lines 1–13):
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

**Addition — SW registration import prepended before existing imports**:
```typescript
import { registerSW } from 'virtual:pwa-register'

// Silent auto-update: new SW activates on next app launch with no user-facing prompt
registerSW({ immediate: true })
```

**Placement rule:** `registerSW` call must come before `ReactDOM.createRoot`. All existing imports and the render call are unchanged.

---

### `tsconfig.app.json` (config — modification)

**Analog:** `tsconfig.app.json` (existing file, lines 1–25)

**Existing `types` array** (line 7):
```json
"types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
```

**Addition — append `"vite-plugin-pwa/client"` to the types array**:
```json
"types": ["vite/client", "vitest/globals", "@testing-library/jest-dom", "vite-plugin-pwa/client"]
```

**Why:** Without this, TypeScript reports `Cannot find module 'virtual:pwa-register'` on the import in `main.tsx`. `vite-plugin-pwa/client` ships type declarations for the virtual module.

---

### `pwa-assets.config.ts` (config — new file)

**Analog:** None — this is the first `@vite-pwa/assets-generator` config file in this project.

**Pattern from RESEARCH.md** (Architecture Patterns → Pattern 4):
```typescript
import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: minimal2023Preset,
  images: ['public/favicon.svg'],
})
```

**CLI usage (run once before first build or when SVG source changes)**:
```bash
npx pwa-assets-generator
```

**Output files** (generated into `public/` — may need to move to `public/icons/` depending on preset behavior — see Assumption A3 in RESEARCH.md):
- `public/icons/icon-192.png` — transparent, purpose: any
- `public/icons/icon-512.png` — transparent, purpose: any
- `public/icons/icon-512-maskable.png` — white bg + padding, purpose: maskable
- `public/icons/apple-touch-icon.png` — 180×180, white bg

**Critical note:** Run the generator early and inspect output PNGs before committing (RESEARCH.md Open Question 1). If `public/favicon.svg` uses CSS variables or `<use>` references that `sharp` cannot resolve, rasterization may produce a blank icon. A self-contained SVG copy may be needed as source.

---

### `src/test/pwa.test.ts` (test — new file)

**Analog:** `src/App.test.tsx` (simple describe/it structure) + `src/db/db.test.ts` (import pattern, vitest describe/it/expect)

**Test file structure pattern from `src/App.test.tsx`** (lines 1–51):
```typescript
import { describe, it, expect } from 'vitest'  // globals: true so these are optional imports
// top-level describe block
describe('App routing', () => {
  it('renders HomeScreen at /', async () => {
    // ...
    expect(...).toBeInTheDocument()
  })
})
```

**Config inspection pattern — how to validate Vite config at test time:**
```typescript
// pwa.test.ts: validate the VitePWA plugin configuration is correct
// Strategy: import vite.config.ts and inspect the resolved plugin config
// (No SW runtime testing in jsdom — only build-time config validation)
import { describe, it, expect } from 'vitest'

describe('VitePWA config', () => {
  it('manifest has correct name and display', async () => {
    // Import the raw config object, not the resolved Vite pipeline
    const { default: config } = await import('../../vite.config')
    const pwaPlugin = (config.plugins as Array<{ name?: string; config?: unknown }>)
      .flat()
      .find((p) => p?.name === 'vite-plugin-pwa')
    expect(pwaPlugin).toBeDefined()
  })
})
```

**Note:** The RESEARCH.md Validation Architecture section (lines 563–569) clarifies that Vitest/jsdom cannot test actual SW registration or offline cache interception. Tests should validate build-time config values (manifest name, display, globPatterns inclusion of audio). The manual iPad Safari offline test is the acceptance gate.

**Test IDs to cover** (from RESEARCH.md § Validation Architecture):
- PWA-01: manifest has `name: 'Math Time!'`, `display: 'standalone'`, `theme_color: '#FF6B35'`, icon entries at 192 and 512
- PWA-02: `globPatterns` includes `audio/**/*.{mp3,ogg,wav}`, `navigateFallback: 'index.html'` is set

---

## Shared Patterns

### Vitest globals usage
**Source:** `src/test/setup.ts` (lines 1–20), `src/App.test.tsx`, `src/db/db.test.ts`
**Apply to:** `src/test/pwa.test.ts`

`vitest.config` already sets `globals: true` — `describe`, `it`, `expect`, `vi`, `beforeEach` are available globally without explicit imports. `src/db/db.test.ts` imports them explicitly (`import { describe, it, expect, beforeEach, vi } from 'vitest'`) for clarity — follow this same explicit pattern in `pwa.test.ts`.

### `vite.config.ts` plugin array convention
**Source:** `vite.config.ts` (lines 29–33)
**Apply to:** `vite.config.ts` modification

Plugins are passed as a flat array. The existing `audioMissing404Plugin` is defined inline as a named const above `defineConfig`. New plugins (`VitePWA()`) are appended to the array. Import order: Vite utilities first, then third-party plugins, then local plugins defined above `defineConfig`.

### `tsconfig.app.json` types array convention
**Source:** `tsconfig.app.json` (line 7)
**Apply to:** `tsconfig.app.json` modification

The project uses explicit `"types"` entries (not relying on auto-discovery). New virtual module type packages are appended to this array, not added via triple-slash directives in source files.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `pwa-assets.config.ts` | config | — | First `@vite-pwa/assets-generator` config in this project; no comparable config file pattern exists. Use RESEARCH.md Pattern 4 directly. |

---

## Metadata

**Analog search scope:** `/Users/omar/projects/math-tutor/` — `vite.config.ts`, `index.html`, `src/main.tsx`, `tsconfig.app.json`, `src/test/setup.ts`, `src/App.test.tsx`, `src/db/db.test.ts`, `package.json`, `public/`
**Files scanned:** 11
**Pattern extraction date:** 2026-05-18
