# Domain Pitfalls

**Domain:** Kids math tutor web app — iPad Safari, grades 1–3, ages 6–9
**Researched:** 2026-05-12
**Confidence:** HIGH (Safari/storage pitfalls from MDN + WebKit official docs), MEDIUM (curriculum/UX from established design literature), MEDIUM (security/PIN from first-principles analysis)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or the app being unusable for its audience.

---

### Pitfall 1: Audio Autoplay Blocked by Safari — Lesson Narration Is Silent on Launch

**What goes wrong:** The animated, narrated lesson starts playing its animation but the audio narrator is completely silent. The app calls `audioElement.play()` or initializes an `AudioContext` outside a user-gesture handler, which Safari on iPadOS blocks unconditionally. The error is silent — `play()` returns a rejected Promise that, if uncaught, looks like success.

**Why it happens:** Safari enforces a strict autoplay policy: audio cannot begin unless triggered directly inside a synchronous user-gesture event handler (tap, click). Creating an `AudioContext` at module load time produces a context in `suspended` state. Calling `.play()` on an `<audio>` element from a `useEffect`, `componentDidMount`, or any timer fails silently. This policy has been enforced since iOS 10 and has not relaxed as of Safari 17.

**Consequences:** The entire narrated lesson feature — the core value proposition — is broken. Kids see animations without voice, which is confusing and eliminates the educational value of the narration. This often goes undetected in desktop development because Chrome and Firefox are more permissive.

**Prevention:**
- Gate all audio initialization behind a deliberate user gesture. The "Start Lesson" or "Play" button tap must be the synchronous trigger that calls `audioContext.resume()` or `audioElement.play()`.
- If using Web Audio API, create the `AudioContext` once inside that first user tap, not at app initialization.
- If using `<audio>` elements, call `.play()` only inside a `touchend` or `click` handler.
- Add a global audio-unlock pass on first app tap: create a 0-duration silent buffer and play it — this unlocks the context for all subsequent programmatic audio in that session.
- Test autoplay exclusively on a real iPad or iPad Simulator, not Chrome desktop.

**Warning signs:**
- Audio plays fine in Chrome desktop development but is silent on iPad.
- Console shows `NotAllowedError: The request is not allowed by the user agent or the platform in the current context`.
- `audioContext.state` is `"suspended"` after app initialization.

**Phase:** Must be addressed in the lesson player phase (animated narrated lessons). Build the audio unlock pattern before implementing any lesson content.

---

### Pitfall 2: localStorage Evicted After 7 Days Without App Use — Child Loses All Progress

**What goes wrong:** A family goes on vacation for two weeks. When the child returns to the app, all progress is gone. The app silently discarded the data.

**Why it happens:** Safari's Intelligent Tracking Prevention (ITP) and storage eviction policies delete script-writable storage (localStorage, IndexedDB, Cache API, Service Worker registrations) from origins that have received no user interaction within the past 7 days. This is documented behavior, not a bug. It applies to the web content (not server-set cookies, which are exempt). On top of ITP, Safari applies an LRU eviction policy under storage pressure, preferring to delete data from least-recently-used origins first.

Separately: localStorage has a hard 10 MiB cap per origin. For a progress-tracking app storing detailed per-topic error history, this cap is reachable if the data model is naive (e.g., storing every individual problem attempt as a separate JSON blob).

**Consequences:** The parent-facing progress dashboard becomes worthless — data disappears unpredictably. Trust in the app evaporates. This is likely the single most common "it just stopped working" complaint for no-backend educational apps.

**Prevention:**
- Store progress in IndexedDB (not raw localStorage) for better structure and quota management. IndexedDB is also subject to the 7-day policy but handles larger, richer datasets before hitting quota.
- Display a clear, friendly "It looks like it's been a while!" message when data is missing, rather than showing an empty state that looks like a bug.
- Design the data model for compactness from day one: store aggregate counts and rolling stats (e.g., `{topic: "addition_under_10", attempts: 24, correct: 19, lastSeen: "2026-04-30"}`) rather than full per-attempt logs.
- The app should survive a data wipe gracefully: treat missing storage as a fresh start, not an error state.
- In the parent section, add a prominent note: "Progress is stored on this device. If Safari is not opened for 7+ days, the browser may clear this data."
- Do NOT promise data persistence in marketing or onboarding copy.

