'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ArrowLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setTokenError('No reset token found. Please request a new password reset link.')
    }
  }, [token])

  function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
    if (pw.length === 0) return { label: '', color: '#E2E8F0', width: '0%' }
    const hasUpper = /[A-Z]/.test(pw)
    const hasNumber = /[0-9]/.test(pw)
    const hasSpecial = /[^A-Za-z0-9]/.test(pw)
    const score = [pw.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length
    if (score <= 1) return { label: 'Weak', color: '#EF4444', width: '25%' }
    if (score === 2) return { label: 'Fair', color: '#F97316', width: '50%' }
    if (score === 3) return { label: 'Good', color: '#EAB308', width: '75%' }
    return { label: 'Strong', color: '#22C55E', width: '100%' }
  }

  const strength = getPasswordStrength(newPassword)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (!/[A-Z]/.test(newPassword)) {
      toast.error('Password must contain at least one uppercase letter')
      return
    }
    if (!/[0-9]/.test(newPassword)) {
      toast.error('Password must contain at least one number')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 400 && (data.error?.includes('invalid') || data.error?.includes('expired') || data.error?.includes('already been used'))) {
          setTokenError(data.error)
        } else {
          toast.error(data.error || 'Something went wrong. Please try again.')
        }
        return
      }

      setSuccess(true)
      toast.success('Password reset successfully!')
      setTimeout(() => router.push('/login'), 3000)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const brandPanel = (
    <div className="login-brand-panel" style={{
      flex: '0 0 42%',
      background: 'linear-gradient(160deg, #0C4D60 0%, #0F5567 45%, #096976 75%, #074158 100%)',
      padding: '52px 40px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {[200, 300, 420].map((size, i) => (
        <div key={i} style={{ position: 'absolute', width: size, height: size, borderRadius: '50%', border: `1px solid rgba(255,255,255,${0.06 - i * 0.015})`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      ))}
      <div style={{ position: 'absolute', bottom: -60, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,137,26,0.25) 0%, transparent 70%)' }} />
      <motion.div initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, duration: 0.6 }} style={{ position: 'relative', marginBottom: 28, textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', filter: 'blur(20px)' }} />
        <Image src="/mint-logo.png" alt="MInT Logo" width={96} height={96} style={{ objectFit: 'contain', position: 'relative', zIndex: 1, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.2))' }} priority />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }} style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Outfit', 'Inter', sans-serif", color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: 6 }}>MinT</div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase', marginBottom: 24 }}>Innovation Platform</div>
        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, maxWidth: 240, margin: '0 auto' }}>
          Create a strong new password to secure your account.
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
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-8%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,130,130,0.12) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,137,26,0.10) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(0,120,120,0.08) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 900, marginBottom: 16 }}>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#096976', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none', opacity: 0.75 }}>
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>

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

        <div style={{ flex: 1, background: '#FFFFFF', padding: '48px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <AnimatePresence mode="wait">

              {/* Invalid/expired token error */}
              {tokenError ? (
                <motion.div key="token-error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ textAlign: 'center', padding: '12px 0' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: '#FEF2F2', marginBottom: 24 }}>
                    <AlertCircle size={36} color="#DC2626" strokeWidth={2} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A2540', margin: '0 0 10px' }}>
                    Link unavailable
                  </h2>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 28px' }}>
                    {tokenError}
                  </p>
                  <Link href="/forgot-password" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'linear-gradient(135deg, #0D4C60, #096976)',
                    color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                    padding: '12px 24px', borderRadius: 10,
                    boxShadow: '0 4px 16px rgba(15,85,103,0.35)',
                  }}>
                    Request new link <ChevronRight size={16} />
                  </Link>
                  <div style={{ marginTop: 20 }}>
                    <Link href="/login" style={{ color: '#0F5567', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <ArrowLeft size={14} /> Back to sign in
                    </Link>
                  </div>
                </motion.div>
              ) : success ? (
                /* Success state */
                <motion.div key="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ textAlign: 'center', padding: '12px 0' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #E8F5F5, #D0EEEE)', marginBottom: 24 }}>
                    <CheckCircle size={36} color="#0F5567" strokeWidth={2} />
                  </motion.div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A2540', margin: '0 0 10px' }}>
                    Password reset!
                  </h2>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 28px' }}>
                    Your password has been updated. Redirecting you to sign in...
                  </p>
                  <Link href="/login" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'linear-gradient(135deg, #0D4C60, #096976)',
                    color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                    padding: '12px 24px', borderRadius: 10,
                    boxShadow: '0 4px 16px rgba(15,85,103,0.35)',
                  }}>
                    Sign in now <ChevronRight size={16} />
                  </Link>
                </motion.div>
              ) : (
                /* Reset form */
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #0D4C60, #096976)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock size={18} color="#fff" />
                      </div>
                      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A2540', margin: 0, letterSpacing: '-0.02em' }}>
                        Set new password
                      </h1>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                      Choose a strong password to protect your account.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* New password */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: 7 }} htmlFor="new-password">
                        New Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'newPw' ? '#0F5567' : '#9CA3AF', transition: 'color 200ms' }} />
                        <input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 8 characters"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          onFocus={() => setFocusedField('newPw')}
                          onBlur={() => setFocusedField(null)}
                          required
                          autoComplete="new-password"
                          style={{
                            width: '100%', boxSizing: 'border-box',
                            background: focusedField === 'newPw' ? '#F2F8F9' : '#F8FAFC',
                            border: `1.5px solid ${focusedField === 'newPw' ? '#0F5567' : '#E2E8F0'}`,
                            borderRadius: 10, padding: '11px 42px 11px 38px',
                            color: '#074158', fontSize: '0.9rem', outline: 'none', transition: 'all 200ms',
                            boxShadow: focusedField === 'newPw' ? '0 0 0 3px rgba(15,85,103,0.1)' : 'none',
                          }}
                        />
                        <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }} aria-label="Toggle password visibility">
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {/* Strength bar */}
                      {newPassword.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ height: 4, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                            <motion.div
                              animate={{ width: strength.width }}
                              transition={{ duration: 0.3 }}
                              style={{ height: '100%', background: strength.color, borderRadius: 4 }}
                            />
                          </div>
                          <div style={{ fontSize: '0.72rem', color: strength.color, fontWeight: 600, marginTop: 4 }}>{strength.label}</div>
                        </div>
                      )}
                    </div>

                    {/* Confirm password */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: 7 }} htmlFor="confirm-password">
                        Confirm Password
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Lock size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'confirm' ? '#0F5567' : '#9CA3AF', transition: 'color 200ms' }} />
                        <input
                          id="confirm-password"
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          onFocus={() => setFocusedField('confirm')}
                          onBlur={() => setFocusedField(null)}
                          required
                          autoComplete="new-password"
                          style={{
                            width: '100%', boxSizing: 'border-box',
                            background: focusedField === 'confirm' ? '#F2F8F9' : '#F8FAFC',
                            border: `1.5px solid ${
                              confirmPassword && confirmPassword !== newPassword
                                ? '#EF4444'
                                : focusedField === 'confirm' ? '#0F5567' : '#E2E8F0'
                            }`,
                            borderRadius: 10, padding: '11px 42px 11px 38px',
                            color: '#074158', fontSize: '0.9rem', outline: 'none', transition: 'all 200ms',
                            boxShadow: focusedField === 'confirm' ? '0 0 0 3px rgba(15,85,103,0.1)' : 'none',
                          }}
                        />
                        <button type="button" onClick={() => setShowConfirm(s => !s)} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }} aria-label="Toggle confirm password visibility">
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {confirmPassword && confirmPassword !== newPassword && (
                        <div style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 4 }}>Passwords do not match</div>
                      )}
                    </div>

                    <button
                      id="reset-password-submit-btn"
                      type="submit"
                      disabled={loading}
                      style={{
                        marginTop: 4, width: '100%', padding: '13px 24px',
                        background: loading ? '#94A3B8' : 'linear-gradient(135deg, #0D4C60 0%, #0F5567 50%, #096976 100%)',
                        border: 'none', borderRadius: 11, cursor: loading ? 'not-allowed' : 'pointer',
                        color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 200ms',
                        boxShadow: loading ? 'none' : '0 4px 16px rgba(15,85,103,0.35)',
                      }}
                      onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,85,103,0.4)' } }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,85,103,0.35)' }}
                    >
                      {loading
                        ? <><Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> Resetting...</>
                        : <>Reset Password <ChevronRight size={16} /></>
                      }
                    </button>
                  </form>

                  <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.85rem', color: '#64748B' }}>
                    <Link href="/login" style={{ color: '#0F5567', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2F8F9' }}>
        <Loader2 size={32} color="#0F5567" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
