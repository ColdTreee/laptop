import { AlertsCard } from '../../../components/dashboard/AlertsCard'
import { HealthScoreCard } from '../../../components/dashboard/HealthScoreCard'
import { SedentaryCard } from '../../../components/dashboard/SedentaryCard'
import { VisionRiskCard } from '../../../components/dashboard/VisionRiskCard'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DEMO_USER_ID } from '../../../data/server-fallback'
import { parseDashboardRange } from '../../../lib/range'
import { getHealthOverview } from '../../../server/repositories/dashboard-repository'

export const dynamic = 'force-dynamic'

export default async function HealthTrendsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const range = parseDashboardRange((await searchParams).range)
  const health = await getHealthOverview(DEMO_USER_ID)

  return (
    <>
      <PageHeader
        eyebrow="HEALTH INSIGHT · DAILY SIGNALS"
        title="健康变化，"
        accent="比感受更早一步。"
        description="综合观察用眼距离、坐姿与连续学习节奏，及时发现需要调整的细微信号。"
        range={range}
      />
      <section className="health-grid" aria-label="健康趋势">
        <HealthScoreCard overview={health} />
        <VisionRiskCard overview={health} />
        <SedentaryCard overview={health} />
        <AlertsCard events={health.events} />
      </section>
    </>
  )
}
