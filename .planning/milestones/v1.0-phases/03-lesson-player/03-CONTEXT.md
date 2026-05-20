# Phase 3: Lesson Player - Context

**Gathered:** 2026-05-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the full interactive lesson player. Replace the LessonScreen stub with a real implementation that takes a child from an audio unlock gate through a narrated, step-by-step worked example, and hands off to practice problems via a celebration screen. Audio management (iOS Safari unlock, step playback, replay) is the core technical challenge. No practice problem rendering — that is Phase 4 scope.

Requirements in scope: LESS-01, LESS-02, LESS-03, LESS-04

</domain>

<decisions>
## Implementation Decisions

### Audio Unlock Gate
- **D-01:** The unlock screen shows Remy the Fox mascot + lesson title + "Tap anywhere to start" instruction. The entire screen is a single tap target — no specific button to locate.
- **D-02:** The first tap unlocks audio AND loads Step 1 of the worked example instantly. No intermediate transition or confirmation screen. Tap → lesson begins.
- **D-03:** iOS Safari audio unlock is satisfied by this first deliberate tap on the unlock screen (LESS-04). After unlock, all subsequent audio in the session plays automatically.

### Step Advancement
- **D-04:** The child taps to advance between steps. Audio plays automatically when a step appears; a visual cue (e.g., arrow or "Next" indicator) lights up after audio finishes, prompting the tap. The child controls the pace.
- **D-05:** Replay: each step card has a dedicated replay icon. Tapping it restarts that step's audio from the beginning. Consistent with LESS-03.
- **D-06:** If audio is unavailable (file missing or load error), the step displays normally — text and equation shown, lesson proceeds silently. No error indicator shown to the child.

### Step Layout
- **D-07 (Claude's discretion):** One step fills the screen at a time. No scrollable history. Full-screen per-step layout matches the full-screen, forward-only navigation pattern from Phase 1 (D-01, D-02). Equation rendered large and centered below the step text when present.

### Lesson End Handoff
- **D-08:** After the last step, the child taps advance and sees a celebration screen with a confetti/stars animation + a large "Start Practice" button. No Remy on this screen (Remy appeared on the unlock screen).
- **D-09:** The child taps "Start Practice" to navigate to the practice screen. No auto-advance — the child initiates the transition.
- **D-10:** This celebration screen is distinct from the post-practice FEED-04 session-end celebration (Phase 4 scope). Phase 3 is lesson-end only.

### Claude's Discretion
- Step card visual design (card styling, animation for step transitions, "Next" indicator appearance) — maintain warm vibrant palette and Nunito font from Phase 1
- Confetti/stars implementation (CSS animation vs. lightweight library) — keep it lightweight; no Lottie or heavy libs for this screen
- Progress indicator within the worked example (e.g., dot indicators showing step N of M) — include if it fits without clutter
- Exact replay icon (circular arrow, speaker icon) — standard replay convention

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — LESS-01 (guided worked example with narration), LESS-02 (pre-recorded audio for all instructions), LESS-03 (tap to replay any segment), LESS-04 (audio unlock via first deliberate tap)
- `.planning/ROADMAP.md` — Phase 3 success criteria; Phase 4 goal (practice engine — receives navigation from this phase)

### Project Constraints
- `.planning/PROJECT.md` — Core constraints (iPad Safari, touch-first, kids 6–9)
- `CLAUDE.md` — Safari/iPadOS gotchas (critical for audio); touch target minimums (44×44px); `touch-action: manipulation`; Tailwind 4 + Vite 6; Howler.js for audio playback management

### Phase 1 Decisions
- `.planning/phases/01-foundation/01-CONTEXT.md` — D-01 (full-screen no chrome), D-02 (forward-only navigation), D-10/D-11 (color palette, Nunito font), D-12 (44px touch targets)

### Phase 2 Decisions
- `.planning/phases/02-curriculum-content/02-CONTEXT.md` — D-04 (LessonStep structure: `{text, narrationAudio, equation?}`), D-05 (workedExample.steps[] sequential array), D-06 (equation is optional Unicode string)

### Existing Code
- `src/screens/LessonScreen.tsx` — stub to replace
- `src/curriculum/types.ts` — `Lesson`, `LessonStep`, `WorkedExample` types Phase 3 consumes
- `src/curriculum/index.ts` — `lessons` export Phase 3 imports
- `src/db/db.ts` — `appConfig` table for storing `lastLessonId` (resume support — out of Phase 3 scope but path must be stable)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/RemyFox.tsx` — SVG fox component; used on unlock screen (D-01)
- `src/screens/HomeScreen.tsx` — full-screen layout pattern with `100dvh` + `env(safe-area-inset-bottom)` + `touch-action: manipulation` — copy this shell structure for LessonScreen

### Established Patterns
- Full-screen div: `style={{ height: '100dvh', paddingBottom: 'env(safe-area-inset-bottom)' }}` — all screens use this
- Touch button: `style={{ touchAction: 'manipulation' }}` + `min-h-[44px] min-w-[44px]` — every interactive element

### Integration Points
- `src/curriculum/index.ts` → Phase 3 imports `lessons` array, selects current lesson by `lessonId`
- `src/screens/PracticeScreen.tsx` — navigate to this on "Start Practice" tap (Phase 4 replaces the stub)
- Howler.js — audio library already in CLAUDE.md tech stack; Phase 3 instantiates `Howl` per step for playback and replay

</code_context>

<specifics>
## Specific Ideas

- iOS Safari requires a user gesture to create and start audio — the full-screen unlock tap must call `audioContext.resume()` or trigger the first `Howl` play inside the event handler (not in a `useEffect`)
- The "Tap anywhere to start" screen is the ONLY place a child ever needs to find an audio unlock — after this tap, all subsequent Howl instances play automatically for the session
- Audio path convention from Phase 2: `/audio/lessons/{lessonId}/step-{N}.mp3` — files won't exist yet; player must handle 404 gracefully (D-06: silent fallback)

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 3-Lesson Player*
*Context gathered: 2026-05-14*
