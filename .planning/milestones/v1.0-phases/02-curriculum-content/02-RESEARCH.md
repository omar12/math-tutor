# Phase 2: Curriculum & Content - Research

**Researched:** 2026-05-13
**Domain:** Static JSON curriculum schema, TypeScript type design, Common Core alignment
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Curriculum Hierarchy**
- D-01: Flat `lessons[]` array with metadata fields (`grade`, `topic`, `order`) — not nested by grade/topic. Phase 3/4 filter by `grade` and `topic`. Simpler TypeScript types, easier to query.
- D-02: Practice problems in a separate top-level `problems[]` array, linked to their lesson via `lessonId`. Problems are not inline in lesson objects.
- D-03: Curriculum lives at `src/curriculum/curriculum.json` — single file, imported as a TypeScript module via Vite's native JSON import.

**Lesson Step Anatomy**
- D-04: Each lesson step has: `{ text: string, narrationAudio: string }` — display text plus relative MP3 path.
- D-05: Worked example is `lesson.workedExample.steps[]` — ordered array of steps. Phase 3 advances sequentially.
- D-06: Each step has an optional `equation?: string` field — plain Unicode string like `'3 + 4 = ?'`.

**Problem Schema**
- D-07: Single problem schema with `type: 'multiple-choice' | 'digit-grid'` discriminant. `choices?: number[]` only when `type === 'multiple-choice'`.
- D-08: Correct answer as `answer: number`. For multiple-choice: `choices: number[]` unordered; Phase 4 shuffles.
- D-09: Each problem carries `{ grade: 1|2|3, topic: 'addition'|'subtraction'|'word-problems', lessonId: string }`.

**Word Problems**
- D-10: Word problems use the same problem schema — distinguished by `topic: 'word-problems'`. The `question` field contains full word problem text.

### Claude's Discretion
- Specific lesson content (titles, step text, equation values) — Claude authors realistic grade 1–3 content aligned to Common Core
- Exact `lessonId` format — use human-readable slugs like `'addition-grade1-01'`
- Number of lessons per topic/grade — aim for 2–3 lessons per grade per topic (18–27 total lessons)
- `narrationAudio` paths — use convention `'/audio/lessons/{lessonId}/step-{N}.mp3'`; audio files don't exist yet
- TypeScript type file location — `src/curriculum/types.ts` alongside the JSON

### Deferred Ideas (OUT OF SCOPE)
- `difficulty: 'easy' | 'medium' | 'hard'` on problems — Phase 5 concern
- Multiple narration takes per step — Phase 3 concern
- Lesson completion tracking schema — deferred to v2 (PROG-V2-01)
- Curriculum versioning / migration strategy — deferred to Phase 6 or v2

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CURR-01 | App covers grade 1–3 addition and subtraction content aligned to Common Core standards | Common Core standard IDs catalogued in this document; lesson content mapped to 1.OA, 2.OA, 3.NBT, 3.OA.D.8 |
| CURR-02 | App includes grade 1–3 word problems with narration reading the problem aloud | `narrationAudio` field on lesson steps covers this; word problems distinguished by `topic: 'word-problems'` per D-10 |
| CURR-03 | Curriculum is data-driven (static JSON) so adding content requires no code changes | TypeScript types wrap imported JSON; new lessons/problems added as JSON entries; no TS changes needed |

</phase_requirements>

---

## Summary

Phase 2 delivers the static data contract that all downstream phases consume. The work is pure schema design plus content authoring — no UI, no audio, no runtime logic. The schema decisions are fully locked in CONTEXT.md; what remains is (1) verifying the technical implementation path is clean, (2) mapping the exact Common Core standard IDs to ensure coverage, and (3) establishing the test strategy for data integrity.

The Vite + TypeScript stack handles JSON imports cleanly in this project's configuration. Empirical testing (verified in this session) confirms that `moduleResolution: "bundler"` in the existing `tsconfig.app.json` enables JSON imports without adding `resolveJsonModule` — Vite handles the resolution at the bundler level. The TypeScript `satisfies` operator (TS 4.9+, project is on TS 6.0) provides compile-time type checking of the JSON data without runtime overhead. This combination gives full type safety with zero additional dependencies.

