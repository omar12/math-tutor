# Phase 7: Lesson Catalog — Research

**Researched:** 2026-05-19
**Domain:** HomeScreen restructure — scrollable lesson catalog with completion and accuracy state
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** HomeScreen replaces the single "Start Learning" button with a scrollable lesson catalog. Remy the Fox mascot + "Math Time!" heading remain at top; catalog scrolls below.
- **D-02:** Lessons organized into 3 topic sections: Addition / Subtraction / Word Problems. Section headers use the topic name. Lesson cards listed under each section header in curriculum order (`lesson.order` ascending). No adaptive reordering within sections.
- **D-03:** The `/pin` lock icon stays in the top-right corner — unchanged from Phase 5 D-01.
- **D-04:** Each lesson card shows: lesson title + completion ring (checkmark icon when `db.sessions` contains ≥1 record with that `lessonId`) + accuracy dot (color derived from topic `TopicProgress` — green ≥70%, blue <70%, gray if no TopicProgress data for that topic).
- **D-05:** Accuracy shown is topic-level (from `db.topicProgress`), not per-lesson. All lessons in the same topic share the same accuracy color.
- **D-06:** Tapping any lesson card navigates to `/lesson/${lesson.id}`.
- **D-07:** Lesson cards must meet 44×44px minimum touch target with `touch-action: manipulation`.
- **D-08:** The topic section with the lowest `accuracy` in `db.topicProgress` gets a "Needs practice" badge on its section header. Only one topic is highlighted at a time. If no `TopicProgress` data exists, no badge is shown.
- **D-09:** Tie-break for weakest topic (equal accuracy): use topic array order (addition → subtraction → word-problems), first one wins.
- **D-10:** Two `useLiveQuery` hooks — same as current HomeScreen: `db.sessions.toArray()` and `db.topicProgress.toArray()`. No new DB tables or fields needed.
- **D-11:** Loading state: while either Dexie query is `undefined`, render minimal loading shell.

### Claude's Discretion

- Section header visual style (font size, weight, color, spacing)
- Lesson card visual design (rounded corners, padding, shadow, tap feedback)
- Completion ring icon (checkmark circle SVG or Tailwind class)
- Accuracy dot size and position on card (right-aligned, alongside title, etc.)
- "Needs practice" badge design (pill, text size, accent color)
- Scroll behavior (standard overflow-y-auto, no momentum tweaks needed)

### Deferred Ideas (OUT OF SCOPE)

- Per-lesson accuracy tracking (requires new DB aggregate)
- Grade-level tabs or filters — V2 scope
- Lesson completion percentage within a topic (e.g., "3/9 done") — V2 scope
- Animated completion rings — keep static for v1
</user_constraints>

---

## Summary

Phase 7 is a surgical HomeScreen-only modification. The existing component already has the two `useLiveQuery` hooks needed (though the sessions hook is absent and must be added), the loading guard pattern, the lock icon, Remy, and the heading. The "Start Learning" button is replaced with a scrollable section list. No new routes, no new DB tables, no new components beyond what is composed inline or extracted into a `LessonCard` sub-component.

The most important structural change is to the outer container: the current `justify-center` flex layout will be replaced with a top-anchored scroll layout. The outer wrapper becomes a fixed-height (100dvh) container that clips overflow; an inner scrollable div contains the catalog. This is standard iOS Safari scroll confinement and is the main CSS migration risk.

The `sortedLessons` export is no longer needed by the new HomeScreen (catalog order is always curriculum order), but the function itself should be preserved because existing tests import and exercise it directly.

**Primary recommendation:** Keep the `sortedLessons` export (tested separately), add `db.sessions` useLiveQuery hook, derive a `Set<string>` of completed lesson IDs and an accuracy map, then replace the button JSX with a topic-grouped card list inside an `overflow-y-auto` inner div.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Completion detection | Frontend (derived) | Database read | Derive `Set<lessonId>` from `sessions` array — no new query needed |
| Accuracy dot color | Frontend (derived) | Database read | Map `topic → TopicProgress.accuracy → color` — same logic as ProgressBar |
| Weakest topic detection | Frontend (derived) | — | Reduce `topicProgress` array using topic-order tie-break; pure computation |
| Lesson grouping by topic | Frontend | — | Filter + sort `lessons` array in render; no persistence |
| Navigation on tap | Frontend Router | — | `useNavigate` to `/lesson/${lesson.id}` — already wired in Phase 5 |
| Scroll containment | Browser / CSS | — | `overflow-y-auto` on inner div, outer stays `height: 100dvh` no-overflow |
| Touch target sizing | CSS | — | `min-h-[44px]`, `touch-action: manipulation` on every card |

