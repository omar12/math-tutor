# Plan 04-01 Summary — Practice Engine: State Machine & Widgets

**Status:** Complete  
**Commit:** e8adb66  
**Date:** 2026-05-15

## What was built

Replaced the PracticeScreen stub with a fully working practice engine foundation.

### Files changed

| File | Change |
|------|--------|
| `src/App.tsx` | Route changed from `/practice` to `/practice/:lessonId` |
| `src/screens/LessonScreen.tsx` | Navigate call updated to pass `lesson.id` |
| `src/App.test.tsx` | PracticeScreen routing test updated for new route + aria assertion |
| `src/screens/PracticeScreen.tsx` | Full rewrite: useReducer state machine, lessonId filtering, widget routing |
| `src/screens/PracticeScreen.test.tsx` | Created: renderWithRoute helper, PRAC-01/02 tests, input-lock, digit-cap |
| `src/components/MultipleChoiceWidget.tsx` | Created: 2x2 grid, phase guard, aria roles |
| `src/components/DigitGridWidget.tsx` | Created: display box (no input), 3x4 key grid, aria, phase guards |
| `src/index.css` | Added `wrong-pulse` and `correct-flash` keyframes |

## Requirements delivered

- **PRAC-01**: Multiple-choice widget — 4 shuffled cards, tap to submit, phase guard
- **PRAC-02**: Digit-grid widget — display box, no input element, digit cap at 3, backspace, Check disabled when empty
- **PRAC-03**: Route wiring — `/practice/:lessonId`, LessonScreen passes lessonId

## Key decisions

- `addition-grade3-01` used as test lessonId for digit-grid (grade-3 lessons start with DG problems; grade-2 lessons are MC-first)
- CORRECT_ANSWER action sets `phase: 'revealing'` so input lock activates immediately; 200ms correctAnswerTimerRef then dispatches ADVANCE
- Both CORRECT_ANSWER (200ms) and BEGIN_REVEAL (1500ms) share the `revealing` phase; the 200ms timer fires first and clears the phase, triggering the reveal useEffect cleanup
- FeedbackSlot placeholder `<div aria-hidden="true" />` left for Plan 02

## Verification

- `npx vitest run` — 151 passed, 5 todo, 0 failed (full suite)
- No `<input>` elements in DigitGridWidget (grep confirmed)
- Phase guard `if (state.phase !== 'answering') return` in all handlers and widget onClick callbacks