**Warning signs:**
- Data model stores full problem-attempt records instead of aggregates.
- No try/catch around localStorage or IndexedDB writes.
- `QuotaExceededError` appears in production error logs.

**Phase:** Data model design must happen before the progress-tracking phase. Storage architecture decisions cannot be changed cheaply after the practice problem system is built.

---

### Pitfall 3: `100vh` Layout Breaks When iPad Keyboard Appears for Answer Input

**What goes wrong:** The answer input field is at the bottom of the screen. When the child taps it, the software keyboard appears, shrinks the visual viewport, and either (a) the input field is hidden behind the keyboard, or (b) the entire layout shifts and elements overlap. The child cannot see what they are typing.

**Why it happens:** On iOS/iPadOS Safari, `100vh` is calculated using the layout viewport, which includes the area behind the browser chrome (address bar, etc.). When the software keyboard appears, the visual viewport shrinks but the layout viewport does not change, so `100vh` elements overflow the visible screen. This is a known, long-standing WebKit behavior.

**Consequences:** Kids cannot type answers. A workaround of tapping outside to dismiss the keyboard becomes necessary — completely defeating the interaction design.

**Prevention:**
- Use `100dvh` (dynamic viewport height) instead of `100vh` for full-screen layouts. `dvh` updates when the visual viewport changes. Supported in Safari 16+.
- For answer input, strongly prefer large tap-target custom buttons (A/B/C/D multiple choice, number pad built from `<button>` elements) over native `<input>` fields. This avoids the keyboard entirely for most answer types, which is also better UX for 6-9 year olds who struggle with iOS keyboard behavior.
- If text input is required for typing numeric answers, use `<input type="text" inputmode="numeric" pattern="\d*">` rather than `<input type="number">` — this avoids the spinner UI, is more accessible (no `spinbutton` ARIA role), and gives more control over validation feedback.
- Add `viewport-fit=cover` to the viewport meta tag and use `env(safe-area-inset-bottom)` for bottom padding.

**Warning signs:**
- App layout uses `height: 100vh` for the main container.
- Any `<input>` field appears in the lower 40% of the screen.
- Layout was only tested with external keyboard, not software keyboard.

**Phase:** Address in the initial app shell / layout phase. Retrofitting viewport handling after content is built is expensive.

---

### Pitfall 4: Audio/Animation Sync Drifts — Narration and Visuals Fall Out of Step

**What goes wrong:** The narration says "now the apple disappears" but the animation hasn't reached that keyframe yet, or has already passed it. On slower/older iPads (iPad 6th gen, Mini 4), animation frames drop under CPU load, but audio playback continues at wall-clock time. The two tracks diverge.

**Why it happens:** CSS/JS animations are tied to the rendering pipeline and can be throttled or dropped when the main thread is busy or the device is thermal-throttled. Audio plays independently on a dedicated thread and maintains wall-clock accuracy. There is no built-in browser primitive that ties animation progress to audio position.

**Consequences:** The lesson becomes incoherent. Kids lose the connection between the visual and verbal explanation, which is the entire pedagogical mechanism.

**Prevention:**
- Design lessons as audio-driven, not animation-driven. The audio track is the authoritative timeline. Animations are triggered by audio `timeupdate` events or by cue points embedded in the audio's metadata, not by CSS `animation-duration` alone.
- Use Web Audio API's `AudioContext.currentTime` as the master clock. Schedule animation state changes relative to audio position, not wall-clock `setTimeout`.
- Keep individual animation segments short (under 3 seconds). Long continuous animations that must sync with narration are high-risk.
- Prefer CSS transitions triggered by class changes (driven by audio cue points) over `@keyframes` animations with `animation-delay` — the former is event-driven, the latter is timing-dependent.
- Test on iPad 6th gen (A10 chip) under realistic conditions: screen brightness high, multiple apps in background.

**Warning signs:**
- Animations use `animation-delay` to sequence steps that correspond to narration lines.
- Lesson timing is hardcoded in CSS, not derived from audio duration.
- No mechanism to pause animation when audio is paused.

