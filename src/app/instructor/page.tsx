'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scenario, DifficultyLevel } from '@/types'
import { cn } from '@/components/ui/cn'

export default function InstructorPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female',
    chiefComplaint: '',
    difficulty: 'medium' as DifficultyLevel,
    description: '',
    systemPrompt: '',
    tags: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) throw new Error('Failed to create scenario')

      alert('สร้าง Scenario สำเร็จ!')
      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      alert('เกิดข้อผิดพลาดในการสร้าง Scenario')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container pb-24 lg:pb-0">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] lg:top-[-10%] lg:right-[-10%] w-[60%] lg:w-[40%] h-[40%] bg-primary/5 rounded-full blur-[80px] lg:blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] lg:bottom-[-10%] lg:left-[-10%] w-[60%] lg:w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[80px] lg:blur-[120px]" />
      </div>

      {/* Navigation Header */}
      <nav className="glass-nav sticky top-0 z-50 border-b border-outline-variant/10 px-4 lg:px-6 py-3 lg:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-surface-container rounded-xl transition-all group active:scale-90"
            >
              <svg className="w-5 h-5 text-on-surface-variant group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="overflow-hidden">
              <h1 className="text-sm lg:title-lg font-black text-on-surface truncate">Instructor Portal</h1>
              <p className="text-[10px] lg:label-sm text-on-surface-variant/60 uppercase tracking-wider font-bold truncate">New Exercise</p>
            </div>
          </div>
          <div className="flex-shrink-0">
             <span className="px-2.5 py-1 bg-secondary-container/20 text-on-secondary-container text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-full border border-secondary-container/10">
               Faculty
             </span>
          </div>
        </div>
      </nav>

      <main className="relative max-w-4xl mx-auto px-4 lg:px-6 py-6 lg:py-12">
        {/* Mobile Header Hero */}
        <header className="mb-8 lg:mb-12">
          <div className="lg:hidden flex justify-center mb-4">
            <div className="w-12 h-1 bg-outline-variant/20 rounded-full" />
          </div>
          <h2 className="text-3xl lg:display-md text-on-surface mb-2 tracking-tight font-black">
            Create <span className="text-primary">Scenario</span>
          </h2>
          <p className="text-sm lg:body-md text-on-surface-variant leading-relaxed">
            Configure the AI agent and patient clinical data.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
          {/* Card-based Sections for Mobile */}
          <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/10 rounded-3xl lg:rounded-[2.5rem] p-5 lg:p-12 premium-shadow-md overflow-hidden relative">
            
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <svg className="w-24 h-24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z"/>
              </svg>
            </div>

            <section className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">01</div>
                <h3 className="text-xs lg:label-lg font-black uppercase tracking-[0.2em] text-on-surface-variant/70">Patient Info</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] lg:label-sm font-bold text-on-surface-variant/80 ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. นายสมชาย ใจดี"
                    className="w-full px-4 lg:px-5 py-3 lg:py-3.5 bg-surface-container/50 border border-outline-variant/15 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-on-surface-variant/30"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] lg:label-sm font-bold text-on-surface-variant/80 ml-1">Age</label>
                    <input 
                      required
                      type="number" 
                      placeholder="52"
                      className="w-full px-4 lg:px-5 py-3 lg:py-3.5 bg-surface-container/50 border border-outline-variant/15 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-on-surface-variant/30"
                      value={formData.age}
                      onChange={e => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] lg:label-sm font-bold text-on-surface-variant/80 ml-1">Gender</label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 lg:px-5 py-3 lg:py-3.5 bg-surface-container/50 border border-outline-variant/15 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none"
                        value={formData.gender}
                        onChange={e => setFormData({...formData, gender: e.target.value as 'male' | 'female'})}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant opacity-40">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] lg:label-sm font-bold text-on-surface-variant/80 ml-1">Chief Complaint</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. เจ็บหน้าอก, ปวดท้อง"
                  className="w-full px-4 lg:px-5 py-3 lg:py-3.5 bg-surface-container/50 border border-outline-variant/15 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-on-surface-variant/30"
                  value={formData.chiefComplaint}
                  onChange={e => setFormData({...formData, chiefComplaint: e.target.value})}
                />
              </div>
            </section>

            <div className="my-8 lg:my-10 h-px bg-outline-variant/10 w-full" />

            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary font-black text-[10px]">02</div>
                <h3 className="text-xs lg:label-lg font-black uppercase tracking-[0.2em] text-on-surface-variant/70">Simulation Engine</h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1 px-1">
                  <label className="text-[11px] lg:label-sm font-bold text-on-surface-variant/80">AI Behavioral Persona</label>
                  <span className="text-[9px] opacity-40 font-bold uppercase tracking-wider">Markdown Supported</span>
                </div>
                <textarea 
                  required
                  rows={mobileOnlyRows()}
                  placeholder="Instructions for the AI on how to act as a patient..."
                  className="w-full px-4 lg:px-5 py-3.5 lg:py-4 bg-surface-container/50 border border-outline-variant/15 rounded-3xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all resize-none font-mono placeholder:text-on-surface-variant/20"
                  value={formData.systemPrompt}
                  onChange={e => setFormData({...formData, systemPrompt: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] lg:label-sm font-bold text-on-surface-variant/80 ml-1">Complexity Level</label>
                  <div className="flex gap-2">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({...formData, difficulty: level as DifficultyLevel})}
                        className={cn(
                          'flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border active:scale-95',
                          formData.difficulty === level 
                            ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' 
                            : 'bg-surface-container text-on-surface-variant/60 border-outline-variant/10'
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] lg:label-sm font-bold text-on-surface-variant/80 ml-1">Tags</label>
                  <input 
                    type="text" 
                    placeholder="e.g. cardiology, trauma"
                    className="w-full px-4 lg:px-5 py-3 lg:py-3.5 bg-surface-container/50 border border-outline-variant/15 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-on-surface-variant/30"
                    value={formData.tags}
                    onChange={e => setFormData({...formData, tags: e.target.value})}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Sticky/Fixed bottom button on mobile */}
          <div className="lg:pt-4">
            <button 
              disabled={isLoading}
              type="submit"
              className="w-full py-4.5 lg:py-5 rounded-2xl lg:rounded-[2rem] cta-gradient text-on-primary font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Deploy Simulation
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

function mobileOnlyRows() {
  if (typeof window !== 'undefined' && window.innerWidth < 1024) return 8
  return 10
}