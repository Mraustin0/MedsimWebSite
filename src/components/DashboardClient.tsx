'use client'

import { useState } from 'react'
import { Scenario, DifficultyLevel } from '@/types'
import ScenarioCard from '@/components/ScenarioCard'
import { cn } from '@/components/ui/cn'

const FILTERS: { label: string; value: DifficultyLevel | 'all' }[] = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'ง่าย', value: 'easy' },
  { label: 'ปานกลาง', value: 'medium' },
  { label: 'ยาก', value: 'hard' },
]

const NAV_ITEMS = [
  { icon: '⊞', label: 'Dashboard', href: '/dashboard', active: true },
  { icon: '◎', label: 'Simulations', href: '#', active: false },
  { icon: '☰', label: 'Library', href: '#', active: false },
  { icon: '◈', label: 'Performance', href: '#', active: false },
]

interface Props {
  scenarios: Scenario[]
}

export default function DashboardClient({ scenarios }: Props) {
  const [filter, setFilter] = useState<DifficultyLevel | 'all'>('all')

  const filtered = filter === 'all'
    ? scenarios
    : scenarios.filter((s) => s.difficulty === filter)

  return (
    <div className="min-h-screen bg-surface pb-20 lg:pb-0">
      {/* ===== Desktop Side Nav ===== */}
      <aside
        className="fixed left-0 top-0 h-full flex-col py-8 bg-surface-container-lowest z-50 premium-shadow transition-all duration-300 ease-in-out overflow-hidden hidden lg:flex w-20 hover:w-56 group/sidebar"
      >
        <div className="flex items-center gap-3 px-5 mb-8 min-w-0">
          <div className="w-10 h-10 cta-gradient rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-on-primary text-lg font-bold">M</span>
          </div>
          <span className="text-xl font-extrabold text-primary whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
            MedSim
          </span>
        </div>
        <nav className="flex flex-col gap-2 px-3">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl transition-all duration-200 min-w-0',
                item.active
                  ? 'bg-primary-container/30 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
              )}
            >
              <span className="text-lg flex-shrink-0 w-5 text-center">{item.icon}</span>
              <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                {item.label}
              </span>
            </a>
          ))}
        </nav>
        <div className="mt-auto px-3">
          <button className="flex items-center gap-3 p-3 text-on-surface-variant hover:text-error transition-colors rounded-xl w-full">
            <span className="text-lg flex-shrink-0 w-5 text-center">↪</span>
            <span className="text-sm font-medium whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
              ออกจากระบบ
            </span>
          </button>
        </div>
      </aside>

      {/* ===== Top Nav ===== */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-40 flex justify-between items-center px-4 py-3 lg:pl-24 lg:px-6">
        <div className="flex items-center gap-4 lg:gap-8">
          <span className="text-xl font-extrabold tracking-tight text-primary">MedSim</span>
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  item.active
                    ? 'text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                )}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all">
            🔔
          </button>
          <div className="w-9 h-9 rounded-full cta-gradient flex items-center justify-center text-on-primary text-sm font-bold border-2 border-primary-container">
            U
          </div>
        </div>
      </nav>

      {/* ===== Main Content ===== */}
      <main className="pt-16 px-4 lg:pt-20 lg:pb-12 lg:px-6 lg:pl-28 max-w-7xl mx-auto">

        {/* Mobile Hero (design mockup style) */}
        <div className="lg:hidden mt-4 mb-6">
          <span className="inline-block px-3 py-1 bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
            Clinical Simulation
          </span>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-1">
            The Digital Mentor
          </h1>
          <p className="body-md text-on-surface-variant">
            เลือก scenario เพื่อเริ่มฝึกซักประวัติ
          </p>
        </div>

        {/* Desktop Header */}
        <header className="mb-8 mt-6 hidden lg:block">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="headline-lg text-on-surface mb-1">
                เลือก scenario การซักประวัติ
              </h1>
              <p className="body-md text-on-surface-variant">
                เลือกผู้ป่วยที่ต้องการฝึกฝนทักษะการวินิจฉัย
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200',
                    filter === f.value
                      ? 'cta-gradient text-on-primary scale-105'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest active:scale-95'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Mobile Filters — horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none lg:hidden">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                filter === f.value
                  ? 'cta-gradient text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant active:scale-95'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Scenario Grid — 1 col mobile, 2-3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {filtered.map((scenario) => (
            <div key={scenario.id} className="animate-fade-in">
              <ScenarioCard scenario={scenario} />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-on-surface-variant">
              <p className="text-4xl mb-3">🔍</p>
              <p className="title-md">ไม่พบ scenario ในระดับนี้</p>
            </div>
          )}
        </div>

        {/* Progress Footer — hidden on mobile to save space */}
        <footer className="mt-12 hidden lg:flex flex-col md:flex-row items-center justify-between p-8 bg-primary rounded-3xl gap-6">
          <div className="flex items-center gap-5">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(127,243,190,0.2)" strokeWidth="4"/>
                <circle cx="32" cy="32" r="28" fill="none" stroke="#71E4B1"
                  strokeWidth="4" strokeDasharray="175" strokeDashoffset="44"
                  strokeLinecap="round"/>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-on-primary">
                75%
              </span>
            </div>
            <div>
              <h4 className="title-md text-on-primary">ความก้าวหน้าของคุณ</h4>
              <p className="body-md text-primary-fixed/70">คุณสำเร็จไปแล้ว 12 จาก 16 scenarios พื้นฐาน</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="label-sm text-on-primary/60 mb-1">NEXT MILESTONE</p>
              <p className="label-lg text-on-primary font-bold">Clinical Expert Badge</p>
            </div>
            <div className="w-12 h-12 bg-primary-fixed-dim rounded-2xl flex items-center justify-center text-on-primary-fixed text-xl">
              🏆
            </div>
          </div>
        </footer>
      </main>

      {/* ===== Mobile Bottom Nav ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-nav border-t border-outline-variant/15">
        <div className="flex items-center justify-around py-2 px-4">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[60px]',
                item.active
                  ? 'text-primary'
                  : 'text-on-surface-variant'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span className={cn(
                'text-[10px] font-semibold uppercase tracking-wider',
                item.active && 'font-bold'
              )}>
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  )
}
