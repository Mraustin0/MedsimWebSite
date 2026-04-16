import React, { useEffect, useState } from 'react'
import { Scenario } from '@/types'
import { cn } from '@/components/ui/cn'

interface SidebarProps {
  scenario: Scenario
  secondsLeft: number
  formatTime: (s: number) => string
  oldcarts: { key: string; label: string; checked: boolean }[]
  checkedCount: number
  toggleOldcarts: (key: string) => void
  onEndSession: () => void
}

interface SessionHistoryItem {
  id: string
  scenarioId: string
  startedAt: string
  durationSeconds: number
  scores: { overall: number } | null
  oldcartsCompleted: number
}

export default function Sidebar({
  scenario,
  secondsLeft,
  formatTime,
  oldcarts,
  checkedCount,
  toggleOldcarts,
  onEndSession,
}: SidebarProps) {
  const SESSION_DURATION = 10 * 60
  const [history, setHistory] = useState<SessionHistoryItem[] | null>(null)

  useEffect(() => {
    fetch('/api/session/history')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data.slice(0, 3))
      })
      .catch(() => setHistory([]))
  }, [])

  return (
    <aside className="hidden lg:flex w-[320px] xl:w-[360px] flex-shrink-0 flex-col gap-6 p-6 bg-surface-container-low border-r border-outline-variant/10 fixed top-0 left-0 h-full overflow-y-auto z-30 chat-scroll">
      {/* Simulation Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h2 className="title-md text-on-surface font-bold">MedSim v2.0</h2>
          <p className="label-sm text-on-surface-variant/60">Clinical Sanctuary</p>
        </div>
      </div>

      {/* Finish Button */}
      <button
        onClick={onEndSession}
        className="w-full py-3.5 rounded-2xl bg-error/5 text-error hover:bg-error/10 font-bold transition-all active:scale-95 border border-error/10 flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        End Simulation
      </button>

      {/* Patient Profile Card */}
      <div className="bg-surface-container-lowest rounded-3xl premium-shadow p-6 flex flex-col items-center text-center group border border-outline-variant/5">
        <div className="avatar-halo mb-4">
          <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center text-4xl relative z-10 shadow-inner text-on-surface-variant">
            <span className="material-symbols-outlined !text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {scenario.gender === 'male' ? 'man' : 'woman'}
            </span>
          </div>
        </div>
        <h3 className="headline-md text-on-surface mb-1 tracking-tight">{scenario.name}</h3>
        <p className="body-md text-on-surface-variant/80 font-medium">{scenario.age} ปี • {scenario.gender === 'male' ? 'ชาย' : 'หญิง'}</p>

        <div className="mt-4 px-4 py-2 bg-secondary-container/30 text-on-secondary-container text-xs font-bold rounded-2xl border border-secondary-container/20">
          {scenario.chiefComplaint}
        </div>

        <div className="mt-5 flex gap-1.5 flex-wrap justify-center">
          {scenario.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-surface-container text-on-surface-variant/70 text-[10px] font-bold rounded-lg uppercase tracking-wider">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Timer & Progress */}
      <div className="bg-surface-container-lowest rounded-3xl premium-shadow p-6 border border-outline-variant/5">
        <div className="flex justify-between items-center mb-4">
          <p className="label-md text-on-surface-variant font-bold">Time Remaining</p>
          <span className={cn(
            'px-2.5 py-1 rounded-lg font-mono text-sm font-bold',
            secondsLeft <= 60 ? 'bg-error-container text-on-error-container' : 'bg-primary-container/20 text-primary'
          )}>
            {formatTime(secondsLeft)}
          </span>
        </div>

        <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-1000 ease-linear rounded-full',
              secondsLeft <= 60 ? 'bg-error' : secondsLeft <= 180 ? 'bg-amber-500' : 'bg-primary'
            )}
            style={{ width: `${(secondsLeft / SESSION_DURATION) * 100}%` }}
          />
        </div>
      </div>

      {/* OLDCARTS Checklist */}
      <div className="bg-surface-container-lowest rounded-3xl premium-shadow p-6 flex-1 flex flex-col border border-outline-variant/5 overflow-hidden">
        <div className="flex justify-between items-center mb-5">
          <p className="label-md text-on-surface-variant font-bold">History Checklist</p>
          <span className={cn(
            'label-sm px-3 py-1 rounded-full border',
            checkedCount >= 6 ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant/10'
          )}>
            {checkedCount}/8
          </span>
        </div>

        <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 no-scrollbar">
          {oldcarts.map((item) => (
            <button
              key={item.key}
              onClick={() => toggleOldcarts(item.key)}
              className={cn(
                'flex items-center gap-3 text-left transition-all p-3 rounded-2xl group border border-transparent',
                item.checked
                  ? 'bg-primary-container/20 text-on-primary-container border-primary/10'
                  : 'text-on-surface-variant/70 hover:bg-surface-container hover:text-on-surface'
              )}
            >
              <div className={cn(
                'w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 transition-all border',
                item.checked
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface-container-lowest border-outline-variant/30 group-hover:border-primary/30'
              )}>
                {item.checked && <span className="material-symbols-outlined !text-sm">check</span>}
              </div>
              <span className={cn(
                'text-sm font-medium transition-all',
                item.checked && 'opacity-60 line-through'
              )}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Sessions — real data */}
      <div className="mt-auto pt-6 border-t border-outline-variant/10">
        <p className="label-sm text-on-surface-variant/50 font-bold mb-3 uppercase tracking-widest">Recent Sessions</p>
        <div className="flex flex-col gap-2">
          {history === null ? (
            // loading skeleton
            [0, 1, 2].map((i) => (
              <div key={i} className="p-3 rounded-xl border border-outline-variant/5 space-y-1.5">
                <div className="skeleton h-2.5 w-24" />
                <div className="skeleton h-3 w-32" />
              </div>
            ))
          ) : history.length === 0 ? (
            <p className="text-xs text-on-surface-variant/40 font-medium px-1">ยังไม่มี session ที่ผ่านมา</p>
          ) : (
            history.map((s) => {
              const date = new Date(s.startedAt)
              const label = date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
              const time = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
              const score = s.scores?.overall ?? null
              return (
                <div key={s.id} className="p-3 rounded-xl bg-surface-container/30 border border-outline-variant/5 flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-on-surface-variant/50 tabular-nums">{label} · {time}</p>
                    <p className="text-xs font-semibold text-on-surface truncate">
                      {s.oldcartsCompleted}/8 OLDCARTS
                    </p>
                  </div>
                  {score !== null && (
                    <span className={cn(
                      'flex-shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full',
                      score >= 80 ? 'bg-primary-container text-on-primary-container' :
                      score >= 60 ? 'bg-tertiary-container text-on-tertiary-container' :
                      'bg-error-container text-on-error-container'
                    )}>
                      {score}%
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </aside>
  )
}
