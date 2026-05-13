# Phase 1: Foundation - Pattern Map

**Mapped:** 2026-05-12
**Files analyzed:** 13 new files (greenfield — no existing codebase)
**Analogs found:** 0 / 13 (no source files exist yet — all patterns sourced from framework canonical documentation)

---

## File Classification

| New File | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `index.html` | config | request-response | Vite `react-ts` template | canonical template |
| `vite.config.ts` | config | — | Vite docs + Tailwind v4 Vite plugin docs | canonical template |
| `tsconfig.json` | config | — | Vite `react-ts` template | canonical template |
| `src/main.tsx` | provider | request-response | React Router 7 BrowserRouter docs | canonical |
| `src/App.tsx` | router | request-response | React Router 7 Routes/Route docs | canonical |
| `src/index.css` | config | — | Tailwind v4 CSS-first docs | canonical — non-obvious (v4 breaking change) |
| `src/db/db.ts` | model | CRUD | Dexie 4 TypeScript singleton docs | canonical — non-obvious (EntityTable pattern) |
| `src/types/db.ts` | model | — | Dexie 4 TypeScript docs | canonical |
| `src/screens/HomeScreen.tsx` | component | request-response | RESEARCH.md Code Examples | project-specific |
| `src/screens/LessonScreen.tsx` | component | request-response | RESEARCH.md full-screen stub template | project-specific |
| `src/screens/PracticeScreen.tsx` | component | request-response | RESEARCH.md full-screen stub template | project-specific |
| `src/screens/ParentScreen.tsx` | component | request-response | RESEARCH.md full-screen stub template | project-specific |
| `src/components/RemyFox.tsx` | component | — | RESEARCH.md SVG placeholder pattern | project-specific |
| `src/test/setup.ts` | config | — | Vitest + @testing-library/jest-dom docs | canonical |
| `src/db/db.test.ts` | test | CRUD | RESEARCH.md Dexie test examples | canonical |
| `src/screens/HomeScreen.test.tsx` | test | request-response | @testing-library/react docs | canonical |
| `src/App.test.tsx` | test | request-response | @testing-library/react docs | canonical |

---

## Pattern Assignments

### `index.html` (config)

**Analog:** Vite `react-ts` template — extended with iPad viewport requirements (PLAT-02)

**Non-obvious flag:** `viewport-fit=cover` is required. Without it, `env(safe-area-inset-bottom)` returns `0` on iPad, silently breaking safe-area padding. Also: no `color-scheme` meta tag means Safari dark mode may invert colors — add `content="light"` to lock it (A4 from research).

**Full file pattern:**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, viewport-fit=cover"
    />
    <meta name="color-scheme" content="light" />
    <title>Math Tutor</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Source: RESEARCH.md Pattern 5 + WebKit Blog on viewport-fit.

---

### `vite.config.ts` (config)

**Analog:** Vite docs + Tailwind v4 Vite plugin docs + Vitest config docs

**Non-obvious flag:** Two plugins must be registered: `@vitejs/plugin-react` (from template) AND `tailwindcss()` (from `@tailwindcss/vite`). The Vitest `test` block lives in the same file. Do not create a separate `vitest.config.ts`.

**Full file pattern:**
```typescript
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

Source: RESEARCH.md Pattern 1 (Tailwind v4 Vite installation docs, verified).

---

### `src/index.css` (config — design tokens)

**Analog:** Tailwind CSS v4 CSS-first configuration docs

**Non-obvious flag:** This is the single most likely source of implementer error. There is NO `tailwind.config.js` in v4. All theme tokens (colors, fonts) live in `@theme {}` inside this CSS file. The `@import url(...)` for Google Fonts MUST come before `@import "tailwindcss"` — if reversed, the CSS processor hoists the font import and may conflict.

Color token values (Claude's discretion per CONTEXT.md D-10):
- `--color-primary: #FF6B35` — warm orange (matches Remy's fur, primary CTA)
- `--color-secondary: #FFD23F` — bright yellow (accent highlights)
- `--color-accent: #3B82F6` — vivid blue (contrast element)
- `--color-success: #22C55E` — green (correct answer feedback)
- `--color-surface: #FFF8F0` — warm off-white (background)
- `--color-on-surface: #1C1917` — near-black (body text)

