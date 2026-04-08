import { ChevronRight } from 'lucide-react'

export default function MenuCard({ title, subtitle, icon: Icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl shadow-sm active:scale-95 transition-transform overflow-hidden"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="p-3 flex items-center gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: color + '18' }}
        >
          {Icon && <Icon size={20} color={color} strokeWidth={2} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm leading-tight truncate">{title}</p>
          {subtitle && (
            <p className="text-gray-400 text-xs leading-tight mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        <ChevronRight size={16} color="#CBD5E1" className="flex-shrink-0" />
      </div>
    </button>
  )
}
