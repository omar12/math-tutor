# Phase 2: Curriculum & Content - Pattern Map

**Mapped:** 2026-05-13
**Files analyzed:** 5
**Analogs found:** 4 / 5

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/curriculum/types.ts` | model (type definitions) | — | `src/db/db.ts` | role-match (interfaces + union types) |
| `src/curriculum/curriculum.json` | config (static data) | — | none | no analog |
| `src/curriculum/index.ts` | utility (module loader) | transform | `src/db/db.ts` | partial-match (module export pattern) |
| `src/curriculum/curriculum.test.ts` | test | batch (data integrity) | `src/db/db.test.ts` | exact |
| `src/db/db.ts` (modify) | model (Dexie schema) | — | self | self-modification |

---

## Pattern Assignments

### `src/curriculum/types.ts` (model, type definitions)

**Analog:** `src/db/db.ts`

**Imports pattern** (`src/db/db.ts` lines 1–2):
```typescript
import { Dexie, type EntityTable } from 'dexie'
```
This file has no imports beyond Dexie — `types.ts` similarly needs no imports (pure type definitions only).

**Interface definition pattern** (`src/db/db.ts` lines 5–18):
```typescript
export interface Session {
  id?: number           // auto-incremented primary key
  topic: string         // 'addition' | 'subtraction' | 'word-problems'
  date: string          // ISO date string
  correctCount: number
  totalCount: number
}

export interface TopicProgress {
  topic: string         // primary key — one record per topic
  accuracy: number      // 0–1 float
  attemptCount: number
  lastPracticed: string // ISO date string
}
```

Key conventions to copy:
- `export interface` (not `type`) for object shapes — matches db.ts style
- Inline comments explaining field semantics and examples (e.g., `// 'addition' | 'subtraction' | 'word-problems'`)
- All fields explicitly typed — no `any`, no implicit types (strict mode is on)
- Named exports for every interface (no default export)

**Discriminated union pattern** — no existing codebase analog; use RESEARCH.md Pattern 1. The `Problem` type is a discriminated union on `type`:
```typescript
interface BaseProblem { ... }
interface MultipleChoiceProblem extends BaseProblem { type: 'multiple-choice'; choices: number[] }
interface DigitGridProblem extends BaseProblem { type: 'digit-grid' }
export type Problem = MultipleChoiceProblem | DigitGridProblem
```

**`Topic` union to export** — this type must also be imported by `src/db/db.ts`:
```typescript
export type Topic = 'addition' | 'subtraction' | 'word-problems'
```

---

### `src/curriculum/curriculum.json` (config, static data)

**Analog:** None — no existing JSON data files in the codebase.

**Use RESEARCH.md patterns directly.** Key structural decisions from CONTEXT.md:
- Top-level shape: `{ "lessons": [...], "problems": [...] }`
- Flat arrays (D-01, D-02) — not nested by grade/topic
- `lessonId` slug format: `'addition-grade1-01'` (D-03 / Discretion)
- `narrationAudio` path convention: `/audio/lessons/{lessonId}/step-{N}.mp3` (D-04 / Discretion)
- 27 lessons total (3 per grade per topic), ~135 problems (~5 per lesson)

**Grade 1 word problem example format from RESEARCH.md**:
```json
{
  "question": "Mia has 3 apples. She picks 4 more apples from the tree. How many apples does she have now?",
  "answer": 7,
  "type": "multiple-choice",
  "choices": [5, 6, 7, 8]
}
```

---

### `src/curriculum/index.ts` (utility, transform/re-export)

**Analog:** `src/db/db.ts` (module export pattern, lines 27–39)

**Module export pattern** (`src/db/db.ts` lines 27–39):
```typescript
const db = new Dexie('MathTutorDB') as Dexie & {
  sessions: EntityTable<Session, 'id'>
  topicProgress: EntityTable<TopicProgress, 'topic'>
  appConfig: EntityTable<AppConfig, 'key'>
}

db.version(1).stores({
  sessions:      '++id, topic, date',
  topicProgress: 'topic',
  appConfig:     'key',
})

export { db }
```

Key conventions to copy:
- Named exports (not default export)
- Module-level const initialized once, then exported
- `export { name }` at bottom of file (not inline `export const`)

**`index.ts` should follow this pattern:**
```typescript
import raw from './curriculum.json'
import type { CurriculumData } from './types'

// satisfies = compile-time check; does not cast or change the runtime value
export const curriculum = raw satisfies CurriculumData

export const lessons = curriculum.lessons
export const problems = curriculum.problems
```

Note: `verbatimModuleSyntax: true` is set in `tsconfig.app.json` — use `import type` for type-only imports (as shown above). Regular `import` for value imports. This matches the db.ts pattern (`import { Dexie, type EntityTable }`).

