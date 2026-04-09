'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { DifficultyLevel } from '@/types'
import { cn } from '@/components/ui/cn'

type InstructorView = 'Dashboard' | 'Scenarios' | 'Create'

const NAV_ITEMS: { icon: string; label: InstructorView }[] = [
  { icon: 'dashboard', label: 'Dashboard' },
  { icon: 'medical_services', label: 'Scenarios' },
  { icon: 'add_circle', label: 'Create' },
]

interface ScenarioRecord {
  id: string
  name: string
  age: number
  gender: string
  chiefComplaint: string
  difficulty: string
  description: string
  systemPrompt: string
  tags: string[]
  createdAt: string
  createdBy?: { name: string }
}

interface InstructorStats {
  totalScenarios: number
  totalSessions: number
  avgScore: number
  recentScenarios: ScenarioRecord[]
}

export default function InstructorPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeView, setActiveView] = useState<InstructorView>('Dashboard')
  const [editingScenario, setEditingScenario] = useState<ScenarioRecord | null>(null)

  const userName = session?.user?.name || 'Instructor'

  const handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      signOut({ callbackUrl: '/login' })
    }
  }

  const handleEdit = (s: ScenarioRecord) => {
    setEditingScenario(s)
    setActiveView('Create')
  }

  const renderContent = () => {
    switch (activeView) {
      case 'Dashboard':
        return <InstructorDashboard setActiveView={setActiveView} />
      case 'Scenarios':
        return <ScenarioList onEdit={handleEdit} />
      case 'Create':
        return (
          <CreateScenario
            editing={editingScenario}
            onCreated={() => { setEditingScenario(null); setActiveView('Scenarios') }}
            onCancel={() => { setEditingScenario(null); setActiveView('Scenarios') }}
          />
        )
      default:
        return <InstructorDashboard setActiveView={setActiveView} />
    }
  }

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* ===== SIDEBAR ===== */}
      <aside className="fixed left-0 top-0 h-screen w-[72px] hover:w-64 bg-surface-container-lowest hidden lg:flex flex-col py-6 gap-y-8 z-50 border-r border-outline-variant/10 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group/sidebar overflow-hidden premium-shadow">
        <div className="flex items-center gap-4 px-3 flex-shrink-0 cursor-pointer" onClick={() => setActiveView('Dashboard')}>
          <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-on-secondary shadow-lg shadow-secondary/20 flex-shrink-0 transition-transform duration-500 group-hover/sidebar:rotate-[360deg]">
            <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <h1 className="text-2xl font-black tracking-tighter text-secondary leading-tight">MedSim</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold opacity-50">Instructor Portal</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 px-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveView(item.label)}
              className={cn(
                'flex items-center gap-4 px-3 lg:px-4 py-3.5 rounded-2xl transition-all duration-300 group/item relative overflow-hidden',
                activeView === item.label
                  ? 'bg-secondary-container/30 text-secondary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-secondary'
              )}
            >
              <span className={cn(
                'material-symbols-outlined !text-2xl transition-all duration-300 flex-shrink-0 group-hover/item:scale-110',
                activeView === item.label && "!fill-1"
              )}>{item.icon}</span>
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-bold text-[15px] tracking-tight whitespace-nowrap">{item.label}</span>
              {activeView === item.label && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-r-full" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 px-3">
          <button
            onClick={(e) => { e.stopPropagation(); router.push('/profile') }}
            className="flex items-center gap-4 w-full py-3.5 rounded-2xl transition-all group/footer text-on-surface-variant hover:text-secondary hover:bg-surface-container"
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

      {/* ===== MAIN CONTENT ===== */}
      <div className="ml-0 lg:ml-[72px] min-h-screen flex flex-col relative transition-all duration-500">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 flex justify-between items-center px-6 lg:px-10 py-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-secondary-container/20 text-on-secondary-container text-[10px] font-black uppercase tracking-widest rounded-full border border-secondary-container/10">Faculty</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 pl-6 border-l border-outline-variant/10 cursor-pointer" onClick={() => router.push('/profile')}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-on-surface tracking-tight leading-none mb-1">{userName}</p>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Instructor</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-secondary-container flex items-center justify-center shadow-lg shadow-secondary/5 border border-secondary/10 overflow-hidden">
                {session?.user?.image ? (
                  <img src={session.user.image} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined !text-2xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
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
                  activeView === item.label ? 'text-secondary font-bold' : 'text-on-surface-variant/60'
                )}
              >
                <span className={cn("material-symbols-outlined !text-2xl", activeView === item.label && "!fill-1")}>{item.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.15em]">{item.label}</span>
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

/* =============== Dashboard View =============== */
function InstructorDashboard({ setActiveView }: { setActiveView: (v: InstructorView) => void }) {
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
    <div className="p-6 lg:p-10 space-y-10 animate-fade-in">
      {/* Welcome */}
      <section className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <span className="px-4 py-1.5 bg-secondary-container/40 text-on-secondary-container text-[11px] font-black tracking-[0.2em] uppercase rounded-full border border-secondary/10">
            Instructor Portal
          </span>
          <h2 className="text-5xl font-black tracking-tighter text-on-surface leading-none">
            Welcome, <span className="text-secondary">{firstName}.</span>
          </h2>
          <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed font-medium">
            จัดการ scenarios และติดตามผลนักศึกษาได้ที่นี่
          </p>
        </div>
      </section>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { icon: 'description', label: 'Scenarios', value: stats?.totalScenarios ?? 0, color: 'text-secondary' },
          { icon: 'group', label: 'Total Sessions', value: stats?.totalSessions ?? 0, color: 'text-primary' },
          { icon: 'psychology', label: 'Avg Score', value: `${stats?.avgScore ?? 0}%`, color: 'text-tertiary' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="bg-surface-container-lowest rounded-[2.5rem] p-8 premium-shadow border border-outline-variant/5 space-y-3">
            <span className={cn('material-symbols-outlined !text-3xl', color)} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">{label}</p>
              <p className="text-3xl font-black text-on-surface tracking-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-5 bg-gradient-to-br from-secondary to-secondary-dim rounded-[3rem] p-10 shadow-2xl shadow-secondary/30 text-on-secondary flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-8 -top-8 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-1000" />
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-xl">
              <span className="material-symbols-outlined !text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
            </div>
            <h3 className="text-3xl font-black leading-tight tracking-tighter">Create New<br />Scenario</h3>
            <p className="text-on-secondary/80 text-sm font-medium leading-relaxed">สร้างบททดสอบใหม่ให้นักศึกษาฝึกซักประวัติ</p>
          </div>
          <button
            onClick={() => setActiveView('Create')}
            className="relative z-10 mt-10 w-full py-5 bg-white text-secondary font-black uppercase tracking-[0.2em] rounded-2xl hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-95 text-xs"
          >
            Get Started
          </button>
        </div>

        {/* Recent Scenarios */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-2xl font-black text-on-surface tracking-tight">Recent Scenarios</h3>
            <button onClick={() => setActiveView('Scenarios')} className="text-secondary text-xs font-black uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {stats?.recentScenarios && stats.recentScenarios.length > 0 ? (
              stats.recentScenarios.map((s) => (
                <div key={s.id} className="group flex items-center gap-6 p-6 bg-surface-container-lowest rounded-[2.5rem] hover:shadow-xl transition-all duration-500 border border-outline-variant/5">
                  <div className="w-14 h-14 rounded-3xl bg-surface-container flex items-center justify-center text-2xl shadow-inner">
                    {s.gender === 'male' ? '👨' : '👩'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black text-on-surface tracking-tight truncate">{s.name}</p>
                    <p className="text-sm text-on-surface-variant/60 font-bold truncate">{s.chiefComplaint}</p>
                  </div>
                  <div className="hidden sm:block">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                      s.difficulty === 'hard' ? 'bg-error/10 text-error' : s.difficulty === 'medium' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'
                    )}>{s.difficulty}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 flex flex-col items-center justify-center bg-surface-container/20 rounded-[3rem] border-2 border-dashed border-outline-variant/20">
                <span className="material-symbols-outlined !text-5xl text-on-surface-variant/20 mb-3">description</span>
                <p className="text-sm font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">No scenarios yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* =============== Scenario List View =============== */
function ScenarioList({ onEdit }: { onEdit: (s: ScenarioRecord) => void }) {
  const [scenarios, setScenarios] = useState<ScenarioRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = () => {
    fetch('/api/scenarios')
      .then((r) => r.json())
      .then((data) => { setScenarios(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ลบ scenario "${name}" ใช่หรือไม่?`)) return
    setDeletingId(id)
    try {
      await fetch(`/api/scenarios/${id}`, { method: 'DELETE' })
      setScenarios((prev) => prev.filter((s) => s.id !== id))
    } catch { alert('ลบไม่สำเร็จ') }
    finally { setDeletingId(null) }
  }

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-on-surface leading-none">
            All <span className="text-secondary">Scenarios</span>
          </h1>
          <p className="text-lg text-on-surface-variant font-medium">{scenarios.length} scenarios created</p>
        </div>
      </header>

      <div className="space-y-4">
        {scenarios.map((s) => {
          const date = new Date(s.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
          return (
            <div key={s.id} className="flex items-center gap-6 p-6 bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/5 premium-shadow-md hover:shadow-xl transition-all group">
              <div className="w-14 h-14 rounded-3xl bg-surface-container flex items-center justify-center text-2xl shadow-inner shrink-0">
                {s.gender === 'male' ? '👨' : '👩'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-black text-on-surface tracking-tight truncate">{s.name}, {s.age} ปี</p>
                <p className="text-sm text-on-surface-variant/60 font-bold truncate">{s.chiefComplaint}</p>
                <p className="text-[10px] text-on-surface-variant/40 font-bold mt-1">{date}{s.createdBy ? ` · by ${s.createdBy.name}` : ''}</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                {s.tags.slice(0, 2).map((t) => (
                  <span key={t} className="px-3 py-1 bg-surface-container rounded-full text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">{t}</span>
                ))}
                <span className={cn(
                  'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                  s.difficulty === 'hard' ? 'bg-error/10 text-error' : s.difficulty === 'medium' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'
                )}>{s.difficulty}</span>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(s)}
                  className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-secondary/10 hover:text-secondary transition-all"
                  title="Edit"
                >
                  <span className="material-symbols-outlined !text-lg">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  disabled={deletingId === s.id}
                  className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-error/10 hover:text-error transition-all disabled:opacity-40"
                  title="Delete"
                >
                  {deletingId === s.id
                    ? <div className="w-4 h-4 border-2 border-error border-t-transparent rounded-full animate-spin" />
                    : <span className="material-symbols-outlined !text-lg">delete</span>
                  }
                </button>
              </div>
            </div>
          )
        })}

        {scenarios.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center bg-surface-container/20 rounded-[3rem] border-2 border-dashed border-outline-variant/20">
            <span className="material-symbols-outlined !text-6xl text-on-surface-variant/20 mb-4">description</span>
            <p className="text-xl font-black text-on-surface-variant/40 uppercase tracking-[0.2em]">No scenarios yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* =============== Templates =============== */
const TEMPLATES = [
  {
    label: 'Chest Pain',
    icon: 'cardiology',
    data: {
      chiefComplaint: 'เจ็บหน้าอก',
      tags: 'cardiology, emergency',
      difficulty: 'hard' as DifficultyLevel,
      oldcarts: {
        onset: '2 ชั่วโมงที่แล้ว ขณะพักผ่อน',
        location: 'กลางหน้าอก ร้าวไปแขนซ้าย',
        duration: 'ต่อเนื่อง ไม่หาย',
        character: 'แน่น บีบ เหมือนมีอะไรทับ',
        aggravating: 'ขยับร่างกาย หายใจลึก',
        relieving: 'ยังไม่มีอะไรช่วยได้',
        timing: 'เป็นครั้งแรก',
        severity: '8/10',
      },
    },
  },
  {
    label: 'Abdominal Pain',
    icon: 'gastroenterology',
    data: {
      chiefComplaint: 'ปวดท้อง',
      tags: 'gastroenterology',
      difficulty: 'medium' as DifficultyLevel,
      oldcarts: {
        onset: '1 วันที่แล้ว',
        location: 'ท้องน้อยขวา',
        duration: 'เป็นๆ หายๆ ทุก 30 นาที',
        character: 'ปวดตื้อ บางครั้งปวดเกร็ง',
        aggravating: 'กดบริเวณท้องน้อยขวา',
        relieving: 'นอนราบขาเข้าหาท้อง',
        timing: 'แย่ลงในช่วงเย็น',
        severity: '6/10',
      },
    },
  },
  {
    label: 'Headache',
    icon: 'neurology',
    data: {
      chiefComplaint: 'ปวดหัว',
      tags: 'neurology',
      difficulty: 'easy' as DifficultyLevel,
      oldcarts: {
        onset: '3 ชั่วโมงที่แล้ว',
        location: 'ขมับทั้งสองข้าง',
        duration: 'ต่อเนื่อง',
        character: 'ปวดตุ้บๆ',
        aggravating: 'แสงสว่าง เสียงดัง',
        relieving: 'นอนในที่มืด',
        timing: 'มักเป็นช่วงเครียด',
        severity: '7/10',
      },
    },
  },
]

const OLDCARTS_FIELDS = [
  { key: 'onset', label: 'Onset', placeholder: 'เริ่มเมื่อไหร่ / ทำอะไรอยู่' },
  { key: 'location', label: 'Location', placeholder: 'ตำแหน่ง / ร้าวไปไหน' },
  { key: 'duration', label: 'Duration', placeholder: 'นานแค่ไหน / ต่อเนื่องหรือเป็นๆหายๆ' },
  { key: 'character', label: 'Character', placeholder: 'ลักษณะอาการ เช่น แน่น ปวดตื้อ แสบ' },
  { key: 'aggravating', label: 'Aggravating', placeholder: 'อะไรทำให้แย่ลง' },
  { key: 'relieving', label: 'Relieving', placeholder: 'อะไรทำให้ดีขึ้น' },
  { key: 'timing', label: 'Timing', placeholder: 'รูปแบบ เช่น เป็นช่วงเช้า หลังอาหาร' },
  { key: 'severity', label: 'Severity', placeholder: 'ความรุนแรง 1-10' },
] as const

type OldcartsKey = typeof OLDCARTS_FIELDS[number]['key']

interface FormData {
  name: string; age: string; gender: 'male' | 'female'
  chiefComplaint: string; difficulty: DifficultyLevel
  description: string; systemPrompt: string; tags: string
}
interface OldcartsData { [key: string]: string }

/* =============== Create/Edit Scenario View =============== */
function CreateScenario({
  editing,
  onCreated,
  onCancel,
}: {
  editing: ScenarioRecord | null
  onCreated: () => void
  onCancel: () => void
}) {
  const isEdit = !!editing
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: editing?.name || '',
    age: editing?.age?.toString() || '',
    gender: (editing?.gender as 'male' | 'female') || 'male',
    chiefComplaint: editing?.chiefComplaint || '',
    difficulty: (editing?.difficulty as DifficultyLevel) || 'medium',
    description: editing?.description || '',
    systemPrompt: editing?.systemPrompt || '',
    tags: editing?.tags?.join(', ') || '',
  })
  const [oldcarts, setOldcarts] = useState<OldcartsData>({})

  const set = (field: keyof FormData, val: string) =>
    setFormData((prev) => ({ ...prev, [field]: val }))

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    set('chiefComplaint', t.data.chiefComplaint)
    set('tags', t.data.tags)
    set('difficulty', t.data.difficulty)
    setOldcarts(t.data.oldcarts)
  }

  const handleGenerate = async () => {
    if (!formData.chiefComplaint) { alert('กรอก Chief Complaint ก่อน'); return }
    setIsGenerating(true)
    try {
      const res = await fetch('/api/scenarios/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || 'ผู้ป่วย',
          age: formData.age || '40',
          gender: formData.gender,
          chiefComplaint: formData.chiefComplaint,
          oldcarts,
        }),
      })
      const data = await res.json()
      if (data.systemPrompt) set('systemPrompt', data.systemPrompt)
    } catch { alert('Generate ไม่สำเร็จ') }
    finally { setIsGenerating(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const url = isEdit ? `/api/scenarios/${editing!.id}` : '/api/scenarios'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed')
      onCreated()
    } catch {
      alert('เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls = 'w-full px-4 lg:px-5 py-3 lg:py-3.5 bg-surface-container/50 border border-outline-variant/15 rounded-2xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary/30 transition-all placeholder:text-on-surface-variant/30 outline-none'

  return (
    <div className="p-6 lg:p-10 animate-fade-in">
      <header className="mb-8 lg:mb-10 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-on-surface leading-none">
            {isEdit ? 'Edit' : 'Create'} <span className="text-secondary">Scenario</span>
          </h1>
          <p className="text-lg text-on-surface-variant font-medium">
            {isEdit ? `Editing: ${editing!.name}` : 'Configure the AI patient and clinical data.'}
          </p>
        </div>
        {isEdit && (
          <button onClick={onCancel} className="mt-1 px-4 py-2 rounded-2xl bg-surface-container text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-all">
            Cancel
          </button>
        )}
      </header>

      {/* Template Presets */}
      {!isEdit && (
        <div className="mb-8 space-y-3">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 ml-1">Quick Templates</p>
          <div className="flex flex-wrap gap-3">
            {TEMPLATES.map((t) => (
              <button key={t.label} type="button" onClick={() => applyTemplate(t)}
                className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:border-secondary/30 hover:bg-secondary/5 transition-all text-sm font-bold text-on-surface-variant hover:text-secondary active:scale-95 premium-shadow-md">
                <span className="material-symbols-outlined !text-base">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">

        {/* Section 1: Patient Info */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/10 rounded-[2.5rem] p-6 lg:p-10 premium-shadow-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary font-black text-[10px]">01</div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/70">Patient Info</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-on-surface-variant/80 ml-1">Full Name</label>
              <input required type="text" placeholder="e.g. นายสมชาย ใจดี" className={inputCls}
                value={formData.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-on-surface-variant/80 ml-1">Age</label>
                <input required type="number" placeholder="52" className={inputCls}
                  value={formData.age} onChange={(e) => set('age', e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-on-surface-variant/80 ml-1">Gender</label>
                <select className={inputCls} value={formData.gender} onChange={(e) => set('gender', e.target.value as 'male' | 'female')}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-on-surface-variant/80 ml-1">Chief Complaint</label>
            <input required type="text" placeholder="e.g. เจ็บหน้าอก, ปวดท้อง" className={inputCls}
              value={formData.chiefComplaint} onChange={(e) => set('chiefComplaint', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-on-surface-variant/80 ml-1">Complexity</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                  <button key={level} type="button" onClick={() => set('difficulty', level)}
                    className={cn('flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border active:scale-95',
                      formData.difficulty === level ? 'bg-secondary text-on-secondary border-secondary shadow-lg shadow-secondary/20' : 'bg-surface-container text-on-surface-variant/60 border-outline-variant/10'
                    )}>{level}</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-on-surface-variant/80 ml-1">Tags (comma-separated)</label>
              <input type="text" placeholder="e.g. cardiology, trauma" className={inputCls}
                value={formData.tags} onChange={(e) => set('tags', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 2: OLDCARTS Expected Answers */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/10 rounded-[2.5rem] p-6 lg:p-10 premium-shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">02</div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/70">OLDCARTS — Expected Answers</h3>
            </div>
            <span className="text-[10px] text-on-surface-variant/40 font-bold">AI จะเปิดเผยข้อมูลเหล่านี้เมื่อถูกถาม</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OLDCARTS_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-[11px] font-black text-on-surface-variant/70 ml-1 uppercase tracking-wider">{label}</label>
                <input type="text" placeholder={placeholder}
                  className={inputCls}
                  value={oldcarts[key] || ''}
                  onChange={(e) => setOldcarts((prev) => ({ ...prev, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: AI System Prompt */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/10 rounded-[2.5rem] p-6 lg:p-10 premium-shadow-md space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary font-black text-[10px]">03</div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/70">AI System Prompt</h3>
            </div>
            <button type="button" onClick={handleGenerate} disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-tertiary/10 text-tertiary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-tertiary/20 transition-all active:scale-95 disabled:opacity-50">
              {isGenerating
                ? <><div className="w-3 h-3 border-2 border-tertiary border-t-transparent rounded-full animate-spin" />Generating...</>
                : <><span className="material-symbols-outlined !text-base">auto_awesome</span>Generate with AI</>
              }
            </button>
          </div>
          <textarea required rows={12} placeholder="กรอก OLDCARTS ด้านบนแล้วกด Generate with AI หรือเขียนเองก็ได้..."
            className="w-full px-5 py-4 bg-surface-container/50 border border-outline-variant/15 rounded-3xl text-sm focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary/30 transition-all resize-none font-mono placeholder:text-on-surface-variant/20 outline-none"
            value={formData.systemPrompt} onChange={(e) => set('systemPrompt', e.target.value)} />
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-on-surface-variant/80 ml-1">Description (Optional)</label>
            <textarea rows={2} placeholder="Short description shown to students..."
              className="w-full px-4 py-3 bg-surface-container/50 border border-outline-variant/15 rounded-2xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary/30 transition-all resize-none placeholder:text-on-surface-variant/20 outline-none"
              value={formData.description} onChange={(e) => set('description', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-4">
          {isEdit && (
            <button type="button" onClick={onCancel}
              className="flex-1 py-5 rounded-[2rem] bg-surface-container text-on-surface-variant font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98]">
              Cancel
            </button>
          )}
          <button disabled={isLoading} type="submit"
            className="flex-1 py-5 rounded-[2rem] bg-gradient-to-r from-secondary to-secondary-dim text-on-secondary font-black uppercase tracking-[0.2em] shadow-2xl shadow-secondary/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
            {isLoading
              ? <><div className="w-5 h-5 border-2 border-on-secondary/30 border-t-on-secondary rounded-full animate-spin" />Saving...</>
              : isEdit ? 'Save Changes' : 'Deploy Scenario'
            }
          </button>
        </div>
      </form>
    </div>
  )
}
