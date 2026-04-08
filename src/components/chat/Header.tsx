import React from 'react'
import { Scenario } from '@/types'
import { cn } from '@/components/ui/cn'

interface HeaderProps {
  scenario: Scenario
  secondsLeft: number
  formatTime: (s: number) => string
  onEndSession: () => void
  onTogglePatientInfo?: () => void
  showPatientInfo?: boolean
}

export default function Header({
  scenario,
  secondsLeft,
  formatTime,
  onEndSession,
  onTogglePatientInfo,
  showPatientInfo,
}: HeaderProps) {
  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden glass-nav sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-outline-variant/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="avatar-halo">
            <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-xl relative z-10 shadow-inner text-on-surface-variant">
              <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">{scenario.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-primary font-bold">
              {scenario.chiefComplaint}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border',
            secondsLeft <= 60
              ? 'bg-error-container/20 text-error border-error/20'
              : 'bg-surface-container/50 text-on-surface border-outline-variant/10'
          )}>
            <span className="font-mono">{formatTime(secondsLeft)}</span>
          </div>
          <button
            onClick={onEndSession}
            className="p-2 text-error hover:bg-error-container/20 rounded-full transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Desktop Top Bar */}
      <header className="hidden lg:flex glass-nav sticky top-0 z-20 items-center justify-between px-8 py-4 border-b border-outline-variant/10 shadow-sm">
        <div className="flex items-center gap-3 text-sm">
          <a href="/dashboard" className="p-2 hover:bg-surface-container rounded-xl transition-all group">
            <svg className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          <div className="flex items-center gap-2 text-on-surface-variant font-medium">
            <span className="opacity-40">Dashboard</span>
            <span className="opacity-20">/</span>
            <span className="opacity-40">Active Simulation</span>
            <span className="opacity-20">/</span>
            <span className="text-on-surface font-bold px-3 py-1 bg-surface-container rounded-lg border border-outline-variant/5">
              {scenario.name}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container/50 rounded-2xl border border-outline-variant/10">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold text-on-surface-variant tracking-wider uppercase">Recording Session</span>
          </div>
          <button
            onClick={onEndSession}
            className="px-6 py-2.5 rounded-2xl bg-surface-container text-error text-sm font-bold hover:bg-error-container/20 transition-all active:scale-95 border border-outline-variant/10 hover:border-error/20"
          >
            End Simulation
          </button>
        </div>
      </header>
    </>
  )
}
