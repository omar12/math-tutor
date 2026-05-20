---
phase: 07-lesson-catalog
plan: 01
subsystem: ui
tags: [react, dexie, useLiveQuery, useMemo, tailwind, testing-library]

# Dependency graph
requires:
  - phase: 06-pwa-offline
    provides: Dexie sessions and topicProgress tables with data
  - phase: 02-curriculum-content
    provides: 27-lesson curriculum data across addition/subtraction/word-problems topics
provides:
  - Scrollable lesson catalog on HomeScreen with 3 topic sections
  - Completion ring per lesson (session-driven)
  - Accuracy dot per lesson (topic-level accuracy)
  - Needs practice badge on weakest topic section
  - Direct lesson navigation from HomeScreen
affects:
  - ParentScreen (topic accuracy thresholds reused)
  - LessonScreen (navigated to from lesson cards)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Two-div scroll layout — fixed header zone + flex-1 overflow-y-auto inner div
    - TOPICS constant as Array<{key: Topic; label: string}> (mirrors ParentScreen)
    - Dual useLiveQuery guard (sessions === undefined || topicProgress === undefined)
    - data-testid="accuracy-dot" for reliable dot querying without fragile class selectors
    - Inline catalog JSX in single component file (no extracted LessonCard sub-component)

key-files:
  created: []
  modified:
    - src/screens/HomeScreen.tsx
    - src/screens/HomeScreen.test.tsx
    - src/App.test.tsx

key-decisions:
  - "Inline JSX over extracted LessonCard component — keeps change surface minimal and avoids new test file"
  - "RemyFox reduced from w-48 to w-32 — header zone must stay compact so catalog gets scroll space"
  - "TOPICS order determines tie-break for weakest badge — addition first (canonical order)"
  - "Accuracy dot is topic-level not lesson-level — matches existing topicProgress schema"

patterns-established:
  - "Two-div scroll layout: relative flex flex-col outer + flex-1 overflow-y-auto inner (iPad iOS rubber-band safe)"
  - "accuracy-dot data-testid: always add data-testid to ambiguous color-coded indicator spans"
  - "Dual loading guard pattern: both Dexie queries must resolve before any JSX render"

requirements-completed: [CAT-01, CAT-02, CAT-03, CAT-04]

# Metrics
duration: 4min
completed: 2026-05-20
---

# Phase 7 Plan 01: Lesson Catalog Summary

**Scrollable lesson catalog replacing HomeScreen's single Start Learning button — 3 topic sections with 27 lesson cards, completion rings from db.sessions, accuracy dots from db.topicProgress, and a Needs practice badge on the weakest topic**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-20T05:19:21Z
- **Completed:** 2026-05-20T05:23:27Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Replaced "Start Learning" single-button HomeScreen with a full scrollable catalog of all 27 lessons organized by topic (Addition, Subtraction, Word Problems)
- Each lesson card shows a checkmark completion ring (driven by db.sessions), accuracy dot with green/blue/gray states (driven by db.topicProgress), and navigates to /lesson/:lessonId on tap
- "Needs practice" badge appears on the weakest topic header (lowest accuracy in TOPICS order, hidden when no data)
- 40 tests pass in HomeScreen.test.tsx (19 unit tests including 16 new catalog tests); full suite 302 tests green, zero regressions

## Task Commits

Each task was committed atomically:

1. **Task 1: Write failing tests for the lesson catalog (RED phase)** - `549c478` (test)
2. **Task 2: Implement lesson catalog in HomeScreen.tsx (GREEN phase)** - `820ce0a` (feat)

**Plan metadata:** (docs commit follows)

_Note: TDD tasks — test commit (RED) then feat commit (GREEN)_

## Files Created/Modified
- `src/screens/HomeScreen.tsx` — Catalog implementation: TOPICS constant, sessions useLiveQuery, completedIds/accuracyMap/weakestTopic useMemo, two-div scroll layout, 27 lesson cards with rings and dots
- `src/screens/HomeScreen.test.tsx` — Replaced 3 adaptive tests with 16 new catalog tests; updated mutation guard to use catalog text
- `src/App.test.tsx` — Fixed regression: two tests that asserted 'Start Learning' updated to assert 'Math Time!' (Rule 1 auto-fix)

## Decisions Made
- **Inline JSX over extracted LessonCard component:** Keeps the change surface minimal (no new file, no new tests). Can extract later if the component grows.
- **RemyFox w-32 (reduced from w-48):** The header zone must stay compact so the lesson catalog gets enough vertical scroll space on iPad portrait (768px height).
- **TOPICS order as tie-break for weakest badge:** When two topics have equal accuracy, the first in TOPICS order (addition) wins the badge. This is deterministic and consistent with curriculum ordering.
- **Topic-level accuracy dot (not lesson-level):** Accuracy lives in db.topicProgress keyed by topic, not per-lesson — all cards in a topic section share the same dot color.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed App.test.tsx regression after removing Start Learning button**
- **Found during:** Task 2 (HomeScreen.tsx implementation, full suite run)
- **Issue:** src/App.test.tsx had two tests asserting `findByText('Start Learning')` which no longer exists after replacing the button with the catalog
- **Fix:** Updated both assertions to `findByText('Math Time!')` — the h1 heading that is always present on HomeScreen
- **Files modified:** src/App.test.tsx
- **Verification:** Full suite: 302 tests pass, 0 failures
- **Committed in:** 820ce0a (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug/regression)
**Impact on plan:** Necessary fix — removing the button broke pre-existing routing tests. Using the stable h1 heading as the HomeScreen sentinel is correct.

## Issues Encountered
None — plan executed cleanly. The App.test.tsx regression was an expected consequence of removing the button and was caught immediately by the full suite run.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Lesson catalog is live on HomeScreen; kids can browse and choose any lesson
- sortedLessons export preserved for backward compatibility with any callers
- PLAT-04 useEffect preserved
- Lock icon and Remy mascot preserved
- No blockers for subsequent phases

---
*Phase: 07-lesson-catalog*
*Completed: 2026-05-20*
