'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/components/ui/cn'
import { useToast } from '@/components/ui/Toast'
import { useConfirm } from '@/components/ui/ConfirmDialog'
import type { ScenarioRecord } from './types'

export default function ScenarioList({ onEdit }: { onEdit: (s: ScenarioRecord) => void }) {
  const [scenarios, setScenarios] = useState<ScenarioRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const toast = useToast()
  const confirm = useConfirm()

  const load = () => {
    fetch('/api/scenarios')
      .then((r) => r.json())
      .then((data) => { setScenarios(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: 'ลบ Scenario',
      message: `ต้องการลบ "${name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      confirmLabel: 'ลบเลย',
      variant: 'danger',
    })
    if (!ok) return
    setDeletingId(id)
    try {
      await fetch(`/api/scenarios/${id}`, { method: 'DELETE' })
      setScenarios((prev) => prev.filter((s) => s.id !== id))
      toast.success('ลบสำเร็จ', `ลบ scenario "${name}" เรียบร้อยแล้ว`)
    } catch {
      toast.error('ลบไม่สำเร็จ', 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally { setDeletingId(null) }
  }

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-5 py-6 lg:px-10 lg:py-10 space-y-6 lg:space-y-10 animate-fade-in">
      <header className="space-y-1 pt-1">
        <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-on-surface leading-none">
          All <span className="text-secondary">Scenarios</span>
        </h1>
        <p className="text-sm lg:text-base text-on-surface-variant font-medium">{scenarios.length} scenarios created</p>
      </header>

      <div className="space-y-4">
        {scenarios.map((s) => {
          const date = new Date(s.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
          return (
            <div key={s.id} className="flex items-center gap-4 p-4 lg:p-5 bg-surface-container-lowest rounded-2xl lg:rounded-3xl border border-outline-variant/5 shadow-sm hover:shadow-md transition-all group">
              <div className="w-11 h-11 lg:w-13 lg:h-13 rounded-2xl bg-surface-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined !text-2xl text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>{s.gender === 'male' ? 'man' : 'woman'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm lg:text-base font-black text-on-surface tracking-tight truncate">{s.name}, {s.age} ปี</p>
                  <span className={cn(
                    'hidden sm:inline px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0',
                    s.difficulty === 'hard' ? 'bg-error/10 text-error' : s.difficulty === 'medium' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'
                  )}>{s.difficulty}</span>
                </div>
                <p className="text-xs text-on-surface-variant/60 font-semibold truncate">{s.chiefComplaint}</p>
                <p className="text-[10px] text-on-surface-variant/30 font-semibold mt-0.5 hidden sm:block">
                  {date}{s.createdBy ? ` · by ${s.createdBy.name}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(s)}
                  className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-secondary/10 hover:text-secondary transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined !text-base">edit</span>
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  disabled={deletingId === s.id}
                  className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-error/10 hover:text-error transition-all disabled:opacity-40 active:scale-95"
                >
                  {deletingId === s.id
                    ? <div className="w-3.5 h-3.5 border-2 border-error border-t-transparent rounded-full animate-spin" />
                    : <span className="material-symbols-outlined !text-base">delete</span>
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
