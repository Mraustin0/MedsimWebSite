'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Scenario, DifficultyLevel } from '@/types'
import ScenarioCard from '@/components/ScenarioCard'
import { cn } from '@/components/ui/cn'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'

const FILTERS: { label: string; value: DifficultyLevel | 'all' }[] = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'ง่าย', value: 'easy' },
  { label: 'ปานกลาง', value: 'medium' },
  { label: 'ยาก', value: 'hard' },
]

type ViewType = 'Dashboard' | 'Simulations' | 'Library' | 'Performance'

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard' as ViewType },
  { icon: 'medical_services', label: 'Simulations' as ViewType },
  { icon: 'import_contacts', label: 'Library' as ViewType },
  { icon: 'leaderboard', label: 'Performance' as ViewType },
]

interface Props {
  scenarios: Scenario[]
}

export default function DashboardClient({ scenarios }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeView, setActiveView] = useState<ViewType>('Dashboard')
  const [filter, setFilter] = useState<DifficultyLevel | 'all'>('all')
  const confirm = useConfirm()

  const userName = session?.user?.name || 'Medical Student'
  const userRole = 'Medical Student'

  const handleProfileClick = () => { window.location.href = '/profile' }
  const handleLogout = async () => {
    const ok = await confirm({
      title: 'ออกจากระบบ',
      message: 'คุณต้องการออกจากระบบใช่หรือไม่?',
      confirmLabel: 'ออกจากระบบ',
      variant: 'danger',
    })
    if (ok) signOut({ callbackUrl: '/login' })
  }

  const filtered = filter === 'all'
    ? scenarios
    : scenarios.filter((s) => s.difficulty === filter)

  const renderContent = () => {
    switch (activeView) {
      case 'Dashboard':
        return <DashboardView scenarios={scenarios} setActiveView={setActiveView} />
      case 'Simulations':
        return <SimulationsView scenarios={filtered} filter={filter} setFilter={setFilter} />
      case 'Library':
        return <LibraryView />
      case 'Performance':
        return <PerformanceView />
      default:
        return <DashboardView scenarios={scenarios} setActiveView={setActiveView} />
    }
  }

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* ===== SIDEBAR: Hidden on mobile, flex on desktop ===== */}
      <aside className="fixed left-0 top-0 h-screen w-[72px] hover:w-64 bg-surface-container-lowest hidden lg:flex flex-col py-6 gap-y-8 z-50 border-r border-outline-variant/10 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group/sidebar overflow-hidden premium-shadow">
        
        {/* Brand Section */}
        <div className="flex items-center gap-4 px-3 flex-shrink-0" onClick={() => setActiveView('Dashboard')} style={{ cursor: 'pointer' }}>
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 flex-shrink-0 transition-transform duration-500 group-hover/sidebar:rotate-[360deg]">
            <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <h1 className="text-2xl font-black tracking-tighter text-primary leading-tight">MedSim</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold opacity-50">The Digital Mentor</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-2 px-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveView(item.label)}
              className={cn(
                'flex items-center gap-4 px-3 lg:px-4 py-3.5 rounded-2xl transition-all duration-300 group/item relative overflow-hidden',
                activeView === item.label
                  ? 'bg-primary-container/30 text-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
              )}
            >
              <span className={cn(
                'material-symbols-outlined !text-2xl transition-all duration-300 flex-shrink-0 group-hover/item:scale-110',
                activeView === item.label && "!fill-1"
              )}>
                {item.icon}
              </span>
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-bold text-[15px] tracking-tight whitespace-nowrap">
                {item.label}
              </span>
              {activeView === item.label && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer Items */}
        <div className="mt-auto flex flex-col gap-2 px-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleProfileClick() }}
            className="flex items-center gap-4 w-full py-3.5 rounded-2xl transition-all group/footer text-on-surface-variant hover:text-primary hover:bg-surface-container"
          >
            <span className="material-symbols-outlined !text-2xl flex-shrink-0 w-12 text-center group-hover/footer:rotate-45 transition-transform duration-500">settings</span>
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-bold text-sm tracking-tight whitespace-nowrap">Settings</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleLogout() }}
            className="flex items-center gap-4 w-full py-3.5 rounded-2xl transition-all group/footer text-on-surface-variant hover:text-error hover:bg-error/5"
          >
            <span className="material-symbols-outlined !text-2xl flex-shrink-0 w-12 text-center group-hover/footer:translate-x-1 transition-transform">logout</span>
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-bold text-sm tracking-tight whitespace-nowrap">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT CANVAS ===== */}
      <div className="ml-0 lg:ml-[72px] min-h-screen flex flex-col relative transition-all duration-500">
        
        {/* TOP APP BAR: Fixed Profile Color & Design */}
        <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 flex justify-between items-center px-6 lg:px-10 py-4">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-xl transition-colors group-focus-within:text-primary">search</span>
              <input 
                className="w-full pl-12 pr-6 py-2.5 bg-surface-container/40 border border-transparent rounded-2xl text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/20 focus:bg-white transition-all outline-none placeholder:text-on-surface-variant/30" 
                placeholder="Search cases..." 
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 lg:gap-8">
            <button className="relative p-2.5 text-on-surface-variant hover:bg-surface-container rounded-2xl transition-all active:scale-95 group">
              <span className="material-symbols-outlined !text-2xl">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
            </button>
            
            {/* PROFILE BUG FIX: Clean, High-Contrast Design */}
            <div className="flex items-center gap-4 pl-6 border-l border-outline-variant/10" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-on-surface tracking-tight leading-none mb-1">{userName}</p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{userRole}</p>
              </div>
              <div 
                className="w-10 h-10 rounded-2xl bg-primary-container flex items-center justify-center shadow-lg shadow-primary/5 cursor-pointer hover:scale-105 active:scale-95 transition-all border border-primary/10 overflow-hidden"
              >
                {session?.user?.image ? (
                  <img src={session.user.image} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined !text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-0">
          {renderContent()}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-nav border-t border-outline-variant/15 pb-safe">
          <div className="flex items-center justify-around py-3 px-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveView(item.label)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all active:scale-90',
                  activeView === item.label
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant/60'
                )}
              >
                <span className={cn(
                  "material-symbols-outlined !text-2xl",
                  activeView === item.label && "!fill-1"
                )}>{item.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                  {item.label}
                </span>
              </button>
            ))}
            <button
              onClick={() => router.push('/profile')}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all active:scale-90 text-on-surface-variant/60"
            >
              <span className="material-symbols-outlined !text-2xl">person</span>
              <span className="text-[10px] font-black uppercase tracking-[0.15em]">Profile</span>
            </button>
          </div>
        </nav>

      </div>
    </div>
  )
}

