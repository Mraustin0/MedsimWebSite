'use client'

import { Feedback, Scenario } from '@/types'
import { cn } from '@/components/ui/cn'
import { useRouter } from 'next/navigation'

interface Props {
  feedback: Feedback
  scenario: Scenario
  durationSeconds: number
  totalQuestions: number
  onRetry: () => void
  onBack: () => void
}

export default function FeedbackPanel({ feedback, scenario, durationSeconds, totalQuestions, onRetry, onBack }: Props) {
  const router = useRouter()
  const mins = Math.floor(durationSeconds / 60)
  const secs = durationSeconds % 60

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* TopNavBar (Mobile-optimized) */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant/10 flex justify-between items-center px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-primary">MedSim</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant/60 p-2 rounded-full hover:bg-surface-container transition-all">
            <span className="material-symbols-outlined !text-2xl">notifications</span>
          </button>
          <div 
            onClick={() => router.push('/profile')}
            className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center border border-primary/10 cursor-pointer active:scale-95 transition-all shadow-sm shadow-primary/5"
          >
            <span className="material-symbols-outlined !text-xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-24 px-5 max-w-[390px] mx-auto space-y-8 animate-fade-in">
        {/* Hero Header */}
        <header className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary text-on-primary text-[10px] font-black tracking-[0.2em] uppercase rounded-full">
              SIMULATION COMPLETE
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-on-surface leading-tight">
            Excellent Work, Student.
          </h1>
          <p className="body-md text-on-surface-variant leading-relaxed font-medium">
            Your clinical interaction with <span className="font-bold text-on-surface">{scenario.name}</span> shows strong foundational skills. Review the detailed AI analysis below.
          </p>
        </header>

        {/* Stats Bento Grid (2x2) */}
        <section className="grid grid-cols-2 gap-4">
          {[
            { icon: 'clinical_notes', label: 'Accuracy', value: `${feedback.scores.overall}%`, color: 'text-primary' },
            { icon: 'timer', label: 'Time spent', value: `${mins}:${secs.toString().padStart(2, '0')}`, color: 'text-tertiary' },
            { icon: 'verified_user', label: 'Safety Score', value: feedback.scores.overall >= 80 ? 'A+' : 'B', color: 'text-primary' },
            { icon: 'local_activity', label: 'OLDCARTS', value: `${feedback.oldcartsCompleted}/8`, color: 'text-secondary' },
          ].map((stat, i) => (
            <div key={i} className="bg-surface-container-lowest p-5 rounded-[2rem] premium-shadow-md border border-outline-variant/5 flex flex-col justify-between h-36">
              <span className={cn("material-symbols-outlined !text-2xl", stat.color)}>{stat.icon}</span>
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/40 mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-on-surface tracking-tighter">{stat.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Progress Overview */}
        <section className="bg-surface-container-lowest p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] premium-shadow border border-outline-variant/5 space-y-6 lg:space-y-8">
          <h2 className="text-base lg:text-lg font-black tracking-tight uppercase tracking-widest text-on-surface-variant/60 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Clinical Breakdown
          </h2>
          <div className="space-y-5 lg:space-y-6">
            {Object.entries(feedback.scores)
              .filter(([key]) => ['onset', 'location', 'duration', 'character'].includes(key))
              .map(([key, value]) => (
              <div key={key} className="space-y-2 group">
                <div className="flex justify-between text-xs lg:text-sm">
                  <span className="font-bold text-on-surface-variant capitalize">{key}</span>
                  <span className="text-primary font-black">{value}%</span>
                </div>
                <div className="w-full h-1.5 lg:h-2 bg-surface-container rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${value}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Mentor Feedback Cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-black tracking-tight px-1 text-on-surface">Mentor Feedback</h2>
          
          {/* Success Card */}
          {feedback.good.length > 0 && (
            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-[2rem] space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-black text-xs tracking-[0.15em] uppercase">Clinical Strengths</span>
              </div>
              <ul className="space-y-2">
                {feedback.good.slice(0, 2).map((item, i) => (
                  <li key={i} className="text-sm font-medium text-on-surface-variant leading-relaxed flex gap-2">
                    <span className="opacity-40">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Caution Card */}
          {feedback.missed.length > 0 && (
            <div className="bg-error/5 border-l-4 border-error p-6 rounded-[2rem] space-y-3">
              <div className="flex items-center gap-3 text-error">
                <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <span className="font-black text-xs tracking-[0.15em] uppercase">Knowledge Gaps</span>
              </div>
              <ul className="space-y-2">
                {feedback.missed.slice(0, 2).map((item, i) => (
                  <li key={i} className="text-sm font-medium text-on-surface-variant leading-relaxed flex gap-2">
                    <span className="opacity-40">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Final CTA */}
        <section className="pt-4 pb-12 space-y-4">
          <button 
            onClick={onRetry}
            className="w-full cta-gradient py-5 rounded-[1.75rem] text-on-primary font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-xs"
          >
            Restart Simulation <span className="material-symbols-outlined !text-xl">play_circle</span>
          </button>
          <button 
            onClick={onBack}
            className="w-full py-5 rounded-[1.75rem] text-on-surface-variant font-black text-xs uppercase tracking-[0.2em] border border-outline-variant/20 hover:bg-surface-container-low transition-all active:scale-[0.98]"
          >
            Return to Dashboard
          </button>
        </section>
      </main>

      {/* Mobile Bottom Nav (Synced with other pages) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-outline-variant/15 pb-safe">
        <div className="flex items-center justify-around py-3 px-4">
          {[
            { icon: 'dashboard', label: 'Dashboard', href: '/dashboard' },
            { icon: 'medical_services', label: 'Simulations', href: '/dashboard', active: true },
            { icon: 'leaderboard', label: 'Performance', href: '/dashboard' },
            { icon: 'person', label: 'Profile', href: '/profile' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all active:scale-90',
                item.active ? 'text-primary font-bold' : 'text-on-surface-variant/60'
              )}
            >
              <span className={cn("material-symbols-outlined !text-2xl", item.active && "!fill-1")}>{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.1em]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
