import { SCENARIOS } from '@/lib/scenarios'
import DashboardClient from '@/components/DashboardClient'

export default function DashboardPage() {
  return <DashboardClient scenarios={SCENARIOS} />
}
