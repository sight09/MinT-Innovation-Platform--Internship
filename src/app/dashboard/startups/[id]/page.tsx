import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, MapPin, Calendar, Globe, Mail, Phone,
  Star, TrendingUp, Users, FileText, CheckCircle,
  ArrowLeft, Shield, Sparkles, MessageSquare, AlertCircle,
} from 'lucide-react'
import {
  getStageLabel, getSectorColor, formatCurrency,
  formatDate, formatRelativeTime, getScoreColor,
} from '@/lib/utils'
import { MintLogo, VerifiedMentorBadge, AiBadge } from '@/components/ui/MintLogo'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const startup = await prisma.startupProfile.findUnique({ where: { id } })
  if (!startup) return { title: 'Startup Not Found' }
  return {
    title: `${startup.name} — MInT Platform`,
    description: startup.tagline || startup.problemStatement.substring(0, 160),
  }
}

export default async function StartupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()

  const startup = await prisma.startupProfile.findUnique({
    where: { id },
    include: {
      teamMembers: true,
      documents: { where: { deletedAt: null } },
      startupScores: { orderBy: { computedAt: 'desc' }, take: 1 },
      mentorReviews: {
        where: { status: 'PUBLISHED' },
        include: {
          mentor: {
            include: {
              user: { select: { firstName: true, lastName: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      },
      mentorQuestions: {
        include: {
          mentor: {
            include: {
              user: { select: { firstName: true, lastName: true, avatarUrl: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: { select: { investmentInterests: true } },
    },
  })

  if (!startup) notFound()

  const user = session?.user as any
  const isOwner = user?.id === startup.userId
  const isMentor = user?.role === 'MINT_MENTOR'
  const isInvestor = user?.role === 'INVESTOR'
  const isAdmin = user?.role === 'MINT_ADMIN'

  const latestScore = startup.startupScores[0]
  const avgMentorScore = startup.mentorReviews.length > 0
    ? startup.mentorReviews.reduce((a, b) => a + Number(b.averageScore), 0) / startup.mentorReviews.length
    : null

  // Check if current investor has already expressed interest
  let existingInterest = null
  if (isInvestor && user?.id) {
    const investorProfile = await prisma.investorProfile.findUnique({
      where: { userId: user.id },
    })
    if (investorProfile) {
      existingInterest = await prisma.investmentInterest.findUnique({
        where: {
          investorId_startupId: {
            investorId: investorProfile.id,
            startupId: startup.id,
          },
        } as any,
      })
    }
  }

  return (
    <div style={{ background: 'var(--surface-base)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Top Header Navigation */}
      <header style={{
        background: 'var(--surface-elevated)', borderBottom: '1px solid var(--surface-border)',
        padding: '0 clamp(16px, 4vw, 48px)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/dashboard/startups" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> Back to Directory
          </Link>
          <MintLogo size="xs" showText />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isOwner && (
            <Link href="/dashboard/startup/profile" className="btn btn-outline btn-sm">
              Edit Startup Profile
            </Link>
          )}
          {isMentor && (
            <Link href={`/mentors/review/${startup.id}`} className="btn btn-primary btn-sm">
              <Star size={14} /> Submit Mentor Evaluation
            </Link>
          )}
          {session?.user && (
            <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
          )}
        </div>
      </header>

      {/* Main Hero Container */}
      <div className="container" style={{ paddingTop: 32 }}>
        {/* Startup Header Box */}
        <div className="card" style={{ marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 4,
            background: `linear-gradient(90deg, ${getSectorColor(startup.sector)}, #2563EB)`,
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                background: `${getSectorColor(startup.sector)}22`,
                border: `2px solid ${getSectorColor(startup.sector)}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.75rem', fontWeight: 900, color: getSectorColor(startup.sector),
              }}>
                {startup.name[0]}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{startup.name}</h1>
                  <span className="badge badge-gray">{startup.sector}</span>
                  <span className={`stage-badge stage-${startup.stage}`}>{getStageLabel(startup.stage)}</span>
                  {startup.status === 'FEATURED' && <span className="badge badge-blue">⭐ Featured</span>}
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: '0 0 12px', fontSize: '1rem' }}>{startup.tagline}</p>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {startup.location && <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><MapPin size={14} /> {startup.location}</span>}
                  {startup.foundedYear && <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Calendar size={14} /> Founded {startup.foundedYear}</span>}
                  {startup.website && (
                    <a href={startup.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', gap: 4, alignItems: 'center', color: '#60A5FA' }}>
                      <Globe size={14} /> Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Score & Interest Action */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
              {latestScore && (
                <div style={{
                  background: 'rgba(27,79,155,0.15)', border: '1px solid rgba(27,79,155,0.3)',
                  borderRadius: 12, padding: '10px 16px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Readiness Score</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: getScoreColor(latestScore.overallScore), lineHeight: 1 }}>
                    {latestScore.overallScore}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
                  </div>
                </div>
              )}

              {/* Express Interest Button for Investors */}
              {isInvestor && (
                <div>
                  {existingInterest ? (
                    <div className="badge badge-green" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
                      ✓ Interest Expressed ({existingInterest.status})
                    </div>
                  ) : (
                    <Link href={`/dashboard/investor/express-interest?startupId=${startup.id}`} className="btn btn-gold btn-lg">
                      <TrendingUp size={16} /> Express Investment Interest
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Problem Statement */}
            <div className="card">
              <h3 style={{ marginBottom: 12, color: '#93C5FD' }}>The Problem Being Solved</h3>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {startup.problemStatement}
              </p>
              {startup.problemSignificance && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--surface-border)' }}>
                  <h4 style={{ marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Problem Impact & Significance</h4>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{startup.problemSignificance}</p>
                </div>
              )}
            </div>

            {/* Solution & Unique Value */}
            {startup.solutionDescription && (
              <div className="card">
                <h3 style={{ marginBottom: 12, color: '#4ADE80' }}>The Solution</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {startup.solutionDescription}
                </p>
                {startup.uniqueValueProp && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--surface-border)' }}>
                    <h4 style={{ marginBottom: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Unique Value Proposition</h4>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{startup.uniqueValueProp}</p>
                  </div>
                )}
              </div>
            )}

            {/* Business Model & Traction */}
            {(startup.businessModel || startup.currentTraction) && (
              <div className="card">
                <h3 style={{ marginBottom: 16, color: '#FBBF24' }}>Business Model & Traction</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {startup.businessModel && (
                    <div>
                      <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 6 }}>Business Model</h4>
                      <p style={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{startup.businessModel}</p>
                    </div>
                  )}
                  {startup.currentTraction && (
                    <div>
                      <h4 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 6 }}>Current Traction</h4>
                      <p style={{ fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{startup.currentTraction}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Team Members */}
            {startup.teamMembers.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 16 }}>The Team</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  {startup.teamMembers.map(member => (
                    <div key={member.id} style={{
                      background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)',
                      borderRadius: 12, padding: 14,
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{member.name}</div>
                      <div style={{ fontSize: '0.75rem', color: member.isFounder ? '#60A5FA' : 'var(--text-muted)', fontWeight: member.isFounder ? 600 : 400, marginBottom: 6 }}>
                        {member.role} {member.isFounder && '(Founder)'}
                      </div>
                      {member.bio && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{member.bio}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Mentor Reviews */}
            <div className="card" id="mentor-reviews">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0 }}>Verified MInT Mentor Reviews</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Evaluations from government-verified domain experts</div>
                </div>
                {avgMentorScore && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 8, padding: '4px 10px' }}>
                    <Star size={16} fill="#FBBF24" color="#FBBF24" />
                    <span style={{ fontWeight: 900, color: '#FBBF24', fontSize: '1rem' }}>{avgMentorScore.toFixed(1)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/10</span>
                  </div>
                )}
              </div>

              {startup.mentorReviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                  <Shield size={28} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                  <p>No mentor reviews published yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {startup.mentorReviews.map(review => (
                    <div key={review.id} style={{
                      background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)',
                      borderRadius: 12, padding: 16,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: 'rgba(27,79,155,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700, color: '#93C5FD',
                          }}>
                            {review.mentor.user.firstName[0]}{review.mentor.user.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                              {review.mentor.title} {review.mentor.user.firstName} {review.mentor.user.lastName}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{review.mentor.organization}</div>
                          </div>
                        </div>
                        <VerifiedMentorBadge compact />
                      </div>

                      <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 12 }}>{review.generalFeedback}</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.8rem' }}>
                        <div style={{ background: 'rgba(34,197,94,0.08)', padding: 8, borderRadius: 6, border: '1px solid rgba(34,197,94,0.15)' }}>
                          <strong style={{ color: '#4ADE80' }}>Strengths:</strong> {review.strengths}
                        </div>
                        <div style={{ background: 'rgba(245,166,35,0.08)', padding: 8, borderRadius: 6, border: '1px solid rgba(245,166,35,0.15)' }}>
                          <strong style={{ color: '#FBBF24' }}>Recommendations:</strong> {review.recommendations}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mentor Q&A Section */}
            <div className="card" id="questions">
              <h3 style={{ marginBottom: 16 }}>Mentor Questions & Answers</h3>
              {startup.mentorQuestions.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No public mentor questions yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {startup.mentorQuestions.map(q => (
                    <div key={q.id} style={{
                      background: 'var(--surface-elevated)', border: '1px solid var(--surface-border)',
                      borderRadius: 12, padding: 16,
                    }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#93C5FD', marginBottom: 8 }}>
                        ❓ Question from {q.mentor.title} {q.mentor.user.firstName} {q.mentor.user.lastName}:
                      </div>
                      <div style={{ fontSize: '0.875rem', marginBottom: 10, fontStyle: 'italic' }}>"{q.question}"</div>

                      {q.answer ? (
                        <div style={{ background: 'rgba(27,79,155,0.1)', padding: 10, borderRadius: 8, borderLeft: '3px solid #2563EB', fontSize: '0.85rem' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Startup Answer:</strong> {q.answer}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: '#F97316' }}>⏳ Awaiting answer from startup</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Info Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Funding Ask Card */}
            {startup.fundingRequired && (
              <div className="card" style={{ border: '1px solid rgba(245,166,35,0.3)', background: 'linear-gradient(135deg, rgba(245,166,35,0.08), rgba(27,79,155,0.05))' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Funding Requirement</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FBBF24', marginBottom: 12 }}>
                  {formatCurrency(startup.fundingRequired, startup.fundingCurrency)}
                </div>
                {startup.fundingUse && (
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>USE OF FUNDS</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{startup.fundingUse}</p>
                  </div>
                )}
              </div>
            )}

            {/* Engagement Stats */}
            <div className="card">
              <h4 style={{ marginBottom: 12 }}>Platform Activity</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status</span>
                  <span className="badge badge-green">{startup.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Investor Interests</span>
                  <span style={{ fontWeight: 700, color: '#FBBF24' }}>{startup._count.investmentInterests}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mentor Reviews</span>
                  <span style={{ fontWeight: 700, color: '#60A5FA' }}>{startup.mentorReviews.length}</span>
                </div>
              </div>
            </div>

            {/* Mentorship Needs */}
            {startup.mentorshipNeeds && (
              <div className="card">
                <h4 style={{ marginBottom: 8, color: '#A78BFA' }}>Mentorship Needed</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{startup.mentorshipNeeds}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
