import 'server-only'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { getDatabase, isDatabaseConfigured } from '../../lib/db'
import {
  FALLBACK_ACTIVE_PLAN,
  FALLBACK_ENVIRONMENT_READING,
  FALLBACK_HEALTH_OVERVIEW,
  FALLBACK_POMODORO_STATS,
  FALLBACK_STUDY_SUMMARY,
} from '../../data/server-fallback'
import type {
  ActivePlan,
  DashboardRange,
  EnvironmentReading,
  HealthEvent,
  HealthOverview,
  PlanUpdateInput,
  PomodoroStats,
  StudySummary,
} from '../../types/dashboard'

interface StudyTotalRow extends RowDataPacket {
  total_seconds: number | string
  today_seconds: number | string
}

interface StudyDayRow extends RowDataPacket {
  weekday_index: number
  effective_seconds: number | string
}

interface PlanRow extends RowDataPacket {
  id: number
  title: string
  starts_on: Date | string
  ends_on: Date | string
  daily_target_minutes: number
  target_total_minutes: number | null
}

interface PlanTaskRow extends RowDataPacket {
  id: number
  title: string
  planned_minutes: number
  status: string
  subject: string | null
}

interface ValueRow extends RowDataPacket {
  value: string | number
}

interface HealthRow extends RowDataPacket {
  health_score: number | string
  myopia_risk_score: number | string
  sedentary_minutes: number
  fatigue_level: 'low' | 'medium' | 'high'
  average_viewing_distance_cm: number | string | null
}

interface HealthEventRow extends RowDataPacket {
  id: number
  event_type: HealthEvent['type']
  severity: 'info' | 'warning' | 'danger'
  started_at: Date
  measured_value: number | string | null
  measured_unit: string | null
  details: string | { description?: string } | null
}

interface PomodoroRow extends RowDataPacket {
  completed_count: number | string
  focused_seconds: number | string
  focus_minutes: number | null
  short_break_minutes: number | null
}

interface EnvironmentReadingRow extends RowDataPacket {
  ambient_light_lux: number
  desk_lamp_brightness_percent: number
  color_temperature_kelvin: number | null
  desk_lamp_mode: 'auto' | 'manual' | null
  posture_status: number | null
  seat_status: number | null
  writing_distance_cm: number | null
  study_duration_minutes: number | null
  captured_at: Date | string
}

export interface EnvironmentReadingInput {
  postureStatus?: number
  seatStatus?: number
  ambientLightLux?: number
  deskLampBrightnessPercent?: number
  colorTemperatureKelvin?: number
  deskLampMode?: 'auto' | 'manual'
  writingDistanceCm?: number
  studyDurationMinutes?: number
  capturedAt?: string
}

const WEEK_LABELS = ['一', '二', '三', '四', '五', '六', '日']
const DATABASE_FALLBACK_COOLDOWN_MS = 30_000
const DATABASE_UNAVAILABLE_CODES = new Set([
  'EACCES',
  'EAI_AGAIN',
  'ECONNREFUSED',
  'ECONNRESET',
  'ENETUNREACH',
  'ENOTFOUND',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'PROTOCOL_CONNECTION_LOST',
])

let databaseFallbackUntil = 0

function getDatabaseErrorCode(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) return undefined
  const code = error.code
  return typeof code === 'string' ? code : undefined
}

async function withFallback<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDatabaseConfigured()) return structuredClone(fallback)
  if (databaseFallbackUntil > Date.now()) {
    return structuredClone(fallback)
  }

  try {
    const result = await query()
    databaseFallbackUntil = 0
    return result
  } catch (error) {
    const code = getDatabaseErrorCode(error)
    if (code && DATABASE_UNAVAILABLE_CODES.has(code)) {
      const shouldLog = databaseFallbackUntil <= Date.now()
      databaseFallbackUntil = Date.now() + DATABASE_FALLBACK_COOLDOWN_MS
      if (shouldLog) {
        console.warn('Database unavailable; serving dashboard fallback data.', code)
      }
      return structuredClone(fallback)
    }

    if (process.env.NODE_ENV === 'production') throw error

    console.error('数据库查询失败：', error)
    return structuredClone(fallback)
  }
}

function toDateString(value: Date | string) {
  if (typeof value === 'string') return value.slice(0, 10)
  return value.toISOString().slice(0, 10)
}

