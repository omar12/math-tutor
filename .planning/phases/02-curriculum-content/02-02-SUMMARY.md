---
phase: 02-curriculum-content
plan: "02"
subsystem: curriculum
tags: [curriculum, json, typescript, vitest, content-authoring]
dependency_graph:
  requires:
    - src/curriculum/types.ts (from Plan 02-01)
    - src/curriculum/curriculum.test.ts (from Plan 02-01)
  provides:
    - src/curriculum/curriculum.json (27 lessons + 135 problems, flat arrays per D-01/D-02)
    - src/curriculum/index.ts (typed re-export with satisfies CurriculumData)
  affects:
    - Phase 3 (LessonScreen imports lessons via curriculum/index.ts)
    - Phase 4 (PracticeScreen imports problems via curriculum/index.ts)
tech_stack:
  added: []
  patterns:
    - Vite native JSON import with TypeScript satisfies compile-time assertion
    - Flat lesson/problem arrays filtered by grade and topic (D-01/D-02 locked)
    - narrationAudio convention /audio/lessons/{lessonId}/step-{N}.mp3
    - CCSS-aligned lesson content: 1.OA, 2.OA, 3.NBT.A.2, 3.OA.D.8
key_files:
  created:
    - src/curriculum/index.ts
    - src/curriculum/curriculum.json
  modified: []
decisions:
  - "[02-02]: curriculum.json authored with exactly 27 lessons and 135 problems (5 per lesson)"
  - "[02-02]: Grade 1 problems are all multiple-choice; Grade 2/3 mix multiple-choice and digit-grid (60/40 ratio)"
  - "[02-02]: index.ts uses satisfies (not as) for compile-time type safety without runtime overhead"
metrics:
  duration: ~15 min
  completed: 2026-05-13
  tasks_completed: 2
  tasks_total: 2
---

# Phase 2 Plan 02: Curriculum JSON and Typed Loader Summary

**One-liner:** 27-lesson, 135-problem CCSS-aligned curriculum JSON with satisfies CurriculumData typed loader, making all 29 Vitest tests green.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Write src/curriculum/index.ts — typed curriculum loader | f884783 | src/curriculum/index.ts (created) |
| 2 | Author curriculum.json — 27 lessons and 135 problems | 5e1752c | src/curriculum/curriculum.json (created) |

## What Was Built

**src/curriculum/index.ts** is a thin 8-line loader module that:
- Imports `curriculum.json` as a value (Vite native JSON import, no `resolveJsonModule` needed)
- Applies `satisfies CurriculumData` compile-time type assertion (not `as` — errors are reported, not suppressed)
- Exports named `curriculum`, `lessons`, and `problems` for use by Phase 3/4 components
- Uses `import type` for the type import (required by `verbatimModuleSyntax: true`)

**src/curriculum/curriculum.json** contains the full v1 curriculum:

*Lessons (27 total):*
- 3 per grade (1–3) × 3 topics (addition, subtraction, word-problems) = 27 lessons
- All lessons aligned to CCSS: Grade 1 → 1.OA, Grade 2 → 2.OA, Grade 3 → 3.NBT.A.2 + 3.OA.D.8
- Each lesson has 4 worked example steps with narrationAudio paths following `/audio/lessons/{lessonId}/step-{N}.mp3`
- Equations included on calculation steps; omitted on intro/transition steps
- Content narrated in Remy the Fox's warm, encouraging voice

*Problems (135 total):*
- 5 problems per lesson (27 × 5 = 135)
- Grade 1: all multiple-choice (lower frustration tolerance for ages 6–7)
- Grade 2: ~60% multiple-choice, ~40% digit-grid
- Grade 3: ~40% multiple-choice, ~60% digit-grid (larger numbers suit digit input)
- Word problems use named characters (Mia, Remy, Leo, Zara) with concrete tangible objects and warm positive framing
- Grade 3 covers only 3.NBT.A.2 (within 1000) and 3.OA.D.8 (two-step) — no multiplication/division

## Verification Results

| Check | Result |
|-------|--------|
| `lesson count` | 27 (exact) |
| `problem count` | 135 |
| `tsc --noEmit` | PASS (exits 0) |
| `vitest run src/curriculum/curriculum.test.ts` | PASS (18/18 green) |
| `vitest run` (full suite) | PASS (29/29 green) |
| No multiplication/division in content | PASS (0 operation matches) |
| All narrationAudio paths match regex | PASS (test assertion 11) |

## Deviations from Plan

None — plan executed exactly as written. Both tasks completed in order with all acceptance criteria met.

## Known Stubs

**narrationAudio MP3 files:** The paths in `curriculum.json` (e.g., `/audio/lessons/addition-grade1-01/step-1.mp3`) point to audio files that do not yet exist on disk. This is intentional by design (documented in RESEARCH.md Pitfall 3 and CONTEXT.md D-04). Phase 3 will record and place these files. The paths are locked and stable — they are the source of truth that Phase 3's audio pipeline must match.

No data stubs exist that would prevent the plan's goal (typed, tested curriculum data) from being achieved.

## Threat Flags

None — static committed JSON data with no user input, network calls, auth, or stored secrets (per plan threat model: T-02-04, T-02-05, T-02-06 all accepted).

## Self-Check: PASSED

- [x] src/curriculum/index.ts exists with `satisfies CurriculumData` wiring
- [x] src/curriculum/curriculum.json exists with 27 lessons and 135 problems
- [x] `tsc --noEmit` exits 0
- [x] `vitest run` exits 0 with all 29 tests green
- [x] Commits f884783 and 5e1752c exist in git log
