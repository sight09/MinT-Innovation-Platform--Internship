'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  TrendingUp, Briefcase, Star, ArrowRight, Zap,
  Building2, ChevronRight, CheckCircle,
} from 'lucide-react'
import { getStageLabel, getSectorColor, formatRelativeTime } from '@/lib/utils'
import { VerifiedInvestorBadge } from '@/components/ui/MintLogo'

interface InvestorDashboardProps {
  user: any
  investorProfile: any
  recentInterests: any[]
}

export function InvestorDashboard({ user, investorProfile, recentInterests }: InvestorDashboardProps) {
  if (!investorProfile) {
    return (
      <div>
        <h1>Welcome, {user.name?.split(' ')[0]}!</h1>
        <div className="card" style={{ marginTop: 24, padding: 40, textAlign: 'center' }}>
          <TrendingUp size={40} color="#FBBF24" style={{ marginBottom: 16 }} />
          <h3>Set Up Your Investor Profile</h3>
          <p style={{ maxWidth: 380, margin: '0 auto 24px', color: 'var(--text-muted)' }}>
            Tell us your preferred sectors, stages, and investment range so our AI can match you with the right Ethiopian startups.
          </p>
          <Link href="/dashboard/investor/profile" className="btn btn-gold btn-lg">
            Create Investor Profile <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  // Pending approval gate
  if (!investorProfile.isVerified) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
            background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))',
            border: '2px solid rgba(251,191,36,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Briefcase size={36} color="#FBBF24" />
          </div>
          <h2 style={{ marginBottom: 12 }}>Account Pending Approval</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 28 }}>
            Your investor account is currently under review by the MInT admin team.
            You'll receive a notification once your account is approved — after which you can browse
            startups and express investment interest.
          </p>
          <div className="card" style={{ padding: '20px 24px', textAlign: 'left', marginBottom: 24 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              What happens next?
            </div>
            {[
              'MInT admin reviews your investor profile',
              'You receive an approval notification',
              'You gain full access to browse & connect with startups',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: '#FBBF24',
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: 2 }}>{step}</span>
              </div>
            ))}
          </div>
          <Link href="/notifications" className="btn btn-outline btn-sm">
            <CheckCircle size={14} /> Check Notifications
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0 }}>
              Welcome, {investorProfile.organizationName || user.name?.split(' ')[0]}!
            </h1>
            {investorProfile.isVerified && <VerifiedInvestorBadge />}
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Investor · {Array.isArray(investorProfile.preferredSectors) ? investorProfile.preferredSectors.join(', ') : (investorProfile.preferredSectors || 'All sectors')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/dashboard/investor/recommendations" className="btn btn-gold btn-sm">
            <Zap size={14} /> AI Recommendations
          </Link>
          <Link href="/startups" className="btn btn-outline btn-sm">Explore All</Link>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Interests Expressed', value: recentInterests.length, icon: TrendingUp, color: '#A78BFA' },
          { label: 'In Discussion', value: recentInterests.filter((i: any) => i.status === 'IN_DISCUSSION').length, icon: CheckCircle, color: '#4ADE80' },
          { label: 'Preferred Sectors', value: investorProfile.preferredSectors?.length || 0, icon: Briefcase, color: '#60A5FA' },
          { label: 'Preferred Stages', value: investorProfile.preferredStages?.length || 0, icon: Star, color: '#FBBF24' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="stat-value" style={{ color }}>{value}</div>
              <Icon size={18} color={color} style={{ opacity: 0.7 }} />
            </div>
            <div className="stat-label">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* AI Reco CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'linear-gradient(135deg, rgba(245,166,35,0.12) 0%, rgba(27,79,155,0.1) 100%)',
          border: '1px solid rgba(245,166,35,0.25)',
          borderRadius: 16, padding: 24, marginBottom: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Zap size={18} color="#FBBF24" />
            <h4 style={{ margin: 0, color: '#FBBF24' }}>AI-Powered Startup Recommendations</h4>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 420 }}>
            Our AI matches startups to your investment thesis — sector, stage, funding range, readiness score, and mentor evaluations.
          </p>
        </div>
        <Link href="/dashboard/investor/recommendations" className="btn btn-gold">
          View My Matches <ArrowRight size={14} />
        </Link>
      </motion.div>

      {/* Recent Interests */}
      <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h4>Recently Expressed Interest</h4>
          <Link href="/dashboard/investor/interests" className="btn btn-ghost btn-sm">View All <ChevronRight size={12} /></Link>
        </div>

        {recentInterests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
            <Building2 size={32} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <p>No investment interests yet.</p>
            <Link href="/startups" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
              Discover Startups <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentInterests.map((interest: any) => (
              <Link key={interest.id} href={`/startups/${interest.startup?.id}`}>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'auto 1fr auto auto',
                  gap: 12, alignItems: 'center', padding: '12px 0',
                  borderBottom: '1px solid var(--surface-border)', cursor: 'pointer',
                  transition: 'background 150ms', borderRadius: 4,
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Icon */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${getSectorColor(interest.startup?.sector)}20`,
                    border: `1px solid ${getSectorColor(interest.startup?.sector)}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.875rem', fontWeight: 800,
                    color: getSectorColor(interest.startup?.sector),
                  }}>
                    {interest.startup?.name?.[0]}
                  </div>

                  {/* Info */}
                  <div>
                    <div style={{ fontWeight: 600 }}>{interest.startup?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {interest.startup?.sector} · {getStageLabel(interest.startup?.stage)}
                    </div>
                  </div>

                  {/* Readiness */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#4ADE80' }}>{interest.startup?.readinessScore ?? '—'}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>readiness</div>
                  </div>

                  {/* Status */}
                  <span className={`badge ${interest.status === 'IN_DISCUSSION' ? 'badge-green' : 'badge-blue'}`} style={{ fontSize: '0.7rem' }}>
                    {interest.status === 'EXPRESSED' ? 'Expressed' : interest.status === 'IN_DISCUSSION' ? 'In Discussion' : interest.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
