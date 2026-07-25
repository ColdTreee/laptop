'use client'

import { CalendarDays, ChevronRight, Menu } from 'lucide-react'
import { AiChatPopover } from './AiChatPopover'

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
  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" onClick={onOpenNavigation} aria-label="打开导航"><Menu size={20} /></button>
      <div className="breadcrumbs"><span>工作台</span><ChevronRight size={14} /><strong>{activeNav}</strong></div>
      <div className="topbar-actions">
        <div className="date-chip"><CalendarDays size={15} /><span>{getCurrentDateLabel()}</span></div>
        <AiChatPopover />
      </div>
    </header>
  )
}
