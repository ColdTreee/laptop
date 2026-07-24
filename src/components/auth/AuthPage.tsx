import { Activity, BarChart3, ShieldCheck, Sparkles } from 'lucide-react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { AmbientBackdrop } from '../ui/AmbientBackdrop'
import type { AuthMode, LoginPayload, RegisterPayload } from '../../types'

interface AuthPageProps {
  mode: AuthMode
  onLogin: (payload: LoginPayload) => void
  onModeChange: (mode: AuthMode) => void
  onRegister: (payload: RegisterPayload) => void
}

const features = [
  { icon: Activity, title: '学习状态追踪', copy: '持续了解专注、疲劳和学习节奏。' },
  { icon: ShieldCheck, title: '健康风险提醒', copy: '及时发现用眼距离与坐姿异常。' },
  { icon: BarChart3, title: '长期趋势洞察', copy: '将每天的数据沉淀为可读的成长轨迹。' },
]

export function AuthPage({ mode, onLogin, onModeChange, onRegister }: AuthPageProps) {
  return (
    <main className="auth-page">
      <AmbientBackdrop variant="auth" />
      <section className="auth-showcase" aria-label="光迹产品介绍">
        <div className="auth-brand"><span><Sparkles size={20} /></span><div><strong>光迹</strong><small>学习健康中心</small></div></div>
        <div className="auth-showcase-copy">
          <p className="auth-kicker">LEARN BETTER · FEEL BETTER</p>
          <h1>让每一次专注，<br /><span>都更轻松、更长久。</span></h1>
          <p>从学习效率到用眼与坐姿健康，用清晰的数据帮助你建立更稳定的学习节奏。</p>
        </div>
        <div className="auth-feature-list">
          {features.map(({ icon: FeatureIcon, title, copy }) => (
            <div className="auth-feature" key={title}><span><FeatureIcon size={18} /></span><div><strong>{title}</strong><p>{copy}</p></div></div>
          ))}
        </div>
        <p className="auth-showcase-foot">数据仅用于个人学习健康分析</p>
      </section>

      <section className="auth-form-section">
        <div className="auth-form-card">
          <div className="auth-mobile-brand"><Sparkles size={18} /><strong>光迹</strong></div>
          {mode === 'login'
            ? <LoginForm onSubmit={onLogin} onSwitchMode={() => onModeChange('register')} />
            : <RegisterForm onSubmit={onRegister} onSwitchMode={() => onModeChange('login')} />}
        </div>
        <p className="auth-legal">登录即表示你同意《用户协议》和《隐私政策》</p>
      </section>
    </main>
  )
}
