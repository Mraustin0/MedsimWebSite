import { SCENARIOS } from '@/lib/scenarios'
import { prisma } from '@/lib/db'
import { Scenario } from '@/types'
import DashboardClient from '@/components/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Load instructor-created scenarios from DB
  const dbScenarios = await prisma.scenarioRecord.findMany({
    orderBy: { createdAt: 'desc' },
  })

  // Convert DB records to Scenario type
  const customScenarios: Scenario[] = dbScenarios.map((s) => ({
    id: s.id,
    name: s.name,
    age: s.age,
    gender: s.gender as 'male' | 'female',
    chiefComplaint: s.chiefComplaint,
    description: s.description,
    difficulty: s.difficulty as 'easy' | 'medium' | 'hard',
    systemPrompt: s.systemPrompt,
    tags: s.tags,
  }))

  // Merge: hardcoded first, then instructor-created
  const allScenarios = [...SCENARIOS, ...customScenarios]

  return <DashboardClient scenarios={allScenarios} />
}
