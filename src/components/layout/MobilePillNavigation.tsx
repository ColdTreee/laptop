'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type CSSProperties, useState } from 'react'
import { Eye, Lightbulb, Moon, SlidersHorizontal, SunMedium, X } from 'lucide-react'
import { NAV_ITEMS } from '../../data/dashboard'

const LIGHT_MODES = [
  { id: 'focus', label: '专注', icon: SunMedium, temperature: '4600 K' },
  { id: 'care', label: '护眼', icon: Eye, temperature: '4200 K' },
  { id: 'night', label: '夜读', icon: Moon, temperature: '3200 K' },
] as const

export function MobilePillNavigation() {
  const pathname = usePathname()
  const [isControlOpen, setIsControlOpen] = useState(false)
  const [lightMode, setLightMode] = useState<(typeof LIGHT_MODES)[number]['id']>('care')
  const [brightness, setBrightness] = useState(72)
  const currentMode = LIGHT_MODES.find((mode) => mode.id === lightMode) ?? LIGHT_MODES[1]
  const activeIndex = Math.max(0, NAV_ITEMS.findIndex(({ href }) => pathname === href))
  const capsuleStyle = { '--nav-active-index': activeIndex } as CSSProperties

  return (
    <>
      <nav className="mobile-pill-navigation" aria-label="主导航">
        <div className="mobile-nav-capsule" style={capsuleStyle}>
          <span className="mobile-nav-slider" aria-hidden="true" />
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`mobile-nav-link ${active ? 'mobile-nav-link-active' : ''}`}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                title={label}
              >
                <Icon size={21} strokeWidth={active ? 2.25 : 1.8} />
              </Link>
            )
          })}
        </div>
        <button
          className="mobile-light-button"
          type="button"
          onClick={() => setIsControlOpen(true)}
          aria-label="打开灯光控制"
          aria-expanded={isControlOpen}
          title="灯光控制"
        >
          <Lightbulb size={24} strokeWidth={2} />
        </button>
      </nav>

      {isControlOpen && (
        <div className="light-control-layer" role="dialog" aria-modal="true" aria-label="灯光控制">
          <button className="light-control-scrim" type="button" onClick={() => setIsControlOpen(false)} aria-label="关闭灯光控制" />
          <section className="light-control-sheet">
            <div className="light-control-header">
              <div>
                <p className="eyebrow">DESK LIGHT</p>
                <h2>桌面光环境</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setIsControlOpen(false)} aria-label="关闭灯光控制">
                <X size={19} />
              </button>
            </div>

            <div className="light-mode-picker" role="tablist" aria-label="灯光模式">
              {LIGHT_MODES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={lightMode === id ? 'light-mode-active' : ''}
                  onClick={() => setLightMode(id)}
                  role="tab"
                  aria-selected={lightMode === id}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="light-level-control">
              <div><span>亮度</span><strong className="metric-font">{brightness}%</strong></div>
              <input
                type="range"
                min="20"
                max="100"
                value={brightness}
                onChange={(event) => setBrightness(Number(event.target.value))}
                aria-label="灯光亮度"
              />
            </div>

            <div className="light-readings">
              <div><span>照度</span><strong className="metric-font">{Math.round(brightness * 9.4)} <small>lx</small></strong></div>
              <div><span>色温</span><strong className="metric-font">{currentMode.temperature}</strong></div>
              <SlidersHorizontal size={18} aria-hidden="true" />
            </div>
          </section>
        </div>
      )}
    </>
  )
}