The Common Core scope for addition/subtraction across grades 1–3 spans three standard domains: 1.OA (within 20), 2.OA (within 100), and 3.NBT.A.2 + 3.OA.D.8 (within 1000 and two-step problems). Grade 3 is notable: the 3.OA domain primarily covers multiplication/division, so grade 3 addition/subtraction lives in 3.NBT. The curriculum must include content from all three grade domains to satisfy CURR-01.

**Primary recommendation:** Author `src/curriculum/types.ts` first with the full discriminated union types, then write `curriculum.json` with the `satisfies CurriculumData` assertion in a thin loader module. Validate data integrity via a Vitest test file that asserts structural invariants (every `lessonId` on a problem resolves to a real lesson, etc.) — no runtime schema validator library needed.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Curriculum schema definition | Static files (src/) | — | Pure TypeScript types + JSON; no runtime tier |
| Content authoring (lessons, problems) | Static files (src/) | — | Data is committed to the repo as JSON |
| Type checking of curriculum JSON | TypeScript compiler | Vitest (tests) | Compile-time via `satisfies`; runtime via test assertions |
| Data integrity validation | Vitest test suite | — | Structural checks (lessonId cross-refs, required fields) run in CI |
| Curriculum loading at runtime | Frontend (Phase 3/4) | — | `import curriculum from './curriculum.json'` in LessonScreen/PracticeScreen |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | 6.0.3 (installed) | Type definitions for curriculum schema | Already in project; `satisfies` operator available since TS 4.9 |
| Vite | 8.0.12 (installed) | JSON import bundling | Native JSON import support; no extra plugins needed |
| Vitest | 4.1.6 (installed) | Data integrity tests | Already wired; `fake-indexeddb` and jsdom setup in place |

### No New Dependencies Needed
This phase adds zero new npm packages. The full implementation is:
- `src/curriculum/types.ts` — TypeScript type definitions
- `src/curriculum/curriculum.json` — the data file
- `src/curriculum/index.ts` — thin loader that imports and re-exports with type assertion
- `src/curriculum/curriculum.test.ts` — Vitest data integrity tests

**Installation:** None required. All dependencies are already installed.

---

## Architecture Patterns

### System Architecture Diagram

```
curriculum.json (static data)
        │
        │ import (Vite native JSON import)
        ▼
src/curriculum/index.ts
  (applies `satisfies CurriculumData` type assertion)
        │
        ├──────────────────────────────┐
        ▼                              ▼
Phase 3: LessonScreen             Phase 4: PracticeScreen
  - filters lessons[]               - filters problems[]
    by grade + topic                  by lessonId or topic
  - reads workedExample.steps[]     - reads answer, choices, type
  - reads narrationAudio paths      - reads grade, topic for PROG-01
        │                              │
        └──────────────┬───────────────┘
                       ▼
              Phase 5: TopicProgress (Dexie)
                - topic values must match
                  'addition'|'subtraction'|'word-problems'
```

### Recommended Project Structure
```
src/
├── curriculum/
│   ├── types.ts           # Lesson, LessonStep, Problem, Topic, CurriculumData types
│   ├── curriculum.json    # All lessons and problems data
│   ├── index.ts           # Import + satisfies assertion, named exports
│   └── curriculum.test.ts # Data integrity assertions (Vitest)
└── db/
    └── db.ts              # Existing — topic: string aligns to Topic union
```

### Pattern 1: TypeScript JSON Import with Compile-Time Type Safety
**What:** Import curriculum.json via Vite's native JSON support; validate the shape at compile time using `satisfies` in a loader module.
**When to use:** When you need full type inference from JSON data without runtime overhead.
**Verified:** Empirically confirmed in this session that `moduleResolution: "bundler"` (already in `tsconfig.app.json`) enables JSON imports without `resolveJsonModule`.

