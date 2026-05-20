---
phase: 01-foundation
plan: 02
subsystem: ui
tags: [react, tailwind, dexie, react-router, vitest, svg, homescreen]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: Dexie singleton, routing shell, Tailwind v4 tokens, Vitest infra
provides:
  - RemyFox SVG mascot component with stable className prop (Phase 3 will swap internals with Lottie)
  - Real HomeScreen with DB write-on-mount, Start Learning CTA, Parent entry
  - Styled LessonScreen stub with "3 + 4 = ?" card
  - Styled PracticeScreen stub with 4 answer tile placeholders
  - Styled ParentScreen stub (no PIN gate — Phase 5)
  - 11 automated tests covering routing, touch targets, DB persistence
affects: [phase-2, phase-3, phase-4, phase-5]

# Tech tracking
tech-stack:
  added: []
  patterns: [remy-fox-stable-interface, homescreen-db-write-on-mount, forward-only-navigation, touch-first-no-hover]

key-files:
  created:
    - src/components/RemyFox.tsx
    - src/screens/HomeScreen.tsx
    - src/screens/HomeScreen.test.tsx
    - src/App.test.tsx
  modified:
    - src/screens/LessonScreen.tsx
    - src/screens/PracticeScreen.tsx
    - src/screens/ParentScreen.tsx

key-decisions:
  - "RemyFox className prop interface frozen — Phase 3 replaces SVG internals with Lottie, prop must stay identical"
  - "HomeScreen writes onboardingComplete=false on every mount (idempotent DB write proves PLAT-04)"
  - "ParentScreen has no PIN gate — deferred to Phase 5 per plan"
  - "No hover states on any element — touch-first rule (D-01)"

patterns-established:
  - "Pattern: Forward-only navigation — useNavigate('/lesson'), never navigate(-1)"
  - "Pattern: Mascot component interface — className?: string only, internals are replaceable"
  - "Pattern: DB write on mount — useEffect(()=>{ db.appConfig.put(...) }, [])"
  - "Pattern: MemoryRouter wrapping for component tests that use useNavigate"

requirements-completed: [PLAT-01, PLAT-02, PLAT-03, PLAT-04]

# Metrics
duration: ~25min
completed: 2026-05-13
---

# Plan 01-02: HomeScreen + Walking Skeleton UI Summary

**Remy the Fox SVG mascot, real HomeScreen with IndexedDB write-on-mount, three styled stub screens, and 11 automated tests proving routing, touch targets, and DB persistence**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-05-13
- **Completed:** 2026-05-13
- **Tasks:** 2 + checkpoint
- **Files modified:** 7

## Accomplishments
- RemyFox SVG component with frozen className prop interface (Phase 3 Lottie swap ready)
- HomeScreen: Remy + "Math Time!" + "Start Learning" (64px, orange) + "Parent" (44px, de-emphasized) + PLAT-04 DB write on mount
- Three styled stub screens fill 100dvh with intentional layouts (lesson card, 4 practice tiles, parent heading)
- 11 tests passing: 2 DB persistence, 5 routing, 4 HomeScreen (touch targets + aria)

## Task Commits

1. **Task 1: RemyFox SVG + real HomeScreen** — `da47b2b` (feat)
2. **Task 2: Styled stubs + routing/touch tests** — `31c43d0` (feat)

## Files Created/Modified
- `src/components/RemyFox.tsx` — Inline SVG fox, role=img, aria-label="Remy the Fox"
- `src/screens/HomeScreen.tsx` — Real home with DB write, CTA, parent entry
- `src/screens/LessonScreen.tsx` — Styled stub: "3 + 4 = ?" card
- `src/screens/PracticeScreen.tsx` — Styled stub: 4 answer tile grid
- `src/screens/ParentScreen.tsx` — Styled stub: "Parent View" heading
- `src/screens/HomeScreen.test.tsx` — 4 tests: buttons, touch targets, Remy aria
- `src/App.test.tsx` — 5 routing tests including catch-all redirect

## Decisions Made
- Human checkpoint approved implicitly — user proceeded to Phase 2 execution confirming Phase 1 complete

## Deviations from Plan
None — plan executed exactly as written.

## Next Phase Readiness
- Phase 2 (Curriculum & Content): needs planning before execution
- All Phase 1 infrastructure stable: routing, DB, tokens, test infra all green

---
*Phase: 01-foundation*
*Completed: 2026-05-13*
