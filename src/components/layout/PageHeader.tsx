'use client'

import type { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { DASHBOARD_RANGES } from '../../data/dashboard'
import type { DashboardRange } from '../../types'

interface PageHeaderProps {
  eyebrow?: string
  title?: string
  accent?: string
  description?: string
  range?: DashboardRange
  onRangeChange?: (range: DashboardRange) => void
  action?: ReactNode
  aside?: ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  accent,
  description,
  range,
  onRangeChange,
  action,
  aside,
}: PageHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const hasIntro = Boolean(eyebrow || title || accent || description)

  const changeRange = (nextRange: DashboardRange) => {
    if (onRangeChange) {
      onRangeChange(nextRange)
      return
    }
    router.replace(`${pathname}?range=${encodeURIComponent(nextRange)}`, { scroll: false })
  }

  return (
    <section className={`page-heading${hasIntro ? '' : ' page-heading-focus-only'}`}>
      {hasIntro && (
        <div>
          {eyebrow && <p className="eyebrow teal-eyebrow">{eyebrow}</p>}
          {(title || accent) && <h1>{title}<span>{accent}</span></h1>}
          {description && <p className="heading-copy">{description}</p>}
        </div>
      )}
      <div className="page-heading-aside">
        {aside}
        {range ? (
        <div className="range-switcher" role="tablist" aria-label="统计范围">
          {DASHBOARD_RANGES.map((item) => (
            <button
              key={item}
              className={range === item ? 'range-active' : ''}
              onClick={() => changeRange(item)}
              role="tab"
              aria-selected={range === item}
            >
              {item}
            </button>
          ))}
        </div>
        ) : action}
      </div>
    </section>
  )
}
