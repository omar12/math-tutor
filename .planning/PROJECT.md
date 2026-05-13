# Math Tutor — Kids Edition

## What This Is

An iPad-optimized web app that teaches math to kids in grades 1–3. Kids work through animated, narrated lessons followed by practice problems. The app tracks each child's progress and surfaces where they struggle so parents can see what needs more attention.

## Core Value

A kid sits down, does a lesson, practices, and the parent can see exactly what their child understands and what they don't — without any accounts or setup friction.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] App runs in-browser, fully optimized for iPad screen sizes
- [ ] Covers grades 1–3 math content (scoped to addition, subtraction, word problems)
- [ ] Animated, narrated guided lessons explain each concept
- [ ] Practice problems follow each lesson with immediate feedback
- [ ] App adapts repetition toward topics where the kid makes errors
- [ ] Single profile per device — no login required for the child
- [ ] Parent section accessible on the same device (PIN-protected)
- [ ] Parent overview shows summary stats + drill-down by topic
- [ ] Parent view highlights which concepts the child struggles with most
- [ ] Progress persists locally across sessions on the device

### Out of Scope

- Multi-child accounts / parent login — single device profile is enough for v1
- Multiplication, division, fractions, geometry — deferred to future grades
- Teacher dashboard / classroom mode — parent-only in v1
- Weekly email reports — parent section on-device covers the need
- Native iOS/Android app — web app targets iPad browser

## Context

- Target device: iPad (Safari browser, touch-first interaction)
- No backend auth needed in v1 — progress stored locally (localStorage or IndexedDB)
- Animation + narration require asset strategy (SVG/CSS animation or Lottie; TTS or recorded audio)
- Content curriculum should align with Common Core standards for grades 1–3
- Kids aged 6–9 — UI must be large touch targets, simple language, encouraging tone

## Constraints

- **Platform**: iPad web browser (Safari) — touch-first, no mouse assumptions
- **Auth**: None for child; PIN for parent section — no backend accounts in v1
- **Storage**: Local device storage — no server-side data persistence in v1
- **Content scope**: Addition, subtraction, word problems (grades 1–3 only)
- **Audience**: Kids 6–9 — UI must be accessible, joyful, low-frustration

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web app (not native) | Faster to build, no App Store friction, still iPad-compatible | — Pending |
| Single device profile | Eliminates auth complexity, targets single-family iPad use | — Pending |
| Local storage only | No backend = simpler v1, parent data stays on device | — Pending |
| Animated + narrated lessons | Kids 6–9 engage better with animation and voice than text | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-12 after initialization*
