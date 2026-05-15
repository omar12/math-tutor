import { describe, it, expect } from 'vitest'
import { curriculum } from './index'

describe('curriculum data integrity', () => {

  // --- Structure ---

  it('has at least 18 lessons', () => {
    expect(curriculum.lessons.length).toBeGreaterThanOrEqual(18)
  })

  it('has no duplicate lesson IDs', () => {
    const lessonIds = new Set(curriculum.lessons.map(l => l.id))
    expect(lessonIds.size).toBe(curriculum.lessons.length)
  })

  it('has no duplicate problem IDs', () => {
    const ids = curriculum.problems.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every problem.lessonId resolves to a real lesson', () => {
    const lessonIds = new Set(curriculum.lessons.map(l => l.id))
    for (const p of curriculum.problems) {
      expect(lessonIds.has(p.lessonId), `problem ${p.id} references unknown lessonId ${p.lessonId}`).toBe(true)
    }
  })

  // --- CURR-01: Common Core coverage ---

  it('covers grade 1 addition and subtraction', () => {
    const g1addition = curriculum.lessons.filter(l => l.grade === 1 && l.topic === 'addition')
    const g1subtraction = curriculum.lessons.filter(l => l.grade === 1 && l.topic === 'subtraction')
    expect(g1addition.length, 'need at least 2 grade 1 addition lessons').toBeGreaterThanOrEqual(2)
    expect(g1subtraction.length, 'need at least 2 grade 1 subtraction lessons').toBeGreaterThanOrEqual(2)
  })

  it('covers grade 2 addition and subtraction', () => {
    const g2addition = curriculum.lessons.filter(l => l.grade === 2 && l.topic === 'addition')
    const g2subtraction = curriculum.lessons.filter(l => l.grade === 2 && l.topic === 'subtraction')
    expect(g2addition.length, 'need at least 2 grade 2 addition lessons').toBeGreaterThanOrEqual(2)
    expect(g2subtraction.length, 'need at least 2 grade 2 subtraction lessons').toBeGreaterThanOrEqual(2)
  })

  it('covers grade 3 addition and subtraction', () => {
    const g3addition = curriculum.lessons.filter(l => l.grade === 3 && l.topic === 'addition')
    const g3subtraction = curriculum.lessons.filter(l => l.grade === 3 && l.topic === 'subtraction')
    expect(g3addition.length, 'need at least 2 grade 3 addition lessons').toBeGreaterThanOrEqual(2)
    expect(g3subtraction.length, 'need at least 2 grade 3 subtraction lessons').toBeGreaterThanOrEqual(2)
  })

  it('all lessons have at least one Common Core standard ID', () => {
    for (const lesson of curriculum.lessons) {
      expect(lesson.ccStandards.length, `lesson ${lesson.id} has empty ccStandards`).toBeGreaterThan(0)
    }
  })

  it('all lesson ccStandards match known grade 1-3 addition/subtraction standard prefixes', () => {
    const validPrefixes = ['1.OA', '2.OA', '3.NBT', '3.OA']
    for (const lesson of curriculum.lessons) {
      for (const std of lesson.ccStandards) {
        const valid = validPrefixes.some(p => std.startsWith(p))
        expect(valid, `lesson ${lesson.id} has invalid ccStandard: ${std}`).toBe(true)
      }
    }
  })

  // --- CURR-02: Narration and word problems ---

  it('every lesson step has a non-empty narrationAudio path', () => {
    for (const lesson of curriculum.lessons) {
      for (const step of lesson.workedExample.steps) {
        expect(step.narrationAudio.length, `lesson ${lesson.id} has a step with empty narrationAudio`).toBeGreaterThan(0)
      }
    }
  })

  it('every lesson step narrationAudio follows /audio/lessons/{lessonId}/step-{N}.mp3 convention', () => {
    for (const lesson of curriculum.lessons) {
      for (const step of lesson.workedExample.steps) {
        expect(step.narrationAudio).toMatch(/^\/audio\/lessons\/.+\/step-\d+\.mp3$/)
      }
    }
  })

  it('word-problems topic exists across all grades', () => {
    const g1wp = curriculum.lessons.filter(l => l.grade === 1 && l.topic === 'word-problems')
    const g2wp = curriculum.lessons.filter(l => l.grade === 2 && l.topic === 'word-problems')
    const g3wp = curriculum.lessons.filter(l => l.grade === 3 && l.topic === 'word-problems')
    expect(g1wp.length, 'need at least 2 grade 1 word-problem lessons').toBeGreaterThanOrEqual(2)
    expect(g2wp.length, 'need at least 2 grade 2 word-problem lessons').toBeGreaterThanOrEqual(2)
    expect(g3wp.length, 'need at least 2 grade 3 word-problem lessons').toBeGreaterThanOrEqual(2)
  })

  it('word problem questions are non-empty strings', () => {
    for (const p of curriculum.problems) {
      if (p.topic === 'word-problems') {
        expect(p.question.length).toBeGreaterThan(10)
      }
    }
  })

  // --- CURR-03: Schema integrity ---

  it('every lesson has at least one worked example step', () => {
    for (const lesson of curriculum.lessons) {
      expect(lesson.workedExample.steps.length, `lesson ${lesson.id} has empty steps`).toBeGreaterThan(0)
    }
  })

  it('every lesson has at least one linked problem', () => {
    for (const lesson of curriculum.lessons) {
      const count = curriculum.problems.filter(p => p.lessonId === lesson.id).length
      expect(count, `lesson ${lesson.id} has no linked problems`).toBeGreaterThan(0)
    }
  })

  it('multiple-choice problems have exactly 4 choices', () => {
    for (const p of curriculum.problems) {
      if (p.type === 'multiple-choice') {
        expect(p.choices.length, `problem ${p.id} needs 4 choices`).toBe(4)
      }
    }
  })

  it('multiple-choice problems have the correct answer in their choices', () => {
    for (const p of curriculum.problems) {
      if (p.type === 'multiple-choice') {
        expect(
          p.choices.includes(p.answer),
          `problem ${p.id}: answer ${p.answer} is not in choices ${JSON.stringify(p.choices)}`
        ).toBe(true)
      }
    }
  })

  it('all topic values are valid Topic literals', () => {
    const valid = new Set(['addition', 'subtraction', 'word-problems'])
    for (const lesson of curriculum.lessons) {
      expect(valid.has(lesson.topic), `lesson ${lesson.id} has invalid topic: ${lesson.topic}`).toBe(true)
    }
    for (const p of curriculum.problems) {
      expect(valid.has(p.topic), `problem ${p.id} has invalid topic: ${p.topic}`).toBe(true)
    }
  })

  it('all grade values are 1, 2, or 3', () => {
    const valid = new Set([1, 2, 3])
    for (const lesson of curriculum.lessons) {
      expect(valid.has(lesson.grade), `lesson ${lesson.id} has invalid grade: ${lesson.grade}`).toBe(true)
    }
    for (const p of curriculum.problems) {
      expect(valid.has(p.grade), `problem ${p.id} has invalid grade: ${p.grade}`).toBe(true)
    }
  })

})
