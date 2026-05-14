import raw from './curriculum.json'
import type { CurriculumData } from './types'

// satisfies = compile-time type check; does not cast or change the runtime value
export const curriculum = raw satisfies CurriculumData

export const lessons = curriculum.lessons
export const problems = curriculum.problems
