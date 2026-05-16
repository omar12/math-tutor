export interface FeedbackSlotProps {
  attemptCount: number
  phraseIndex: number
}

const ENCOURAGEMENT_PHRASES = [
  "Nice try! Give it another go.",
  "Almost! You can do it.",
  "Keep going — you're doing great!",
  "Not quite, but don't give up!",
  "Hmm, try again!",
]

const FALLBACK_HINT = "Think about what number makes the equation balance."

export function FeedbackSlot({ attemptCount, phraseIndex }: FeedbackSlotProps) {
  let text: string | null = null
  let textClass = ''

  if (attemptCount === 0) {
    text = null
    textClass = ''
  } else if (attemptCount === 1) {
    text = ENCOURAGEMENT_PHRASES[phraseIndex % ENCOURAGEMENT_PHRASES.length]
    textClass = 'text-lg text-primary text-center'
  } else {
    text = FALLBACK_HINT
    textClass = 'text-lg text-accent text-center font-semibold'
  }

  return (
    <div className="min-h-[48px] flex items-center justify-center px-6" aria-live="polite">
      {text !== null && <p className={textClass}>{text}</p>}
    </div>
  )
}
