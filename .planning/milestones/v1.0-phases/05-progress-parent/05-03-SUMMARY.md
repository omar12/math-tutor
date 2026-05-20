---
phase: 05-progress-parent
plan: "03"
subsystem: progress-ui
tags: [parent-dashboard, adaptive-learning, progress-bars, home-screen]
dependency_graph:
  requires:
    - 05-01  # db.topicProgress table + session recording
  provides:
    - ProgressBar component (accuracy clamped, ARIA progressbar, bg-success/bg-accent)
    - ParentScreen with topic synthesis (all 3 topics always visible)
    - HomeScreen lock icon (navigate /pin)
    - HomeScreen memoized adaptive lesson ordering
  affects:
    - src/screens/HomeScreen.tsx
    - src/screens/ParentScreen.tsx
    - src/App.tsx (added /lesson/:lessonId route)
tech_stack:
  added: []
  patterns:
    - useLiveQuery (dexie-react-hooks) for reactive DB reads in ParentScreen and HomeScreen
    - useMemo([topicProgress]) to memoize sortedLessons — avoids re-sort on every render
    - spread-before-sort: [...lessons].sort(...) — curriculum array never mutated
    - topic normalization loop: synthesize all 3 topics from DB before render
key_files:
  created:
    - src/components/ProgressBar.tsx
    - src/screens/ParentScreen.test.tsx
  modified:
    - src/screens/ParentScreen.tsx
    - src/screens/HomeScreen.tsx
    - src/screens/HomeScreen.test.tsx
    - src/App.tsx
decisions:
  - "ProgressBar uses Math.min(1, Math.max(0, accuracy)) clamp — corrupted DB values cannot overflow the fill bar"
  - "ParentScreen synthesizes all 3 topics with hasData=false for missing ones before render — topic rows never absent"
  - "Empty-state renders topic rows with — (hasData=false) rather than hiding them — consistent layout"
  - "sortedLessons treats unknown topics as accuracy=1.0 (not struggling) so they sort to the end"
  - "App.tsx got /lesson/:lessonId route — adaptive HomeScreen navigation required a parameterized route"
metrics:
  duration: "3m 33s"
  completed: "2026-05-17"
  tasks: 2
  files: 6
requirements:
  - PROG-02
  - PAR-02
---

# Phase 05 Plan 03: Parent Dashboard & HomeScreen Adaptive Ordering Summary

ProgressBar component with accuracy clamping, ParentScreen with 3-topic synthesis and useLiveQuery, HomeScreen lock icon navigating to /pin, and memoized adaptive lesson ordering using sortedLessons([...lessons].sort()).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | ProgressBar + ParentScreen with tests | fcb0d50 | src/components/ProgressBar.tsx, src/screens/ParentScreen.tsx, src/screens/ParentScreen.test.tsx |
| 2 | HomeScreen lock icon, adaptive ordering, extended tests | 0070e0a | src/screens/HomeScreen.tsx, src/screens/HomeScreen.test.tsx, src/App.tsx |

## What Was Built

### ProgressBar component (`src/components/ProgressBar.tsx`)
- Named export `ProgressBar` with props `{ label, accuracy, hasData }`
- When `hasData=false`: renders label + `—`, no progressbar element
- When `hasData=true`: clamps accuracy with `Math.min(1, Math.max(0, accuracy))`, computes `pct = Math.round(clamped * 100)`
- Fill color: `bg-success` (green) when accuracy >= 0.7, `bg-accent` (blue) below
- ARIA: `role="progressbar"`, `aria-valuenow={pct}`, `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-label="${label}: ${pct}%"`

### ParentScreen (`src/screens/ParentScreen.tsx`)
- `useLiveQuery(() => db.topicProgress.toArray())` — loading state while undefined
- `TOPICS` array defines all 3 topics; normalization loop synthesizes missing topics with `hasData=false`
- Empty-state path (`progress.length === 0`): friendly message "No practice sessions yet..." + shows topic rows with `—`
- Data path: shows filled ProgressBar per topic with real accuracy
- Done button: navigates to `/` (HomeScreen)
- Container: 100dvh, safe-area insets, bg-surface

### HomeScreen (`src/screens/HomeScreen.tsx`)
- Lock icon button: `aria-label="Parent access"`, SVG lock outline, positioned absolute top-right, `onClick → navigate('/pin')`
- Removed "Parent" text button entirely (T-5-06 mitigation)
- `useLiveQuery(() => db.topicProgress.toArray())` — loading guard before rendering buttons
- `sortedLessons(allLessons, progress)`: pure function, `[...allLessons].sort(...)` — never mutates imported array; sorts by accuracy ascending (unknown topics = 1.0), tie-breaks by `lesson.order`
- `useMemo(() => sortedLessons(lessons, topicProgress ?? []), [topicProgress])` — memoized result
- Start Learning navigates to `/lesson/${targetLesson.id}` (weakest topic's first lesson)

### App.tsx
- Added `/lesson/:lessonId` route — required for adaptive navigation target to resolve in LessonScreen

## Tests

**ParentScreen.test.tsx (8 tests):**
- Empty state: renders "No practice sessions yet" message, no progressbar elements
- With data: progressbar has correct aria-valuenow=78 for accuracy=0.78
- 3-topic guarantee: all 3 labels always visible regardless of DB contents
- Missing topics: shows `—` for Subtraction and Word Problems when only addition is seeded
- Done button: text is "Done", clicking navigates to /

**HomeScreen.test.tsx (9 new tests, 3 existing passing):**
- Lock icon present with aria-label="Parent access"; text "Parent" absent
- Lock icon navigates to /pin
- Adaptive ordering: weakest topic lesson surfaced first
- Fallback: curriculum order (lessons[0]) when no topicProgress data
- Equal accuracy: curriculum order used as tie-break
- Mutation guard: lessons[0].id unchanged after sortedLessons runs

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added /lesson/:lessonId route to App.tsx**
- **Found during:** Task 2
- **Issue:** HomeScreen now navigates to `/lesson/${targetLesson.id}` but App.tsx only had `/lesson` (no param). The parameterized URL would fall through to the `*` catch-all and redirect to `/` — adaptive navigation would silently break.
- **Fix:** Added `<Route path="/lesson/:lessonId" element={<LessonScreen />} />` to App.tsx. LessonScreen already uses `useParams` to read `lessonId` and falls back to `lessons[0]` if absent — no LessonScreen changes needed.
- **Files modified:** src/App.tsx
- **Commit:** 0070e0a

## Known Stubs

None. All 3 topic rows are wired to live DB data via useLiveQuery. ProgressBar receives real accuracy values. Empty state shows only when no sessions exist (not as a placeholder).

## Threat Flags

No new security-relevant surface introduced beyond what the plan's threat model covers.

## Self-Check

### Files exist
- [x] src/components/ProgressBar.tsx — created
- [x] src/screens/ParentScreen.tsx — updated
- [x] src/screens/ParentScreen.test.tsx — created
- [x] src/screens/HomeScreen.tsx — updated
- [x] src/screens/HomeScreen.test.tsx — updated
- [x] src/App.tsx — updated

### Commits exist
- [x] fcb0d50 — Task 1
- [x] 0070e0a — Task 2

### Structural checks
- [x] `navigate('/pin')` present in HomeScreen.tsx
- [x] No `navigate('/parent')` in HomeScreen.tsx
- [x] `role="progressbar"` in ProgressBar.tsx
- [x] `Math.min.*Math.max` clamp in ProgressBar.tsx
- [x] `useMemo` in HomeScreen.tsx

## Self-Check: PASSED
