# Phase 2: Curriculum & Content - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 2-Curriculum & Content
**Areas discussed:** Curriculum hierarchy, Lesson step anatomy, Problem schema

---

## Curriculum Hierarchy

| Option | Description | Selected |
|--------|-------------|----------|
| Grade → Topic → Lessons (nested) | curriculum.grade1.addition.lessons[] | |
| Flat array with metadata | lessons[] where each has {grade, topic, order} | ✓ |
| One file per topic | addition.json, subtraction.json, word-problems.json | |

**User's choice:** Flat array with metadata

---

| Option | Description | Selected |
|--------|-------------|----------|
| Lessons contain problems inline | Each lesson has problems[] | |
| Separate problems array, linked by lessonId | Top-level problems[] array | ✓ |
| Completely separate files | lessons.json and problems.json | |

**User's choice:** Separate problems array, linked by lessonId

---

| Option | Description | Selected |
|--------|-------------|----------|
| src/curriculum/curriculum.json | Single JSON, Vite JSON import | ✓ |
| public/curriculum.json | Fetched at runtime | |
| src/curriculum/ directory with index.ts | TypeScript barrel | |

**User's choice:** src/curriculum/curriculum.json

---

## Lesson Step Anatomy

| Option | Description | Selected |
|--------|-------------|----------|
| Text + narration audio path | { text, narrationAudio } | ✓ |
| Text + narration + visual hint flag | Adds visualHint field | |
| Text only | Narration deferred to Phase 3 | |

**User's choice:** Text + narration audio path

---

| Option | Description | Selected |
|--------|-------------|----------|
| Lesson has steps[] of sequential steps | lesson.workedExample.steps[] | ✓ |
| Lesson has single explanation block | One narrated block | |
| Lesson references steps file by ID | Separate stepsById map | |

**User's choice:** steps[] of sequential steps

---

| Option | Description | Selected |
|--------|-------------|----------|
| Optional equation field | step.equation?: string | ✓ |
| Equation embedded in text | Part of step.text | |
| Structured equation object | { operand1, operator, operand2, result? } | |

**User's choice:** Optional equation field (Unicode like '3 + 4 = ?')

---

## Problem Schema

| Option | Description | Selected |
|--------|-------------|----------|
| type field on shared schema | type: 'multiple-choice' \| 'digit-grid' | ✓ |
| Separate arrays | multipleChoice[] and digitGrid[] | |
| All as multiple-choice for now | Defer digit-grid distinction | |

**User's choice:** type field on shared schema

---

| Option | Description | Selected |
|--------|-------------|----------|
| answer: number, choices: number[] | Phase 4 shuffles, compares to answer | ✓ |
| answerIndex: number, choices: number[] | Index-based, fragile to reorder | |
| correctChoice: string, choices: string[] | String labels | |

**User's choice:** answer: number, choices: number[]

---

| Option | Description | Selected |
|--------|-------------|----------|
| grade + topic + lessonId | Matches Dexie topic values | ✓ |
| grade + topic + lessonId + difficulty | Adds difficulty field | |
| lessonId only | Minimal, extra join needed | |

**User's choice:** grade + topic + lessonId (no difficulty — Phase 5 concern)

---

## Claude's Discretion

- Specific lesson content (titles, step text, equation values) — author realistic grade 1–3 content aligned to Common Core
- Exact lessonId format — human-readable slugs like `'addition-grade1-01'`
- Number of lessons per topic/grade — 2–3 per grade per topic (~18–27 total)
- narrationAudio path convention — `/audio/lessons/{lessonId}/step-{N}.mp3`
- TypeScript type file location — `src/curriculum/types.ts`

## Deferred Ideas

- `difficulty` field on problems — useful for Phase 5 adaptive logic; add when needed
- Multiple narration takes per step — Phase 3 concern
- Lesson completion tracking — v2 scope
- Curriculum versioning — Phase 6 or v2
