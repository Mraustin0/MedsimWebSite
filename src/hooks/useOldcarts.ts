import { useState, useCallback } from 'react'
import { OldcartsItem } from '@/types'

const OLDCARTS_ITEMS: Omit<OldcartsItem, 'checked'>[] = [
  { key: 'onset',       label: 'Onset — เริ่มต้นอาการ' },
  { key: 'location',    label: 'Location — ตำแหน่ง' },
  { key: 'duration',    label: 'Duration — ระยะเวลา' },
  { key: 'character',   label: 'Character — ลักษณะอาการ' },
  { key: 'aggravating', label: 'Aggravating — ทำให้แย่ลง' },
  { key: 'relieving',   label: 'Relieving — ทำให้ดีขึ้น' },
  { key: 'timing',      label: 'Timing — ช่วงเวลา' },
  { key: 'severity',    label: 'Severity — ความรุนแรง' },
]

const KEYWORD_MAP: Record<string, string[]> = {
  onset:       ['เริ่ม', 'เมื่อไหร่', 'นานแค่ไหน', 'ตั้งแต่'],
  location:    ['ที่ไหน', 'ตรงไหน', 'บริเวณ', 'ตำแหน่ง'],
  duration:    ['นาน', 'กี่วัน', 'กี่ชั่วโมง', 'ระยะ'],
  character:   ['ลักษณะ', 'เป็นยังไง', 'แบบไหน', 'รู้สึก'],
  aggravating: ['ทำให้แย่', 'มากขึ้น', 'เพิ่ม', 'กระตุ้น'],
  relieving:   ['ดีขึ้น', 'ทำให้หาย', 'บรรเทา', 'ลดลง'],
  timing:      ['ช่วงไหน', 'ตอนไหน', 'เวลา', 'บ่อย'],
  severity:    ['มากแค่ไหน', 'รุนแรง', 'คะแนน', '1-10', 'เจ็บมาก'],
}

export function useOldcarts() {
  const [oldcarts, setOldcarts] = useState<OldcartsItem[]>(
    OLDCARTS_ITEMS.map((i) => ({ ...i, checked: false }))
  )

  const detectFromMessage = useCallback((text: string) => {
    const lower = text.toLowerCase()
    setOldcarts((prev) =>
      prev.map((item) => ({
        ...item,
        checked:
          item.checked ||
          (KEYWORD_MAP[item.key]?.some((kw) => lower.includes(kw)) ?? false),
      }))
    )
  }, [])

  const toggle = useCallback((key: string) => {
    setOldcarts((prev) =>
      prev.map((o) => (o.key === key ? { ...o, checked: !o.checked } : o))
    )
  }, [])

  const reset = useCallback(() => {
    setOldcarts(OLDCARTS_ITEMS.map((i) => ({ ...i, checked: false })))
  }, [])

  const checkedCount = oldcarts.filter((o) => o.checked).length

  return { oldcarts, checkedCount, detectFromMessage, toggle, reset }
}
