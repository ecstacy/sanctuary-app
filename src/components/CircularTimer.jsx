// ─── Circular Countdown Timer ───────────────────────────────────────────────
// SVG-based circular timer with animated stroke and centre countdown.

export default function CircularTimer({ duration, remaining, isPaused, size = 160 }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const progress = duration > 0 ? remaining / duration : 0
  const offset = circumference * (1 - progress)

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const display = `${mins}:${secs.toString().padStart(2, '0')}`

  const isWarning = remaining <= 10 && remaining > 0
  const strokeColor = isWarning ? '#c47a3a' : 'var(--color-primary, #6b7f5e)'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-surface-container-high"
          strokeWidth={6}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
        />
      </svg>

      {/* Centre content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-headline text-3xl ${isWarning ? 'text-[#c47a3a]' : 'text-on-surface'}`}>
          {display}
        </span>
        {isPaused && (
          <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
            Paused
          </span>
        )}
      </div>
    </div>
  )
}
