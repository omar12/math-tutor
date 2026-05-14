---
phase: 02-curriculum-content
reviewed: 2026-05-14T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/curriculum/curriculum.json
  - src/curriculum/curriculum.test.ts
  - src/curriculum/index.ts
  - src/curriculum/types.ts
  - src/db/db.ts
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-05-14
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five files reviewed covering the curriculum data layer: type definitions (`types.ts`), the curriculum JSON fixture (`curriculum.json`), the module re-export (`index.ts`), the integrity test suite (`curriculum.test.ts`), and the Dexie database schema (`db.ts`).

The math content and data structures are largely sound — all arithmetic answers verify correctly, no duplicate IDs, and the TypeScript type hierarchy is coherent. However, one critical security gap exists in the PIN storage schema, and several quality issues weaken the test suite and type safety in ways that will permit silent bugs in later phases.

---

## Critical Issues

### CR-01: PIN stored with no enforced hashing — plaintext PIN risk

**File:** `src/db/db.ts:22–24`

**Issue:** `AppConfig` stores the parent PIN under the key `'pinHash'` as a plain `string`. The schema, type definition, and the rest of Phase 2 contain no hashing implementation. The key name implies hashing is intended, but nothing enforces it — a Phase 4 implementer could write `db.appConfig.put({ key: 'pinHash', value: pin })` with the raw PIN and the schema will silently accept it. If the device is backed up or inspected, the PIN is exposed. For a children's app gating parental controls, this is the primary trust boundary.

**Fix:** Enforce hashing at the storage boundary by providing a typed helper that accepts only pre-hashed values, or at minimum add a JSDoc contract and runtime assertion:

```typescript
// db.ts — add a typed write helper so callers cannot bypass hashing
import { db } from './db'

/**
 * Stores a PIN. MUST be called with a SHA-256 hex digest — never the raw PIN.
 * Call hashPin(rawPin) first.
 */
export async function storePinHash(hexDigest: string): Promise<void> {
  if (!/^[0-9a-f]{64}$/.test(hexDigest)) {
    throw new Error('storePinHash: argument must be a SHA-256 hex digest')
  }
  await db.appConfig.put({ key: 'pinHash', value: hexDigest })
}

// Companion utility (uses Web Crypto — never Math.random or btoa):
export async function hashPin(pin: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
```

---

## Warnings

### WR-01: Test suite has no assertion that MC answer is present in its choices array

**File:** `src/curriculum/curriculum.test.ts:118–124`

**Issue:** The test at line 118 checks that multiple-choice problems have exactly 4 choices, but it never asserts that the declared `answer` value is one of those choices. A problem with `answer: 42` and `choices: [1, 2, 3, 4]` would pass all existing tests and be completely unanswerable at runtime. Phase 4 will compare the user's selected choice against `answer` with `===`; if the correct answer is absent from the choices, the problem can never be completed.

**Fix:** Add an assertion inside a new test block:

```typescript
it('multiple-choice problems have the correct answer in their choices', () => {
  for (const p of curriculum.problems) {
    if (p.type === 'multiple-choice') {
      expect(
        p.choices.includes(p.answer),
        `problem ${p.id}: answer ${p.answer} is not in choices ${JSON.stringify(p.choices)}`
      ).toBe(true)
    }
  }
})
```

### WR-02: `AppConfig.key` is typed as `string` instead of a literal union

**File:** `src/db/db.ts:21–24`

**Issue:** The comment documents the only valid keys as `'pinHash' | 'lastLessonId' | 'onboardingComplete'`, but the field is typed as `string`. Any arbitrary string is accepted by TypeScript without error, meaning typos like `'pinhash'` or new undocumented keys silently succeed at compile time. With Dexie's upsert semantics (`put`), a misspelled key creates a ghost record that is never read, causing hard-to-diagnose "settings not saved" bugs.

**Fix:**

```typescript
export interface AppConfig {
  key: 'pinHash' | 'lastLessonId' | 'onboardingComplete'
  value: string
}
```

Dexie's `EntityTable` and schema definition are compatible with literal-typed primary keys.

### WR-03: `Session` has no `lessonId` field — per-lesson progress is untrackable

**File:** `src/db/db.ts:6–12`

