---
phase: 02-curriculum-content
reviewed: 2026-05-13T10:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/curriculum/types.ts
  - src/curriculum/index.ts
  - src/curriculum/curriculum.test.ts
  - src/db/db.ts
  - src/curriculum/curriculum.json
findings:
  critical: 1
  warning: 5
  info: 3
  total: 9
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-13T10:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Reviewed the full curriculum content layer: TypeScript type definitions, the module re-export, the Vitest integrity test suite, the Dexie database schema, and the 2100-line curriculum JSON. All 27 lessons and all 135 problems (75 multiple-choice, 60 digit-grid) were verified for arithmetic correctness — every answer is mathematically accurate and every MC answer is present in its choices array. The type discriminated union in `types.ts` is sound and `satisfies CurriculumData` in `index.ts` is correct. The major findings center on: a test suite gap that allows a permanently-unsolvable multiple-choice problem to ship undetected; a schema-architecture conflict between `db.ts` and `CLAUDE.md`; and several missing test assertions and type-safety gaps that will cause silent failures at runtime in future phases.

---

## Critical Issues

### CR-01: Test Suite Does Not Verify Answer Is Contained in MC Choices

**File:** `src/curriculum/curriculum.test.ts:118-123`

**Issue:** The test checks that every `multiple-choice` problem has exactly 4 choices, but never checks that `problem.answer` is one of those 4 choices. A misconfigured problem where the correct answer is absent from the choices array would make it impossible for any child to answer correctly — Phase 4 compares user input to `answer` using `===`, and the correct tile would never be rendered. A full cross-check of all 75 MC problems in the current JSON shows no instance of this bug today, but the test does not protect against it in future edits.

**Fix:**
```typescript
it('multiple-choice problems contain the correct answer in choices', () => {
  for (const p of curriculum.problems) {
    if (p.type === 'multiple-choice') {
      expect(
        p.choices,
        `problem ${p.id}: answer ${p.answer} is not in choices ${JSON.stringify(p.choices)}`
      ).toContain(p.answer)
    }
  }
})
```

---

## Warnings

### WR-01: `db.ts` AppConfig Schema Contradicts CLAUDE.md Storage Architecture

**File:** `src/db/db.ts:22-38`

**Issue:** `AppConfig` is a Dexie/IndexedDB entity with a comment explicitly listing `'pinHash' | 'lastLessonId' | 'onboardingComplete'` as its keys. But `CLAUDE.md` specifies that PIN hash and last lesson ID belong in `localStorage` (native synchronous key/value). If different phases each implement against their own interpretation of this document conflict, PIN authentication (Phase 3) and lesson resumption (Phase 4) will silently fail to find each other's data: one phase writes to IndexedDB, the next reads from `localStorage`, and both succeed without error.

**Fix:** Decide on one canonical storage location for each key and update the other document. If IndexedDB is preferred, remove the `localStorage` spec for `pinHash` / `lastLessonId` from CLAUDE.md. If `localStorage` is preferred, remove `AppConfig` from `db.ts` and provide a typed wrapper:

```typescript
// src/storage/config.ts
const CONFIG_KEYS = ['pinHash', 'lastLessonId', 'onboardingComplete'] as const
type ConfigKey = typeof CONFIG_KEYS[number]

export const getConfig = (key: ConfigKey): string | null =>
  localStorage.getItem(key)

export const setConfig = (key: ConfigKey, value: string): void =>
  localStorage.setItem(key, value)
```

### WR-02: Narration Audio Path Regex Does Not Validate the `lessonId` Segment

**File:** `src/curriculum/curriculum.test.ts:81`

**Issue:** The regex `^\/audio\/lessons\/.+\/step-\d+\.mp3$` uses `.+` for the path segment that should contain the owning lesson's ID. It permits any non-empty string, so a step whose `narrationAudio` points to a different lesson's directory (e.g., `/audio/lessons/wrong-lesson-id/step-1.mp3`) will pass. Copy-paste errors in the JSON would be invisible to the test. The unescaped `.` before `mp3` also allows strings like `/audio/lessons/x/step-1Xmp3` to pass.

**Fix:**
```typescript
it('every lesson step narrationAudio follows /audio/lessons/{lessonId}/step-{N}.mp3 convention', () => {
  for (const lesson of curriculum.lessons) {
    for (const step of lesson.workedExample.steps) {
      const expected = new RegExp(
        `^/audio/lessons/${lesson.id}/step-\\d+\\.mp3$`
      )
      expect(step.narrationAudio).toMatch(expected)
    }
  }
})
```

### WR-03: `Session` and `TopicProgress` Both Lack a `grade` Field — Parent Dashboard Will Be Too Coarse

**File:** `src/db/db.ts:6-19`

**Issue:** `Session` stores `topic`, `date`, `correctCount`, and `totalCount`, but no `lessonId` or `grade`. `TopicProgress` stores `topic`-level accuracy but no `grade`. The project goal (CLAUDE.md) is to surface "exactly what their child understands and what they don't" for parents. At this schema granularity, the parent dashboard can only show topic-level accuracy across all grades combined (e.g., "addition: 60%") — it cannot distinguish a child who struggles with Grade 3 three-digit addition from one who struggles with Grade 1 single-digit addition. There is also no way to query session history for a specific grade after data is written.

**Fix:** Add `lessonId` and `grade` to `Session`, add `grade` to `TopicProgress`, and update the Dexie index:

