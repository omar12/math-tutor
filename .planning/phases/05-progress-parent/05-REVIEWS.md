---
phase: 05-progress-parent
reviewers: [opencode, ollama]
reviewed_at: 2026-05-17T00:00:00Z
plans_reviewed: [05-01-PLAN.md, 05-02-PLAN.md, 05-03-PLAN.md]
---

# Cross-AI Plan Review — Phase 5

## OpenCode Review

## Plan 01: Session Recording

### Summary
Solid, minimal design that fits the architecture and uses Dexie correctly. The aggregation model is simple and deterministic, and tying persistence to the celebration phase aligns with product intent. The main risks are around effect firing semantics, double-writes, and correctness of counters under all answer paths.

### Strengths
- Clean separation: `recordSessionAndUpdateProgress()` as a standalone function keeps UI logic thin
- Aggregation strategy (recompute from sessions) avoids drift and keeps logic simple
- Correct alignment with D-11 (only record on celebration)
- Non-blocking write preserves UX
- Test cases cover core happy paths and aggregation correctness
- No unnecessary dependencies or abstractions

### Concerns
- **HIGH:** `useEffect` on `state.phase === 'celebration'` can fire multiple times (re-renders, dependency changes) → duplicate session writes
- **HIGH:** No explicit idempotency guard (e.g., "already recorded" flag per session)
- **MEDIUM:** Counter correctness depends on reducer discipline — unclear if all answer paths are fully covered (e.g., retries, partial inputs, edge flows)
- **MEDIUM:** Aggregation reads all sessions per topic every time → fine now, but O(n) growth could become noticeable
- **LOW:** `.catch` logging only — silent data loss if IndexedDB write fails (Safari quota/eviction edge cases)
- **LOW:** No validation of `totalCount > 0` before writing (defensive check missing)

### Suggestions
- Add a `hasRecordedSession` ref or state flag to prevent duplicate writes: `if (phase === 'celebration' && !hasRecorded.current)`
- Narrow the effect trigger: depend only on `phase` transition (compare previous value)
- Add a guard in `recordSessionAndUpdateProgress()`: skip if `totalCount === 0`
- Consider lightweight incremental aggregation (optional, not required yet)
- Add test: re-render during celebration does not create duplicate sessions
- Add test: simulate Dexie failure → UI still renders, error logged

### Risk Assessment
**MEDIUM** — Core logic is sound, but duplicate writes via React effects is a real risk that will corrupt aggregates if not handled.

---

## Plan 02: PinScreen

### Summary
Well-scoped and aligned with constraints (no keyboard, touch-first). The dual-mode (create/verify) approach is efficient. The biggest risks are around security tradeoffs, edge cases in async state, and lack of throttling on PIN attempts.

### Strengths
- Reuses DigitGrid pattern → consistent UX
- Clear CREATE vs VERIFY flow with confirmation step
- No raw PIN persistence — good security hygiene
- Auto-submit on 4 digits reduces friction for kids/parents
- Route isolation (`/pin`) keeps concerns separated
- Test coverage is thorough for core flows

### Concerns
- **HIGH:** No brute-force protection (infinite attempts, no delay)
- **MEDIUM:** `useLiveQuery` returning `undefined` conflates loading vs "no pin set" — can cause flicker or wrong mode briefly
- **MEDIUM:** No debounce/lock during async `verifyPin()` → double taps could trigger multiple verifications
- **LOW:** No accessibility feedback for errors beyond visual (no aria-live region)
- **LOW:** No "back" or cancel path from PIN screen (might trap user if navigation fails)

### Suggestions
- Add minimal rate limiting: 300–500ms delay after failed attempt (cheap v1 mitigation)
- Distinguish loading vs empty state: explicit `isLoading` sentinel handling
- Disable input while verifying: prevent duplicate submissions
- Add subtle UX recovery: "Cancel" button or gesture to return home
- Add test: rapid taps don't trigger multiple verify calls

### Risk Assessment
**MEDIUM** — Functional and clean, but lacks basic brute-force mitigation and has minor async UX risks.

---

## Plan 03: Parent Dashboard + HomeScreen

### Summary
Strong alignment with product goals. The adaptive sorting logic is simple and effective, and the dashboard meets requirements without overbuilding. Main risks are around data consistency, edge cases in sorting, and subtle UX gaps.

