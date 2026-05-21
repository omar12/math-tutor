# Product

## Register

product

## Users

**Primary:** Kids ages 6-9 (grades 1-3) using an iPad, usually alone or with a parent nearby. Low reading ability, no concept of accounts or saving. Attention span is short; frustration arrives fast. Touch is their only input modality.

**Secondary:** Parents checking in on their child's progress. They arrive on the parent dashboard with 2-3 minutes of attention, looking for signal ("is my kid struggling?"), not data density.

## Product Purpose

A focused math learning app for young kids that teaches through narrated lessons and reinforces through practice problems. A kid sits down, does a lesson, practices, and the parent can see exactly what their child understands and what they don't, without any accounts or setup friction. Local-first, iPad-native, no backend.

## Brand Personality

Warm, playful, encouraging.

The app is like a patient human tutor who celebrates every correct answer and never makes a kid feel dumb for a wrong one. It has personality (Remy the Fox mascot) but doesn't perform it loudly. Confidence through calm, not through noise.

## Anti-references

- **Google Classroom / sterile edu-SaaS**: Too cold and institutional. This is for a 6-year-old, not a filing system.
- **Duolingo streaks, XP bars, lives, leaderboards**: The game layer distracts from learning and creates anxiety. Lessons and practice only.
- **ABCmouse / clipart-heavy kids apps**: Visually overwhelming, dated aesthetic. Cartoon overload signals low quality to both kids and parents.
- **Dark-pattern engagement traps**: No timers, no coins, no streaks, no ads. Nothing that manipulates a child's behavior through manufactured urgency.

## References

- **Duolingo lesson flow (no game layer)**: Clear step-by-step progression, celebratory feedback at completion, focused single-task screens.
- **Khan Academy Kids**: Age-appropriate warmth, readable type, breathing room. Not a cartoon explosion, but not sterile either.

## Design Principles

1. **Calm beats stimulating.** One thing on screen at a time. No timers, no countdowns, no blinking distractions. The math problem is the hero.
2. **Celebrate every win, absorb every miss.** Correct answers get a moment of joy. Wrong answers get a quiet second chance, never shame.
3. **Built for small hands.** Every tap target is generous. No precision required. No hover states. No swipes that could go wrong.
4. **Parents trust what they can read.** The parent dashboard is clear, plain, and honest. No gamified metrics. No vanity numbers. Just accuracy.
5. **Nothing dark-pattern.** Every design decision asks: "Would a parent approve of this?" If a pattern could be described as addictive or manipulative, it's out.

## Accessibility & Inclusion

WCAG AA. Priority concerns for this audience:
- Color contrast ratios 4.5:1 minimum for all text (kids with early vision needs)
- Touch targets minimum 44x44px (Apple Human Interface Guidelines)
- Screen reader support for practice widgets (aria-live regions for answer reveals)
- `prefers-reduced-motion` respected for all animations (some kids are sensitive)
- No time pressure mechanics that disadvantage kids with processing differences
