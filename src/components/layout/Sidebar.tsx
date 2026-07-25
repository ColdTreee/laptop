'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Settings2, ShieldCheck, Sparkles, X } from 'lucide-react'
import { NAV_ITEMS } from '../../data/dashboard'
import type { UserProfile } from '../../types'

interface SidebarProps {
  isOpen: boolean
  user: UserProfile
  onClose: () => void
  onLogout: () => void
}

export function Sidebar(props: SidebarProps) {
  const { isOpen, user, onClose, onLogout } = props
  const pathname = usePathname()

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="brand-lockup">
        <div className="brand-mark"><Sparkles size={17} strokeWidth={2.2} /></div>
        <div><p className="brand-name">青芽鑫护</p><p className="brand-caption">学习健康中心</p></div>
        <button className="icon-button sidebar-close" onClick={onClose} aria-label="关闭导航"><X size={18} /></button>
      </div>

      <div className="nav-section">
        <p className="eyebrow">工作台</p>
        <nav aria-label="主导航">
          {NAV_ITEMS.map(({ label, href, icon: NavIcon }) => {
            const active = pathname === href
            return (
            <Link key={href} href={href} className={`nav-item ${active ? 'nav-item-active' : ''}`} onClick={onClose}>
              <NavIcon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span>{label}</span>
              {active && <span className="nav-dot" />}
            </Link>
          )})}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="coach-card">
          <div className="coach-icon"><ShieldCheck size={17} /></div>
          <div><p className="coach-title">今日状态良好</p><p className="coach-copy">保持 20 分钟一次远眺</p></div>
        </div>
        <Link className="nav-item nav-item-muted" href="/goals" onClick={onClose} aria-label="前往目标设置"><Settings2 size={18} /><span>设置</span></Link>
        <div className="profile-row">
          <div className="avatar">{user.name.slice(0, 1)}</div>
          <div className="profile-copy"><span>{user.name}</span><small>{user.subtitle}</small></div>
          <button className="profile-action" onClick={onLogout} aria-label="退出登录" title="退出登录"><LogOut size={17} /></button>
        </div>
      </div>
    </aside>
  )
}
