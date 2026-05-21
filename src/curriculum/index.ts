import raw from './curriculum.json'
import type { CurriculumData } from './types'

// JSON imports infer broad types (number, string) — cast to CurriculumData since the data is correct
export const curriculum = raw as unknown as CurriculumData

export const lessons = curriculum.lessons
export const problems = curriculum.problems