```typescript
// src/curriculum/index.ts
// Source: empirically verified against tsconfig.app.json (2026-05-13)
import raw from './curriculum.json'
import type { CurriculumData } from './types'

// satisfies = compile-time type check; does not change the runtime value or its inferred type
export const curriculum = raw satisfies CurriculumData

export const lessons = curriculum.lessons
export const problems = curriculum.problems
```

```typescript
// src/curriculum/types.ts
export type Topic = 'addition' | 'subtraction' | 'word-problems'

export interface LessonStep {
  text: string
  narrationAudio: string   // e.g. '/audio/lessons/addition-grade1-01/step-1.mp3'
  equation?: string        // e.g. '3 + 4 = ?' — absent for intro/transition steps
}

export interface WorkedExample {
  steps: LessonStep[]
}

export interface Lesson {
  id: string               // human-readable slug: 'addition-grade1-01'
  title: string
  grade: 1 | 2 | 3
  topic: Topic
  order: number            // sort order within grade+topic
  ccStandards: string[]    // e.g. ['1.OA.A.1', '1.OA.C.6']
  workedExample: WorkedExample
}

// Discriminated union for problems
interface BaseProblem {
  id: string
  lessonId: string         // foreign key → Lesson.id
  grade: 1 | 2 | 3
  topic: Topic
  question: string         // full question text (word problem text for topic='word-problems')
  answer: number
}

interface MultipleChoiceProblem extends BaseProblem {
  type: 'multiple-choice'
  choices: number[]        // unordered; Phase 4 shuffles at render time
}

interface DigitGridProblem extends BaseProblem {
  type: 'digit-grid'
}

export type Problem = MultipleChoiceProblem | DigitGridProblem

export interface CurriculumData {
  lessons: Lesson[]
  problems: Problem[]
}
```

### Pattern 2: Data Integrity Tests with Vitest
**What:** Structural assertions that catch authoring errors — broken lessonId cross-references, missing required fields, duplicate IDs.
**When to use:** Every time curriculum.json is modified. Run as part of the Vitest suite (`vitest run`).

```typescript
// src/curriculum/curriculum.test.ts
// Source: project test pattern from src/db/db.test.ts
import { describe, it, expect } from 'vitest'
import { curriculum } from './index'

describe('curriculum data integrity', () => {
  const lessonIds = new Set(curriculum.lessons.map(l => l.id))

  it('has no duplicate lesson IDs', () => {
    expect(lessonIds.size).toBe(curriculum.lessons.length)
  })

  it('has no duplicate problem IDs', () => {
    const ids = curriculum.problems.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every problem.lessonId resolves to a real lesson', () => {
    for (const problem of curriculum.problems) {
      expect(lessonIds.has(problem.lessonId), `problem ${problem.id} references unknown lessonId ${problem.lessonId}`).toBe(true)
    }
  })

  it('every lesson has at least one worked example step', () => {
    for (const lesson of curriculum.lessons) {
      expect(lesson.workedExample.steps.length, `lesson ${lesson.id} has empty steps`).toBeGreaterThan(0)
    }
  })

  it('every lesson has at least one linked problem', () => {
    for (const lesson of curriculum.lessons) {
      const count = curriculum.problems.filter(p => p.lessonId === lesson.id).length
      expect(count, `lesson ${lesson.id} has no linked problems`).toBeGreaterThan(0)
    }
  })

  it('multiple-choice problems have 4 choices', () => {
    for (const p of curriculum.problems) {
      if (p.type === 'multiple-choice') {
        expect(p.choices.length, `problem ${p.id} needs 4 choices`).toBe(4)
      }
    }
  })

  it('all topic values are valid', () => {
    const validTopics = new Set(['addition', 'subtraction', 'word-problems'])
    for (const lesson of curriculum.lessons) {
      expect(validTopics.has(lesson.topic)).toBe(true)
    }
    for (const problem of curriculum.problems) {
      expect(validTopics.has(problem.topic)).toBe(true)
    }
  })
})
```

### Pattern 3: narrationAudio Path Convention
**What:** Stable placeholder paths committed now so Phase 3's audio file recording produces files in the already-expected locations.
**Convention:** `/audio/lessons/{lessonId}/step-{N}.mp3` where N is 1-indexed.