### Strengths
- Adaptive logic is minimal and deterministic (accuracy + curriculum order tie-break)
- Always rendering all three topics ensures stable UI
- Empty state handled explicitly (good for early UX)
- Accessibility: `role="progressbar"` and ARIA attributes included
- Clean separation via `ProgressBar` component
- HomeScreen fallback logic avoids crashes when no data exists

### Concerns
- **HIGH:** `topicProgress.toArray()` does not guarantee all three topics exist → missing topics must be synthesized client-side
- **MEDIUM:** Sorting depends on `topicProgress` presence — undefined accuracy handling not explicitly defined
- **MEDIUM:** No memoization of `sortedLessons()` → recomputed on every render
- **LOW:** Color-only encoding of performance (green vs blue) may not be sufficient for accessibility
- **LOW:** No handling for corrupted or partial TopicProgress records

### Suggestions
- Normalize topic data before render: ensure all three topics always have a default `{ accuracy: 0, hasData: false }`
- Make sorting explicit: treat missing accuracy as lowest priority (0.0) or fallback to curriculum order
- Wrap `sortedLessons()` in `useMemo` based on `topicProgress` + lessons
- Add defensive checks: clamp accuracy to [0, 1]
- Add test: missing one topic in DB still renders all three correctly
- Consider adding text labels alongside color: e.g., "Needs Practice" vs "Strong"

### Risk Assessment
**LOW–MEDIUM** — Mostly straightforward UI logic with minor data-shaping risks; unlikely to break core functionality.

---

## Ollama Review (gemma4:e4b)

## Plan 01: Session Recording

### Summary
Plan 01 is structurally sound and hits the critical path for data persistence. The approach of separating the `recordSessionAndUpdateProgress` logic into a non-blocking function within a `useEffect` hook tied to the celebration state is a clean, reactive pattern. The focus on idempotent upserting of `TopicProgress` is essential for data integrity.

### Strengths
- Idempotency focus: `db.topicProgress.put()` as upsert prevents duplicate/conflicting records
- Using `useEffect` watching the `phase` state is the correct React pattern for post-action side effects
- Non-blocking write allows celebration screen to render even if write fails
- Testable aggregation: `2 sessions (3/5, 4/5) → accuracy=0.7, attemptCount=2` validates business logic precisely

### Concerns
- **MEDIUM:** Multiple sessions completed quickly could trigger near-simultaneous calls to `recordSessionAndUpdateProgress` — without Dexie transactions, race conditions could skew totals
- **LOW:** Current `accuracy` float may be insufficient if business requirements change (e.g., tracking difficulty or rate of improvement)
- **LOW:** All necessary state variables must be included in the `useEffect` dependency array to avoid stale closure bugs

### Suggestions
- Wrap the entire `recordSessionAndUpdateProgress` logic in a Dexie transaction (`db.transaction(...)`) to ensure Session add + TopicProgress upsert succeed or fail atomically
- Explicitly document the aggregation formula in code comments: `newAccuracy = SUM(correctCount) / SUM(totalCount)`
- Consider a temporary failure UI state (banner) rather than fully silent catch

### Risk Assessment
**MEDIUM** — Logic sound, but lack of transaction management creates moderate risk of data corruption under concurrent usage.

---

## Plan 02: PinScreen

### Summary
Plan 02 is highly robust and successfully minimizes attack surface by keeping all logic, hashing, and storage entirely client-side, adhering strictly to the "no backend" constraint. The use of mode detection (`useLiveQuery`) and the restriction to a custom DigitGridWidget pattern significantly improve UX and security.

### Strengths
- All PIN operations (hashing, verification, storage) handled client-side — consistent with no-backend constraint
- Restriction to digit button grid handles "no software keyboard" rule
- Implementing `/pin` route and dedicating component to two modes keeps code clean
- Raw digits never logged or written to DB — excellent security practice

### Concerns
- **HIGH:** Client-side storage of hashes is not cryptographically secure against XSS or persistent device compromise — the hash acts as local friction, not true security
- **MEDIUM:** XSS vulnerability on the site could theoretically allow an attacker to dump the stored `pinHash`
- **LOW:** Mixing Setup (CREATE) and Usage (VERIFY) concerns in one component increases complexity

### Suggestions
- Document explicitly in CONTEXT.md and README that PIN provides *friction* but not cryptographic security — only adequate for preventing casual snooping
- Consider abstracting PIN state machine into a dedicated hook `usePinAuth(mode)` to separate auth logic from UI rendering
- Add deep validation on `rawPin` input to ensure it never appears in logs, effect cleanup, or debugger tools

