'use client'

import { Feedback, Scenario } from '@/types'
import { cn } from '@/components/ui/cn'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'

interface Props {
  feedback: Feedback
  scenario: Scenario
  durationSeconds: number
  totalQuestions: number
  onRetry: () => void
  onBack: () => void
}

// ── Confetti ──────────────────────────────────────────────────────────────────
function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const COLORS = ['#006948', '#7FF3BE', '#A13A32', '#FFD700', '#60a5fa', '#f472b6']
    const pieces = Array.from({ length: 130 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      w: 8 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vy: 2 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 3,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.18,
      opacity: 1,
    }))

    let frame: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = 0
      pieces.forEach((p) => {
        p.y += p.vy
        p.x += p.vx
        p.angle += p.spin
        if (p.y > canvas.height * 0.7) p.opacity = Math.max(0, p.opacity - 0.025)
        if (p.opacity <= 0) return
        alive++
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      if (alive > 0) frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [active])

  return canvasRef
}

// ── Count-up ──────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, delay = 300) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now()
      const step = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(eased * target))
        if (progress < 1) rafRef.current = requestAnimationFrame(step)
      }
      rafRef.current = requestAnimationFrame(step)
    }, delay)

    return () => {
      clearTimeout(timeout)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration, delay])

  return value
}

