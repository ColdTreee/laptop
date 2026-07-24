'use client'

import { useMemo, useState } from 'react'
import { Activity, ChevronRight, Eye, PersonStanding, TimerReset } from 'lucide-react'
import { ALERT_FILTERS } from '../../data/dashboard'
import { FALLBACK_HEALTH_OVERVIEW } from '../../data/server-fallback'
import type { HealthEvent } from '../../types/dashboard'

const EVENT_ICONS = {
  viewing_too_close: Eye,
  bad_posture: PersonStanding,
  low_blink_rate: Activity,
  long_sitting: PersonStanding,
}

export function AlertsCard({ events = FALLBACK_HEALTH_OVERVIEW.events }: { events?: HealthEvent[] }) {
  const [alertFilter, setAlertFilter] = useState<(typeof ALERT_FILTERS)[number]>('全部')
  const visibleAlerts = useMemo(() => alertFilter === '全部' ? events : events.filter((item) => item.title.includes(alertFilter)), [alertFilter, events])
  return (
    <article className="panel alerts-panel">
      <div className="panel-heading"><div><p className="eyebrow">异常用眼</p><h2>需要留意的行为</h2></div><div className="filter-tabs">{ALERT_FILTERS.map((item) => <button key={item} className={alertFilter === item ? 'filter-active' : ''} onClick={() => setAlertFilter(item)}>{item}</button>)}</div></div>
      <div className="alert-list">{visibleAlerts.map((item) => { const AlertIcon = EVENT_ICONS[item.type]; return <div className="alert-item" key={item.id}><div className={`alert-icon ${item.tone}`}><AlertIcon size={16} /></div><div className="alert-copy"><div><strong>{item.title}</strong><span>{item.time}</span></div><p>{item.description}</p></div><ChevronRight size={17} className="alert-chevron" /></div> })}</div>
      <button className="outline-button"><TimerReset size={16} />查看今日完整记录</button>
    </article>
  )
}
