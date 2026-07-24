import type { InputHTMLAttributes, ReactNode } from 'react'

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon: ReactNode
  endAdornment?: ReactNode
}

export function AuthField({ label, error, icon, endAdornment, id, ...inputProps }: AuthFieldProps) {
  const errorId = error ? `${id}-error` : undefined
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className={`auth-input-wrap ${error ? 'auth-input-error' : ''}`}>
        <span className="auth-input-icon">{icon}</span>
        <input id={id} aria-invalid={Boolean(error)} aria-describedby={errorId} {...inputProps} />
        {endAdornment}
      </div>
      {error && <span className="auth-error" id={errorId}>{error}</span>}
    </div>
  )
}