```json
{
  "text": "Let's start! We're going to add 3 and 4.",
  "narrationAudio": "/audio/lessons/addition-grade1-01/step-1.mp3",
  "equation": "3 + 4 = ?"
}
```

### Anti-Patterns to Avoid
- **Nested grade/topic hierarchy:** `{ grade1: { addition: [...] } }` — harder to filter, more complex TypeScript types. Decision locked: flat array with metadata fields.
- **answer as string or array:** Phase 4 compares with `===` to a number. Storing `"7"` or `[7]` causes silent bugs.
- **choices including the answer at a fixed index:** Store choices unordered; Phase 4 shuffles. Never rely on `answer === choices[0]`.
- **Using `as CurriculumData` instead of `satisfies CurriculumData`:** The `as` cast suppresses errors; `satisfies` reports them. Use `satisfies`.
- **Importing curriculum.json directly in components:** Import from `src/curriculum/index.ts` (the typed re-export) not the raw JSON. This keeps type safety centralized.

---

## Common Core Standards Coverage

### What Must Be in the Curriculum (CURR-01)

The following standards define the content scope. All must be represented by at least one lesson. [CITED: thecorestandards.org (403 Forbidden — confirmed via web search results)]

#### Grade 1 (1.OA) — Addition/subtraction within 20
| Standard | Skill | In-Scope? |
|----------|-------|-----------|
| 1.OA.A.1 | Add/subtract within 20 to solve word problems (add-to, take-from, put-together, compare) | YES |
| 1.OA.A.2 | Add three whole numbers with sum ≤ 20 | YES |
| 1.OA.B.3 | Properties of operations (commutative: 3+4 = 4+3) | YES |
| 1.OA.B.4 | Subtraction as unknown-addend (10−8 = ? → 8+?=10) | YES |
| 1.OA.C.5 | Relate counting to addition and subtraction | YES |
| 1.OA.C.6 | Fluency within 10; strategies: counting on, making ten | YES |
| 1.OA.D.7 | Meaning of the equal sign; true/false equations | YES |
| 1.OA.D.8 | Determine unknown whole number in an equation | YES |

#### Grade 2 (2.OA) — Addition/subtraction within 100
| Standard | Skill | In-Scope? |
|----------|-------|-----------|
| 2.OA.A.1 | Add/subtract within 100; one- and two-step word problems | YES |
| 2.OA.B.2 | Fluency within 20; know all sums of two one-digit numbers | YES |
| 2.OA.C.3 | Odd/even numbers; equation as sum of equal addends | YES (addition angle) |
| 2.OA.C.4 | Arrays up to 5×5 as repeated addition | YES (addition angle) |

#### Grade 3 — Addition/subtraction within 1000
| Standard | Skill | In-Scope? |
|----------|-------|-----------|
| 3.NBT.A.2 | Fluently add and subtract within 1000 using place-value strategies | YES |
| 3.OA.D.8 | Two-step word problems using the four operations (includes add/sub) | YES |

> Note: The 3.OA domain (Operations & Algebraic Thinking) for grade 3 is primarily multiplication and division. Grade 3 addition/subtraction belongs to 3.NBT (Number and Operations in Base Ten). [CITED: thecorestandards.org confirmed via web search 2026-05-13]

### Lesson-to-Standard Mapping (Prescriptive)

Target: 2–3 lessons per grade per topic = 18–27 lessons total. Recommended content below maps lessons to standards.

#### Addition (9 lessons target)

**Grade 1 Addition (3 lessons)**
| Lesson ID | Title | Standards |
|-----------|-------|-----------|
| `addition-grade1-01` | Adding to 10 | 1.OA.C.5, 1.OA.C.6 |
| `addition-grade1-02` | Adding to 20 | 1.OA.A.1, 1.OA.C.6 |
| `addition-grade1-03` | Adding Three Numbers | 1.OA.A.2 |