### Risk Assessment
**MEDIUM** — Technical implementation is robust for the constraints, but client-side-only authentication has an unresolvable inherent security limit.

---

## Plan 03: Parent Dashboard + HomeScreen

### Summary
Plan 03 successfully bridges raw data and functional UI. The separation of concerns on `ProgressBar` and the use of `useLiveQuery` on `ParentScreen` are optimal. The adaptive sorting logic is solid and directly delivers PROG-02.

### Strengths
- `role="progressbar"` and ARIA attributes show high A11y consideration
- Sorting by topic accuracy (low to high) + curriculum order tie-break is robust and meets PROG-02
- Empty state handling (friendly message, no 0% bars) significantly improves UX
- Subtle lock icon change is a non-disruptive UX choice

### Concerns
- **HIGH:** Entire plan relies on Plan 01 completing with robust data integrity — strict dependency order
- **MEDIUM:** `sortedLessons()` relies on lesson objects containing `topic` — if not available, sorting breaks
- **MEDIUM:** Current implementation only surfaces the single weakest lesson — as app grows, parents may want top N weak topics

### Suggestions
- Do not proceed to P03 until P01 transaction logic is fully implemented and tested
- Consider grouping top N weakest topics at HomeScreen rather than just the single lowest-scoring lesson
- Add TypeScript assertions around lesson object structure to guarantee `topic` field is always present when `sortedLessons()` runs

### Risk Assessment
**MEDIUM** — Well-designed but entirely dependent on reliable execution of the P01 data pipeline.

---

## Consensus Summary

Phase 5 reviewed by 2 AI systems (OpenCode, Ollama/gemma4:e4b). Cursor unavailable (not installed). Claude skipped (self-exclusion).

### Agreed Strengths
- **Non-blocking session write** — both reviewers praised `.catch` pattern keeping celebration UX unaffected
- **Mode detection via `useLiveQuery`** — correct Dexie-React pattern for CREATE vs VERIFY
- **ProgressBar ARIA attributes** — accessibility attention noted positively by both
- **Adaptive sort logic** — simplicity of accuracy-ascending + curriculum-order tie-break praised
- **Empty state handling** — friendly message instead of 0% bars called out as good UX by both
- **No raw PIN in DB** — security hygiene validated by both

### Agreed Concerns

| Priority | Concern | Plan | Reviewers |
|----------|---------|------|-----------|
| HIGH | `useEffect` on `'celebration'` can fire multiple times → duplicate session writes | P01 | Both |
| HIGH | No brute-force protection on PIN entry | P02 | Both |
| HIGH | Three topics not guaranteed in `topicProgress.toArray()` — must synthesize missing | P03 | Both |
| MEDIUM | No Dexie transaction around Session add + TopicProgress upsert → partial writes possible | P01 | Both |
| MEDIUM | `useLiveQuery` undefined state conflates loading vs "no PIN set" | P02 | Both |
| MEDIUM | No debounce/lock during async `verifyPin()` → double-tap risk | P02 | OpenCode |
| MEDIUM | `sortedLessons()` not memoized | P03 | OpenCode |

### Divergent Views
- **Transaction atomicity urgency**: Ollama rates this HIGH priority for P01; OpenCode treats it as a MEDIUM suggestion. Ollama's framing (wrap in `db.transaction()`) is more actionable.
- **PIN security documentation**: Ollama recommends prominently documenting the client-side security limit in CONTEXT.md/README; OpenCode focuses on runtime mitigations (rate limiting, debounce). Both are valid — do both.
- **Adaptive repetition scope**: Ollama suggests surfacing top N weak topics instead of single weakest lesson; OpenCode accepts single lesson as sufficient for v1. Single lesson is correct per D-15; N-topic view is a v2 concern.

### Top 3 Action Items Before Execution

1. **P01: Add `hasRecorded` ref guard** — prevent duplicate session writes when `useEffect` re-fires during celebration. One `useRef(false)` set to `true` after first write, reset on unmount.
2. **P01: Wrap in `db.transaction()`** — ensure Session add + TopicProgress upsert are atomic. If either fails, both roll back.
3. **P03: Synthesize missing topics** — before passing to ProgressBar, fill in `{ accuracy: 0, hasData: false }` for any of the three topics not yet in `topicProgress` array.
