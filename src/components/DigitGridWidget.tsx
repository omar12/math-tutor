interface DigitGridWidgetProps {
  composedDigits: string
  correctAnswer: number
  phase: 'answering' | 'revealing'
  onDigit: (digit: string) => void
  onBackspace: () => void
  onSubmit: () => void
}

const DIGIT_ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
]

export function DigitGridWidget({ composedDigits, correctAnswer, phase, onDigit, onBackspace, onSubmit }: DigitGridWidgetProps) {
  const displayValue = phase === 'revealing' ? String(correctAnswer) : composedDigits || '_'
  const displayColor = phase === 'revealing' ? 'text-success' : composedDigits ? 'text-on-surface' : 'text-on-surface/30'

  return (
    <div className="flex flex-col items-center gap-4 w-full px-6">
      {/* Answer display box — key change on reveal forces remount, triggering reveal-pop */}
      <div
        key={phase === 'revealing' ? 'revealing' : 'answering'}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={composedDigits ? `Your answer: ${composedDigits}` : 'Enter your answer'}
        className={`bg-white rounded-2xl shadow-sm min-h-[64px] min-w-[120px] flex items-center justify-center text-4xl font-bold ${displayColor}${phase === 'revealing' ? ' reveal-pop' : ''}`}
      >
        {displayValue}
      </div>

      {/* Key grid */}
      <div role="group" aria-label="Number pad" className="grid grid-cols-3 gap-4">
        {DIGIT_ROWS.map(row =>
          row.map(d => (
            <button
              key={d}
              aria-label={`Digit ${d}`}
              aria-description="Tap to add this digit to your answer"
              className="bg-white rounded-xl shadow-sm min-h-[64px] min-w-[64px] text-2xl font-bold text-on-surface transition-transform duration-100 active:opacity-80 active:scale-[0.95]"
              style={{ touchAction: 'manipulation' }}
              disabled={phase === 'revealing'}
              onClick={() => {
                if (phase !== 'answering') return
                onDigit(d)
              }}
            >
              {d}
            </button>
          ))
        )}

        {/* Bottom row: backspace, 0, Check */}
        <button
          aria-label="Delete last digit"
          aria-description="Remove the last digit you entered"
          className="bg-white rounded-xl shadow-sm min-h-[64px] min-w-[64px] flex items-center justify-center transition-transform duration-100 active:opacity-80 active:scale-[0.95]"
          style={{ touchAction: 'manipulation' }}
          disabled={phase === 'revealing'}
          onClick={() => {
            if (phase !== 'answering') return
            onBackspace()
          }}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>

        <button
          aria-label="Digit 0"
          aria-description="Tap to add this digit to your answer"
          className="bg-white rounded-xl shadow-sm min-h-[64px] min-w-[64px] text-2xl font-bold text-on-surface transition-transform duration-100 active:opacity-80 active:scale-[0.95]"
          style={{ touchAction: 'manipulation' }}
          disabled={phase === 'revealing'}
          onClick={() => {
            if (phase !== 'answering') return
            onDigit('0')
          }}
        >
          0
        </button>

        <button
          aria-label="Check my answer"
          aria-description="Submit your answer"
          className="bg-accent text-white rounded-xl shadow-sm min-h-[64px] text-base font-bold active:opacity-80 disabled:opacity-40"
          style={{ touchAction: 'manipulation' }}
          disabled={composedDigits.length === 0 || phase === 'revealing'}
          onClick={() => {
            if (phase !== 'answering') return
            onSubmit()
          }}
        >
          Check
        </button>
      </div>
    </div>
  )
}

export default DigitGridWidget
