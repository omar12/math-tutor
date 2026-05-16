---
phase: 03-lesson-player
plan: "01"
subsystem: audio
tags: [howler, react-hooks, testing, vitest, jsdom]

# Dependency graph
requires:
  - phase: 02-curriculum-content
    provides: LessonStep interface (text, narrationAudio, equation?) consumed by useLessonAudio
provides:
  - useLessonAudio hook: one Howl per LessonStep, onloaderror/onplayerror -> onStepEnded (D-06), unload cleanup at unmount
  - Howler vi.mock in src/test/setup.ts for jsdom-compatible audio testing
affects:
  - 03-lesson-player/03-02 (LessonScreen/StepCard — imports useLessonAudio)
  - 03-lesson-player/03-03 (any future audio-dependent components)

# Tech tracking
tech-stack:
  added:
    - howler@2.2.4 (audio playback management)
    - "@types/howler@2.2.12 (TypeScript types, devDependency)"
  patterns:
    - "Per-step Howl instances created at mount via useMemo, unloaded on unmount via useEffect cleanup"
    - "onloaderror/onplayerror -> onStepEnded for silent audio fallback (D-06)"
    - "vi.mock('howler') with function() constructor in test setup for jsdom compatibility"

key-files:
  created:
    - src/hooks/useLessonAudio.ts
    - src/hooks/useLessonAudio.test.ts
  modified:
    - package.json
    - package-lock.json
    - src/test/setup.ts

key-decisions:
  - "Used function() not arrow function in mockImplementation so new Howl() works as constructor in jsdom"
  - "@types/howler moved from dependencies to devDependencies (was incorrectly placed by prior install)"
  - "html5: false on Howl instances — html5 audio is for streaming; local short MP3s use Web Audio"

patterns-established:
  - "Audio hook pattern: useMemo for Howl creation, useEffect for cleanup — prevents ghost audio on remount"
  - "D-06 silent fallback: onloaderror + onplayerror both dispatch onStepEnded — lesson never gets stuck"

requirements-completed:
  - LESS-02
  - LESS-04

# Metrics
duration: 12min
completed: 2026-05-16
---

# Phase 3 Plan 01: Lesson Player — Howler.js Install + useLessonAudio Hook Summary

**Howler.js audio infrastructure: one Howl instance per LessonStep with D-06 silent fallback (onloaderror -> onStepEnded) and unload cleanup, backed by 5 passing unit tests**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-05-16T00:41:00Z
- **Completed:** 2026-05-16T00:53:19Z
- **Tasks:** 4
- **Files modified:** 5

## Accomplishments

- howler@2.2.4 and @types/howler@2.2.12 installed; importable via node and tsc-clean
- useLessonAudio hook creates one Howl per step at mount; silently forwards onloaderror/onplayerror to onStepEnded (D-06 — lesson never freezes when audio 404s)
- Howler vi.mock wired into src/test/setup.ts so all subsequent test files get audio stubs automatically
- 5 unit tests covering Howl count, D-06 paths (load error and play error), and unmount cleanup — all green; full 98-test suite unaffected

## Task Commits

Each task was committed atomically:

1. **Task 1: Install howler and @types/howler** - `7656cc9` (feat)
2. **Task 2: Create src/hooks/useLessonAudio.ts** - `d7d4cd6` (feat)
3. **Task 3: Add Howler mock to src/test/setup.ts** - `b42a416` (chore)
4. **Task 4: Create src/hooks/useLessonAudio.test.ts** - `f84de2b` (test — also includes mock fix)

## Files Created/Modified

- `src/hooks/useLessonAudio.ts` - React hook: useMemo creates one Howl per LessonStep; useEffect cleanup unloads all; onloaderror/onplayerror call onStepEnded (D-06)
- `src/hooks/useLessonAudio.test.ts` - 5 unit tests covering D-06 invariants, Howl count, and unmount cleanup
- `src/test/setup.ts` - Howler vi.mock appended; vi imported from vitest
- `package.json` - howler in dependencies, @types/howler in devDependencies
- `package-lock.json` - lockfile updated for new installs

## Decisions Made

- `html5: false` on all Howl instances: html5 mode is for streaming; short local MP3 narration files use Web Audio path which works better with the unlock tap pattern
- Howler mock uses `function()` not arrow function in `mockImplementation` so `new Howl()` works correctly in jsdom environment (arrow functions are not constructors)
- `@types/howler` placed in devDependencies (not dependencies) — types are compile-time only

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] @types/howler was in dependencies instead of devDependencies**
- **Found during:** Task 1 (package.json inspection)
- **Issue:** A prior install had placed @types/howler in dependencies rather than devDependencies — type packages should be dev-only
- **Fix:** Re-ran `npm install --save-dev @types/howler@2.2.12` to move it to devDependencies
- **Files modified:** package.json, package-lock.json
- **Verification:** grep shows @types/howler under devDependencies; tsc --noEmit exits 0
- **Committed in:** 7656cc9 (Task 1 commit)

**2. [Rule 1 - Bug] Howler vi.mock used arrow function — not a constructor**
- **Found during:** Task 4 (test run)
- **Issue:** Plan specified `vi.fn().mockImplementation(({ onend, ... }) => ({ ... }))` with an arrow function. Arrow functions cannot be used as constructors — `new Howl()` threw "is not a constructor" in jsdom
- **Fix:** Changed arrow function to regular `function()` in mockImplementation body in src/test/setup.ts
- **Files modified:** src/test/setup.ts
- **Verification:** All 5 useLessonAudio tests pass; full 98-test suite green
- **Committed in:** f84de2b (Task 4 commit — mock fix included)

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs)
**Impact on plan:** Both fixes required for correctness. No scope creep. Plan intent fully preserved.

## Issues Encountered

None beyond the auto-fixed deviations above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- useLessonAudio hook ready for import in Plan 03-02 (LessonScreen implementation)
- Howler mock active for all test files — audio-dependent component tests will work without Web Audio API
- Full test suite green (98 tests)

---
*Phase: 03-lesson-player*
*Completed: 2026-05-16*
