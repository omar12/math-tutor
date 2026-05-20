# Phase 1: Foundation - Research

**Researched:** 2026-05-12
**Domain:** Vite 6 + React 19 + TypeScript 5 scaffold, Tailwind CSS v4, Dexie 4, React Router 7, iPad Safari viewport
**Confidence:** HIGH

---

## Summary

Phase 1 is a pure scaffold-and-plumbing phase with no novel algorithmic work. Every decision has a well-documented standard approach, and all core libraries are verified on the npm registry as of today. The stack choices in CLAUDE.md are mutually compatible at their current latest versions: React 19.2.6, Vite 6.x (plugin-react 6.0.1), Tailwind CSS 4.3.0 (@tailwindcss/vite 4.3.0), Dexie 4.4.2 + dexie-react-hooks 4.4.0, React Router 7.15.0, TypeScript 5.8.x, and Vitest 4.1.6.

The single integration risk is the Tailwind v4 CSS-first configuration model, which is a breaking change from v3. There is no `tailwind.config.js` in v4 — all theme tokens (fonts, colors) live in a `@theme {}` block inside the CSS file. Implementers who have only used v3 will reach for config files that don't exist; this is documented clearly below. Everything else in the stack is straightforward and well-tested together.

The Walking Skeleton for this phase is: scaffold → Tailwind on screen → router renders 4 stub screens → Dexie writes a record → record survives tab close → iPad viewport fills correctly. That sequence proves every plumbing layer works before Phase 2 adds real content.

**Primary recommendation:** Scaffold with `npm create vite@latest -- --template react-ts`, then layer Tailwind v4 (CSS-first), React Router 7 (declarative BrowserRouter mode), and Dexie 4 (singleton `src/db/db.ts`) in that order, each verified in the browser before moving to the next.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Full-screen, no persistent chrome. Each screen owns 100% of the viewport. No bottom nav bar, no persistent header.
- **D-02:** Forward-only navigation for child flow. No back button mid-lesson. App advances through Lesson → Practice → Celebration → Home programmatically.
- **D-03:** Parent section entry point is a small, unobtrusive button on the home screen only. Not accessible from any other screen. Kids don't encounter it mid-flow.
- **D-04:** Home screen shows Remy the Fox mascot + single large "Start Learning" button. One tap target, zero decisions for the child. No topic picker, no grade selector.
- **D-05:** Phase 1 stub: tapping "Start Learning" navigates to a hardcoded sample lesson screen (fake content, real visual). Gives Phase 2 a clear render target and validates routing end-to-end.
- **D-06:** Mascot: Remy the Fox — cute, kid-like. Warm orange fox character. Personality: encouraging, friendly, matches kids ages 6–9.
- **D-07:** Design full v1 Dexie schema now, stub the data. Avoids Dexie version migrations mid-project.
- **D-08:** Tables: `sessions`, `topicProgress`, `appConfig`. No extras.
  - `sessions` — practice session records (topic, date, correctCount, totalCount)
  - `topicProgress` — per-topic accuracy (topic, accuracy, attemptCount, lastPracticed)
  - `appConfig` — key/value store (PIN hash, lastLessonId, onboardingComplete)
- **D-09:** Phase 1 writes one test record to `appConfig` to prove IndexedDB persistence works (PLAT-04 success criterion).
- **D-10:** Color palette: warm, vibrant primaries — bright orange/yellow/blue. Duolingo-level vibrancy, warmer tone.
- **D-11:** Typography: Nunito (Google Fonts). Applied globally via Tailwind config.
- **D-12:** All interactive elements minimum 44×44px touch targets. `touch-action: manipulation` on all tappable elements. `user-select: none` on lesson content.

### Claude's Discretion

- Specific Tailwind color token values (exact hex for primary/secondary/accent) — Claude defines these consistent with "warm vibrant primaries"
- Remy's visual representation in Phase 1 — can be a simple SVG placeholder fox shape; detailed Lottie animation is Phase 3+ work
- Route path naming (`/lesson`, `/practice`, `/parent`) — Claude picks clean, obvious paths

### Deferred Ideas (OUT OF SCOPE)

