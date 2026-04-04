import { getScenarioById } from '@/lib/scenarios'
import { notFound } from 'next/navigation'
import SessionClient from '@/components/SessionClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SessionPage({ params }: Props) {
  const { id } = await params
  const scenario = getScenarioById(id)
  if (!scenario) notFound()

  return <SessionClient scenario={scenario} />
}
