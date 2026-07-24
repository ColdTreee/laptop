export type AuthMode = 'login' | 'register'

export interface LoginPayload {
  account: string
  password: string
  remember: boolean
}

export interface RegisterPayload {
  name: string
  account: string
  password: string
}

export interface UserProfile {
  name: string
  subtitle: string
}

export type { DashboardRange } from './dashboard'
