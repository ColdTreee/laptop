import Link from 'next/link'
import { Activity, ArrowUpRight, CalendarCheck, Clock3, HeartPulse, Users } from 'lucide-react'
import { isDatabaseConfigured } from '../../lib/db'
import { getAdminDashboard } from '../../server/repositories/admin-repository'

export const dynamic = 'force-dynamic'

const formatDateTime = (value: unknown) => value ? new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(String(value))) : '--'

export default async function AdminDashboardPage() {
  const data = isDatabaseConfigured() ? await getAdminDashboard().catch(() => null) : null
  if (!data) return <section className="admin-page"><div className="admin-empty"><Activity size={28} /><h1>暂时无法读取数据库</h1><p>请检查数据库配置与网络连接后刷新页面。</p></div></section>
  const stats = [
    { label: '平台用户', value: data.userCount, unit: '人', icon: Users, tone: 'green', href: '/admin/users' },
    { label: '今日有效学习', value: data.todayStudyMinutes, unit: '分钟', icon: Clock3, tone: 'blue', href: '/admin/sessions' },
    { label: '活跃学习计划', value: data.activePlanCount, unit: '项', icon: CalendarCheck, tone: 'amber', href: '/admin/plans' },
    { label: '今日健康事件', value: data.todayHealthEvents, unit: '次', icon: HeartPulse, tone: 'red', href: '/admin/events' },
  ]
  return (
    <section className="admin-page">
      <div className="admin-page-heading"><div><p>运营概览</p><h1>数据总览</h1><span>掌握学习效率与健康状态的关键变化</span></div><div className="admin-date"><CalendarCheck size={17} />{new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(new Date())}</div></div>
      <div className="admin-stat-grid">
        {stats.map(({ label, value, unit, icon: Icon, tone, href }) => <Link href={href} className="admin-stat" key={label}><span className={`admin-stat-icon ${tone}`}><Icon size={20} /></span><small>{label}</small><strong>{value.toLocaleString()} <em>{unit}</em></strong><span className="admin-stat-link">查看数据 <ArrowUpRight size={14} /></span></Link>)}
      </div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel"><div className="admin-panel-heading"><div><h2>最近学习记录</h2><p>最新有效学习会话</p></div><Link href="/admin/sessions">全部记录 <ArrowUpRight size={14} /></Link></div><div className="admin-table-wrap"><table><thead><tr><th>用户</th><th>科目</th><th>有效时长</th><th>专注分</th><th>开始时间</th></tr></thead><tbody>{data.recentSessions.map((row) => <tr key={String(row.id)}><td><strong>{String(row.display_name)}</strong></td><td>{String(row.subject)}</td><td>{Math.round(Number(row.effective_seconds) / 60)} 分钟</td><td><span className="admin-score">{row.focus_score == null ? '--' : Number(row.focus_score).toFixed(0)}</span></td><td>{formatDateTime(row.started_at)}</td></tr>)}</tbody></table>{!data.recentSessions.length && <p className="admin-table-empty">暂无学习记录</p>}</div></section>
        <section className="admin-panel"><div className="admin-panel-heading"><div><h2>最新健康事件</h2><p>需要关注的异常数据</p></div><Link href="/admin/events">全部事件 <ArrowUpRight size={14} /></Link></div><div className="admin-event-list">{data.recentEvents.map((row) => <div className="admin-event" key={String(row.id)}><span className={`admin-event-mark ${String(row.severity)}`} /><div><strong>{String(row.display_name)}</strong><p>{String(row.event_type).replaceAll('_', ' ')}</p></div><span><b>{String(row.severity)}</b><small>{formatDateTime(row.started_at)}</small></span></div>)}{!data.recentEvents.length && <p className="admin-table-empty">暂无健康事件</p>}</div></section>
      </div>
    </section>
  )
}