- Remy animation sequences (wave, celebrate, think) — Phase 3 Lottie work
- Grade picker / topic selector on home screen — not needed
- Lesson completion tracking table (`lessonCompletions`) — not in v1 requirements
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PLAT-01 | App runs in Safari on iPad, fully touch-optimized with no mouse assumptions | `touch-action: manipulation` on all interactives; 44×44px minimum targets; no hover states; CSS patterns documented in Architecture Patterns section |
| PLAT-02 | App uses `100dvh` and `env(safe-area-inset-bottom)` to handle iPad viewport correctly | `viewport-fit=cover` meta tag + `100dvh` + `env(safe-area-inset-bottom)` padding pattern; full CSS documented below |
| PLAT-03 | Single profile per device — child can open app and start immediately with no login or setup | No auth layer; app opens directly to home screen; Dexie schema ready but empty on first run — no setup wizard needed |
| PLAT-04 | All progress data persists locally via IndexedDB across sessions | Dexie 4 singleton `db.ts` pattern; Phase 1 writes one `appConfig` test record; verified read-back approach documented |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Viewport / layout shell | Browser (CSS) | — | `100dvh`, safe-area insets, full-screen layout are pure CSS on the client; no server involvement |
| Client-side routing | Browser (React Router) | — | Pure SPA; BrowserRouter with History API; Vite dev server handles `/*` fallback in dev |
| Local data persistence | Browser (IndexedDB via Dexie) | — | All storage is local; no API tier exists in v1 |
| Touch interaction rules | Browser (CSS) | — | `touch-action`, `user-select`, touch target sizing are CSS/HTML attributes applied at the component level |
| Design tokens (colors, fonts) | Build (Tailwind CSS v4) | Browser (CSS vars) | Tailwind v4 compiles `@theme {}` tokens to CSS custom properties; components consume utility classes |
| Font loading | Browser (Google Fonts CDN) | — | `@import url()` in CSS; no build-time processing needed for Phase 1 |
| App state (current route, session) | Browser (React Context) | — | No backend; React Context + useReducer is sufficient for Phase 1 shell state |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.6 | UI framework | Locked in CLAUDE.md; current stable |
| TypeScript | 5.8.x (bundled by Vite) | Type safety | Locked in CLAUDE.md |
| Vite | 6.x (latest: 8.0.x via create-vite) | Build tool / dev server | Locked in CLAUDE.md; `react-ts` template is canonical scaffold |
| @vitejs/plugin-react | 6.0.1 | Babel-based React Fast Refresh | Ships in Vite react-ts template |
| React Router | 7.15.0 | Client-side routing | Locked in CLAUDE.md; declarative BrowserRouter mode for SPA |
| Tailwind CSS | 4.3.0 | Utility-first styling | Locked in CLAUDE.md; v4 CSS-first, no config file |
| @tailwindcss/vite | 4.3.0 | Vite plugin for Tailwind v4 | Required companion for v4 + Vite integration |
| Dexie | 4.4.2 | IndexedDB abstraction | Locked in CLAUDE.md; singleton pattern |
| dexie-react-hooks | 4.4.0 | `useLiveQuery` hook for reactive reads | Official Dexie companion for React |

### Supporting (Phase 1)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | 4.1.6 | Unit test runner | All unit and integration tests |
| @testing-library/react | 16.3.2 | Component testing utilities | Component render tests |
| @testing-library/jest-dom | 6.9.1 | DOM assertion matchers | Extends Vitest expect with `toBeInTheDocument` etc. |
| @types/react | 19.2.14 | React TypeScript types | Included with scaffold |
| @types/react-dom | 19.2.3 | React DOM TypeScript types | Included with scaffold |

### Version Verification
All versions confirmed via `npm view <package> version` on 2026-05-12. [VERIFIED: npm registry]

### Installation

```bash
# Step 1: Scaffold
npm create vite@latest math-tutor -- --template react-ts
cd math-tutor

# Step 2: Core runtime deps
npm install react-router dexie dexie-react-hooks

# Step 3: Tailwind v4 (Vite plugin, no tailwind.config.js needed)
npm install tailwindcss @tailwindcss/vite

# Step 4: Dev / test deps
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## Architecture Patterns

### System Architecture Diagram

```
User tap on iPad Safari
        │
        ▼
┌─────────────────────────────────────────────┐
│  index.html                                  │
│  <meta viewport="..., viewport-fit=cover">  │
│  <div id="root"> → React mounts here        │
└────────────────┬────────────────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   main.tsx       │
        │  BrowserRouter   │
        │  wraps <App />   │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │   <App />        │
        │  Routes / Route  │
        │  / → HomeScreen  │
        │  /lesson → stub  │
        │  /practice→stub  │
        │  /parent → stub  │
        └────────┬────────┘
                 │ on first render
                 ▼
        ┌─────────────────┐
        │  db.ts           │
        │  Dexie singleton │ ◄── single import for all phases
        │  version(1)      │
        │  sessions        │
        │  topicProgress   │
        │  appConfig       │
        └────────┬────────┘
                 │ Phase 1: write test record
                 ▼
        ┌─────────────────┐
        │  IndexedDB       │
        │  (browser)       │
        └─────────────────┘
