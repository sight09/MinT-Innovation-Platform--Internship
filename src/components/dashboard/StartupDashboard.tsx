'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Building2, Star, TrendingUp, MessageSquare, Bell,
  ArrowRight, CheckCircle, AlertCircle, Clock, Sparkles,
  ChevronRight, Target, Users,
} from 'lucide-react'
import { getStageLabel, getNextMilestone, getScoreColor, formatCurrency, formatRelativeTime, getSectorColor } from '@/lib/utils'
import { MintLogo, AiBadge } from '@/components/ui/MintLogo'
import type { StartupProfile, Notification } from '@/types'

interface StartupDashboardProps {
  user: { name?: string | null; email?: string | null; role: string }
  startup: StartupProfile | null
  notifications: Notification[]
}

function ScoreDial({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 28, c = 2 * Math.PI * r
  const fill = ((score / 100) * c)
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--surface-border)" strokeWidth="5" />
        <motion.circle
          cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - fill }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
        />
        <text x="36" y="40" textAnchor="middle" style={{ transform: 'rotate(90deg) translate(0,-72px)', fontSize: '14px', fontWeight: 800, fill: 'var(--text-primary)' }}>
          {score}
        </text>
      </svg>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

export function StartupDashboard({ user, startup, notifications }: StartupDashboardProps) {
  const score = startup?.startupScores?.[0]
  const overallScore = score?.overallScore ?? 0
  const pendingQuestions = (startup as any)?.mentorQuestions?.filter((q: any) => !q.isResolved).length ?? 0
  const reviewCount = startup?.mentorReviews?.length ?? 0
  const investorInterests = (startup as any)?.investmentInterests?.length ?? 0
  const nextStageLabel = startup ? getNextMilestone(startup.stage) : null

  // No startup yet
  if (!startup) {
    return (
      <div>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ marginBottom: 4 }}>Welcome, {user.name?.split(' ')[0]}! </h1>
          <p>Get started by creating your startup profile.</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(27,79,155,0.15), rgba(37,99,235,0.08))',
            border: '1px dashed rgba(27,79,155,0.4)',
            borderRadius: 20, padding: 48, textAlign: 'center',
          }}
        >
          <Building2 size={48} color="#60A5FA" style={{ marginBottom: 16 }} />
          <h2 style={{ marginBottom: 8 }}>Create Your Startup Profile</h2>
          <p style={{ maxWidth: 420, margin: '0 auto 24px' }}>
            Tell MInT about the problem you're solving, your solution, team, and what you need.
            Gain access to verified mentors and investors.
          </p>
          <Link href="/dashboard/startup/submit" className="btn btn-primary btn-lg">
            Submit Your Startup <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ margin: 0 }}>{startup.name}</h1>
            <span className={`stage-badge stage-${startup.stage}`}>{getStageLabel(startup.stage)}</span>
            <span className={`badge ${startup.status === 'APPROVED' ? 'badge-green' : startup.status === 'FEATURED' ? 'badge-blue' : startup.status === 'PENDING_REVIEW' ? 'badge-gold' : 'badge-gray'}`}>
              {startup.status === 'APPROVED' ? '✓ Approved' : startup.status === 'FEATURED' ? '⭐ Featured' : startup.status === 'PENDING_REVIEW' ? '⏳ Pending Review' : startup.status}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>{startup.tagline}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/dashboard/startup/profile" className="btn btn-outline btn-sm">Edit Profile</Link>
          <Link href={`/startups/${startup.id}`} className="btn btn-ghost btn-sm">Public View <ArrowRight size={12} /></Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
        {[
          { label: 'Readiness Score', value: `${overallScore}/100`, icon: Target, color: getScoreColor(overallScore), sub: overallScore >= 75 ? 'Investment Ready' : overallScore >= 50 ? 'Developing' : 'Early Stage' },
          { label: 'Mentor Reviews', value: reviewCount, icon: Star, color: '#FBBF24', sub: reviewCount > 0 ? 'Published' : 'None yet' },
          { label: 'Open Questions', value: pendingQuestions, icon: MessageSquare, color: pendingQuestions > 0 ? '#F97316' : '#4ADE80', sub: pendingQuestions > 0 ? 'Awaiting answers' : 'All answered' },
          { label: 'Investor Interest', value: investorInterests, icon: TrendingUp, color: '#A78BFA', sub: investorInterests > 0 ? 'Investors interested' : 'Grow your profile' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <motion.div key={label} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-value" style={{ color }}>{value}</div>
              <Icon size={18} color={color} style={{ opacity: 0.7 }} />
            </div>
            <div className="stat-label">{label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Readiness Breakdown */}
        {score && (
          <motion.div className="card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h4>Readiness Score</h4>
              <AiBadge />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Problem', value: score.problemClarity, color: '#60A5FA' },
                { label: 'Innovation', value: score.innovationScore, color: '#A78BFA' },
                { label: 'Market', value: score.marketValidation, color: '#4ADE80' },
                { label: 'Business', value: score.businessModelScore, color: '#FBBF24' },
                { label: 'Team', value: score.teamScore, color: '#F87171' },
                { label: 'Mentor Eng.', value: score.mentorEngagement, color: '#34D399' },
              ].map(({ label, value, color }) => (
                <ScoreDial key={label} score={value} label={label} color={color} />
              ))}
            </div>

            {/* AI insights */}
            {score.aiInsights && (
              <div style={{
                background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 10, padding: 12,
              }}>
                <div style={{ fontSize: '0.75rem', color: '#A78BFA', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={12} /> AI Insights
                </div>
                {score.aiInsights.recommendations?.slice(0, 2).map((r: string, i: number) => (
                  <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', gap: 6 }}>
                    <span style={{ color: '#A78BFA', flexShrink: 0 }}>→</span> {r}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Next Milestone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <motion.div className="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <h4 style={{ marginBottom: 12 }}>
              <Target size={16} color="#FBBF24" style={{ display: 'inline', marginRight: 6 }} />
              Next Milestone
            </h4>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(245,166,35,0.15)', border: '2px solid rgba(245,166,35,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ArrowRight size={16} color="#FBBF24" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  Current Stage: <strong style={{ color: '#93C5FD' }}>{getStageLabel(startup.stage)}</strong>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.4 }}>
                  {nextStageLabel}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pending Questions Alert */}
          {pendingQuestions > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: 12, padding: 16,
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <AlertCircle size={18} color="#F97316" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {pendingQuestions} Unanswered Mentor Question{pendingQuestions > 1 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                    Answering mentor questions improves your readiness score and engagement metrics.
                  </div>
                  <Link href={`/startups/${startup.id}#questions`} className="btn btn-sm" style={{ background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.3)', color: '#F97316' }}>
                    Answer Questions <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Investor Interest */}
          {investorInterests > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              style={{
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                borderRadius: 12, padding: 16,
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <TrendingUp size={18} color="#A78BFA" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    🎉 {investorInterests} Investor{investorInterests > 1 ? 's' : ''} Interested
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                    Investors have expressed interest in your startup.
                  </div>
                  <Link href="/dashboard/startup/investors" className="btn btn-sm" style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', color: '#A78BFA' }}>
                    View Investors <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Recent Mentor Reviews */}
      {reviewCount > 0 && (
        <motion.div className="card" style={{ marginTop: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4>Recent Mentor Reviews</h4>
            <Link href="/dashboard/startup/feedback" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          {startup.mentorReviews?.slice(0, 3).map((review: any) => (
            <div key={review.id} style={{
              display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0',
              borderBottom: '1px solid var(--surface-border)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(27,79,155,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: '#93C5FD',
              }}>
                {review.mentor?.user?.firstName?.[0]}{review.mentor?.user?.lastName?.[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {review.mentor?.title} {review.mentor?.user?.firstName} {review.mentor?.user?.lastName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {review.mentor?.organization} · {formatRelativeTime(review.submittedAt)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={14} color="#FBBF24" fill="#FBBF24" />
                <span style={{ fontWeight: 800, color: '#FBBF24' }}>{Number(review.averageScore).toFixed(1)}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>/10</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <motion.div className="card" style={{ marginTop: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4><Bell size={16} style={{ display: 'inline', marginRight: 6 }} />Notifications</h4>
            <span className="badge badge-gold">{notifications.length} new</span>
          </div>
          {notifications.slice(0, 5).map(n => (
            <div key={n.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--surface-border)', alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F5A623', flexShrink: 0, marginTop: 6 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.message}</div>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>{formatRelativeTime(n.createdAt)}</div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
