'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Star, Users, MessageSquare, CheckCircle, Clock, ChevronRight,
  Building2, ArrowRight, Flag, Eye,
} from 'lucide-react'
import { getStageLabel, getSectorColor, formatRelativeTime } from '@/lib/utils'
import { VerifiedMentorBadge } from '@/components/ui/MintLogo'

interface MentorDashboardProps {
  user: any
  mentorProfile: any
  recentReviews: any[]
  pendingStartups: any[]
  pendingQuestions: any[]
}

export function MentorDashboard({ user, mentorProfile, recentReviews, pendingStartups, pendingQuestions }: MentorDashboardProps) {
  if (!mentorProfile) {
    return (
      <div>
        <h1>Welcome, {user.name?.split(' ')[0]}!</h1>
        <div className="card" style={{ marginTop: 24, padding: 32, textAlign: 'center' }}>
          <Star size={40} color="#4ADE80" style={{ marginBottom: 16 }} />
          <h3>Complete Your Mentor Profile</h3>
          <p style={{ marginBottom: 20 }}>Your mentor profile is pending setup. Please contact MInT admin to complete verification.</p>
          <Link href="/dashboard/mentor/profile" className="btn btn-primary">Set Up Mentor Profile</Link>
        </div>
      </div>
    )
  }

  // Pending approval gate — mentor registered but not yet verified by admin
  if (!mentorProfile.isVerified) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
            background: 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(74,222,128,0.05))',
            border: '2px solid rgba(74,222,128,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={36} color="#4ADE80" />
          </div>
          <h2 style={{ marginBottom: 12 }}>Account Pending Approval</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 28 }}>
            Your mentor account is currently under review by the MInT admin team.
            You'll receive a notification once your account is approved — after which
            you can review startups and give feedback.
          </p>
          <div className="card" style={{ padding: '20px 24px', textAlign: 'left', marginBottom: 24 }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              What happens next?
            </div>
            {[
              'MInT admin reviews your mentor profile and credentials',
              'You receive an approval notification',
              'You gain full access to review startups and give feedback',
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: '#4ADE80',
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
            <h1 style={{ margin: 0 }}>Welcome, {mentorProfile.title} {user.name?.split(' ')[0]}!</h1>
            {mentorProfile.isVerified && <VerifiedMentorBadge />}
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>{mentorProfile.organization}</p>
        </div>
        <Link href="/startups" className="btn btn-primary btn-sm">
          Review Startups <ArrowRight size={14} />
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'Reviews Submitted', value: recentReviews.length, icon: Star, color: '#FBBF24' },
          { label: 'Startups Assigned', value: pendingStartups.length, icon: Building2, color: '#60A5FA' },
          { label: 'Open Questions', value: pendingQuestions.length, icon: MessageSquare, color: '#F97316' },
          { label: 'Flagged (Promising)', value: recentReviews.filter(r => r.isFlagged).length, icon: Flag, color: '#4ADE80' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Startups To Review */}
        <motion.div className="card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4>Startups to Review</h4>
            <Link href="/startups" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {pendingStartups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
              <CheckCircle size={28} color="#4ADE80" style={{ marginBottom: 8 }} />
              <p>All caught up!</p>
            </div>
          ) : (
            pendingStartups.slice(0, 5).map((startup: any) => (
              <Link href={`/mentors/review/${startup.id}`} key={startup.id}>
                <div style={{
                  display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0',
                  borderBottom: '1px solid var(--surface-border)', cursor: 'pointer',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: `${getSectorColor(startup.sector)}22`,
                    border: `1px solid ${getSectorColor(startup.sector)}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, color: getSectorColor(startup.sector),
                  }}>
                    {startup.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{startup.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{startup.sector} · {getStageLabel(startup.stage)}</div>
                  </div>
                  <Eye size={14} color="var(--text-muted)" />
                </div>
              </Link>
            ))
          )}
        </motion.div>

        {/* Recent Reviews */}
        <motion.div className="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4>My Recent Reviews</h4>
          </div>
          {recentReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
              <Star size={28} color="var(--text-muted)" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: '0.875rem' }}>No reviews submitted yet. Start reviewing startups!</p>
            </div>
          ) : (
            recentReviews.slice(0, 5).map((review: any) => (
              <div key={review.id} style={{
                display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0',
                borderBottom: '1px solid var(--surface-border)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{review.startup?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {review.startup?.sector} · {formatRelativeTime(review.submittedAt)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {review.isFlagged && <span title="Flagged as promising"><Flag size={12} color="#4ADE80" fill="#4ADE80" /></span>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={12} color="#FBBF24" fill="#FBBF24" />
                    <span style={{ fontWeight: 800, color: '#FBBF24', fontSize: '0.875rem' }}>{Number(review.averageScore).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>

        {/* Pending Questions from Startups */}
        {pendingQuestions.length > 0 && (
          <motion.div className="card" style={{ gridColumn: '1 / -1' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h4 style={{ marginBottom: 16 }}>
              <MessageSquare size={16} color="#F97316" style={{ display: 'inline', marginRight: 6 }} />
              Awaiting Startup Responses
            </h4>
            {pendingQuestions.map((q: any) => (
              <div key={q.id} style={{
                display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--surface-border)',
                alignItems: 'flex-start',
              }}>
                <Clock size={16} color="#F97316" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                    To: <strong style={{ color: '#93C5FD' }}>{q.startup?.name}</strong>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{q.question}"</div>
                </div>
                <Link href={`/startups/${q.startup?.id}`} className="btn btn-ghost btn-sm">View</Link>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
