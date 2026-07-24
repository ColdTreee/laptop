import {
  Activity,
  BarChart3,
  BookOpen,
  Eye,
  LayoutDashboard,
  PersonStanding,
  Target,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DashboardRange } from '../types'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface EmotionItem {
  label: string
  value: string
  colorClass: string
}

export interface AlertItem {
  time: string
  title: string
  description: string
  tone: 'warning' | 'danger' | 'neutral'
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: '总览', href: '/dashboard', icon: LayoutDashboard },
  { label: '学习记录', href: '/study-records', icon: BookOpen },
  { label: '健康趋势', href: '/health-trends', icon: BarChart3 },
  { label: '目标设置', href: '/goals', icon: Target },
]

export const DASHBOARD_RANGES: DashboardRange[] = ['今日', '本周', '本月']

export const STUDY_BARS = [
  { day: '一', value: 62 },
  { day: '二', value: 74 },
  { day: '三', value: 55 },
  { day: '四', value: 88 },
  { day: '五', value: 48 },
  { day: '六', value: 0 },
  { day: '日', value: 0 },
]

export const EMOTIONS: EmotionItem[] = [
  { label: '专注', value: '58%', colorClass: 'emotion-focus' },
  { label: '疲劳', value: '24%', colorClass: 'emotion-fatigue' },
  { label: '焦虑', value: '10%', colorClass: 'emotion-anxiety' },
  { label: '涣散', value: '8%', colorClass: 'emotion-distracted' },
]

export const ALERT_FILTERS = ['全部', '用眼过近', '坐姿'] as const

export const ALERTS: AlertItem[] = [
  { time: '10:42', title: '用眼过近', description: '阅读距离约 26 cm，已持续 4 分钟', tone: 'warning', icon: Eye },
  { time: '09:18', title: '不良坐姿持续', description: '头部前倾超过建议角度，持续 8 分钟', tone: 'danger', icon: PersonStanding },
  { time: '08:52', title: '眨眼频率偏低', description: '过去 5 分钟平均每分钟 7 次', tone: 'neutral', icon: Activity },
]
