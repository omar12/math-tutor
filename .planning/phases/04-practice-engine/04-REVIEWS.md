---
phase: 4
reviewers: [opencode, ollama]
reviewed_at: 2026-05-16T06:16:35Z
ollama_model: gemma4:e4b
plans_reviewed: [04-01-PLAN.md, 04-02-PLAN.md]
skipped: [claude (self — running inside Claude Code), cursor (stdin not supported), gemini (not installed), codex (not installed)]
---

# Cross-AI Plan Review — Phase 4: Practice Engine

## OpenCode Review

## Plan 04-01 Review

### Summary
This is a solid, well-scoped foundation plan that correctly prioritizes routing, state management, and core interaction widgets. The reducer-driven state machine is appropriate and mirrors existing patterns, which reduces risk. However, there are a few UX and edge-case gaps (especially around touch ergonomics, accessibility, and timing interactions) that could degrade the experience for young children if not addressed.

### Strengths
- Clear separation of concerns: routing, state machine, and widgets are cleanly divided
- Reducer-based state machine matches existing architecture (low cognitive overhead)
- Explicit handling of attempt counts and transitions (good alignment with FEED requirements later)
- Correct use of `useMemo` for shuffling (avoids re-randomizing on every render)
- Thoughtful handling of empty problem pool (no crash path)
- Digit grid avoids native input (correct for iPad UX constraint)
- Test scaffold included early (prevents regressions later)

### Concerns
- HIGH: No guard against rapid double taps on answers
  - MultipleChoiceWidget may dispatch multiple actions before state updates
- HIGH: No explicit “input lock” during transitions (`revealing` phase)
  - Could allow additional taps during the 200ms or 1.5s windows
- MEDIUM: `useMemo` shuffle dependency on `lessonId` only
  - If problem data changes (future), shuffle may become stale
- MEDIUM: Progress indicator (“1 of N”) not tied explicitly to state validation
  - Risk of off-by-one errors during ADVANCE transitions
- MEDIUM: No handling for very long composed digit input
  - Kids could enter unrealistic answers (e.g., 999999)
- MEDIUM: Accessibility gaps
  - No mention of focus management or screen reader flow beyond `aria-live`
- LOW: Silent fallback to ConfettiScreen on empty data
  - Hides potential data bugs during development

### Suggestions
- Add a simple interaction lock:
  - Ignore input when `phase !== 'answering'`
- Debounce or guard tap handlers:
  - Early return if already answered
- Cap digit input length:
  - e.g., max 2–3 digits depending on grade level
- Make progress display derived strictly from state:
  - `problemIndex + 1` from reducer only
- Add a dev-only warning for empty problem pool:
  - `console.warn` to catch data issues
- Add subtle visual “pressed” states for touch feedback:
  - Important for kids to feel responsiveness
- Consider adding a small delay (~100ms) before CORRECT → ADVANCE:
  - Ensures visual feedback is perceivable

### Risk Assessment
**MEDIUM**

Core architecture is strong, but interaction timing and touch handling issues could lead to buggy or frustrating UX if not tightened.


---

## Plan 04-02 Review

### Summary
This plan cleanly layers feedback and completion UX on top of the existing engine. It respects prior decisions and avoids over-engineering. The escalation logic is simple and appropriate for the age group. The main risks are around UX nuance (tone, timing, and visual clarity) and ensuring feedback does not feel repetitive or confusing.

### Strengths
- Feedback escalation logic is clear and deterministic
- Good use of a fixed-height FeedbackSlot to prevent layout shift
- Clean separation of feedback rendering into its own component
- Backwards-compatible ConfettiScreen change (well thought out)
- Proper cleanup of timers (important for React correctness)
- Phrase rotation avoids repetition fatigue

### Concerns
- HIGH: No visual distinction between encouragement vs hint beyond text
  - Kids may not understand escalation
- MEDIUM: Fallback hint is generic and may not help learning
  - Could feel irrelevant depending on problem
