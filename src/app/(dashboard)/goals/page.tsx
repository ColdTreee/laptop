import { CalendarCheck } from 'lucide-react'
import { PomodoroCard } from '../../../components/goals/PomodoroCard'
import { StudyPlanCustomizer } from '../../../components/goals/StudyPlanCustomizer'
import { PageHeader } from '../../../components/layout/PageHeader'
import { DEMO_USER_ID } from '../../../data/server-fallback'
import { getActivePlan, getPomodoroStats } from '../../../server/repositories/dashboard-repository'

export const dynamic = 'force-dynamic'

export default async function GoalsPage() {
  const [plan, stats] = await Promise.all([
    getActivePlan(DEMO_USER_ID),
    getPomodoroStats(DEMO_USER_ID),
  ])
  const remainingDays = Math.max(Math.ceil((new Date(plan.endsOn).getTime() - Date.now()) / 86_400_000), 0)

  return (
    <>
      <PageHeader
        eyebrow="GOAL DESIGN · FOCUS ROUTINE"
        title="把远目标，"
        accent="安排进今天。"
        description="定制适合自己的学习周期，并用小段专注逐步完成，计划可以随学习节奏持续调整。"
        action={<div className="goal-date-chip"><CalendarCheck size={16} /><span>当前计划剩余 {remainingDays} 天</span></div>}
      />
      <section className="goals-grid" aria-label="目标设置">
        <StudyPlanCustomizer plan={plan} />
        <PomodoroCard stats={stats} />
      </section>
    </>
  )
}
