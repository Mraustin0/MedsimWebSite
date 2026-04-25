'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/Toast'

export default function InstructorProfile() {
  const { data: session, update } = useSession()
  const toast = useToast()
  const userName = session?.user?.name || 'Instructor'
  const userEmail = session?.user?.email || ''
  const userAvatar = (session?.user as any)?.avatarUrl || session?.user?.image || ''

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    specialty: '',
    university: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        department: (session.user as any).yearOfStudy || '',
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
        body: JSON.stringify({
          name: formData.name,
          yearOfStudy: formData.department,
          specialty: formData.specialty,
          university: formData.university,
        }),
      })
      if (res.ok) {
        await update({ user: { ...session?.user, ...formData } })
        toast.success('บันทึกสำเร็จ', 'อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว')
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่')
    } finally {
      setIsSaving(false)
    }
  }

  const inputCls = 'w-full bg-transparent border-b border-outline-variant/20 focus:border-secondary outline-none text-sm lg:text-base font-bold text-on-surface transition-colors pb-1'

  return (
    <div className="px-5 py-6 lg:px-10 lg:py-10 animate-fade-in">
      <header className="mb-8 lg:mb-10">
        <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-on-surface leading-tight">
          Instructor <span className="text-secondary">Profile</span>
        </h1>
        <p className="text-sm lg:text-base text-on-surface-variant font-medium mt-1">
          Manage your clinical identity and platform preferences.
        </p>
      </header>

      {/* Profile Card */}
      <section className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/10 rounded-2xl lg:rounded-[2.5rem] p-5 lg:p-10 premium-shadow-md mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group/avatar">
            <div className="w-24 h-24 lg:w-36 lg:h-36 rounded-2xl lg:rounded-[2.5rem] overflow-hidden border-4 border-secondary-container shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105">
              {userAvatar ? (
                <img alt="Profile" className="w-full h-full object-cover" src={userAvatar} />
              ) : (
                <div className="w-full h-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined !text-5xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <input
                type="text"
                className="text-2xl lg:text-4xl font-black text-on-surface tracking-tighter bg-transparent border-b border-transparent focus:border-secondary outline-none transition-all w-full md:w-auto"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <span className="px-4 py-1.5 bg-secondary-container/40 text-secondary rounded-full text-[10px] font-black uppercase tracking-[0.2em] self-center md:self-auto border border-secondary/10">
                Clinical Instructor
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 lg:gap-y-6 gap-x-8 lg:gap-x-12 pt-3">
              {[
                { icon: 'mail', label: 'Institutional Email', value: userEmail, readonly: true },
                { icon: 'business_center', label: 'Department', value: formData.department, key: 'department' },
                { icon: 'stethoscope', label: 'Specialty / Field', value: formData.specialty, key: 'specialty' },
                { icon: 'domain', label: 'University', value: formData.university, key: 'university' },
              ].map((info) => (
                <div key={info.label} className="flex items-center gap-4 group/info">
                  <div className="w-9 h-9 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant/40 group-hover/info:bg-secondary/10 group-hover/info:text-secondary transition-colors">
                    <span className="material-symbols-outlined !text-2xl">{info.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant/40 mb-0.5">{info.label}</p>
                    {info.readonly ? (
                      <p className="text-sm lg:text-base font-bold text-on-surface opacity-60">{info.value}</p>
                    ) : (
                      <input
                        type="text"
                        className={inputCls}
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

      {/* Instructor Record + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <aside className="lg:col-span-4">
          <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/10 rounded-2xl lg:rounded-[2.5rem] p-5 lg:p-8 premium-shadow-md space-y-5">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined !text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              Instructor Record
            </h4>
            {[
              { label: 'Role', value: 'Clinical Instructor' },
              { label: 'Platform Access', value: 'Full Instructor' },
              { label: 'Account Status', value: 'Active' },
            ].map((item) => (
              <div key={item.label} className="p-4 bg-surface-container/30 rounded-2xl border border-outline-variant/5 space-y-1">
                <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{item.label}</p>
                <p className="text-base font-black text-on-surface tracking-tight">{item.value}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="lg:col-span-8">
          <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/10 rounded-2xl lg:rounded-[2.5rem] p-5 lg:p-8 premium-shadow-md">
            <h4 className="text-xl font-black text-on-surface tracking-tight mb-6">Notifications</h4>
            {[
              { icon: 'add_box', title: 'New Simulation Available', desc: 'Get alerted when new clinical cases are assigned.' },
              { icon: 'forum', title: 'Feedback Received', desc: 'Receive instant performance metrics from the AI mentor.' },
              { icon: 'update', title: 'System Updates', desc: 'Stay informed about new platform features and guidelines.' },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container/30 transition-all border border-transparent hover:border-outline-variant/10 mb-1">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined !text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface text-sm">{item.title}</p>
                    <p className="text-xs text-on-surface-variant">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Save Actions */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => {
            if (session?.user) {
              setFormData({
                name: session.user.name || '',
                department: (session.user as any).yearOfStudy || '',
                specialty: (session.user as any).specialty || '',
                university: (session.user as any).university || 'Khon Kaen University',
              })
            }
          }}
          className="px-8 py-3 text-on-surface-variant/50 font-black text-[10px] uppercase tracking-[0.2em] hover:text-on-surface transition-all"
        >
          Discard
        </button>
        <button
          disabled={isSaving}
          onClick={handleSave}
          className="px-8 py-3 bg-secondary text-on-secondary font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-secondary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