---

### `src/curriculum/curriculum.test.ts` (test, batch data-integrity)

**Analog:** `src/db/db.test.ts` — exact role and style match.

**Full test file pattern** (`src/db/db.test.ts` lines 1–21):
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from './db'

beforeEach(async () => {
  await db.appConfig.clear()
})

describe('AppConfig persistence', () => {
  it('writes and reads back a key-value record', async () => {
    await db.appConfig.put({ key: 'onboardingComplete', value: 'false' })
    const result = await db.appConfig.get('onboardingComplete')
    expect(result?.value).toBe('false')
  })

  it('overwrites existing key with put()', async () => {
    await db.appConfig.put({ key: 'pinHash', value: 'abc' })
    await db.appConfig.put({ key: 'pinHash', value: 'xyz' })
    const result = await db.appConfig.get('pinHash')
    expect(result?.value).toBe('xyz')
  })
})
```

Key conventions to copy:
- Named imports from `'vitest'` — `{ describe, it, expect }` (not `import * as vitest`)
- Single `describe()` block per concern, `it()` for each assertion
- Descriptive string labels that read as plain English: `'has no duplicate lesson IDs'`
- No `beforeEach` needed for data-integrity tests (read-only, no state to reset)
- `expect(condition, 'message').toBe(true)` pattern for assertions with context messages

**Import pattern for curriculum test** — mirrors db.test.ts but imports from `./index`:
```typescript
import { describe, it, expect } from 'vitest'
import { curriculum } from './index'
```

No `fake-indexeddb` needed — curriculum is pure JSON, no async I/O. Test setup file (`src/test/setup.ts`) is already wired globally via `vite.config.ts` `setupFiles`.

---

### `src/db/db.ts` (modify — narrow `topic: string` to `topic: Topic`)

**Self-modification.** Current lines 5–18 (`src/db/db.ts`):
```typescript
export interface Session {
  id?: number           // auto-incremented primary key
  topic: string         // 'addition' | 'subtraction' | 'word-problems'
  ...
}

export interface TopicProgress {
  topic: string         // primary key — one record per topic
  ...
}
```

**Required change:** Import `Topic` from `src/curriculum/types.ts` and replace both `topic: string` occurrences with `topic: Topic`.

**Pattern for the import line** — follow the existing import style at line 1:
```typescript
import { Dexie, type EntityTable } from 'dexie'
import type { Topic } from '../curriculum/types'
```

Using `import type` because `Topic` is a type-only import and `verbatimModuleSyntax: true` requires this.

---

## Shared Patterns

### Module Export Style
**Source:** `src/db/db.ts` (lines 1, 5, 14, 20, 27, 39)
**Apply to:** `src/curriculum/types.ts`, `src/curriculum/index.ts`
- Use named `export interface` / `export type` / `export { name }` — no default exports in this codebase
- Named exports allow tree-shaking and are the project's established style

### TypeScript Import Discipline (verbatimModuleSyntax)
**Source:** `src/db/db.ts` line 1: `import { Dexie, type EntityTable } from 'dexie'`
**Apply to:** All `.ts` files in this phase
- `verbatimModuleSyntax: true` is enforced in `tsconfig.app.json`
- Type-only imports must use `import type { ... }` or inline `type` keyword: `import { Dexie, type EntityTable }`
- Value imports use plain `import { ... }`
- Mixing in one statement is allowed: `import { value, type TypeName }`

### Vitest Test Structure
**Source:** `src/db/db.test.ts` (lines 1–21)
**Apply to:** `src/curriculum/curriculum.test.ts`
```typescript
import { describe, it, expect } from 'vitest'
// named imports, single describe block, it() assertions
describe('descriptive group name', () => {
  it('plain-English behavior description', () => {
    expect(actual).toBe(expected)
  })
})
```

### Inline Documentation Comments
**Source:** `src/db/db.ts` (lines 6–11)
**Apply to:** `src/curriculum/types.ts`
```typescript
topic: string         // 'addition' | 'subtraction' | 'word-problems'
date: string          // ISO date string
```
Pattern: type annotation followed by `//` comment explaining valid values or format. Copy this style for all curriculum type fields.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/curriculum/curriculum.json` | config (static data) | — | No existing JSON data files in the codebase; first static content file. Use RESEARCH.md schema patterns and CONTEXT.md decisions directly. |

---

## Metadata

**Analog search scope:** `src/` — all TypeScript/TSX source files
**Files scanned:** 10 (all src files)
**Analogs read:** `src/db/db.ts`, `src/db/db.test.ts`, `src/test/setup.ts`, `vite.config.ts`, `tsconfig.app.json`
**Pattern extraction date:** 2026-05-13