**Phase:** Lesson player architecture phase. The sync model must be a first-class design decision, not retrofitted.

---

## Moderate Pitfalls

Mistakes that degrade quality significantly but don't require a full rewrite.

---

### Pitfall 5: PIN Protection Is Easily Bypassed by Curious 7-Year-Olds

**What goes wrong:** The child discovers the parent section. They watch a parent enter the 4-digit PIN once and memorize it. Or the PIN entry field shows entered digits briefly before masking. Or the parent section is reachable by back-navigating in browser history after the parent logs out.

**Why it happens:** PIN protection on a shared device is low-security by design (the requirements correctly scope this as convenience gating, not true security). But even at that low bar, common implementation mistakes let kids through.

**Consequences:** A child seeing their own "struggle" data in the parent view is not catastrophic. But a child who can modify or read parent-set goals/settings undermines the tool's value for parents.

**Prevention:**
- Mask PIN digits immediately on entry (use `type="password"` or replace character with `•` within 300ms of tap).
- After exiting the parent section, fully clear the PIN state and do not allow browser back-navigation to re-enter without PIN re-entry. Use `history.replaceState` to remove parent routes from history.
- Rate-limit PIN attempts: after 3 wrong attempts, show a 30-second lockout with a friendly message ("Ask a grown-up to try again in a moment"). This also prevents brute-force by persistent kids.
- Avoid PINs shorter than 4 digits (too easy to guess); avoid requiring 6+ digits (parent friction too high).
- Do not log the PIN attempt count to localStorage in a way a child could reset by clearing app data.
- The PIN itself should be stored as a bcrypt or SHA-256 hash, never plaintext, even in localStorage.

**Warning signs:**
- PIN input shows digits un-masked.
- Parent section is reachable via URL path without re-authentication.
- PIN is stored as plaintext in localStorage.

**Phase:** Parent section implementation phase.

---

### Pitfall 6: Word Problem Language Is Too Hard for Non-Readers (Grade 1)

**What goes wrong:** A word problem reads: "Sarah has 14 apples. She gives 6 apples to her friend Marcus. How many apples does Sarah have now?" A first-grader (age 6) may not yet be a fluent reader. The math (14−6) is appropriate for grade 1, but parsing the sentence is not. The child stares at the text, gets frustrated, and either guesses randomly or abandons the problem.

**Why it happens:** Curriculum designers often set difficulty by math operation complexity without accounting for reading complexity. The Flesch-Kincaid readability of word problems is frequently several grade levels above the target math grade.

**Consequences:** The adaptive system misidentifies reading difficulty as math difficulty and routes the child toward easier math problems they don't need. Parent reports show "struggles with word problems" when the actual issue is reading, not arithmetic.

**Prevention:**
- For grade 1 word problems: sentence length ≤ 8 words, one clause only, use only Dolch sight words (kindergarten/grade 1 list), and provide narration that reads the problem aloud — kids should never have to read word problems themselves.
- For grade 2: allow compound sentences, up to 12 words, narration remains critical.
- For grade 3: allow light context ("Maria baked some cookies..."), but narration still reads the problem.
- Narration of word problems is not optional for grades 1–2 — it is the primary access mechanism.
- Test word problems with a sample of 6-7 year olds, not just adults. What reads as "simple" to an adult often is not.
- Separate "reading comprehension difficulty" from "math difficulty" in the data model so the adaptive system can account for both independently.

**Warning signs:**
- Word problems written by adults without child readability testing.
- Word problem text contains multi-syllable words not on the Dolch sight word list.
- No narration for word problems (treating them as text-only like a worksheet).

**Phase:** Curriculum content design phase, before any problem content is authored.

---

### Pitfall 7: Frustration Loops — No Escalation Path When Child Repeatedly Fails

**What goes wrong:** A child gets the same problem wrong 3, 4, 5 times. The app plays a gentle "try again" sound each time and re-presents the identical problem. The child begins crying or rage-tapping. The parent has to physically intervene.

**Why it happens:** Adaptive systems are often designed around the happy path (getting things right) and the average path (missing once, then correcting). The failure mode — a child who is completely stuck — is underspecified. The "adaptive" label creates false confidence that the system handles all cases.

