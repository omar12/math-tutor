# Walking Skeleton: Phase 1 — Foundation

## What it proves

The walking skeleton verifies that every plumbing layer of the stack is wired
end-to-end and works together on a real device:

1. **Vite 6 + React 19 + TypeScript 5** — `npm run dev` starts without errors
2. **Tailwind CSS v4 CSS-first** — custom `@theme {}` tokens (colors, font) render correctly in the browser; no `tailwind.config.js` needed
3. **React Router 7 (BrowserRouter)** — navigating from `/` to `/lesson` updates the URL and renders a different screen without a page reload
4. **Dexie 4 (IndexedDB singleton)** — a record written to `appConfig` on HomeScreen mount survives closing and reopening the browser tab
5. **iPad viewport** — `100dvh` + `env(safe-area-inset-bottom)` + `viewport-fit=cover` fill the screen correctly with no overflow or dead space
6. **Vitest + fake-indexeddb** — automated test suite runs green and proves DB round-trip without a physical device

## Deliverables

| File | Role |
|------|------|
| `index.html` | iPad viewport meta (`viewport-fit=cover`, `color-scheme: light`) |
| `vite.config.ts` | Tailwind v4 plugin + Vitest jsdom config |
| `src/index.css` | Google Fonts + `@import "tailwindcss"` + `@theme {}` tokens + full-screen reset |
| `src/main.tsx` | `ReactDOM.createRoot` + `BrowserRouter` wrapper |
| `src/App.tsx` | `Routes` / `Route` for `/`, `/lesson`, `/practice`, `/parent` + catch-all redirect |
| `src/db/db.ts` | Dexie singleton — `MathTutorDB` v1 schema (`sessions`, `topicProgress`, `appConfig`) |
| `src/test/setup.ts` | `@testing-library/jest-dom` + `fake-indexeddb/auto` bootstrap |
| `src/db/db.test.ts` | Automated PLAT-04 proof: write → read-back `appConfig` record |
| `src/screens/HomeScreen.tsx` | Remy the Fox SVG + "Start Learning" button + DB write on mount + "Parent" entry |
| `src/components/RemyFox.tsx` | Inline SVG fox placeholder (stable `className?: string` interface) |
| `src/screens/LessonScreen.tsx` | Styled stub with "3 + 4 = ?" sample problem card |
| `src/screens/PracticeScreen.tsx` | Styled stub with 4 placeholder answer tiles |
| `src/screens/ParentScreen.tsx` | Styled stub with progress placeholder copy |

## The Thin Slice

**User journey that proves routing + DB work together:**

1. User opens the app in iPad Safari — HomeScreen renders with Remy and "Start Learning"
2. On mount, HomeScreen writes `{ key: 'onboardingComplete', value: 'false' }` to `appConfig` in IndexedDB (PLAT-04)
3. User taps "Start Learning" — React Router navigates to `/lesson` without page reload
4. User closes the browser tab
5. User reopens the tab — the `appConfig` record is still in IndexedDB

This single journey exercises the viewport shell, React rendering, React Router navigation, and Dexie persistence in one unbroken flow.

## Definition of Done

- [ ] `npm run dev` starts without errors and serves the app at `localhost:5173`
- [ ] Opening `localhost:5173` in a browser renders the HomeScreen (Remy fox visible, "Start Learning" button visible)
- [ ] Tapping "Start Learning" navigates to `/lesson` (URL changes, screen changes, no full reload)
- [ ] Tapping the "Parent" button navigates to `/parent`
- [ ] Closing and reopening the tab: DevTools → Application → IndexedDB → MathTutorDB → appConfig shows the `onboardingComplete` record
- [ ] `npx vitest run` exits 0 with all tests green (db round-trip tests pass)
- [ ] App background is `#FFF8F0` warm off-white (Tailwind v4 custom token rendered)
- [ ] "Start Learning" button is orange (`#FF6B35`) with white text
