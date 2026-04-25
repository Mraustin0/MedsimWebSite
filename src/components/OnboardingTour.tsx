'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/components/ui/cn'

const STORAGE_KEY = 'medsim-onboarding-done'

interface Step {
  title: string
  body: string
  icon: string
  color: string
}

const STEPS: Step[] = [
  {
    title: 'ยินดีต้อนรับสู่ MedSim! 👋',
    body: 'ระบบจำลองการซักประวัติผู้ป่วยด้วย AI ออกแบบมาเพื่อพัฒนาทักษะทางคลินิกของคุณ',
    icon: 'medical_services',
    color: 'text-primary',
  },
  {
    title: 'เลือก Scenario 🩺',
    body: 'เลือก scenario จาก library — มีระดับความยากตั้งแต่ง่าย ปานกลาง ไปถึงยาก เหมาะกับทุกระดับ',
    icon: 'cases',
    color: 'text-tertiary',
  },
  {
    title: 'ซักประวัติผู้ป่วย AI 💬',
    body: 'พิมพ์คำถามเพื่อซักประวัติ ใช้ framework OLDCARTS (Onset, Location, Duration, Character, Aggravating, Relieving, Timing, Severity)',
    icon: 'chat',
    color: 'text-secondary',
  },
  {
    title: 'ใช้ Hints เมื่อต้องการ 💡',
    body: 'มีปุ่ม hint ด้านล่างช่องพิมพ์ข้อความ — ใช้ได้เมื่อไม่รู้จะถามอะไร แต่พยายามซักด้วยตัวเองก่อน!',
    icon: 'tips_and_updates',
    color: 'text-tertiary',
  },
  {
    title: 'รับ Feedback จาก AI 📊',
    body: 'เมื่อจบ session คุณจะได้รับการวิเคราะห์โดยละเอียด — คะแนน OLDCARTS, จุดแข็ง และสิ่งที่ควรปรับปรุง',
    icon: 'analytics',
    color: 'text-primary',
  },
]

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done) setVisible(true)
  }, [])

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else finish()
  }

  const prev = () => setStep((s) => Math.max(0, s - 1))

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-[2.5rem] overflow-hidden premium-shadow border border-outline-variant/10 animate-fade-in">
        {/* Progress bar */}
        <div className="w-full h-1 bg-surface-container">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-8 space-y-6">
          {/* Icon */}
          <div className={cn('w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto', `bg-surface-container`)}>
            <span className={cn('material-symbols-outlined !text-4xl', current.color)} style={{ fontVariationSettings: "'FILL' 1" }}>
              {current.icon}
            </span>
          </div>

          {/* Text */}
          <div className="text-center space-y-3">
            <h2 className="text-xl font-black text-on-surface tracking-tight">{current.title}</h2>
            <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{current.body}</p>
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  i === step ? 'bg-primary w-6' : 'bg-outline-variant/50'
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={prev}
                className="flex-1 py-3 rounded-2xl border border-outline-variant/20 text-on-surface-variant font-black text-sm hover:bg-surface-container transition-all active:scale-95"
              >
                ก่อนหน้า
              </button>
            )}
            <button
              onClick={next}
              className="flex-1 py-3 cta-gradient text-on-primary font-black text-sm rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              {isLast ? 'เริ่มเลย!' : 'ถัดไป'}
            </button>
          </div>

          {!isLast && (
            <button onClick={finish} className="w-full text-center text-xs text-on-surface-variant/40 font-bold hover:text-on-surface-variant transition-colors">
              ข้ามบทแนะนำ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
