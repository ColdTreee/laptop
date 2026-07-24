import type { DashboardRange } from '../types'

export function parseDashboardRange(value: string | undefined): DashboardRange {
  return value === '今日' || value === '本月' ? value : '本周'
}