**Full file pattern:**
```css
/* 1. Google Fonts — MUST come before @import "tailwindcss" */
@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap');

/* 2. Tailwind v4 — single directive replaces @tailwind base/components/utilities */
@import "tailwindcss";

/* 3. Theme tokens (CSS-first; no tailwind.config.js) */
@theme {
  --font-sans: "Nunito", ui-sans-serif, system-ui, sans-serif;

  --color-primary:    #FF6B35;
  --color-secondary:  #FFD23F;
  --color-accent:     #3B82F6;
  --color-success:    #22C55E;
  --color-surface:    #FFF8F0;
  --color-on-surface: #1C1917;
}

/* 4. Full-screen shell reset — use 100dvh NOT 100vh (PLAT-02) */
html, body, #root {
  height: 100dvh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: var(--font-sans);
  background-color: var(--color-surface);
}

/* 5. iPad safe-area — requires viewport-fit=cover in index.html */
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

Source: RESEARCH.md Pattern 2 (Tailwind CSS docs + harrisonbroadbent.com font ordering, verified).

---

### `src/db/db.ts` (model, CRUD)

**Analog:** Dexie 4 TypeScript singleton docs

**Non-obvious flag:** Dexie 4 uses `EntityTable<T, PrimaryKey>` TypeScript cast on the `Dexie` instance — not a class extension. The singleton is created once and exported; all other files import `{ db }` from this file. Never call `new Dexie('MathTutorDB')` anywhere else.

Schema is the full v1 schema (D-07, D-08). Do not add tables beyond `sessions`, `topicProgress`, `appConfig`.

**Full file pattern:**
```typescript
// src/db/db.ts
import { Dexie, type EntityTable } from 'dexie'

export interface Session {
  id?: number
  topic: string         // 'addition' | 'subtraction' | 'word-problems'
  date: string          // ISO date string
  correctCount: number
  totalCount: number
}

export interface TopicProgress {
  topic: string         // primary key — one record per topic
  accuracy: number      // 0–1 float
  attemptCount: number
  lastPracticed: string // ISO date string
}

export interface AppConfig {
  key: string           // primary key: 'pinHash' | 'lastLessonId' | 'onboardingComplete'
  value: string
}

const db = new Dexie('MathTutorDB') as Dexie & {
  sessions: EntityTable<Session, 'id'>
  topicProgress: EntityTable<TopicProgress, 'topic'>
  appConfig: EntityTable<AppConfig, 'key'>
}

db.version(1).stores({
  sessions:      '++id, topic, date',
  topicProgress: 'topic',
  appConfig:     'key',
})

export { db }
```

Source: RESEARCH.md Pattern 3 (Dexie 4 TypeScript docs, verified via Context7).

**Anti-pattern warning:** Do NOT call `db.version(2)` in later phases unless genuinely adding/modifying tables — and always provide the complete new schema, not just deltas.

---

### `src/types/db.ts` (model)

**Note:** The interfaces (`Session`, `TopicProgress`, `AppConfig`) are co-located in `src/db/db.ts` and exported from there. A separate `src/types/db.ts` is optional — if created, it should re-export from `src/db/db.ts` to avoid duplication, or the interfaces can be moved here and imported into `src/db/db.ts`. Planner should pick one approach and be consistent.

---

### `src/main.tsx` (provider)

**Analog:** React Router 7 BrowserRouter declarative mode docs

**Non-obvious flag:** React Router 7 imports from `react-router`, NOT `react-router-dom`. The old `-dom` package still exists on npm but is not needed for v7.

**Full file pattern:**
```tsx
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

Source: RESEARCH.md Pattern 4 (React Router 7 docs, verified via Context7).

---

### `src/App.tsx` (router)

**Analog:** React Router 7 Routes/Route docs

