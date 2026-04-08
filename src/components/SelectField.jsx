import { ChevronDown } from 'lucide-react'

export default function SelectField({
  label,
  value,
  onChange,
  options = [],
  className = '',
  hint,
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          value={value ?? ''}
          onChange={e => onChange && onChange(e.target.value)}
          className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm bg-white text-gray-800 appearance-none pr-8 transition-colors"
          style={{ WebkitAppearance: 'none' }}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 text-gray-400 pointer-events-none"
        />
      </div>
      {hint && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}
    </div>
  )
}
