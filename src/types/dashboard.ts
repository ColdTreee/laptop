export type DashboardRange = '今日' | '本周' | '本月'

export interface StudyBar {
  day: string
  value: number
  seconds: number
}

export interface StudySummary {
  totalSeconds: number
  todaySeconds: number
  targetSeconds: number
  changePercent: number
  bars: StudyBar[]
}

export interface PlanTask {
  id: number
  subject: string
  title: string
  duration: number
  completed: boolean
}

export interface ActivePlan {
  id: number
  title: string
  startsOn: string
  endsOn: string
  dailyMinutes: number
  selectedDays: number[]
  subjects: string[]
  tasks: PlanTask[]
}

export type HealthEventTone = 'warning' | 'danger' | 'neutral'

export interface HealthEvent {
  id: number
  time: string
  title: string
  description: string
  tone: HealthEventTone
  type: 'viewing_too_close' | 'bad_posture' | 'low_blink_rate' | 'long_sitting'
}

export interface HealthOverview {
  score: number
  scoreChange: number
  myopiaRisk: number
  averageViewingDistanceCm: number
  sedentaryMinutes: number
  fatigueLevel: 'low' | 'medium' | 'high'
  nextBreakAt: string
  events: HealthEvent[]
}

export interface PomodoroStats {
  focusMinutes: number
  breakMinutes: number
  completedToday: number
  focusedMinutesToday: number
}

export interface EnvironmentReading {
  ambientLightLux: number
  deskLampBrightnessPercent: number
  colorTemperatureKelvin: number
  postureStatus: number | null
  seatStatus: number | null
  writingDistanceCm: number | null
  studyDurationMinutes: number | null
  capturedAt: string | null
}

export interface PlanUpdateInput {
  title: string
  dailyMinutes: number
  startsOn: string
  endsOn: string
  selectedDays: number[]
  subjects: string[]
}
