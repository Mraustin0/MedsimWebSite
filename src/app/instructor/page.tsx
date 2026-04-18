'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/components/ui/cn'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import NotificationBell from '@/components/NotificationBell'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

import type { InstructorView, ScenarioRecord } from './_components/types'
import InstructorDashboard from './_components/InstructorDashboard'
import ScenarioList from './_components/ScenarioList'
import CreateScenario from './_components/CreateScenario'
import StudentPerformance from './_components/StudentPerformance'
import InstructorProfile from './_components/InstructorProfile'

const NAV_ITEMS: { icon: string; label: InstructorView }[] = [
  { icon: 'dashboard', label: 'Dashboard' },
  { icon: 'medical_services', label: 'Scenarios' },
  { icon: 'group', label: 'Students' },
  { icon: 'add_circle', label: 'Create' },
]

const VIEW_LABELS: Record<InstructorView, string> = {
  Dashboard: 'Dashboard',
  Scenarios: 'Scenarios',
  Students: 'Students',
  Create: 'Create',
  Profile: 'Profile',
}

export default function InstructorPage() {
  const { data: session } = useSession()
  const [activeView, setActiveView] = useState<InstructorView>('Dashboard')
  const [editingScenario, setEditingScenario] = useState<ScenarioRecord | null>(null)
  const confirm = useConfirm()

  const userName = session?.user?.name || 'Instructor'

  const handleLogout = async () => {
    const ok = await confirm({
      title: 'ออกจากระบบ',
      message: 'คุณต้องการออกจากระบบใช่หรือไม่?',
      confirmLabel: 'ออกจากระบบ',
      variant: 'danger',
    })
    if (ok) signOut({ callbackUrl: '/login' })
  }

  const handleEdit = (s: ScenarioRecord) => {
    setEditingScenario(s)
    setActiveView('Create')
  }

  const renderContent = () => {
    const wrap = (node: React.ReactNode, section: string) => (
      <ErrorBoundary section={section}>{node}</ErrorBoundary>
    )
    switch (activeView) {
      case 'Dashboard':
        return wrap(<InstructorDashboard setActiveView={setActiveView} />, 'Dashboard')
      case 'Scenarios':
        return wrap(<ScenarioList onEdit={handleEdit} />, 'Scenarios')
      case 'Students':
        return wrap(<StudentPerformance />, 'Students')
      case 'Create':
        return wrap(
          <CreateScenario
            editing={editingScenario}
            onCreated={() => { setEditingScenario(null); setActiveView('Scenarios') }}
            onCancel={() => { setEditingScenario(null); setActiveView('Scenarios') }}
          />, 'Create Scenario')
      case 'Profile':
        return wrap(<InstructorProfile />, 'Profile')
      default:
        return wrap(<InstructorDashboard setActiveView={setActiveView} />, 'Dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container">

      {/* ===== SIDEBAR ===== */}
      <aside className="fixed left-0 top-0 h-screen w-[72px] hover:w-64 bg-surface-container-lowest hidden lg:flex flex-col py-6 gap-y-8 z-50 border-r border-outline-variant/10 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group/sidebar overflow-hidden premium-shadow">
        {/* Logo */}
        <div className="flex items-center gap-4 px-3 flex-shrink-0 cursor-pointer" onClick={() => setActiveView('Dashboard')}>
          <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-on-secondary shadow-lg shadow-secondary/20 flex-shrink-0 transition-transform duration-500 group-hover/sidebar:rotate-[360deg]">
            <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <h1 className="text-2xl font-black tracking-tighter text-secondary leading-tight">MedSim</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold opacity-50">Instructor Portal</p>
          </div>
        </div>

        {/* Nav items */}
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
                activeView === item.label && '!fill-1'
              )}>{item.icon}</span>
              <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-bold text-[15px] tracking-tight whitespace-nowrap">{item.label}</span>
              {activeView === item.label && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto flex flex-col gap-2 px-3">
          <button
            onClick={() => setActiveView('Profile')}
            className={cn(
              'flex items-center gap-4 w-full py-3.5 rounded-2xl transition-all group/footer',
              activeView === 'Profile'
                ? 'bg-secondary-container/30 text-secondary shadow-sm'
                : 'text-on-surface-variant hover:text-secondary hover:bg-surface-container'
            )}
          >
            <span className="material-symbols-outlined !text-2xl flex-shrink-0 w-12 text-center group-hover/footer:rotate-45 transition-transform duration-500">settings</span>
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-bold text-sm tracking-tight whitespace-nowrap">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full py-3.5 rounded-2xl transition-all group/footer text-on-surface-variant hover:text-error hover:bg-error/5"
          >
            <span className="material-symbols-outlined !text-2xl flex-shrink-0 w-12 text-center group-hover/footer:translate-x-1 transition-transform">logout</span>
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-bold text-sm tracking-tight whitespace-nowrap">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="ml-0 lg:ml-[72px] min-h-screen relative">

        {/* Top Bar */}
        <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 flex justify-between items-center px-4 lg:px-10 py-3.5 gap-4">
          {/* Desktop: Faculty badge | Mobile: current view name */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden lg:inline-flex px-3 py-1 bg-secondary-container/20 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full border border-secondary/10">Faculty</span>
            <span className="lg:hidden text-base font-black text-on-surface tracking-tight">{VIEW_LABELS[activeView]}</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveView('Profile')}
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-on-surface tracking-tight leading-none">{userName}</p>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Instructor</p>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-secondary-container flex items-center justify-center shadow-md border border-secondary/10 overflow-hidden group-hover:scale-105 transition-transform">
                {session?.user?.image ? (
                  <img src={session.user.image} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined !text-xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="pb-28 lg:pb-0">
          {renderContent()}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-surface/95 backdrop-blur-xl border-t border-outline-variant/10 safe-area-inset-bottom">
          <div className="flex items-center justify-around pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-2">
            {[...NAV_ITEMS, { icon: 'person', label: 'Profile' as InstructorView }].map((item) => {
              const active = activeView === item.label
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveView(item.label)}
                  className="flex flex-col items-center gap-0.5 px-2 py-1 min-w-[56px] active:scale-90 transition-all"
                >
                  <div className={cn(
                    'w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200',
                    active ? 'bg-secondary-container' : 'bg-transparent'
                  )}>
                    <span className={cn(
                      'material-symbols-outlined !text-xl transition-all',
                      active ? 'text-secondary' : 'text-on-surface-variant/50'
                    )} style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      {item.icon}
                    </span>
                  </div>
                  <span className={cn(
                    'text-[9px] font-black uppercase tracking-[0.1em] transition-colors',
                    active ? 'text-secondary' : 'text-on-surface-variant/40'
                  )}>{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
