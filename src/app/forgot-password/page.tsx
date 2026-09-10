'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Loader2, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)

  function startCooldown() {
    setCooldown(60)
    const timer = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSubmitted(true)
        startCooldown()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resendLoading) return
    setResendLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        toast.success('Reset email resent! Check your inbox.')
        startCooldown()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Could not resend email.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const brandPanel = (
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
      {[200, 300, 420].map((size, i) => (
        <div key={i} style={{
          position: 'absolute', width: size, height: size, borderRadius: '50%',
          border: `1px solid rgba(255,255,255,${0.06 - i * 0.015})`,
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        }} />
      ))}
      <div style={{ position: 'absolute', bottom: -60, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,137,26,0.25) 0%, transparent 70%)' }} />
      <motion.div initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, duration: 0.6 }} style={{ position: 'relative', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', filter: 'blur(20px)' }} />
        <Image src="/mint-logo.png" alt="MInT Logo" width={96} height={96} style={{ objectFit: 'contain', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.2))' }} priority />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }} style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Outfit', 'Inter', sans-serif", color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: 6, textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>MinT</div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 24 }}>Innovation Platform</div>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, maxWidth: 240, margin: '0 auto' }}>
          Ethiopia&apos;s hub where startups, mentors &amp; investors collaborate to build the future.
        </p>
      </motion.div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E8F5F5 0%, #F0FAF9 30%, #E6F4F1 60%, #EEF6FF 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-8%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,130,130,0.12) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,137,26,0.10) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,120,120,0.08) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Back to login */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 900, marginBottom: 16 }}>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#096976', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', opacity: 0.75, transition: 'opacity 150ms' }}>
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>

      {/* Card */}
      <motion.div
        className="login-card-inner"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '100%', maxWidth: 900, position: 'relative', zIndex: 1,
          display: 'flex', borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(9,105,118,0.14), 0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(9,105,118,0.12)',
        }}
      >
        {brandPanel}

        {/* Right — Form */}
        <div style={{ flex: 1, background: '#FFFFFF', padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Header */}
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #0D4C60, #096976)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Mail size={18} color="#fff" />
                      </div>
                      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A2540', margin: 0, letterSpacing: '-0.02em' }}>
                        Forgot password?
                      </h1>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                      Enter your registered email and we&apos;ll send you a reset link.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: 7 }} htmlFor="forgot-email">
                        Email Address
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Mail size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'email' ? '#0F5567' : '#9CA3AF', transition: 'color 200ms' }} />
                        <input
                          id="forgot-email"
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
                            color: '#074158', fontSize: '0.9rem', outline: 'none', transition: 'all 200ms',
                            boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(15,85,103,0.1)' : 'none',
                          }}
                        />
                      </div>
                    </div>

                    <button
                      id="forgot-submit-btn"
                      type="submit"
                      disabled={loading}
                      style={{
                        marginTop: 4, width: '100%', padding: '13px 24px',
                        background: loading ? '#94A3B8' : 'linear-gradient(135deg, #0D4C60 0%, #0F5567 50%, #096976 100%)',
                        border: 'none', borderRadius: 11, cursor: loading ? 'not-allowed' : 'pointer',
                        color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        transition: 'all 200ms',
                        boxShadow: loading ? 'none' : '0 4px 16px rgba(15,85,103,0.35)',
                      }}
                      onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,85,103,0.4)' } }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,85,103,0.35)' }}
                    >
                      {loading
                        ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Sending...</>
                        : 'Send Reset Link'
                      }
                    </button>
                  </form>

                  <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.85rem', color: '#64748B' }}>
                    Remember your password?{' '}
                    <Link href="/login" style={{ color: '#0F5567', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  {/* Success state */}
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #E8F5F5, #D0EEEE)', marginBottom: 24 }}>
                      <CheckCircle size={36} color="#0F5567" strokeWidth={2} />
                    </motion.div>

                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A2540', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                      Check your email
                    </h2>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 8px' }}>
                      If an account with <strong style={{ color: '#0F5567' }}>{email}</strong> exists, we&apos;ve sent a password reset link.
                    </p>
                    <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: '0 0 32px' }}>
                      Check your spam folder if you don&apos;t see it within a few minutes.
                    </p>

                    {/* Resend section */}
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
                      <p style={{ color: '#64748B', fontSize: '0.82rem', margin: '0 0 12px' }}>
                        Didn&apos;t receive the email?
                      </p>
                      <button
                        id="resend-reset-btn"
                        onClick={handleResend}
                        disabled={cooldown > 0 || resendLoading}
                        style={{
                          background: 'none', border: `1.5px solid ${cooldown > 0 ? '#E2E8F0' : '#0F5567'}`,
                          borderRadius: 8, padding: '9px 20px', cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                          color: cooldown > 0 ? '#94A3B8' : '#0F5567', fontWeight: 600, fontSize: '0.85rem',
                          display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 200ms',
                        }}
                      >
                        {resendLoading
                          ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Resending...</>
                          : cooldown > 0
                            ? `Resend in ${cooldown}s`
                            : <><RefreshCw size={14} /> Resend email</>
                        }
                      </button>
                    </div>

                    <Link href="/login" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      color: '#0F5567', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none',
                    }}>
                      <ArrowLeft size={14} /> Back to sign in
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