```

### Recommended Project Structure

```
math-tutor/
├── index.html                  # Viewport meta, safe-area, manifest link
├── vite.config.ts              # Tailwind v4 plugin + test config
├── tsconfig.json
├── tsconfig.node.json
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                # ReactDOM.createRoot + BrowserRouter
│   ├── App.tsx                 # Routes / Route definitions
│   ├── index.css               # @import "tailwindcss" + @theme {} + body reset
│   ├── db/
│   │   └── db.ts               # Dexie singleton — single source of truth
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Remy fox + "Start Learning" button
│   │   ├── LessonScreen.tsx    # Stub: hardcoded sample lesson visual
│   │   ├── PracticeScreen.tsx  # Stub: placeholder
│   │   └── ParentScreen.tsx    # Stub: placeholder
│   ├── components/
│   │   └── RemyFox.tsx         # Inline SVG fox placeholder
│   └── types/
│       └── db.ts               # TypeScript interfaces for Dexie tables
```

### Pattern 1: Vite + React 19 + TypeScript Scaffold

**What:** `npm create vite@latest` with `react-ts` template produces a working React 19 + TypeScript 5 app with HMR, ESLint config, and correct tsconfig settings.

**When to use:** Always for greenfield React + TypeScript projects targeting Vite 6.

```bash
# Source: https://v6.vite.dev/guide/
npm create vite@latest math-tutor -- --template react-ts
```

The template produces `vite.config.ts` with `@vitejs/plugin-react` already wired. Add `@tailwindcss/vite` to the plugins array:

```typescript
// vite.config.ts
// Source: https://tailwindcss.com/docs/installation/using-vite [VERIFIED]
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

### Pattern 2: Tailwind CSS v4 CSS-First Configuration

**What:** v4 has no `tailwind.config.js`. All theme tokens live in a `@theme {}` block in the CSS file. The `@import "tailwindcss"` directive replaces the old `@tailwind base/components/utilities` directives.

**When to use:** Always with Tailwind 4.x. The v3 config file approach will not work.

```css
/* src/index.css */
/* Source: https://tailwindcss.com/docs/installation/using-vite [VERIFIED] */
/* Source: https://tailwindcss.com/docs/theme [VERIFIED] */
/* Source: https://harrisonbroadbent.com/blog/tailwind-custom-fonts/ [CITED] */

/* 1. Load Nunito from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap');

/* 2. Tailwind v4 — must come AFTER font @import */
@import "tailwindcss";

/* 3. Theme tokens: fonts and colors */
@theme {
  /* Override default sans to Nunito globally */
  --font-sans: "Nunito", ui-sans-serif, system-ui, sans-serif;

  /* Warm vibrant palette — kid-friendly primary colors */
  --color-primary:    #FF6B35;   /* warm orange */
  --color-secondary:  #FFD23F;   /* bright yellow */
  --color-accent:     #3B82F6;   /* vivid blue */
  --color-success:    #22C55E;   /* green for correct */
  --color-surface:    #FFF8F0;   /* warm off-white background */
  --color-on-surface: #1C1917;   /* near-black text */
}

/* 4. Full-screen shell reset */
html, body, #root {
  height: 100dvh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: var(--font-sans);
  background-color: var(--color-surface);
}

/* 5. iPad safe-area bottom padding for home indicator */
body {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 6. Global touch optimizations (PLAT-01) */
* {
  -webkit-tap-highlight-color: transparent;
}

button, [role="button"], a {
  touch-action: manipulation;
  user-select: none;
  min-height: 44px;
  min-width: 44px;
}
```

**Critical ordering rule:** `@import url(...)` for external fonts MUST come before `@import "tailwindcss"`. If reversed, the font import will be hoisted by the CSS processor and may conflict. [CITED: harrisonbroadbent.com/blog/tailwind-custom-fonts/]

### Pattern 3: Dexie 4 Singleton

**What:** One `db.ts` file creates and exports the Dexie instance. All phases import from this file — never re-initialize.

**When to use:** Always. Multiple Dexie instances pointing to the same database name work, but create unnecessary overhead and potential locking issues on Safari.

```typescript
// src/db/db.ts
// Source: https://dexie.org/docs/Typescript [VERIFIED via Context7]
import { Dexie, type EntityTable } from 'dexie'

// --- TypeScript interfaces ---

export interface Session {
  id?: number           // auto-incremented primary key
  topic: string         // 'addition' | 'subtraction' | 'word-problems'
  date: string          // ISO date string
  correctCount: number
  totalCount: number
}

export interface TopicProgress {
  topic: string         // primary key (natural key — one record per topic)
  accuracy: number      // 0–1 float
  attemptCount: number
  lastPracticed: string // ISO date string
}

export interface AppConfig {
  key: string           // primary key: 'pinHash' | 'lastLessonId' | 'onboardingComplete'
  value: string
}

// --- Database definition ---

const db = new Dexie('MathTutorDB') as Dexie & {
  sessions: EntityTable<Session, 'id'>
  topicProgress: EntityTable<TopicProgress, 'topic'>
  appConfig: EntityTable<AppConfig, 'key'>
}

db.version(1).stores({
  sessions:      '++id, topic, date',
  topicProgress: 'topic',            // topic is the primary key
  appConfig:     'key',              // key is the primary key
})

export { db }
```

