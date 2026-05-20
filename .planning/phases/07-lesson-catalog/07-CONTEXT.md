# Phase 7: Lesson Catalog — Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the single "Start Learning" button on HomeScreen with a scrollable lesson catalog. Kids can browse all lessons grouped by topic and tap any card to start that lesson. The adaptive algorithm moves from picking a single lesson to highlighting the weakest topic section with a badge.

No changes to the lesson player, practice engine, parent dashboard, PIN flow, or PWA config. HomeScreen only.

</domain>

<decisions>
## Implementation Decisions

### HomeScreen Layout
- **D-01:** HomeScreen replaces the single "Start Learning" button with a scrollable lesson catalog. Remy the Fox mascot + "Math Time!" heading remain at top; catalog scrolls below.
- **D-02:** Lessons organized into 3 topic sections: Addition / Subtraction / Word Problems. Section headers use the topic name. Lesson cards listed under each section header in curriculum order (`lesson.order` ascending). No adaptive reordering within sections.
- **D-03:** The `/pin` lock icon stays in the top-right corner — unchanged from Phase 5 D-01.

### Lesson Card
- **D-04:** Each lesson card shows: lesson title + completion ring (checkmark icon when `db.sessions` contains ≥1 record with that `lessonId`) + accuracy dot (color derived from topic `TopicProgress` — green ≥70%, blue <70%, gray if no TopicProgress data for that topic).
- **D-05:** Accuracy shown is **topic-level** (from `db.topicProgress`), not per-lesson. All lessons in the same topic share the same accuracy color. This matches the existing data model (no per-lesson accuracy aggregation).
- **D-06:** Tapping any lesson card navigates to `/lesson/${lesson.id}` — same parameterized route added in Phase 5 Plan 03.
- **D-07:** Lesson cards must meet 44×44px minimum touch target (CLAUDE.md standard) with `touch-action: manipulation`.

### Adaptive Highlight
- **D-08:** The topic section with the lowest `accuracy` in `db.topicProgress` gets a **"Needs practice"** badge on its section header. Only one topic is highlighted at a time (the weakest). If no `TopicProgress` data exists (no sessions), no badge is shown.
- **D-09:** Tie-break for weakest topic (equal accuracy): use topic array order (addition → subtraction → word-problems), first one wins.

### Data Sources
- **D-10:** Two `useLiveQuery` hooks — same as current HomeScreen: `db.sessions.toArray()` (completion detection per lessonId) and `db.topicProgress.toArray()` (accuracy per topic + weakest-topic detection). No new DB tables or fields needed.
- **D-11:** Loading state: while either Dexie query is `undefined`, render minimal loading shell (same pattern as current HomeScreen: empty div with correct height).

### Claude's Discretion
- Section header visual style (font size, weight, color, spacing from card above)
- Lesson card visual design (rounded corners, padding, shadow, tap feedback)
- Completion ring icon (checkmark circle SVG or Tailwind class)
- Accuracy dot size and position on card (right-aligned, alongside title, etc.)
- "Needs practice" badge design (pill, text size, accent color)
- Scroll behavior (standard overflow-y-auto, no momentum tweaks needed)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Code to Modify
- `src/screens/HomeScreen.tsx` — file to modify; keep `sortedLessons`, lock icon, and both `useLiveQuery` hooks; replace the single button with catalog JSX
- `src/screens/HomeScreen.test.tsx` — existing tests to preserve + new catalog tests to add

### Phase 5 Decisions (carried forward)
- `.planning/phases/05-progress-parent/05-CONTEXT.md` — D-01 (lock icon top-right), D-14/D-15 (adaptive by topic accuracy), D-LC-01 through D-LC-07 (lesson catalog decisions from gap closure section)

### Phase 1 Decisions
- `.planning/phases/01-foundation/01-CONTEXT.md` — D-01 (full-screen), D-10/D-11 (warm palette, Nunito font), D-12 (44px touch targets)

### Project Constraints
- `CLAUDE.md` — touch-action: manipulation, min 44×44px targets, Tailwind 4, iPad Safari
- `.planning/PROJECT.md` — core value, audience (kids 6–9, iPad web)

### Data Model
- `src/db/db.ts` — `Session` interface (lessonId, topic, grade, correctCount, totalCount), `TopicProgress` interface (topic, accuracy, attemptCount, lastPracticed)
- `src/curriculum/index.ts` — `lessons` array (27 lessons across 3 topics and 3 grades)
- `src/curriculum/types.ts` — `Lesson` type, `Topic` union

### Routing
- `src/App.tsx` — `/lesson/:lessonId` route already registered (Phase 5 Plan 03)

</canonical_refs>

<code_context>
## Existing Code Insights

### Current HomeScreen Structure
- Full-screen div with `height: 100dvh` + `paddingBottom: env(safe-area-inset-bottom)`
- `useLiveQuery(() => db.topicProgress.toArray())` — already present
- `useLiveQuery(() => db.sessions.toArray())` — needs to be added (currently only topicProgress)
- `sortedLessons()` pure function — still useful for computing weakest-topic detection
- Lock icon button — keep as-is, absolute positioned top-right

### Reusable Patterns
- ProgressBar color logic: `accuracy >= 0.7 → bg-success (green)`, below → `bg-accent (blue)` — same logic for accuracy dot
- `touch-action: manipulation` + `min-h-[44px]` — on every interactive element
- `useLiveQuery` loading guard: `if (query === undefined) return <loading shell />`

### Topics Array (from Phase 5 ParentScreen)
- `['addition', 'subtraction', 'word-problems']` as `Topic[]`
- Same order for catalog sections

</code_context>

<deferred>
## Deferred Ideas

- Per-lesson accuracy tracking (requires new DB aggregate) — current data model is topic-level only
- Grade-level tabs or filters — V2 scope
- Lesson completion percentage within a topic (e.g., "3/9 done") — V2 scope
- Animated completion rings — keep static for v1

</deferred>
