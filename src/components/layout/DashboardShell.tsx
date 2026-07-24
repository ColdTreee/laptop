'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { AmbientBackdrop } from '../ui/AmbientBackdrop'
import { Sidebar } from './Sidebar'
import { MobilePillNavigation } from './MobilePillNavigation'
import { Topbar } from './Topbar'
import type { UserProfile } from '../../types'

const DEFAULT_USER: UserProfile = { name: '林小满', subtitle: '高中 · 2 年级' }

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '总览',
  '/study-records': '学习记录',
  '/health-trends': '健康趋势',
  '/goals': '目标设置',
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [user, setUser] = useState(DEFAULT_USER)

  useEffect(() => {
    const stored = window.localStorage.getItem('light-trace-user')
    if (!stored) return
    try {
      setUser(JSON.parse(stored) as UserProfile)
    } catch {
      window.localStorage.removeItem('light-trace-user')
    }
  }, [])

  const logout = () => {
    window.localStorage.removeItem('light-trace-user')
    router.push('/login')
  }

  return (
    <div className="app-shell">
      <AmbientBackdrop variant="dashboard" />
      {mobileNavOpen && (
        <button className="mobile-nav-scrim" onClick={() => setMobileNavOpen(false)} aria-label="关闭导航" />
      )}
      <Sidebar
        isOpen={mobileNavOpen}
        user={user}
        onClose={() => setMobileNavOpen(false)}
        onLogout={logout}
      />
      <main className="main-content">
        <Topbar activeNav={PAGE_TITLES[pathname ?? ''] ?? '工作台'} onOpenNavigation={() => setMobileNavOpen(true)} />
        {children}
        <footer className="page-footer">
          <span>服务端数据 · 自动同步</span>
          <span className="footer-right"><Check size={14} />所有指标均为辅助参考</span>
        </footer>
      </main>
      <MobilePillNavigation />
    </div>
  )
}