**Phase 1 PLAT-04 proof — write and read back:**

```typescript
// Called once on HomeScreen mount to satisfy PLAT-04
import { db } from '../db/db'

async function writeAndVerifyPersistence(): Promise<boolean> {
  await db.appConfig.put({ key: 'onboardingComplete', value: 'false' })
  const record = await db.appConfig.get('onboardingComplete')
  return record?.value === 'false'
}
```

### Pattern 4: React Router 7 SPA (Declarative Mode)

**What:** BrowserRouter + Routes + Route — the simplest React Router mode for a pure client SPA. No framework mode, no loaders, no file-based routing.

**When to use:** Pure Vite SPA with no SSR, no server — exactly this project.

```tsx
// src/main.tsx
// Source: https://context7.com/remix-run/react-router [VERIFIED]
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

```tsx
// src/App.tsx
import { Routes, Route, Navigate } from 'react-router'
import HomeScreen from './screens/HomeScreen'
import LessonScreen from './screens/LessonScreen'
import PracticeScreen from './screens/PracticeScreen'
import ParentScreen from './screens/ParentScreen'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/lesson" element={<LessonScreen />} />
      <Route path="/practice" element={<PracticeScreen />} />
      <Route path="/parent" element={<ParentScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
```

**Vite dev server fallback** — Vite automatically serves `index.html` for all routes in dev mode. No `vite.config.ts` change needed. For production builds (Phase 6), a `_redirects` file or equivalent is needed. [ASSUMED — standard Vite SPA behavior, not tested in this session]

### Pattern 5: iPad Viewport HTML

**What:** The `index.html` meta viewport tag must include `viewport-fit=cover` to allow content to extend into the safe area on notched/home-indicator iPads. Without it, `env(safe-area-inset-bottom)` returns `0`.

**When to use:** Required for any touch app targeting iPad Safari.

```html
<!-- index.html -->
<!-- Source: https://webkit.org/blog/7929/designing-websites-for-iphone-x/ [CITED] -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, viewport-fit=cover"
    />
    <title>Math Tutor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Pattern 6: Remy the Fox — Phase 1 SVG Placeholder

**What:** A simple inline SVG fox shape in a React component. No external assets, no build complexity. Phase 3 replaces this with Lottie.

**When to use:** Phase 1 only. The component interface (`<RemyFox />`) stays stable — only the internals change in Phase 3.

```tsx
// src/components/RemyFox.tsx
// ASSUMED: inline SVG is the simplest Phase 1 approach
export default function RemyFox({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Remy the Fox"
      role="img"
    >
      {/* Fox body — warm orange */}
      <ellipse cx="60" cy="80" rx="35" ry="28" fill="#FF6B35" />
      {/* Fox head */}
      <circle cx="60" cy="52" r="26" fill="#FF6B35" />
      {/* Ears */}
      <polygon points="38,32 30,10 50,28" fill="#FF6B35" />
      <polygon points="82,32 90,10 70,28" fill="#FF6B35" />
      {/* Inner ears */}
      <polygon points="40,30 34,15 50,27" fill="#FFD23F" />
      <polygon points="80,30 86,15 70,27" fill="#FFD23F" />
      {/* Face */}
      <ellipse cx="60" cy="58" rx="15" ry="12" fill="#FFD23F" />
      {/* Eyes */}
      <circle cx="52" cy="48" r="4" fill="#1C1917" />
      <circle cx="68" cy="48" r="4" fill="#1C1917" />
      {/* Eye shine */}
      <circle cx="53.5" cy="46.5" r="1.5" fill="white" />
      <circle cx="69.5" cy="46.5" r="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="60" cy="57" rx="3" ry="2" fill="#1C1917" />
    </svg>
  )
}
```

### Pattern 7: Vitest + jsdom Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
```

```typescript
// vite.config.ts (test section — already shown in Pattern 1)
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/test/setup.ts',
},
```

```json
// tsconfig.json — add to compilerOptions.types
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  }
}
```

### Anti-Patterns to Avoid

- **Creating `tailwind.config.js`:** v4 does not use this file. If you create it, Tailwind ignores it silently. All config belongs in `@theme {}` in CSS.
- **Multiple Dexie instances:** Never call `new Dexie('MathTutorDB')` more than once. Import the singleton from `src/db/db.ts`.
- **`db.version(2)` without migration:** If schema changes are needed later, always provide a migration function. Phase 1 establishes version 1 — all subsequent phases import the same instance without incrementing the version unless they add tables/indexes.
- **`vh` instead of `dvh`:** `100vh` on iOS Safari equals the large viewport (with toolbar collapsed) and causes overflow when the toolbar expands. Use `100dvh`.
- **Missing `viewport-fit=cover`:** `env(safe-area-inset-bottom)` returns `0` without this meta tag attribute. Safe-area CSS is silently ineffective.
- **FastClick or other tap delay polyfills:** Not needed. `touch-action: manipulation` on body/buttons eliminates the 300ms delay on all iPadOS versions in scope. [VERIFIED: multiple sources]
- **Importing React Router from `react-router-dom`:** React Router 7 publishes as `react-router` (the DOM bindings are bundled). The old `react-router-dom` package still exists but is not needed for v7.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB access | Custom IndexedDB wrapper | Dexie 4 | IndexedDB API is verbose, error-prone, and has complex transaction semantics; Dexie handles migrations, transactions, and reactivity |
| Client-side routing | Hash-based manual router or window.history manipulation | React Router 7 BrowserRouter | History API edge cases (popstate, scroll restoration, concurrent renders) are already solved |
| CSS utility generation | Custom CSS-in-JS or hand-written utilities | Tailwind CSS v4 | Zero-runtime, native Vite integration, consistent token system that all phases extend |
| Touch delay fix | Custom touch event handler or FastClick | `touch-action: manipulation` CSS | One CSS property eliminates the delay without any JS; FastClick causes bugs on modern iOS |
| Font loading | Font file hosting and `@font-face` declarations | Google Fonts CDN via `@import url()` | CDN handles subsetting, WOFF2, caching; self-hosting is Phase 6 concern only (offline support) |

**Key insight:** In a walking skeleton phase, the goal is to wire standard parts together correctly. Building any of these from scratch would create custom code that subsequent phases must work around.

---

## Common Pitfalls

### Pitfall 1: Tailwind v4 Config File Confusion
**What goes wrong:** Developer creates `tailwind.config.js` and sets `theme.extend.colors` — classes are never generated, colors don't appear.
**Why it happens:** v3 muscle memory. v4 dropped the JavaScript config file entirely.
**How to avoid:** Define all tokens in `@theme {}` inside the CSS file. The `@tailwindcss/vite` plugin reads the CSS directly.
**Warning signs:** Custom color classes like `bg-primary` render as empty or fallback to default.

### Pitfall 2: `env(safe-area-inset-bottom)` Returns Zero
**What goes wrong:** Safe-area padding is applied in CSS but appears to have no effect on iPad. Bottom content is clipped by the home indicator.
**Why it happens:** `viewport-fit=cover` is missing from the `<meta name="viewport">` tag. Without it, the browser uses the safe layout viewport and `env()` insets evaluate to `0`.
**How to avoid:** Always include `viewport-fit=cover` in the meta viewport tag.
**Warning signs:** On a physical iPad with home indicator (iPad Pro), the bottom 34px of the UI are obscured.

### Pitfall 3: Dexie Version Increment Without Migration
**What goes wrong:** Phase 2 adds a new table and calls `db.version(2).stores(...)` without a migration — existing user data from version 1 is inaccessible or corrupted.
**Why it happens:** Dexie requires that every new version declaration include the full schema (not just deltas) when upgrading.
**How to avoid:** Phase 1 defines `version(1)` with the full v1 schema. Later phases only call `version(2)` if they genuinely add/modify tables, and they provide the complete new schema. Document this in CLAUDE.md conventions after Phase 1.
**Warning signs:** `DatabaseClosedError` or `VersionError` in the console on returning users.

### Pitfall 4: `100vh` Overflow on iPad Safari
**What goes wrong:** App has a scrollbar or overflows the screen when the Safari toolbar is visible, then jumps when the toolbar hides.
**Why it happens:** `100vh` is computed using the large viewport (toolbar collapsed). When toolbar expands, content is taller than the visible area.
**How to avoid:** Use `100dvh` instead. Apply to `html, body, #root` in the CSS reset.
**Warning signs:** Visible scroll bounce on the app shell; bottom content partially hidden behind the toolbar.