interface Stats {
  totalSessions: number
  avgScore: number
  avgDuration: number
  avgOldcarts: number
  streak: number
  weekly: number[]
  uniqueScenarios: number
}

function DashboardView({ scenarios, setActiveView }: { scenarios: Scenario[]; setActiveView: (v: ViewType) => void }) {
  const { data: session } = useSession()
  const firstName = session?.user?.name?.split(' ')[0] || 'Student'
  const specialty = (session?.user as any)?.specialty || 'Cardiology'
  const [stats, setStats] = useState<Stats | null>(null)
  const [weeklyMode, setWeeklyMode] = useState<'practice' | 'exam'>('exam')

  useEffect(() => {
    fetch('/api/session/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
  }, [])

  const avgMins = stats ? Math.floor(stats.avgDuration / 60) : 0
  const avgSecs = stats ? stats.avgDuration % 60 : 0

  // Practice = sessions count, Exam = avg score mapped to 0-N scale per day
  const weeklyData = stats?.weekly ?? [0, 0, 0, 0, 0, 0, 0]
  const weeklyMax = Math.max(...weeklyData, 1)

  // Skill mastery from real OLDCARTS avg — onset/location/duration/character = diagnosis skill
  // aggravating/relieving/timing/severity = patient care skill
  // We derive from avgOldcarts (0-8 scale)
  const oldcartsAvg = stats?.avgOldcarts ?? 0
  const diagnosisScore = stats ? Math.min(100, Math.round((oldcartsAvg / 4) * 100 * 0.85 + stats.avgScore * 0.15)) : 0
  const patientCareScore = stats ? Math.min(100, Math.round((oldcartsAvg / 8) * 100 * 0.7 + stats.avgScore * 0.3)) : 0

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-fade-in">
      {/* Welcome Hero */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <span className="px-4 py-1.5 bg-primary-container/40 text-on-primary-container text-[11px] font-black tracking-[0.2em] uppercase rounded-full border border-primary/10">
            Current Rotation: {specialty}
          </span>
          <h2 className="text-5xl font-black tracking-tighter text-on-surface leading-none">
            Welcome back, <span className="text-primary">{firstName}.</span>
          </h2>
          <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed font-medium">
            {stats && stats.totalSessions > 0
              ? <>คุณทำไปแล้ว <span className="text-primary font-black">{stats.totalSessions}</span> sessions คะแนนเฉลี่ย <span className="text-primary font-black">{stats.avgScore}%</span></>
              : <>เริ่มฝึกซักประวัติกับ AI patient ได้เลย</>
            }
          </p>
        </div>

        <div className="flex items-center gap-5 bg-surface-container-lowest p-6 rounded-[2.5rem] premium-shadow-md border border-outline-variant/5 group hover:scale-105 transition-transform duration-500">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
            <span className="material-symbols-outlined !text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Daily Streak</p>
            <p className="text-3xl font-black text-on-surface tracking-tight">{stats?.streak ?? 0} Days</p>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Weekly Progress Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-[3rem] p-8 lg:p-10 premium-shadow border border-outline-variant/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-on-surface tracking-tight">Weekly Progress</h3>
              <div className="flex gap-2 p-1.5 bg-surface-container rounded-2xl">
                <button
                  onClick={() => setWeeklyMode('practice')}
                  className={cn('px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all', weeklyMode === 'practice' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant')}
                >Practice</button>
                <button
                  onClick={() => setWeeklyMode('exam')}
                  className={cn('px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all', weeklyMode === 'exam' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant')}
                >Exam</button>
              </div>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-4 lg:gap-8 pb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                const heights = weeklyData.map((v) => Math.max((v / weeklyMax) * 100, 5))
                const todayIdx = new Date().getDay()
                const isActive = i === (todayIdx === 0 ? 6 : todayIdx - 1)
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-4 group/bar">
                    <div className="w-full bg-surface-container/50 rounded-2xl relative h-48 overflow-hidden transition-all group-hover/bar:bg-surface-container">
                      <div 
                        className={cn(
                          "absolute bottom-0 w-full transition-all duration-1000 ease-out rounded-t-lg",
                          isActive ? "bg-primary shadow-lg shadow-primary/30" : "bg-outline-variant/30 group-hover/bar:bg-outline-variant/50"
                        )}
                        style={{ height: `${heights[i]}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      isActive ? "text-primary" : "text-on-surface-variant/40"
                    )}>{day}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick-Start Card */}
        <div className="col-span-12 lg:col-span-4 cta-gradient rounded-[3rem] p-10 shadow-2xl shadow-primary/30 text-on-primary flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000" />

          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-xl">
              <span className="material-symbols-outlined !text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            </div>
            <h3 className="text-3xl font-black leading-tight tracking-tighter">Next Challenge: <br />{scenarios[0]?.chiefComplaint || 'Clinical Sim'}</h3>
            <p className="text-on-primary/80 text-sm font-medium leading-relaxed">{scenarios[0]?.description?.slice(0, 80) || 'เริ่ม simulation ใหม่'}...</p>
          </div>

          <button
            onClick={() => window.location.href = `/session/${scenarios[0]?.id}`}
            className="relative z-10 mt-10 w-full py-5 bg-white text-primary font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 text-xs"
          >
            Start Simulation
          </button>
        </div>

        {/* Rotation Queue */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-2xl font-black text-on-surface tracking-tight">Scenarios</h3>
            <button onClick={() => setActiveView('Simulations')} className="text-primary text-xs font-black uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {scenarios.slice(0, 3).map((s) => (
              <div
                key={s.id}
                onClick={() => window.location.href = `/session/${s.id}`}
                className="group flex items-center gap-6 p-6 bg-surface-container-lowest rounded-[2.5rem] hover:shadow-xl transition-all duration-500 border border-outline-variant/5 cursor-pointer"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-3xl bg-surface-container flex items-center justify-center text-3xl shadow-inner text-on-surface-variant overflow-hidden">
                    <span className="text-2xl">{s.gender === 'male' ? '👨' : '👩'}</span>
                  </div>
                  <div className={cn("absolute -bottom-2 -right-2 w-8 h-8 rounded-2xl border-4 border-surface flex items-center justify-center shadow-md",
                    s.difficulty === 'hard' ? 'bg-error-container' : s.difficulty === 'medium' ? 'bg-tertiary-container' : 'bg-primary-container'
                  )}>
                    <span className="material-symbols-outlined !text-sm text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {s.difficulty === 'hard' ? 'emergency' : s.difficulty === 'medium' ? 'timer' : 'favorite'}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-black text-on-surface tracking-tight">{s.name}</p>
                  <p className="text-sm text-on-surface-variant/60 font-bold">{s.chiefComplaint}</p>
                </div>
                <div className="hidden sm:block text-right pr-8">
                  <p className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em] mb-2">Difficulty</p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(dot => (
                      <div key={dot} className={cn("w-4 h-1.5 rounded-full transition-all",
                        dot <= (s.difficulty === 'hard' ? 3 : s.difficulty === 'medium' ? 2 : 1) ? "bg-primary" : "bg-outline-variant/30"
                      )} />
                    ))}
                  </div>
                </div>
                <button className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all group-hover:scale-110">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
          <div className="bg-surface-container-low rounded-[3rem] p-8 space-y-8 flex-1">
            <h3 className="text-xl font-black text-on-surface tracking-tight px-2">Performance Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] space-y-3 premium-shadow-md border border-outline-variant/5">
                <span className="material-symbols-outlined text-primary !text-3xl">psychology</span>
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Avg. Accuracy</p>
                  <p className="text-2xl font-black text-on-surface tracking-tight">{stats?.avgScore ?? 0}%</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] space-y-3 premium-shadow-md border border-outline-variant/5">
                <span className="material-symbols-outlined text-tertiary !text-3xl">avg_pace</span>
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Avg. Time</p>
                  <p className="text-2xl font-black text-on-surface tracking-tight">{avgMins}m {avgSecs}s</p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-outline-variant/10 space-y-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-on-surface">Skill Mastery</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline cursor-pointer">Report</span>
              </div>
              <div className="space-y-6">
                {[
                  { label: 'Diagnosis', score: diagnosisScore },
                  { label: 'Patient Care', score: patientCareScore },
                ].map(({ label, score }) => (
                  <div key={label}>
                    <div className="flex justify-between text-[11px] font-black mb-2 uppercase tracking-widest">
                      <span className="text-on-surface-variant/50">{label}</span>
                      <span className={cn(score >= 70 ? 'text-primary' : score >= 40 ? 'text-tertiary' : 'text-error')}>{score}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden p-0.5">
                      <div className={cn('h-full rounded-full shadow-sm transition-all duration-1000', score >= 70 ? 'bg-primary' : score >= 40 ? 'bg-tertiary' : 'bg-error')} style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SimulationsView({ scenarios, filter, setFilter }: { scenarios: Scenario[], filter: string, setFilter: (f: DifficultyLevel | 'all') => void }) {
  return (
    <div className="p-6 lg:p-10 space-y-10 animate-fade-in">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-on-surface leading-none">
              Simulation <span className="text-primary">Library</span>
            </h1>
            <p className="text-lg text-on-surface-variant font-medium">Select a scenario to begin your clinical training session.</p>
          </div>
          <div className="flex flex-wrap gap-2 p-1.5 bg-surface-container rounded-[1.5rem] border border-outline-variant/5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  'px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300',
                  filter === f.value
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-highest active:scale-95'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="animate-fade-in">
            <ScenarioCard scenario={scenario} />
          </div>
        ))}
        {scenarios.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-surface-container/20 rounded-[3rem] border-2 border-dashed border-outline-variant/20">
            <span className="material-symbols-outlined !text-6xl text-on-surface-variant/20 mb-4">search_off</span>
            <p className="text-xl font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">No scenarios found</p>
          </div>
        )}
      </div>
    </div>
  )
}

const CLINICAL_REFS = [
  {
    category: 'Cardiovascular',
    icon: 'cardiology',
    color: 'text-error',
    bg: 'bg-error/10',
    items: [
      { title: 'Chest Pain — OLDCARTS Approach', desc: 'Onset, radiation, associated symptoms, risk factors' },
      { title: 'Acute MI Red Flags', desc: 'Diaphoresis, jaw pain, left arm radiation, nausea' },
      { title: 'Heart Failure History', desc: 'Dyspnea on exertion, orthopnea, PND, edema' },
    ],
  },
  {
    category: 'Gastrointestinal',
    icon: 'gastroenterology',
    color: 'text-tertiary',
    bg: 'bg-tertiary/10',
    items: [
      { title: 'Abdominal Pain Framework', desc: 'Location, radiation, character, bowel habits, appetite' },
      { title: 'Peptic Ulcer History', desc: 'Epigastric pain, meals relation, NSAIDs/H.pylori history' },
      { title: 'GI Bleeding Assessment', desc: 'Hematemesis, melena, hematochezia, onset, quantity' },
    ],
  },
  {
    category: 'Respiratory',
    icon: 'pulmonology',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    items: [
      { title: 'Dyspnea History', desc: 'Onset, severity (MRC scale), triggers, orthopnea, sputum' },
      { title: 'Cough Assessment', desc: 'Duration, character, productive, hemoptysis, nocturnal' },
      { title: 'Asthma vs COPD', desc: 'Age of onset, triggers, reversibility, smoking history' },
    ],
  },
  {
    category: 'OLDCARTS Framework',
    icon: 'format_list_bulleted',
    color: 'text-primary',
    bg: 'bg-primary/10',
    items: [
      { title: 'O — Onset', desc: 'When did it start? Sudden or gradual? What were you doing?' },
      { title: 'L — Location', desc: 'Where exactly? Does it radiate or spread anywhere?' },
      { title: 'D — Duration', desc: 'How long does it last? Constant or intermittent?' },
      { title: 'C — Character', desc: 'Sharp, dull, burning, pressure, throbbing?' },
      { title: 'A — Aggravating', desc: 'What makes it worse? Movement, food, stress?' },
      { title: 'R — Relieving', desc: 'What makes it better? Rest, medications, position?' },
      { title: 'T — Timing', desc: 'Any pattern? Morning, night, after meals?' },
      { title: 'S — Severity', desc: 'Scale 1–10. How does it affect daily life?' },
    ],
  },
]

function LibraryView() {
  const [openCategory, setOpenCategory] = useState<string | null>('OLDCARTS Framework')

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-5xl font-black tracking-tighter text-on-surface leading-none">
          Clinical <span className="text-tertiary">Library</span>
        </h1>
        <p className="text-lg text-on-surface-variant font-medium">Quick reference for history-taking frameworks and clinical pearls.</p>
      </header>

      <div className="space-y-4">
        {CLINICAL_REFS.map((cat) => (
          <div key={cat.category} className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/5 premium-shadow overflow-hidden">
            <button
              onClick={() => setOpenCategory(openCategory === cat.category ? null : cat.category)}
              className="w-full flex items-center gap-5 p-6 lg:p-8 hover:bg-surface-container/30 transition-all"
            >
              <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0', cat.bg)}>
                <span className={cn('material-symbols-outlined !text-2xl', cat.color)} style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="font-black text-on-surface text-lg tracking-tight">{cat.category}</p>
                <p className="text-xs text-on-surface-variant/50 font-bold">{cat.items.length} topics</p>
              </div>
              <span className={cn('material-symbols-outlined text-on-surface-variant/40 transition-transform duration-300', openCategory === cat.category && 'rotate-180')}>expand_more</span>
            </button>

            {openCategory === cat.category && (
              <div className="px-6 lg:px-8 pb-6 space-y-3 animate-fade-in">
                <div className="h-px bg-outline-variant/10 mb-5" />
                {cat.items.map((item) => (
                  <div key={item.title} className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container/30 hover:bg-surface-container/60 transition-all">
                    <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', cat.color.replace('text-', 'bg-'))} />
                    <div>
                      <p className="font-black text-on-surface text-sm">{item.title}</p>
                      <p className="text-xs text-on-surface-variant/60 font-medium mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface SessionHistory {
  id: string
  scenarioId: string
  startedAt: string
  durationSeconds: number
  oldcartsCompleted: number
  totalQuestions: number
  scores: {
    onset: number; location: number; duration: number; character: number
    aggravating: number; relieving: number; timing: number; severity: number; overall: number
  } | null
}

const OLDCARTS_LABELS: { key: keyof NonNullable<SessionHistory['scores']>; label: string }[] = [
  { key: 'onset', label: 'Onset' },
  { key: 'location', label: 'Location' },
  { key: 'duration', label: 'Duration' },
  { key: 'character', label: 'Character' },
  { key: 'aggravating', label: 'Aggravating' },
  { key: 'relieving', label: 'Relieving' },
  { key: 'timing', label: 'Timing' },
  { key: 'severity', label: 'Severity' },
]

function PerformanceView() {
  const [history, setHistory] = useState<SessionHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/session/history')
      .then((r) => r.json())
      .then((data) => { setHistory(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const withFeedback = history.filter((s) => s.scores)

  // Avg per OLDCARTS category
  const avgScores = OLDCARTS_LABELS.map(({ key, label }) => {
    const avg = withFeedback.length > 0
      ? Math.round(withFeedback.reduce((sum, s) => sum + (s.scores![key] as number), 0) / withFeedback.length)
      : 0
    return { key, label, avg }
  })

  const overallAvg = withFeedback.length > 0
    ? Math.round(withFeedback.reduce((sum, s) => sum + s.scores!.overall, 0) / withFeedback.length)
    : 0

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
        <div className="w-24 h-24 bg-secondary/10 rounded-[2rem] flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined !text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>leaderboard</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">No Data Yet</h2>
          <p className="text-on-surface-variant max-w-sm font-medium">Complete a simulation to see your performance analytics here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-5xl font-black tracking-tighter text-on-surface leading-none">
          Performance <span className="text-primary">Analytics</span>
        </h1>
        <p className="text-lg text-on-surface-variant font-medium">{withFeedback.length} sessions analyzed</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* OLDCARTS Breakdown */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-[3rem] p-8 lg:p-10 premium-shadow border border-outline-variant/5 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-on-surface tracking-tight">OLDCARTS Breakdown</h3>
            <div className="px-4 py-2 bg-primary/10 rounded-2xl">
              <span className="text-primary font-black text-sm">Avg {overallAvg}%</span>
            </div>
          </div>
          <div className="space-y-5">
            {avgScores.map(({ key, label, avg }) => (
              <div key={key}>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                  <span className="text-on-surface-variant/70">{label}</span>
                  <span className={cn(avg >= 70 ? 'text-primary' : avg >= 40 ? 'text-tertiary' : 'text-error')}>{avg}%</span>
                </div>
                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-1000',
                      avg >= 70 ? 'bg-primary' : avg >= 40 ? 'bg-tertiary' : 'bg-error'
                    )}
                    style={{ width: `${avg}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: 'exercise', label: 'Sessions', value: history.length, color: 'text-primary' },
              { icon: 'psychology', label: 'Avg Score', value: `${overallAvg}%`, color: 'text-tertiary' },
              {
                icon: 'avg_pace', label: 'Avg Time',
                value: (() => {
                  const avg = history.length > 0 ? Math.round(history.reduce((s, h) => s + h.durationSeconds, 0) / history.length) : 0
                  return `${Math.floor(avg / 60)}m ${avg % 60}s`
                })(),
                color: 'text-secondary'
              },
              {
                icon: 'checklist', label: 'Avg OLDCARTS',
                value: withFeedback.length > 0
                  ? `${Math.round(withFeedback.reduce((s, h) => s + h.oldcartsCompleted, 0) / withFeedback.length)}/8`
                  : '0/8',
                color: 'text-primary'
              },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="bg-surface-container-lowest rounded-[2rem] p-6 premium-shadow-md border border-outline-variant/5 space-y-3">
                <span className={cn('material-symbols-outlined !text-3xl', color)} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-2xl font-black text-on-surface tracking-tight">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session History */}
        <div className="col-span-12 space-y-6">
          <h3 className="text-2xl font-black text-on-surface tracking-tight px-2">Recent Sessions</h3>
          <div className="space-y-4">
            {history.slice(0, 10).map((s) => {
              const mins = Math.floor(s.durationSeconds / 60)
              const secs = s.durationSeconds % 60
              const date = new Date(s.startedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
              const overall = s.scores?.overall ?? 0
              return (
                <div key={s.id} className="flex items-center gap-6 p-6 bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/5 premium-shadow-md">
                  <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shrink-0',
                    overall >= 70 ? 'bg-primary/10 text-primary' : overall >= 40 ? 'bg-tertiary/10 text-tertiary' : 'bg-error/10 text-error'
                  )}>
                    {overall}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-on-surface truncate">{s.scenarioId}</p>
                    <p className="text-xs text-on-surface-variant/60 font-bold">{date} · {mins}m {secs}s · {s.oldcartsCompleted}/8 OLDCARTS</p>
                  </div>
                  <div className="hidden sm:flex gap-1 shrink-0">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((dot) => (
                      <div key={dot} className={cn(
                        'w-2 h-2 rounded-full',
                        dot <= s.oldcartsCompleted ? 'bg-primary' : 'bg-outline-variant/30'
                      )} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
