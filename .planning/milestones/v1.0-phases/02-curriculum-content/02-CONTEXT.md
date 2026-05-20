# Phase 2: Curriculum & Content - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Define and populate the static JSON curriculum data contract that Phases 3 and 4 consume. Deliver `src/curriculum/curriculum.json` with a typed schema covering grade 1–3 addition, subtraction, and word problems — lessons with step-by-step worked examples and linked practice problems. No UI rendering. No audio files. Schema complete enough that Phase 3 can implement the lesson player and Phase 4 can implement the practice engine without revisiting this data structure.

Requirements in scope: CURR-01, CURR-02, CURR-03

</domain>

<decisions>
## Implementation Decisions

### Curriculum Hierarchy
- **D-01:** Flat `lessons[]` array with metadata fields (`grade`, `topic`, `order`) — not nested by grade/topic. Phase 3/4 filter by `grade` and `topic`. Simpler TypeScript types, easier to query.
- **D-02:** Practice problems in a separate top-level `problems[]` array, linked to their lesson via `lessonId`. Problems are not inline in lesson objects. Phase 4 can load all problems for a topic without loading lesson content.
- **D-03:** Curriculum lives at `src/curriculum/curriculum.json` — single file, imported as a TypeScript module via Vite's native JSON import. One import in Phase 3/4, TypeScript types wrap the imported data.

### Lesson Step Anatomy
- **D-04:** Each lesson step has: `{ text: string, narrationAudio: string }` — display text plus the relative path to the pre-recorded MP3 Phase 3 will play. No additional fields in v1.
- **D-05:** Worked example is `lesson.workedExample.steps[]` — an ordered array of steps. Phase 3 advances through them sequentially; kid taps to advance or replay. Directly satisfies LESS-01, LESS-02, LESS-03.
- **D-06:** Each step has an optional `equation?: string` field — plain Unicode string like `'3 + 4 = ?'` or `'3 + 4 = 7'`. Phase 3 renders it large alongside the step text. Optional because intro/transition steps don't need an equation displayed.

### Problem Schema
- **D-07:** Single problem schema with `type: 'multiple-choice' | 'digit-grid'` discriminant. `choices?: number[]` is only present when `type === 'multiple-choice'`. Phase 4 reads `type` and renders the appropriate input widget. Single TypeScript discriminated union.
- **D-08:** Correct answer stored as `answer: number`. For multiple-choice: `choices: number[]` (unordered; Phase 4 shuffles them). Phase 4 compares user selection to `answer`. No `answerIndex` — avoids fragility if choices are reordered.
- **D-09:** Each problem carries: `{ grade: 1|2|3, topic: 'addition'|'subtraction'|'word-problems', lessonId: string }`. Matches `topic` string values already in Dexie schema. Phase 4 filters by `topic` for adaptive practice (Phase 5). No `difficulty` field — adaptive logic is Phase 5 scope, over-engineered here.

### Word Problems
- **D-10:** Word problems use the same problem schema as numeric problems — distinguished by `topic: 'word-problems'`. The `question` field contains the full word problem text. The linked lesson's step `narrationAudio` paths cover CURR-02's narration requirement (same field, no separate narration field on problems).

### Claude's Discretion
- Specific lesson content (titles, step text, equation values) — Claude authors realistic grade 1–3 content aligned to Common Core
- Exact `lessonId` format (slug vs UUID) — use human-readable slugs like `'addition-grade1-01'`
- Number of lessons per topic/grade — aim for 2–3 lessons per grade per topic (18–27 total lessons) as a realistic v1 dataset
- `narrationAudio` paths — use a convention like `'/audio/lessons/{lessonId}/step-{N}.mp3'`; audio files don't exist yet (Phase 3 records them), but paths must be stable now
- TypeScript type file location — `src/curriculum/types.ts` alongside the JSON

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — CURR-01 (Common Core grade 1–3 scope), CURR-02 (word problems with narration), CURR-03 (data-driven, no code changes to add content)
- `.planning/ROADMAP.md` — Phase 2 success criteria; Phase 3 and 4 goals (downstream consumers of this data)

### Project Constraints
- `.planning/PROJECT.md` — Content scope (addition, subtraction, word problems grades 1–3 only); out of scope items
- `CLAUDE.md` — Tech stack; Vite JSON import support
- `src/db/db.ts` — Existing `topic: string` type in Session/TopicProgress interfaces; must match `'addition' | 'subtraction' | 'word-problems'`

### Phase 1 Decisions
- `.planning/phases/01-foundation/01-CONTEXT.md` — D-08: Dexie topic values; D-10/D-11: design tokens and font (TypeScript content types should use same visual tone)

No external ADRs — all schema decisions captured above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/db/db.ts` — `Session.topic` and `TopicProgress.topic` are typed as `string`; the curriculum schema's `topic` values (`'addition' | 'subtraction' | 'word-problems'`) must be a literal union that matches what Dexie stores. Phase 2 defines the canonical union type.

### Established Patterns
- JSON imported via Vite: `import curriculum from './curriculum.json'` — Vite handles this natively, no loader config needed
- TypeScript strict mode is on (from Vite template) — curriculum types must be fully typed, no `any`

### Integration Points
- `src/curriculum/curriculum.json` → imported by Phase 3's LessonScreen and Phase 4's PracticeScreen
- `src/curriculum/types.ts` → exports `Lesson`, `LessonStep`, `Problem`, `Topic` union — imported by Phase 3/4 components and by Dexie session recording in Phase 5
- The `lessonId` on problems links back to `lesson.id` — this ID will also be stored as `appConfig.lastLessonId` (already in Dexie schema) for resuming where the child left off

</code_context>

<specifics>
## Specific Ideas

- Narration audio paths should be stable placeholders now (`/audio/lessons/{lessonId}/step-{N}.mp3`) even though recordings don't exist until Phase 3 — prevents schema changes mid-project
- Lesson IDs as human-readable slugs (`'addition-grade1-01'`) make the JSON easy to author and debug
- Grade 1–3 Common Core addition/subtraction standards to cover: 1.OA, 2.OA, 3.OA (operations and algebraic thinking)
- Word problems should be realistic kids-level scenarios (e.g., "Mia has 3 apples. She gets 4 more. How many apples does she have?") — same warm tone as Remy the Fox mascot

</specifics>

<deferred>
## Deferred Ideas

- `difficulty: 'easy' | 'medium' | 'hard'` on problems — useful for adaptive practice but adaptive logic is Phase 5; add to schema in Phase 5 if needed
- Multiple narration takes per step (retry audio variants) — Phase 3 concern, not data schema
- Lesson completion tracking schema — not in v1 requirements; deferred to v2 (PROG-V2-01)
- Curriculum versioning / migration strategy — deferred to Phase 6 or v2

</deferred>

---

*Phase: 2-Curriculum & Content*
*Context gathered: 2026-05-13*