### Pitfall 5: React 19 `--legacy-peer-deps` Trap
**What goes wrong:** npm install fails with peer dependency conflicts for packages that haven't updated their peer dep declarations to include React 19.
**Why it happens:** Many packages still declare `peerDependencies: { "react": "^17 || ^18" }`. Dexie-react-hooks 4.4.0 does not have this issue (it supports React 18+).
**How to avoid:** Check each library's peer deps before adding. For Dexie + React Router 7 + Tailwind v4, no `--legacy-peer-deps` flag is needed as of the current verified versions.
**Warning signs:** `npm WARN ERESOLVE` during install.

### Pitfall 6: BrowserRouter Routes Not Matched in Vite Dev
**What goes wrong:** Navigating to `/lesson` directly in the browser shows a 404.
**Why it happens:** Vite's dev server needs to know to serve `index.html` for all routes. The `react-ts` Vite template does not configure this by default.
**How to avoid:** Add `server: { historyApiFallback: true }` to `vite.config.ts`, or use the default Vite behavior which serves `index.html` for unmatched routes in dev mode (this is automatic in Vite 6). [ASSUMED — verify during implementation]
**Warning signs:** Direct URL navigation to `/lesson` returns a 404 instead of rendering the stub screen.

---

## Code Examples

### HomeScreen with Remy and "Start Learning" Button