---

## Current HomeScreen — What to Keep vs. Replace

### Keep (verified by reading `src/screens/HomeScreen.tsx`)

| Element | Keep? | Notes |
|---------|-------|-------|
| `sortedLessons` export | YES — keep exported | Existing tests import it directly; removing breaks the test file |
| `useLiveQuery(() => db.topicProgress.toArray())` | YES | Already present |
| `useEffect` writing `onboardingComplete` | YES | PLAT-04 persistence proof; don't disturb |
| Lock icon `<button>` (absolute top-right) | YES | D-03 — unchanged |
| `<RemyFox>` mascot | YES | D-01 |
| `<h1>Math Time!</h1>` | YES | D-01 |
| Loading guard `if (topicProgress === undefined) return <div .../>` | YES — extend | Must also guard on sessions undefined (D-11) |
| `Start Learning` `<button>` | REMOVE | Replaced by catalog JSX |
| `orderedLessons` / `useMemo` / `targetLesson` | REMOVE | Adaptive single-lesson logic replaced by catalog |

### Add

| Element | Purpose |
|---------|---------|
| `useLiveQuery(() => db.sessions.toArray())` | Completion detection (D-10) |
| `const completedIds = useMemo(...)` | `Set<string>` from sessions array |
| `const accuracyMap = useMemo(...)` | `Map<Topic, number>` from topicProgress |
| `const weakestTopic = useMemo(...)` | Topic key with lowest accuracy, or null |
| Catalog JSX (topic sections + lesson cards) | Replaces the single button |

---

## Lesson Data Shape (verified)

**Source: `src/curriculum/curriculum.json` — confirmed by running `node` against the file.**

- **Total lessons:** 27 [VERIFIED: codebase]
- **Topics:** `'addition' | 'subtraction' | 'word-problems'` — exactly 3 values, matching `Topic` union [VERIFIED: codebase]
- **Distribution:** 9 lessons per topic, 3 per grade (grades 1, 2, 3) [VERIFIED: codebase]
- **`order` field:** Values 1, 2, 3 — scoped per grade within a topic (e.g., all grade-1 addition lessons have orders 1/2/3, and grade-2 addition lessons also have orders 1/2/3)
- **Lesson ID format:** `addition-grade1-01` (human-readable slug)

**Sorting within a catalog section:** Sort by `grade` ascending first, then `order` ascending. Using only `order` would interleave grades incorrectly since `order` resets to 1 for each grade. [VERIFIED: codebase — observed that order=1 appears three times in the addition topic, once per grade]

```typescript
// Sort lessons within a topic section correctly
lessons
  .filter(l => l.topic === topic)
  .sort((a, b) => a.grade !== b.grade ? a.grade - b.grade : a.order - b.order)
```

---

## Completion Detection Pattern

**Source: `src/db/db.ts` — `Session` interface confirmed.**

The `Session` interface has: `id`, `lessonId` (string), `topic`, `grade`, `date`, `correctCount`, `totalCount`.

D-10 says to derive completion from `db.sessions.toArray()`. The pattern:

```typescript
const sessions = useLiveQuery(() => db.sessions.toArray())

const completedIds = useMemo(
  () => new Set(sessions?.map(s => s.lessonId) ?? []),
  [sessions]
)

// In render:
const isCompleted = completedIds.has(lesson.id)
```

- O(1) lookup per card after the Set is built — correct for 27 cards [VERIFIED: codebase data shape]
- `sessions` can be `undefined` while Dexie loads — the `?? []` guard handles this, but the loading shell guard runs before `useMemo` is used in JSX anyway

---

## Accuracy Dot Color Logic

**Source: `src/components/ProgressBar.tsx` — confirmed color thresholds.**

ProgressBar uses: `clamped >= 0.7 ? 'bg-success' : 'bg-accent'`

For the accuracy dot, apply the same threshold with an added gray/no-data state:

