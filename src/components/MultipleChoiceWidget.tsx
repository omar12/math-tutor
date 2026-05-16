interface MultipleChoiceWidgetProps {
  choices: number[]
  correctAnswer: number
  phase: 'answering' | 'revealing'
  onSubmit: (choice: number) => void
}

export function MultipleChoiceWidget({ choices, correctAnswer, phase, onSubmit }: MultipleChoiceWidgetProps) {
  return (
    <div role="group" aria-label="Answer choices" className="grid grid-cols-2 gap-4 w-full px-6">
      {choices.map(choice => (
        <button
          key={choice}
          aria-label={`Answer ${choice}`}
          className={`bg-white rounded-2xl shadow-sm min-h-[64px] flex items-center justify-center text-4xl font-bold text-on-surface active:opacity-80${
            phase === 'revealing' && choice === correctAnswer
              ? ' border-2 border-success bg-success/10'
              : ''
          }`}
          style={{ touchAction: 'manipulation' }}
          disabled={phase === 'revealing'}
          onClick={() => {
            if (phase !== 'answering') return
            onSubmit(choice)
          }}
        >
          {choice}
        </button>
      ))}
    </div>
  )
}

export default MultipleChoiceWidget
