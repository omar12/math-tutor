# Phase 4: Practice Engine - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the PracticeScreen stub with a fully working practice engine. Given a lesson, the child sees all of that lesson's problems (shuffled), answers via large touch targets (multiple-choice or digit grid), receives warm escalating feedback on wrong answers, and finishes with a celebration screen that sends them back to Home. No progress recording — that is Phase 5 scope.

Requirements in scope: PRAC-01, PRAC-02, PRAC-03, FEED-01, FEED-02, FEED-03, FEED-04

</domain>

<decisions>
## Implementation Decisions

### Session Composition
- **D-01:** Problem pool is lesson-specific — all problems where `problem.lessonId === lesson.id`. No cross-lesson or cross-topic mixing in Phase 4.
- **D-02:** Show all lesson problems (curriculum has ~5 per lesson), shuffled at session start. No fixed cap.
- **D-03:** After 3 wrong attempts on a problem (correct answer revealed), advance to the next problem. The failed problem is NOT re-inserted at the end of the queue.

### Multiple-Choice Submission
- **D-04:** Tapping a choice immediately registers as the answer — no select-then-confirm step. The choice tap IS the submission.

### Digit Grid Submission
- **D-05:** Child taps digits (0–9) to compose an answer shown in a display box above the grid. Taps a **Check** button to submit. The display box shows the current composed digits before submission.
- **D-06:** A **backspace** button on the digit grid removes the last entered digit. No clear-all needed.

### Feedback Presentation
- **D-07:** Wrong answer encouragement (FEED-03): warm phrase (e.g. "Nice try! Give it another go.") appears **inline below the problem question**. Problem stays visible. Phrases rotate and maintain a warm, non-punishing tone.
- **D-08:** Hint after 2nd wrong attempt (FEED-01): hint replaces the encouragement text in the same inline slot below the problem. No layout shift, no overlay — consistent placement throughout the attempt cycle.
- **D-09:** After 3rd wrong attempt (FEED-02): the correct answer is highlighted green (multiple-choice: correct option; digit-grid: correct number appears in the display box). After ~1.5s pause, app auto-advances to the next problem. No extra tap required from the child.

### Session-End Celebration
- **D-10:** Reuse existing `ConfettiScreen` component (currently used for lesson-end). Pass `buttonLabel="Back to Home"` and a callback that navigates to `'/'`.
- **D-11:** `ConfettiScreen` gains a `buttonLabel?: string` prop (default `'Start Practice'` — backwards compatible with Phase 3 usage). Phase 4 passes `'Back to Home'`.
- **D-12:** After tapping the button on the celebration screen, the child navigates to `'/'` (Home). Consistent with forward-only navigation; Home is the hub Phase 5 will expand.

### Claude's Discretion
- State machine structure (useReducer shape, action types) — follow the LessonScreen pattern from Phase 3
- Visual design of digit display box, grid layout, answer option cards
- Confetti/animation choice for correct-answer feedback (if any) per problem — keep lightweight, no Lottie for per-problem moments
- Encouragement phrase copy (list of warm rotating phrases) — maintain Remy the Fox's warm, encouraging tone
- Hint content per problem — can be left as a placeholder or Claude can author representative hints; exact hint text is content, not architecture

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — PRAC-01 (multiple choice, 4 large targets), PRAC-02 (digit grid, no keyboard), PRAC-03 (practice follows lesson), FEED-01 (hint after 2 wrong), FEED-02 (reveal after 3 wrong, advance), FEED-03 (warm encouragement rotation), FEED-04 (session-end celebration)
- `.planning/ROADMAP.md` — Phase 4 goal and success criteria; Phase 5 goal (progress recording — NOT Phase 4 scope)

### Project Constraints
- `.planning/PROJECT.md` — Core constraints (iPad Safari, touch-first, kids 6–9, no keyboard input)
- `CLAUDE.md` — 44px minimum touch targets; `touch-action: manipulation`; Tailwind 4 + Vite 6; `100dvh` on screen containers

### Phase 1 Decisions
- `.planning/phases/01-foundation/01-CONTEXT.md` — D-01 (full-screen no chrome), D-02 (forward-only navigation), D-10/D-11 (warm color palette, Nunito font), D-12 (44px touch targets)

### Phase 2 Decisions
- `.planning/phases/02-curriculum-content/02-CONTEXT.md` — D-07 (discriminated union `type: 'multiple-choice' | 'digit-grid'`), D-08 (`answer: number`, `choices: number[]` unordered — Phase 4 shuffles), D-09 (problem carries `grade`, `topic`, `lessonId`)

### Phase 3 Decisions
- `.planning/phases/03-lesson-player/03-CONTEXT.md` — D-08/D-09/D-10 (lesson-end ConfettiScreen already implemented; Phase 4 reuses it with `buttonLabel` prop); D-07 (one-step-fills-screen pattern — apply same principle to one-problem-fills-screen)

### Existing Code
- `src/screens/PracticeScreen.tsx` — stub to replace
- `src/components/ConfettiScreen.tsx` — reuse; add `buttonLabel?: string` prop (backwards compatible)
- `src/curriculum/types.ts` — `Problem`, `MultipleChoiceProblem`, `DigitGridProblem` discriminated union
- `src/curriculum/index.ts` — `problems` export (filter by `lessonId`)
- `src/screens/LessonScreen.tsx` — useReducer state machine pattern to follow

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ConfettiScreen.tsx` — session-end celebration (D-10, D-11). Add `buttonLabel?: string` prop; default `'Start Practice'` keeps Phase 3 working unchanged.
- `src/curriculum/index.ts` — exports `problems` array; filter with `problems.filter(p => p.lessonId === lessonId)` to get session pool (D-01).
- `src/curriculum/types.ts` — `Problem` discriminated union; switch on `problem.type` to render the right input widget.

### Established Patterns
- Full-screen div: `style={{ height: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}` — all screens use this; PracticeScreen must too.
- Touch button: `style={{ touchAction: 'manipulation' }}` + `min-h-[44px] min-w-[44px]` — every interactive element (answer options, digit keys, Check, backspace).
- State machine: `useReducer` with a typed `Action` union and a pure reducer — follow `LessonScreen.tsx` exactly.
- Warm palette + Nunito font from Phase 1 — no new colors or fonts in Phase 4.

### Integration Points
- `src/curriculum/index.ts` → `problems` filtered by `lessonId` is the session problem pool.
- `src/components/ConfettiScreen.tsx` → rendered when last problem is complete (with `buttonLabel='Back to Home'` and `onStartPractice={() => navigate('/')}`).
- No Dexie writes in Phase 4 — session results are NOT persisted yet (Phase 5 scope).

</code_context>

<specifics>
## Specific Ideas

- The attempt counter resets per problem (not per session) — 3 wrong attempts triggers reveal for that specific problem, then the counter resets for the next problem.
- For the digit-grid display box: show entered digits as they're tapped (e.g. "1", then "12" after a second tap). Empty state shows a placeholder like "?" or a blank underline.
- Grade 1 problems are all multiple-choice (from STATE.md decision); Grade 2/3 mix both types. The same PracticeScreen component handles both via the type discriminant.
- `choices` in the curriculum is unordered — Phase 4 shuffles them at render time (D-08 from Phase 2 CONTEXT.md). Shuffle once per problem render, not on every re-render.
- No audio narration of feedback phrases in Phase 4 — audio architecture is Phase 3 (lesson), not extended here unless the requirement explicitly calls for it (it does not).

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 4-Practice Engine*
*Context gathered: 2026-05-15*
