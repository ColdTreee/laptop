import { MoveUp } from 'lucide-react'
import { FALLBACK_HEALTH_OVERVIEW } from '../../data/server-fallback'
import type { HealthOverview } from '../../types/dashboard'

export function HealthScoreCard({ overview = FALLBACK_HEALTH_OVERVIEW }: { overview?: HealthOverview }) {
  const ringDegrees = Math.min(overview.score, 100) * 3.6
  return (
    <article className="panel score-panel">
      <div className="panel-heading"><div><p className="eyebrow">今日综合健康得分</p><h2>状态平衡</h2></div><span className="status-pill good"><span />良好</span></div>
      <div className="score-content">
        <div className="score-ring" style={{ background: `conic-gradient(var(--teal) 0deg ${ringDegrees}deg, #e7f0ee ${ringDegrees}deg 360deg)` }} aria-label={`综合健康得分 ${overview.score} 分`}><div className="score-inner"><strong>{overview.score}</strong><span>/ 100</span></div></div>
        <div className="score-notes"><p>较昨日 <b><MoveUp size={14} /> {overview.scoreChange} 分</b></p><div className="mini-meter"><span style={{ width: `${overview.score}%` }} /></div><small>基于学习时长、坐姿、用眼距离与情绪状态综合计算</small></div>
      </div>
      <div className="score-footer"><span><i className="legend-dot mint" />学习节奏</span><span><i className="legend-dot amber" />身体状态</span><span><i className="legend-dot coral" />用眼风险</span></div>
    </article>
  )
}
