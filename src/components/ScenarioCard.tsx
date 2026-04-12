import Link from 'next/link'
import { Scenario } from '@/types'
import { cn } from '@/components/ui/cn'

const difficultyConfig = {
  easy: {
    label: 'ง่าย',
    bg: 'bg-primary-container',
    text: 'text-on-primary-container',
  },
  medium: {
    label: 'ปานกลาง',
    bg: 'bg-tertiary-container',
    text: 'text-on-tertiary-container',
  },
  hard: {
    label: 'ยาก',
    bg: 'bg-error-container',
    text: 'text-on-error-container',
  },
}

const ccColors: Record<string, string> = {
  'เจ็บหน้าอก': 'bg-tertiary-container/20 text-on-tertiary-container',
  'ปวดศีรษะ': 'bg-secondary-container/50 text-on-secondary-container',
  'ปวดท้อง': 'bg-orange-100 text-orange-800',
}


interface Props {
  scenario: Scenario
}

export default function ScenarioCard({ scenario }: Props) {
  const diff = difficultyConfig[scenario.difficulty]
  const ccColor = ccColors[scenario.chiefComplaint] ?? 'bg-surface-container text-on-surface-variant'

  return (
    <div className="group bg-surface-container-lowest rounded-2xl premium-shadow overflow-hidden flex flex-col border border-transparent hover:border-primary/10 transition-all duration-300">
      <div className="p-8 flex-1">
        {/* Top row: avatar + difficulty */}
        <div className="flex justify-between items-start mb-6">
          <div className="relative avatar-halo">
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-3xl relative z-10 text-on-surface-variant">
              <span className="material-symbols-outlined !text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
          </div>
          <span className={cn('px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full', diff.bg, diff.text)}>
            {diff.label}
          </span>
        </div>

        {/* Patient info */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="title-lg text-on-surface">{scenario.name}</h3>
            <span className="body-md text-on-surface-variant">({scenario.age} ปี)</span>
          </div>
          <span className={cn('inline-block px-3 py-1 text-xs font-bold rounded-full mb-3', ccColor)}>
            {scenario.chiefComplaint}
          </span>
          <p className="body-md text-on-surface-variant line-clamp-3">{scenario.description}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-6 pt-0">
        <Link
          href={`/session/${scenario.id}`}
          className="cta-gradient w-full py-4 rounded-xl text-on-primary font-bold tracking-wide active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <span>เริ่มฝึก</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  )
}