**Issue:** `Session` records only `topic`, not `lessonId`. The stated project goal is for parents to see "exactly what their child understands and what they don't," but with the current schema accuracy is only knowable at the topic level across all grades. A child struggling with Grade 3 regrouping but excelling at Grade 1 facts both contribute identically to the `addition` topic accuracy. Retrofitting `lessonId` in Phase 4 or 5 requires a Dexie schema version migration (`db.version(2)`), which is more disruptive than adding the field now.

**Fix:** Add `lessonId` while the schema is still at version 1:

```typescript
export interface Session {
  id?: number
  lessonId: string        // foreign key -> Lesson.id
  topic: Topic
  grade: 1 | 2 | 3       // denormalized for easy filtering
  date: string
  correctCount: number
  totalCount: number
}

// Schema:
db.version(1).stores({
  sessions: '++id, lessonId, topic, grade, date',
  topicProgress: 'topic',
  appConfig:     'key',
})
```

### WR-04: `date` / `lastPracticed` string format is unenforced — silent sort failures

**File:** `src/db/db.ts:9, 19`

**Issue:** Both `Session.date` and `TopicProgress.lastPracticed` are declared as `string` with a comment "ISO date string," but nothing enforces whether callers store `'2026-05-14'` (date-only) or `'2026-05-14T12:00:00Z'` (full datetime). If Phase 4 stores full datetimes and the parent dashboard sorts or filters using string comparison, mixed formats will produce wrong ordering. String comparison of ISO dates works only when all values share the same format and length.

**Fix:** Define a branded alias and a centralised formatter to prevent format drift across phases:

```typescript
/** ISO 8601 date-only string: YYYY-MM-DD */
type ISODateString = string & { readonly _brand: 'ISODateString' }

export function toISODateString(d: Date): ISODateString {
  return d.toISOString().slice(0, 10) as ISODateString
}
```

Replace `string` with `ISODateString` in `Session.date` and `TopicProgress.lastPracticed`.

---

## Info

### IN-01: `ccStandards` prefix whitelist uses inconsistent matching strategy

**File:** `src/curriculum/curriculum.test.ts:59–66`

**Issue:** `validPrefixes` mixes broad prefixes (`'1.OA'`, `'2.OA'`, `'3.NBT'`) with a single fully-qualified standard (`'3.OA.D.8'`). The `startsWith` check means `'3.OA.D.8'` technically also accepts strings like `'3.OA.D.80'`. More practically, if a future lesson needs any other Grade 3 OA standard (e.g., `3.OA.A.3`), the test will fail because neither `'3.NBT'` nor `'3.OA.D.8'` will match it, and the intent behind the restriction will not be obvious.

**Fix:** Make the two-tier strategy explicit:

```typescript
const validGrade3OA = new Set(['3.OA.D.8'])

const valid = std.startsWith('1.OA') ||
              std.startsWith('2.OA') ||
              std.startsWith('3.NBT') ||
              validGrade3OA.has(std)
```

### IN-02: Lesson `addition-grade3-01` introduces round-hundred addition but includes mixed-addend problems

**File:** `src/curriculum/curriculum.json:183–211, 1136–1161`

**Issue:** The lesson "Adding Hundreds (Place Value)" uses `300 + 400` as its worked example — pure round-hundred arithmetic. However, problems p3 and p4 for this lesson present `150 + 250` and `320 + 180`, which require tens-digit addition that the lesson never demonstrates. A child who absorbed only the lesson's worked example will encounter a technique gap when reaching these problems.

**Fix:** Either adjust the lesson worked example to include a non-round-hundred example (e.g., `250 + 150`), or replace p3/p4 with problems consistent with round-hundred scope (e.g., `100 + 600`, `200 + 700`).

### IN-03: `TopicProgress.accuracy` has no 0–1 range guard at the storage layer

**File:** `src/db/db.ts:14–19`

**Issue:** `accuracy: number` is commented as "0–1 float" but TypeScript's `number` accepts `NaN`, `Infinity`, negative values, and values above 1. A divide-by-zero in Phase 4 (e.g., `correctCount / totalCount` when `totalCount === 0`) would silently store `NaN`. The parent dashboard would then display `NaN%` or render broken progress indicators.

**Fix:** Add a guard in any function that writes `TopicProgress`:

```typescript
function clampAccuracy(raw: number): number {
  if (!isFinite(raw)) return 0
  return Math.max(0, Math.min(1, raw))
}
```

---

_Reviewed: 2026-05-14_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
