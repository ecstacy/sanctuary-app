export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-8">

      {/* Breathing lotus */}
      <div className="relative w-24 h-24">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/15 animate-loading-breathe" />
        {/* Middle ring */}
        <div className="absolute inset-2 rounded-full border-2 border-primary/25 animate-loading-breathe-delay" />
        {/* Inner glow */}
        <div className="absolute inset-4 rounded-full bg-primary-container/50 animate-loading-breathe" />
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-3xl animate-loading-breathe-delay">
            spa
          </span>
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-2">
        <p className="font-headline italic text-primary text-base animate-loading-fade">
          The Sanctuary
        </p>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-loading-dot" style={{ animationDelay: '0s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-loading-dot" style={{ animationDelay: '0.2s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-loading-dot" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  )
}
