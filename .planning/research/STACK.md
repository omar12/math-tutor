# Technology Stack

**Project:** Kids Math Tutor (Grades 1–3, iPad-optimized)
**Researched:** 2026-05-12
**Target:** iPad Safari (iPadOS 17+), single-device, no backend

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| React | 19.2.x | UI framework | HIGH |
| TypeScript | 5.x | Type safety | HIGH |
| Vite | 6.x | Build tool / dev server | MEDIUM |
| React Router | 7.x | Client-side routing | HIGH |

**React 19.2** (latest stable as of December 2025, verified via react.dev) is the right choice here. The ecosystem around React for kid-focused edtech is the largest, meaning more animation libraries, audio tooling, and accessible component libraries target it first. React 19's `useActionState` and improved context handling reduce boilerplate for a progress-tracking app that doesn't need a heavy state management library.

**TypeScript** is non-negotiable for this app. Lesson content structures, progress records, and quiz state all have well-defined schemas. Catching shape mismatches at compile time prevents a class of bugs that are especially hard to debug in a stateful client app with no backend.

**Vite 6** over Next.js: The React team now recommends Next.js for new projects, but that recommendation is oriented toward server-rendered, full-stack apps. This app has no backend, no server rendering, no API routes, and no SSR benefit. Vite produces a fast, static SPA with a superior dev server experience. Using Next.js here adds significant conceptual overhead (server vs client components, deployment complexity) with no payoff. Build output is a static folder deployable to any CDN or served from a web server.

**React Router v7** provides file-based routing and a clean navigation model without requiring a server. Adequate for the lesson/practice/parent route structure.

---

### Animation

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Motion (formerly Framer Motion) | 12.x | UI transitions, character animation, feedback | MEDIUM |
| CSS animations + keyframes | — | Simple, performance-critical animations | HIGH |
| Lottie (`@lottiefiles/dotlottie-react`) | latest | Pre-designed character sequences | MEDIUM |

**Two-layer animation strategy** is the correct approach for this app, not a single tool:

**Layer 1 — Motion (Framer Motion):** Use for UI-level transitions: screen-to-screen slide/fade, button bounce feedback on tap, correct/wrong answer reveals, star/confetti reward sequences. Motion's declarative `animate`, `whileTap`, and `variants` API maps naturally to React. It uses the Web Animations API under the hood on modern browsers, so performance on iPad Safari is solid for UI elements. Do NOT use it to animate SVG character frames in a tight lesson loop — that is Layer 2 work.

**Layer 2 — Lottie (`@lottiefiles/dotlottie-react`):** Use for pre-designed, illustrator-authored character animations (a counting bear, a number line mascot, etc.). Lottie plays back JSON-encoded After Effects animations as SVG/canvas. The DotLottie format (`.lottie`) is smaller than classic `.json` Lottie. This is the industry standard for kids apps because it lets a designer control the animation fully without writing code. The React wrapper handles autoplay, loop, and speed control cleanly.

**Layer 3 — Plain CSS keyframes:** Use for anything requiring 60 fps reliability: the "counting objects" bounce, the number highlight pulse. CSS animations are entirely GPU-composited when using `transform` and `opacity`. They never block the main thread. This is the safest choice for tight educational feedback loops where a dropped frame feels wrong to a child.

**Do NOT use GSAP** as the primary animation library. GSAP's free tier no longer includes all plugins (ScrollTrigger, MorphSVG, etc. require a paid license). The license terms around distribution in products have historically caused confusion. For this app's animation needs, Motion + Lottie + CSS is a complete solution with no licensing risk.

---

### Audio / Narration

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Pre-recorded MP3 audio files | — | Lesson narration | HIGH |
| Web Speech API (`SpeechSynthesis`) | — | Supplementary/dynamic TTS fallback | MEDIUM |
| Howler.js | 2.x | Audio playback management | MEDIUM |

**Pre-recorded audio is the correct primary strategy.** The project requires "animated, narrated lessons" with an engaging, encouraging tone targeted at kids aged 6–9. Web Speech API (`SpeechSynthesis`) voices — even the best iOS "Siri" voices — sound robotic and flat. A pre-recorded voice by an actual narrator (or generated with ElevenLabs and then baked into the asset bundle) produces warmth, pacing, and enthusiasm that robotic TTS cannot match. For a kids tutor, audio quality is a UX differentiator, not a nice-to-have.

**Practical approach:** Record or generate ~100–200 narration clips covering lesson explanations and feedback phrases ("Great job!", "Let's try again!", "3 plus 4 equals..."). Store as MP3 files. This is a one-time asset production effort. Total audio asset size for grades 1–3 content (addition, subtraction, word problems) will be roughly 5–15 MB — well within acceptable app bundle size.

