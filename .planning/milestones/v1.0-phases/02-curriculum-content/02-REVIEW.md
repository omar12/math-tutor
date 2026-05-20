---
phase: 02-curriculum-content
reviewed: 2026-05-14T12:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/curriculum/types.ts
  - src/curriculum/curriculum.test.ts
  - src/db/db.ts
  - src/curriculum/index.ts
  - src/curriculum/curriculum.json
findings:
  critical: 2
  warning: 3
  info: 1
  total: 6
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-05-14T12:00:00Z
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Reviewed the full curriculum content layer: type definitions, the curriculum JSON data file (27 lessons, 135 problems), the Dexie database schema, the curriculum index module, and the data-integrity test suite.

The TypeScript types and Dexie schema are structurally sound. All arithmetic answers in the curriculum data verify correctly. Lesson ordering, problem-to-lesson linkage, choice counts, and audio path conventions are all clean.

Two blockers were found: a fictitious Common Core standard (`1.OA.D.8`) embedded in the data, and a test validator that uses an exact standard code where it intends a domain prefix — making the test fragile while appearing to pass. Three warnings cover timezone-unsafe date handling, a missing PIN verification function that forces callers to implement comparison themselves, and incomplete audio path step-number validation.

---

## Critical Issues

### CR-01: Fictitious Common Core Standard in Curriculum Data

**File:** `src/curriculum/curriculum.json:340`
**Issue:** Lesson `subtraction-grade1-03` lists `"1.OA.D.8"` as a ccStandard. This standard code does not exist in the Common Core State Standards. Grade 1 Operations & Algebraic Thinking (1.OA) has only sub-domains A, B, and C. The sub-domain D (`1.OA.D`) does not exist at grade 1 — it is a grade-3 domain (`3.OA.D.8`). The content of this lesson (subtraction as unknown addend) maps to real standard `1.OA.B.4`, which is already also listed on this lesson. The spurious code will propagate into parent-facing progress reports and mastery tracking, reporting a standard that no curriculum authority recognizes.

**Fix:**
```json
// Line 340 — remove "1.OA.D.8" from the array; "1.OA.B.4" already covers the content
"ccStandards": ["1.OA.B.4"]
```

---

### CR-02: Test Validator Uses Exact Code Instead of Domain Prefix for Grade-3 OA Standards

**File:** `src/curriculum/curriculum.test.ts:59`
**Issue:** The `validPrefixes` array is `['1.OA', '2.OA', '3.NBT', '3.OA.D.8']`. The first three entries are domain-level prefixes (matching any standard within that domain). The fourth entry, `'3.OA.D.8'`, is an exact standard code, not a prefix. Any grade-3 OA standard that is valid but different — `'3.OA.A.1'`, `'3.OA.B.5'`, `'3.OA.C.7'` — would fail this validation and be silently rejected. The validator currently passes only because the curriculum happens to use exactly `'3.OA.D.8'`. This is a latent correctness bug: the guard gives false confidence and will block legitimate content additions without a clear error message.

**Fix:**
```typescript
// Line 59 — replace the exact code with the domain prefix
const validPrefixes = ['1.OA', '2.OA', '3.NBT', '3.OA']
```

---

## Warnings

### WR-01: `toISODateString` Records UTC Date, Not Local Device Date

**File:** `src/db/db.ts:11`
**Issue:** `toISODateString` calls `d.toISOString().slice(0, 10)`. `Date.prototype.toISOString()` always returns UTC time. A child using the app at 11:30 PM in UTC-5 is still on the prior calendar day locally, but this function records tomorrow's date (the UTC date). Conversely, a child using the app just after midnight UTC+10 will have their session attributed to yesterday. For a progress-tracking app where "last practiced" and daily streaks are key parent-facing metrics, this is a correctness failure that affects every user outside UTC.

**Fix:**
```typescript
export function toISODateString(d: Date): ISODateString {
  // Use local calendar date, not UTC date
  const year  = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day   = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}` as ISODateString
}
```

---

### WR-02: No `verifyPin` Function Exported — Callers Must Implement Comparison Themselves

**File:** `src/db/db.ts:60–77`
**Issue:** `hashPin` and `storePinHash` are exported, but there is no `verifyPin` (or `checkPin`) function that retrieves the stored hash and performs a constant-time or hash comparison. Any caller that implements PIN verification ad-hoc risks: (a) comparing raw PIN against stored hash (incorrect), (b) using `===` on hash strings (acceptable for SHA-256 hex but not documented as the intended pattern), or (c) omitting the retrieval step entirely and always granting access. The storage boundary is well-guarded; the verification boundary is not.

**Fix:**
```typescript
/**
 * Verifies a raw PIN against the stored SHA-256 hash.
 * Returns true if the PIN matches, false otherwise (including if no PIN is set).
 */
export async function verifyPin(rawPin: string): Promise<boolean> {
  const stored = await db.appConfig.get('pinHash')
  if (!stored) return false
  const candidate = await hashPin(rawPin)
  return candidate === stored.value
}
```

---

### WR-03: Audio Path Validation Does Not Verify Step Number Alignment

**File:** `src/curriculum/curriculum.test.ts:78–84`
**Issue:** The narration audio test validates that each step's `narrationAudio` matches `/^\/audio\/lessons\/.+\/step-\d+\.mp3$/`. This confirms the path format but does not verify that the step number in the path matches the step's actual index (step 1 → `step-1.mp3`, step 2 → `step-2.mp3`, etc.). A transposed or copy-paste error where step 3 references `step-7.mp3` would pass the test. At runtime, the player would either play the wrong audio or attempt to load a non-existent file — both are silent failures from the test's perspective.

**Fix:**
```typescript
it('every lesson step narrationAudio step number matches step index', () => {
  for (const lesson of curriculum.lessons) {
    lesson.workedExample.steps.forEach((step, index) => {
      const expectedSuffix = `/step-${index + 1}.mp3`
      expect(
        step.narrationAudio.endsWith(expectedSuffix),
        `lesson ${lesson.id} step ${index + 1}: expected path ending ${expectedSuffix}, got ${step.narrationAudio}`
      ).toBe(true)
    })
  }
})
```

---

## Info

### IN-01: `AppConfig` Key Union Is TypeScript-Only — No Runtime Enforcement

**File:** `src/db/db.ts:33–36`
**Issue:** The `AppConfig` interface constrains `key` to `'pinHash' | 'lastLessonId' | 'onboardingComplete'`. This is enforced only at compile time. A raw `db.appConfig.put({ key: 'anything', value: '...' })` call with a type assertion or a JavaScript caller bypasses this entirely. IndexedDB stores whatever is provided. This is a minor concern given the local-only, no-auth scope of v1, but any future code that iterates `appConfig` entries to build parent dashboard state could encounter unexpected keys without warning.

**Fix:** Document the limitation with a comment, or add a runtime-enforcing wrapper:
```typescript
/** Type-safe config writer — use instead of db.appConfig.put() directly */
export async function setConfig(key: AppConfig['key'], value: string): Promise<void> {
  await db.appConfig.put({ key, value })
}
```

---

_Reviewed: 2026-05-14T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
