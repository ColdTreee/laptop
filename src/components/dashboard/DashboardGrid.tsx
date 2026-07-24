import { AlertsCard } from './AlertsCard'
import { DeskLightCard } from './DeskLightCard'
import { HealthScoreCard } from './HealthScoreCard'
import { SedentaryCard } from './SedentaryCard'
import { StudyDurationCard } from './StudyDurationCard'
import { VisionRiskCard } from './VisionRiskCard'
import type { HealthOverview, StudySummary } from '../../types/dashboard'

interface DashboardGridProps {
  study?: StudySummary
  health?: HealthOverview
}

export function DashboardGrid({ study, health }: DashboardGridProps) {
  return (
    <section className="dashboard-grid" aria-label="健康数据总览">
      <DeskLightCard />
      <HealthScoreCard overview={health} />
      <StudyDurationCard summary={study} />
      <VisionRiskCard overview={health} />
      <AlertsCard events={health?.events} />
      <SedentaryCard overview={health} />
    </section>
  )
}