**Consequences:** Emotional distress that associates the app with frustration. Parents who observe one of these episodes often uninstall the app.

**Prevention:**
- After 2 consecutive wrong answers on the same problem, show a "hint" (reveal one answer choice that is definitely wrong in a multiple-choice problem, or animate a counting visual).
- After 3 consecutive wrong answers, automatically show the solution with a narrated explanation, then move to the next problem. Never trap a child in an infinite retry loop.
- Distinguish between "wrong answer" and "no answer" (time elapsed without input). A child who has not answered in 45 seconds is likely stuck, not still thinking.
- The encouragement messages after a wrong answer should be short, warm, and non-repetitive. Hearing the same "Oh no, try again!" message 4 times in a row is maddening for children.
- Track consecutive failure streaks: if a child fails 5+ problems in a session, surface a "That was a lot of hard work — great job trying! Maybe come back tomorrow" message and offer to end the session.

**Warning signs:**
- Problem retry logic has no maximum attempt limit.
- "Wrong answer" state routes directly back to the same problem unconditionally.
- Encouragement messages are hardcoded strings repeated each time.

**Phase:** Practice problem engine phase. Retry logic and failure escalation must be built alongside the first problem types, not added later.

---

### Pitfall 8: Animation Jank on Older iPads Under Memory Pressure

**What goes wrong:** The lesson animations run smoothly during development (on a modern iPad Pro with M-series chip), but stutter and drop frames on an iPad 6th or 7th generation (A10 chip, 3 GB RAM). Under memory pressure from other apps, the browser tab may even be killed and refreshed mid-lesson.

**Why it happens:** Several common mistakes compound: animating CSS properties that trigger layout recalculation (`width`, `height`, `top`, `left`, `margin`) rather than `transform` and `opacity`; loading multiple large audio files into memory simultaneously; unoptimized SVG animations with complex path calculations; and Lottie animations with high frame-count JSON files (> 500 KB).

**Consequences:** The lesson experience is broken for the portion of the user base on older hardware, which in an education app context (families who have a "house iPad" that is several years old) may be a substantial portion.

**Prevention:**
- Animate only `transform` and `opacity` for all character/object motion. Never animate width, height, top, left, or margin.
- Use `will-change: transform` sparingly — only on elements actively animating, removed after animation ends. Overuse increases VRAM consumption.
- For character animations, prefer CSS sprite sheets or short SVG SMIL animations over Lottie for simple motions. If using Lottie, set target render quality and cap file sizes to 200 KB per animation scene.
- Lazy-load audio assets: only load the audio file for the current lesson segment. Do not pre-load all lesson audio at once.
- Test the complete app on an iPad 7th generation (or iPad Mini 4 equivalent A-series chip) before any phase is considered complete.
- Use `requestAnimationFrame` for any JavaScript-driven animation; never `setTimeout` or `setInterval` for visual updates.

**Warning signs:**
- Development device is an M-series iPad Pro.
- Lottie animation JSON files exceed 200 KB.
- `will-change: transform` applied to all animated elements globally.
- Audio files preloaded in `componentDidMount` for the entire lesson.

**Phase:** Lesson player implementation phase. Performance budget must be set and enforced from the start.

---

### Pitfall 9: Safe Area / Notch Clipping on iPad With Home Bar

**What goes wrong:** On iPad models with a home indicator (iPad Pro with Face ID, iPad Air 5th gen+), interactive elements at the very bottom of the screen — "Next" buttons, answer choices — are visually inside the safe area but rendered behind the home indicator bar or within the system gesture region. Taps on those elements are intercepted by the system gesture.

**Why it happens:** Developers test on older iPads with a physical home button where `safe-area-inset-bottom` is 0. The layout looks fine. On home-bar iPads, `safe-area-inset-bottom` is approximately 34pt, and elements placed at `bottom: 0` are in the gesture rejection zone.

