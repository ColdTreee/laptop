import { StudyDurationCard } from '../../../components/dashboard/StudyDurationCard'
import { PageHeader } from '../../../components/layout/PageHeader'
import { StudyPlanProgressCard } from '../../../components/records/StudyPlanProgressCard'
import { DEMO_USER_ID } from '../../../data/server-fallback'
import { parseDashboardRange } from '../../../lib/range'
import { getActivePlan, getStudySummary } from '../../../server/repositories/dashboard-repository'

export const dynamic = 'force-dynamic'

export default async function StudyRecordsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const range = parseDashboardRange((await searchParams).range)
  const [study, plan] = await Promise.all([
    getStudySummary(DEMO_USER_ID, range),
    getActivePlan(DEMO_USER_ID),
  ])

  return (
    <>
      <PageHeader
        eyebrow="STUDY REVIEW · WEEKLY PROGRESS"
        title="每一次专注，"
        accent="都有清晰回响。"
        description="有效时长与计划进度会同步更新，帮助你判断投入是否真正落在重要任务上。"
        range={range}
      />
      <section className="records-grid" aria-label="学习记录">
        <StudyDurationCard summary={study} />
        <StudyPlanProgressCard plan={plan} />
      </section>
    </>
  )
}
