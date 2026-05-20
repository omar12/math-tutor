---
phase: 02-curriculum-content
plan: "01"
subsystem: curriculum
tags: [types, schema, dexie, vitest, tdd]
dependency_graph:
  requires: []
  provides:
    - src/curriculum/types.ts (Topic, LessonStep, WorkedExample, Lesson, Problem, CurriculumData)
    - src/curriculum/curriculum.test.ts (18 data integrity assertions wired for Plan 02)
    - src/db/db.ts (topic fields narrowed to Topic union)
  affects:
    - src/db/db.ts
    - Phase 3 (LessonScreen imports types)
    - Phase 4 (PracticeScreen imports types)
    - Phase 5 (TopicProgress.topic type safety)
tech_stack:
  added: []
  patterns:
    - Discriminated union for Problem type (MultipleChoiceProblem | DigitGridProblem)
    - import type syntax enforced (verbatimModuleSyntax: true)
    - Vitest data integrity test suite pattern (read-only, no beforeEach)
key_files:
  created:
    - src/curriculum/types.ts
    - src/curriculum/curriculum.test.ts
  modified:
    - src/db/db.ts
decisions:
  - "[02-01]: Topic union is canonical source of truth — db.ts imports from curriculum/types.ts"
  - "[02-01]: curriculum.test.ts intentionally RED until Plan 02 ships index.ts + curriculum.json"
metrics:
  duration: ~10 min
  completed: 2026-05-13
  tasks_completed: 3
  tasks_total: 3
---

# Phase 2 Plan 01: Curriculum Type Contract and Test Wiring Summary

**One-liner:** TypeScript discriminated union schema for curriculum (6 exports), Topic-narrowed Dexie interfaces, and 18-assertion RED test suite gating Plan 02.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Author src/curriculum/types.ts | f3bed3c | src/curriculum/types.ts (created) |
| 2 | Narrow db.ts topic fields to Topic union | d427e84 | src/db/db.ts (modified) |
| 3 | Write curriculum.test.ts with 18 assertions | 3b43c2f | src/curriculum/curriculum.test.ts (created) |

## What Was Built

**src/curriculum/types.ts** exports the full type contract:
- `Topic` union (`'addition' | 'subtraction' | 'word-problems'`)
- `LessonStep`, `WorkedExample`, `Lesson` interfaces with inline field comments
- `Problem` discriminated union (`MultipleChoiceProblem | DigitGridProblem`) on `type` field
- `CurriculumData` root interface (`{ lessons: Lesson[], problems: Problem[] }`)

**src/db/db.ts** is updated with `import type { Topic }` and both `Session.topic` and `TopicProgress.topic` narrowed from `string` to `Topic`. This prevents Phase 5 silent-type bugs when writing session progress records.

**src/curriculum/curriculum.test.ts** contains 18 data integrity assertions in one `describe('curriculum data integrity')` block covering:
- Structure: min 18 lessons, no duplicate IDs, lessonId cross-references
- CURR-01: Common Core coverage (grade 1–3 addition/subtraction/word-problems per grade)
- CURR-02: narrationAudio path convention, word problem text length
- CURR-03: schema integrity (worked example steps, linked problems, choices count, valid enum values)

The tests fail with `Cannot find module './index'` — confirming they are correctly wired and waiting for Plan 02 to supply `src/curriculum/index.ts` and `src/curriculum/curriculum.json`.

## Verification Results

| Check | Result |
|-------|--------|
| `tsc --noEmit` | PASS (exits 0) |
| `vitest run src/db/db.test.ts` | PASS (2 tests green) |
| `vitest run src/curriculum/curriculum.test.ts` | FAIL (Cannot find module './index') — expected |
| `grep -c "^export" src/curriculum/types.ts` | 6 |
| `grep "topic: Topic" src/db/db.ts \| wc -l` | 2 |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan creates type definitions and a test suite. No runtime data or UI stubs exist.

## Threat Flags

None — static TypeScript source files with no user input, network calls, auth, or stored secrets (as documented in plan threat model).

## Self-Check: PASSED

- [x] src/curriculum/types.ts exists with 6 named exports
- [x] src/curriculum/curriculum.test.ts exists with 18 it() assertions
- [x] src/db/db.ts contains `import type { Topic }` and 2 `topic: Topic` fields
- [x] Commits f3bed3c, d427e84, 3b43c2f exist in git log
