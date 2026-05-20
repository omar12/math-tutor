---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [vite, react, typescript, tailwind, dexie, indexeddb, vitest, react-router]

# Dependency graph
requires: []
provides:
  - Vite 6 + React 19 + TypeScript 5 project scaffold
  - Tailwind v4 CSS-first configuration with iPad-safe tokens
  - Dexie 4 singleton (MathTutorDB) with 3-table v1 schema
  - React Router 7 routing shell with 4 routes + catch-all
  - Vitest + fake-indexeddb test infrastructure
  - iPad viewport (viewport-fit=cover, color-scheme=light)
affects: [all subsequent phases]

# Tech tracking
tech-stack:
  added: [react@19, react-router@7, dexie@4, dexie-react-hooks, tailwindcss@4, "@tailwindcss/vite", vitest, "@testing-library/react", "@testing-library/jest-dom", jsdom, fake-indexeddb]
  patterns: [css-first-tailwind-v4, dexie-singleton, react-router-v7-browser-router, fake-indexeddb-vitest]

key-files:
  created:
    - vite.config.ts
    - src/index.css
    - src/db/db.ts
    - src/main.tsx
    - src/App.tsx
    - src/test/setup.ts
    - src/db/db.test.ts
    - src/screens/HomeScreen.tsx (stub)
    - src/screens/LessonScreen.tsx (stub)
    - src/screens/PracticeScreen.tsx (stub)
    - src/screens/ParentScreen.tsx (stub)
  modified:
    - index.html
    - package.json
    - tsconfig.json

key-decisions:
  - "Tailwind v4 CSS-first — @theme{} in src/index.css, no tailwind.config.js"
  - "BrowserRouter from 'react-router' not 'react-router-dom' (v7 unified package)"
  - "All stub screens use height:100dvh inline style, not h-screen (100vh)"
  - "fake-indexeddb imported in setup.ts provides IndexedDB for all Vitest tests"

patterns-established:
  - "Pattern: Dexie singleton — import { db } from '../db/db', never new Dexie() elsewhere"
  - "Pattern: Safe-area padding via paddingBottom: env(safe-area-inset-bottom) inline style"
  - "Pattern: Touch targets — min-h-[44px] min-w-[44px] on all interactive elements"
  - "Pattern: Full-screen containers use height:100dvh inline style (not Tailwind h-screen)"

requirements-completed: [PLAT-01, PLAT-02, PLAT-03, PLAT-04]

# Metrics
duration: ~35min
completed: 2026-05-13
---

# Plan 01-01: Stack Scaffold + Dexie Schema Summary

**Vite 6 + React 19 + TypeScript 5 scaffold with Tailwind v4 CSS-first tokens, Dexie 4 IndexedDB singleton (3-table v1 schema), React Router 7 routing, and Vitest + fake-indexeddb test infrastructure**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-05-13
- **Completed:** 2026-05-13
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Full dependency stack installed and wired: React Router 7, Dexie 4, Tailwind v4, Vitest
- Dexie singleton `MathTutorDB` with sessions/topicProgress/appConfig tables — single source of truth for all phases
- iPad viewport meta (`viewport-fit=cover`, `color-scheme=light`) and Nunito font token registered
- 2 Dexie persistence tests passing (appConfig write/read-back and overwrite)

## Files Created/Modified
- `vite.config.ts` — Tailwind v4 plugin + Vitest jsdom config
- `src/index.css` — CSS-first Tailwind v4 with @theme tokens and full-screen reset
- `src/db/db.ts` — Dexie 4 singleton, 3-table v1 schema, exported interfaces
- `src/test/setup.ts` — jest-dom + fake-indexeddb for all Vitest runs
- `src/db/db.test.ts` — 2 automated PLAT-04 persistence tests
- `src/main.tsx` — React 19 + BrowserRouter from 'react-router'
- `src/App.tsx` — 4 routes + catch-all Navigate
- `src/screens/*.tsx` — 4 stub screens with 100dvh containers
- `index.html` — iPad viewport meta

## Decisions Made
- BrowserRouter imported from `react-router` (v7 unified, not react-router-dom)
- Stub screens use `height: '100dvh'` inline style — Tailwind `h-screen` resolves to 100vh which breaks iPad full-screen

## Deviations from Plan
- `npm create vite@latest .` deleted `.planning/` directory during scaffold. Restored via `git restore .planning/ CLAUDE.md`. No data lost.

## Issues Encountered
- Vite scaffolder wiped .planning/ from disk (untracked by Vite's template). Fixed: `git restore .planning/ CLAUDE.md`.

## Next Phase Readiness
- Wave 2 (Plan 01-02): HomeScreen with Remy Fox SVG, styled stub screens, routing tests
- All infrastructure stable — no blockers

---
*Phase: 01-foundation*
*Completed: 2026-05-13*