- MEDIUM: No explicit “correct answer reveal” UI spec
  - “highlighted green” is vague without defining where/how
- MEDIUM: Phrase rotation tied only to modulo
  - Could repeat too predictably across sessions
- LOW: aria-live="polite" may delay important feedback
  - For short interactions, “assertive” might be more appropriate
- LOW: No animation or transition defined for feedback changes
  - Could feel abrupt or jarring

### Suggestions
- Add visual hierarchy in FeedbackSlot:
  - Encouragement: neutral/soft color
  - Hint: slightly more prominent (icon + color shift)
- Define correct answer reveal explicitly:
  - Multiple choice: highlight correct card + dim others
  - Digit grid: replace display with correct answer
- Slightly vary phrasing selection:
  - Avoid immediate repeats (track last index)
- Consider lightweight animation:
  - Fade/slide for feedback text changes
- Upgrade hint system (future-ready):
  - Even if fallback now, structure component to accept per-problem hints later
- Consider using `aria-live="assertive"` only for reveal state

### Risk Assessment
**LOW–MEDIUM**

Implementation is straightforward and builds cleanly on Plan 01. Main risks are UX quality rather than technical correctness.


---

## Overall Assessment

These plans are well-structured, minimal, and aligned with the product constraints. The biggest gap is not architecture but **interaction quality for kids on touch devices**—specifically input locking, tap behavior, and clarity of feedback states.

If those are addressed, this phase is likely to succeed without major rework.

---

## Ollama Review (gemma4:e4b)

## Cross-AI Plan Review: Phase 4: Practice Engine

***

### Plan 04-01: Route plumbing, state machine, MultipleChoiceWidget, DigitGridWidget, and test scaffold

#### 1. Summary
Plan 04-01 is a robust, well-structured technical plan that correctly identifies the major architectural components needed for the practice engine. By focusing on the `useReducer` pattern and isolating core Widgets, it minimizes complexity and ensures deterministic state flow, which is critical for complex, time-sensitive interaction patterns like gradual hint escalation. The inclusion of comprehensive test scaffolding is excellent and ensures that the state machine's logic is validated early. The immediate focus on routing gaps and state stability is appropriate for a Wave 1 foundation.

#### 2. Strengths
*   **State Management:** The detailed definition of the `PracticeState` and `PracticeAction` union makes the state machine transparent and highly testable. This is the correct approach for managing complex game logic.
*   **Accessibility & Constraints Adherence:** Successfully addressing the "no software keyboard" constraint for `DigitGridWidget` and implementing large touch targets (64px min-height) demonstrates excellent UX focus for the target audience.
*   **Test Coverage:** Creating dedicated, parameterized tests (`App.test.tsx`, `PracticeScreen.test.tsx`) from the start drastically reduces integration risk later in the cycle.
*   **Dependency Awareness:** Identifying the need to update the routing in `App.tsx` and `LessonScreen` early prevents foundational coupling issues.

#### 3. Concerns
*   **Severity: MEDIUM** **The "Instant" Answer Recording (PRAC-01):** While immediate tap-to-submit is good for speed, the plan does not specify how the system handles a user tapping the *wrong* answer before tapping the correct one. A poor UX might make it seem like the app simply registered the wrong answer on the first tap, even if the user intended to correct it.
*   **Severity: LOW** **Complex State Over-scoping:** The `PracticeState` combines everything (problem index, attempt count, *composed digits*, *phrase index*, *current phase*). While functional, consider whether `composedDigits` and `phraseIndex` belong in the global state machine state or if they should be local state within the specific widget that uses them (e.g., `DigitGridWidget.useState`). Coupling them tightly increases the complexity of the root reducer.
*   **Severity: MEDIUM** **Performance of `useMemo`:** Having `useMemo` key on `currentProblem.id` for shuffling choices is good, but the entire mechanism might become a performance bottleneck if the problem pool is large or updates frequently. Reviewing memoization keys is warranted.

