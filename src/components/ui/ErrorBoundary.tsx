'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  /** label shown in the default fallback — e.g. "Dashboard" */
  section?: string
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    if (this.props.fallback) return this.props.fallback

    return (
      <DefaultErrorFallback
        section={this.props.section}
        error={this.state.error}
        onReset={this.reset}
      />
    )
  }
}

/* ── Default Fallback UI ──────────────────────────────────────────────────── */
function DefaultErrorFallback({
  section,
  error,
  onReset,
}: {
  section?: string
  error: Error | null
  onReset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-6 py-16 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mb-5">
        <span className="material-symbols-outlined !text-3xl text-error">error</span>
      </div>
      <h2 className="text-xl font-black text-on-surface tracking-tight mb-2">
        {section ? `${section} โหลดไม่สำเร็จ` : 'เกิดข้อผิดพลาด'}
      </h2>
      <p className="text-sm text-on-surface-variant max-w-xs mb-6">
        {error?.message || 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง'}
      </p>
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-2xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined !text-base">refresh</span>
        ลองใหม่
      </button>
    </div>
  )
}

/* ── Inline API Error Banner ──────────────────────────────────────────────── */
export function APIErrorBanner({
  message = 'โหลดข้อมูลไม่สำเร็จ',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-error/8 border border-error/20 rounded-2xl text-sm text-error font-semibold">
      <span className="material-symbols-outlined !text-lg shrink-0">warning</span>
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-xl bg-error/10 hover:bg-error/20 transition-all"
        >
          ลองใหม่
        </button>
      )}
    </div>
  )
}

/* ── Empty State ──────────────────────────────────────────────────────────── */
export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
}: {
  icon?: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
        <span className="material-symbols-outlined !text-3xl text-on-surface-variant/30">{icon}</span>
      </div>
      <h3 className="text-base font-black text-on-surface tracking-tight mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-on-surface-variant max-w-xs mb-5">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2.5 bg-primary text-on-primary rounded-2xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
