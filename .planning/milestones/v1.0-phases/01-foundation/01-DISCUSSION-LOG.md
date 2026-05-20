# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-12
**Phase:** 1-Foundation
**Areas discussed:** App shell layout, Home screen content, IndexedDB schema depth, Design baseline

---

## App Shell Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Full-screen, no persistent chrome | Each screen owns 100% viewport. Contextual nav only. | ✓ |
| Bottom navigation bar | Persistent tab bar (Home/Lesson/Practice/Parent). Eats 60px vertical. | |
| Minimal header only | Thin header with back arrow. Middle ground. | |

**User's choice:** Full-screen, no persistent chrome

---

| Option | Description | Selected |
|--------|-------------|----------|
| No back button — forward-only flow | Lesson → Practice → Celebration → Home. No mid-flow escape. | ✓ |
| Small back arrow, top-left | Always available. Risk of accidental taps. | |
| Long-press or swipe gesture to exit | Hidden escape hatch. Requires discovery. | |

**User's choice:** Forward-only flow

---

| Option | Description | Selected |
|--------|-------------|----------|
| Small unobtrusive button on home screen only | Parent link tucked in corner of home. Not visible mid-lesson. | ✓ |
| Corner tap zone on any screen | Invisible tap target (e.g., 3-second hold). | |
| Separate URL route, not linked from child UI | Parent goes to /parent directly. | |

**User's choice:** Home screen only, unobtrusive button

---

## Home Screen Content

| Option | Description | Selected |
|--------|-------------|----------|
| Mascot + single 'Start Learning' button | One big tap target. Zero decisions for child. | ✓ |
| Topic picker: Addition / Subtraction / Word Problems | Kid chooses topic. Adds decision step. | |
| Grade picker first, then topic | One-time grade setup on first launch. | |

**User's choice:** Mascot + single 'Start Learning' button

---

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder 'Lesson coming soon' screen | Confirms routing, no mock data. | |
| Hardcoded sample lesson screen | Real visual with fake content. Design validation. | ✓ |
| Nothing — button disabled until content exists | Cleaner, harder to test routing. | |

**User's choice:** Hardcoded sample lesson screen

---

| Option | Description | Selected |
|--------|-------------|----------|
| You decide — pick something kid-friendly | Claude picks name and direction. | |
| I have something in mind — I'll describe it | User describes mascot. | ✓ |
| Leave it for later phases | Placeholder shape/emoji for now. | |

**User's choice:** User described: "A cute kid-like Fox named Remy the Fox"

---

## IndexedDB Schema Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Design full schema now, stub the data | All tables defined upfront. Avoids Dexie version migrations. | ✓ |
| Minimal stub — one test table only | Phases add tables as needed. Simpler now, migrations later. | |
| You decide based on what's least risky | Claude designs schema from roadmap requirements. | |

**User's choice:** Design full schema now

---

| Option | Description | Selected |
|--------|-------------|----------|
| Just what roadmap implies | sessions, topicProgress, appConfig. Covers all v1 requirements. | ✓ |
| Add lesson completion tracking too | lessonCompletions table — not in v1 requirements. | |
| You decide — design what fits v1 requirements exactly | Claude derives tables strictly from REQUIREMENTS.md. | |

**User's choice:** Just what roadmap implies (sessions, topicProgress, appConfig)

---

## Design Baseline

| Option | Description | Selected |
|--------|-------------|----------|
| Warm, vibrant primaries — classic kids app | Bright orange/yellow/blue. Duolingo-level vibrancy, warmer. | ✓ |
| Soft pastels — calm and gentle | Muted lavender, mint, peach. Easier on eyes. | |
| Bold + playful with Remy's fox colors | Anchor palette to mascot — warm orange, cream, brown/black. | |

**User's choice:** Warm, vibrant primaries

---

| Option | Description | Selected |
|--------|-------------|----------|
| Rounded, friendly sans-serif | Nunito/Fredoka/Poppins via Google Fonts. | ✓ |
| Bold display font for headings + clean body | Strong hierarchy. Text-heavy use case. | |
| System font stack only | Fastest load, generic look. | |

**User's choice:** Rounded, friendly sans-serif

---

| Option | Description | Selected |
|--------|-------------|----------|
| Nunito | Very legible, wide weights, popular in edtech. | ✓ |
| Fredoka | More playful/bubbly. Great for mascot apps. | |
| Poppins | Geometric, clean, modern. Less 'kiddy'. | |

**User's choice:** Nunito

---

## Claude's Discretion

- Tailwind color token values (exact hex for primary/secondary/accent) — warm vibrant primaries direction given
- Remy's Phase 1 visual — simple SVG placeholder acceptable; detailed animation is Phase 3+ work
- Route path naming

## Deferred Ideas

- Remy animation sequences (wave, celebrate, think) — Phase 3 Lottie work
- Grade picker / topic selector — not needed; app picks next lesson automatically
- `lessonCompletions` table — not in v1 requirements, defer to v2
