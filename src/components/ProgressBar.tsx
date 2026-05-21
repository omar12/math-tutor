interface ProgressBarProps {
  label: string
  accuracy: number
  hasData: boolean
}

export function ProgressBar({ label, accuracy, hasData }: ProgressBarProps) {
  if (!hasData) {
    return (
      <div className="w-full flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-on-surface">{label}</span>
          <span className="text-lg text-on-surface/40">—</span>
        </div>
      </div>
    )
  }

  const clamped = Math.min(1, Math.max(0, accuracy))
  const pct = Math.round(clamped * 100)
  const fillColor = clamped >= 0.7 ? 'bg-success' : 'bg-accent'

  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold text-on-surface">{label}</span>
        <span className="text-lg font-semibold text-on-surface">{pct}%</span>
      </div>
      <div className="h-4 rounded-full overflow-hidden bg-on-surface/10">
        <div
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${pct}%`}
          className={`h-full rounded-full ${fillColor} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
