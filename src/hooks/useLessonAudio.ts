import { Howl } from 'howler'
import { useMemo, useEffect } from 'react'
import type { LessonStep } from '../curriculum/types'

export function useLessonAudio(
  steps: LessonStep[],
  onStepEnded: () => void,
): Howl[] {
  const howls = useMemo(() => {
    return steps.map(
      (step) =>
        new Howl({
          src: [step.narrationAudio],
          html5: false,
          preload: false,
          onend: () => onStepEnded(),
          onloaderror: () => onStepEnded(),
          onplayerror: () => onStepEnded(),
        }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => howls.forEach((h) => h.unload())
  }, [howls])

  return howls
}