**Route naming (Claude's discretion per CONTEXT.md):** `/`, `/lesson`, `/practice`, `/parent`. Catch-all redirects to `/`.

**Full file pattern:**
```tsx
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

Source: RESEARCH.md Pattern 4.

---

### `src/screens/HomeScreen.tsx` (component, request-response)

**Analog:** RESEARCH.md Code Examples — HomeScreen with Remy and "Start Learning" button

**Key decisions to enforce:**
- D-04: Remy fox + single "Start Learning" CTA — no other decisions for the child
- D-03: Parent button is small, unobtrusive, text-only (not a colored button)
- D-05: "Start Learning" navigates to `/lesson`
- D-09: `useEffect` on mount writes test record to `appConfig` (PLAT-04 proof)
- D-12: All buttons must be min 44×44px; `touch-action: manipulation` inline style

**Imports pattern:**
```tsx
import { useNavigate } from 'react-router'
import { useEffect } from 'react'
import RemyFox from '../components/RemyFox'
import { db } from '../db/db'
```

**Core pattern:**
```tsx
export default function HomeScreen() {
  const navigate = useNavigate()

  // PLAT-04: Persistence proof — write test record on mount
  useEffect(() => {
    db.appConfig.put({ key: 'onboardingComplete', value: 'false' })
  }, [])

  return (
    <div
      className="flex flex-col items-center justify-center h-full bg-surface gap-8 px-6"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <RemyFox className="w-48 h-48" />
      <h1 className="text-4xl font-extrabold text-on-surface text-center">
        Math Time!
      </h1>
      {/* Primary CTA — large touch target (D-12) */}
      <button
        onClick={() => navigate('/lesson')}
        className="bg-primary text-white text-2xl font-bold rounded-3xl px-10 py-5 min-h-[64px] min-w-[200px] active:opacity-80"
        style={{ touchAction: 'manipulation' }}
      >
        Start Learning
      </button>
      {/* Parent access — unobtrusive (D-03), still meets 44px minimum */}
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

Source: RESEARCH.md Code Examples section.

---

### `src/screens/LessonScreen.tsx`, `src/screens/PracticeScreen.tsx`, `src/screens/ParentScreen.tsx` (component, request-response)

**Analog:** RESEARCH.md — Full-Screen Screen Template

**These are Phase 1 stubs.** LessonScreen should feel visually intentional per CONTEXT.md specifics (not just placeholder text). PracticeScreen and ParentScreen are minimal stubs.

**Core pattern (all three screens share this shell):**
```tsx
export default function LessonScreen() {
  return (
    <div
      className="w-full flex flex-col items-center justify-center bg-surface text-on-surface"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* LessonScreen: hardcoded sample content that looks intentional (D-05) */}
      <p className="text-2xl font-bold">What is 2 + 3?</p>
    </div>
  )
}
```

**Viewport rule:** Use `height: '100dvh'` inline style (not Tailwind `h-screen` which uses `100vh`) — Tailwind's `h-dvh` utility may work in v4 but the inline style is safer and more explicit for Safari.

Source: RESEARCH.md Code Examples — Full-Screen Screen Template.

---

### `src/components/RemyFox.tsx` (component)

**Analog:** RESEARCH.md Pattern 6 — Remy Phase 1 SVG Placeholder

**Key note:** The component interface `<RemyFox className?: string />` must stay stable. Phase 3 replaces the SVG internals with a Lottie animation — the prop signature does not change.

**Full component pattern:**
```tsx
export default function RemyFox({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Remy the Fox"
      role="img"
    >
      {/* Fox body */}
      <ellipse cx="60" cy="80" rx="35" ry="28" fill="#FF6B35" />
      {/* Fox head */}
      <circle cx="60" cy="52" r="26" fill="#FF6B35" />
      {/* Ears */}
      <polygon points="38,32 30,10 50,28" fill="#FF6B35" />
      <polygon points="82,32 90,10 70,28" fill="#FF6B35" />
      {/* Inner ears */}
      <polygon points="40,30 34,15 50,27" fill="#FFD23F" />
      <polygon points="80,30 86,15 70,27" fill="#FFD23F" />
      {/* Muzzle */}
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

Source: RESEARCH.md Pattern 6 (assumed — Phase 1 visual placeholder).

---

### `src/test/setup.ts` (config — test bootstrap)

**Analog:** Vitest + @testing-library/jest-dom docs

**Non-obvious flag:** jsdom does not implement IndexedDB. Install `fake-indexeddb` as a dev dependency and configure it here so Dexie tests run in Vitest. Without this, all `db.test.ts` assertions will fail with `IDBFactory is not defined`.

**Full file pattern:**
```typescript
import '@testing-library/jest-dom/vitest'
// Provide fake IndexedDB for Dexie tests in jsdom
import 'fake-indexeddb/auto'
```

**Additional install needed:** `npm install -D fake-indexeddb`

Source: RESEARCH.md Pattern 7 + Open Question #2 resolution.

---

### `src/db/db.test.ts` (test, CRUD)

**Analog:** RESEARCH.md Code Examples — IndexedDB Read-Back Verification

**Tests PLAT-04.** Must use fake-indexeddb (configured in setup.ts). Pattern for all Dexie tests: `beforeEach` clears the relevant table, each `it` writes and reads back.

**Full file pattern:**
```typescript
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

Source: RESEARCH.md Code Examples section.

---

### `src/screens/HomeScreen.test.tsx` (test, request-response)

**Analog:** @testing-library/react render pattern

**Tests PLAT-01 (44px touch targets) and PLAT-03 (no login prompt, opens to home).**

**Core pattern:**
```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import HomeScreen from './HomeScreen'

// Wrap with MemoryRouter since HomeScreen uses useNavigate
function renderHomeScreen() {
  return render(
    <MemoryRouter>
      <HomeScreen />
    </MemoryRouter>
  )
}

describe('HomeScreen', () => {
  it('renders the Start Learning button', () => {
    renderHomeScreen()
    expect(screen.getByText('Start Learning')).toBeInTheDocument()
  })

  it('renders the Parent button', () => {
    renderHomeScreen()
    expect(screen.getByText('Parent')).toBeInTheDocument()
  })

  it('Start Learning button meets 44px minimum touch target', () => {
    renderHomeScreen()
    const btn = screen.getByText('Start Learning')
    // min-h-[64px] class applied — larger than 44px minimum
    expect(btn).toHaveClass('min-h-[64px]')
  })
})
```

---

### `src/App.test.tsx` (test, request-response)

**Analog:** @testing-library/react + React Router MemoryRouter

**Tests PLAT-03 (app opens to HomeScreen with no login prompt) and routing renders correct stub screens.**

**Core pattern:**
```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from './App'

describe('App routing', () => {
  it('renders HomeScreen at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Start Learning')).toBeInTheDocument()
  })

  it('renders LessonScreen at /lesson', () => {
    render(
      <MemoryRouter initialEntries={['/lesson']}>
        <App />
      </MemoryRouter>
    )
    // Adjust assertion to match whatever text LessonScreen renders
    expect(screen.getByText(/lesson/i)).toBeInTheDocument()
  })
})
```

---

## Shared Patterns

### Full-Screen Layout Shell
**Apply to:** All screen components (`HomeScreen`, `LessonScreen`, `PracticeScreen`, `ParentScreen`)

Every screen must fill the viewport using `100dvh` (not `100vh`) and respect safe-area insets:
```tsx
style={{
  height: '100dvh',
  paddingTop: 'env(safe-area-inset-top)',
  paddingBottom: 'env(safe-area-inset-bottom)',
}}
```
Alternatively, the `HomeScreen` pattern uses `h-full` on the container and relies on the CSS reset setting `#root { height: 100dvh }`. Both approaches work — be consistent.

### Touch Target Rule (D-12, PLAT-01)
**Apply to:** All interactive elements across all screens

Every `<button>`, `<a>`, and `[role="button"]` element must have:
- `min-height: 44px` and `min-width: 44px` (enforced globally in `index.css`)
- `touch-action: manipulation` (enforced globally in `index.css` for `button, [role="button"], a`)
- Per-component override for visual sizing: primary CTAs use `min-h-[64px]` for prominence

### Dexie Import Pattern
**Apply to:** All files that read or write to IndexedDB

```typescript
import { db } from '../db/db'
// or (from deeper paths):
import { db } from '../../db/db'
```

Never: `import { Dexie } from 'dexie'` and construct a new instance.

### React Router Navigation
**Apply to:** All screen components that trigger navigation

```tsx
import { useNavigate } from 'react-router'
// ...
const navigate = useNavigate()
navigate('/lesson')        // forward navigation
navigate('/', { replace: true })  // replace history (D-02 forward-only flow)
```

Note D-02: Child flow is forward-only. Use `navigate('/next-screen')` not `navigate(-1)`. The back button pattern is not used in child-facing screens.

### Tailwind Color Token Usage
**Apply to:** All components

Custom color tokens defined in `@theme {}` are available as Tailwind utilities:
```
bg-primary       → background: #FF6B35
text-primary     → color: #FF6B35
bg-secondary     → background: #FFD23F
bg-accent        → background: #3B82F6
bg-success       → background: #22C55E
bg-surface       → background: #FFF8F0
text-on-surface  → color: #1C1917
```

### Test Wrapper Pattern
**Apply to:** All component tests that use React Router hooks

Any component using `useNavigate` or `useParams` must be wrapped in `<MemoryRouter>` in tests:
```tsx
import { MemoryRouter } from 'react-router'
render(<MemoryRouter><ComponentUnderTest /></MemoryRouter>)
```

---

## Non-Obvious Patterns — High Priority Flags

| File | Flag | Risk |
|------|------|------|
| `src/index.css` | Tailwind v4: NO `tailwind.config.js`. All tokens in `@theme {}` inside CSS. `@import url(fonts)` BEFORE `@import "tailwindcss"`. | HIGH — silent failure; classes generate but custom colors don't appear |
| `index.html` | Must include `viewport-fit=cover` in meta viewport. | HIGH — `env(safe-area-inset-bottom)` silently returns 0 without it |
| `src/main.tsx` | Import from `react-router`, NOT `react-router-dom`. | MEDIUM — wrong package still exists on npm and will install without error |
| `src/db/db.ts` | Dexie v4 uses `EntityTable` cast, NOT class extension. Single export; never re-instantiate. | HIGH — multiple instances cause Safari locking issues |
| `src/test/setup.ts` | Must install `fake-indexeddb` and import `fake-indexeddb/auto`. jsdom has no IndexedDB. | HIGH — all Dexie tests fail without this |
| All screens | Use `100dvh` not `100vh`. Tailwind's `h-screen` uses `100vh` — avoid it. | MEDIUM — causes overflow/jump on iPad when toolbar shows |

---

## No Analog Found

Not applicable — this is a greenfield project. All patterns are sourced from official framework documentation and canonical examples in RESEARCH.md. The files below have no direct framework-canonical example and rely on project-specific decisions:

| File | Role | Reason |
|------|------|--------|
| `src/components/RemyFox.tsx` | component | Project-specific SVG; shape/proportions from RESEARCH.md Pattern 6 (assumed) |
| `src/screens/HomeScreen.tsx` | screen | Project-specific layout; composition derived from RESEARCH.md Code Examples |
| `src/screens/LessonScreen.tsx` | screen | Stub content is project-specific; shell pattern is canonical |

---

## Metadata

**Analog search scope:** No existing source files — greenfield project
**Files scanned:** 0 (no codebase exists)
**Pattern sources:** RESEARCH.md (all patterns verified against official docs as of 2026-05-12)
**Pattern extraction date:** 2026-05-12
**Stack versions locked:** React 19.2.6, Vite 6.x, Tailwind CSS 4.3.0, React Router 7.15.0, Dexie 4.4.2, TypeScript 5.8.x, Vitest 4.1.6
