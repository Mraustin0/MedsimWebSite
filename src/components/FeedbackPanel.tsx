'use client'

import { Feedback, Scenario } from '@/types'
import { cn } from '@/components/ui/cn'

interface Props {
  feedback: Feedback
  scenario: Scenario
  durationSeconds: number
  totalQuestions: number
  onRetry: () => void
  onBack: () => void
}

function ScoreRing({ score }: { score: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (circ * score) / 100
  const color = score >= 80 ? '#006948' : score >= 60 ? '#006575' : '#B31B25'
  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(171,173,174,0.2)" strokeWidth="6"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={color}
          strokeWidth="6" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl font-black" style={{ color }}>
        {score}
      </span>
    </div>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'bg-primary' : value >= 60 ? 'bg-tertiary' : 'bg-error'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-on-surface-variant w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold text-on-surface w-8 text-right">{value}</span>
    </div>
  )
}

export default function FeedbackPanel({ feedback, scenario, durationSeconds, totalQuestions, onRetry, onBack }: Props) {
  const mins = Math.floor(durationSeconds / 60)
  const secs = durationSeconds % 60

  const metricCards = [
    { label: 'คะแนนรวม', value: feedback.scores.overall, suffix: '/100', isScore: true },
    { label: 'เวลาที่ใช้', value: `${mins}:${secs.toString().padStart(2,'0')}`, suffix: 'นาที', isScore: false },
    { label: 'คำถามทั้งหมด', value: totalQuestions, suffix: 'ข้อ', isScore: false },
    { label: 'OLDCARTS ครบ', value: feedback.oldcartsCompleted, suffix: '/8', isScore: false },
  ]

  const oldcartsBreakdown = [
    { label: 'Onset', value: feedback.scores.onset },
    { label: 'Location', value: feedback.scores.location },
    { label: 'Duration', value: feedback.scores.duration },
    { label: 'Character', value: feedback.scores.character },
    { label: 'Aggravating', value: feedback.scores.aggravating },
    { label: 'Relieving', value: feedback.scores.relieving },
    { label: 'Timing', value: feedback.scores.timing },
    { label: 'Severity', value: feedback.scores.severity },
  ].sort((a, b) => a.value - b.value)

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="bg-surface-container-low border-b border-outline-variant/10 pt-16 pb-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <a href="/dashboard" className="text-on-surface-variant hover:text-primary text-sm transition-colors">← Dashboard</a>
            <span className="text-on-surface-variant/40">/</span>
            <span className="text-sm text-on-surface">{scenario.name}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="avatar-halo">
                <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-3xl">
                  {scenario.gender === 'male' ? '👨' : '👩'}
                </div>
              </div>
              <div>
                <h1 className="headline-md text-on-surface">ผลการซักประวัติ</h1>
                <p className="body-md text-on-surface-variant">{scenario.name} — {scenario.chiefComplaint}</p>
              </div>
            </div>
            <div className="md:ml-auto">
              <ScoreRing score={feedback.scores.overall} />
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
            {metricCards.map((m) => {
              const s = typeof m.value === 'number' && m.isScore ? m.value as number : 0
              const bgClass = m.isScore
                ? s >= 80 ? 'bg-primary-container/30' : s >= 60 ? 'bg-tertiary-container/20' : 'bg-error-container/20'
                : 'bg-surface-container-lowest'
              return (
                <div key={m.label} className={cn('rounded-xl p-4 premium-shadow', bgClass)}>
                  <p className="label-sm text-on-surface-variant mb-1">{m.label}</p>
                  <p className="text-2xl font-black text-on-surface">
                    {m.value}<span className="text-sm font-medium text-on-surface-variant ml-1">{m.suffix}</span>
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OLDCARTS Breakdown */}
        <div className="bg-surface-container-lowest rounded-2xl premium-shadow p-6">
          <h2 className="title-md text-on-surface mb-4">OLDCARTS Breakdown</h2>
          <div className="flex flex-col gap-3">
            {oldcartsBreakdown.map((item) => (
              <ScoreBar key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </div>

        {/* Feedback Cards */}
        <div className="flex flex-col gap-4">
          {feedback.good.length > 0 && (
            <div className="bg-primary-container/20 border-l-4 border-primary rounded-xl p-4">
              <p className="label-md text-primary mb-2">จุดที่ทำได้ดี</p>
              <ul className="flex flex-col gap-1.5">
                {feedback.good.map((g, i) => (
                  <li key={i} className="body-md text-on-primary-container flex gap-2">
                    <span className="text-primary flex-shrink-0">✓</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {feedback.missed.length > 0 && (
            <div className="bg-error-container/10 border-l-4 border-error rounded-xl p-4">
              <p className="label-md text-error mb-2">สิ่งที่พลาด / ควรถามเพิ่ม</p>
              <ul className="flex flex-col gap-1.5">
                {feedback.missed.map((m, i) => (
                  <li key={i} className="body-md text-on-error-container flex gap-2">
                    <span className="text-error flex-shrink-0">✗</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {feedback.tips.length > 0 && (
            <div className="bg-tertiary-container/10 border-l-4 border-tertiary rounded-xl p-4">
              <p className="label-md text-tertiary mb-2">คำแนะนำจากอาจารย์</p>
              <ul className="flex flex-col gap-1.5">
                {feedback.tips.map((t, i) => (
                  <li key={i} className="body-md text-on-tertiary-container flex gap-2">
                    <span className="text-tertiary flex-shrink-0">💡</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-5xl mx-auto px-6 pb-12 flex flex-col sm:flex-row gap-3">
        <button onClick={onRetry} className="px-6 py-3 rounded-xl border border-primary text-primary font-semibold hover:bg-primary-container/20 transition-all active:scale-95">
          ลองใหม่ scenario เดิม
        </button>
        <button onClick={onBack} className="px-6 py-3 rounded-xl cta-gradient text-on-primary font-semibold active:scale-95 transition-all">
          เลือก scenario ใหม่
        </button>
      </div>
    </div>
  )
}