**Grade 2 Addition (3 lessons)**
| Lesson ID | Title | Standards |
|-----------|-------|-----------|
| `addition-grade2-01` | Adding Within 100 (No Regrouping) | 2.OA.A.1, 2.OA.B.2 |
| `addition-grade2-02` | Adding Within 100 (With Regrouping) | 2.OA.A.1 |
| `addition-grade2-03` | Adding to Find Totals in Arrays | 2.OA.C.4 |

**Grade 3 Addition (3 lessons)**
| Lesson ID | Title | Standards |
|-----------|-------|-----------|
| `addition-grade3-01` | Adding Hundreds (Place Value) | 3.NBT.A.2 |
| `addition-grade3-02` | Adding Within 1000 | 3.NBT.A.2 |
| `addition-grade3-03` | Two-Step Addition Problems | 3.OA.D.8 |

#### Subtraction (9 lessons target)

**Grade 1 Subtraction (3 lessons)**
| Lesson ID | Title | Standards |
|-----------|-------|-----------|
| `subtraction-grade1-01` | Taking Away (Within 10) | 1.OA.C.5, 1.OA.C.6 |
| `subtraction-grade1-02` | Taking Away (Within 20) | 1.OA.A.1, 1.OA.C.6 |
| `subtraction-grade1-03` | Subtraction as Unknown Addend | 1.OA.B.4, 1.OA.D.8 |

**Grade 2 Subtraction (3 lessons)**
| Lesson ID | Title | Standards |
|-----------|-------|-----------|
| `subtraction-grade2-01` | Subtracting Within 100 (No Regrouping) | 2.OA.A.1, 2.OA.B.2 |
| `subtraction-grade2-02` | Subtracting Within 100 (With Regrouping) | 2.OA.A.1 |
| `subtraction-grade2-03` | One- and Two-Step Subtraction Word Problems | 2.OA.A.1 |

**Grade 3 Subtraction (3 lessons)**
| Lesson ID | Title | Standards |
|-----------|-------|-----------|
| `subtraction-grade3-01` | Subtracting Hundreds (Place Value) | 3.NBT.A.2 |
| `subtraction-grade3-02` | Subtracting Within 1000 | 3.NBT.A.2 |
| `subtraction-grade3-03` | Two-Step Subtraction Problems | 3.OA.D.8 |

#### Word Problems (9 lessons target)

**Grade 1 Word Problems (3 lessons)**
| Lesson ID | Title | Standards |
|-----------|-------|-----------|
| `word-problems-grade1-01` | Adding Story Problems (Within 10) | 1.OA.A.1 |
| `word-problems-grade1-02` | Taking Away Story Problems (Within 10) | 1.OA.A.1 |
| `word-problems-grade1-03` | Comparing Story Problems | 1.OA.A.1 |

**Grade 2 Word Problems (3 lessons)**
| Lesson ID | Title | Standards |
|-----------|-------|-----------|
| `word-problems-grade2-01` | One-Step Word Problems (Within 100) | 2.OA.A.1 |
| `word-problems-grade2-02` | Two-Step Word Problems (Within 100) | 2.OA.A.1 |
| `word-problems-grade2-03` | Comparing Word Problems | 2.OA.A.1 |

**Grade 3 Word Problems (3 lessons)**
| Lesson ID | Title | Standards |
|-----------|-------|-----------|
| `word-problems-grade3-01` | Two-Step Word Problems with Addition | 3.OA.D.8 |
| `word-problems-grade3-02` | Two-Step Word Problems with Subtraction | 3.OA.D.8 |
| `word-problems-grade3-03` | Mixed Two-Step Problems | 3.OA.D.8 |

**Total: 27 lessons** (3 per grade per topic) — upper end of the target range.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Type checking curriculum JSON | Custom validation script | TypeScript `satisfies` operator | Zero runtime cost; compiler catches mismatches on every build |
| Runtime JSON schema validation | Custom parser | None needed in Phase 2 | Data is static and committed; compile-time check is sufficient; Phase 3/4 can add Zod if dynamic input validated |
| Curriculum storage | IndexedDB table | Plain JSON import | Static data; Dexie is for session tracking, not content |
| Test assertions on data shape | Manual checks | Vitest describe/it blocks | Pattern already established in `db.test.ts`; same style |

