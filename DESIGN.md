---
name: Math Tutor
description: A warm, focused math learning app for kids ages 6-9 on iPad.
colors:
  primary: "#FF6B35"
  secondary: "#FFD23F"
  accent: "#3B82F6"
  success: "#22C55E"
  surface: "#FFF8F0"
  on-surface: "#1C1917"
typography:
  display:
    fontFamily: "Nunito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Nunito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Nunito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Nunito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "Nunito, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.full}"
    padding: "20px 20px"
    size: "64px"
  button-action:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
    padding: "16px 40px"
    height: "56px"
  button-digit:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    size: "64px"
  button-digit-check:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    height: "64px"
  lesson-card:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  step-card:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: "32px"
  answer-choice:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    height: "64px"
---

# Design System: Math Tutor

## 1. Overview

**Creative North Star: "The Warm Classroom"**

Math Tutor inhabits the visual language of a space where a child feels safe to be wrong. Not a game, not an office tool, not a cartoon: something closer to a well-organized classroom on a sunny morning. The palette is warm without being garish. The type is round and friendly without being playful-for-playful's-sake. The interface clears the stage and lets the math be the main character.

Every screen answers one question at a time. Progress is shown in quiet dot rows, not percentage bars or gamified meters. Celebrations happen at the end of a flow, never partway through as a manipulation tactic. Wrong answers are met with a patient pause, never a red flash of shame. The system has a mascot (Remy the Fox) but does not perform him loudly: he appears at the top of screens, then steps aside.

