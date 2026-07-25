export type AdminFieldType = 'text' | 'number' | 'date' | 'datetime-local' | 'select' | 'textarea' | 'json'

export interface AdminField {
  key: string
  label: string
  type: AdminFieldType
  required?: boolean
  readOnly?: boolean
  hidden?: boolean
  options?: { label: string; value: string }[]
}

export interface AdminResource {
  key: string
  table: string
  label: string
  singular: string
  primaryKey: string
  description: string
  searchFields: string[]
  defaultOrder: string
  fields: AdminField[]
}

const option = (...values: string[]) => values.map((value) => ({ label: value, value }))
const id = (key = 'id'): AdminField => ({ key, label: key === 'user_id' ? '用户 ID' : 'ID', type: 'number', readOnly: true })
const userId: AdminField = { key: 'user_id', label: '用户 ID', type: 'number', required: true }

export const ADMIN_RESOURCES = {
  users: {
    key: 'users', table: 'users', label: '用户管理', singular: '用户', primaryKey: 'id', description: '维护平台用户与学习阶段信息', searchFields: ['email', 'display_name', 'school_stage', 'grade'], defaultOrder: 'created_at',
    fields: [id(), { key: 'email', label: '邮箱', type: 'text', required: true }, { key: 'password_hash', label: '密码哈希', type: 'text', required: true, hidden: true }, { key: 'display_name', label: '姓名', type: 'text', required: true }, { key: 'school_stage', label: '学段', type: 'text' }, { key: 'grade', label: '年级', type: 'text' }, { key: 'timezone', label: '时区', type: 'text', required: true }, { key: 'created_at', label: '创建时间', type: 'datetime-local', readOnly: true }, { key: 'updated_at', label: '更新时间', type: 'datetime-local', readOnly: true }],
  },
  subjects: {
    key: 'subjects', table: 'subjects', label: '科目管理', singular: '科目', primaryKey: 'id', description: '维护用户科目、颜色与排序', searchFields: ['name'], defaultOrder: 'sort_order',
    fields: [id(), userId, { key: 'name', label: '科目名称', type: 'text', required: true }, { key: 'color', label: '颜色', type: 'text' }, { key: 'sort_order', label: '排序', type: 'number', required: true }, { key: 'created_at', label: '创建时间', type: 'datetime-local', readOnly: true }],
  },
  plans: {
    key: 'plans', table: 'study_plans', label: '学习计划', singular: '计划', primaryKey: 'id', description: '维护计划周期、目标与状态', searchFields: ['title', 'notes'], defaultOrder: 'updated_at',
    fields: [id(), userId, { key: 'title', label: '计划标题', type: 'text', required: true }, { key: 'status', label: '状态', type: 'select', required: true, options: option('draft', 'active', 'completed', 'archived') }, { key: 'starts_on', label: '开始日期', type: 'date', required: true }, { key: 'ends_on', label: '结束日期', type: 'date', required: true }, { key: 'daily_target_minutes', label: '每日目标（分钟）', type: 'number', required: true }, { key: 'target_total_minutes', label: '总目标（分钟）', type: 'number' }, { key: 'notes', label: '备注', type: 'textarea' }, { key: 'created_at', label: '创建时间', type: 'datetime-local', readOnly: true }, { key: 'updated_at', label: '更新时间', type: 'datetime-local', readOnly: true }],
  },
  tasks: {
    key: 'tasks', table: 'study_tasks', label: '学习任务', singular: '任务', primaryKey: 'id', description: '维护计划内任务与完成状态', searchFields: ['title'], defaultOrder: 'updated_at',
    fields: [id(), { key: 'plan_id', label: '计划 ID', type: 'number', required: true }, { key: 'subject_id', label: '科目 ID', type: 'number' }, { key: 'title', label: '任务标题', type: 'text', required: true }, { key: 'planned_minutes', label: '计划时长（分钟）', type: 'number', required: true }, { key: 'scheduled_on', label: '计划日期', type: 'date' }, { key: 'sort_order', label: '排序', type: 'number', required: true }, { key: 'status', label: '状态', type: 'select', required: true, options: option('pending', 'in_progress', 'completed', 'skipped') }, { key: 'completed_at', label: '完成时间', type: 'datetime-local' }, { key: 'created_at', label: '创建时间', type: 'datetime-local', readOnly: true }, { key: 'updated_at', label: '更新时间', type: 'datetime-local', readOnly: true }],
  },
  sessions: {
    key: 'sessions', table: 'study_sessions', label: '学习记录', singular: '学习记录', primaryKey: 'id', description: '查看与维护学习时段和专注评分', searchFields: ['source'], defaultOrder: 'started_at',
    fields: [id(), userId, { key: 'plan_id', label: '计划 ID', type: 'number' }, { key: 'task_id', label: '任务 ID', type: 'number' }, { key: 'subject_id', label: '科目 ID', type: 'number' }, { key: 'started_at', label: '开始时间', type: 'datetime-local', required: true }, { key: 'ended_at', label: '结束时间', type: 'datetime-local' }, { key: 'duration_seconds', label: '总时长（秒）', type: 'number', required: true }, { key: 'effective_seconds', label: '有效时长（秒）', type: 'number', required: true }, { key: 'focus_score', label: '专注评分', type: 'number' }, { key: 'source', label: '来源', type: 'select', required: true, options: option('manual', 'pomodoro', 'device') }, { key: 'created_at', label: '创建时间', type: 'datetime-local', readOnly: true }],
  },
  health: {
    key: 'health', table: 'health_daily_snapshots', label: '健康快照', singular: '健康快照', primaryKey: 'id', description: '维护每日健康评分与用眼指标', searchFields: ['fatigue_level'], defaultOrder: 'snapshot_date',
    fields: [id(), userId, { key: 'snapshot_date', label: '日期', type: 'date', required: true }, { key: 'health_score', label: '健康评分', type: 'number', required: true }, { key: 'myopia_risk_score', label: '近视风险', type: 'number', required: true }, { key: 'sedentary_minutes', label: '久坐分钟', type: 'number', required: true }, { key: 'fatigue_level', label: '疲劳程度', type: 'select', required: true, options: option('low', 'medium', 'high') }, { key: 'abnormal_eye_events', label: '异常用眼次数', type: 'number', required: true }, { key: 'average_viewing_distance_cm', label: '平均视距（cm）', type: 'number' }, { key: 'average_blinks_per_minute', label: '每分钟眨眼', type: 'number' }, { key: 'created_at', label: '创建时间', type: 'datetime-local', readOnly: true }, { key: 'updated_at', label: '更新时间', type: 'datetime-local', readOnly: true }],
  },
  events: {
    key: 'events', table: 'health_events', label: '健康事件', singular: '健康事件', primaryKey: 'id', description: '维护异常事件、等级与确认状态', searchFields: ['event_type', 'severity', 'measured_unit'], defaultOrder: 'started_at',
    fields: [id(), userId, { key: 'event_type', label: '事件类型', type: 'select', required: true, options: option('viewing_too_close', 'bad_posture', 'low_blink_rate', 'long_sitting') }, { key: 'severity', label: '严重程度', type: 'select', required: true, options: option('info', 'warning', 'danger') }, { key: 'started_at', label: '开始时间', type: 'datetime-local', required: true }, { key: 'ended_at', label: '结束时间', type: 'datetime-local' }, { key: 'measured_value', label: '测量值', type: 'number' }, { key: 'measured_unit', label: '单位', type: 'text' }, { key: 'details', label: '详情（JSON）', type: 'json' }, { key: 'acknowledged_at', label: '确认时间', type: 'datetime-local' }, { key: 'created_at', label: '创建时间', type: 'datetime-local', readOnly: true }],
  },
  environment: {
    key: 'environment', table: 'study_environment_readings', label: '环境监测', singular: '监测记录', primaryKey: 'id', description: '维护姿态、光照、台灯与书写距离数据', searchFields: [], defaultOrder: 'captured_at',
    fields: [id(), userId, { key: 'posture_status', label: '姿态（0-4）', type: 'number' }, { key: 'seat_status', label: '在座状态（0/1）', type: 'number' }, { key: 'ambient_light_lux', label: '环境光（lx）', type: 'number' }, { key: 'desk_lamp_brightness_percent', label: '台灯亮度（%）', type: 'number' }, { key: 'color_temperature_kelvin', label: '色温（K）', type: 'number' }, { key: 'writing_distance_cm', label: '书写距离（cm）', type: 'number' }, { key: 'study_duration_minutes', label: '学习时长（分钟）', type: 'number' }, { key: 'captured_at', label: '采集时间', type: 'datetime-local', required: true }, { key: 'created_at', label: '创建时间', type: 'datetime-local', readOnly: true }],
  },
  pomodoro: {
    key: 'pomodoro', table: 'pomodoro_sessions', label: '番茄钟记录', singular: '番茄钟', primaryKey: 'id', description: '维护专注与休息会话', searchFields: ['mode', 'status'], defaultOrder: 'started_at',
    fields: [id(), userId, { key: 'plan_id', label: '计划 ID', type: 'number' }, { key: 'task_id', label: '任务 ID', type: 'number' }, { key: 'study_session_id', label: '学习记录 ID', type: 'number' }, { key: 'mode', label: '模式', type: 'select', required: true, options: option('focus', 'short_break', 'long_break') }, { key: 'status', label: '状态', type: 'select', required: true, options: option('running', 'paused', 'completed', 'cancelled') }, { key: 'planned_seconds', label: '计划秒数', type: 'number', required: true }, { key: 'elapsed_seconds', label: '已用秒数', type: 'number', required: true }, { key: 'started_at', label: '开始时间', type: 'datetime-local', required: true }, { key: 'ended_at', label: '结束时间', type: 'datetime-local' }, { key: 'created_at', label: '创建时间', type: 'datetime-local', readOnly: true }],
  },
} satisfies Record<string, AdminResource>

export type AdminResourceKey = keyof typeof ADMIN_RESOURCES

export function getAdminResource(key: string): AdminResource | undefined {
  return ADMIN_RESOURCES[key as AdminResourceKey]
}
