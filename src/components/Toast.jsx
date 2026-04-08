import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message = 'Tersimpan ✓', duration = 2000) => {
    setToast({ message, id: Date.now() })
    setTimeout(() => setToast(null), duration)
  }, [])

  return { toast, showToast }
}

export function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className="toast-container">
      <div className="toast" key={toast.id}>
        {toast.message}
      </div>
    </div>
  )
}