**Web Speech API as fallback only:** Safari on iOS does support `SpeechSynthesis` (marked "Baseline Widely Available" by MDN since September 2018). However, iOS Safari requires a user gesture to initiate audio — a known quirk. Use Web Speech API only for dynamically-generated feedback where pre-recording every number combination is impractical (e.g., reading a user-typed answer aloud). Do not rely on it as the primary narration mechanism.

**Howler.js** manages audio playback across browsers, handles the iOS audio context unlock (tap-to-enable audio), provides sprite support (multiple clips from one file), and manages concurrent audio. Without it, handling Safari's audio autoplay restrictions manually is error-prone. Howler solves the "audio not playing until user taps" issue cleanly.

**Do NOT use ElevenLabs directly in-app via API.** API calls in the browser expose your API key. Generate all needed audio offline, commit MP3s to the asset bundle. If you want ElevenLabs quality, use it during content authoring, not at runtime.

---

### State Management

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| React Context + useReducer | built-in | App-wide state (current lesson, session, PIN state) | HIGH |
| Zustand | 5.x | Optional: if Context re-render performance becomes an issue | MEDIUM |

For this app's complexity level, **React's built-in `useContext` + `useReducer`** is sufficient. The state graph is: current lesson step, current session score, global progress data (read from IndexedDB on mount), and parent PIN unlock state. None of this requires the cross-cutting update patterns that make external state managers worth their overhead.

**Add Zustand only if** Context causes visible re-render churn (e.g., animating a lesson while progress data updates). Zustand 5 has a stable, minimal API with a `persist` middleware that integrates well with localStorage for simple cases.

---

### Local Storage

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Dexie.js | 4.x | IndexedDB abstraction for structured progress data | HIGH |
| localStorage | native | Simple key/value config (PIN hash, last lesson ID) | HIGH |

**Use Dexie.js for progress data, localStorage for config.**

**Why IndexedDB over localStorage for progress:** Progress data is structured (per-topic attempt counts, error rates, timestamps per session). localStorage is synchronous and limited to strings — you would end up serializing/deserializing a large JSON blob on every read and write, which blocks the main thread. IndexedDB is async and can store structured objects natively. Dexie.js provides a typed, promise-based wrapper that makes IndexedDB usable without ceremony.

**The 7-day eviction risk is real (HIGH confidence, MDN-verified):** Safari will evict IndexedDB data for origins that have had no user interaction in 7+ days. This is documented behavior as of iOS 17+. For a child's daily math practice app, a family that skips a week will lose their child's progress. This is a known, documented risk. Mitigation strategies:
1. Export progress as a JSON string and offer a "Copy to clipboard" / share sheet option for parents to back up manually (no server required)
2. Display a warning in the parent section that data is stored on this device only and will be lost if the browser data is cleared
3. In a future milestone, add optional iCloud/server sync — but do not block v1 on this

**Why Dexie 4 specifically:** Dexie 4 introduced `useLiveQuery` (a React hook for reactive IndexedDB queries) and first-class TypeScript support. This makes the parent progress dashboard reactive — it re-renders automatically when new practice data is written — without any manual event plumbing.

**localStorage for config:** The parent PIN hash, theme preferences, and "last lesson played" pointer are tiny, read-once values. localStorage is the correct tool. Store the PIN as a salted hash (bcrypt or SHA-256 with a fixed salt) — never plain text.

---

### Math Content Rendering

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Styled JSX / Tailwind utilities | — | Math expression rendering | HIGH |
| KaTeX | 0.16.x | Optional: only if you introduce fractions or complex notation | MEDIUM |

**Do NOT use KaTeX or MathJax for grades 1–3 content.** This is the most important call in the stack. The math in this app is:

```
3 + 4 = ?
12 − 5 = ?
"Sam has 7 apples. He eats 3. How many are left?"
```

These are plain Unicode characters and HTML. Rendering `3 + 4 = ___` with a box for the answer requires a styled `<span>` and an `<input>`, not a LaTeX renderer. KaTeX adds 300 KB+ to the bundle, requires a separate CSS file, and renders math inside a Shadow DOM that is hard to style to match your kid-friendly design system. The correct approach is building a `<MathExpression>` component that renders styled HTML, with large touch-friendly digit elements.

**If the scope ever expands to fractions or more complex notation (deferred to future grades), add KaTeX 0.16.x at that point.** It is faster than MathJax, renders in the browser without server round-trips, and has good Safari support.

---