**Prevention:**
- Add the `viewport-fit=cover` meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- Apply `padding-bottom: env(safe-area-inset-bottom)` to any sticky bottom UI container.
- Apply `padding-top: env(safe-area-inset-top)` to any element using the top edge (needed for Face ID notch on iPad Pro 11" M4 in landscape).
- Include fallback values: `padding-bottom: max(1rem, env(safe-area-inset-bottom))`.
- Test on an iPad Pro 11" or 13" with Face ID in both portrait and landscape orientations.

**Warning signs:**
- Viewport meta tag does not include `viewport-fit=cover`.
- Bottom navigation or answer buttons positioned with `bottom: 0` without safe area padding.
- Only tested on iPad with physical home button.

**Phase:** App shell / layout phase. Must be in the initial CSS foundation.

---

## Minor Pitfalls

Mistakes that cause friction or quality issues but are straightforward to fix.

---

### Pitfall 10: Touch Targets Too Small for 6-Year-Old Fine Motor Skills

**What goes wrong:** Answer buttons, "Next" arrows, or star/reward icons are sized to Apple's 44×44pt minimum for adult HIG. A 6-year-old's finger is wider and motor control less precise — they tap the wrong button, get an incorrect mark on an answer they knew, and get frustrated.

**Prevention:**
- Use 60×60pt (80×80px at 1x) as the minimum touch target for answer choice buttons for ages 6–7. 44pt is the adult floor, not the child floor.
- Ensure at least 16pt of spacing between adjacent touch targets to prevent accidental double-taps.
- Use generous internal padding rather than making the visible element larger — the hit target can be larger than the visual affordance.

**Phase:** UI component design phase.

---

### Pitfall 11: Incorrect Use of `<input type="number">` for Answer Entry

**What goes wrong:** The child types their numeric answer into `<input type="number">`. iOS shows the full keyboard (not numeric-only), or shows the numeric keyboard with `+/-` and decimal point keys, which are confusing and allow invalid input. The browser's native increment/decrement spinners appear and children tap them accidentally.

**Prevention:**
- Use `<input type="text" inputmode="numeric" pattern="\d*">` for numeric answer inputs. This shows the iOS numeric keyboard (digits only, no decimal/sign) and avoids the spinbutton ARIA role.
- Better yet, avoid text input entirely for grades 1–2: use a custom tap-to-select number pad built from `<button>` elements. This eliminates keyboard-related layout shifts entirely.

**Phase:** Practice problem component phase.

---

### Pitfall 12: Color as the Only Differentiator for Correct/Incorrect Feedback

**What goes wrong:** Correct answers are highlighted green, incorrect answers red. Children with red-green color blindness (deuteranopia affects approximately 8% of boys) cannot distinguish the two states.

**Prevention:**
- Pair color feedback with a distinct icon (checkmark for correct, X for incorrect) and audio feedback. Never use color alone as the sole feedback channel.
- Ensure sufficient contrast: correct state color must meet WCAG AA (4.5:1) against the background, as must the incorrect state color.
- Test designs with a color blindness simulator (Sim Daltonism or browser DevTools accessibility tools).

**Phase:** Feedback/result UI component phase.

---

### Pitfall 13: PWA Standalone Mode Breaks Navigation and Shares Separate Storage

**What goes wrong:** If a parent adds the app to the iPad home screen (standalone PWA), two separate behaviors emerge: (1) there is no browser back button, so any in-app "back" navigation must be implemented explicitly or the child gets stuck; and (2) the standalone app's localStorage and IndexedDB are completely isolated from the same site accessed in Safari browser — progress stored in one context is invisible in the other.

**Prevention:**
- Implement explicit in-app navigation controls (back button, home button) that do not rely on browser chrome. This is good practice regardless of PWA mode.
- In onboarding, direct families to use the app exclusively through the home screen icon OR exclusively through Safari — not both. Document this clearly.
- If PWA installation is a goal, add a "Save to Home Screen" prompt with instructions, and store all data under the same access path the prompt was shown from.

**Phase:** App shell phase (navigation) and onboarding phase (user guidance).

---

### Pitfall 14: Curriculum Scope Creep Into Grade 4+ Content

**What goes wrong:** When building the grade 3 subtraction lessons, it becomes tempting to add "borrowing" (regrouping with 3-digit numbers) or multiplication as "bonus" content. The scope creep is gradual. By launch, the app covers more than planned, with earlier grades under-polished.

**Prevention:**
- Define hard content boundaries by grade level at the start: Grade 1 (add/subtract to 20), Grade 2 (add/subtract to 100, introduction of place value), Grade 3 (add/subtract to 1000, multi-step word problems). These align with Common Core standards.
- Any content outside addition, subtraction, and word problems for grades 1–3 requires explicit sign-off from the project owner.
- The curriculum backlog should be fixed, not a rolling wishlist.

**Phase:** Content planning phase. Lock scope before building the problem generation system.

---

### Pitfall 15: Storing PIN as Plaintext in localStorage

**What goes wrong:** The parent PIN is stored as-is in localStorage: `localStorage.setItem('parentPin', '1234')`. Any child who opens browser developer tools (or a sibling who knows to check application storage) can read it in 10 seconds.

**Prevention:**
- Hash the PIN before storage using `crypto.subtle.digest('SHA-256', encodedPin)`. The Web Crypto API is available in Safari 11+ (all relevant iPad versions). Compare hashes on entry, never the raw PIN.
- A 4-digit PIN has only 10,000 combinations — hashing does not make it cryptographically strong, but it removes the trivially discoverable plaintext value from storage.
- This project's threat model is a curious child on a family iPad, not a sophisticated attacker. The goal is plausible deniability and basic hygiene, not bank-level security.

**Phase:** Parent section implementation phase.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| App shell / layout | 100vh keyboard breakage, safe area clipping | Use `dvh`, `env(safe-area-inset-*)`, test on Face ID iPad |
| Lesson player — audio | Safari autoplay block, AudioContext suspension | Gate all audio on user gesture; test on real iPad, not Chrome |
| Lesson player — animation | Sync drift on older hardware, jank from non-GPU properties | Audio-driven timeline; only animate `transform`/`opacity` |
| Practice problem engine | Frustration loops, wrong input type for numerals | Enforce retry limits; use `inputmode="numeric"` or custom pad |
| Adaptive difficulty | Conflating reading difficulty with math difficulty | Separate readability from math complexity in data model |
| Word problem content | Language too complex for grade 1 readers | Enforce Dolch word list; narration mandatory for all word problems |
| Progress / storage | 7-day ITP eviction, quota exceeded | Use IndexedDB with compact data model; graceful empty-state handling |
| Parent section | PIN bypass, plaintext PIN storage | Hash PIN; rate-limit attempts; clear history on exit |
| Feedback UI | Color as sole correct/incorrect signal | Add icon + audio; meet WCAG AA contrast |
| Touch targets | 44pt targets too small for age 6 fine motor | Minimum 60pt for primary answer targets |

---

## Sources

- MDN Web Docs: Storage quotas and eviction criteria — `https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria` (HIGH confidence, official reference)
- MDN Web Docs: Web Audio API best practices — `https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices` (HIGH confidence, official reference)
- MDN Web Docs: CSS/JavaScript animation performance — `https://developer.mozilla.org/en-US/docs/Web/Performance/CSS_JavaScript_animation_performance` (HIGH confidence, official reference)
- MDN Web Docs: CSS env() — `https://developer.mozilla.org/en-US/docs/Web/CSS/env` (HIGH confidence)
- MDN Web Docs: Viewport concepts — `https://developer.mozilla.org/en-US/docs/Web/CSS/viewport_concepts` (HIGH confidence)
- MDN Web Docs: input type="number" — `https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number` (HIGH confidence)
- MDN Web Docs: Color contrast — `https://developer.mozilla.org/en-US/docs/Web/Accessibility/Understanding_WCAG/Perceivable/Color_contrast` (HIGH confidence, WCAG AA 4.5:1 requirement)
- Apple Developer Documentation: Delivering video content for Safari — autoplay policy (HIGH confidence)
- Apple Developer Documentation: Human Interface Guidelines — accessibility touch targets 44pt minimum (MEDIUM confidence, extrapolated for children to 60pt)
- Safari ITP 7-day storage eviction: documented in MDN storage eviction criteria page under "Proactive eviction" section (HIGH confidence)
- PWA isolated storage (standalone mode vs Safari browser): corroborated by multiple community sources (MEDIUM confidence — recommend testing on device)
- Dolch sight word curriculum boundaries: established reading education research (HIGH confidence)
- Common Core State Standards for grades 1-3 math operations: `https://www.corestandards.org/Math/` (HIGH confidence)
