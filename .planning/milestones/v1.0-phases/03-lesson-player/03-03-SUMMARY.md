---
phase: 03-lesson-player
plan: "03"
subsystem: ui
tags: [react, useReducer, state-machine, howler, ios-audio, vitest, testing-library]

# Dependency graph
requires:
  - phase: 03-01
    provides: useLessonAudio hook (Howl lifecycle, onStepEnded callback)
  - phase: 03-02
    provides: StepCard and ConfettiScreen components
provides:
  - LessonScreen complete implementation: unlock → playing → between-steps → celebration state machine
  - lessonReducer with all 4 phase transitions and 4 action types
  - iOS audio unlock pattern: synchronous howls[0].play() in tap handler before dispatch
  - 7 LessonScreen integration tests covering LESS-01 through LESS-04
affects:
  - Phase 4 (practice): navigate('/practice') is the handoff from LessonScreen
  - App routing tests: updated to reflect real unlock screen instead of stub

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useReducer state machine for lesson flow with typed discriminated union actions"
    - "justUnlockedRef / justReplayedRef guards to prevent duplicate howl.play() from useEffect"
    - "iOS AudioContext unlock: synchronous .play() in user gesture handler before any React dispatch"
    - "act() wrapper required when calling Howl onend() callback directly in tests (triggers React state update outside event handler)"

key-files:
  created:
    - src/screens/LessonScreen.test.tsx
  modified:
    - src/screens/LessonScreen.tsx
    - src/App.test.tsx

key-decisions:
  - "justReplayedRef added (not in original plan) to prevent triple-play bug: handleReplay calls howls[N].play(), then dispatch(REPLAY) sets phase='playing', which would trigger useEffect play() again without the guard"
  - "act() wrapper required in tests when simulating Howl onend() callback directly (not via fireEvent) — onend() dispatches AUDIO_ENDED outside a React event handler, so React batching doesn't apply without act()"
  - "App.test.tsx /lesson route assertion updated from 'Lesson' (stub text) to 'Tap anywhere to start' (real unlock screen)"

requirements-completed:
  - LESS-01
  - LESS-02
  - LESS-03
  - LESS-04

# Metrics
duration: 4min
completed: 2026-05-16
---

# Phase 3 Plan 03: LessonScreen Complete Implementation Summary

**useReducer state machine (unlock → playing → between-steps → celebration) wiring useLessonAudio, StepCard, and ConfettiScreen with iOS AudioContext unlock pattern and 7 passing integration tests**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-16T00:56:58Z
- **Completed:** 2026-05-16T01:00:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Replaced LessonScreen stub with full `lessonReducer` state machine covering all 4 phases
- Wired iOS audio unlock: `howls[0].play()` called synchronously in tap handler before `dispatch(UNLOCK)` (LESS-04)
- Replay handler calls `stop()` then `play()` with `justReplayedRef` guard preventing useEffect double-play (LESS-03)
- 7 integration tests green covering LESS-01 through LESS-04; full 141-test suite green

## Task Commits

1. **Task 1: Create LessonScreen.test.tsx** — `1c52ed9` (test — TDD RED phase, 6/7 tests fail against stub)
2. **Task 2: Replace LessonScreen.tsx with state machine** — `77b9049` (feat — all 7 tests green, full suite green)

## Files Created/Modified

- `src/screens/LessonScreen.tsx` — Full state machine: lessonReducer, handleUnlockTap (iOS unlock), handleReplay, dot progress indicator, unlock/step/celebration render paths
- `src/screens/LessonScreen.test.tsx` — 7 integration tests: unlock gate, step 0 display, step advancement, celebration, replay stop+play, LESS-04 no-play-before-tap
- `src/App.test.tsx` — Updated /lesson route assertion from stub text to real unlock screen text

## Decisions Made

**justReplayedRef guard (added beyond plan):** The plan specified `justUnlockedRef` to prevent double-play on initial unlock, but `handleReplay` has the same problem: it calls `howls[N].play()`, then `dispatch(REPLAY)` sets `phase: 'playing'` with the same `stepIndex`, triggering `useEffect` which would play again. Added `justReplayedRef` with identical guard pattern to prevent this triple-play bug. The plan's REPLAY test expected exactly 2 play() calls — this made the test define the correct behavior.

**act() wrapper in tests:** Calling `HowlMock.mock.calls[i][0].onend()` directly (not via `fireEvent`) triggers the `onStepEnded` → `dispatch(AUDIO_ENDED)` React state update outside an event handler. React requires `act()` for these updates to be flushed. Added `act(() => { onend() })` in 3 tests (step advancement, celebration, replay).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added justReplayedRef guard to prevent double-play on REPLAY dispatch**
- **Found during:** Task 2 (LESS-03 replay test failed with 3 play() calls instead of 2)
- **Issue:** `handleReplay` calls `howls[N].play()`, then `dispatch(REPLAY)` causes `phase='playing'` which fires `useEffect`, which calls `play()` again — 3 total calls instead of the expected 2
- **Fix:** Added `justReplayedRef = useRef(false)`, set to `true` in `handleReplay`, checked and reset in `useEffect` before calling `howls[stepIndex]?.play()`
- **Files modified:** `src/screens/LessonScreen.tsx`
- **Verification:** LESS-03 test passes: `stop` called 1x, `play` called 2x (once in handler, once in replay)
- **Committed in:** `77b9049`

**2. [Rule 1 - Bug] Added act() wrappers in tests for direct onend() callback invocations**
- **Found during:** Task 2 verification (4/7 tests passed without act(), 2 tests could not find Next button)
- **Issue:** Calling `HowlMock.mock.calls[i][0].onend()` dispatches `AUDIO_ENDED` outside a React event handler — the state update is not flushed synchronously without `act()`
- **Fix:** Wrapped `onend()` calls in `act(() => { ... })` in 3 test cases
- **Files modified:** `src/screens/LessonScreen.test.tsx`
- **Verification:** All 7 LessonScreen tests pass; no act() warnings
- **Committed in:** `77b9049`

**3. [Rule 1 - Bug] Fixed App.test.tsx /lesson route assertion**
- **Found during:** Full suite run after Task 2 (1 test failed: expected 'Lesson' text)
- **Issue:** `App.test.tsx` expected the old stub's `<h1>Lesson</h1>` text; real LessonScreen shows unlock screen with lesson title + "Tap anywhere to start"
- **Fix:** Updated assertion to `expect(screen.getByText('Tap anywhere to start')).toBeInTheDocument()`
- **Files modified:** `src/App.test.tsx`
- **Verification:** Full 141-test suite passes
- **Committed in:** `77b9049`

---

**Total deviations:** 3 auto-fixed (2 Rule 1 bugs — double-play guard and act() wrappers; 1 Rule 1 bug — stale assertion in App.test.tsx)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep. The justReplayedRef guard was implied by the REPLAY test contract (2 play calls) but not explicitly specified in the implementation steps.

## Issues Encountered

None beyond the auto-fixed deviations above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 3 complete: `useLessonAudio` (03-01) + `StepCard`/`ConfettiScreen` (03-02) + `LessonScreen` (03-03) all ship and test green
- `navigate('/practice')` in ConfettiScreen hands off to Phase 4 (practice problems)
- 141 tests pass; TypeScript clean

---
*Phase: 03-lesson-player*
*Completed: 2026-05-16*
