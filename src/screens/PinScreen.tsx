import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, hashPin, storePinHash, verifyPin } from '../db/db'

// ── digit grid layout (mirrors DigitGridWidget DIGIT_ROWS) ───────────────────
const DIGIT_ROWS = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
]

// ── loading state ────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      className="flex flex-col items-center justify-center bg-surface"
    >
      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────
export default function PinScreen() {
  const navigate = useNavigate()

  // useLiveQuery returns:
  //   undefined  → still loading (initial render tick, before any query result)
  //   null       → query resolved, no pinHash record → CREATE mode
  //   AppConfig  → query resolved, pinHash record exists → VERIFY mode
  //
  // We explicitly map the Dexie undefined-not-found to null so we can
  // distinguish the loading sentinel (undefined) from "no PIN set" (null).
  const storedPin = useLiveQuery(() =>
    db.appConfig.get('pinHash').then(r => r ?? null)
  )

  const [digits, setDigits] = useState('')
  const [firstEntry, setFirstEntry] = useState('')
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  // ── explicit loading guard (MUST be before null check) ──────────────────
  if (storedPin === undefined) {
    return <LoadingState />
  }

  // Determine mode: null record → CREATE, record present → VERIFY
  const mode: 'create' | 'verify' = storedPin === null ? 'create' : 'verify'

  // ── heading text ─────────────────────────────────────────────────────────
  let heading: string
  if (mode === 'verify') {
    heading = 'Enter PIN'
  } else if (step === 'confirm') {
    heading = 'Confirm your PIN'
  } else {
    heading = 'Create a PIN'
  }

  // ── active digits buffer (CREATE confirm step uses different buffer) ─────
  // In 'confirm' step, we track confirmDigits in the main `digits` state.
  // The `firstEntry` state holds the PIN from the 'enter' step.

  // ── submit handlers ──────────────────────────────────────────────────────

  async function handleVerifySubmit(pin: string) {
    setIsVerifying(true)
    try {
      const ok = await verifyPin(pin)
      if (ok) {
        navigate('/parent')
      } else {
        setError('Wrong PIN. Please try again.')
        setDigits('')
        setTimeout(() => setIsVerifying(false), 300)
      }
    } catch (err) {
      console.error('[PinScreen] verifyPin error:', err)
      setDigits('')
      setIsVerifying(false)
    }
  }

  async function handleCreateEnterSubmit(pin: string) {
    setFirstEntry(pin)
    setStep('confirm')
    setDigits('')
    setError(null)
  }

  async function handleCreateConfirmSubmit(pin: string) {
    if (pin === firstEntry) {
      try {
        const hash = await hashPin(firstEntry)
        await storePinHash(hash)
        navigate('/parent')
      } catch (err) {
        console.error('[PinScreen] storePinHash error:', err)
        setError('Something went wrong. Please try again.')
        setDigits('')
        setFirstEntry('')
        setStep('enter')
      }
    } else {
      setError("PINs don't match. Please try again.")
      setDigits('')
      setFirstEntry('')
      setStep('enter')
    }
  }

  // ── digit tap handler ────────────────────────────────────────────────────
  function handleDigit(d: string) {
    // Rate-limit guard: ignore all taps while verification is in-flight
    if (isVerifying) return
    // Cap at 4 digits
    if (digits.length >= 4) return

    const next = digits + d

    if (next.length === 4) {
      setDigits(next)
      // Auto-submit on 4th digit
      if (mode === 'verify') {
        handleVerifySubmit(next)
      } else if (step === 'enter') {
        handleCreateEnterSubmit(next)
      } else {
        handleCreateConfirmSubmit(next)
      }
    } else {
      setDigits(next)
    }
  }

  function handleBackspace() {
    if (isVerifying) return
    setDigits(d => d.slice(0, -1))
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
      className="relative flex flex-col items-center justify-center bg-surface gap-8 px-6"
    >
      {/* Back button — lets a child who tapped the lock icon return to lessons */}
      <button
        className="absolute top-4 left-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-on-surface/30 active:text-on-surface/60"
        style={{ touchAction: 'manipulation' }}
        aria-label="Back to lessons"
        onClick={() => navigate('/')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Heading */}
      <h1 className="text-2xl font-bold text-on-surface">{heading}</h1>

      {/* Dot display */}
      <div role="group" aria-label="PIN entry" className="flex gap-4">
        {Array.from({ length: 4 }, (_, i) => {
          const filled = i < digits.length
          return (
            <div
              key={i}
              data-testid={filled ? 'pin-dot-filled' : 'pin-dot-empty'}
              className={[
                'w-6 h-6 rounded-full border-2 transition-colors',
                filled
                  ? 'bg-primary border-primary'
                  : 'bg-transparent border-on-surface/30',
              ].join(' ')}
              aria-hidden="true"
            />
          )
        })}
      </div>

      {/* Error message */}
      {error && (
        <p role="alert" className="text-primary text-sm text-center max-w-xs">
          {error}
        </p>
      )}

      {/* Digit grid */}
      <div
        role="group"
        aria-label="Number pad"
        className="grid grid-cols-3 gap-4"
      >
        {DIGIT_ROWS.map(row =>
          row.map(d => (
            <button
              key={d}
              aria-label={`Digit ${d}`}
              disabled={isVerifying}
              className="bg-white rounded-xl shadow-sm min-h-[64px] min-w-[64px] text-2xl font-bold text-on-surface transition-transform duration-100 active:opacity-80 active:scale-[0.95] disabled:opacity-40"
              style={{ touchAction: 'manipulation' }}
              onClick={() => handleDigit(d)}
            >
              {d}
            </button>
          ))
        )}

        {/* Bottom row: backspace, 0, spacer */}
        <button
          aria-label="Delete last digit"
          disabled={isVerifying}
          className="bg-white rounded-xl shadow-sm min-h-[64px] min-w-[64px] flex items-center justify-center transition-transform duration-100 active:opacity-80 active:scale-[0.95] disabled:opacity-40"
          style={{ touchAction: 'manipulation' }}
          onClick={handleBackspace}
        >
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>

        <button
          aria-label={`Digit 0`}
          disabled={isVerifying}
          className="bg-white rounded-xl shadow-sm min-h-[64px] min-w-[64px] text-2xl font-bold text-on-surface transition-transform duration-100 active:opacity-80 active:scale-[0.95] disabled:opacity-40"
          style={{ touchAction: 'manipulation' }}
          onClick={() => handleDigit('0')}
        >
          0
        </button>

        {/* Spacer to fill 3rd slot in bottom row */}
        <div aria-hidden="true" />
      </div>
    </div>
  )
}
