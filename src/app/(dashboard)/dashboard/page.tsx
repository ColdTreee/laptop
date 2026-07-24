import { DashboardGrid } from '../../../components/dashboard/DashboardGrid'
import { LearningFocusShowcase } from '../../../components/dashboard/LearningFocusShowcase'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DEMO_USER_ID } from '../../../data/server-fallback'
import { parseDashboardRange } from '../../../lib/range'
import { getHealthOverview, getLatestEnvironmentReading, getStudySummary } from '../../../server/repositories/dashboard-repository'

export const dynamic = 'force-dynamic'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const range = parseDashboardRange((await searchParams).range)
  const [study, health, environment] = await Promise.all([
    getStudySummary(DEMO_USER_ID, range),
    getHealthOverview(DEMO_USER_ID),
    getLatestEnvironmentReading(DEMO_USER_ID),
  ])

  return (
    <>
      <PageHeader range={range} aside={<LearningFocusShowcase />} />
      <DashboardGrid study={study} health={health} environment={environment} />
    </>
  )
}
