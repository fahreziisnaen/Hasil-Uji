export default function ResultBadge({ status }) {
  if (status === 'lulus') {
    return (
      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ background: '#DCFCE7', color: '#166534' }}>
        LULUS
      </span>
    )
  }
  if (status === 'check') {
    return (
      <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ background: '#FFF7ED', color: '#9A3412' }}>
        CHECK
      </span>
    )
  }
  // belum / default
  return (
    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: '#F1F5F9', color: '#94A3B8' }}>
      BELUM
    </span>
  )
}
