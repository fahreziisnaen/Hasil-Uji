import { Zap, ArrowLeft } from 'lucide-react'

export default function AppBar({ title, subtitle, onBack, rightContent }) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-4 h-14"
      style={{
        background: '#1A3A6B',
        maxWidth: 480,
        margin: '0 auto',
        left: '50%',
        transform: 'translateX(-50%)',
        right: 'auto',
        width: '100%',
      }}
    >
      {onBack ? (
        <button
          onClick={onBack}
          className="mr-3 p-1 rounded-full active:bg-white/20 transition-colors"
          aria-label="Kembali"
        >
          <ArrowLeft size={22} color="white" />
        </button>
      ) : (
        <div className="mr-3 flex items-center justify-center w-8 h-8 rounded-full"
          style={{ background: 'rgba(255,255,255,0.12)' }}>
          <Zap size={18} color="#F57C00" fill="#F57C00" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h1 className="text-white font-bold text-base leading-tight tracking-wide truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/70 text-xs leading-tight truncate">{subtitle}</p>
        )}
      </div>

      {rightContent && (
        <div className="flex items-center gap-1 ml-2">
          {rightContent}
        </div>
      )}
    </div>
  )
}