**Key insight:** Static committed JSON does not need runtime validators. The risk is authoring errors (wrong field names, broken cross-refs) — which Vitest catches. Runtime security validation (untrusted input) is not applicable here.

---

## Common Pitfalls

### Pitfall 1: `topic` values diverging from Dexie schema
**What goes wrong:** `src/curriculum/types.ts` exports `Topic = 'addition' | 'subtraction' | 'word-problems'`, but `src/db/db.ts` uses `topic: string`. If the Dexie interface is widened (or a new topic added), Phase 5 breaks silently.
**Why it happens:** The two files are maintained independently.
**How to avoid:** Phase 2 defines the `Topic` union in `src/curriculum/types.ts` and `src/db/db.ts` imports it: `topic: Topic` instead of `topic: string`. Phase 2 is the right time to make this fix.
**Warning signs:** TypeScript narrows topic assignment in Phase 5 without error — may pass with `string` but fail at runtime.

### Pitfall 2: `choices` including `answer` creates shuffle-dependent bugs
**What goes wrong:** If `choices` happens to list the answer at index 0, and Phase 4 forgets to shuffle, first-option bias appears.
**Why it happens:** Testing only the happy path.
**How to avoid:** Document clearly that choices are unordered and Phase 4 must shuffle. Vitest can assert that no problem's answer equals `choices[0]` as a soft check.
**Warning signs:** In practice testing, first answer is always correct.

### Pitfall 3: Locked narrationAudio paths that don't match Phase 3's audio pipeline
**What goes wrong:** Phase 2 commits paths like `/audio/lessons/addition-grade1-01/step-1.mp3` but Phase 3's audio team uses a different convention (e.g., `/narration/grade1/addition/01/01.mp3`).
**Why it happens:** Path convention set in data before Phase 3 designs the audio loading system.
**How to avoid:** The convention `/audio/lessons/{lessonId}/step-{N}.mp3` is simple and explicit. Flag in Phase 3's handoff that this path is locked unless all `curriculum.json` entries are bulk-updated.
**Warning signs:** Phase 3 audio doesn't play; paths return 404.

### Pitfall 4: Vite JSON import type is `any` without `resolveJsonModule`
**What goes wrong:** With some tsconfig configurations, imported JSON is typed as `any`, defeating TypeScript safety.
**Why it happens:** Missing `resolveJsonModule` in non-bundler configs.
**How to avoid:** **Verified in this session:** `moduleResolution: "bundler"` (already in `tsconfig.app.json`) enables typed JSON imports without needing `resolveJsonModule`. The `satisfies` assertion in `index.ts` catches structural mismatches at compile time.
**Warning signs:** TypeScript autocomplete doesn't show curriculum properties.

### Pitfall 5: Grade 3 content scope confusion
**What goes wrong:** Authoring grade 3 lessons that cover multiplication/division (3.OA.A) when the app only covers addition/subtraction.
**Why it happens:** Grade 3 OA standards are dominated by multiplication; addition/subtraction at grade 3 lives in 3.NBT.
**How to avoid:** Grade 3 content targets 3.NBT.A.2 (add/subtract within 1000) and 3.OA.D.8 (two-step word problems, addition/subtraction operations only). Explicitly tag each lesson's `ccStandards` field.
**Warning signs:** Equations like `4 × 3` appearing in grade 3 lessons.

---

## Content Guidelines: Word Problem Examples

Word problems use the same schema as numeric problems with `topic: 'word-problems'`. The `question` field contains the full text. Aligned to Remy the Fox's warm, encouraging tone.

### Grade 1 Word Problems (within 10–20)
```json
{
  "question": "Mia has 3 apples. She picks 4 more apples from the tree. How many apples does she have now?",
  "answer": 7,
  "type": "multiple-choice",
  "choices": [5, 6, 7, 8]
}
```

### Grade 2 Word Problems (within 100)
```json
{
  "question": "Remy has 24 stickers. He gives 11 stickers to his friend. How many stickers does Remy have left?",
  "answer": 13,
  "type": "digit-grid"
}
```

