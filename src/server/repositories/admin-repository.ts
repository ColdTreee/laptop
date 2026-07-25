import 'server-only'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { getDatabase } from '../../lib/db'
import type { AdminField, AdminResource } from '../../lib/admin-resources'

const quote = (identifier: string) => `\`${identifier.replaceAll('`', '``')}\``

function writableFields(resource: AdminResource) {
  return resource.fields.filter((field) => !field.readOnly)
}

function normalizeValue(field: AdminField, value: unknown): string | number | null {
  if (value === '' || value === undefined) return null
  if (field.type === 'number') {
    const number = Number(value)
    if (!Number.isFinite(number)) throw new Error(`${field.label}必须是有效数字`)
    return number
  }
  if (field.type === 'json') {
    if (value === null) return null
    const text = typeof value === 'string' ? value : JSON.stringify(value)
    JSON.parse(text)
    return text
  }
  if (field.type === 'select' && value !== null && !field.options?.some((item) => item.value === value)) {
    throw new Error(`${field.label}的选项无效`)
  }
  return value === null ? null : String(value)
}

function buildValues(resource: AdminResource, payload: Record<string, unknown>, partial: boolean) {
  const values: { field: AdminField; value: string | number | null }[] = []
  for (const field of writableFields(resource)) {
    if (!(field.key in payload)) {
      if (!partial && field.required) throw new Error(`${field.label}为必填项`)
      continue
    }
    const value = normalizeValue(field, payload[field.key])
    if (field.required && value === null) throw new Error(`${field.label}为必填项`)
    values.push({ field, value })
  }
  if (!values.length) throw new Error('没有可写入的字段')
  return values
}

export async function listAdminRows(resource: AdminResource, page: number, pageSize: number, search: string) {
  const db = getDatabase()
  const where = search && resource.searchFields.length
    ? `WHERE (${resource.searchFields.map((field) => `${quote(field)} LIKE ?`).join(' OR ')})`
    : ''
  const params = where ? resource.searchFields.map(() => `%${search}%`) : []
  const [[count]] = await db.query<(RowDataPacket & { total: number })[]>(`SELECT COUNT(*) AS total FROM ${quote(resource.table)} ${where}`, params)
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM ${quote(resource.table)} ${where} ORDER BY ${quote(resource.defaultOrder)} DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize],
  )
  return { rows, total: Number(count?.total ?? 0), page, pageSize }
}

export async function createAdminRow(resource: AdminResource, payload: Record<string, unknown>) {
  const values = buildValues(resource, payload, false)
  const [result] = await getDatabase().execute<ResultSetHeader>(
    `INSERT INTO ${quote(resource.table)} (${values.map(({ field }) => quote(field.key)).join(', ')}) VALUES (${values.map(() => '?').join(', ')})`,
    values.map(({ value }) => value),
  )
  return result.insertId
}

export async function updateAdminRow(resource: AdminResource, id: string, payload: Record<string, unknown>) {
  const values = buildValues(resource, payload, true)
  const [result] = await getDatabase().execute<ResultSetHeader>(
    `UPDATE ${quote(resource.table)} SET ${values.map(({ field }) => `${quote(field.key)} = ?`).join(', ')} WHERE ${quote(resource.primaryKey)} = ? LIMIT 1`,
    [...values.map(({ value }) => value), id],
  )
  return result.affectedRows
}

export async function deleteAdminRow(resource: AdminResource, id: string) {
  const [result] = await getDatabase().execute<ResultSetHeader>(
    `DELETE FROM ${quote(resource.table)} WHERE ${quote(resource.primaryKey)} = ? LIMIT 1`, [id],
  )
  return result.affectedRows
}

export interface AdminDashboardData {
  userCount: number
  activePlanCount: number
  todayStudyMinutes: number
  todayHealthEvents: number
  recentSessions: RowDataPacket[]
  recentEvents: RowDataPacket[]
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const db = getDatabase()
  const [[[users]], [[plans]], [[study]], [[events]], [recentSessions], [recentEvents]] = await Promise.all([
    db.query<(RowDataPacket & { value: number })[]>('SELECT COUNT(*) AS value FROM users'),
    db.query<(RowDataPacket & { value: number })[]>("SELECT COUNT(*) AS value FROM study_plans WHERE status = 'active'"),
    db.query<(RowDataPacket & { value: number })[]>('SELECT ROUND(COALESCE(SUM(effective_seconds), 0) / 60) AS value FROM study_sessions WHERE DATE(started_at) = CURDATE()'),
    db.query<(RowDataPacket & { value: number })[]>('SELECT COUNT(*) AS value FROM health_events WHERE DATE(started_at) = CURDATE()'),
    db.query<RowDataPacket[]>('SELECT s.id, u.display_name, COALESCE(sub.name, \'未分类\') AS subject, s.effective_seconds, s.focus_score, s.started_at FROM study_sessions s JOIN users u ON u.id = s.user_id LEFT JOIN subjects sub ON sub.id = s.subject_id ORDER BY s.started_at DESC LIMIT 6'),
    db.query<RowDataPacket[]>('SELECT e.id, u.display_name, e.event_type, e.severity, e.started_at FROM health_events e JOIN users u ON u.id = e.user_id ORDER BY e.started_at DESC LIMIT 6'),
  ])
  return { userCount: Number(users?.value ?? 0), activePlanCount: Number(plans?.value ?? 0), todayStudyMinutes: Number(study?.value ?? 0), todayHealthEvents: Number(events?.value ?? 0), recentSessions, recentEvents }
}
