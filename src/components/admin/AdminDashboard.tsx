'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Building2, Users, Shield, Briefcase, Star, TrendingUp,
  CheckCircle, XCircle, AlertCircle, Eye, ArrowRight,
  LineChart, FileText, Search, Filter, Sparkles, Clock,
} from 'lucide-react'
import { getStageLabel, getSectorColor, formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface AdminDashboardProps {
  stats: {
    totalStartups: number
    approvedStartups: number
    pendingStartups: number
    featuredStartups: number
    totalMentors: number
    verifiedMentors: number
    totalInvestors: number
    verifiedInvestors: number
    totalReviews: number
    totalInvestmentInterests: number
    totalMessages: number
  }
  pendingStartups: any[]
  pendingMentors?: any[]
  recentActivity: any[]
  sectorBreakdown: Array<{ sector: string; count: number }>
}

export function AdminDashboard({ stats, pendingStartups, pendingMentors = [], recentActivity, sectorBreakdown }: AdminDashboardProps) {
  const [startupsList, setStartupsList] = useState(pendingStartups)
  const [mentorsList, setMentorsList] = useState(pendingMentors)
  const [processingId, setProcessingId] = useState<string | null>(null)

  async function handleApprove(id: string, action: 'APPROVED' | 'REJECTED') {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/startups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })
      if (!res.ok) throw new Error('Action failed')

      toast.success(action === 'APPROVED' ? 'Startup approved!' : 'Startup rejected')
      setStartupsList(prev => prev.filter(s => s.id !== id))
    } catch {
      toast.error('Failed to update startup status')
    } finally {
      setProcessingId(null)
    }
  }

  async function handleVerifyMentor(id: string) {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/mentors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: true }),
      })
      if (!res.ok) throw new Error('Action failed')

      toast.success('Mentor verified!')
      setMentorsList(prev => prev.filter(m => m.id !== id))
    } catch {
      toast.error('Failed to verify mentor')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0 }}>MInT Ecosystem Admin</h1>
            <span className="badge badge-purple" style={{ fontSize: '0.8rem' }}>MInT Government Console</span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Ministry of Innovation & Technology — Startup Innovation Platform Oversight
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Startups', value: stats.totalStartups, icon: Building2, color: '#60A5FA', sub: `${stats.approvedStartups} approved` },
          { label: 'Pending Review', value: stats.pendingStartups, icon: AlertCircle, color: '#F5A623', sub: 'Action required' },
          { label: 'Verified Mentors', value: stats.verifiedMentors, icon: Shield, color: '#4ADE80', sub: `of ${stats.totalMentors} total` },
          { label: 'Verified Investors', value: stats.verifiedInvestors, icon: Briefcase, color: '#FBBF24', sub: `of ${stats.totalInvestors} total` },
          { label: 'Mentor Reviews', value: stats.totalReviews, icon: Star, color: '#A78BFA', sub: 'Published' },
          { label: 'Investment Expressed', value: stats.totalInvestmentInterests, icon: TrendingUp, color: '#34D399', sub: 'Interests' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <motion.div key={label} className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="stat-value" style={{ color }}>{value}</div>
              <Icon size={18} color={color} style={{ opacity: 0.7 }} />
            </div>
            <div className="stat-label">{label}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Pending Approvals */}
        <motion.div className="card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4>
              <AlertCircle size={16} color="#F5A623" style={{ display: 'inline', marginRight: 6 }} />
              Pending Startup Approvals
            </h4>
            <span className="badge badge-gold">{startupsList.length}</span>
          </div>

          {startupsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
              <CheckCircle size={32} color="#4ADE80" style={{ marginBottom: 8 }} />
              <p>No startups pending review.</p>
            </div>
          ) : (
            startupsList.map((startup) => (
              <div key={startup.id} style={{
                padding: '12px 0', borderBottom: '1px solid var(--surface-border)',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Link href={`/startups/${startup.id}`} style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {startup.name}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: 8, marginTop: 2 }}>
                      <span>{startup.sector}</span>
                      <span>·</span>
                      <span>{getStageLabel(startup.stage)}</span>
                      <span>·</span>
                      <span>By {startup.user?.firstName} {startup.user?.lastName}</span>
                    </div>
                  </div>
                  <Link href={`/startups/${startup.id}`} className="btn btn-ghost btn-xs" style={{ padding: '2px 6px' }}>
                    <Eye size={12} /> Review
                  </Link>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {startup.problemStatement}
                </p>

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => handleApprove(startup.id, 'APPROVED')}
                    disabled={processingId === startup.id}
                    className="btn btn-xs"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ADE80' }}
                  >
                    <CheckCircle size={12} /> Approve Startup
                  </button>
                  <button
                    onClick={() => handleApprove(startup.id, 'REJECTED')}
                    disabled={processingId === startup.id}
                    className="btn btn-xs"
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}
                  >
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>

        {/* Pending Mentors */}
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4>
              <Shield size={16} color="#4ADE80" style={{ display: 'inline', marginRight: 6 }} />
              Pending Mentor Approvals
            </h4>
            <span className="badge badge-green">{mentorsList.length}</span>
          </div>

          {mentorsList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
              <CheckCircle size={32} color="#4ADE80" style={{ marginBottom: 8 }} />
              <p>No mentors pending review.</p>
            </div>
          ) : (
            mentorsList.map((mentor) => (
              <div key={mentor.id} style={{
                padding: '12px 0', borderBottom: '1px solid var(--surface-border)',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {mentor.user?.firstName} {mentor.user?.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: 8, marginTop: 2 }}>
                      <span>{mentor.organization}</span>
                      <span>·</span>
                      <span>{mentor.title}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={() => handleVerifyMentor(mentor.id)}
                    disabled={processingId === mentor.id}
                    className="btn btn-xs"
                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ADE80' }}
                  >
                    <CheckCircle size={12} /> Verify Mentor
                  </button>
                </div>
              </div>
            ))
          )}
        </motion.div>

        {/* Sector Breakdown */}
        <motion.div className="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <h4 style={{ marginBottom: 16 }}>Startup Sector Breakdown</h4>
          {sectorBreakdown.map(({ sector, count }) => {
            const total = sectorBreakdown.reduce((a, b) => a + b.count, 0) || 1
            const pct = Math.round((count / total) * 100)
            const color = getSectorColor(sector)

            return (
              <div key={sector} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{sector}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }}
                    style={{ background: color }}
                  />
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Audit / Audit Trail */}
        <motion.div className="card" style={{ gridColumn: '1 / -1' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h4><FileText size={16} style={{ display: 'inline', marginRight: 6 }} />Recent Platform Audit Trail</h4>
            <span className="badge badge-gray">Real-time</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px' }}>Timestamp</th>
                  <th style={{ padding: '8px 12px' }}>User</th>
                  <th style={{ padding: '8px 12px' }}>Action</th>
                  <th style={{ padding: '8px 12px' }}>Entity</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.slice(0, 8).map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{formatRelativeTime(log.createdAt)}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span className="badge badge-blue" style={{ fontSize: '0.7rem' }}>{log.action}</span>
                    </td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{log.entityType}: {log.entityId.substring(0, 8)}...</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