### iPad / Touch Optimization

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Tailwind CSS | 4.x | Utility-first styling, responsive layout | HIGH |
| CSS touch-action | native | Prevent scroll hijacking on interactive elements | HIGH |
| CSS `env(safe-area-inset-*)` | native | iPad notch / home bar safe areas | HIGH |

**Tailwind CSS 4** (released January 22, 2025, stable) is the right CSS framework. Its CSS-first configuration (`@import "tailwindcss"` with no `tailwind.config.js` required) simplifies setup. The native Vite plugin (`@tailwindcss/vite`) integrates with zero config. For an iPad-first app, Tailwind's responsive prefix system (`md:`, `lg:`) and the new container query support make it straightforward to build layouts that adapt to iPad screen sizes (768px, 1024px portrait/landscape).

**Touch interaction rules:**
- All interactive elements (buttons, answer tiles, number pads) must be minimum 44×44 CSS pixels — Apple's recommended minimum touch target
- Use `touch-action: manipulation` on interactive elements to suppress the 300ms tap delay on Safari
- Use `user-select: none` on lesson content to prevent text selection during drag interactions
- Test in both portrait (768×1024) and landscape (1024×768) orientations — lesson layouts must not break

**Safe areas:** iPads with Face ID have a home indicator bar. Use `padding-bottom: env(safe-area-inset-bottom)` on bottom navigation elements.

**Avoid:** Do not use `position: fixed` for the lesson card stack without testing scroll behavior in Safari — Safari's dynamic address bar changes the viewport height, causing layout jumps. Use `100dvh` (dynamic viewport height) instead of `100vh`.

---

### Build Tooling

| Technology | Version | Purpose | Confidence |
|------------|---------|---------|------------|
| Vite | 6.x | Development server, build, HMR | MEDIUM |
| TypeScript | 5.x | Type checking | HIGH |
| ESLint + Prettier | latest | Code quality | HIGH |
| Vitest | latest | Unit testing | MEDIUM |

**Vite 6** is the current stable major version (verified through available sources; exact release date not confirmed but aligns with Vite's release cadence). It provides sub-second HMR, first-class TypeScript support without a separate compilation step, and a Rollup-based production build optimized for modern browsers. For a static SPA with no server-side rendering, it is the correct tool.

**Vitest** for testing — it shares Vite's config and transform pipeline, meaning no separate Jest configuration. Unit test the lesson state machine (does the app advance correctly after a wrong answer? does it surface the right repetition topics?), the progress calculation logic, and the PIN verification.

**Do NOT use Create React App.** It is abandoned (last meaningful update 2022) and produces a slower dev experience than Vite.

---

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

---

## Critical Installation Notes

```bash
# Core
npm create vite@latest math-tutor -- --template react-ts
npm install react-router-dom
npm install motion
npm install @lottiefiles/dotlottie-react
npm install howler
npm install dexie

# Styling
npm install -D tailwindcss @tailwindcss/vite

# Dev / testing
npm install -D vitest @testing-library/react @testing-library/user-event
npm install -D eslint prettier
```

**Note on TypeScript types for Howler:** `@types/howler` is a community package; verify it is current at install time.

---

## Safari / iPadOS Gotchas (Critical)

These are not hypothetical — each has caused production regressions in iPad web apps:

1. **Audio autoplay blocked:** Safari blocks `AudioContext` and `Audio.play()` until a user gesture. Howler handles this, but all audio must be initialized from a tap handler. Do not attempt to play narration on page load before any user interaction.

2. **7-day storage eviction:** IndexedDB data is deleted after 7 days of no user interaction. This is verified, documented Safari behavior (MDN Storage quotas, iOS 17+). The parent section must surface a data backup / export option.

3. **`100vh` viewport bug:** Safari's dynamic toolbar shrinks/grows the visible area. `100vh` measures the maximum possible viewport. Use `100dvh` (dynamic viewport height, supported in Safari 15.4+) for full-screen lesson layouts.

4. **Web Speech API voice loading:** `SpeechSynthesis.getVoices()` returns an empty array on first call in Safari; voices load asynchronously. If using TTS as a fallback, listen for the `voiceschanged` event before attempting to use a specific voice.

5. **`position: fixed` + virtual keyboard:** On iPad, opening an on-screen number pad input may cause `position: fixed` elements to shift. Use CSS `env(keyboard-inset-height)` or avoid fixed positioning near inputs.

6. **Touch event propagation:** `onClick` on iPad Safari fires with a ~300ms delay unless `touch-action: manipulation` is applied. Apply it globally to all `button` and `[role="button"]` elements.

---

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
