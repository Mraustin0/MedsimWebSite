'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from './cn'

interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

interface DialogState extends ConfirmOptions {
  resolve: (val: boolean) => void
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({ ...opts, resolve })
    })
  }, [])

  const handleAction = (value: boolean) => {
    dialog?.resolve(value)
    setDialog(null)
  }

  const isDanger = dialog?.variant === 'danger'

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {dialog && (
        <div
          className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-4"
          onClick={() => handleAction(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-scrim/40 backdrop-blur-sm" />

          {/* Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'relative w-full max-w-sm bg-surface rounded-3xl shadow-2xl border border-outline-variant/10',
              'animate-in fade-in slide-in-from-bottom-4 duration-200'
            )}
          >
            {/* Icon header */}
            <div className="flex flex-col items-center px-6 pt-8 pb-4 text-center">
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center mb-4',
                isDanger ? 'bg-error-container' : 'bg-primary-container'
              )}>
                <span className={cn(
                  'material-symbols-outlined !text-2xl',
                  isDanger ? 'text-on-error-container' : 'text-on-primary-container'
                )}>
                  {isDanger ? 'delete_forever' : 'help'}
                </span>
              </div>
              <h3 className="text-lg font-black text-on-surface tracking-tight">{dialog.title}</h3>
              {dialog.message && (
                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{dialog.message}</p>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-outline-variant/10 mx-6" />

            {/* Actions */}
            <div className="flex gap-3 p-4">
              <button
                onClick={() => handleAction(false)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-black tracking-wide text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-all active:scale-95 border border-outline-variant/10"
              >
                {dialog.cancelLabel ?? 'ยกเลิก'}
              </button>
              <button
                onClick={() => handleAction(true)}
                className={cn(
                  'flex-1 py-3.5 rounded-2xl text-sm font-black tracking-wide transition-all active:scale-95',
                  isDanger
                    ? 'bg-error text-on-error hover:bg-error/90'
                    : 'cta-gradient text-on-primary'
                )}
              >
                {dialog.confirmLabel ?? 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider')
  return ctx.confirm
}