```tsx
// src/screens/HomeScreen.tsx
// Pattern: D-04, D-12 (44px min touch target)
import { useNavigate } from 'react-router'
import RemyFox from '../components/RemyFox'
import { db } from '../db/db'
import { useEffect } from 'react'

export default function HomeScreen() {
  const navigate = useNavigate()

  // PLAT-04: Write test record on first render to prove persistence
  useEffect(() => {
    db.appConfig.put({ key: 'onboardingComplete', value: 'false' })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full bg-surface gap-8 px-6"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <RemyFox className="w-48 h-48" />
      <h1 className="text-4xl font-extrabold text-on-surface text-center">
        Math Time!
      </h1>
      <button
        onClick={() => navigate('/lesson')}
        className="bg-primary text-white text-2xl font-bold rounded-3xl px-10 py-5 min-h-[64px] min-w-[200px] active:opacity-80"
        style={{ touchAction: 'manipulation' }}
      >
        Start Learning
      </button>
      {/* Parent access — unobtrusive, home screen only (D-03) */}
      <button
        onClick={() => navigate('/parent')}
        className="text-sm text-on-surface/40 underline min-h-[44px] min-w-[44px]"
        style={{ touchAction: 'manipulation' }}
      >
        Parent
      </button>
    </div>
  )
}
```

### IndexedDB Read-Back Verification (PLAT-04 Test)

```typescript
// src/db/db.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'

beforeEach(async () => {
  await db.appConfig.clear()
})

describe('AppConfig persistence', () => {
  it('writes and reads back a key-value record', async () => {
    await db.appConfig.put({ key: 'onboardingComplete', value: 'false' })
    const result = await db.appConfig.get('onboardingComplete')
    expect(result?.value).toBe('false')
  })

  it('overwrites existing key with put()', async () => {
    await db.appConfig.put({ key: 'pinHash', value: 'abc' })
    await db.appConfig.put({ key: 'pinHash', value: 'xyz' })
    const result = await db.appConfig.get('pinHash')
    expect(result?.value).toBe('xyz')
  })
})
```

### Full-Screen Screen Template

```tsx
// Template for all stub screens — ensures 100% viewport coverage
export default function StubScreen() {
  return (
    <div
      className="w-full flex flex-col items-center justify-center bg-surface text-on-surface"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <p className="text-2xl font-bold">Lesson Screen (stub)</p>
    </div>
  )
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` with `theme.extend` | `@theme {}` block in CSS | Tailwind v4.0 (Jan 2025) | No JS config file; CSS is the single source of truth |
| `@tailwind base/components/utilities` directives | `@import "tailwindcss"` | Tailwind v4.0 (Jan 2025) | Simpler one-liner import |
| `react-router-dom` package | `react-router` package (v7) | React Router 7.0 | DOM bindings bundled; no separate `-dom` package needed |
| `100vh` for full-screen layout | `100dvh` | CSS Spec, Safari 16.4+ | Correctly adjusts when browser toolbars show/hide |
| FastClick.js for tap delay | `touch-action: manipulation` CSS | iOS 13+ / Safari 9.3+ | No JS polyfill needed; pure CSS solution |
| Dexie v2 `Dexie` class extension | Dexie v3+ `EntityTable` TypeScript cast | Dexie 3.x | Cleaner TypeScript types; no class subclassing required |

**Deprecated / outdated:**
- `tailwind.config.js`: Ignored by Tailwind v4. Do not create it.
- `@tailwind base` directive: Not needed in v4.
- FastClick.js: Causes double-firing bugs on iOS 15+; `touch-action: manipulation` is the correct replacement.
- `react-router-dom` as separate package: v7 bundles everything in `react-router`.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vite 6 dev server automatically serves `index.html` for unmatched routes (SPA fallback behavior) | Common Pitfalls #6 | BrowserRouter direct URL navigation fails in dev; fix: add `server: { historyApiFallback: true }` to vite.config |
| A2 | React 19.2.6 + Dexie 4.4.2 + dexie-react-hooks 4.4.0 install without `--legacy-peer-deps` | Standard Stack | Peer dep conflict on npm install; fix: check dexie-react-hooks peer dep declaration and use `--legacy-peer-deps` if needed |
| A3 | Remy SVG placeholder described in Pattern 6 is an appropriate Phase 1 visual (path shapes, proportions) | Architecture Patterns | Subjective — user may want to adjust; low risk, easily replaced |
| A4 | `color-scheme` meta tag or CSS not required for this app | Not documented | Safari dark mode could invert colors; fix: add `<meta name="color-scheme" content="light">` if needed |