```typescript
// Derive from topicProgress
const accuracyMap = useMemo(
  () => new Map(topicProgress?.map(p => [p.topic, p.accuracy]) ?? []),
  [topicProgress]
)

// In LessonCard render:
function accuracyDotColor(topic: Topic, accuracyMap: Map<string, number>): string {
  if (!accuracyMap.has(topic)) return 'bg-on-surface/20'   // gray — no data
  const acc = accuracyMap.get(topic)!
  return acc >= 0.7 ? 'bg-success' : 'bg-accent'
}
```

All 9 lessons in a topic share the same dot color because D-05 is topic-level accuracy only. [VERIFIED: CONTEXT.md D-05]

---

## Weakest Topic Detection

**Source: CONTEXT.md D-08 and D-09 — tie-break order verified against ParentScreen TOPICS constant.**

ParentScreen defines `TOPICS` as `['addition', 'subtraction', 'word-problems']` in that order. Use the same canonical order for tie-breaking.

```typescript
const TOPIC_ORDER: Topic[] = ['addition', 'subtraction', 'word-problems']

const weakestTopic = useMemo((): Topic | null => {
  if (!topicProgress || topicProgress.length === 0) return null
  // Only topics with recorded data are candidates
  const progressMap = new Map(topicProgress.map(p => [p.topic, p.accuracy]))
  if (progressMap.size === 0) return null

  return TOPIC_ORDER.reduce<Topic | null>((weakest, topic) => {
    if (!progressMap.has(topic)) return weakest
    if (weakest === null) return topic
    const acc = progressMap.get(topic)!
    const weakestAcc = progressMap.get(weakest)!
    return acc < weakestAcc ? topic : weakest   // tie → keeps first (TOPIC_ORDER wins)
  }, null)
}, [topicProgress])
```

Key behaviors:
- Returns `null` when `topicProgress` is empty → no badge rendered (D-08)
- Topics not in `topicProgress` are skipped (not treated as accuracy=0 for weakest detection — they have no data, which is different from a score)
- Tie-break is implicit in `reduce` left-to-right iteration over `TOPIC_ORDER` combined with strict `<` (not `<=`) [VERIFIED: reasoning from D-09]

