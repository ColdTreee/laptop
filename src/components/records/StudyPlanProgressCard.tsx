'use client'

import { useMemo, useState } from 'react'
import { Check, Circle, Target } from 'lucide-react'
import { FALLBACK_ACTIVE_PLAN } from '../../data/server-fallback'
import type { ActivePlan } from '../../types/dashboard'

export function StudyPlanProgressCard({ plan = FALLBACK_ACTIVE_PLAN }: { plan?: ActivePlan }) {
  const [tasks, setTasks] = useState(plan.tasks)
  const [updateError, setUpdateError] = useState('')
  const completed = tasks.filter((task) => task.completed).length
  const percentage = useMemo(() => tasks.length ? Math.round((completed / tasks.length) * 100) : 0, [completed, tasks.length])

  const toggleTask = async (id: number) => {
    const previous = tasks
    const nextTask = tasks.find((task) => task.id === id)
    if (!nextTask) return
    setUpdateError('')
    setTasks((current) => current.map((task) => (
      task.id === id ? { ...task, completed: !task.completed } : task
    )))
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !nextTask.completed }),
      })
      if (!response.ok) throw new Error('更新失败')
    } catch {
      setTasks(previous)
      setUpdateError('同步失败，请稍后重试')
    }
  }

  return (
    <article className="panel plan-progress-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">学习计划完成情况</p><h2>{plan.title}</h2></div>
        <span className="plan-count"><strong>{completed}</strong> / {tasks.length}</span>
      </div>
      <div className="plan-progress-summary">
        <div className="plan-progress-copy">
          <span>整体进度</span>
          <strong>{percentage}%</strong>
        </div>
        <div className="plan-progress-track" aria-label={`学习计划已完成 ${percentage}%`}>
          <span style={{ width: `${percentage}%` }} />
        </div>
      </div>
      <div className="plan-task-list">
        {tasks.map((task) => (
          <button
            className={`plan-task ${task.completed ? 'plan-task-complete' : ''}`}
            key={task.id}
            onClick={() => toggleTask(task.id)}
            aria-pressed={task.completed}
          >
            <span className="task-check" aria-hidden="true">
              {task.completed ? <Check size={13} strokeWidth={2.6} /> : <Circle size={14} />}
            </span>
            <span className="task-main"><strong>{task.title}</strong><small>{task.subject}</small></span>
            <span className="task-duration">{task.duration} 分钟</span>
          </button>
        ))}
      </div>
      <div className="plan-progress-note"><Target size={15} />{updateError || '任务状态将自动同步到学习计划'}</div>
    </article>
  )
}
