'use client'

import { useEffect, useState } from 'react'
import { Lightbulb, Settings2, Sparkles } from 'lucide-react'
import { FALLBACK_ENVIRONMENT_READING } from '../../data/server-fallback'
import type { EnvironmentReading } from '../../types/dashboard'

export function DeskLightCard({ reading = FALLBACK_ENVIRONMENT_READING }: { reading?: EnvironmentReading }) {
  const [currentReading, setCurrentReading] = useState(reading)

  useEffect(() => {
    const handleReadingUpdate = (event: Event) => {
      if (!(event instanceof CustomEvent) || !event.detail || typeof event.detail !== 'object') return
      setCurrentReading(event.detail as EnvironmentReading)
    }
    window.addEventListener('desk-light-reading-updated', handleReadingUpdate)
    return () => window.removeEventListener('desk-light-reading-updated', handleReadingUpdate)
  }, [])

  const isManualMode = currentReading.deskLampMode === 'manual'

  return (
    <article className="panel light-environment-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">DESK LIGHT LIVE</p>
          <div className="light-title-row">
            <h2>桌面光环境</h2>
            <span className={`desk-lamp-mode ${isManualMode ? 'is-manual' : 'is-auto'}`}>
              <Settings2 aria-hidden="true" size={12} />
              {isManualMode ? '手动模式' : '自动模式'}
            </span>
          </div>
        </div>
        <span className="light-mode-badge"><Lightbulb size={15} />护眼</span>
      </div>
      <div className="light-environment-body">
        <div className="light-primary-reading"><strong className="metric-font">{currentReading.ambientLightLux}</strong><span>lx</span></div>
        <div className="light-reading-divider" />
        <div className="light-secondary-reading"><strong className="metric-font">{currentReading.colorTemperatureKelvin} K</strong><span>台灯亮度 {currentReading.deskLampBrightnessPercent}%</span></div>
      </div>
      <div className="light-spectrum" aria-label={`当前色温 ${currentReading.colorTemperatureKelvin} K`} />
      <p className="light-environment-note"><Sparkles size={15} />当前光线适合专注阅读</p>
    </article>
  )
}