export default function FeedbackPanel({ feedback, scenario, durationSeconds, totalQuestions, onRetry, onBack }: Props) {
  const router = useRouter()
  const mins = Math.floor(durationSeconds / 60)
  const secs = durationSeconds % 60
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const text = [
      `📋 MedSim Results — ${scenario.name}`,
      `Overall: ${feedback.scores.overall}%`,
      `Time: ${mins}:${secs.toString().padStart(2, '0')}`,
      `OLDCARTS: ${feedback.oldcartsCompleted}/8`,
      ``,
      `Strengths: ${feedback.good.slice(0, 2).join(', ') || '-'}`,
      `To Improve: ${feedback.missed.slice(0, 2).join(', ') || '-'}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // mounted flag — lets CSS transitions fire after first paint
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Confetti for high scores
  const confettiRef = useConfetti(feedback.scores.overall >= 80)

  // Count-up for overall score
  const animatedOverall = useCountUp(feedback.scores.overall, 1400, 300)

  // OLDCARTS breakdown scores
  const breakdownKeys = ['onset', 'location', 'duration', 'character', 'aggravating', 'relieving', 'timing', 'severity'] as const

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* Confetti canvas */}
      {feedback.scores.overall >= 80 && (
        <canvas ref={confettiRef} className="fixed inset-0 pointer-events-none z-[100] no-print" />
      )}

      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/10 flex justify-between items-center px-6 py-3 no-print">
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

      <main className="pt-20 pb-24 px-5 w-full max-w-xl lg:max-w-2xl mx-auto space-y-8 animate-fade-in">
        {/* Hero Header */}
        <header className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-primary text-on-primary text-[10px] font-black tracking-[0.2em] uppercase rounded-full">
              SIMULATION COMPLETE
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-on-surface leading-tight">
            {feedback.scores.overall >= 80 ? 'Excellent Work, Student.' : feedback.scores.overall >= 60 ? 'Good Effort, Student.' : 'Keep Practicing, Student.'}
          </h1>
          <p className="body-md text-on-surface-variant leading-relaxed font-medium">
            Your clinical interaction with <span className="font-bold text-on-surface">{scenario.name}</span> shows{' '}
            {feedback.scores.overall >= 80 ? 'strong foundational skills.' : 'room for growth.'} Review the detailed AI analysis below.
          </p>
        </header>

        {/* Stats Bento Grid (2x2) */}
        <section className="grid grid-cols-2 gap-4">
          {/* Overall Accuracy — animated count-up */}
          <div className="bg-surface-container-lowest p-5 rounded-[2rem] premium-shadow-md border border-outline-variant/5 flex flex-col justify-between h-36 relative overflow-hidden">
            <span className="material-symbols-outlined !text-2xl text-primary">clinical_notes</span>
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/40 mb-1">Accuracy</p>
              <p className="text-2xl font-black text-on-surface tracking-tighter tabular-nums">
                {animatedOverall}<span className="text-lg">%</span>
              </p>
            </div>
            {/* Subtle radial fill behind the number */}
            <div
              className="absolute bottom-0 left-0 h-1 bg-primary rounded-full score-bar"
              style={{ width: mounted ? `${feedback.scores.overall}%` : '0%' }}
            />
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-[2rem] premium-shadow-md border border-outline-variant/5 flex flex-col justify-between h-36">
            <span className="material-symbols-outlined !text-2xl text-tertiary">timer</span>
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/40 mb-1">Time spent</p>
              <p className="text-2xl font-black text-on-surface tracking-tighter">{mins}:{secs.toString().padStart(2, '0')}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-[2rem] premium-shadow-md border border-outline-variant/5 flex flex-col justify-between h-36">
            <span className="material-symbols-outlined !text-2xl text-tertiary">tips_and_updates</span>
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/40 mb-1">Hints Used</p>
              <p className="text-2xl font-black text-on-surface tracking-tighter">{feedback.hintsUsed ?? 0}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-[2rem] premium-shadow-md border border-outline-variant/5 flex flex-col justify-between h-36">
            <span className="material-symbols-outlined !text-2xl text-secondary">local_activity</span>
            <div>
              <p className="text-[10px] font-black tracking-widest uppercase text-on-surface-variant/40 mb-1">OLDCARTS</p>
              <p className="text-2xl font-black text-on-surface tracking-tighter">{feedback.oldcartsCompleted}/8</p>
            </div>
          </div>
        </section>

        {/* Clinical Breakdown — animated progress bars */}
        <section className="bg-surface-container-lowest p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] premium-shadow border border-outline-variant/5 space-y-6 lg:space-y-8">
          <h2 className="text-base lg:text-lg font-black tracking-tight uppercase tracking-widest text-on-surface-variant/60 flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Clinical Breakdown
          </h2>
          <div className="space-y-5 lg:space-y-6">
            {breakdownKeys.map((key, idx) => {
              const value = feedback.scores[key] ?? 0
              return (
                <div key={key} className="space-y-2 group">
                  <div className="flex justify-between text-xs lg:text-sm">
                    <span className="font-bold text-on-surface-variant capitalize">{key}</span>
                    <span className="text-primary font-black tabular-nums">{value}%</span>
                  </div>
                  <div className="w-full h-1.5 lg:h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full score-bar"
                      style={{
                        width: mounted ? `${value}%` : '0%',
                        transitionDelay: `${idx * 80}ms`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Mentor Feedback Cards */}
        <section className="space-y-4">
          <h2 className="text-lg font-black tracking-tight px-1 text-on-surface">Mentor Feedback</h2>

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

          {feedback.tips.length > 0 && (
            <div className="bg-tertiary/5 border-l-4 border-tertiary p-6 rounded-[2rem] space-y-3">
              <div className="flex items-center gap-3 text-tertiary">
                <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>tips_and_updates</span>
                <span className="font-black text-xs tracking-[0.15em] uppercase">Tips to Improve</span>
              </div>
              <ul className="space-y-2">
                {feedback.tips.slice(0, 3).map((item, i) => (
                  <li key={i} className="text-sm font-medium text-on-surface-variant leading-relaxed flex gap-2">
                    <span className="opacity-40">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Final CTA */}
        <section className="pt-4 pb-12 space-y-4 no-print">
          <button
            onClick={onRetry}
            className="w-full cta-gradient py-5 rounded-[1.75rem] text-on-primary font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-xs"
          >
            Restart Simulation <span className="material-symbols-outlined !text-xl">play_circle</span>
          </button>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 py-5 rounded-[1.75rem] text-on-surface-variant font-black text-xs uppercase tracking-[0.2em] border border-outline-variant/20 hover:bg-surface-container-low transition-all active:scale-[0.98]"
            >
              Return to Dashboard
            </button>
            <button
              onClick={handleShare}
              className={cn(
                'py-5 px-6 rounded-[1.75rem] font-black text-xs border transition-all active:scale-[0.98] flex items-center gap-2',
                copied
                  ? 'bg-primary text-on-primary border-primary'
                  : 'text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-low'
              )}
              title="Copy results to clipboard"
            >
              <span className="material-symbols-outlined !text-lg">{copied ? 'check' : 'share'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="py-5 px-6 rounded-[1.75rem] text-on-surface-variant font-black text-xs border border-outline-variant/20 hover:bg-surface-container-low transition-all active:scale-[0.98] flex items-center gap-2"
              title="Export as PDF"
            >
              <span className="material-symbols-outlined !text-lg">print</span>
            </button>
          </div>
        </section>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-outline-variant/15 pb-safe no-print">
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
              <span className={cn('material-symbols-outlined !text-2xl', item.active && '!fill-1')}>{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.1em]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
