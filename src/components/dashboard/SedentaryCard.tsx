import { Gauge, Play } from 'lucide-react'
import { FALLBACK_HEALTH_OVERVIEW } from '../../data/server-fallback'
import type { HealthOverview } from '../../types/dashboard'

const FATIGUE_LABEL = { low: '轻度', medium: '中度', high: '高度' }

export function SedentaryCard({ overview = FALLBACK_HEALTH_OVERVIEW }: { overview?: HealthOverview }) {
  const hours = Math.floor(overview.sedentaryMinutes / 60)
  const minutes = overview.sedentaryMinutes % 60
  const exceeded = Math.max(overview.sedentaryMinutes - 110, 0)
  return (
    <article className="panel sedentary-panel">
      <div className="panel-heading"><div><p className="eyebrow">久坐疲劳</p><h2>身体需要动一动</h2></div><div className="fatigue-badge"><Gauge size={15} />{FATIGUE_LABEL[overview.fatigueLevel]}</div></div>
      <div className="sit-stat"><strong>{hours}<span>小时 {minutes} 分钟</span></strong><p>连续坐姿时长 <b>超出建议 {exceeded} 分钟</b></p></div>
      <div className="progress-line"><span style={{ width: `${Math.min((overview.sedentaryMinutes / 200) * 100, 100)}%` }} /></div>
      <div className="sit-footer"><span><span className="pulse-dot" />下次休息建议 <b>{overview.nextBreakAt}</b></span><button className="play-button" aria-label="开始 3 分钟拉伸"><Play size={13} fill="currentColor" /></button></div>
    </article>
  )
}
