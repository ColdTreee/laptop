'use client'

import { useEffect, useMemo, useState } from 'react'
import { Coffee, Pause, Play, RotateCcw, Timer } from 'lucide-react'
import { FALLBACK_POMODORO_STATS } from '../../data/server-fallback'
import type { PomodoroStats } from '../../types/dashboard'

type TimerMode = 'focus' | 'break'

export function PomodoroCard({ stats = FALLBACK_POMODORO_STATS }: { stats?: PomodoroStats }) {
  const focusSeconds = stats.focusMinutes * 60
  const breakSeconds = stats.breakMinutes * 60
  const [mode, setMode] = useState<TimerMode>('focus')
  const [secondsLeft, setSecondsLeft] = useState(focusSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [completedCount, setCompletedCount] = useState(stats.completedToday)
  const [sessionId, setSessionId] = useState(0)
  const currentDuration = mode === 'focus' ? focusSeconds : breakSeconds

  useEffect(() => {
    if (!isRunning) return undefined

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setIsRunning(false)
          if (mode === 'focus') setCompletedCount((count) => count + 1)
          if (sessionId) {
            void fetch(`/api/pomodoro/sessions/${sessionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ elapsedSeconds: currentDuration, completed: true }),
            })
            setSessionId(0)
          }
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [currentDuration, isRunning, mode, sessionId])

  const progress = ((currentDuration - secondsLeft) / currentDuration) * 100
  const timeLabel = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, '0')
    const seconds = (secondsLeft % 60).toString().padStart(2, '0')
    return `${minutes}:${seconds}`
  }, [secondsLeft])

  const changeMode = (nextMode: TimerMode) => {
    setMode(nextMode)
    setSecondsLeft(nextMode === 'focus' ? focusSeconds : breakSeconds)
    setIsRunning(false)
    setSessionId(0)
  }

  const resetTimer = () => {
    setSecondsLeft(currentDuration)
    setIsRunning(false)
    setSessionId(0)
  }

  const toggleTimer = async () => {
    if (secondsLeft === 0) setSecondsLeft(currentDuration)
    if (!isRunning && sessionId === 0) {
      try {
        const response = await fetch('/api/pomodoro/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: mode === 'focus' ? 'focus' : 'short_break', plannedSeconds: currentDuration }),
        })
        if (response.ok) {
          const result = await response.json() as { id: number }
          setSessionId(result.id)
        }
      } catch {
        // 计时器可以离线运行，恢复连接后开始下一轮时会再次同步。
      }
    } else if (isRunning && sessionId) {
      void fetch(`/api/pomodoro/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elapsedSeconds: currentDuration - secondsLeft, completed: false }),
      })
    }
    setIsRunning((running) => !running)
  }

  return (
    <article className="panel pomodoro-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">番茄钟</p><h2>专注当前这一小段</h2></div>
        <Timer size={19} className="panel-accent-icon" />
      </div>

      <div className="timer-mode-switcher" role="tablist" aria-label="计时模式">
        <button className={mode === 'focus' ? 'active' : ''} onClick={() => changeMode('focus')} role="tab" aria-selected={mode === 'focus'}>专注 {stats.focusMinutes} 分钟</button>
        <button className={mode === 'break' ? 'active' : ''} onClick={() => changeMode('break')} role="tab" aria-selected={mode === 'break'}>休息 {stats.breakMinutes} 分钟</button>
      </div>

      <div className="timer-stage">
        <div
          className="timer-ring"
          style={{ background: `conic-gradient(var(--teal) ${progress}%, rgba(207, 229, 222, .55) ${progress}% 100%)` }}
        >
          <div className="timer-ring-inner">
            <span>{mode === 'focus' ? '专注中' : '休息一下'}</span>
            <strong aria-live="polite">{timeLabel}</strong>
            <small>{isRunning ? '计时进行中' : secondsLeft === 0 ? '本轮已完成' : '等待开始'}</small>
          </div>
        </div>
      </div>

      <div className="timer-controls">
        <button className="timer-reset" onClick={resetTimer} aria-label="重置计时" title="重置计时"><RotateCcw size={17} /></button>
        <button className="timer-primary" onClick={toggleTimer}>
          {isRunning ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
          {isRunning ? '暂停' : secondsLeft === currentDuration ? '开始专注' : '继续'}
        </button>
      </div>

      <div className="pomodoro-stats">
        <span><i className="tomato-dot" />今日已完成 <strong>{completedCount}</strong> 轮</span>
        <span><Coffee size={15} />累计专注 <strong>{stats.focusedMinutesToday + Math.max(completedCount - stats.completedToday, 0) * stats.focusMinutes}</strong> 分钟</span>
      </div>
    </article>
  )
}
