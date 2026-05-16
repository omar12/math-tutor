# Plan 04-02 Summary — Feedback Escalation & Session End

**Status:** Complete  
**Commit:** b8652c8  
**Date:** 2026-05-15

## What was built

Wired feedback escalation and session completion into the practice engine. Full practice loop now delivers warm feedback on wrong answers, hint escalation on repeat failures, auto-advance after 3 wrong answers, and a celebration screen at session end.

### Files changed

| File | Change |
|------|--------|
| `src/components/FeedbackSlot.tsx` | Created: reserved-height slot, encouragement (orange) vs hint (blue), mutually exclusive |
| `src/components/ConfettiScreen.tsx` | Added `buttonLabel?: string` prop; defaults to 'Start Practice' |
| `src/screens/PracticeScreen.tsx` | Wired FeedbackSlot, added `buttonLabel="Back to Home"` to celebration, added aria-live assertive reveal region |
| `src/screens/PracticeScreen.test.tsx` | FEED-01 through FEED-04 tests implemented (were .todo) |

## Requirements delivered

- **FEED-01**: After 2nd wrong answer, hint "Think about what number makes the equation balance." shown in blue
- **FEED-02**: After 3rd wrong answer + 1.5s reveal timer, auto-advance to next problem
- **FEED-03**: After 1st wrong answer, orange encouragement phrase shown (phraseIndex-based, deterministic)
- **FEED-04**: After last problem, ConfettiScreen with "Back to Home" button navigates to "/"

## Key decisions

- FeedbackSlot uses if/else (not ternary) to guarantee mutual exclusion of encouragement and hint text
- aria-live="assertive" region always present in DOM (never conditionally rendered) so screen reader registers it before first reveal fires
- ConfettiScreen `buttonLabel` defaults to `'Start Practice'` preserving LessonScreen compatibility (D-11 covered)
- phraseIndex=1 after first WRONG_ANSWER → deterministic phrase "Almost! You can do it." used in FEED-03 test

## Verification

- `npx vitest run` — 155 passed, 1 todo, 0 failed (full suite)
- LessonScreen.test.tsx regression: passes (Start Practice still default)
- All 4 FEED requirements verified by automated tests
