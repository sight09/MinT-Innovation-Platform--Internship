'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, Loader2, Mail, Lock, ChevronRight, Sparkles, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) {
      toast.error(result.error === 'CredentialsSignin' ? 'Invalid email or password' : 'Login failed. Please try again.')
    } else {
      toast.success('Welcome back!')
      router.push(callbackUrl)
      router.refresh()
    }
  }

  const demoAccounts = [
    { label: 'Admin', email: 'admin@mint.gov.et', password: 'Admin@MInT2025!', color: '#7C3AED', bg: 'rgba(124,58,237,0.10)' },
    { label: 'Startup', email: 'founder@agromarketai.et', password: 'Startup@2025!', color: '#2563EB', bg: 'rgba(37,99,235,0.10)' },
    { label: 'Mentor', email: 'dr.ayele.bekele@mint.gov.et', password: 'Mentor@MInT2025!', color: '#059669', bg: 'rgba(5,150,105,0.10)' },
    { label: 'Investor', email: 'habte.girma@ethiopianventures.com', password: 'Investor@2025!', color: '#D97706', bg: 'rgba(217,119,6,0.10)' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F5F5 0%, #F0FAF9 30%, #E6F4F1 60%, #EEF6FF 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Soft ambient decorations ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Top-left teal blob */}
        <div style={{
          position: 'absolute', top: '-8%', left: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,130,130,0.12) 0%, transparent 65%)',
        }} />
        {/* Bottom-right orange blob */}
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: 450, height: 450, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,137,26,0.10) 0%, transparent 65%)',
        }} />
        {/* Top-right subtle blue */}
        <div style={{
          position: 'absolute', top: '10%', right: '5%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,107,107,0.08) 0%, transparent 70%)',
        }} />
        {/* Subtle dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(0,120,120,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* Back to home */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 900, marginBottom: 16 }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: '#096976', fontSize: '0.82rem', fontWeight: 600,
          textDecoration: 'none', opacity: 0.75,
          transition: 'opacity 150ms',
        }}>
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>

      {/* ── Horizontal Card ── */}
      <motion.div
        className="login-card-inner"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%',
          maxWidth: 900,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(9,105,118,0.14), 0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(9,105,118,0.12)',
        }}
      >

        {/* ════ LEFT — Branding Panel ════ */}
        <div className="login-brand-panel" style={{
          flex: '0 0 42%',
          background: 'linear-gradient(160deg, #0C4D60 0%, #0F5567 45%, #096976 75%, #074158 100%)',
          padding: '52px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative rings */}
          {[200, 300, 420].map((size, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: size, height: size,
              borderRadius: '50%',
              border: `1px solid rgba(255,255,255,${0.06 - i * 0.015})`,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
            }} />
          ))}
          {/* Orange glow bottom */}
          <div style={{
            position: 'absolute', bottom: -60, right: -40,
            width: 220, height: 220, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,137,26,0.25) 0%, transparent 70%)',
          }} />
          {/* White shimmer top */}
          <div style={{
            position: 'absolute', top: -40, left: -40,
            width: 180, height: 180, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          }} />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
            style={{ position: 'relative', marginBottom: 28, textAlign: 'center' }}
          >
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 120, height: 120, borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              filter: 'blur(20px)',
            }} />
            <Image
              src="/mint-logo.png"
              alt="MInT Logo"
              width={96}
              height={96}
              style={{ objectFit: 'contain', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.2))' }}
              priority
            />
          </motion.div>

          {/* Brand text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            style={{ textAlign: 'center', position: 'relative' }}
          >
            <div style={{
              fontSize: '2rem', fontWeight: 900,
              fontFamily: "'Outfit', 'Inter', sans-serif",
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              marginBottom: 6,
              textShadow: '0 2px 12px rgba(0,0,0,0.2)',
            }}>
              MinT
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 24 }}>
              Innovation Platform
            </div>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, maxWidth: 240, margin: '0 auto' }}>
              Ethiopia's hub where startups, mentors & investors collaborate to build the future.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 32, width: '100%' }}
          >
            {[
              { icon: '', text: 'AI Startup Scoring' },
              { icon: '', text: 'Verified Mentor Network' },
              { icon: '', text: 'Investor Connections' },
            ].map((f, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, padding: '9px 14px',
              }}>
                <span style={{ fontSize: '1rem' }}>{f.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.82rem', fontWeight: 500, textAlign: 'center' }}>{f.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ════ RIGHT — Form Panel ════ */}
        <div style={{
          flex: 1,
          background: '#FFFFFF',
          padding: '48px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0A2540', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                Welcome back
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                Sign in to your MInT Innovation Platform account
              </p>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: '#FEF2F2', border: '1px solid #FECACA',
                    borderRadius: 10, padding: '10px 14px', marginBottom: 20,
                    color: '#DC2626', fontSize: '0.85rem',
                  }}
                >
                  ⚠ {error === 'OAuthSignin' ? 'Authentication error. Please try again.' : 'Authentication failed. Please check your credentials.'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: 7 }} htmlFor="login-email">
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{
                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                    color: focusedField === 'email' ? '#0F5567' : '#9CA3AF', transition: 'color 200ms',
                  }} />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="email"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: focusedField === 'email' ? '#F2F8F9' : '#F8FAFC',
                      border: `1.5px solid ${focusedField === 'email' ? '#0F5567' : '#E2E8F0'}`,
                      borderRadius: 10, padding: '11px 14px 11px 38px',
                      color: '#074158', fontSize: '0.9rem',
                      outline: 'none', transition: 'all 200ms',
                      boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(15,85,103,0.1)' : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: 7 }} htmlFor="login-password">
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{
                    position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
                    color: focusedField === 'password' ? '#0F5567' : '#9CA3AF', transition: 'color 200ms',
                  }} />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="current-password"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: focusedField === 'password' ? '#F2F8F9' : '#F8FAFC',
                      border: `1.5px solid ${focusedField === 'password' ? '#0F5567' : '#E2E8F0'}`,
                      borderRadius: 10, padding: '11px 42px 11px 38px',
                      color: '#074158', fontSize: '0.9rem',
                      outline: 'none', transition: 'all 200ms',
                      boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(15,85,103,0.1)' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(s => !s)}
                    style={{
                      position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#9CA3AF', padding: 4, borderRadius: 6, transition: 'color 200ms',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#0F5567')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Sign In button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4,
                  width: '100%', padding: '13px 24px',
                  background: loading
                    ? '#94A3B8'
                    : 'linear-gradient(135deg, #0D4C60 0%, #0F5567 50%, #096976 100%)',
                  border: 'none',
                  borderRadius: 11, cursor: loading ? 'not-allowed' : 'pointer',
                  color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 200ms',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(15,85,103,0.35)',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,85,103,0.4)' } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,85,103,0.35)' }}
              >
                {loading
                  ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Signing in...</>
                  : <>Sign In <ChevronRight size={16} /></>
                }
              </button>
            </form>

            {/* Divider */}
            <div style={{ position: 'relative', margin: '20px 0', textAlign: 'center' }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#E2E8F0' }} />
              <span style={{ position: 'relative', background: '#FFFFFF', padding: '0 12px', fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.06em' }}>
                OR
              </span>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl })}
              style={{
                width: '100%', padding: '11px 24px',
                background: '#FFFFFF',
                border: '1.5px solid #E2E8F0',
                borderRadius: 11, cursor: 'pointer',
                color: '#374151', fontWeight: 600, fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 200ms',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <svg viewBox="0 0 24 24" width="17" height="17">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Register */}
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: '#64748B' }}>
              Don't have an account?{' '}
              <Link href="/register" style={{ color: '#0F5567', fontWeight: 700, textDecoration: 'none' }}>
                Create one →
              </Link>
            </div>

            {/* Demo accounts */}
            <div style={{
              marginTop: 24,
              padding: '14px 16px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Sparkles size={12} color="#D97706" />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Demo Accounts
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demoAccounts.map(acc => (
                  <button
                    key={acc.label}
                    type="button"
                    onClick={() => { setEmail(acc.email); setPassword(acc.password) }}
                    style={{
                      background: acc.bg,
                      border: `1px solid ${acc.color}28`,
                      borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
                      textAlign: 'left', transition: 'all 170ms',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = acc.color + '70'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = acc.color + '28'; e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: acc.color }}>{acc.label}</div>
                    <div style={{ fontSize: '0.6rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>
                      {acc.email}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 680px) {
          .login-card-inner { flex-direction: column !important; }
          .login-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2F8F9' }}>
        <Loader2 size={32} color="#0F5567" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
