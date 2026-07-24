import { Eye } from 'lucide-react'
import { FALLBACK_HEALTH_OVERVIEW } from '../../data/server-fallback'
import type { HealthOverview } from '../../types/dashboard'

export function VisionRiskCard({ overview = FALLBACK_HEALTH_OVERVIEW }: { overview?: HealthOverview }) {
  const level = overview.myopiaRisk < 35 ? '低风险' : overview.myopiaRisk < 70 ? '中风险' : '高风险'
  return (
    <article className="panel risk-panel">
      <div className="panel-heading"><div><p className="eyebrow">近视风险</p><h2>{level}</h2></div><div className="risk-score"><strong>{overview.myopiaRisk}</strong><span>/ 100</span></div></div>
      <div className="risk-scale"><div className="risk-track"><span className="risk-marker" style={{ left: `${overview.myopiaRisk}%` }} /></div><div className="risk-labels"><span>低风险</span><span>中风险</span><span>高风险</span></div></div>
      <div className="risk-insight"><div className="insight-icon"><Eye size={16} /></div><p>近 7 天平均用眼距离 <strong>{overview.averageViewingDistanceCm} cm</strong>，保持得不错</p></div>
    </article>
  )
}
