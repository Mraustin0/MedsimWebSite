import { getScenarioById } from '@/lib/scenarios'
import { prisma } from '@/lib/db'
import { Scenario } from '@/types'
import { notFound } from 'next/navigation'
import SessionClient from '@/components/SessionClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SessionPage({ params }: Props) {
  const { id } = await params

  // Try hardcoded scenarios first
  let scenario: Scenario | undefined = getScenarioById(id)

  // If not found, try DB
  if (!scenario) {
    const dbScenario = await prisma.scenarioRecord.findUnique({ where: { id } })
    if (dbScenario) {
      scenario = {
        id: dbScenario.id,
        name: dbScenario.name,
        age: dbScenario.age,
        gender: dbScenario.gender as 'male' | 'female',
        chiefComplaint: dbScenario.chiefComplaint,
        description: dbScenario.description,
        difficulty: dbScenario.difficulty as 'easy' | 'medium' | 'hard',
        systemPrompt: dbScenario.systemPrompt,
        tags: dbScenario.tags,
      }
    }
  }

  if (!scenario) notFound()

  return <SessionClient scenario={scenario} />
}