---

## Open Questions

1. **Self-hosted vs CDN font loading (Offline in Phase 6)**
   - What we know: Google Fonts CDN works for Phase 1. Phase 6 adds Service Worker and offline support.
   - What's unclear: Whether the Service Worker in Phase 6 will cache Google Fonts CDN responses or whether Nunito must be self-hosted then.
   - Recommendation: Use Google Fonts CDN now (simplest). Document in Phase 6 research that font self-hosting may be needed for full offline capability.

2. **Vitest + fake-indexeddb for Dexie tests**
   - What we know: jsdom does not implement IndexedDB. The Dexie tests in Pattern 7 use the real Dexie API.
   - What's unclear: Whether Vitest jsdom has IndexedDB support or whether `fake-indexeddb` npm package is needed.
   - Recommendation: Install `fake-indexeddb` as a dev dependency and configure in Vitest setup. If not needed, remove. [ASSUMED — verify during Wave 0 test setup]

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build tooling, npm scripts | Yes | v24.8.0 | — |
| npm | Package installation | Yes | (bundled with Node 24) | — |
| Internet access | Google Fonts CDN during dev | Yes (assumed) | — | Self-host Nunito font files |
| iPad Safari | PLAT-01, PLAT-02 validation | Not testable in CI | iPadOS 17+ | Use Chrome DevTools device emulation for dev; physical device for final validation |

**Missing dependencies with no fallback:**
- Physical iPad for final viewport validation (PLAT-02). Chrome DevTools emulation can approximate but does not reproduce all Safari-specific behaviors (safe-area insets, bounce scroll, audio gesture requirements).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 |
| Config file | `vite.config.ts` (test section) — needs adding in Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PLAT-01 | Interactive elements have min 44×44px touch targets and `touch-action: manipulation` | unit (component) | `npx vitest run src/screens/HomeScreen.test.tsx` | No — Wave 0 |
| PLAT-02 | `100dvh` fills screen with `env(safe-area-inset-bottom)` padding | manual (physical iPad) | N/A — Safari-specific; DevTools emulation partial | N/A |
| PLAT-03 | App opens to HomeScreen with no login prompt | unit (component) | `npx vitest run src/App.test.tsx` | No — Wave 0 |
| PLAT-04 | Write to `appConfig` → read back successfully | unit (db) | `npx vitest run src/db/db.test.ts` | No — Wave 0 |

**Manual-only justification for PLAT-02:** `env(safe-area-inset-bottom)` behavior is Safari-specific and not reproducible in jsdom or Chromium DevTools with full fidelity. Requires physical iPad or Xcode Simulator validation.

### Sampling Rate
- **Per task commit:** `npx vitest run src/db/db.test.ts` (fast, core persistence proof)
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green + manual iPad viewport check before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/test/setup.ts` — Vitest + jest-dom bootstrap
- [ ] `src/db/db.test.ts` — PLAT-04 persistence tests (template in Code Examples above)
- [ ] `src/screens/HomeScreen.test.tsx` — PLAT-01, PLAT-03 routing + touch target tests
- [ ] `src/App.test.tsx` — Routing renders correct stub screens
- [ ] `fake-indexeddb` package — needed for Dexie in jsdom test environment (`npm install -D fake-indexeddb`)
- [ ] Framework install: already in Standard Stack — no separate install step needed beyond `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

---

## Security Domain

> Phase 1 establishes no authentication, PIN handling, or user data input. Security controls for PIN (PAR-01) are deferred to Phase 5. ASVS categories below reflect what applies to the scaffold itself.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in Phase 1 |
| V3 Session Management | No | No sessions in Phase 1 |
| V4 Access Control | No | No access control in Phase 1 |
| V5 Input Validation | No | No user input in Phase 1 (button-only UI) |
| V6 Cryptography | No | No cryptography in Phase 1 |
| V13 API | No | No API calls in v1 |

**Phase 1 security surface is minimal:** local-only storage, no network calls, no user input fields, no auth. The primary security note for later phases is that PIN hashing (Phase 5) must use a proper hashing function — not stored as plaintext — but this is out of scope for Phase 1.

---

## Project Constraints (from CLAUDE.md)

