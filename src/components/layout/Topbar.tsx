'use client'

import { useState } from 'react'
import { AlertTriangle, Bell, CalendarDays, Check, ChevronRight, Menu } from 'lucide-react'

interface TopbarProps {
  activeNav: string
  onOpenNavigation: () => void
}

function getCurrentDateLabel() {
  const parts = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year} 年 ${values.month} ${values.day} 日 · ${values.weekday}`
}

export function Topbar({ activeNav, onOpenNavigation }: TopbarProps) {
  const [notificationOpen, setNotificationOpen] = useState(false)

  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" onClick={onOpenNavigation} aria-label="打开导航"><Menu size={20} /></button>
      <div className="breadcrumbs"><span>工作台</span><ChevronRight size={14} /><strong>{activeNav}</strong></div>
      <div className="topbar-actions">
        <div className="date-chip"><CalendarDays size={15} /><span>{getCurrentDateLabel()}</span></div>
        <div className="notification-wrap">
          <button className={`icon-button ${notificationOpen ? 'icon-button-active' : ''}`} onClick={() => setNotificationOpen((open) => !open)} aria-expanded={notificationOpen} aria-label="查看通知">
            <Bell size={18} /><span className="notification-dot" />
          </button>
          {notificationOpen && (
            <div className="notification-popover">
              <div className="popover-title"><strong>通知</strong><span>2 条未读</span></div>
              <p><AlertTriangle size={15} /> 近视风险较昨日上升 3 分</p>
              <p><Check size={15} /> 今日学习目标已完成 72%</p>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