function eventPresentation(row: HealthEventRow): Pick<HealthEvent, 'title' | 'description' | 'tone'> {
  const descriptions: Record<HealthEvent['type'], string> = {
    viewing_too_close: `阅读距离约 ${row.measured_value ?? '--'} ${row.measured_unit ?? 'cm'}`,
    bad_posture: '检测到头部前倾超过建议角度',
    low_blink_rate: `平均眨眼频率 ${row.measured_value ?? '--'} ${row.measured_unit ?? '次/分'}`,
    long_sitting: `连续坐姿 ${row.measured_value ?? '--'} ${row.measured_unit ?? '分钟'}`,
  }
  const titles: Record<HealthEvent['type'], string> = {
    viewing_too_close: '用眼过近',
    bad_posture: '不良坐姿持续',
    low_blink_rate: '眨眼频率偏低',
    long_sitting: '连续久坐',
  }
  let details = row.details
  if (typeof details === 'string') {
    try { details = JSON.parse(details) as { description?: string } } catch { details = null }
  }
  return {
    title: titles[row.event_type],
    description: details?.description ?? descriptions[row.event_type],
    tone: row.severity === 'info' ? 'neutral' : row.severity,
  }
}

export async function getStudySummary(userId: number, _range: DashboardRange = '本周'): Promise<StudySummary> {
  return withFallback(async () => {
    const db = getDatabase()
    const [[total]] = await db.query<StudyTotalRow[]>(`
      SELECT
        COALESCE(SUM(effective_seconds), 0) AS total_seconds,
        COALESCE(SUM(CASE WHEN DATE(started_at) = CURDATE() THEN effective_seconds ELSE 0 END), 0) AS today_seconds
      FROM study_sessions
      WHERE user_id = ?
    `, [userId])
    const [dailyRows] = await db.query<StudyDayRow[]>(`
      SELECT WEEKDAY(started_at) AS weekday_index, SUM(effective_seconds) AS effective_seconds
      FROM study_sessions
      WHERE user_id = ? AND started_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY WEEKDAY(started_at)
    `, [userId])
    const [targetRows] = await db.query<ValueRow[]>(`
      SELECT COALESCE(target_total_minutes, daily_target_minutes * 7) AS value
      FROM study_plans
      WHERE user_id = ? AND status = 'active'
      ORDER BY starts_on DESC LIMIT 1
    `, [userId])
    const secondsByDay = new Map(dailyRows.map((row) => [row.weekday_index, Number(row.effective_seconds)]))
    const maximum = Math.max(...secondsByDay.values(), 1)

    return {
      totalSeconds: Number(total?.total_seconds ?? 0),
      todaySeconds: Number(total?.today_seconds ?? 0),
      targetSeconds: Number(targetRows[0]?.value ?? 3000) * 60,
      changePercent: 12.4,
      bars: WEEK_LABELS.map((day, index) => {
        const seconds = secondsByDay.get(index) ?? 0
        return { day, seconds, value: Math.round((seconds / maximum) * 88) }
      }),
    }
  }, FALLBACK_STUDY_SUMMARY)
}

export async function getActivePlan(userId: number): Promise<ActivePlan> {
  return withFallback(async () => {
    const db = getDatabase()
    const [plans] = await db.query<PlanRow[]>(`
      SELECT id, title, starts_on, ends_on, daily_target_minutes, target_total_minutes
      FROM study_plans
      WHERE user_id = ? AND status = 'active'
      ORDER BY starts_on DESC LIMIT 1
    `, [userId])
    const plan = plans[0]
    if (!plan) return structuredClone(FALLBACK_ACTIVE_PLAN)

    const [tasks] = await db.query<PlanTaskRow[]>(`
      SELECT t.id, t.title, t.planned_minutes, t.status, s.name AS subject
      FROM study_tasks t
      LEFT JOIN subjects s ON s.id = t.subject_id
      WHERE t.plan_id = ?
      ORDER BY t.sort_order, t.id
    `, [plan.id])
    const [days] = await db.query<ValueRow[]>('SELECT weekday AS value FROM study_plan_days WHERE plan_id = ? ORDER BY weekday', [plan.id])
    const [subjects] = await db.query<ValueRow[]>(`
      SELECT s.name AS value FROM study_plan_subjects ps
      INNER JOIN subjects s ON s.id = ps.subject_id
      WHERE ps.plan_id = ? ORDER BY ps.priority, s.sort_order
    `, [plan.id])

    return {
      id: plan.id,
      title: plan.title,
      startsOn: toDateString(plan.starts_on),
      endsOn: toDateString(plan.ends_on),
      dailyMinutes: plan.daily_target_minutes,
      selectedDays: days.map((row) => Number(row.value)),
      subjects: subjects.map((row) => String(row.value)),
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        subject: task.subject ?? '未分类',
        duration: task.planned_minutes,
        completed: task.status === 'completed',
      })),
    }
  }, FALLBACK_ACTIVE_PLAN)
}

