# Requirements: Math Tutor — Kids Edition

**Defined:** 2026-05-12
**Core Value:** A kid sits down, does a lesson, practices, and the parent can see exactly what their child understands and what they don't — without any accounts or setup friction.

## v1 Requirements

### Platform

- [ ] **PLAT-01**: App runs in Safari on iPad, fully touch-optimized with no mouse assumptions
- [ ] **PLAT-02**: App uses `100dvh` and `env(safe-area-inset-bottom)` to handle iPad viewport correctly
- [ ] **PLAT-03**: Single profile per device — child can open app and start immediately with no login or setup
- [ ] **PLAT-04**: All progress data persists locally via IndexedDB across sessions

### Curriculum

- [ ] **CURR-01**: App covers grade 1–3 addition and subtraction content aligned to Common Core standards
- [ ] **CURR-02**: App includes grade 1–3 word problems with narration reading the problem aloud
- [ ] **CURR-03**: Curriculum is data-driven (static JSON) so adding content requires no code changes

### Lesson

- [ ] **LESS-01**: Each lesson begins with a guided worked example that walks through a sample problem step by step with narration
- [x] **LESS-02**: All lesson instructions and problem text are narrated aloud (pre-recorded audio)
- [ ] **LESS-03**: Kid can tap any narrated segment to replay it
- [x] **LESS-04**: Audio playback is unlocked via the first deliberate user tap (satisfies iOS Safari gesture requirement)

### Practice

- [ ] **PRAC-01**: Kid can answer practice problems via multiple choice — 4 large-touch-target options, no keyboard
- [ ] **PRAC-02**: Kid can answer fill-in-the-blank problems via a tappable digit grid (0–9), no software keyboard
- [ ] **PRAC-03**: Practice problems follow immediately after each lesson's guided example

### Feedback

- [ ] **FEED-01**: After 2 wrong attempts on a problem, app shows a hint
- [ ] **FEED-02**: After 3 wrong attempts, app reveals the correct answer and advances — no infinite retry loop
- [ ] **FEED-03**: Encouragement phrases on wrong answers rotate and maintain a warm, non-punishing tone
- [ ] **FEED-04**: Session end triggers a completion celebration screen with visual reward

### Progress

- [x] **PROG-01**: App tracks per-topic accuracy (addition, subtraction, word problems) across sessions
- [x] **PROG-02**: Practice sessions use error-adaptive repetition — topics with lower accuracy appear more frequently

### Parent Section

- [x] **PAR-01**: Parent section is accessible from the main screen behind a 4-digit PIN
- [x] **PAR-02**: Parent dashboard shows accuracy per topic (addition, subtraction, word problems)

### PWA

- [x] **PWA-01**: App can be installed via "Add to Home Screen" on iPad (PWA with Web App Manifest)
- [x] **PWA-02**: App works fully offline after first load via Service Worker

## v2 Requirements

### Lesson Flow

- **LESS-V2-01**: Animated concept intro (watch-only) — character explains concept before interaction begins
- **LESS-V2-02**: Animated scenes for word problems (vs static illustrations)

### Practice Input

- **PRAC-V2-01**: Drag-and-drop input type (arrange tiles, match items)

### Feedback & Motivation

- **FEED-V2-01**: Stars and badges collectible as lesson rewards
- **FEED-V2-02**: Immediate visual + audio celebration animation on every correct answer (distinct from session-end)

### Progress

- **PROG-V2-01**: Lesson completion tracking with visual curriculum map
- **PROG-V2-02**: Session history with date, topics covered, accuracy per session

### Parent Section

- **PAR-V2-01**: Struggle spotlight — ranked list of topics kid struggles with most
- **PAR-V2-02**: Session history view (recent sessions with date, topics, accuracy)
- **PAR-V2-03**: Data export or backup warning for 7-day Safari eviction risk

### Content

- **CURR-V2-01**: Multiplication and division (grades 3+)
- **CURR-V2-02**: Fractions (grade 3)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-child accounts / parent login | Single device profile eliminates auth complexity for v1; most families share one iPad with one child |
| Teacher dashboard / classroom mode | Parent-only focus in v1; classroom multi-student view is a different product |
| Weekly email reports | Parent section on-device covers the tracking need without requiring email integration |
| Backend / server-side storage | Local-only v1; backend adds auth, cost, and COPPA compliance complexity |
| Keyboard text input for answers | Software keyboard breaks iPad layout and is unsuitable for ages 6–9; tap-based input sufficient |
| Shapes, geometry, patterns | Out of stated scope for v1 curriculum |
| Social features (leaderboards, sharing) | Harmful for ages 6–9; actively excluded |
| Daily streaks | Research shows streaks create anxiety in young children; excluded from all versions |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLAT-01 | Phase 1 | Pending |
| PLAT-02 | Phase 1 | Pending |
| PLAT-03 | Phase 1 | Pending |
| PLAT-04 | Phase 1 | Pending |
| CURR-01 | Phase 2 | Pending |
| CURR-02 | Phase 2 | Pending |
| CURR-03 | Phase 2 | Pending |
| LESS-01 | Phase 3 | Pending |
| LESS-02 | Phase 3 | Complete |
| LESS-03 | Phase 3 | Pending |
| LESS-04 | Phase 3 | Complete |
| PRAC-01 | Phase 4 | Pending |
| PRAC-02 | Phase 4 | Pending |
| PRAC-03 | Phase 4 | Pending |
| FEED-01 | Phase 4 | Pending |
| FEED-02 | Phase 4 | Pending |
| FEED-03 | Phase 4 | Pending |
| FEED-04 | Phase 4 | Pending |
| PROG-01 | Phase 5 | Complete |
| PROG-02 | Phase 5 | Complete |
| PAR-01 | Phase 5 | Complete |
| PAR-02 | Phase 5 | Complete |
| PWA-01 | Phase 6 | Complete |
| PWA-02 | Phase 6 | Complete |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-12*
*Last updated: 2026-05-12 after roadmap creation (6 phases)*
