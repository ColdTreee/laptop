/* oxlint-disable react/only-export-components -- Next.js layouts export metadata by convention. */
import type { Metadata } from 'next'
import '../index.css'
import '../App.css'
import '../styles/glass.css'
import '../components/auth/Auth.css'

export const metadata: Metadata = {
  title: '光迹 · 学习健康中心',
  description: '学习效率、用眼与坐姿健康管理平台',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
