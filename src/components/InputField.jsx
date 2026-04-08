export default function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  unit,
  readOnly = false,
  className = '',
  hint,
  step,
  min,
  max,
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          type={type}
          value={value ?? ''}
          onChange={e => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          step={step}
          min={min}
          max={max}
          className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm bg-white text-gray-800 placeholder-gray-400 transition-colors"
          style={{
            paddingRight: unit ? '3rem' : '0.75rem',
            background: readOnly ? '#F8FAFC' : 'white',
            color: readOnly ? '#64748B' : '#1e293b',
          }}
        />
        {unit && (
          <span className="absolute right-3 text-xs text-gray-400 font-medium pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {hint && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}
    </div>
  )
}
