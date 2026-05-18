---
phase: 05-progress-parent
plan: "02"
subsystem: auth
tags: [pin, authentication, parent-access, dexie, useLiveQuery]

dependency_graph:
  requires:
    - 05-01  # db.appConfig, hashPin, storePinHash, verifyPin exist
  provides:
    - /pin route registered in App.tsx
    - PinScreen CREATE + VERIFY mode logic
    - PAR-01 PIN gate between HomeScreen and ParentScreen
  affects:
    - src/App.tsx  # /pin route added before wildcard catch-all

tech_stack:
  added: []
  patterns:
    - useLiveQuery with explicit undefined→null mapping to distinguish loading from no-PIN state
    - isVerifying state flag for rate-limit guard (in-flight async call prevention)
    - Auto-submit on 4th digit without explicit submit button

key_files:
  created:
    - src/screens/PinScreen.tsx
    - src/screens/PinScreen.test.tsx
  modified:
    - src/App.tsx

decisions:
  - useLiveQuery maps Dexie undefined-not-found to null via .then(r => r ?? null) to disambiguate loading (undefined) from no-PIN (null) — the plan's interface comment was accurate in intent but useLiveQuery returns undefined for both loading and "record not found" without this mapping
  - dot-fill test restructured to account for CREATE auto-submit: tapping 4th digit in CREATE mode immediately transitions to confirm step, resetting digits; test verifies the transition rather than the transient 4-filled state

metrics:
  duration: "~5 minutes"
  completed: "2026-05-18"
  tasks_completed: 2
  files_created: 2
  files_modified: 1
---

# Phase 05 Plan 02: PinScreen CREATE/VERIFY Flow Summary

PinScreen with two-mode PIN flow (CREATE + VERIFY) using SHA-256 hashing, isVerifying rate-limit guard, and explicit loading/null state distinction via useLiveQuery mapping.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | PinScreen test scaffold (TDD RED) | 219724c | src/screens/PinScreen.test.tsx |
| 2 | Implement PinScreen + /pin route | c14fe8e | src/screens/PinScreen.tsx, src/App.tsx, src/screens/PinScreen.test.tsx |

## What Was Built

**PinScreen.tsx** — A dedicated screen at `/pin` handling:

- **Loading state**: `useLiveQuery` returns `undefined` on first render tick; explicit guard renders a loading spinner before any mode is determined
- **CREATE mode** (`storedPin === null`): Enter 4 digits → auto-submit → confirm 4 digits → on match, calls `hashPin` then `storePinHash` then navigates to `/parent`; on mismatch, shows error and resets both entries to step 'enter'
- **VERIFY mode** (`storedPin` is AppConfig record): Enter 4 digits → `verifyPin()` → on true, navigate to `/parent`; on false, show "Wrong PIN" error, clear dots, reset `isVerifying` after 300ms delay
- **isVerifying guard**: Set to `true` before `verifyPin()` call; `handleDigit` returns early if `isVerifying` is true; prevents rapid double-tap from triggering multiple verify calls
- **No `<input>` elements**: Digit pad only — 9-key grid (7–1) + backspace + 0; each button min-h-[64px] with `touch-action: manipulation`
- **Dot display**: 4 dots with `data-testid="pin-dot-filled"` / `"pin-dot-empty"` for precise test assertions
- **Security boundary**: Raw digits never logged or passed to DB; `hashPin()` always called before `storePinHash()`

**App.tsx** — `/pin` route added before wildcard catch-all.

## Key Design Decision

**useLiveQuery undefined/null mapping**: `db.appConfig.get('pinHash')` returns `undefined` when the key does not exist — the same value that `useLiveQuery` returns while loading. Without mapping, the component cannot distinguish "still loading" from "no PIN set". Solution: `.then(r => r ?? null)` converts the Dexie undefined-not-found to `null`, making the three states unambiguous:
- `undefined` → loading (useLiveQuery initial render)
- `null` → no PIN record → CREATE mode
- `AppConfig` record → PIN exists → VERIFY mode

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] useLiveQuery undefined/null ambiguity — loading state would never resolve in CREATE mode**
- **Found during:** Task 2 implementation (all CREATE mode tests stuck in loading state)
- **Issue:** The plan's interface comment indicated using `storedPin === undefined` for loading and `storedPin == null` for CREATE mode. In practice, `db.appConfig.get('pinHash')` returns `undefined` when the record doesn't exist — same value as useLiveQuery's loading sentinel. The `if (storedPin === undefined) return <LoadingState />` guard would catch both states, leaving CREATE mode permanently showing the spinner.
- **Fix:** Added `.then(r => r ?? null)` to the useLiveQuery query function, mapping Dexie's undefined-not-found to `null`. This disambiguates loading (`undefined`) from no-PIN (`null`).
- **Files modified:** src/screens/PinScreen.tsx
- **Commit:** c14fe8e

**2. [Rule 1 - Bug] Dot-fill test expected transient state that React batches away**
- **Found during:** Task 2 (test "tapping digit buttons fills dots sequentially up to 4" failed)
- **Issue:** Tapping the 4th digit in CREATE mode synchronously calls `handleCreateEnterSubmit`, which calls `setDigits('')`. React batches this with the `setDigits(next)` call that preceded it. By the time the assertion ran, `digits` was `''` (0 filled dots), not `'1234'` (4 filled dots).
- **Fix:** Restructured the test to verify the transition to confirm step (which is the correct post-submit state) rather than checking the transient 4-filled state.
- **Files modified:** src/screens/PinScreen.test.tsx
- **Commit:** c14fe8e

## Known Stubs

None — all functionality is fully implemented and wired.

## Threat Surface Scan

No new security surface beyond what the plan's threat model covers. All T-5-xx mitigations implemented:
- T-5-01: Raw digits in useState only, never logged or written to DB
- T-5-03: isVerifying guard + 300ms delay implemented
- T-5-04: storePinHash only called with `await hashPin(firstEntry)` result
- T-5-05: No `<input>` elements; only digit buttons (0–9) can append to buffer
- T-5-06: isVerifying flag prevents double-tap multiple verify calls

## Self-Check: PASSED

- src/screens/PinScreen.tsx: FOUND
- src/screens/PinScreen.test.tsx: FOUND
- commit 219724c (test RED): FOUND
- commit c14fe8e (feat GREEN): FOUND
- All 12 PinScreen tests pass
- /pin route in App.tsx: CONFIRMED (`grep -n "pin" src/App.tsx` → line 15)
- `isVerifying` guard: 5 lines in PinScreen.tsx (state, handleDigit guard, handleBackspace guard, verifyPin flag, disabled prop ×3 buttons)
- `storedPin === undefined` explicit guard: line 53
- No `<input>` elements in PinScreen.tsx
- Pre-existing App.test.tsx failures (3 tests): unrelated to this plan, existed before this work
