'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/components/ui/cn'

type ViewType = 'Dashboard' | 'Simulations' | 'Library' | 'Performance' | 'Settings'

const NAV_ITEMS = [
  { icon: 'dashboard', label: 'Dashboard' as ViewType, href: '/dashboard' },
  { icon: 'medical_services', label: 'Simulations' as ViewType, href: '/dashboard' },
  { icon: 'import_contacts', label: 'Library' as ViewType, href: '/dashboard' },
  { icon: 'leaderboard', label: 'Performance' as ViewType, href: '/dashboard' },
]

export default function ProfileClient() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [activeView, setActiveView] = useState<ViewType>('Settings')
  const [isSaving, setIsSaving] = useState(false)
  
  const userName = session?.user?.name || 'Medical Student'
  const userRole = (session?.user as any)?.role === 'INSTRUCTOR' ? 'Clinical Instructor' : 'Medical Student'
  const userAvatar = (session?.user as any)?.avatarUrl || session?.user?.image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop"

  const handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      signOut({ callbackUrl: '/login' })
    }
  }

  const [formData, setFormData] = useState({
    name: '',
    yearOfStudy: '',
    specialty: '',
    university: '',
  })

  const [notifications, setNotifications] = useState({
    newSimulation: true,
    feedback: true,
    systemUpdates: false
  })

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        yearOfStudy: (session.user as any).yearOfStudy || '',
        specialty: (session.user as any).specialty || '',
        university: (session.user as any).university || 'Khon Kaen University',
      })
    }
  }, [session])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        // Update local session
        await update({
          user: {
            ...session?.user,
            ...formData,
          }
        })
        alert('บันทึกข้อมูลสำเร็จ')
      }
    } catch (err) {
      console.error(err)
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container">
      {/* ===== SIDEBAR: Hidden on mobile, flex on desktop ===== */}
      <aside className="fixed left-0 top-0 h-screen w-[72px] hover:w-64 bg-surface-container-lowest hidden lg:flex flex-col py-6 gap-y-8 z-50 border-r border-outline-variant/10 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group/sidebar overflow-hidden premium-shadow">
        <div className="flex items-center gap-4 px-3 flex-shrink-0" onClick={() => router.push('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-on-primary shadow-lg shadow-primary/20 flex-shrink-0 transition-transform duration-500 group-hover/sidebar:rotate-[360deg]">
            <span className="material-symbols-outlined !text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
          </div>
          <div className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <h1 className="text-2xl font-black tracking-tighter text-primary leading-tight">MedSim</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold opacity-50">The Digital Mentor</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 px-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={cn(
                'flex items-center gap-4 px-3 lg:px-4 py-3.5 rounded-2xl transition-all duration-300 group/item relative overflow-hidden',
                activeView === item.label
                  ? 'bg-primary-container/30 text-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
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
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 px-3">
          <button 
            className={cn(
              "flex items-center gap-4 px-3 lg:px-4 py-3.5 rounded-2xl transition-all group/footer",
              activeView === 'Settings' ? 'bg-primary-container/30 text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
            )}
          >
            <span className={cn(
              "material-symbols-outlined !text-2xl flex-shrink-0 group-hover/footer:rotate-45 transition-transform duration-500",
              activeView === 'Settings' && "!fill-1"
            )}>settings</span>
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-bold text-sm tracking-tight whitespace-nowrap">Profile & Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 lg:px-4 py-3.5 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-2xl transition-all group/footer"
          >
            <span className="material-symbols-outlined !text-2xl flex-shrink-0 group-hover/footer:translate-x-1 transition-transform">logout</span>
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 font-bold text-sm tracking-tight whitespace-nowrap">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT CANVAS ===== */}
      <div className="ml-0 lg:ml-[72px] min-h-screen flex flex-col relative transition-all duration-500">
        
        {/* Top App Bar */}
        <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 flex justify-between items-center px-6 lg:px-10 py-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-on-surface tracking-tight">Student Profile</h2>
          </div>

          <div className="flex items-center gap-6 lg:gap-8">
            <button className="relative p-2.5 text-on-surface-variant hover:bg-surface-container rounded-2xl transition-all active:scale-95 group">
              <span className="material-symbols-outlined !text-2xl">notifications</span>
            </button>
            
            <div className="flex items-center gap-4 pl-6 border-l border-outline-variant/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-on-surface tracking-tight leading-none mb-1">{userName}</p>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{userRole}</p>
              </div>
              <div 
                onClick={() => router.push('/profile')}
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

        <main className="flex-1 p-6 lg:p-10 max-w-6xl mx-auto w-full space-y-10 animate-fade-in pb-24 lg:pb-12">
          {/* Header Section */}
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-on-surface tracking-tight">Student <span className="text-primary">Profile</span></h2>
            <p className="text-on-surface-variant font-medium">Manage your clinical identity and platform preferences.</p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Profile Header Card */}
            <section className="lg:col-span-12 bg-surface-container-lowest rounded-[3rem] p-8 lg:p-10 premium-shadow border border-outline-variant/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
              
              <div className="relative flex flex-col md:flex-row items-center md:items-start gap-10">
                <div className="relative group/avatar">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-[3rem] overflow-hidden border-4 border-primary-container shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105">
                    <img alt="Profile" className="w-full h-full object-cover" src={userAvatar} />
                  </div>
                  <button
                    onClick={() => alert('อัพโหลดรูปโปรไฟล์จะเปิดให้ใช้งานเร็วๆ นี้')}
                    className="absolute bottom-0 right-0 bg-primary text-on-primary w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border-4 border-surface hover:scale-110 transition-transform active:scale-95"
                  >
                    <span className="material-symbols-outlined !text-xl">edit</span>
                  </button>
                </div>

                <div className="flex-1 text-center md:text-left space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <input 
                        type="text"
                        className="text-4xl lg:text-5xl font-black text-on-surface tracking-tighter bg-transparent border-b border-transparent focus:border-primary outline-none transition-all w-full md:w-auto"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <span className="px-4 py-1.5 bg-primary-container/40 text-on-primary-container rounded-full text-[10px] font-black uppercase tracking-[0.2em] self-center md:self-auto border border-primary/10">Active Student</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 pt-4">
                    {[
                      { icon: 'mail', label: 'Institutional Email', value: session?.user?.email || '', readonly: true },
                      { icon: 'school', label: 'Year of Study', value: formData.yearOfStudy, key: 'yearOfStudy' },
                      { icon: 'stethoscope', label: 'Specialty Interest', value: formData.specialty, key: 'specialty' },
                      { icon: 'domain', label: 'University', value: formData.university, key: 'university' },
                    ].map((info) => (
                      <div key={info.label} className="flex items-center gap-4 group/info">
                        <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant/40 group-hover/info:bg-primary/10 group-hover/info:text-primary transition-colors">
                          <span className="material-symbols-outlined !text-2xl">{info.icon}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant/40 mb-0.5">{info.label}</p>
                          {info.readonly ? (
                            <p className="text-sm lg:text-base font-bold text-on-surface opacity-60">{info.value}</p>
                          ) : (
                            <input 
                              type="text"
                              className="w-full bg-transparent border-b border-outline-variant/20 focus:border-primary outline-none text-sm lg:text-base font-bold text-on-surface transition-colors pb-1"
                              value={info.value}
                              onChange={(e) => setFormData({ ...formData, [info.key!]: e.target.value })}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Academic Sidebar */}
            <aside className="lg:col-span-4 flex flex-col gap-8">
              <div className="bg-surface-container-low rounded-[2.5rem] p-8 space-y-8 border border-outline-variant/5">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Academic Record
                </h4>
                
                <div className="space-y-4">
                  {[
                    { label: 'Student ID', value: 'MED-2024-8842' },
                    { label: 'Current Rotation', value: 'Cardiology', progress: 75, footer: 'Week 9 of 12' },
                    { label: 'Simulation Hours', value: '142.5 hrs' },
                  ].map((item) => (
                    <div key={item.label} className="p-5 bg-surface-container-lowest rounded-3xl border border-outline-variant/5 shadow-sm space-y-3">
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{item.label}</p>
                      <p className="text-xl font-black text-on-surface tracking-tight">{item.value}</p>
                      {item.progress !== undefined && (
                        <div className="space-y-2 pt-1">
                          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${item.progress}%` }} />
                          </div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">{item.footer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="cta-gradient text-on-primary p-10 rounded-[2.5rem] shadow-2xl shadow-primary/30 relative overflow-hidden group">
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 group-hover:scale-110 transition-transform duration-700" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h4 className="text-sm font-black uppercase tracking-widest mb-4 opacity-60">Mentor Advice</h4>
                <p className="text-lg font-bold leading-relaxed mb-8 italic">
                  &ldquo;Alex, you&apos;ve shown great progress in your rhythm analysis. Focus on the next 3 advanced simulations to unlock your Senior Resident certification.&rdquo;
                </p>
                <button className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 border-on-primary/20 pb-1 hover:border-on-primary transition-all">View Career Path</button>
              </div>
            </aside>

            {/* Settings Content */}
            <section className="lg:col-span-8 space-y-8">
              {/* Notifications */}
              <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 lg:p-10 premium-shadow border border-outline-variant/5">
                <div className="flex items-center justify-between mb-10 px-2">
                  <h4 className="text-2xl font-black text-on-surface tracking-tight">Notifications</h4>
                  <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant/40">
                    <span className="material-symbols-outlined">notifications_active</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { id: 'newSimulation', icon: 'add_box', title: 'New Simulation Available', desc: 'Get alerted when new clinical cases are assigned.', checked: notifications.newSimulation },
                    { id: 'feedback', icon: 'forum', title: 'Feedback Received', desc: 'Receive instant performance metrics from the AI mentor.', checked: notifications.feedback },
                    { id: 'systemUpdates', icon: 'update', title: 'System Updates', desc: 'Stay informed about new platform features and guidelines.', checked: notifications.systemUpdates },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-5 rounded-3xl hover:bg-surface-container/30 transition-all group/toggle border border-transparent hover:border-outline-variant/10">
                      <div className="flex gap-5 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover/toggle:bg-primary group-hover/toggle:text-on-primary transition-all duration-500">
                          <span className="material-symbols-outlined !text-2xl">{item.icon}</span>
                        </div>
                        <div>
                          <p className="font-black text-on-surface tracking-tight">{item.title}</p>
                          <p className="text-xs text-on-surface-variant font-medium">{item.desc}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id as keyof typeof notifications] }))}
                        className={cn(
                          "relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none",
                          item.checked ? "bg-primary shadow-lg shadow-primary/20" : "bg-surface-container"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300",
                          item.checked ? "translate-x-6 shadow-sm" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Section */}
              <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 lg:p-10 premium-shadow border border-outline-variant/5">
                <div className="flex items-center justify-between mb-10 px-2">
                  <h4 className="text-2xl font-black text-on-surface tracking-tight">Security & Privacy</h4>
                  <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant/40">
                    <span className="material-symbols-outlined">security</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: 'key', title: 'Change Password', desc: 'Last updated 3 months ago. Recommendation: every 6 months.', btn: 'Update Credentials', primary: false },
                    { icon: 'gpp_good', title: 'Two-Factor Auth', desc: '2FA is currently Enabled. Protected by your mobile device.', btn: 'Manage Method', primary: true },
                  ].map((card) => (
                    <div key={card.title} className="p-8 border border-outline-variant/10 rounded-[2rem] hover:shadow-xl hover:border-primary/20 transition-all group/card bg-surface-container/10">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500",
                        card.primary ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "bg-surface-container text-on-surface-variant/40 group-hover/card:bg-primary group-hover/card:text-on-primary group-hover/card:shadow-lg"
                      )}>
                        <span className="material-symbols-outlined !text-2xl">{card.icon}</span>
                      </div>
                      <h5 className="font-black text-on-surface tracking-tight mb-2">{card.title}</h5>
                      <p className="text-xs text-on-surface-variant font-medium leading-relaxed mb-8">{card.desc}</p>
                      <button
                        onClick={() => alert(card.title === 'Change Password' ? 'เปลี่ยนรหัสผ่านจะเปิดให้ใช้งานเร็วๆ นี้' : 'การจัดการ 2FA จะเปิดให้ใช้งานเร็วๆ นี้')}
                        className={cn(
                          "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 border",
                          card.primary ? "bg-surface-container text-on-surface-variant border-transparent" : "border-primary text-primary hover:bg-primary/5"
                        )}
                      >
                        {card.btn}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
                <button
                  onClick={() => {
                    if (session?.user) {
                      setFormData({
                        name: session.user.name || '',
                        yearOfStudy: (session.user as any).yearOfStudy || '',
                        specialty: (session.user as any).specialty || '',
                        university: (session.user as any).university || 'Khon Kaen University',
                      })
                    }
                  }}
                  className="px-10 py-4 text-on-surface-variant/40 font-black text-[10px] uppercase tracking-[0.2em] hover:text-on-surface transition-all"
                >Discard Changes</button>
                <button 
                  disabled={isSaving}
                  onClick={handleSave}
                  className="px-10 py-4 bg-primary text-on-primary font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </section>
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-nav border-t border-outline-variant/15 pb-safe">
          <div className="flex items-center justify-around py-3 px-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all active:scale-90 text-on-surface-variant/60"
              >
                <span className="material-symbols-outlined !text-2xl">{item.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.1em]">{item.label}</span>
              </button>
            ))}
            <button className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all active:scale-90 text-primary font-bold">
              <span className="material-symbols-outlined !text-2xl !fill-1">person</span>
              <span className="text-[10px] font-black uppercase tracking-[0.1em]">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}
