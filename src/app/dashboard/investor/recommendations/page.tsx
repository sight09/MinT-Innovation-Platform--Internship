import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Zap, Star, Building2, TrendingUp, CheckCircle, ArrowRight,
  Sparkles, Filter, ChevronRight,
} from 'lucide-react'
import { getStageLabel, getSectorColor, formatCurrency } from '@/lib/utils'
import { computeInvestorMatch } from '@/lib/ai'

export const metadata = {
  title: 'AI Investor Recommendations — MInT Platform',
}

export default async function RecommendationsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const investorProfile = await prisma.investorProfile.findUnique({
    where: { userId: session.user.id },
  })

  // Get approved startups
  const startups = await prisma.startupProfile.findMany({
    where: { status: { in: ['APPROVED', 'FEATURED'] } },
    include: {
      startupScores: { orderBy: { computedAt: 'desc' }, take: 1 },
      mentorReviews: { where: { status: 'PUBLISHED' }, select: { averageScore: true } },
      teamMembers: { select: { name: true, role: true } },
    },
  })

  // Compute recommendation matches
  const matches = investorProfile ? await Promise.all(
    startups.map(async (startup) => {
      const { score, reasons } = await computeInvestorMatch(investorProfile.id, startup.id)
      return { startup, matchScore: score, matchReasons: reasons }
    })
  ) : startups.map(startup => ({
    startup,
    matchScore: startup.readinessScore || 70,
    matchReasons: ['High readiness score', 'Active MInT mentor evaluations'],
  }))

  const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Zap size={22} color="#FBBF24" />
          <h1 style={{ margin: 0 }}>AI-Matched Startup Recommendations</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          Startups matched specifically to your investment thesis, sector preferences, and stage focus.
          Every recommendation is calculated using our transparent matching algorithm.
        </p>
      </div>

      {/* Recommendations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sortedMatches.map(({ startup, matchScore, matchReasons }) => {
          const avgScore = startup.mentorReviews.length > 0
            ? startup.mentorReviews.reduce((a, b) => a + Number(b.averageScore), 0) / startup.mentorReviews.length
            : null

          return (
            <div key={startup.id} className="card" style={{
              position: 'relative', overflow: 'hidden',
              border: matchScore >= 80 ? '1px solid rgba(245,166,35,0.3)' : '1px solid var(--surface-border)',
            }}>
              {matchScore >= 80 && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #F5A623, #22C55E)' }} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: `${getSectorColor(startup.sector)}22`,
                    border: `1px solid ${getSectorColor(startup.sector)}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.25rem', fontWeight: 900, color: getSectorColor(startup.sector),
                  }}>
                    {startup.name[0]}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <h3 style={{ margin: 0 }}>{startup.name}</h3>
                      <span className="badge badge-gray">{startup.sector}</span>
                      <span className={`stage-badge stage-${startup.stage}`}>{getStageLabel(startup.stage)}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.875rem' }}>{startup.tagline}</p>
                  </div>
                </div>

                {/* Match Score Badge */}
                <div className="match-score" style={{ fontSize: '1rem', padding: '6px 14px' }}>
                  <Zap size={14} /> {matchScore}% Match
                </div>
              </div>

              {/* Problem snippet */}
              <p style={{
                fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {startup.problemStatement}
              </p>

              {/* Match Reasons */}
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)',
                borderRadius: 10, padding: 12, marginBottom: 16,
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '0.05em' }}>
                  WHY THIS STARTUP WAS MATCHED
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 6 }}>
                  {matchReasons.map((reason, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle size={12} color="#4ADE80" style={{ flexShrink: 0 }} />
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {startup.fundingRequired && (
                    <span>Seeking: <strong style={{ color: '#FBBF24' }}>{formatCurrency(startup.fundingRequired, startup.fundingCurrency)}</strong></span>
                  )}
                  {startup.readinessScore && (
                    <span>Readiness: <strong style={{ color: '#4ADE80' }}>{startup.readinessScore}/100</strong></span>
                  )}
                  {avgScore && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#FBBF24' }}>
                      <Star size={12} fill="#FBBF24" /> Mentor Rating: <strong>{avgScore.toFixed(1)}/10</strong>
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/startups/${startup.id}`} className="btn btn-outline btn-sm">
                    View Startup Profile
                  </Link>
                  <Link href={`/dashboard/investor/express-interest?startupId=${startup.id}`} className="btn btn-gold btn-sm">
                    <TrendingUp size={14} /> Express Interest
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
