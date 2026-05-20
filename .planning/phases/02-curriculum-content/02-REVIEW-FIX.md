---
phase: 02-curriculum-content
fixed_at: 2026-05-14T00:00:00Z
review_path: .planning/phases/02-curriculum-content/02-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 2: Code Review Fix Report

**Fixed at:** 2026-05-14
**Source review:** .planning/phases/02-curriculum-content/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 5
- Fixed: 5
- Skipped: 0

## Fixed Issues

### CR-01: PIN stored with no enforced hashing — plaintext PIN risk

**Files modified:** `src/db/db.ts`
**Commit:** `01d5d9b`
**Applied fix:** Added `hashPin(pin: string): Promise<string>` using `crypto.subtle.digest('SHA-256', ...)` and `storePinHash(hexDigest: string): Promise<void>` with a runtime guard that throws if the argument is not a valid 64-character lowercase hex digest. Both are exported from `db.ts` so Phase 4 callers have a clear, enforced path to hashing before storage.

### WR-01: Test suite has no assertion that MC answer is present in its choices array

**Files modified:** `src/curriculum/curriculum.test.ts`
**Commit:** `c4fe912`
**Applied fix:** Added a new `it` block — "multiple-choice problems have the correct answer in their choices" — directly after the existing choices-length test. It iterates all multiple-choice problems and calls `expect(p.choices.includes(p.answer)).toBe(true)` with a per-problem diagnostic message.

### WR-02: `AppConfig.key` typed as `string` not a literal union

**Files modified:** `src/db/db.ts`
**Commit:** `d9f67fc`
**Applied fix:** Changed `AppConfig.key` from `string` to the literal union `'pinHash' | 'lastLessonId' | 'onboardingComplete'`. The comment that previously documented these values was replaced by the type itself.

### WR-03: `Session` missing `lessonId`

**Files modified:** `src/db/db.ts`
**Commit:** `a183b93`
**Applied fix:** Added `lessonId: string` and `grade: 1 | 2 | 3` fields to the `Session` interface (matching the reviewer's suggestion). Updated the Dexie schema string from `'++id, topic, date'` to `'++id, lessonId, topic, grade, date'` so `lessonId` and `grade` are indexed. No version migration needed — schema is still at version 1.

### WR-04: ISO date string format unenforced — silent sort failures

**Files modified:** `src/db/db.ts`
**Commit:** `be45ca4`
**Applied fix:** Added the `ISODateString` branded type (`string & { readonly _brand: 'ISODateString' }`) and a `toISODateString(d: Date): ISODateString` formatter that slices `Date.toISOString()` to 10 characters (YYYY-MM-DD). Replaced `string` with `ISODateString` in `Session.date` and `TopicProgress.lastPracticed`. Both type and formatter are exported for use in Phase 4.

---

_Fixed: 2026-05-14_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
