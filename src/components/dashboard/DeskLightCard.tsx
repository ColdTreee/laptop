import { Lightbulb, Sparkles } from 'lucide-react'

export function DeskLightCard() {
  return (
    <article className="panel light-environment-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">DESK LIGHT · LIVE</p>
          <h2>桌面光环境</h2>
        </div>
        <span className="light-mode-badge"><Lightbulb size={15} />护眼</span>
      </div>
      <div className="light-environment-body">
        <div className="light-primary-reading"><strong className="metric-font">680</strong><span>lx</span></div>
        <div className="light-reading-divider" />
        <div className="light-secondary-reading"><strong className="metric-font">4200 K</strong><span>柔和中性光</span></div>
      </div>
      <div className="light-spectrum" aria-label="当前色温为 4200 K" />
      <p className="light-environment-note"><Sparkles size={15} />当前光线适合 40 分钟专注阅读</p>
    </article>
  )
}