This system explicitly rejects the aesthetic of sterile edu-SaaS (Google Classroom's cold whites and gray data tables), gamified chaos (Duolingo's XP bars, heart meters, streak flames), clipart overload (ABCmouse's visual noise), and dark-pattern engagement mechanics: no timers, no coins, no streaks, no manufactured urgency. If a parent looked over their child's shoulder and saw the screen, the interface should earn their trust immediately.

**Key Characteristics:**
- Single-focus screens: one task, the full viewport
- Warm cream ground (#FFF8F0), never clinical white, for all page backgrounds
- White card surfaces lift from the cream with a single subtle shadow
- 64px primary touch targets; 44px minimum for secondary controls
- Nunito at heavy weights: readable by a 6-year-old without condescension
- Celebration only at flow completion, never as a mid-flow engagement hook
- Elevation: nearly flat; one layer of card-on-cream is the maximum depth

## 2. Colors: The Classroom Palette

Five purposeful colors and two neutrals. Every color has a job; none are decorative.

### Primary
- **Fox Orange** (#FF6B35): The signature color of Math Tutor, tied to Remy the mascot. Marks the active progress dot, the primary next-step button (→), replay icon strokes, and the wrong-answer pulse animation. Its presence means "current position" or "next action." Used on at most 20% of any screen surface.

### Secondary
- **Dandelion** (#FFD23F): Warm yellow, used in confetti celebration pieces. Not used on interactive controls. Reserved for moments of joy at flow completion.

### Tertiary
- **Clear Sky** (#3B82F6): The action-confirm color. Appears on the Check answer button, the Done button in the parent dashboard, and the "Needs practice" badge background. Cooler than orange, it signals a different category of interaction: submit, confirm, complete.

### Semantic
- **Meadow** (#22C55E): Correct answer state, lesson completion rings, progress bar fill above 70% accuracy. A quiet affirmation.

### Neutral
- **Morning Cream** (#FFF8F0): Page background on every screen. Warm-tinted, never pure white. The settled ground that makes white card surfaces feel lifted.
- **Warm Ink** (#1C1917): Body text, headings, icon strokes. Near-black tinted warm. Never pure black.

### Named Rules
**The Fox Orange Rule.** Fox Orange (#FF6B35) marks the path forward and the current moment. It must not appear on static labels, decorative elements, or backgrounds. If it's orange, it means: "this is where you are" or "this is where you go next."

**The No Clinical White Rule.** Page backgrounds are always Morning Cream (#FFF8F0). Pure white (#fff, #ffffff) is reserved for card surfaces only, where it lifts from the cream. A clinical white background signals a spreadsheet; this is a classroom.

## 3. Typography

**Font:** Nunito (Google Fonts). Weights loaded: 400, 600, 700, 800 (regular and italic 400).

**Character:** Nunito's rounded terminals and generous x-height make it approachable without being condescending. Heavy weights (800) read as celebratory and confident. Medium weights (600) provide stable, readable body copy. Single typeface throughout: the simplicity of one family at multiple weights communicates calm consistency. No display/body split needed.

### Hierarchy
- **Display** (800, 2.25rem / 36px, line-height 1.1): Page-level headings ("Math Time!", "You did it!"). Appears at most once per screen, never used twice.
- **Headline** (700, 1.875rem / 30px, line-height 1.2): Lesson titles on the unlock screen. Prominent, never competing with Display.
- **Title** (700, 1.5rem / 24px, line-height 1.3): Topic section headers on the home screen; question text in practice. The working weight of the screen.
- **Body** (600, 1.125rem / 18px, line-height 1.5): Step narration text in lesson cards; parent dashboard labels. Generous line-height for easy reading. Constrained to ~60ch at iPad widths.
- **Label** (600, 1rem / 16px, line-height 1.4): Badge text ("Needs practice"), button labels on secondary controls, error messages in PIN flow.

### Named Rules
**The Weight Rule.** Weight contrast carries hierarchy; size is secondary. An 800-weight heading and a 600-weight label at similar sizes read as a clear hierarchy. Never add font-size jumps when weight contrast already does the work.

**The Single Family Rule.** Nunito only. No display typeface swap, no monospace for math equations. Unicode digits in Nunito at 800 weight are the math notation style.

## 4. Elevation

This system is intentionally flat. Depth comes from background color contrast: white cards (#FFFFFF) on Morning Cream (#FFF8F0) ground. A single ambient shadow (`box-shadow: 0 1px 3px rgba(0,0,0,0.08)`) appears on interactive card-shaped surfaces exclusively: lesson cards, digit keys, step cards, answer choice buttons. Its purpose is to signal "this is tappable," not to create visual drama.

Shadows never stack. Cards are never placed inside other cards. Shadows never animate (no hover lift on iPad touch interfaces).

**The One Layer Rule.** White card on cream background is the maximum depth of this system. Nested cards (white on white, card inside card) are prohibited. Elevation communicates tappability, never hierarchy or importance.

**The Static Shadow Rule.** Shadows do not animate on state changes. No lift on hover, no drop on press. Active state is communicated through opacity (0.8 on tap), not elevation change.

## 5. Components

### Buttons

Generous and rounded. Every button is pressable by a 6-year-old on an iPad without precision.

- **Primary (Next step → in lesson):** Fox Orange (#FF6B35) background, white text. Circular pill: `border-radius: 9999px`. Minimum 64×64px. Active state: `opacity: 0.8`. Used for the single primary forward action on a lesson screen.
- **CTA (Start Practice, Done, Back to Home):** Clear Sky (#3B82F6) background, white text. Rounded pill: `border-radius: 24px`. Minimum 56px height, minimum 200px width on full-page states. Active: `opacity: 0.8`.
- **Digit keys (number pad):** White background, Warm Ink text, Nunito 700 at 1.5rem. `border-radius: 12px`. Exactly 64×64px. `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`. Active: `opacity: 0.8`. Disabled: `opacity: 0.4`.
- **Check (submit answer):** Clear Sky (#3B82F6) background, white text, "Check" label at 1rem/600. Same `border-radius: 12px` as digit key, 64px height. Disabled when input is empty (`opacity: 0.4`).
- **Icon buttons (replay, parent lock):** No background. 44×44px minimum touch target. Replay stroke: Fox Orange (#FF6B35). Parent lock stroke: Warm Ink at 30% opacity at rest, 60% on active.

### Cards / Containers

- **Lesson cards (home screen):** White background, `border-radius: 16px`, `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`. Padding: 12px vertical, 16px horizontal. Full column width. Internal layout: completion ring (24px) + title text (flex-1, Nunito 600 1rem) + accuracy dot (12px). One lesson per card row; no nested elements.
- **Step cards (lesson screen):** White background, `border-radius: 16px`, `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`. Width: 80% viewport, max-width 512px, centered. Padding: 32px all sides. Contains narration text (body) + optional equation (display) + replay icon button (bottom-right).
- **Answer choices (multiple choice practice):** White background, `border-radius: 16px`, `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`. Minimum 64px height. 2-column grid. Font: Nunito 700 at 2.25rem. Correct-reveal state: `border: 2px solid #22C55E; background: rgba(34,197,94,0.1)`.

**The No Nested Cards Rule.** Cards never appear inside other cards. One card type per screen: either step cards, or answer choice cards, never both.

### Inputs / Fields

No traditional text inputs. All child-facing input is touch-based through the digit grid or multiple choice buttons. The digit display box acts as an input proxy: white background, minimum 64px height, minimum 120px width, `border-radius: 16px`, `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`. Current entry appears in Nunito 700 at 2.25rem. Empty state shows `_` in Warm Ink at 30% opacity. Correct-reveal state shows the answer in Meadow (#22C55E).

### Navigation

No persistent navigation. Screen-to-screen, no tabs, no menus. The only persistent nav element is the parent-access lock icon: positioned `absolute top-4 right-4`, 44×44px touch target, Warm Ink at 30% opacity at rest, 60% on tap. No label.

### Signature Component: Dot Progress Indicator

Appears at the top of lesson and practice screens. Active dot: Fox Orange (#FF6B35). Inactive dot: Fox Orange at 20% opacity. Lesson dots: 12px diameter. Practice dots: 8px diameter. Dots spaced at 8px gap. No labels, no fractions. The dot count is the only information shown.

### Signature Component: PIN Dot Display

4 circles in a row, 24px diameter each, 16px gap. Unfilled: transparent fill, Warm Ink/30 border at 2px. Filled: Fox Orange (#FF6B35) fill. CSS `transition: background-color 150ms, border-color 150ms`. No text overlay. The pattern communicates entry state without words.

## 6. Do's and Don'ts

### Do:
- **Do** use Fox Orange (#FF6B35) exclusively for "current position" and "next action" signals: active dots, primary forward buttons, functional icon strokes.
- **Do** keep primary touch targets at 64×64px (digit keys, answer choices) and secondary controls at 44×44px minimum (icon buttons).
- **Do** use Morning Cream (#FFF8F0) as the page background on every screen. Never use pure white as a page background.
- **Do** celebrate at flow completion only: the ConfettiScreen fires after a full lesson or practice session ends, never mid-flow.
- **Do** respect `prefers-reduced-motion` and disable confetti animation and transition animations when set.
- **Do** maintain WCAG AA contrast: 4.5:1 minimum for all text. Warm Ink (#1C1917) on Morning Cream (#FFF8F0) passes at ~15:1. Verify any new color pairings before shipping.
- **Do** use `aria-live="polite"` for digit entry feedback and `aria-live="assertive"` for answer-reveal announcements (a screen reader announces the correct answer to a child who might need it).
- **Do** use `touch-action: manipulation` and `user-select: none` on all interactive elements to suppress the 300ms tap delay and prevent accidental text selection.

### Don't:
- **Don't** add progress meters with percentages, XP bars, streak counters, heart/life meters, or level indicators. The only progress display is the quiet dot row. This is not Duolingo's game layer.
- **Don't** use timers, countdowns, or any time-pressure mechanic. No clock, no urgency. A child who is slow must never feel punished for slowness.
- **Don't** add coins, stars, badges, unlockable characters, or reward animations outside the end-of-flow celebration. Dark-pattern engagement mechanics are prohibited by design principle.
- **Don't** use clipart, heavy character illustrations, or cartoon-overloaded backgrounds. Remy the Fox is the one illustrated element, used at the top of screens as a calm presence, then stepping aside.
- **Don't** build data-dense parent dashboards. Topic-level accuracy bars only. No session logs, no date tables, no drill-down. Parents want signal ("is my kid struggling?"), not data.
- **Don't** use pure white (#fff / #ffffff) as a page background. Always Morning Cream (#FFF8F0).
- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on cards or list items. Prohibited. Rewrite with background tints or full borders.
- **Don't** apply gradient text (`background-clip: text` combined with a gradient background). Use a single solid color; emphasis through weight or size only.
- **Don't** nest cards. One card layer maximum per screen. No cards inside cards.
- **Don't** animate CSS layout properties (width, height, top, left, padding, margin). Animate `opacity` and `transform` only.
- **Don't** use bounce or elastic easing curves. Exponential ease-out only (`ease-out`, or `cubic-bezier(0.16, 1, 0.3, 1)` for snappier feel).