export async function getHealthOverview(userId: number): Promise<HealthOverview> {
  return withFallback(async () => {
    const db = getDatabase()
    const [snapshots] = await db.query<HealthRow[]>(`
      SELECT health_score, myopia_risk_score, sedentary_minutes, fatigue_level, average_viewing_distance_cm
      FROM health_daily_snapshots
      WHERE user_id = ?
      ORDER BY snapshot_date DESC LIMIT 1
    `, [userId])
    if (!snapshots[0]) return structuredClone(FALLBACK_HEALTH_OVERVIEW)
    const [events] = await db.query<HealthEventRow[]>(`
      SELECT id, event_type, severity, started_at, measured_value, measured_unit, details
      FROM health_events
      WHERE user_id = ? AND DATE(started_at) = CURDATE()
      ORDER BY started_at DESC LIMIT 6
    `, [userId])
    const snapshot = snapshots[0]

    return {
      score: Number(snapshot.health_score),
      scoreChange: 4,
      myopiaRisk: Number(snapshot.myopia_risk_score),
      averageViewingDistanceCm: Number(snapshot.average_viewing_distance_cm ?? 0),
      sedentaryMinutes: snapshot.sedentary_minutes,
      fatigueLevel: snapshot.fatigue_level,
      nextBreakAt: '14:30',
      events: events.map((event) => ({
        id: event.id,
        time: new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(event.started_at),
        type: event.event_type,
        ...eventPresentation(event),
      })),
    }
  }, FALLBACK_HEALTH_OVERVIEW)
}

export async function getPomodoroStats(userId: number): Promise<PomodoroStats> {
  return withFallback(async () => {
    const db = getDatabase()
    const [[row]] = await db.query<PomodoroRow[]>(`
      SELECT
        SUM(ps.mode = 'focus' AND ps.status = 'completed') AS completed_count,
        SUM(CASE WHEN ps.mode = 'focus' AND ps.status = 'completed' THEN ps.elapsed_seconds ELSE 0 END) AS focused_seconds,
        settings.focus_minutes,
        settings.short_break_minutes
      FROM pomodoro_settings settings
      LEFT JOIN pomodoro_sessions ps ON ps.user_id = settings.user_id AND DATE(ps.started_at) = CURDATE()
      WHERE settings.user_id = ?
      GROUP BY settings.user_id, settings.focus_minutes, settings.short_break_minutes
    `, [userId])

    return {
      focusMinutes: row?.focus_minutes ?? 25,
      breakMinutes: row?.short_break_minutes ?? 5,
      completedToday: Number(row?.completed_count ?? 0),
      focusedMinutesToday: Math.round(Number(row?.focused_seconds ?? 0) / 60),
    }
  }, FALLBACK_POMODORO_STATS)
}

export async function getLatestEnvironmentReading(userId: number): Promise<EnvironmentReading> {
  return withFallback(async () => {
    const [rows] = await getDatabase().query<EnvironmentReadingRow[]>(`
      SELECT ambient_light_lux, desk_lamp_brightness_percent, color_temperature_kelvin, desk_lamp_mode,
             posture_status, seat_status, writing_distance_cm, study_duration_minutes, captured_at
      FROM study_environment_readings
      WHERE user_id = ?
      ORDER BY captured_at DESC, id DESC
      LIMIT 1
    `, [userId])
    const row = rows[0]
    if (!row) return structuredClone(FALLBACK_ENVIRONMENT_READING)

    return {
      ambientLightLux: row.ambient_light_lux,
      deskLampBrightnessPercent: row.desk_lamp_brightness_percent,
      colorTemperatureKelvin: row.color_temperature_kelvin ?? 4200,
      deskLampMode: row.desk_lamp_mode ?? 'auto',
      postureStatus: row.posture_status,
      seatStatus: row.seat_status,
      writingDistanceCm: row.writing_distance_cm,
      studyDurationMinutes: row.study_duration_minutes,
      capturedAt: row.captured_at instanceof Date ? row.captured_at.toISOString() : row.captured_at,
    }
  }, FALLBACK_ENVIRONMENT_READING)
}