**Edge case — only one topic in DB:** If the child has only done addition lessons, `weakestTopic` will always be `'addition'` (it's the only candidate). This is correct — it is genuinely the only topic with data.

---

## Scroll Layout Architecture

**The core CSS change (iPad Safari critical path):**

Current HomeScreen outer div: `flex flex-col items-center justify-center height: 100dvh`

This centers the single button. The catalog content will exceed the screen height (27 cards + 3 headers). The fix is a two-div structure:

```tsx
{/* Outer: fixed height, no overflow, relative positioning for lock icon */}
<div
  className="relative flex flex-col bg-surface"
  style={{ height: '100dvh' }}
>
  {/* Lock icon — absolute positioned, unchanged */}
  <button className="absolute top-4 right-4 ...">...</button>

  {/* Header: fixed, does not scroll */}
  <div className="flex flex-col items-center pt-10 pb-4 px-6 gap-4 shrink-0">
    <RemyFox className="w-32 h-32" />
    <h1 className="text-4xl font-extrabold text-on-surface text-center">Math Time!</h1>
  </div>

  {/* Catalog: scrolls within remaining height */}
  <div
    className="flex-1 overflow-y-auto px-6 pb-6"
    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
  >
    {/* topic sections and lesson cards */}
  </div>
</div>
```

**Why this works on iPad Safari:**
- The outer div's `height: 100dvh` with no `overflow` property set means the browser clips the outer div but does not make it scroll.
- The inner div gets `overflow-y-auto` which enables momentum scrolling on iOS (Safari applies `-webkit-overflow-scrolling: touch` automatically in modern iOS).
- `safe-area-inset-bottom` goes on the inner scrollable div's padding so the last card is never hidden behind the home indicator bar. [ASSUMED — standard iOS safe area pattern; CLAUDE.md confirms `env(safe-area-inset-*)` is in stack]
- `shrink-0` on the header prevents flexbox from compressing the mascot/heading when content is tall.

**Do NOT add `overflow-y: hidden` to the outer div** — this would clip the scrollable inner div's scrollbar chrome on some browsers and prevents rubber-band bounce on iOS from reaching edges correctly.

---

## Architecture Patterns

### Recommended HomeScreen Structure After Refactor

```
HomeScreen.tsx
├── useLiveQuery (topicProgress)
├── useLiveQuery (sessions)        ← NEW
├── useMemo: completedIds Set      ← NEW
├── useMemo: accuracyMap           ← NEW
├── useMemo: weakestTopic          ← NEW
├── Loading guard (either undefined → shell)
├── Outer container (height: 100dvh, relative)
│   ├── Lock icon button (absolute)
│   ├── Header section (RemyFox + h1, shrink-0)
│   └── Inner scroll div (overflow-y-auto, flex-1)
│       └── TOPIC_ORDER.map(topic =>
│               <TopicSection>
│                   <SectionHeader topic weakestTopic />
│                   lessons.filter+sort.map(lesson =>
│                       <LessonCard lesson isCompleted accuracyColor />
│                   )
│               </TopicSection>
│           )
```

### TopicSection / LessonCard — Inline vs. Extracted

Given the scope is HomeScreen-only, these can be either:
- **Inline JSX fragments** within HomeScreen.tsx (simpler, less file surface)
- **Extracted sub-components** in `src/components/LessonCard.tsx` (testable in isolation)

Recommendation (Claude's discretion): Extract `LessonCard` as a pure presentational component (props: `lesson`, `isCompleted`, `dotColor`, `onClick`) — it enables isolated unit tests for the card visuals without needing Dexie. Keep `TopicSection` as an inline fragment since its logic is trivial.

### LessonCard Pattern

```tsx
interface LessonCardProps {
  lesson: Lesson
  isCompleted: boolean
  dotColor: string   // Tailwind bg-* class
  onClick: () => void
}

function LessonCard({ lesson, isCompleted, dotColor, onClick }: LessonCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-white rounded-2xl px-4 py-3 min-h-[56px] shadow-sm active:opacity-80"
      style={{ touchAction: 'manipulation' }}
      aria-label={`${lesson.title}${isCompleted ? ', completed' : ''}`}
    >
      {/* Completion ring */}
      <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
        isCompleted ? 'border-success bg-success' : 'border-on-surface/20'
      }`}>
        {isCompleted && (
          <svg ...checkmark... aria-hidden="true" />
        )}
      </span>

      {/* Title */}
      <span className="flex-1 text-left text-lg font-semibold text-on-surface">
        {lesson.title}
      </span>

      {/* Accuracy dot */}
      <span className={`w-3 h-3 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
    </button>
  )
}
```

**Touch target:** `min-h-[56px]` exceeds the 44px minimum. The `w-full` ensures the full card width is tappable, not just the text. [VERIFIED: CLAUDE.md D-12]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Live DB queries | Polling loop or manual state | `useLiveQuery` from `dexie-react-hooks` | Already in codebase; handles subscription and teardown |
| Completion Set | Linear scan per card during render | `useMemo(() => new Set(...))` | O(1) lookup; memoized against sessions reference |
| Topic color logic | Inline ternary scattered across cards | Single `accuracyDotColor(topic, map)` helper | Single source of truth; matches ProgressBar threshold |

---

## Testing Approach

### Existing Test Infrastructure (verified by reading test files)

| File | Framework | Pattern |
|------|-----------|---------|
| `src/test/setup.ts` | Vitest + jsdom | `fake-indexeddb/auto` — globally patches IndexedDB; no manual mock needed |
| `HomeScreen.test.tsx` | `@testing-library/react` | `renderWithRouter` via inline `MemoryRouter + Routes`; seeds Dexie directly with `db.topicProgress.put(...)` |
| `ParentScreen.test.tsx` | same | Same DB seeding pattern; uses `beforeEach(async () => db.topicProgress.clear())` |

**Key finding:** `useLiveQuery` is NOT mocked — it runs against the real `fake-indexeddb` IDB shim. This is the correct pattern; do not mock `useLiveQuery`.

### Tests to Preserve (currently in HomeScreen.test.tsx)

- `renders the Start Learning button` — MUST UPDATE: "Start Learning" button is removed; this test becomes obsolete. Replace with a catalog presence assertion.
- `Start Learning button meets 44px minimum touch target` — MUST UPDATE: repurpose for lesson cards.
- `renders Remy the Fox` — KEEP unchanged.
- `renders a lock icon button with aria-label "Parent access"` — KEEP unchanged.
- `lock icon button navigates to /pin` — KEEP unchanged.
- `adaptive lesson ordering` describe block — REMOVE (adaptive single-lesson logic is gone). The catalog does not reorder lessons.
- `array mutation guard` — UPDATE: `sortedLessons` is still exported; test still valid but context changes.

### New Tests Required

```typescript
describe('lesson catalog', () => {
  it('renders 3 topic section headers: Addition, Subtraction, Word Problems')
  it('renders all 27 lesson titles')
  it('tapping a lesson card navigates to /lesson/:lessonId')
  it('lesson cards meet 44px minimum touch target')

  describe('completion ring', () => {
    it('shows completion indicator when session exists for that lessonId')
    it('shows no completion indicator when no session for that lessonId')
  })

  describe('accuracy dot', () => {
    it('dot is gray when no topicProgress for that topic')
    it('dot is bg-success when topic accuracy >= 0.7')
    it('dot is bg-accent when topic accuracy < 0.7')
  })

  describe('"Needs practice" badge', () => {
    it('no badge shown when topicProgress is empty')
    it('badge appears on the weakest topic section header')
    it('badge does NOT appear on stronger topics')
    it('tie-break: addition gets badge when addition and subtraction have equal accuracy')
  })
})
```

### Seeding Pattern for Completion Tests

```typescript
beforeEach(async () => {
  await db.sessions.clear()
  await db.topicProgress.clear()
})

it('shows completion indicator for a completed lesson', async () => {
  await db.sessions.add({
    lessonId: 'addition-grade1-01',
    topic: 'addition',
    grade: 1,
    date: '2026-05-19' as ISODateString,
    correctCount: 3,
    totalCount: 3,
  })
  renderHomeScreen()
  // Find the card and assert aria-label contains "completed"
  expect(await screen.findByRole('button', { name: /Adding to 10.*completed/i })).toBeInTheDocument()
})
```

**Important:** `beforeEach` must clear both `db.sessions` AND `db.topicProgress` — current HomeScreen tests only clear `topicProgress`. The new tests add a `db.sessions.clear()`.

---

## Common Pitfalls

### Pitfall 1: `order` Field Resets Per Grade

**What goes wrong:** Sorting within a topic section by `order` alone produces interleaved grades (grade1-order1, grade2-order1, grade3-order1, grade1-order2...) because `order` is 1–3 within each grade, not globally unique within a topic.

**Why it happens:** The curriculum defines `order` as curriculum order within a `grade+topic` combination (confirmed by data inspection — addition has three lessons with order=1, one per grade).

**How to avoid:** Sort by `grade` first, then `order`:
```typescript
.filter(l => l.topic === topic)
.sort((a, b) => a.grade !== b.grade ? a.grade - b.grade : a.order - b.order)
```

**Warning signs:** Lessons appearing in wrong grade sequence in rendered catalog.

### Pitfall 2: Dual `useLiveQuery` Loading Guard

**What goes wrong:** Guarding on only `topicProgress === undefined` misses the case where `sessions` is still loading, causing `completedIds.has(...)` to operate on an empty `Set` (since `sessions ?? []` masks the undefined). The catalog renders with no completion rings, then flickers when sessions loads.

**Why it happens:** Each `useLiveQuery` independently returns `undefined` until its first result arrives.

**How to avoid:** Guard on both:
```typescript
if (topicProgress === undefined || sessions === undefined) {
  return <div style={{ height: '100dvh' }} />
}
```

**Warning signs:** Completion rings briefly absent on fast devices, or test assertions failing intermittently.

### Pitfall 3: Scroll Inside Fixed-Height Container on iPad

**What goes wrong:** Adding `overflow-y-auto` to the outer container (which has `height: 100dvh`) causes the entire page to scroll rather than just the catalog below the header. The lock icon scrolls off screen.

**Why it happens:** The outer container is the scroll root; the lock icon is `position: absolute` within it and scrolls with it.

**How to avoid:** Two-div structure: outer is `height: 100dvh` + `overflow: hidden` (implicit), inner below the header gets `overflow-y-auto flex-1`.

**Warning signs:** Lock icon disappears when scrolling catalog.

### Pitfall 4: Touch Target Width on Lesson Cards

**What goes wrong:** Using `inline-block` or `fit-content` width on lesson card buttons makes only the text tappable, not the full card row.

**Why it happens:** Button defaults are inline — they size to content.

**How to avoid:** `w-full` on each card `<button>` so the entire row is the touch target. [VERIFIED: CLAUDE.md min 44×44px rule]

### Pitfall 5: `sortedLessons` Tests Will Break if Export is Removed

**What goes wrong:** The `sortedLessons` function is tested via named import in `HomeScreen.test.tsx`. If removed from the module during the refactor, those tests fail.

**Why it happens:** The planner may see `sortedLessons` as unused in the new HomeScreen and flag it for deletion.

**How to avoid:** Retain the export. It is a pure utility function that is independently tested. If the catalog truly no longer needs it, move it to a `src/utils/` module rather than deleting it — or keep it in HomeScreen.tsx with a comment.

### Pitfall 6: `useMemo` Dependencies With `undefined` Dexie Queries

**What goes wrong:** If `sessions` is referenced in a `useMemo` that runs before the loading guard, and `sessions` is `undefined`, the code crashes or produces wrong state.

**Why it happens:** React hooks (including `useMemo`) always run — the loading guard `return` only affects JSX, not hook execution order.

**How to avoid:** All `useMemo` hooks that derive from Dexie queries must use the `?? []` / `?? new Map()` fallback, making them safe to compute even when the query is undefined. The loading guard prevents the computed values from being used in JSX prematurely.

---

## Code Examples

### Complete Derived State Block

```typescript
// Source: codebase analysis — verified against db.ts Session and TopicProgress shapes
const sessions     = useLiveQuery(() => db.sessions.toArray())
const topicProgress = useLiveQuery(() => db.topicProgress.toArray())

const completedIds = useMemo(
  () => new Set((sessions ?? []).map(s => s.lessonId)),
  [sessions]
)

const accuracyMap = useMemo(
  () => new Map((topicProgress ?? []).map(p => [p.topic, p.accuracy])),
  [topicProgress]
)

const TOPIC_ORDER: Topic[] = ['addition', 'subtraction', 'word-problems']

const weakestTopic = useMemo((): Topic | null => {
  if (!topicProgress || topicProgress.length === 0) return null
  const progressMap = new Map(topicProgress.map(p => [p.topic, p.accuracy]))
  return TOPIC_ORDER.reduce<Topic | null>((weakest, topic) => {
    if (!progressMap.has(topic)) return weakest
    if (weakest === null) return topic
    return progressMap.get(topic)! < progressMap.get(weakest)! ? topic : weakest
  }, null)
}, [topicProgress])

// Loading guard — must come after all hooks
if (sessions === undefined || topicProgress === undefined) {
  return <div style={{ height: '100dvh' }} className="bg-surface" />
}
```

### Catalog Section Render

```typescript
// Source: curriculum data shape verified — 27 lessons, 3 topics, sort by grade then order
const TOPIC_LABELS: Record<Topic, string> = {
  'addition': 'Addition',
  'subtraction': 'Subtraction',
  'word-problems': 'Word Problems',
}

// In JSX:
{TOPIC_ORDER.map(topic => {
  const topicLessons = lessons
    .filter(l => l.topic === topic)
    .sort((a, b) => a.grade !== b.grade ? a.grade - b.grade : a.order - b.order)
  const isWeakest = topic === weakestTopic
  const dotColor = !accuracyMap.has(topic)
    ? 'bg-on-surface/20'
    : accuracyMap.get(topic)! >= 0.7 ? 'bg-success' : 'bg-accent'

  return (
    <section key={topic} className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-2xl font-bold text-on-surface">{TOPIC_LABELS[topic]}</h2>
        {isWeakest && (
          <span className="text-sm font-semibold bg-accent/20 text-accent px-3 py-1 rounded-full">
            Needs practice
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {topicLessons.map(lesson => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            isCompleted={completedIds.has(lesson.id)}
            dotColor={dotColor}
            onClick={() => navigate(`/lesson/${lesson.id}`)}
          />
        ))}
      </div>
    </section>
  )
})}
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.6 + @testing-library/react |
| Config file | `vite.config.ts` — `test: { environment: 'jsdom', globals: true, setupFiles: './src/test/setup.ts' }` |
| Quick run command | `npx vitest run src/screens/HomeScreen.test.tsx` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command |
|--------|----------|-----------|-------------------|
| D-01 | Remy + "Math Time!" heading present | unit | `npx vitest run src/screens/HomeScreen.test.tsx` |
| D-02 | 3 topic sections rendered in order | unit | same |
| D-02 | Lessons in curriculum order within each section | unit | same |
| D-03 | Lock icon present and navigates to /pin | unit | same (existing test) |
| D-04 | Completion ring appears when session exists | unit | same |
| D-04 | Completion ring absent when no session | unit | same |
| D-04 | Accuracy dot color — green ≥ 0.7 | unit | same |
| D-04 | Accuracy dot color — blue < 0.7 | unit | same |
| D-04 | Accuracy dot color — gray if no data | unit | same |
| D-07 | Card touch targets ≥ 44px | unit | same |
| D-08 | "Needs practice" badge on weakest topic | unit | same |
| D-08 | No badge when no topicProgress data | unit | same |
| D-09 | Tie-break: earlier topic wins badge | unit | same |

### Wave 0 Gaps

- [ ] `src/screens/HomeScreen.test.tsx` — update existing file: remove "Start Learning" button tests, add catalog tests. Existing file exists; it needs edits not creation.
- [ ] `src/components/LessonCard.tsx` — if extracted, add `src/components/LessonCard.test.tsx` for pure prop-driven unit tests (no Dexie needed).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `safe-area-inset-bottom` on inner scroll div padding is sufficient to prevent last card from being hidden behind iPad home indicator | Scroll Layout Architecture | Card may be clipped; fix by adding extra padding or moving inset to outer div |
| A2 | iOS Safari applies momentum scrolling automatically to `overflow-y-auto` elements without `-webkit-overflow-scrolling: touch` (deprecated in modern iOS) | Scroll Layout Architecture | Scroll may feel sluggish; fix with explicit style if needed |
| A3 | `sortedLessons` function will be retained to avoid breaking existing test file import | What to Keep vs. Replace | If removed, 2 existing tests break |

---

## Open Questions

1. **Mascot size at top of catalog**
   - What we know: Currently `w-48 h-48` (192px) centered on full-screen layout
   - What's unclear: With catalog below, 192px fox may dominate too much vertical space, pushing the catalog far down — especially in landscape mode (768px tall)
   - Recommendation: Reduce to `w-32 h-32` (128px) and verify in both portrait and landscape orientations at planning/implementation time

2. **Grade labels within topic sections**
   - What we know: D-02 says lessons listed in curriculum order under each topic header; no grade sub-headers specified
   - What's unclear: With 9 lessons per topic, a single flat list may be visually long — grade sub-labels (Grade 1, Grade 2, Grade 3) could aid scannability
   - Recommendation: Claude's discretion — if implementing, add light grade dividers between grade groups using a `<p>` with reduced opacity; no new decisions required

---

## Sources

### Primary (HIGH confidence)
- `src/screens/HomeScreen.tsx` — direct read; all keep/remove decisions based on actual code
- `src/db/db.ts` — `Session` and `TopicProgress` interface shapes confirmed by direct read
- `src/curriculum/curriculum.json` — lesson count (27), topic distribution, `order` field semantics confirmed by running `node`
- `src/curriculum/types.ts` — `Topic` union, `Lesson` interface confirmed by direct read
- `src/components/ProgressBar.tsx` — color threshold (0.7, `bg-success`, `bg-accent`) confirmed by direct read
- `src/screens/ParentScreen.tsx` — `TOPICS` array order confirmed by direct read
- `src/screens/HomeScreen.test.tsx` — test patterns, existing test coverage confirmed by direct read
- `src/test/setup.ts` — `fake-indexeddb/auto` setup confirmed by direct read
- `vite.config.ts` — Vitest config (`environment: 'jsdom'`, `setupFiles`) confirmed by direct read
- `.planning/phases/07-lesson-catalog/07-CONTEXT.md` — all locked decisions

### Secondary (MEDIUM confidence)
- CLAUDE.md — touch target 44px rule, `touch-action: manipulation`, `env(safe-area-inset-*)`, Tailwind 4

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed in project; no new dependencies
- Architecture: HIGH — derived from direct codebase inspection, not assumptions
- Pitfalls: HIGH — `order` field pitfall verified against actual data; scroll pitfall is well-understood iOS pattern
- Test patterns: HIGH — verified by reading all existing test files

**Research date:** 2026-05-19
**Valid until:** 2026-07-01 (stable domain — no fast-moving dependencies)