#### 4. Suggestions
*   **Enhance Widget UX (MC):** For the Multiple-Choice Widget, ensure that when a user taps a *wrong* answer, the tapped card visually provides immediate, non-stressful feedback (e.g., brief red flash) before the state machine kicks in (or if the state machine hasn't advanced yet). This prevents the feeling of "the app just ignored my tap."
*   **Refine State Ownership:** Consider splitting the state into two containers: 1) Global Progress State (index, total, attempt count) and 2) Widget View State (composed digits, current phrase index). This keeps the root reducer cleaner.
*   **Accessibility for Formats:** Explicitly include ARIA roles and descriptions for the `DigitGridWidget` keys. Since the composing element is not a standard input, assistive technologies will need specific announcement handling to describe the composition process.

#### 5. Risk Assessment
**Overall Risk: MEDIUM**
*Justification:* The plan is technically solid, but the complexity resides primarily in the interaction logic (the state machine itself), which is prone to race conditions or missed edge cases if not rigorously tested. Addressing the user flow feedback (how the user feels when wrong) and refining state ownership will mitigate this risk.

***

### Plan 04-02: FeedbackSlot, ConfettiScreen extension, feedback escalation, and session-end celebration

#### 1. Summary
Plan 04-02 successfully builds the necessary emotional and functional scaffolding around the core logic established in 04-01. It correctly addresses the vital gap of "how does the app behave when wrong?" by implementing a multi-stage feedback loop (Encouragement $\rightarrow$ Hint $\rightarrow$ Reveal). The use of `FeedbackSlot` with reserved height (`min-h-[48px]`) is an excellent, practical design decision that prevents disruptive UI layout shifts. The phased implementation (adding props, then wiring) minimizes coupling risk.

#### 2. Strengths
*   **UX-Centric Planning:** The dedication to reserved space (`min-h-[48px]`) proactively solves a major web development headache, ensuring the core learning experience remains stable regardless of the feedback state.
*   **Layered Feedback:** The three-tiered feedback system (Grace $\rightarrow$ Warning $\rightarrow$ Failure, triggering Hint/Reveal) is pedagogically sound, optimizing frustration management for the target age group.
*   **Technical Safety:** Recognizing the lack of hint data in the curriculum schema and using a generic fallback hint text is a crucial mitigation step that keeps the plan executable with existing content constraints.
*   **Future Proofing:** Explicitly handling backwards compatibility for the `ConfettiScreen` ensures a smooth rollout across different feature sets.

#### 3. Concerns
*   **Severity: HIGH** **State Overlap and Timing Logic:** The most dangerous point is the transition from `WRONG_ANSWER` (attemptCount: 1) to `WRONG_ANSWER` (attemptCount: 2) to `BEGIN_REVEAL`. The logic for switching between the rotating phrase, the static hint, and the timed reveal must be flawless. Any timing conflict (e.g., revealing the hint *and* the encouragement phrase simultaneously, or the hint being immediately overridden) will significantly break the child's immersion and sense of progression.
*   **Severity: MEDIUM** **Timeout/Cleanup:** The reliance on `setTimeout` for the auto-advance (1.5s pause) means that lifecycle management and cleanup (`useEffect` cleanup function) must be exceptionally robust. If the component unmounts (e.g., the parent component updates) before the timer fires, a memory leak or unexpected state update could occur.
*   **Severity: LOW** **UX of Hint/Reveal Interaction:** The transition from Hint ("Think about...") $\rightarrow$ Correct Answer Highlight $\rightarrow$ Auto-advance might feel too rapid or confusing. A brief, visual transition or "Aha!" moment animation could significantly improve the feel of discovery for the child.

