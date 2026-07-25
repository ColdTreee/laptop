'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { AuthField } from './AuthField'
import type { RegisterPayload } from '../../types'

interface RegisterFormProps {
  onSubmit: (payload: RegisterPayload) => void
  onSwitchMode: () => void
}

type RegisterErrors = Partial<Record<'name' | 'account' | 'password' | 'confirmPassword' | 'agreement', string>>

export function RegisterForm({ onSubmit, onSwitchMode }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<RegisterErrors>({})

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: RegisterErrors = {}
    if (name.trim().length < 2) nextErrors.name = '昵称至少需要 2 个字符'
    if (!/^\S+@\S+\.\S+$/.test(account)) nextErrors.account = '请输入有效的邮箱地址'
    if (password.length < 8) nextErrors.password = '密码至少需要 8 位'
    if (confirmPassword !== password) nextErrors.confirmPassword = '两次输入的密码不一致'
    if (!agreed) nextErrors.agreement = '请先同意用户协议和隐私政策'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSubmit({ name: name.trim(), account: account.trim(), password })
  }

  return (
    <form className="auth-form auth-register-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form-heading"><p>开始使用</p><h2>创建青芽鑫护账号</h2><span>建立属于你的学习健康档案。</span></div>
      <AuthField id="register-name" label="昵称" icon={<UserRound size={18} />} value={name} onChange={(event) => setName(event.target.value)} placeholder="请输入昵称" autoComplete="name" error={errors.name} />
      <AuthField id="register-account" label="邮箱" icon={<Mail size={18} />} type="email" value={account} onChange={(event) => setAccount(event.target.value)} placeholder="name@example.com" autoComplete="email" error={errors.account} />
      <AuthField
        id="register-password"
        label="设置密码"
        icon={<LockKeyhole size={18} />}
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="至少 8 位字符"
        autoComplete="new-password"
        error={errors.password}
        endAdornment={<button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? '隐藏密码' : '显示密码'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>}
      />
      <AuthField id="register-confirm" label="确认密码" icon={<LockKeyhole size={18} />} type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="再次输入密码" autoComplete="new-password" error={errors.confirmPassword} />
      <label className="auth-checkbox auth-agreement"><input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /><span />我已阅读并同意用户协议和隐私政策</label>
      {errors.agreement && <span className="auth-error auth-agreement-error">{errors.agreement}</span>}
      <button className="auth-submit" type="submit">创建账号 <ArrowRight size={17} /></button>
      <p className="auth-switch">已有账号？<button type="button" onClick={onSwitchMode}>返回登录</button></p>
    </form>
  )
}
