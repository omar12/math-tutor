import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLessonAudio } from './useLessonAudio'
import { Howl } from 'howler'
import type { LessonStep } from '../curriculum/types'

const mockSteps: LessonStep[] = [
  { text: 'Step 1', narrationAudio: '/audio/step-1.mp3' },
  { text: 'Step 2', narrationAudio: '/audio/step-2.mp3' },
  { text: 'Step 3', narrationAudio: '/audio/step-3.mp3' },
]

describe('useLessonAudio', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('creates one Howl per step', () => {
    renderHook(() => useLessonAudio(mockSteps, vi.fn()))
    expect((Howl as ReturnType<typeof vi.fn>).mock.calls.length).toBe(3)
  })

  it('returns array of length matching steps', () => {
    const { result } = renderHook(() => useLessonAudio(mockSteps, vi.fn()))
    expect(result.current.length).toBe(3)
  })

  it('calls onStepEnded when onloaderror fires for a step', () => {
    const onStepEnded = vi.fn()
    renderHook(() => useLessonAudio(mockSteps, onStepEnded))
    const HowlMock = Howl as ReturnType<typeof vi.fn>
    HowlMock.mock.calls[0][0].onloaderror()
    expect(onStepEnded).toHaveBeenCalledTimes(1)
  })

  it('calls onStepEnded when onplayerror fires for a step', () => {
    const onStepEnded = vi.fn()
    renderHook(() => useLessonAudio(mockSteps, onStepEnded))
    const HowlMock = Howl as ReturnType<typeof vi.fn>
    HowlMock.mock.calls[1][0].onplayerror()
    expect(onStepEnded).toHaveBeenCalledTimes(1)
  })

  it('calls stop on all Howl instances when unmounted', () => {
    const { result, unmount } = renderHook(() => useLessonAudio(mockSteps, vi.fn()))
    const howls = result.current
    unmount()
    howls.forEach(h => expect(h.stop).toHaveBeenCalled())
  })
})
