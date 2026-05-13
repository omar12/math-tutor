<!-- GSD:project-start source:PROJECT.md -->
## Project

**Math Tutor — Kids Edition**

An iPad-optimized web app that teaches math to kids in grades 1–3. Kids work through animated, narrated lessons followed by practice problems. The app tracks each child's progress and surfaces where they struggle so parents can see what needs more attention.

**Core Value:** A kid sits down, does a lesson, practices, and the parent can see exactly what their child understands and what they don't — without any accounts or setup friction.

### Constraints

- **Platform**: iPad web browser (Safari) — touch-first, no mouse assumptions
- **Auth**: None for child; PIN for parent section — no backend accounts in v1
- **Storage**: Local device storage — no server-side data persistence in v1
- **Content scope**: Addition, subtraction, word problems (grades 1–3 only)
- **Audience**: Kids 6–9 — UI must be accessible, joyful, low-frustration
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Framework
| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| React | 19.2.x | UI framework | HIGH |
| TypeScript | 5.x | Type safety | HIGH |
| Vite | 6.x | Build tool / dev server | MEDIUM |
| React Router | 7.x | Client-side routing | HIGH |
### Animation
| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Motion (formerly Framer Motion) | 12.x | UI transitions, character animation, feedback | MEDIUM |
| CSS animations + keyframes | — | Simple, performance-critical animations | HIGH |
| Lottie (`@lottiefiles/dotlottie-react`) | latest | Pre-designed character sequences | MEDIUM |
### Audio / Narration
| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Pre-recorded MP3 audio files | — | Lesson narration | HIGH |
| Web Speech API (`SpeechSynthesis`) | — | Supplementary/dynamic TTS fallback | MEDIUM |
| Howler.js | 2.x | Audio playback management | MEDIUM |
### State Management
| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| React Context + useReducer | built-in | App-wide state (current lesson, session, PIN state) | HIGH |
| Zustand | 5.x | Optional: if Context re-render performance becomes an issue | MEDIUM |
### Local Storage
| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Dexie.js | 4.x | IndexedDB abstraction for structured progress data | HIGH |
| localStorage | native | Simple key/value config (PIN hash, last lesson ID) | HIGH |
### Math Content Rendering
| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Styled JSX / Tailwind utilities | — | Math expression rendering | HIGH |
| KaTeX | 0.16.x | Optional: only if you introduce fractions or complex notation | MEDIUM |
### iPad / Touch Optimization
| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Tailwind CSS | 4.x | Utility-first styling, responsive layout | HIGH |
| CSS touch-action | native | Prevent scroll hijacking on interactive elements | HIGH |
| CSS `env(safe-area-inset-*)` | native | iPad notch / home bar safe areas | HIGH |
- All interactive elements (buttons, answer tiles, number pads) must be minimum 44×44 CSS pixels — Apple's recommended minimum touch target
- Use `touch-action: manipulation` on interactive elements to suppress the 300ms tap delay on Safari
- Use `user-select: none` on lesson content to prevent text selection during drag interactions
- Test in both portrait (768×1024) and landscape (1024×768) orientations — lesson layouts must not break
### Build Tooling
| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Vite | 6.x | Development server, build, HMR | MEDIUM |
| TypeScript | 5.x | Type checking | HIGH |
| ESLint + Prettier | latest | Code quality | HIGH |
| Vitest | latest | Unit testing | MEDIUM |
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | React 19 | Svelte 5 | Svelte has a smaller ecosystem for the animation and audio tooling this app needs; React's hiring pool is larger for future contributors |
| Framework | React 19 | Vue 3 | Vue is a valid choice but React's edtech ecosystem (tooling, examples, community) is deeper |
| Build tool | Vite 6 | Next.js | No server-side concerns; Next.js adds complexity with zero benefit for a static SPA |
| Build tool | Vite 6 | Create React App | Abandoned; Vite is 10–50x faster in dev mode |
| Animation | Motion + Lottie | GSAP | GSAP plugin licensing is restrictive; Motion + CSS covers the use cases cleanly |
| Animation | Motion + Lottie | CSS only | CSS alone cannot handle the character/mascot animations that make kids apps engaging |
| TTS | Pre-recorded MP3 | Web Speech API (primary) | Robot voices kill the tone; pre-recorded narration is a core quality requirement |
| Storage | Dexie + localStorage | localStorage only | localStorage is synchronous and not designed for structured data; IndexedDB handles growth without performance degradation |
| Storage | Dexie + localStorage | Firebase/Supabase | No backend in v1; introduces auth and network dependencies |
| CSS | Tailwind 4 | styled-components | Runtime CSS-in-JS adds overhead; Tailwind 4 is zero-runtime and integrates natively with Vite |
| Math render | Styled HTML components | KaTeX | KaTeX is 300 KB of overhead for content that is representable with plain Unicode and CSS |
| State | React Context | Redux | Redux is over-engineered for this app's state complexity; Context + useReducer is sufficient |
## Critical Installation Notes
# Core
# Styling
# Dev / testing
## Safari / iPadOS Gotchas (Critical)
## Sources
- React 19.2 release: https://react.dev/versions (verified)
- Tailwind CSS v4 announcement: https://tailwindcss.com/blog/tailwindcss-v4 (verified, January 22, 2025)
- React project setup recommendations: https://react.dev/learn/start-a-new-react-project (verified)
- Safari storage quotas and eviction: MDN Storage_API/Storage_quotas_and_eviction_criteria (verified — 7-day eviction, 60% disk quota on iOS 17+)
- Web Speech API baseline support: MDN SpeechSynthesis (verified — "Baseline Widely Available" since September 2018)
- React hooks reference: https://react.dev/reference/react/hooks (verified)
- GSAP licensing: training data, MEDIUM confidence — verify at https://gsap.com/licensing/ before adopting
- Dexie.js version, Framer Motion/Motion version, Howler.js version, KaTeX version: training data, MEDIUM confidence — verify exact versions via npm at project start
- Vite 6 current stable: training data MEDIUM confidence — verify via https://vitejs.dev
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