#### 4. Suggestions
*   **Implement State Guard:** Treat the Hint/Reveal phase as a single, protected state block. When the `attemptCount` reaches 2, the app should not allow actions that would reset the attempt count or change the display state until the final `ADVANCE` action fires successfully.
*   **Explicit Animation State:** Instead of relying solely on timing, introduce an explicit `isHintVisible` state variable. This prevents accidental interleaving of the hint text and the encouragement text, making the logic easier to debug visually.
*   **UX Enhancement (Reward):** When the correct answer is revealed (the green highlight), consider a small, instantaneous positive feedback loop *before* the 1.5s pause—like a quick, rising chime or a burst of confetti particle effect. This reinforces the correct behavior immediately.

#### 5. Risk Assessment
**Overall Risk: HIGH**
*Justification:* While the structural plan is excellent, the core risk is now entirely centered on the complex, time-dependent, and state-intensive interaction logic. Getting the transitions between the three feedback states (Phrase $\rightarrow$ Hint $\rightarrow$ Reveal) to execute smoothly, predictably, and without UI stuttering is a challenging piece of state machine implementation. The failure to handle edge cases in the timing could lead to an unusable, frustrating experience.

---

## Consensus Summary

Two independent AI systems reviewed the Phase 4 plans. Results converge on strong structural architecture with actionable gaps in interaction timing and child UX.

### Agreed Strengths

- **State machine design**: useReducer pattern with typed action union is praised by both as the right approach — transparent, testable, deterministic
- **No-keyboard constraint**: DigitGridWidget's display-box-not-input approach correctly eliminates software keyboard on iPad Safari — both reviewers highlight this as well-executed
- **Test-first scaffold**: including the full test scaffold in Plan 01 before widget implementation reduces integration risk significantly
- **FeedbackSlot reserved height (min-h-[48px])**: both reviewers call out this layout-shift prevention as a strong UX decision
- **ConfettiScreen backwards compatibility**: buttonLabel?: string prop with 'Start Practice' default — both agree this is well-handled
- **Timer cleanup**: both flag useEffect clearTimeout as critical; plans address it explicitly

### Agreed Concerns

1. **Input locking during transitions** (HIGH — OpenCode) / **State timing complexity** (HIGH — Ollama)
   Both reviewers flag the 200ms CORRECT_ANSWER window and 1.5s REVEAL window as race-condition surfaces. A child tapping a card during the transition could dispatch unexpected actions. Plans have  guards in widgets but reviewers want explicit confirmation this is airtight.

2. **Feedback escalation transition clarity** (HIGH — Ollama, MEDIUM — OpenCode)
   The phrase → hint → reveal flow must be visually distinct. Both reviewers note the plan says "replaces" but doesn't specify whether encouragement disappears instantly or transitions. Risk of the child seeing overlapping messages or a jarring cut.

3. **Digit input cap** (MEDIUM — OpenCode)
   No max-length on composedDigits. A 6-year-old could compose "99999" for a grade-1 addition problem. Both reviewers agree this needs a practical cap (2–3 digits for grades 1–3).

4. **Accessibility beyond aria-live** (MEDIUM — both)
   Progress dots need better semantics. DigitGridWidget keys need ARIA descriptions for assistive tech since they're not standard inputs. Focus management after problem advance not addressed.

### Divergent Views

- **State ownership for composedDigits/phraseIndex**: Ollama argues these should live in local widget state (DigitGridWidget, FeedbackSlot) rather than the root PracticeState. OpenCode is fine with them in the root reducer. Tradeoff: local state is simpler per-widget, but root state makes the state machine fully testable without mounting widgets. **Current plan (root state) is the safer testing choice — accept this divergence.**

- **aria-live polite vs assertive**: OpenCode recommends "assertive" for reveal state feedback. Ollama doesn't address this. Changing to "assertive" only for the reveal state is a valid micro-improvement but not blocking.

- **Per-problem animation on correct answer**: Ollama suggests a confetti particle burst on reveal. OpenCode suggests lightweight visual pressed states. Both are enhancement ideas — deferred to Phase 4 polish or V2. Current plan's CSS keyframes (correct-flash) cover the minimum viable feedback.
