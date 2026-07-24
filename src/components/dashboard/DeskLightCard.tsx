import { Lightbulb, Sparkles } from 'lucide-react'
import { FALLBACK_ENVIRONMENT_READING } from '../../data/server-fallback'
import type { EnvironmentReading } from '../../types/dashboard'

export function DeskLightCard({ reading = FALLBACK_ENVIRONMENT_READING }: { reading?: EnvironmentReading }) {
  return (
    <article className="panel light-environment-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">DESK LIGHT LIVE</p>
          <h2>桌面光环境</h2>
        </div>
        <span className="light-mode-badge"><Lightbulb size={15} />护眼</span>
      </div>
      <div className="light-environment-body">
        <div className="light-primary-reading"><strong className="metric-font">{reading.ambientLightLux}</strong><span>lx</span></div>
        <div className="light-reading-divider" />
        <div className="light-secondary-reading"><strong className="metric-font">{reading.colorTemperatureKelvin} K</strong><span>台灯亮度 {reading.deskLampBrightnessPercent}%</span></div>
      </div>
      <div className="light-spectrum" aria-label={`当前色温 ${reading.colorTemperatureKelvin} K`} />
      <p className="light-environment-note"><Sparkles size={15} />当前光线适合专注阅读</p>
    </article>
  )
}
