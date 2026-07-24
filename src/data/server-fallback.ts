import type { ActivePlan, HealthOverview, PomodoroStats, StudySummary } from '../types/dashboard'

export const DEMO_USER_ID = 1

export const FALLBACK_STUDY_SUMMARY: StudySummary = {
  totalSeconds: 42 * 3600 + 18 * 60,
  todaySeconds: 4 * 3600 + 36 * 60,
  targetSeconds: 50 * 3600,
  changePercent: 12.4,
  bars: [
    { day: '一', value: 62, seconds: 3 * 3600 + 6 * 60 },
    { day: '二', value: 74, seconds: 3 * 3600 + 42 * 60 },
    { day: '三', value: 55, seconds: 2 * 3600 + 45 * 60 },
    { day: '四', value: 88, seconds: 4 * 3600 + 24 * 60 },
    { day: '五', value: 48, seconds: 2 * 3600 + 24 * 60 },
    { day: '六', value: 0, seconds: 0 },
    { day: '日', value: 0, seconds: 0 },
  ],
}

export const FALLBACK_ACTIVE_PLAN: ActivePlan = {
  id: 1,
  title: '期中考冲刺计划',
  startsOn: '2026-07-22',
  endsOn: '2026-08-18',
  dailyMinutes: 180,
  selectedDays: [1, 2, 3, 4, 5, 6],
  subjects: ['数学', '英语', '物理'],
  tasks: [
    { id: 1, subject: '数学', title: '函数综合练习', duration: 60, completed: true },
    { id: 2, subject: '英语', title: '阅读与词汇复习', duration: 45, completed: true },
    { id: 3, subject: '物理', title: '力学错题整理', duration: 50, completed: false },
    { id: 4, subject: '语文', title: '古诗文背诵', duration: 30, completed: false },
  ],
}

export const FALLBACK_HEALTH_OVERVIEW: HealthOverview = {
  score: 86,
  scoreChange: 4,
  myopiaRisk: 23,
  averageViewingDistanceCm: 39,
  sedentaryMinutes: 136,
  fatigueLevel: 'medium',
  nextBreakAt: '14:30',
  events: [
    { id: 1, time: '10:42', title: '用眼过近', description: '阅读距离约 26 cm，已持续 4 分钟', tone: 'warning', type: 'viewing_too_close' },
    { id: 2, time: '09:18', title: '不良坐姿持续', description: '头部前倾超过建议角度，持续 8 分钟', tone: 'danger', type: 'bad_posture' },
    { id: 3, time: '08:52', title: '眨眼频率偏低', description: '过去 5 分钟平均每分钟 7 次', tone: 'neutral', type: 'low_blink_rate' },
  ],
}

export const FALLBACK_POMODORO_STATS: PomodoroStats = {
  focusMinutes: 25,
  breakMinutes: 5,
  completedToday: 2,
  focusedMinutesToday: 50,
}
