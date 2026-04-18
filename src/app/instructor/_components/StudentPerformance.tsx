'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/components/ui/cn'
import type { StudentSummary, StudentDetail } from './types'

export default function StudentPerformance() {
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/instructor/students')
      .then((r) => r.json())
      .then((data) => { setStudents(Array.isArray(data) ? data : (data.data ?? [])); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openStudent = async (id: string) => {
    setLoadingDetail(true)
    setExpandedSession(null)
    try {
      const res = await fetch(`/api/instructor/students/${id}`)
      const data = await res.json()
      setSelectedStudent(data)
    } catch {
      setSelectedStudent(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    return m > 0 ? `${m} นาที` : `${s} วินาที`
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })

  // ─── Student detail view ───────────────────────────────────────────────────
  if (selectedStudent) {
    const s = selectedStudent
    const feedbacks = s.sessions.filter((ses) => ses.scores)
    const avgScore = feedbacks.length > 0
      ? Math.round(feedbacks.reduce((sum, ses) => sum + (ses.scores?.overall ?? 0), 0) / feedbacks.length)
      : 0

    return (
      <div className="px-5 py-6 lg:px-10 lg:py-10 animate-fade-in">
        <button onClick={() => setSelectedStudent(null)}
          className="flex items-center gap-2 text-secondary font-bold text-sm mb-6 hover:underline">
          <span className="material-symbols-outlined !text-xl">arrow_back</span>
          กลับไปรายชื่อ
        </button>

        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-secondary-container flex items-center justify-center overflow-hidden border-2 border-secondary/10 shrink-0">
            {s.avatarUrl ? (
              <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined !text-3xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl lg:text-4xl font-black tracking-tighter text-on-surface">{s.name}</h1>
            <p className="text-sm text-on-surface-variant">{s.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 lg:gap-6 mb-8">
          {[
            { label: 'Sessions', value: s.sessions.length, icon: 'play_circle', color: 'text-secondary', bg: 'bg-secondary/8' },
            { label: 'Avg Score', value: `${avgScore}%`, icon: 'psychology', color: 'text-primary', bg: 'bg-primary/8' },
            {
              label: 'OLDCARTS',
              value: feedbacks.length > 0
                ? `${Math.round(feedbacks.reduce((sum, ses) => sum + ses.oldcartsCompleted, 0) / feedbacks.length)}/8`
                : '0/8',
              icon: 'checklist', color: 'text-tertiary', bg: 'bg-tertiary/8',
            },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="bg-surface-container-lowest rounded-2xl p-4 lg:p-6 border border-outline-variant/5 shadow-sm">
              <div className={cn('w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center mb-2', bg)}>
                <span className={cn('material-symbols-outlined !text-lg lg:!text-xl', color)} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              </div>
              <p className="text-[9px] lg:text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{label}</p>
              <p className="text-xl lg:text-2xl font-black text-on-surface tracking-tight">{value}</p>
            </div>
          ))}
        </div>

        {/* Session History */}
        <h3 className="text-lg lg:text-2xl font-black text-on-surface tracking-tight mb-4">Session History</h3>
        {s.sessions.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center bg-surface-container/20 rounded-2xl border-2 border-dashed border-outline-variant/20">
            <span className="material-symbols-outlined !text-4xl text-on-surface-variant/20 mb-2">event_busy</span>
            <p className="text-xs font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">ยังไม่มีประวัติการทำ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {s.sessions.map((ses) => (
              <div key={ses.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/5 overflow-hidden">
                <button
                  onClick={() => setExpandedSession(expandedSession === ses.id ? null : ses.id)}
                  className="w-full flex items-center gap-4 p-4 lg:p-5 hover:bg-surface-container/20 transition-all text-left"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    ses.scores
                      ? ses.scores.overall >= 70 ? 'bg-primary/10 text-primary'
                        : ses.scores.overall >= 40 ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                      : 'bg-surface-container text-on-surface-variant/40'
                  )}>
                    <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {ses.scores
                        ? ses.scores.overall >= 70 ? 'check_circle' : ses.scores.overall >= 40 ? 'info' : 'cancel'
                        : 'pending'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">Scenario: {ses.scenarioId.slice(0, 8)}...</p>
                    <p className="text-[10px] text-on-surface-variant">{formatDate(ses.startedAt)} · {formatDuration(ses.durationSeconds)} · {ses.messageCount} คำถาม</p>
                  </div>
                  {ses.scores && (
                    <span className={cn(
                      'px-3 py-1 rounded-full text-[10px] font-black shrink-0',
                      ses.scores.overall >= 70 ? 'bg-primary/10 text-primary' : ses.scores.overall >= 40 ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                    )}>{ses.scores.overall}%</span>
                  )}
                  <span className={cn(
                    'material-symbols-outlined !text-xl text-on-surface-variant/40 transition-transform shrink-0',
                    expandedSession === ses.id && 'rotate-180'
                  )}>expand_more</span>
                </button>

                {expandedSession === ses.id && (
                  <div className="border-t border-outline-variant/10 p-4 lg:p-6 space-y-5 animate-fade-in">
                    {ses.scores && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 mb-3">OLDCARTS Scores</p>
                        <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
                          {[
                            { key: 'onset', label: 'O' },
                            { key: 'location', label: 'L' },
                            { key: 'duration', label: 'D' },
                            { key: 'character', label: 'C' },
                            { key: 'aggravating', label: 'A' },
                            { key: 'relieving', label: 'R' },
                            { key: 'timing', label: 'T' },
                            { key: 'severity', label: 'S' },
                          ].map(({ key, label }) => {
                            const score = ses.scores![key as keyof typeof ses.scores] as number
                            return (
                              <div key={key} className="text-center">
                                <div className={cn(
                                  'w-10 h-10 lg:w-12 lg:h-12 mx-auto rounded-xl flex items-center justify-center text-sm lg:text-base font-black mb-1',
                                  score >= 7 ? 'bg-primary/10 text-primary' : score >= 4 ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                                )}>{score}</div>
                                <p className="text-[9px] font-black text-on-surface-variant/50">{label}</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {ses.good.length > 0 && (
                        <div className="bg-primary/5 rounded-xl p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined !text-sm">thumb_up</span> ทำได้ดี
                          </p>
                          <ul className="space-y-1">
                            {ses.good.map((g, i) => <li key={i} className="text-xs text-on-surface">{g}</li>)}
                          </ul>
                        </div>
                      )}
                      {ses.missed.length > 0 && (
                        <div className="bg-error/5 rounded-xl p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-error mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined !text-sm">warning</span> ควรปรับปรุง
                          </p>
                          <ul className="space-y-1">
                            {ses.missed.map((m, i) => <li key={i} className="text-xs text-on-surface">{m}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>

                    {ses.transcript.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 mb-3">Chat Transcript</p>
                        <div className="max-h-80 overflow-y-auto bg-surface-container/20 rounded-xl p-3 space-y-2">
                          {ses.transcript.map((msg, i) => (
                            <div key={i} className={cn('flex', msg.role === 'USER' ? 'justify-end' : 'justify-start')}>
                              <div className={cn(
                                'max-w-[85%] px-3 py-2 rounded-xl text-xs',
                                msg.role === 'USER'
                                  ? 'bg-secondary text-on-secondary rounded-br-sm'
                                  : 'bg-surface-container-lowest text-on-surface rounded-bl-sm border border-outline-variant/10'
                              )}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── Student list view ─────────────────────────────────────────────────────
  return (
    <div className="px-5 py-6 lg:px-10 lg:py-10 animate-fade-in">
      <header className="mb-6 lg:mb-8">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary/70 mb-1">Performance</p>
        <h1 className="text-2xl lg:text-5xl font-black tracking-tighter text-on-surface leading-tight">
          Student <span className="text-secondary">Dashboard</span>
        </h1>
        <p className="text-sm lg:text-base text-on-surface-variant font-medium mt-1">
          ติดตามผลการเรียนและพัฒนาการของนักศึกษาทุกคน
        </p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 rounded-full border-3 border-secondary/20 border-t-secondary animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center bg-surface-container/20 rounded-2xl lg:rounded-3xl border-2 border-dashed border-outline-variant/20">
          <span className="material-symbols-outlined !text-5xl text-on-surface-variant/20 mb-3">group_off</span>
          <p className="text-xs font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">ยังไม่มีนักศึกษาในระบบ</p>
          <p className="text-xs text-on-surface-variant/30">นักศึกษาจะปรากฏเมื่อมีการ login เข้าระบบ</p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 lg:gap-6 mb-6 lg:mb-8">
            {[
              { label: 'นักศึกษา', value: students.length, icon: 'group', color: 'text-secondary', bg: 'bg-secondary/8' },
              { label: 'Sessions รวม', value: students.reduce((s, st) => s + st.totalSessions, 0), icon: 'play_circle', color: 'text-primary', bg: 'bg-primary/8' },
              {
                label: 'Avg Score',
                value: (() => {
                  const active = students.filter(s => s.totalSessions > 0)
                  return active.length > 0
                    ? `${Math.round(active.reduce((sum, s) => sum + s.avgScore, 0) / active.length)}%`
                    : '0%'
                })(),
                icon: 'psychology', color: 'text-tertiary', bg: 'bg-tertiary/8',
              },
            ].map(({ label, value, icon, color, bg }) => (
              <div key={label} className="bg-surface-container-lowest rounded-2xl p-3 lg:p-6 border border-outline-variant/5 shadow-sm">
                <div className={cn('w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center mb-2', bg)}>
                  <span className={cn('material-symbols-outlined !text-lg lg:!text-xl', color)} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <p className="text-[9px] lg:text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{label}</p>
                <p className="text-xl lg:text-2xl font-black text-on-surface tracking-tight">{value}</p>
              </div>
            ))}
          </div>

          {/* Student table */}
          <div className="bg-surface-container-lowest rounded-2xl lg:rounded-3xl border border-outline-variant/5 overflow-hidden">
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-outline-variant/10 text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant/40">
              <div className="col-span-4">นักศึกษา</div>
              <div className="col-span-2 text-center">Sessions</div>
              <div className="col-span-2 text-center">Avg Score</div>
              <div className="col-span-2 text-center">OLDCARTS</div>
              <div className="col-span-2 text-center">ล่าสุด</div>
            </div>

            {students.map((st) => (
              <button
                key={st.id}
                onClick={() => openStudent(st.id)}
                className="w-full grid grid-cols-12 gap-3 lg:gap-4 px-4 lg:px-6 py-4 lg:py-5 hover:bg-surface-container/20 transition-all border-b border-outline-variant/5 last:border-0 text-left items-center"
              >
                <div className="col-span-8 lg:col-span-4 flex items-center gap-3">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl bg-secondary-container flex items-center justify-center overflow-hidden shrink-0">
                    {st.avatarUrl ? (
                      <img src={st.avatarUrl} alt={st.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined !text-lg text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{st.name}</p>
                    <p className="text-[10px] text-on-surface-variant/50 truncate hidden lg:block">{st.email}</p>
                  </div>
                </div>
                <div className="col-span-4 lg:col-span-2 text-center">
                  <p className="text-base lg:text-lg font-black text-on-surface">{st.totalSessions}</p>
                  <p className="text-[9px] text-on-surface-variant/40 font-bold lg:hidden">sessions</p>
                </div>
                <div className="hidden lg:flex lg:col-span-2 justify-center">
                  {st.totalSessions > 0 ? (
                    <span className={cn(
                      'px-3 py-1 rounded-full text-xs font-black',
                      st.avgScore >= 70 ? 'bg-primary/10 text-primary' : st.avgScore >= 40 ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                    )}>{st.avgScore}%</span>
                  ) : (
                    <span className="text-xs text-on-surface-variant/30">—</span>
                  )}
                </div>
                <div className="hidden lg:block lg:col-span-2 text-center">
                  <p className="text-base font-black text-on-surface">{st.totalSessions > 0 ? `${st.avgOldcarts}/8` : '—'}</p>
                </div>
                <div className="hidden lg:block lg:col-span-2 text-center">
                  <p className="text-xs text-on-surface-variant">
                    {st.lastSession ? formatDate(st.lastSession) : '—'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {loadingDetail && (
        <div className="fixed inset-0 bg-surface/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-secondary/20 border-t-secondary animate-spin" />
        </div>
      )}
    </div>
  )
}
