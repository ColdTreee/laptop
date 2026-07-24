import { ChevronRight, Clock3, TrendingUp } from 'lucide-react'
import { FALLBACK_STUDY_SUMMARY } from '../../data/server-fallback'
import type { StudySummary } from '../../types/dashboard'

interface StudyDurationCardProps {
  summary?: StudySummary
}

function formatDuration(seconds: number) {
  return { hours: Math.floor(seconds / 3600), minutes: Math.floor((seconds % 3600) / 60) }
}

export function StudyDurationCard({ summary = FALLBACK_STUDY_SUMMARY }: StudyDurationCardProps) {
  const total = formatDuration(summary.totalSeconds)
  const today = formatDuration(summary.todaySeconds)
  const targetHours = Math.round(summary.targetSeconds / 3600)

  return (
    <article className="panel duration-panel">
      <div className="panel-heading"><div><p className="eyebrow">累计有效学习时长</p><h2>{total.hours}<span className="unit">小时</span> {total.minutes}<span className="unit">分钟</span></h2></div><span className="trend-label"><TrendingUp size={14} />{summary.changePercent}%</span></div>
      <div className="duration-chart">
        <div className="chart-labels"><span>本周每日时长</span><span>目标 {targetHours} 小时</span></div>
        <div className="bar-chart" aria-label="周学习时长柱状图">
          {summary.bars.map((bar) => <div className="bar-column" key={bar.day}><div className={`bar ${bar.day === '四' ? 'bar-current' : ''}`} style={{ height: `${bar.value}%` }} /><span>{bar.day}</span></div>)}
        </div>
      </div>
      <div className="duration-foot"><span><Clock3 size={15} />今日已学习 {today.hours} 小时 {today.minutes} 分</span><button className="text-button">查看明细 <ChevronRight size={14} /></button></div>
    </article>
  )
}
