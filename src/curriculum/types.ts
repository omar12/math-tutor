// Canonical topic union — used by curriculum data and Dexie db schema
export type Topic = 'addition' | 'subtraction' | 'word-problems'

// --- Lesson anatomy ---

export interface LessonStep {
  text: string            // narration display text for this step
  narrationAudio: string  // e.g. '/audio/lessons/addition-grade1-01/step-1.mp3'
  equation?: string       // optional Unicode expression e.g. '3 + 4 = ?' — absent for intro/transition steps
}

export interface WorkedExample {
  steps: LessonStep[]     // ordered steps; Phase 3 advances sequentially
}

export interface Lesson {
  id: string              // human-readable slug e.g. 'addition-grade1-01'
  title: string
  grade: 1 | 2 | 3
  topic: Topic
  order: number           // sort order within grade+topic combination
  ccStandards: string[]   // e.g. ['1.OA.A.1', '1.OA.C.6']
  workedExample: WorkedExample
}

// --- Problem discriminated union ---

interface BaseProblem {
  id: string
  lessonId: string        // foreign key → Lesson.id
  grade: 1 | 2 | 3
  topic: Topic
  question: string        // full question text; word problem text for topic='word-problems'
  answer: number          // Phase 4 compares user input to this with ===
}

export interface MultipleChoiceProblem extends BaseProblem {
  type: 'multiple-choice'
  choices: number[]       // unordered; Phase 4 shuffles at render time; always 4 choices
}

export interface DigitGridProblem extends BaseProblem {
  type: 'digit-grid'
}

export type Problem = MultipleChoiceProblem | DigitGridProblem

// --- Curriculum root ---

export interface CurriculumData {
  lessons: Lesson[]
  problems: Problem[]
}
