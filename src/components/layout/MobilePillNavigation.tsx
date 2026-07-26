'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { Eye, Lightbulb, Moon, SlidersHorizontal, SunMedium, X } from 'lucide-react'
import { FALLBACK_ENVIRONMENT_READING } from '../../data/server-fallback'
import { NAV_ITEMS } from '../../data/dashboard'
import type { EnvironmentReading } from '../../types/dashboard'

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
  const [deskLampMode, setDeskLampMode] = useState<'auto' | 'manual'>('auto')
  const [latestReading, setLatestReading] = useState<EnvironmentReading | null>(null)
  const [isSavingMode, setIsSavingMode] = useState(false)
  const [modeSaveError, setModeSaveError] = useState(false)
  const brightnessSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentMode = LIGHT_MODES.find((mode) => mode.id === lightMode) ?? LIGHT_MODES[1]
  const displayedAmbientLight = latestReading?.ambientLightLux ?? Math.round(brightness * 9.4)
  const displayedColorTemperature = latestReading?.colorTemperatureKelvin ?? Number.parseInt(currentMode.temperature, 10)
  const activeIndex = Math.max(0, NAV_ITEMS.findIndex(({ href }) => pathname === href))
  const capsuleStyle = { '--nav-active-index': activeIndex } as CSSProperties

  useEffect(() => {
    if (!isControlOpen) return

    let cancelled = false
    const loadLatestReading = async () => {
      try {
        const response = await fetch('/api/monitoring/readings', { cache: 'no-store' })
        if (!response.ok) throw new Error('Unable to load desk light settings')
        const reading = await response.json() as EnvironmentReading
        if (cancelled) return

        setLatestReading(reading)
        setDeskLampMode(reading.deskLampMode)
        setBrightness(reading.deskLampBrightnessPercent)
        const matchingPreset = LIGHT_MODES.find((mode) => Number.parseInt(mode.temperature, 10) === reading.colorTemperatureKelvin)
        if (matchingPreset) setLightMode(matchingPreset.id)
        window.dispatchEvent(new CustomEvent('desk-light-reading-updated', { detail: reading }))
        setModeSaveError(false)
      } catch {
        if (!cancelled) setModeSaveError(true)
      }
    }

    void loadLatestReading()
    return () => { cancelled = true }
  }, [isControlOpen])

  useEffect(() => () => {
    if (brightnessSaveTimer.current) clearTimeout(brightnessSaveTimer.current)
  }, [])

  const persistLightSettings = async (updates: Partial<Pick<EnvironmentReading, 'deskLampMode' | 'deskLampBrightnessPercent' | 'colorTemperatureKelvin'>>) => {
    const base = latestReading
    const fallbackAmbient = Math.max(0, Math.round(brightness * 9.4))
    const storedAmbient = base?.ambientLightLux
    const payload = {
      ...(base?.postureStatus != null ? { postureStatus: base.postureStatus } : {}),
      ...(base?.seatStatus != null ? { seatStatus: base.seatStatus } : {}),
      ambientLightLux: typeof storedAmbient === 'number' && Number.isInteger(storedAmbient) ? storedAmbient : fallbackAmbient,
      deskLampBrightnessPercent: updates.deskLampBrightnessPercent ?? base?.deskLampBrightnessPercent ?? brightness,
      colorTemperatureKelvin: updates.colorTemperatureKelvin ?? base?.colorTemperatureKelvin ?? Number.parseInt(currentMode.temperature, 10),
      deskLampMode: updates.deskLampMode ?? base?.deskLampMode ?? deskLampMode,
      ...(base?.writingDistanceCm != null ? { writingDistanceCm: base.writingDistanceCm } : {}),
      ...(base?.studyDurationMinutes != null ? { studyDurationMinutes: base.studyDurationMinutes } : {}),
    }
    const response = await fetch('/api/monitoring/readings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) throw new Error('Unable to save desk light settings')

    const nextReading = { ...(base ?? FALLBACK_ENVIRONMENT_READING), ...payload }
    setLatestReading(nextReading)
    setModeSaveError(false)
    window.dispatchEvent(new CustomEvent('desk-light-reading-updated', { detail: nextReading }))
    return nextReading
  }

  const updateDeskLampMode = async (nextMode: 'auto' | 'manual') => {
    if (nextMode === deskLampMode || isSavingMode) return

    setIsSavingMode(true)
    setModeSaveError(false)
    try {
      const savedReading = await persistLightSettings({ deskLampMode: nextMode })
      setDeskLampMode(savedReading.deskLampMode)
    } catch {
      setModeSaveError(true)
    } finally {
      setIsSavingMode(false)
    }
  }

  const updateLightMode = (nextMode: (typeof LIGHT_MODES)[number]['id']) => {
    setLightMode(nextMode)
    const temperature = LIGHT_MODES.find((mode) => mode.id === nextMode)?.temperature
    if (deskLampMode === 'manual' && temperature) {
      void persistLightSettings({ colorTemperatureKelvin: Number.parseInt(temperature, 10) }).catch(() => setModeSaveError(true))
    }
  }

  const updateBrightness = (nextBrightness: number) => {
    setBrightness(nextBrightness)
    if (deskLampMode !== 'manual') return
    if (brightnessSaveTimer.current) clearTimeout(brightnessSaveTimer.current)
    brightnessSaveTimer.current = setTimeout(() => {
      void persistLightSettings({ deskLampBrightnessPercent: nextBrightness }).catch(() => setModeSaveError(true))
    }, 250)
  }

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

            <div className="desk-lamp-mode-control" role="group" aria-label="桌面灯模式">
              <button
                className={deskLampMode === 'auto' ? 'desk-lamp-mode-selected' : ''}
                type="button"
                onClick={() => void updateDeskLampMode('auto')}
                disabled={isSavingMode}
                aria-pressed={deskLampMode === 'auto'}
              >
                自动模式
              </button>
              <button
                className={deskLampMode === 'manual' ? 'desk-lamp-mode-selected' : ''}
                type="button"
                onClick={() => void updateDeskLampMode('manual')}
                disabled={isSavingMode}
                aria-pressed={deskLampMode === 'manual'}
              >
                手动模式
              </button>
            </div>
            {modeSaveError && <p className="desk-lamp-mode-error" role="status">模式同步失败</p>}

            <fieldset className={`light-control-manual-settings ${deskLampMode === 'auto' ? 'is-locked' : ''}`} disabled={deskLampMode === 'auto'} aria-label="手动灯光参数">
              <div className="light-mode-picker" role="tablist" aria-label="灯光模式">
                {LIGHT_MODES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className={lightMode === id ? 'light-mode-active' : ''}
                    onClick={() => updateLightMode(id)}
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
                  onChange={(event) => updateBrightness(Number(event.target.value))}
                  aria-label="灯光亮度"
                />
              </div>

              <div className="light-readings">
                <div><span>照度</span><strong className="metric-font">{displayedAmbientLight} <small>lx</small></strong></div>
                <div><span>色温</span><strong className="metric-font">{displayedColorTemperature} K</strong></div>
                <SlidersHorizontal size={18} aria-hidden="true" />
              </div>
            </fieldset>
          </section>
        </div>
      )}
    </>
  )
}
