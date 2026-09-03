'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle, Rocket, Shield, TrendingUp } from 'lucide-react'
import { MintLogo } from '@/components/ui/MintLogo'
import toast from 'react-hot-toast'

type Role = 'STARTUP' | 'INVESTOR' | 'MINT_MENTOR'

const ROLE_INFO = {
  STARTUP: {
    icon: Rocket, color: '#60A5FA',
    title: 'Ethiopian Startup',
    desc: 'Submit your problem, receive mentor feedback, and connect with investors',
    features: ['Free startup profile', 'MInT mentor reviews', 'AI readiness score', 'Investor discovery'],
  },
  INVESTOR: {
    icon: TrendingUp, color: '#FBBF24',
    title: 'Investor',
    desc: 'Discover AI-matched Ethiopian startups with mentor evaluations',
    features: ['AI-powered matching', 'Mentor-evaluated deals', 'Readiness scores', 'Direct interest expression'],
  },
  MINT_MENTOR: {
    icon: Shield, color: '#4ADE80',
    title: 'MInT Mentor',
    desc: 'Apply to become a verified MInT mentor (subject to verification)',
    features: ['Review startups', 'Provide structured feedback', 'Track startup progress', 'Official MInT recognition'],
  },
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedRole = searchParams.get('role') as Role | null

  const [step, setStep] = useState(preselectedRole ? 2 : 1)
  const [role, setRole] = useState<Role>(preselectedRole || 'STARTUP')
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Registration failed')
        return
      }

      setUserId(data.userId)

      if (data.devOtp) {
        setOtp(data.devOtp)
        toast.success(`Dev mode: OTP pre-filled (${data.devOtp})`)
      } else {
        toast.success('Verification email sent! Check your inbox.')
      }

      setStep(3)
    } catch {
      toast.error('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setOtpLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Invalid OTP')
        return
      }

      toast.success('Email verified! Signing you in...')

      // Auto sign in
      await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      router.push('/dashboard')
    } catch {
      toast.error('Verification failed.')
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 4vw, 40px)' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32, textAlign: 'center' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>
          <ArrowLeft size={14} /> Back to home
        </Link>
        <MintLogo size="md" showText style={{ justifyContent: 'center' }} />
      </motion.div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32, alignItems: 'center' }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step >= s ? (step > s ? '#22C55E' : '#1B4F9B') : 'var(--surface-card)',
              border: `1px solid ${step >= s ? (step > s ? '#22C55E' : '#2563EB') : 'var(--surface-border)'}`,
              fontSize: '0.75rem', fontWeight: 700, color: step >= s ? '#fff' : 'var(--text-muted)',
              transition: 'all 300ms',
            }}>
              {step > s ? <CheckCircle size={14} /> : s}
            </div>
            {s < 3 && <div style={{ width: 40, height: 1, background: step > s ? '#22C55E' : 'var(--surface-border)', transition: 'background 300ms' }} />}
          </div>
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        style={{ width: '100%', maxWidth: 520 }}
      >
        {/* Step 1: Select Role */}
        {step === 1 && (
          <div>
            <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Join the Platform</h2>
            <p style={{ textAlign: 'center', marginBottom: 28, color: 'var(--text-muted)' }}>Choose your role to get started</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(Object.entries(ROLE_INFO) as [Role, typeof ROLE_INFO.STARTUP][]).map(([r, info]) => {
                const Icon = info.icon
                const isSelected = role === r
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    style={{
                      background: isSelected ? `rgba(${r === 'STARTUP' ? '37,99,235' : r === 'INVESTOR' ? '245,166,35' : '34,197,94'},0.12)` : 'var(--surface-card)',
                      border: `2px solid ${isSelected ? info.color : 'var(--surface-border)'}`,
                      borderRadius: 12, padding: '14px 16px',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 200ms',
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                    }}
                    id={`role-${r.toLowerCase()}`}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: `${info.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={18} color={info.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{info.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{info.desc}</div>
                    </div>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                      border: `2px solid ${isSelected ? info.color : 'var(--surface-border)'}`,
                      background: isSelected ? info.color : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                    </div>
                  </button>
                )
              })}
            </div>

            <button className="btn btn-primary btn-lg" onClick={() => setStep(2)} style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}>
              Continue as {ROLE_INFO[role].title}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Already have an account? <Link href="/login" style={{ color: '#60A5FA', fontWeight: 600 }}>Sign in</Link>
            </div>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <button onClick={() => setStep(1)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
                <ArrowLeft size={14} />
              </button>
              <h2>Create Your Account</h2>
            </div>

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-first">First name</label>
                  <input id="reg-first" className="input" placeholder="Dawit" value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-last">Last name</label>
                  <input id="reg-last" className="input" placeholder="Mulugeta" value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email address</label>
                <input id="reg-email" type="email" className="input" placeholder="you@example.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} required />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="reg-password" type={showPassword ? 'text' : 'password'} className="input" style={{ paddingRight: 42 }} placeholder="Min 8 chars, 1 uppercase, 1 number" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} required />
                  <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm password</label>
                <input id="reg-confirm" type="password" className="input" placeholder="••••••••" value={formData.confirmPassword} onChange={e => setFormData(p => ({ ...p, confirmPassword: e.target.value }))} required />
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--surface-border)' }}>
                By registering, you agree to MInT Innovation Platform's Terms of Service and Privacy Policy. 
                Your data will be handled in accordance with Ethiopian data protection regulations.
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ justifyContent: 'center' }}>
                {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create Account'}
              </button>
            </form>

            <div style={{ position: 'relative', margin: '24px 0', textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--surface-border)' }} />
              <span style={{ position: 'relative', background: 'var(--surface-base)', padding: '0 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                OR
              </span>
            </div>

            <button 
              type="button" 
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="btn btn-outline btn-lg" 
              style={{ width: '100%', justifyContent: 'center', background: '#FFFFFF', color: 'var(--text-primary)' }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
              Sign up with Google
            </button>
          </div>
        )}

        {/* Step 3: OTP Verification */}
        {step === 3 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
              background: 'rgba(27,79,155,0.15)', border: '1px solid rgba(27,79,155,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle size={28} color="#60A5FA" />
            </div>

            <h2 style={{ marginBottom: 8 }}>Verify Your Email</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
              We sent a 6-digit verification code to <strong style={{ color: 'var(--text-primary)' }}>{formData.email}</strong>
            </p>

            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                className="input"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em', fontWeight: 700 }}
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                maxLength={6}
                required
                id="otp-input"
                autoFocus
              />

              <button type="submit" className="btn btn-primary btn-lg" disabled={otp.length < 6 || otpLoading} style={{ justifyContent: 'center' }}>
                {otpLoading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : 'Verify Email'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: 80, textAlign: 'center' }}><Loader2 className="animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}
