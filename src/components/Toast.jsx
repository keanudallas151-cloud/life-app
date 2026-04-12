import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const timerRefs = useRef(new Map())
  const idCounter = useRef(0)

  const removeToast = useCallback((id) => {
    // Clear the timer if it exists
    if (timerRefs.current.has(id)) {
      clearTimeout(timerRefs.current.get(id))
      timerRefs.current.delete(id)
    }
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    // Use incrementing counter instead of Date.now() to prevent collisions
    idCounter.current += 1
    const id = idCounter.current
    
    setToasts(prev => [...prev, { id, message, type, duration }])
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id)
      }, duration)
      timerRefs.current.set(id, timer)
    }
  }, [removeToast])

  // Cleanup all timers on unmount
  React.useEffect(() => {
    return () => {
      timerRefs.current.forEach(timer => clearTimeout(timer))
      timerRefs.current.clear()
    }
  }, [])

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  }

  const icons = {
    success: 'OK',
    error: 'ERR',
    info: 'INFO',
    warning: 'WARN',
  }

  const colors = {
    success: 'bg-green-500/10 border-green-500/20 text-green-500',
    error: 'bg-red-500/10 border-red-500/20 text-red-500',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
  }

  return (
      <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((t) => {
          const iconLabel = icons[t.type]
          return (
            <div
              key={t.id}
              className={`bg-slate-900/90 backdrop-blur border rounded-xl p-4 pr-10 min-w-[300px] max-w-[400px] ${colors[t.type]} relative shadow-lg`}
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5 text-xs font-bold tracking-wide">
                  {iconLabel}
                </span>
                <p className="text-sm font-medium text-white">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="absolute top-3 right-3 p-1 rounded hover:bg-white/10 transition-colors text-white/60"
              >
                x
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