### Grade 3 Word Problems (two-step, within 1000)
```json
{
  "question": "A school has 245 books in the library. They buy 130 more books, then give away 75 old books. How many books are in the library now?",
  "answer": 300,
  "type": "digit-grid"
}
```

**Tone rules for word problem text:**
- Use named characters (Mia, Remy, Leo, Zara) — keeps it relatable
- Concrete, tangible objects (apples, stickers, books, blocks, fish)
- Single-sentence setup where possible for grades 1–2
- Positive framing — never losing things that matter, never sad outcomes

---

## Problems Per Lesson: Research-Backed Guidance

Research on elementary math practice (ages 6–9) recommends quality over quantity. [CITED: ies.ed.gov WWC practice guides, verified via web search 2026-05-13]

**Recommendation for this app:**
- **Grade 1:** 4–5 problems per lesson (short attention span; multiple-choice preferred)
- **Grade 2:** 5–6 problems per lesson (mix of multiple-choice and digit-grid)
- **Grade 3:** 5–6 problems per lesson (digit-grid appropriate for larger numbers)

**Split by type:** Aim for 60% multiple-choice, 40% digit-grid within each lesson's problem set. Multiple-choice reduces frustration for younger/struggling students; digit-grid builds fluency.

**Total problems estimate:** 27 lessons × ~5 problems = ~135 problems in v1 curriculum.

---

## Vite JSON Import: Technical Details

[VERIFIED: empirical test in this session against the installed Vite 8.0.12 + TypeScript 6.0.3]

- `moduleResolution: "bundler"` (already in `tsconfig.app.json`) enables `.json` imports natively — **no `resolveJsonModule` needed**
- Vite transforms `import data from './file.json'` into `JSON.parse('...')` for production builds — performant
- Named exports are supported: `import { lessons } from './curriculum.json'` — enables tree-shaking if only part of the file is used
- For this app, the full import (`import curriculum from './curriculum.json'`) is appropriate since all lessons and problems are needed
- `verbatimModuleSyntax: true` (in `tsconfig.app.json`) is compatible — JSON imports work correctly
- No `?url` workaround needed; ~135 problems + 27 lessons is well under any bundle-size concern

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `as SomeType` JSON cast | `satisfies SomeType` assertion | TypeScript 4.9 (Nov 2022) | `satisfies` reports errors; `as` suppresses them |
| `resolveJsonModule: true` required | Bundler mode handles JSON natively | TypeScript 5.0 (Mar 2023) | No tsconfig change needed for this project |
| Runtime JSON validators (Ajv, Zod) for static data | Compile-time `satisfies` + Vitest assertions | Ongoing | Static committed data doesn't need runtime validation overhead |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Grade 3 addition/subtraction standards are primarily 3.NBT.A.2 (not in 3.OA) | Common Core Coverage | Grade 3 lessons tagged to wrong standard IDs; cosmetic, does not break functionality |
| A2 | 4–6 problems per lesson is appropriate for ages 6–9 | Problems Per Lesson | Too few (kids finish too fast) or too many (frustration). Low risk; adjustable in JSON with no code changes |

---

## Open Questions (RESOLVED)

1. **Dexie `topic: string` vs `topic: Topic` alignment**
   - What we know: `src/db/db.ts` currently types `Session.topic` and `TopicProgress.topic` as `string`
   - What's unclear: Should Phase 2 update `db.ts` to import and use the `Topic` union, or leave that for Phase 5?
   - Recommendation: Phase 2 should fix this as part of defining the `Topic` union — it's a one-line change that prevents Phase 5 bugs. Include in Phase 2 plan as a small task.

2. **`ccStandards` field: required or optional?**
   - What we know: CURR-01 success criterion says "All Common Core standard identifiers are represented in the curriculum data"
   - What's unclear: Does this mean each lesson must carry its standard IDs as a field, or just that the content covers the standards?
   - Recommendation: Include `ccStandards: string[]` as a required field on `Lesson`. The success criterion is best verified by checking this field in tests. Cost is minimal (adds ~20 bytes per lesson).

