'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { cn } from '@/components/ui/cn'
import type { InstructorView, ScenarioRecord, InstructorStats } from './types'

export default function InstructorDashboard({
  setActiveView,
}: {
  setActiveView: (v: InstructorView) => void
}) {
  const { data: session } = useSession()
  const firstName = session?.user?.name?.split(' ')[0] || 'Instructor'
  const [stats, setStats] = useState<InstructorStats | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/scenarios').then((r) => r.json()),
      fetch('/api/instructor/stats').then((r) => r.json()).catch(() => ({ totalSessions: 0, avgScore: 0 })),
    ]).then(([scenarios, sessionStats]) => {
      const list = Array.isArray(scenarios) ? scenarios : []
      setStats({
        totalScenarios: list.length,
        totalSessions: sessionStats.totalSessions || 0,
        avgScore: sessionStats.avgScore || 0,
        recentScenarios: list.slice(0, 5),
      })
    })
  }, [])

  return (
    <div className="px-5 py-4 lg:px-10 lg:py-10 space-y-5 lg:space-y-8 animate-fade-in">
      {/* Welcome */}
      <section className="space-y-1 pt-0.5 lg:pt-1">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary/70">Instructor Portal</p>
        <h2 className="text-2xl lg:text-5xl font-black tracking-tighter text-on-surface leading-tight">
          Welcome, <span className="text-secondary">{firstName}.</span>
        </h2>
        <p className="text-xs lg:text-base text-on-surface-variant font-medium">
          จัดการ scenarios และติดตามผลนักศึกษาได้ที่นี่
        </p>
      </section>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-3 lg:gap-6">
        {[
          { icon: 'description', label: 'Scenarios', value: stats?.totalScenarios ?? 0, color: 'text-secondary', bg: 'bg-secondary/8' },
          { icon: 'group', label: 'Sessions', value: stats?.totalSessions ?? 0, color: 'text-primary', bg: 'bg-primary/8' },
          { icon: 'psychology', label: 'Avg Score', value: `${stats?.avgScore ?? 0}%`, color: 'text-tertiary', bg: 'bg-tertiary/8' },
        ].map(({ icon, label, value, color, bg }) => (
          <div key={label} className="bg-surface-container-lowest rounded-2xl lg:rounded-3xl p-3 lg:p-7 border border-outline-variant/5 shadow-sm space-y-1.5 lg:space-y-3">
            <div className={cn('w-8 h-8 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl flex items-center justify-center', bg)}>
              <span className={cn('material-symbols-outlined !text-lg lg:!text-2xl', color)} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <div>
              <p className="text-[8px] lg:text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-0.5">{label}</p>
              <p className="text-xl lg:text-3xl font-black text-on-surface tracking-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
        {/* Create CTA */}
        <div className="lg:col-span-5 bg-gradient-to-br from-secondary to-secondary-dim rounded-2xl lg:rounded-[3rem] p-4 lg:p-10 shadow-xl shadow-secondary/20 text-on-secondary relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000" />
          <div className="relative z-10 flex flex-row lg:flex-col gap-4 items-center lg:items-start">
            <div className="w-10 h-10 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-xl rounded-xl lg:rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-xl shrink-0">
              <span className="material-symbols-outlined !text-xl lg:!text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            </div>
            <div className="flex-1 lg:space-y-2">
              <h3 className="text-base lg:text-3xl font-black leading-tight tracking-tighter">Create New Scenario</h3>
              <p className="text-on-secondary/70 text-xs lg:text-sm font-medium hidden lg:block">สร้างบททดสอบใหม่ให้นักศึกษาฝึกซักประวัติ</p>
            </div>
            <button
              onClick={() => setActiveView('Create')}
              className="shrink-0 lg:hidden px-4 py-2 bg-white/20 border border-white/30 text-on-secondary font-black text-[10px] uppercase tracking-wider rounded-xl active:scale-95 transition-all"
            >
              เริ่ม
            </button>
          </div>
          <button
            onClick={() => setActiveView('Create')}
            className="relative z-10 mt-8 w-full py-4 bg-white text-secondary font-black uppercase tracking-[0.15em] rounded-2xl hover:shadow-xl hover:scale-[1.01] transition-all active:scale-95 text-xs hidden lg:block"
          >
            Get Started
          </button>
        </div>

        {/* Recent Scenarios */}
        <div className="lg:col-span-7 space-y-3 lg:space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base lg:text-2xl font-black text-on-surface tracking-tight">Recent Scenarios</h3>
            <button onClick={() => setActiveView('Scenarios')} className="text-secondary text-[10px] lg:text-xs font-black uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-2 lg:space-y-3">
            {stats?.recentScenarios && stats.recentScenarios.length > 0 ? (
              stats.recentScenarios.map((s: ScenarioRecord) => (
                <div key={s.id} className="flex items-center gap-3 lg:gap-4 p-3 lg:p-5 bg-surface-container-lowest rounded-xl lg:rounded-3xl hover:shadow-md transition-all border border-outline-variant/5">
                  <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl bg-surface-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined !text-xl text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>{s.gender === 'male' ? 'man' : 'woman'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs lg:text-sm font-black text-on-surface tracking-tight truncate">{s.name}</p>
                    <p className="text-[10px] lg:text-xs text-on-surface-variant/60 font-semibold truncate">{s.chiefComplaint}</p>
                  </div>
                  <span className={cn(
                    'px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-wider shrink-0',
                    s.difficulty === 'hard' ? 'bg-error/10 text-error' : s.difficulty === 'medium' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'
                  )}>{s.difficulty}</span>
                </div>
              ))
            ) : (
              <div className="py-8 lg:py-12 flex flex-col items-center justify-center bg-surface-container/20 rounded-2xl lg:rounded-3xl border-2 border-dashed border-outline-variant/20">
                <span className="material-symbols-outlined !text-3xl lg:!text-4xl text-on-surface-variant/20 mb-2">description</span>
                <p className="text-[10px] lg:text-xs font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">No scenarios yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
