'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { cn } from './cn'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  toast: (opts: Omit<ToastItem, 'id'>) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
  warning: 'warning',
}

const STYLES: Record<ToastType, { container: string; icon: string; bar: string }> = {
  success: {
    container: 'bg-surface border-primary/20 shadow-primary/10',
    icon: 'text-primary',
    bar: 'bg-primary',
  },
  error: {
    container: 'bg-surface border-error/20 shadow-error/10',
    icon: 'text-error',
    bar: 'bg-error',
  },
  info: {
    container: 'bg-surface border-secondary/20 shadow-secondary/10',
    icon: 'text-secondary',
    bar: 'bg-secondary',
  },
  warning: {
    container: 'bg-surface border-tertiary/20 shadow-tertiary/10',
    icon: 'text-tertiary',
    bar: 'bg-tertiary',
  },
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const duration = item.duration ?? 4000
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // mount → slide in
    requestAnimationFrame(() => setVisible(true))
    timerRef.current = setTimeout(() => dismiss(), duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const dismiss = () => {
    setLeaving(true)
    setTimeout(() => onDismiss(item.id), 300)
  }

  const style = STYLES[item.type]

  return (
    <div
      onClick={dismiss}
      className={cn(
        'relative overflow-hidden flex items-start gap-3.5 px-4 py-3.5 rounded-2xl border shadow-xl cursor-pointer',
        'backdrop-blur-md min-w-[280px] max-w-[360px]',
        'transition-all duration-300',
        style.container,
        visible && !leaving ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      {/* progress bar */}
      <div
        className={cn('absolute bottom-0 left-0 h-[2px] rounded-full', style.bar)}
        style={{
          animation: `toast-progress ${duration}ms linear forwards`,
        }}
      />

      {/* icon */}
      <span className={cn('material-symbols-outlined !text-xl mt-0.5 flex-shrink-0 !font-variation-settings-fill-1', style.icon)}>
        {ICONS[item.type]}
      </span>

      {/* text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-on-surface leading-tight">{item.title}</p>
        {item.message && (
          <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{item.message}</p>
        )}
      </div>

      {/* close */}
      <button
        onClick={(e) => { e.stopPropagation(); dismiss() }}
        className="text-on-surface-variant/40 hover:text-on-surface-variant flex-shrink-0 mt-0.5 transition-colors"
      >
        <span className="material-symbols-outlined !text-base">close</span>
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const add = useCallback((opts: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...opts, id }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const ctx: ToastContextValue = {
    toast: add,
    success: (title, message) => add({ type: 'success', title, message }),
    error: (title, message) => add({ type: 'error', title, message }),
    info: (title, message) => add({ type: 'info', title, message }),
    warning: (title, message) => add({ type: 'warning', title, message }),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast container — bottom-center on mobile, bottom-right on desktop */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 lg:bottom-8 lg:left-auto lg:right-6 lg:translate-x-0 z-[9999] flex flex-col gap-2.5 items-center lg:items-end pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard item={t} onDismiss={remove} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
