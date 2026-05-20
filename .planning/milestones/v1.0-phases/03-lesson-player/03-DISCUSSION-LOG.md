# Phase 3: Lesson Player - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-14
**Phase:** 3-Lesson Player
**Areas discussed:** Audio unlock screen, Step advancement, Lesson end handoff

---

## Audio unlock screen

| Option | Description | Selected |
|--------|-------------|----------|
| Full-screen tap zone | Entire screen is tappable. No specific button to find. 'Tap anywhere to start' instruction. | ✓ |
| Remy + big button | Remy the Fox on screen with a large 'Tap to Start' button. | |
| First lesson step itself | No separate unlock screen — lesson loads directly; first tap unlocks audio. | |

**User's choice:** Full-screen tap zone

---

| Option | Description | Selected |
|--------|-------------|----------|
| Instant — first step loads immediately | No transition. Tap unlocks audio AND loads Step 1 in the same action. | ✓ |
| Brief visual confirmation, then first step | Quick 'Ready!' flash (0.5–1s) confirms audio is active, then first step appears. | |
| You decide | Claude picks the transition. | |

**User's choice:** Instant — first step loads immediately

---

| Option | Description | Selected |
|--------|-------------|----------|
| Remy + lesson title + 'Tap anywhere to start' | Mascot, lesson name, and a clear instruction. | ✓ |
| Just the lesson title + 'Tap to start' | Cleaner, less visual noise. | |
| You decide | Claude picks what's shown. | |

**User's choice:** Remy + lesson title + 'Tap anywhere to start'

---

## Step advancement

| Option | Description | Selected |
|--------|-------------|----------|
| Kid taps to advance | Audio finishes, visual cue appears, kid taps when ready. | ✓ |
| Auto-advance after short pause | 1–2 seconds after audio ends, next step appears automatically. | |
| You decide | Claude picks based on LESS-03 model. | |

**User's choice:** Kid taps to advance

---

| Option | Description | Selected |
|--------|-------------|----------|
| Tap the current step card to replay | One-finger tap on the step replays audio. | |
| Dedicated replay icon on the step card | Small circular replay button on each step. | ✓ |
| Tap any previously-seen step in history | All completed steps shown below current; tap any to replay. | |

**User's choice:** Dedicated replay icon on the step card

---

| Option | Description | Selected |
|--------|-------------|----------|
| Show step text + equation silently | Step displays normally, no error shown. | ✓ |
| Show step text + subtle 'audio unavailable' indicator | Small icon signals audio didn't load. | |
| You decide | Claude handles graceful degradation. | |

**User's choice:** Show step text + equation silently, no audio indicator

---

## Lesson end handoff

| Option | Description | Selected |
|--------|-------------|----------|
| Brief 'Great job!' moment, then practice | Celebration screen (Remy cheering, 'You did it!'). | |
| Straight to practice problems | No celebration at lesson end; celebration happens after practice (FEED-04 scope). | |
| You decide | Claude picks based on child engagement tone. | |

**User's choice:** Brief 'Great job!' moment, then practice (confetti/stars variant)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-advance after ~1.5 seconds | Celebration plays, then practice loads automatically. | |
| Kid taps to continue to practice | Child taps button to start practice. | ✓ |

**User's choice:** Kid taps to continue to practice

---

| Option | Description | Selected |
|--------|-------------|----------|
| Remy celebrating + 'Great job!' + 'Start Practice' button | Mascot with happy pose, encouraging text, large CTA. | |
| Confetti/stars animation + 'Start Practice' button | Visual reward without mascot. | ✓ |
| You decide | Claude picks celebration style. | |

**User's choice:** Confetti/stars animation + 'Start Practice' button

---

## Claude's Discretion

- Step card visual design (card styling, animation for step transitions, "Next" indicator appearance)
- Step layout: one step fills screen at a time, full-screen per-step (derived from Phase 1 forward-only pattern)
- Confetti/stars implementation (CSS animation vs. lightweight library — keep lightweight)
- Progress indicator within worked example (dot indicators N of M)
- Exact replay icon appearance (circular arrow, speaker icon)

## Deferred Ideas

None — discussion stayed within phase scope.
