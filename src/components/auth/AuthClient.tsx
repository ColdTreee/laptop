'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthPage } from './AuthPage'
import type { AuthMode, LoginPayload, RegisterPayload, UserProfile } from '../../types'

export function AuthClient() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')

  const enterDashboard = (user: UserProfile) => {
    window.localStorage.setItem('light-trace-user', JSON.stringify(user))
    router.push('/dashboard')
  }

  const login = ({ account }: LoginPayload) => {
    enterDashboard({
      name: account.includes('@') ? account.split('@')[0] : '林小满',
      subtitle: '高中 · 2 年级',
    })
  }

  const register = ({ name }: RegisterPayload) => {
    enterDashboard({ name, subtitle: '新用户 · 待完善资料' })
  }

  return <AuthPage mode={mode} onLogin={login} onModeChange={setMode} onRegister={register} />
}
