# Feature Landscape

**Domain:** Kids math tutor web app, grades 1–3 (addition, subtraction, word problems)
**Researched:** 2026-05-12
**Confidence note:** Web search and WebFetch were unavailable. All findings draw from training knowledge (cutoff August 2025) of the established kids edtech landscape: Khan Academy Kids, Prodigy Math, Splash Math, IXL, DoodleMath, ST Math, Reflex Math, and related research on child-centered UX. Confidence levels reflect this.

---

## Table Stakes

Features users (parents + kids) expect. Missing = product feels broken or gets uninstalled.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Narrated audio on all instructions | Kids 6–9 are emerging/non-readers; reading text unaided breaks flow | High | Every prompt, lesson step, and feedback must be speakable. Tap-to-replay button required. |
| Large touch targets (min 44×44pt, ideally 64pt+) | iPad touch with small fingers; misses cause frustration and distrust | Low | Apple HIG minimum is 44pt; kids need larger. All interactive elements must be generously sized. |
| Immediate feedback on every answer | Kids this age cannot hold attention through delayed responses; silence reads as broken | Low | Visual + audio response within ~200ms of tap. Never make a child wait. |
| Correct-answer celebration animation | Industry standard; absence makes the app feel cold | Medium | Must be short (1–2 sec) — long celebrations become noise that kids skip through. |
| Wrong-answer guidance (not punishment) | Frustration at failure is the #1 abandonment trigger in ages 6–9 | Medium | Show what's correct after 2 wrong attempts; encourage tone always ("Almost! Let's try again"). |
| Structured lesson → practice flow | Every top app (Khan, Splash, IXL) uses this arc; skipping it confuses kids | High | Animated lesson introduces concept → practice problems follow. No cold-start practice. |
| Progress persistence across sessions | Without this, kids lose their place; parents lose trust; feels like a toy not a tool | Medium | localStorage/IndexedDB; survives Safari reload and next day's visit. |
| Multiple choice as default practice input | Works on touch without a keyboard; eliminates typing barrier for grade 1–2 | Low | 3–4 answer options with large tap areas. |
| Visual number representations | Concrete-to-abstract learning principle; blocks, fingers, number lines are expected for G1–2 | Medium | ST Math built a whole product on this. Absence makes abstract problems too hard for G1. |
| Parent-accessible progress view | Parents are the purchaser; if they can't evaluate outcomes they churn | Medium | High-level summary: lessons done, accuracy rate, weak topics. PIN gate keeps kids out. |
| In-app topic/unit curriculum map | Kids and parents need to know "where am I?" and "what's next?" | Medium | Visual path or grid showing completed vs upcoming units. |
| Works offline after first load | iPads in use away from Wi-Fi; if it stops working, trust breaks | Medium | Service worker + cached assets. Local storage already handles data. |

---

## Differentiators

Features that set this product apart from Khan Academy Kids, Prodigy, and Splash Math. Not assumed by users but create real preference.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Error-adaptive repetition (spaced repetition toward weak topics) | Most consumer apps treat all content equally; this app resurfaces what the kid got wrong | High | Track per-topic accuracy; weight problem selection toward sub-60% topics. Does not require a backend — can be done in local state. |
| Parent "struggle spotlight" view | Parents can't sit with the child for every session; a curated "what needs attention" surface is far more actionable than raw stats | Medium | Compute a ranked list of concepts by error rate. Simple calc, high parent value. |
| No-friction child entry (no login, no onboarding quiz) | Khan Academy Kids requires account creation; Prodigy requires school grade setup; zero-friction start is a genuine differentiator | Low | Single device profile auto-created on first launch. Kid taps "Play" and is in. |
| Narrated word problem scenarios with scene animation | Word problems are the hardest content for G1–3; bringing them to life with a short animated scene (e.g., animated birds in a tree) dramatically reduces comprehension barrier | High | Requires per-problem animation assets. High value but high production cost. Consider a reduced scope: narrated text + static illustration first. |
| Tap-to-hear any word on demand | Kids encounter words they can't read; a tap-anywhere-to-read feature removes silent failure | Medium | Attach TTS/audio to all text labels, not just primary narration. |
| Session length guidance for parents | Parents don't know how long is enough; a "recommended 10 min/day" in-app indicator builds habit without overdoing screen time | Low | Simple UI addition; high trust-building value for parents. |
| Concept mastery indicator per topic | Rather than "percentage correct," surface "mastered / practicing / not started" — this framing matches school report card language parents already understand | Low | Derived from error-adaptive data already being tracked. |
| Animated character guide (consistent across lessons) | A consistent character (mascot) builds emotional attachment and recall; Prodigy uses this heavily | High | High asset cost. Can start with a simple character and expand. |