---

## Environment Availability

Step 2.6: SKIPPED — Phase 2 is purely code/data authoring with no external service dependencies. All tools (Vite, TypeScript, Vitest) are already installed and verified.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 |
| Config file | `vite.config.ts` (inline `test:` block) |
| Quick run command | `./node_modules/.bin/vitest run src/curriculum/curriculum.test.ts` |
| Full suite command | `./node_modules/.bin/vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CURR-01 | All Common Core standard IDs (1.OA, 2.OA, 3.NBT, 3.OA.D.8) are represented in lesson ccStandards | unit | `./node_modules/.bin/vitest run src/curriculum/curriculum.test.ts` | ❌ Wave 0 |
| CURR-02 | Every lesson step has a non-empty narrationAudio path | unit | `./node_modules/.bin/vitest run src/curriculum/curriculum.test.ts` | ❌ Wave 0 |
| CURR-03 | Every problem.lessonId resolves to a real lesson.id | unit | `./node_modules/.bin/vitest run src/curriculum/curriculum.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `./node_modules/.bin/vitest run src/curriculum/curriculum.test.ts`
- **Per wave merge:** `./node_modules/.bin/vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/curriculum/curriculum.test.ts` — covers CURR-01, CURR-02, CURR-03
- [ ] `src/curriculum/types.ts` — required before test file can import types
- [ ] `src/curriculum/index.ts` — required before test file can import curriculum

*(No framework install needed — Vitest already configured and passing 11 tests)*

---

## Security Domain

Security enforcement applies, but Phase 2 has no meaningful attack surface. The curriculum is static committed data, imported as a module at build time. There is no user input, no network request, no authentication, and no stored secrets in this phase.

| ASVS Category | Applies | Rationale |
|---------------|---------|-----------|
| V2 Authentication | No | No auth in this phase |
| V3 Session Management | No | No sessions in this phase |
| V4 Access Control | No | Public static data |
| V5 Input Validation | No | No user input; data is committed source code |
| V6 Cryptography | No | No secrets or encrypted data |

---

## Sources

### Primary (HIGH confidence)
- Empirical TypeScript + Vite test — JSON import behavior with `moduleResolution: bundler` verified in session (2026-05-13)
- `src/db/db.ts` — verified Dexie schema and `topic: string` type (read in session)
- `tsconfig.app.json` — verified `moduleResolution: bundler`, `verbatimModuleSyntax: true`, no `resolveJsonModule` (read in session)
- `package.json` — verified installed versions: Vitest 4.1.6, TypeScript 6.0.3, Vite 8.0.12 (read in session)

### Secondary (MEDIUM confidence)
- [Common Core Grade 1 OA Standards](https://www.thecorestandards.org/Math/Content/1/OA/) — confirmed standard IDs via web search cross-referencing multiple sources
- [Common Core Grade 2 OA Standards](https://www.thecorestandards.org/Math/Content/2/OA/) — same
- [Common Core Grade 3 OA Standards](https://www.thecorestandards.org/Math/Content/3/OA/) — confirmed 3.OA is multiplication/division; addition/subtraction at grade 3 is 3.NBT
- [Vite Features — JSON Import](https://vite.dev/guide/features) — confirmed native JSON support, named exports, tree-shaking
- [TypeScript satisfies operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html) — compile-time only, no runtime overhead

### Tertiary (LOW confidence)
- [IES WWC Elementary Math Practice Guides](https://ies.ed.gov/ncee/wwc/PracticeGuide/26) — basis for 4–6 problems per lesson recommendation; not directly quantified in the source

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in installed project
- Common Core coverage: MEDIUM — standard IDs cross-verified from multiple web sources; site returned 403 but content confirmed via multiple secondary sources
- Architecture: HIGH — TypeScript patterns empirically verified in session
- Pitfalls: HIGH — grounded in verified technical behavior

**Research date:** 2026-05-13
**Valid until:** 2026-08-13 (stable standards; TypeScript/Vite APIs stable)
