'use client'

import { useState } from 'react'
import { CalendarDays, Check, Save, Sparkles } from 'lucide-react'
import { FALLBACK_ACTIVE_PLAN } from '../../data/server-fallback'
import type { ActivePlan } from '../../types/dashboard'

const WEEK_DAYS = [
  { value: 1, label: '一' }, { value: 2, label: '二' }, { value: 3, label: '三' },
  { value: 4, label: '四' }, { value: 5, label: '五' }, { value: 6, label: '六' },
  { value: 7, label: '日' },
]
const SUBJECTS = ['数学', '英语', '物理', '语文']

export function StudyPlanCustomizer({ plan = FALLBACK_ACTIVE_PLAN }: { plan?: ActivePlan }) {
  const [planName, setPlanName] = useState(plan.title)
  const [dailyMinutes, setDailyMinutes] = useState(plan.dailyMinutes)
  const [selectedDays, setSelectedDays] = useState(plan.selectedDays)
  const [selectedSubjects, setSelectedSubjects] = useState(plan.subjects)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const toggleValue = <T,>(value: T, current: T[], setter: (next: T[]) => void) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
    setSaved(false)
  }

  const savePlan = async () => {
    setSaving(true)
    setSaved(false)
    setSaveError('')
    try {
      const response = await fetch(`/api/plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: planName,
          dailyMinutes,
          startsOn: plan.startsOn,
          endsOn: plan.endsOn,
          selectedDays,
          subjects: selectedSubjects,
        }),
      })
      if (!response.ok) throw new Error('保存失败')
      setSaved(true)
    } catch {
      setSaveError('保存失败，请检查服务状态')
    } finally {
      setSaving(false)
    }
  }

  return (
    <article className="panel plan-customizer-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">学习计划定制</p><h2>把目标拆成每天可完成的节奏</h2></div>
        <span className="status-pill good"><span />进行中</span>
      </div>

      <form className="plan-form" onSubmit={(event) => { event.preventDefault(); void savePlan() }}>
        <label className="form-field">
          <span>计划名称</span>
          <input value={planName} onChange={(event) => { setPlanName(event.target.value); setSaved(false) }} />
        </label>

        <div className="plan-form-row">
          <label className="form-field">
            <span>每日目标</span>
            <div className="input-with-unit">
              <input
                type="number"
                min="30"
                max="600"
                step="15"
                value={dailyMinutes}
                onChange={(event) => { setDailyMinutes(Number(event.target.value)); setSaved(false) }}
              />
              <small>分钟</small>
            </div>
          </label>
          <label className="form-field">
            <span>计划周期</span>
            <div className="date-display"><CalendarDays size={15} /><span>{plan.startsOn.slice(5).replace('-', '.')} - {plan.endsOn.slice(5).replace('-', '.')}</span></div>
          </label>
        </div>

        <fieldset className="option-fieldset">
          <legend>学习日</legend>
          <div className="weekday-picker">
            {WEEK_DAYS.map((day) => (
              <button
                type="button"
                key={day.value}
                className={selectedDays.includes(day.value) ? 'selected' : ''}
                onClick={() => toggleValue(day.value, selectedDays, setSelectedDays)}
                aria-pressed={selectedDays.includes(day.value)}
              >
                {day.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="option-fieldset">
          <legend>重点科目</legend>
          <div className="subject-picker">
            {SUBJECTS.map((subject) => (
              <button
                type="button"
                key={subject}
                className={selectedSubjects.includes(subject) ? 'selected' : ''}
                onClick={() => toggleValue(subject, selectedSubjects, setSelectedSubjects)}
                aria-pressed={selectedSubjects.includes(subject)}
              >
                {selectedSubjects.includes(subject) && <Check size={13} />}
                {subject}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="plan-recommendation">
          <Sparkles size={16} />
          <p><strong>节奏建议</strong>每天安排 4 个专注阶段，优先完成数学与物理，晚间保留 30 分钟复盘。</p>
        </div>

        <div className="form-actions">
          <span className={saved || saveError ? 'save-feedback visible' : 'save-feedback'} aria-live="polite">
            <Check size={14} />{saveError || '计划已保存'}
          </span>
          <button className="primary-button" type="submit" disabled={saving}><Save size={16} />{saving ? '保存中' : '保存计划'}</button>
        </div>
      </form>
    </article>
  )
}
