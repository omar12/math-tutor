---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: complete
stopped_at: Phase 7 shipped — pushed to main
last_updated: "2026-05-19T23:00:00Z"
last_activity: 2026-05-19
progress:
  total_phases: 7
  completed_phases: 7
  total_plans: 15
  completed_plans: 15
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-12)

**Core value:** A kid sits down, does a lesson, practices, and the parent can see exactly what their child understands and what they don't — without any accounts or setup friction.
**Current focus:** Phase 07 — lesson-catalog (VERIFIED)

## Current Position

Phase: 07 (lesson-catalog) — VERIFIED
Plan: 1 of 1
Status: Phase complete — verification passed (11/11 truths, 302 tests green, 0 TS errors)
Last activity: 2026-05-19

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 12
- Average duration: ~30 min/plan

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | ~60 min | ~30 min |

**Recent Trend:**

- Last 5 plans: 01-01 (~35min), 01-02 (~25min)
- Trend: on pace

*Updated after each plan completion*
| Phase 03-lesson-player P01 | 12min | 4 tasks | 5 files |
| Phase 03-lesson-player P02 | 8min | 2 tasks | 4 files |
| Phase 03-lesson-player P03 | 4min | 2 tasks | 3 files |
| Phase 05-progress-parent P01 | 11 | 2 tasks | 4 files |
| Phase 05-progress-parent P03 | 213 | 2 tasks | 6 files |
| Phase 05-progress-parent P02 | 265 | 2 tasks | 3 files |
| Phase 06-pwa-offline P01 | 900 | 2 tasks | 11 files |
| Phase 06-pwa-offline P02 | 10 | 1 task | 1 file |
| Phase 07-lesson-catalog P01 | 4 | 2 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Vite + React + TypeScript + Tailwind + Dexie chosen as stack (iPad web, no native)
- [Init]: iOS Safari audio unlock pattern is load-bearing — must be established in Phase 3 before any narration work
- [Init]: PWA/offline deferred to Phase 6 to avoid interfering with iterative development
- [01-01]: BrowserRouter imported from 'react-router' (v7 unified, not react-router-dom)
- [01-01]: Stub screens use height:100dvh inline style — Tailwind h-screen resolves to 100vh
- [01-01]: fake-indexeddb wired in src/test/setup.ts — no per-test mock needed
- [01-02]: RemyFox className prop interface frozen — Phase 3 replaces internals with Lottie
- [01-02]: ParentScreen has no PIN gate — deferred to Phase 5
- [02-01]: Topic union is canonical source of truth — db.ts imports from curriculum/types.ts
- [02-01]: curriculum.test.ts intentionally RED until Plan 02 ships index.ts + curriculum.json
- [02-02]: curriculum.json authored with exactly 27 lessons and 135 problems (5 per lesson)
- [02-02]: Grade 1 problems are all multiple-choice; Grade 2/3 mix multiple-choice and digit-grid
- [02-02]: index.ts uses satisfies (not as) for compile-time type safety without runtime overhead
- [Phase ?]: Used function() not arrow function in Howler vi.mock so new Howl() works as constructor in jsdom
- [03-03]: justReplayedRef guard added to prevent double-play when REPLAY dispatch re-enters playing phase
- [03-03]: act() wrapper required when calling Howl onend() directly in tests (triggers React state update outside event handler)
- [05-03]: ProgressBar accuracy clamped to [0,1] before computing fill — corrupted DB values cannot overflow
- [05-03]: ParentScreen synthesizes all 3 topics before render (hasData=false for missing) — no topic row ever absent
- [05-03]: sortedLessons spreads before sort — imported curriculum array never mutated
- [05-02]: useLiveQuery returns undefined for both loading and record-not-found; mapping via .then(r => r ?? null) makes loading vs CREATE mode unambiguous
- [05-01]: Separate *.session.test.tsx for IndexedDB tests that need real timers — avoids vi.useFakeTimers() interference
- [07-01]: Inline JSX over extracted LessonCard component — keeps change surface minimal, avoids new file and test scope
- [07-01]: RemyFox reduced to w-32 from w-48 — header zone stays compact so catalog scroll area gets sufficient iPad height
- [07-01]: TOPICS order as weakest-topic tie-break — addition wins equal-accuracy ties (deterministic, canonical order)

### Pending Todos

- iPad Safari verification (install from Safari, standalone mode, offline mode) — deferred by user
- Pre-existing TypeScript errors in phases 02–04 need cleanup pass before shipping

### Blockers/Concerns

None.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-05-19T22:27:00Z
Stopped at: Phase 7 verified
Resume file: None
