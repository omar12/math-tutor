interface StepCardProps {
  text: string
  equation?: string
  onReplay: () => void
}

export function StepCard({ text, equation, onReplay }: StepCardProps) {
  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm p-8 w-4/5 max-w-lg">
      <p className="text-xl text-on-surface leading-relaxed">{text}</p>
      {equation && (
        <p className="text-4xl font-bold text-center text-on-surface mt-8">{equation}</p>
      )}
      <button
        aria-label="Replay this step"
        className="self-end mt-6 min-h-[44px] min-w-[44px] flex items-center justify-center"
        style={{ touchAction: 'manipulation' }}
        onClick={onReplay}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      </button>
    </div>
  )
}
