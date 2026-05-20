# Phase 4: Practice Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-15
**Phase:** 4-Practice Engine
**Areas discussed:** Session composition, Answer submission, Feedback presentation, Session-end flow

---

## Session Composition

| Option | Description | Selected |
|--------|-------------|----------|
| Lesson problems only | All problems where lessonId matches current lesson | ✓ |
| Topic problems | All problems across the whole topic | |
| Mixed — lesson first, topic fill | Lesson problems first, then topic pool fill | |

**User's choice:** Lesson problems only

---

| Option | Description | Selected |
|--------|-------------|----------|
| All lesson problems, shuffled | Use all problems (~5), shuffled at session start | ✓ |
| All lesson problems, sequential | Show in curriculum.json order | |
| Fixed count (5), shuffled | Cap at 5 even if lesson has more | |

**User's choice:** All lesson problems, shuffled

---

| Option | Description | Selected |
|--------|-------------|----------|
| No — advance and move on | After reveal, advance. No requeue. | ✓ |
| Yes — re-insert at the end | Append failed problem to end of queue | |

**User's choice:** No — advance and move on

---

## Answer Submission

| Option | Description | Selected |
|--------|-------------|----------|
| Tap → immediate submit | Tapping a choice immediately registers as the answer | ✓ |
| Tap → highlight, then confirm | First tap highlights, Check Answer button submits | |

**User's choice:** Tap → immediate submit

---

| Option | Description | Selected |
|--------|-------------|----------|
| Compose + Check button | Tap digits → display box → tap Check to submit | ✓ |
| Auto-submit on digit count match | App submits automatically when expected length reached | |

**User's choice:** Tap digits to compose, then tap Check

---

| Option | Description | Selected |
|--------|-------------|----------|
| Backspace button | Removes last digit entered | ✓ |
| Clear all button | Wipes entire entry | |
| No correction — Check = attempt 1 | Wrong digits count as attempt, see feedback and retry | |

**User's choice:** Backspace button

---

## Feedback Presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Inline below the problem | Warm phrase fades in under question, problem stays visible | ✓ |
| Brief toast overlay | Floating banner, fades out after ~2s | |
| Full-screen feedback moment | Screen briefly shows message, then returns to problem | |

**User's choice:** Inline below the problem

---

| Option | Description | Selected |
|--------|-------------|----------|
| Inline below problem, replacing encouragement | Same slot as encouragement text | ✓ |
| Above the answer choices, inline | Between question and choices | |
| Modal/overlay card | Centered card overlay, must be dismissed | |

**User's choice:** Inline below problem, replacing encouragement text

---

| Option | Description | Selected |
|--------|-------------|----------|
| Highlight green + auto-advance after ~1.5s | No extra tap from child | ✓ |
| Highlight green + child taps to advance | More deliberate, adds a tap after frustrating moment | |

**User's choice:** Highlight correct answer green, brief pause, auto-advance

---

## Session-End Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse ConfettiScreen with different button text | Pass buttonLabel="Back to Home" + navigate('/') callback | ✓ |
| New component — distinct celebration | Separate screen, can show summary stats or different animation | |

**User's choice:** Reuse ConfettiScreen with different button text

---

| Option | Description | Selected |
|--------|-------------|----------|
| Back to Home screen | Navigate to '/' | ✓ |
| Back to the lesson | Navigate to LessonScreen for same lesson | |
| You decide | Claude picks based on forward-only pattern | |

**User's choice:** Back to Home screen

---

| Option | Description | Selected |
|--------|-------------|----------|
| Add buttonLabel prop (backwards compatible) | buttonLabel?: string, default 'Start Practice' | ✓ |
| Change hard-coded text to generic | Change 'Start Practice' to 'Continue' everywhere | |

**User's choice:** Add buttonLabel prop (backwards compatible)

---

## Claude's Discretion

- State machine structure (useReducer shape, action types) — follow LessonScreen pattern
- Visual design of digit display box, grid layout, answer option cards
- Per-problem correct-answer animation (if any) — keep lightweight
- Encouragement phrase copy (warm rotating list)
- Hint content per problem (content, not architecture)

## Deferred Ideas

None — discussion stayed within phase scope