| Directive | Category | Enforced How |
|-----------|----------|-------------|
| iPad web browser (Safari) — touch-first, no mouse assumptions | Platform | All interactive elements use `touch-action: manipulation`; no hover-only interactions |
| No backend accounts in v1 | Auth | No auth libraries; no network calls to any backend |
| Local device storage only | Storage | Only Dexie (IndexedDB) and localStorage; no fetch to external APIs |
| Content scope: addition, subtraction, word problems grades 1–3 | Curriculum | Out of Phase 1 scope; noted for future phases |
| Kids 6–9 audience — UI must be accessible, joyful, low-frustration | UX | Nunito font, warm colors, large touch targets, no error loops |
| All interactive elements minimum 44×44px | Touch | Enforced via CSS `min-height: 44px; min-width: 44px` on button/anchor elements |
| `touch-action: manipulation` on all tappable elements | Touch | Applied globally in CSS reset and per-component |
| `user-select: none` on lesson content | Touch | Applied in CSS on lesson content containers |
| Test in portrait (768×1024) and landscape (1024×768) | Layout | No fixed-width layouts; use `h-full`/`100dvh`, no pixel-locked widths |
| Tailwind 4.x | Stack | Use `@tailwindcss/vite` plugin; CSS-first `@theme {}` configuration |
| React 19.x | Stack | `npm create vite@latest -- --template react-ts` produces React 19 scaffold |
| Dexie 4.x | Stack | Singleton `src/db/db.ts`; `EntityTable` TypeScript pattern |
| Vite 6.x | Stack | Default template scaffold |

---

## Sources

### Primary (HIGH confidence)

- [Vite v6 Docs — Getting Started](https://v6.vite.dev/guide/) — scaffold command, react-ts template, TypeScript IntelliSense setup [VERIFIED via Context7 /websites/v6_vite_dev]
- [Tailwind CSS — Vite Installation](https://tailwindcss.com/docs/installation/using-vite) — @tailwindcss/vite plugin, @import "tailwindcss" directive [VERIFIED via WebFetch]
- [Tailwind CSS — Theme Configuration](https://tailwindcss.com/docs/theme) — @theme directive, --color-* and --font-* namespaces [VERIFIED via WebFetch]
- [Dexie.js — TypeScript](https://dexie.org/docs/Typescript) — EntityTable pattern, singleton db.ts [VERIFIED via Context7 /websites/dexie]
- [Dexie.js — React Tutorial](https://dexie.org/docs/Tutorial/React) — useLiveQuery, install commands [VERIFIED via Context7 + WebFetch]
- [React Router — Declarative Mode](https://context7.com/remix-run/react-router/llms.txt) — BrowserRouter, Routes, Route setup [VERIFIED via Context7 /remix-run/react-router]
- npm registry: dexie@4.4.2, dexie-react-hooks@4.4.0, react@19.2.6, vite@8.0.x, tailwindcss@4.3.0, @tailwindcss/vite@4.3.0, react-router@7.15.0 [VERIFIED: npm view]

### Secondary (MEDIUM confidence)

- [Harrison Broadbent — Custom fonts in Tailwind v4](https://harrisonbroadbent.com/blog/tailwind-custom-fonts/) — Google Fonts @import order, --font-sans override pattern [CITED]
- [WebKit Blog — Designing for iPhone X](https://webkit.org/blog/7929/designing-websites-for-iphone-x/) — viewport-fit=cover, env(safe-area-inset-*) [CITED — Apple official source]
- [Bram.us — Large, Small, and Dynamic Viewports](https://www.bram.us/2021/07/08/the-large-small-and-dynamic-viewports/) — 100dvh behavior on mobile Safari [CITED]
- [Chrome Developers — 300ms tap delay](https://developer.chrome.com/blog/300ms-tap-delay-gone-away) — touch-action: manipulation as the fix [CITED]

### Tertiary (LOW confidence)

- A1 (Vite SPA fallback behavior in dev): ASSUMED — standard Vite behavior not verified in this session
- A2 (No --legacy-peer-deps needed): ASSUMED — peer dep compatibility not confirmed via npm install dry run

---

## Metadata

**Confidence breakdown:**
- Standard stack versions: HIGH — verified via `npm view` on 2026-05-12
- Tailwind v4 CSS-first config: HIGH — verified via official docs WebFetch
- Dexie TypeScript pattern: HIGH — verified via Context7 official docs
- React Router 7 declarative mode: HIGH — verified via Context7
- iPad viewport patterns: MEDIUM — documented by Apple and Bram.us but not tested on physical device in this session
- Touch delay suppression: HIGH — documented by Apple, Chrome, and MDN
- Vitest setup: MEDIUM — standard setup, not verified against exact version combination

**Research date:** 2026-05-12
**Valid until:** 2026-06-12 (stable stack; Tailwind v4 minor updates are non-breaking within 4.x)