---

## Anti-Features

Things to deliberately NOT build in v1. These drain time and deliver low incremental value for this scope.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Multi-child accounts / profiles | Adds auth complexity, local storage partitioning, and profile switcher UI. Single-family iPad is the stated target. | Single device profile; parent PIN for parent section. |
| Gamified meta-game (Prodigy's RPG, treasure chests, monster battles) | Takes months to build and maintain; kids engage but learning outcomes research is mixed; pulls scope massively | Simple star/badge rewards per lesson completion. |
| Leaderboards / social comparison | Kids this age are sensitive to public failure; comparison can harm motivation | Individual progress view only. |
| Teacher / classroom mode | Different product entirely (multi-user, assignment, roster management). Out of scope per PROJECT.md. | Parent section covers the oversight need. |
| Adaptive difficulty that adjusts mid-lesson | Detecting struggle in real time and dynamically changing content mid-lesson requires significant state management and is fragile | Post-session repetition weighting (between sessions) is simpler and nearly as effective. |
| In-app purchases / premium content gates | Creates a broken-feeling experience for kids who hit a paywall mid-session; trust destruction | If monetization is needed later, full-access paid up front. |
| Text-based keyboard input for answers | Under age 9, on-screen keyboards are slow and error-prone; a mistyped answer feels like the app is broken | Multiple choice taps only; or visual number tiles the child assembles. |
| Backend sync / cloud save | Requires auth, API, server infrastructure. Local-only is the stated constraint and is sufficient for single-device use. | localStorage / IndexedDB with export-to-clipboard as a future consideration. |
| Weekly email reports to parents | Adds backend, email infrastructure, COPPA/GDPR surface area for child data. | Parent section on-device covers the need per PROJECT.md. |
| Voice input for answers | Speech recognition on Safari/iOS has reliability issues for young children's voices; accent and pronunciation variance causes failures that frustrate kids | Tap-based input only. |

---

## Lesson Flow Patterns

Based on analysis of Khan Academy Kids, Splash Math, ST Math, DoodleMath, and IXL (MEDIUM confidence — training knowledge):

### The Standard Arc (industry consensus)

```
1. Concept Intro (animated lesson, narrated)
   - 60–90 seconds
   - No interaction required — kid watches
   - Introduces the concept with concrete visuals (e.g., 3 apples + 2 apples)
   - Narration carries all content (no reading required)

2. Guided Example (narrated, semi-interactive)
   - 1–2 worked examples, narrated step by step
   - Kid may tap to advance steps but does not answer alone
   - Builds confidence before solo practice

3. Practice Set (solo, immediate feedback)
   - 5–10 problems per session
   - Each problem: question displayed + read aloud → child answers → immediate feedback
   - Wrong answer: encouraging prompt, try again (max 2 attempts before reveal)
   - Correct answer: short celebration → next problem

4. Session Complete (summary + reward)
   - Stars earned displayed
   - Simple stat: "You got X out of Y right!"
   - Prompt to continue to next lesson or return to map
```

### Lesson Length Guidance

- G1 (age 6–7): 5–7 minutes per session maximum before attention degrades
- G2–3 (age 7–9): up to 10–12 minutes is viable
- Sessions should be completable in one sitting; never force a save mid-lesson

### Problem Set Size

- 5 problems: minimum to establish pattern; too short to build fluency
- 8–10 problems: sweet spot for one session
- 15+: fatigue and abandonment risk; defer to next session

---

## Practice Problem Types

Ranked by fit for this app's constraints (touch-first, no keyboard, ages 6–9):

| Type | Fit | Complexity | Notes |
|------|-----|------------|-------|
| Multiple choice (3–4 options) | Excellent | Low | Default input type. Large tap targets. Works for all ages. |
| Tap to select visual objects | Excellent | Medium | E.g., "tap 3 apples." Great for G1 concrete-stage learners. |
| Number tile drag-to-slot | Good | Medium | Drag a number tile into a blank (e.g., `3 + __ = 7`). More engaging than MC but more complex to build. |
| True/False (simplified MC) | Good | Low | Useful for word problems ("Is 4 + 3 = 8? Yes or No"). Very low reading demand. |
| Fill-in via number pad | Marginal | Low | On-screen numpad (not full keyboard). Acceptable for G2–3 but slower than tap. |
| Open text keyboard | Poor | Low | Never use for this age group on touch devices. |
| Drag-and-drop sorting | Poor for math | High | More suited to literacy; complex to implement; avoid. |

**Recommended default:** Multiple choice with 4 options, supplemented by tap-to-select-objects for G1 concrete problems.

---

## Feedback Patterns

### Immediate Feedback (required — table stakes)

Every answer must receive a response within 200ms. Silence = broken.

| Scenario | Visual | Audio | Text |
|----------|--------|-------|------|
| Correct answer | Green highlight, star burst animation (1 sec) | Chime + praise word ("Great job!") | "Correct!" (also narrated) |
| Wrong answer (attempt 1) | Gentle shake / red tint (brief) | Soft low tone | "Try again!" (narrated) |
| Wrong answer (attempt 2) | Reveal correct answer with highlight | "The answer is 5! Let's keep going." | Narrated, not shamed |
| Session complete | Confetti or star shower | Celebratory fanfare | "Awesome work!" + stat |

### Feedback Anti-Patterns to Avoid

- Loud, jarring "wrong" sounds — embarrassing if in public; causes fear of answering
- Long punishment animations before the child can try again
- Showing a score as a percentage to the child (abstract and punishing for G1)
- Requiring the child to "press X" to dismiss an error — auto-advance after ~1.5 sec

---

## Motivation and Engagement Mechanics

### What Research Shows (MEDIUM confidence)

- Stars per problem and stars per lesson are the most effective simple reward for ages 6–8
- Streaks (daily login streaks) require backend and are psychologically risky for young kids (anxiety around breaking streak)
- Narrative/character investment works but requires significant art/writing asset investment
- Progress visibility ("you're halfway through unit 2!") is motivating for ages 7+ more than badges

### Recommended for v1

| Mechanic | Value | Complexity | Include? |
|----------|-------|------------|---------|
| Stars earned per lesson (3-star rating) | High for ages 6–8 | Low | YES |
| Lesson completion checkmarks on curriculum map | High orientation value | Low | YES |
| Session completion celebration screen | High; kids respond strongly | Medium | YES |
| Unlockable simple badge per unit completed | Moderate; gives medium-term goal | Low | YES (simple) |
| Daily streak counter | Low for this age; anxiety risk | Medium | NO in v1 |
| Animated character mascot reactions | High engagement; Prodigy uses this | High | MAYBE — start simple |
| Points / XP accumulation | Moderate; abstract for G1 | Low | DEFER |
| Leaderboards | Negative for this age | Low | NO |

---

## Parent Progress Tracking — What Parents Actually Want

Based on App Store review analysis patterns for IXL, Splash Math, Khan Academy Kids (MEDIUM confidence):

### What Parents Say They Want

1. "Is my child making progress?" (high-level trend)
2. "What specifically is my child struggling with?" (actionable specifics)
3. "How much time did they spend?" (effort gauge)
4. "Are they actually learning, or just guessing?" (accuracy indicator)

### Recommended Parent Dashboard Features

| Feature | Value | Complexity | Notes |
|---------|-------|------------|-------|
| Lessons completed (total + this week) | High — answers "is she using it?" | Low | Simple count from localStorage |
| Accuracy rate per topic | High — answers "what does she know?" | Low | Percentage correct per unit |
| "Needs more practice" list (struggling topics) | Highest — most actionable | Low | Topics with accuracy < 70%, sorted worst first |
| Time spent this week | Medium — effort gauge for parents | Low | Track session durations, sum per week |
| Recent session history (last 5 sessions) | Medium — shows recency of use | Low | Date, lesson name, score |
| Per-problem drill-down | Low — too granular for most parents | Medium | Defer; aggregate view is sufficient |

### Parent Section UX Constraints

- PIN entry must be clearly labeled as "For Parents" — kids will try to enter it
- PIN must be settable on first use (4-digit, simple)
- All text in parent section can use adult reading level — this is the one place to drop the large-font/simple-language rule
- "Struggling concepts" visualization should use words, not just percentages — "Addition with carrying" not "73%"

---

## Accessibility for Ages 6–9

### Reading Level

- All child-facing text: grade 1 reading level maximum for G1 (Flesch-Kincaid ~1.0)
- Every string must have a narrated audio equivalent — text is secondary
- Numbers are fine; written math operators (+, –, =) must be narrated by name ("plus", "minus", "equals")

### Touch Target Sizing

| Element | Minimum Size | Notes |
|---------|-------------|-------|
| Answer choice button | 80×80pt | Larger is better; kids lack fine motor precision |
| Navigation buttons (back, home) | 64×64pt | Keep away from answer area to avoid accidental taps |
| Tap-to-hear icon | 48×48pt | Small because it's supplementary, not primary |
| Curriculum map items | 72×72pt | Needs to be tappable even when small on map |

### Error Handling for Kids

- Never show a technical error message to the child — catch all errors gracefully
- If audio fails to load: fall back silently, show text only, do not show "audio error"
- If a session fails to save: continue normally; attempt save again on next state change; do not alert child
- Always give the child a way forward — no dead ends

### Cognitive Load

- Maximum 1 new concept per lesson (no compound concepts in G1–2)
- Problem statement + answer options must all be visible without scrolling
- No more than 4 answer choices — 3 is better for G1
- Avoid timers — time pressure degrades performance and enjoyment for this age group

---

## Feature Dependencies

```
Animated narrated lesson
  └─ requires: Audio asset strategy (TTS or recorded audio)
  └─ requires: Animation system (Lottie or CSS/SVG)
  └─ enables: Guided example step
       └─ enables: Practice set (solo problems)
            └─ enables: Session complete screen
                 └─ enables: Stars / reward mechanic
                      └─ enables: Curriculum map progress state

Error-adaptive repetition
  └─ requires: Per-topic accuracy tracking (localStorage)
  └─ requires: Practice set (must have data to adapt on)
  └─ enables: Parent "struggling topics" list
       └─ enables: Parent dashboard

Parent dashboard
  └─ requires: PIN gate
  └─ requires: Per-topic accuracy tracking
  └─ requires: Session history (time, date, lesson)
```

---

## MVP Recommendation

### Must ship in v1 (table stakes + highest-value differentiators)

1. Narrated animated lesson flow (concept intro → guided example → practice)
2. Multiple choice practice problems with immediate audio + visual feedback
3. Visual curriculum map showing completed and upcoming lessons
4. Per-session star rating (3 stars per lesson)
5. Error-adaptive problem repetition (weight toward weak topics between sessions)
6. Progress persistence (localStorage/IndexedDB)
7. Parent PIN-gated dashboard with: lessons completed, accuracy per topic, struggling topics list
8. Tap-to-hear-again button on all narrated content
9. Works offline after first load (service worker)
10. Touch targets sized for iPad (min 64pt for answer buttons)

### Defer from v1 (valuable but scope-risky)

| Feature | Reason to Defer |
|---------|----------------|
| Animated character mascot with reactions | High art/animation asset cost; not needed for core learning |
| Per-word tap-to-hear on all text | Requires significant text instrumentation work; core narration covers most of the need |
| Animated word problem scenes | High per-problem asset cost; narrated static illustration is a good intermediate |
| Unit completion badges | Nice-to-have; stars and map checkmarks carry the reward loop |
| Daily streak counter | Anxiety risk for young kids; not worth complexity without backend |
| Time-spent tracking in parent view | Useful but secondary to accuracy data; add in iteration 2 |

---

## Sources

**Confidence: MEDIUM** — WebSearch and WebFetch were denied during this research session. All findings are synthesized from training knowledge (cutoff August 2025) of the following products and research areas:

- Khan Academy Kids (iOS/Android/web app, grades K–2)
- Prodigy Math (web/app, grades 1–8)
- Splash Math (iOS/Android, grades K–5)
- IXL Learning (web/app, grades K–12)
- DoodleMath (iOS/Android, grades K–5)
- ST Math (web, grades K–5)
- Reflex Math (web, grades 2+)
- Common Core State Standards Mathematics, grades 1–3 (corestandards.org)
- Apple Human Interface Guidelines — touch target sizing
- Research on concrete-representational-abstract (CRA) math instruction framework
- Spaced repetition literature (Ebbinghaus forgetting curve) as applied to edtech

**Flag for validation:** The specific product feature details (e.g., exact Prodigy mechanics, Khan Academy Kids lesson arc) should be verified by someone who has used these apps recently before they drive hard product decisions. The general patterns (lesson arc, immediate feedback, audio requirement) are well-established in the edtech literature and carry HIGH confidence.
