'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'
import { AuthField } from './AuthField'
import type { LoginPayload } from '../../types'

interface LoginFormProps {
  onSubmit: (payload: LoginPayload) => void
  onSwitchMode: () => void
}

type LoginErrors = Partial<Record<'account' | 'password', string>>

export function LoginForm({ onSubmit, onSwitchMode }: LoginFormProps) {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: LoginErrors = {}
    if (!account.trim()) nextErrors.account = '请输入手机号或邮箱'
    if (password.length < 6) nextErrors.password = '密码至少需要 6 位'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSubmit({ account: account.trim(), password, remember })
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form-heading"><p>欢迎回来</p><h2>登录青芽鑫护账号</h2><span>继续查看你的学习与健康趋势。</span></div>
      <AuthField id="login-account" label="手机号或邮箱" icon={<UserRound size={18} />} value={account} onChange={(event) => setAccount(event.target.value)} placeholder="请输入手机号或邮箱" autoComplete="username" error={errors.account} />
      <AuthField
        id="login-password"
        label="密码"
        icon={<LockKeyhole size={18} />}
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="请输入密码"
        autoComplete="current-password"
        error={errors.password}
        endAdornment={<button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? '隐藏密码' : '显示密码'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>}
      />
      <div className="auth-form-options">
        <label className="auth-checkbox"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span />记住登录状态</label>
        <button className="auth-link" type="button">忘记密码？</button>
      </div>
      <button className="auth-submit" type="submit">登录 <ArrowRight size={17} /></button>
      <p className="auth-switch">还没有账号？<button type="button" onClick={onSwitchMode}>立即注册</button></p>
    </form>
  )
}
