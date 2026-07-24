'use client'

import { useState } from 'react'
import { Activity, MoreHorizontal } from 'lucide-react'
import { EMOTIONS } from '../../data/dashboard'

export function EmotionCard() {
  const [selectedEmotion, setSelectedEmotion] = useState('专注')
  return (
    <article className="panel emotion-panel">
      <div className="panel-heading"><div><p className="eyebrow">情绪状态标签</p><h2>专注度分布</h2></div><button className="icon-button" aria-label="查看更多情绪数据"><MoreHorizontal size={18} /></button></div>
      <div className="emotion-body">
        <div className="donut-chart"><div className="donut-hole"><strong>58%</strong><span>专注</span></div></div>
        <div className="emotion-list">{EMOTIONS.map((emotion) => <button key={emotion.label} className={`emotion-row ${selectedEmotion === emotion.label ? 'emotion-selected' : ''}`} onClick={() => setSelectedEmotion(emotion.label)}><span className={`emotion-swatch ${emotion.colorClass}`} /><span>{emotion.label}</span><strong>{emotion.value}</strong></button>)}</div>
      </div>
      <div className="emotion-note"><Activity size={15} />上午 9:00–11:00 是今天的高效区间</div>
    </article>
  )
}