export async function createEnvironmentReadings(userId: number, readings: EnvironmentReadingInput[]) {
  const db = getDatabase()
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()
    const ids: number[] = []
    for (const reading of readings) {
      const [result] = await connection.execute<ResultSetHeader>(`
        INSERT INTO study_environment_readings (
          user_id, posture_status, seat_status, ambient_light_lux,
          desk_lamp_brightness_percent, color_temperature_kelvin, desk_lamp_mode,
          writing_distance_cm, study_duration_minutes, captured_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()))
      `, [
        userId,
        reading.postureStatus ?? null,
        reading.seatStatus ?? null,
        reading.ambientLightLux ?? null,
        reading.deskLampBrightnessPercent ?? null,
        reading.colorTemperatureKelvin ?? null,
        reading.deskLampMode ?? 'auto',
        reading.writingDistanceCm ?? null,
        reading.studyDurationMinutes ?? null,
        reading.capturedAt ?? null,
      ])
      ids.push(result.insertId)
    }
    await connection.commit()
    return ids
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export async function updateTaskCompletion(userId: number, taskId: number, completed: boolean) {
  if (!isDatabaseConfigured()) return
  const db = getDatabase()
  await db.execute<ResultSetHeader>(`
    UPDATE study_tasks t
    INNER JOIN study_plans p ON p.id = t.plan_id
    SET t.status = ?, t.completed_at = ?
    WHERE t.id = ? AND p.user_id = ?
  `, [completed ? 'completed' : 'pending', completed ? new Date() : null, taskId, userId])
}

export async function updateActivePlan(userId: number, planId: number, input: PlanUpdateInput) {
  if (!isDatabaseConfigured()) return
  const db = getDatabase()
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute(`
      UPDATE study_plans
      SET title = ?, daily_target_minutes = ?, starts_on = ?, ends_on = ?
      WHERE id = ? AND user_id = ?
    `, [input.title, input.dailyMinutes, input.startsOn, input.endsOn, planId, userId])
    await connection.execute('DELETE FROM study_plan_days WHERE plan_id = ?', [planId])
    for (const weekday of input.selectedDays) {
      await connection.execute('INSERT INTO study_plan_days (plan_id, weekday, target_minutes) VALUES (?, ?, ?)', [planId, weekday, input.dailyMinutes])
    }
    await connection.execute('DELETE FROM study_plan_subjects WHERE plan_id = ?', [planId])
    for (const [index, subjectName] of input.subjects.entries()) {
      await connection.execute('INSERT IGNORE INTO subjects (user_id, name) VALUES (?, ?)', [userId, subjectName])
      await connection.execute(`
        INSERT INTO study_plan_subjects (plan_id, subject_id, priority)
        SELECT ?, id, ? FROM subjects WHERE user_id = ? AND name = ?
      `, [planId, index + 1, userId, subjectName])
    }
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export async function createPomodoroSession(userId: number, mode: 'focus' | 'short_break', plannedSeconds: number) {
  if (!isDatabaseConfigured()) return 0
  const [result] = await getDatabase().execute<ResultSetHeader>(`
    INSERT INTO pomodoro_sessions (user_id, mode, status, planned_seconds, elapsed_seconds, started_at)
    VALUES (?, ?, 'running', ?, 0, NOW())
  `, [userId, mode, plannedSeconds])
  return result.insertId
}

export async function finishPomodoroSession(userId: number, sessionId: number, elapsedSeconds: number, completed: boolean) {
  if (!isDatabaseConfigured() || sessionId === 0) return
  await getDatabase().execute(`
    UPDATE pomodoro_sessions
    SET status = ?, elapsed_seconds = LEAST(?, planned_seconds), ended_at = NOW()
    WHERE id = ? AND user_id = ?
  `, [completed ? 'completed' : 'paused', elapsedSeconds, sessionId, userId])
}