```typescript
export interface Session {
  id?: number
  lessonId: string       // foreign key -> Lesson.id
  topic: Topic
  grade: 1 | 2 | 3
  date: string
  correctCount: number
  totalCount: number
}

export interface TopicProgress {
  topic: Topic
  grade: 1 | 2 | 3      // separate row per grade
  accuracy: number
  attemptCount: number
  lastPracticed: string
}

// Dexie schema update — also bump the version since schema changes
db.version(2).stores({
  sessions:      '++id, lessonId, topic, grade, date',
  topicProgress: '[topic+grade]',   // compound primary key
  appConfig:     'key',
})
```

### WR-04: `AppConfig.key` Is Typed as `string`, Not as the Literal Union

**File:** `src/db/db.ts:21-24`

**Issue:** The `AppConfig` interface comments list the intended keys as `'pinHash' | 'lastLessonId' | 'onboardingComplete'`, but the `key` field is typed as `string`. Any caller can write `db.appConfig.put({ key: 'pinhash', value: 'x' })` (note the typo), and TypeScript will not catch it. The correct key `'pinHash'` would then never be found by a reader, causing a silent auth or state failure at runtime.

**Fix:**
```typescript
type AppConfigKey = 'pinHash' | 'lastLessonId' | 'onboardingComplete'

export interface AppConfig {
  key: AppConfigKey   // primary key: type-safe config key
  value: string
}
```

### WR-05: Test Does Not Verify Topic Consistency Between Problem and Its Referenced Lesson

**File:** `src/curriculum/curriculum.test.ts:22-26`

**Issue:** The test `every problem.lessonId resolves to a real lesson` confirms only that the referenced lesson ID exists. It does not check that `problem.topic === lesson.topic` or `problem.grade === lesson.grade`. A problem could reference a valid lesson while having mismatched metadata (e.g., a `subtraction` problem referencing an `addition` lesson). The parent dashboard and progress tracking depend on these fields being consistent; a mismatch would silently miscredit practice to the wrong topic.

**Fix:**
```typescript
it('every problem topic and grade matches its referenced lesson', () => {
  const lessonMap = new Map(curriculum.lessons.map(l => [l.id, l]))
  for (const p of curriculum.problems) {
    const lesson = lessonMap.get(p.lessonId)!
    expect(p.topic, `problem ${p.id} topic mismatch`).toBe(lesson.topic)
    expect(p.grade, `problem ${p.id} grade mismatch`).toBe(lesson.grade)
  }
})
```

---

## Info

### IN-01: ccStandard Prefix Validation Mixes Granularity Levels and Permits Future False Positives

**File:** `src/curriculum/curriculum.test.ts:59-66`

**Issue:** The valid prefix list `['1.OA', '2.OA', '3.NBT', '3.OA.D.8']` mixes levels of specificity. Using `'3.OA.D.8'` as a prefix also allows `'3.OA.D.80'` or `'3.OA.D.8xyz'` to pass. More practically, any other valid Grade 3 OA standard (e.g., `3.OA.A.1`) would be incorrectly rejected if added to a future lesson, causing false test failures that have no real content problem.

**Fix:** Use consistent granularity — either all domain prefixes, or an explicit allowlist of exact IDs:
```typescript
// Option A: domain-level prefixes (permissive but consistent)
const validPrefixes = ['1.OA', '2.OA', '3.NBT', '3.OA']

// Option B: exact standard allowlist (strictest)
const validStandards = new Set([
  '1.OA.A.1', '1.OA.A.2', '1.OA.B.4', '1.OA.C.5', '1.OA.C.6', '1.OA.D.8',
  '2.OA.A.1', '2.OA.B.2', '2.OA.C.4',
  '3.NBT.A.2', '3.OA.D.8',
])
for (const lesson of curriculum.lessons) {
  for (const std of lesson.ccStandards) {
    expect(validStandards.has(std), `lesson ${lesson.id}: unknown standard ${std}`).toBe(true)
  }
}
```

### IN-02: `WorkedExample.steps` Type Allows Empty Arrays — Type Does Not Match Intent

**File:** `src/curriculum/types.ts:12-14`

**Issue:** `WorkedExample` is defined as `{ steps: LessonStep[] }`. TypeScript allows `steps: []` — an empty array — which would produce a lesson with no narration or worked content to display. The test catches this at runtime, but the type itself permits the bad state. TypeScript 4.0+ supports non-empty tuple types.

**Fix:** Use a tuple minimum type or add a runtime non-empty check:
```typescript
export interface WorkedExample {
  steps: [LessonStep, ...LessonStep[]]  // at least one step required by the type
}
```

### IN-03: `Session.id` Optional Type Is Misleading After Database Read

**File:** `src/db/db.ts:7`

**Issue:** `Session.id` is typed as `id?: number` (optional) to accommodate pre-insert objects. However, after a Dexie `add()` or `get()` call, the returned object always has `id` set. Code that reads sessions from the database must guard against `undefined` even though `undefined` can never actually occur in practice, leading to defensive coding that obscures intent.

**Fix:** Use a separate type for the insert shape vs. the persisted shape, which is the pattern Dexie's `EntityTable` is designed to support:
```typescript
// Insert-time shape (id absent)
export interface NewSession {
  topic: Topic
  date: string
  correctCount: number
  totalCount: number
}

// Persisted shape (id always present)
export interface Session extends NewSession {
  id: number
}
```
Or, if keeping a single interface, document that `id` is only undefined at insert time, not at read time.

---

_Reviewed: 2026-05-13T10:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
