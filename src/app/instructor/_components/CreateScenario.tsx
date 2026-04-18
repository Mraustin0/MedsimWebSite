'use client'

import { useState } from 'react'
import { DifficultyLevel } from '@/types'
import { cn } from '@/components/ui/cn'
import { useToast } from '@/components/ui/Toast'
import type { ScenarioRecord } from './types'

const TEMPLATES = [
  {
    label: 'Chest Pain',
    icon: 'cardiology',
    data: {
      name: 'นายสมชาย ใจดี',
      age: '52',
      gender: 'male' as 'male' | 'female',
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
      name: 'นางสาวสุดา แก้วใส',
      age: '28',
      gender: 'female' as 'male' | 'female',
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
      name: 'นายวิทยา มีสุข',
      age: '35',
      gender: 'male' as 'male' | 'female',
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

interface FormData {
  name: string; age: string; gender: 'male' | 'female'
  chiefComplaint: string; difficulty: DifficultyLevel
  description: string; systemPrompt: string; tags: string
}
interface OldcartsData { [key: string]: string }

export default function CreateScenario({
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
  const toast = useToast()

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
    set('name', t.data.name)
    set('age', t.data.age)
    set('gender', t.data.gender)
    set('chiefComplaint', t.data.chiefComplaint)
    set('tags', t.data.tags)
    set('difficulty', t.data.difficulty)
    setOldcarts(t.data.oldcarts)
    setTimeout(() => {
      const genBtn = document.querySelector('button[data-generate]') as HTMLButtonElement
      if (genBtn) genBtn.click()
    }, 300)
  }

  const handleGenerate = async () => {
    if (!formData.chiefComplaint) {
      toast.warning('กรอกข้อมูลไม่ครบ', 'กรุณากรอก Chief Complaint ก่อนสร้าง Prompt')
      return
    }
    setIsGenerating(true)
    toast.info('กำลังสร้าง...', 'AI กำลังสร้าง System Prompt ให้')
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
      if (data.systemPrompt) {
        set('systemPrompt', data.systemPrompt)
        toast.success('สร้างสำเร็จ', 'AI สร้าง System Prompt เรียบร้อยแล้ว')
      }
    } catch {
      toast.error('Generate ไม่สำเร็จ', 'เกิดข้อผิดพลาดในการสร้าง Prompt')
    } finally { setIsGenerating(false) }
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
      toast.success(
        isEdit ? 'อัปเดตสำเร็จ' : 'สร้างสำเร็จ',
        isEdit ? 'แก้ไข Scenario เรียบร้อยแล้ว' : 'สร้าง Scenario ใหม่เรียบร้อยแล้ว'
      )
      onCreated()
    } catch {
      toast.error('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่')
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls = 'w-full px-4 lg:px-5 py-3 lg:py-3.5 bg-surface-container/50 border border-outline-variant/15 rounded-2xl text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary/30 transition-all placeholder:text-on-surface-variant/30 outline-none'

  return (
    <div className="px-5 py-6 lg:px-10 lg:py-10 animate-fade-in">
      <header className="mb-6 lg:mb-10 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-on-surface leading-tight">
            {isEdit ? 'Edit' : 'Create'} <span className="text-secondary">Scenario</span>
          </h1>
          <p className="text-sm lg:text-base text-on-surface-variant font-medium">
            {isEdit ? `Editing: ${editing!.name}` : 'Configure the AI patient and clinical data.'}
          </p>
        </div>
        {isEdit && (
          <button onClick={onCancel} className="mt-1 px-4 py-2 rounded-2xl bg-surface-container text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-all shrink-0">
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

      <form id="scenario-form" onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">

        {/* Section 1: Patient Info */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/10 rounded-2xl lg:rounded-[2.5rem] p-4 lg:p-10 premium-shadow-md space-y-4 lg:space-y-6">
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
                      formData.difficulty === level
                        ? 'bg-secondary text-on-secondary border-secondary shadow-lg shadow-secondary/20'
                        : 'bg-surface-container text-on-surface-variant/60 border-outline-variant/10'
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

        {/* Section 2: OLDCARTS */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/10 rounded-2xl lg:rounded-[2.5rem] p-4 lg:p-10 premium-shadow-md space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">02</div>
              <h3 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] text-on-surface-variant/70">OLDCARTS — Expected Answers</h3>
            </div>
            <span className="text-[9px] lg:text-[10px] text-on-surface-variant/40 font-bold">AI จะเปิดเผยข้อมูลเหล่านี้เมื่อถูกถาม</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
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
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/10 rounded-2xl lg:rounded-[2.5rem] p-4 lg:p-10 premium-shadow-md space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-7 h-7 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary font-black text-[10px]">03</div>
              <h3 className="text-[10px] lg:text-xs font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] text-on-surface-variant/70">AI System Prompt</h3>
            </div>
            <button type="button" data-generate onClick={handleGenerate} disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 bg-tertiary/10 text-tertiary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-tertiary/20 transition-all active:scale-95 disabled:opacity-50">
              {isGenerating
                ? <><div className="w-3 h-3 border-2 border-tertiary border-t-transparent rounded-full animate-spin" />Generating...</>
                : <><span className="material-symbols-outlined !text-base">auto_awesome</span>Generate with AI</>
              }
            </button>
          </div>
          <textarea required rows={3}
            placeholder="กรอก OLDCARTS ด้านบนแล้วกด Generate with AI หรือเขียนเองก็ได้..."
            className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-surface-container/50 border border-outline-variant/15 rounded-2xl lg:rounded-3xl text-[11px] lg:text-sm focus:ring-2 focus:ring-tertiary/20 focus:border-tertiary/30 transition-all resize-y font-mono placeholder:text-on-surface-variant/20 outline-none min-h-[80px] lg:min-h-[280px]"
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
              className="flex-1 py-3.5 lg:py-5 rounded-2xl lg:rounded-[2rem] bg-surface-container text-on-surface-variant font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] text-xs transition-all active:scale-[0.98]">
              Cancel
            </button>
          )}
          <button disabled={isLoading} type="submit"
            className="flex-1 py-3.5 lg:py-5 rounded-2xl lg:rounded-[2rem] bg-gradient-to-r from-secondary to-secondary-dim text-on-secondary font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] text-xs shadow-2xl shadow-secondary/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3">
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
