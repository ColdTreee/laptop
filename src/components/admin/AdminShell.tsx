'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, BookOpen, ChevronRight, ClipboardList, Database, Gauge, HeartPulse, Leaf, LogOut, Menu, Timer, Users, X } from 'lucide-react'
import { useState } from 'react'
import { ADMIN_RESOURCES } from '../../lib/admin-resources'

const icons = { users: Users, subjects: BookOpen, plans: ClipboardList, tasks: ClipboardList, sessions: Activity, health: HeartPulse, events: HeartPulse, environment: Leaf, pomodoro: Timer }

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="admin-app">
      {open && <button className="admin-scrim" aria-label="关闭导航" onClick={() => setOpen(false)} />}
      <aside className={`admin-sidebar ${open ? 'is-open' : ''}`}>
        <div className="admin-brand"><span className="admin-brand-mark"><Database size={19} /></span><div><strong>青芽鑫护管理台</strong><small>数据运营中心</small></div><button className="admin-icon-button admin-close" aria-label="关闭导航" onClick={() => setOpen(false)}><X size={19} /></button></div>
        <nav className="admin-nav" aria-label="后台导航">
          <p>工作台</p>
          <Link href="/admin" className={pathname === '/admin' ? 'active' : ''} onClick={() => setOpen(false)}><Gauge size={18} /><span>数据总览</span><ChevronRight size={15} /></Link>
          <p>数据管理</p>
          {Object.values(ADMIN_RESOURCES).map((resource) => {
            const Icon = icons[resource.key as keyof typeof icons]
            const href = `/admin/${resource.key}`
            return <Link key={resource.key} href={href} className={pathname === href ? 'active' : ''} onClick={() => setOpen(false)}><Icon size={18} /><span>{resource.label}</span><ChevronRight size={15} /></Link>
          })}
        </nav>
        <div className="admin-sidebar-footer"><div className="admin-avatar">管</div><div><strong>系统管理员</strong><small>Administrator</small></div><Link href="/dashboard" aria-label="返回用户端" title="返回用户端"><LogOut size={18} /></Link></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><button className="admin-icon-button admin-menu" aria-label="打开导航" onClick={() => setOpen(true)}><Menu size={20} /></button><div><span className="admin-status-dot" />数据库已连接</div><Link href="/dashboard">返回用户端</Link></header>
        {children}
      </main>
    </div>
  )
}
