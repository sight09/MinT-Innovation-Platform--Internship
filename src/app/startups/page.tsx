import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  Search, Filter, Rocket, Star, TrendingUp, Sparkles,
  ChevronRight, Building2, Shield, ArrowRight,
} from 'lucide-react'
import { getStageLabel, getSectorColor, formatCurrency } from '@/lib/utils'
import { MintLogo } from '@/components/ui/MintLogo'

export const metadata = {
  title: 'Ethiopian Startup Directory — MInT Platform',
  description: 'Explore verified Ethiopian startups solving real national problems.',
}

export default async function StartupsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const session = await auth()
  const params = await searchParams

  const sector = params.sector
  const stage = params.stage
  const search = params.search

  const where: any = {
    status: { in: ['APPROVED', 'FEATURED'] },
  }

  if (sector) where.sector = sector
  if (stage) where.stage = stage
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { problemStatement: { contains: search } },
      { tagline: { contains: search } },
    ]
  }

  const startups = await prisma.startupProfile.findMany({
    where,
    include: {
      teamMembers: { select: { name: true, role: true, isFounder: true } },
      startupScores: { orderBy: { computedAt: 'desc' }, take: 1 },
      mentorReviews: { where: { status: 'PUBLISHED' }, select: { averageScore: true } },
    },
    orderBy: [{ featuredAt: 'desc' }, { readinessScore: 'desc' }],
  })

  const sectors = [
    'Agriculture', 'FinTech', 'HealthTech', 'EdTech',
    'Climate Tech', 'Logistics', 'AI & Machine Learning', 'E-Commerce',
  ]

  const stages = [
    'IDEA', 'PROBLEM_VALIDATED', 'PROTOTYPE', 'MVP',
    'EARLY_TRACTION', 'GROWTH', 'INVESTMENT_READY',
  ]

  return (
    <div style={{ background: 'var(--surface-base)', minHeight: '100vh', paddingBottom: 64 }}>
      {/* Header Bar */}
      <header style={{
        background: 'var(--surface-elevated)', borderBottom: '1px solid var(--surface-border)',
        padding: '0 clamp(16px, 4vw, 48px)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <MintLogo size="sm" showText />

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {session?.user ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline btn-sm">Sign In</Link>
              <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="container" style={{ paddingTop: 40 }}>
        {/* Banner */}
        <div style={{ marginBottom: 32 }}>
          <span className="badge badge-blue" style={{ marginBottom: 12 }}>
            <Rocket size={12} /> Official MInT Directory
          </span>
          <h1 style={{ marginBottom: 8 }}>Discover Ethiopian Startups</h1>
          <p style={{ maxWidth: 600, color: 'var(--text-secondary)' }}>
            Explore verified Ethiopian technology startups tackling core national challenges across agriculture, fintech, health, education, and logistics.
          </p>
        </div>

        {/* Filter / Search Bar */}
        <form method="GET" action="/startups" className="flex flex-col md:flex-row gap-3 items-center" style={{
          background: 'var(--surface-card)', border: '1px solid var(--surface-border)',
          borderRadius: 16, padding: 16, marginBottom: 32,
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              name="search"
              defaultValue={search || ''}
              className="input"
              style={{ paddingLeft: 38 }}
              placeholder="Search by keyword, problem, or technology..."
            />
          </div>

          <select name="sector" defaultValue={sector || ''} className="input select" style={{ minWidth: 140 }}>
            <option value="">All Sectors</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select name="stage" defaultValue={stage || ''} className="input select" style={{ minWidth: 140 }}>
            <option value="">All Stages</option>
            {stages.map(st => <option key={st} value={st}>{getStageLabel(st as any)}</option>)}
          </select>

          <button type="submit" className="btn btn-primary">
            Filter Results
          </button>
        </form>

        {/* Startups Grid */}
        {startups.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <Building2 size={40} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <h3>No Startups Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search terms or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {startups.map((startup) => {
              const avgReview = startup.mentorReviews.length > 0
                ? startup.mentorReviews.reduce((a, b) => a + Number(b.averageScore), 0) / startup.mentorReviews.length
                : null

              return (
                <div key={startup.id} className="card startup-card" style={{
                  display: 'flex', flexDirection: 'column',
                  position: 'relative', overflow: 'hidden',
                  transition: 'transform 200ms, border-color 200ms',
                }}>
                  {/* Top Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: `${getSectorColor(startup.sector)}22`,
                        border: `1px solid ${getSectorColor(startup.sector)}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem', fontWeight: 800, color: getSectorColor(startup.sector),
                      }}>
                        {startup.name[0]}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{startup.name}</h4>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{startup.location}</div>
                      </div>
                    </div>

                    {startup.readinessScore && startup.readinessScore > 0 ? (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#4ADE80', lineHeight: 1 }}>
                          {startup.readinessScore}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>readiness</div>
                      </div>
                    ) : null}
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span className="badge badge-gray">{startup.sector}</span>
                    <span className={`stage-badge stage-${startup.stage}`}>{getStageLabel(startup.stage)}</span>
                    {startup.status === 'FEATURED' && <span className="badge badge-blue">⭐ Featured</span>}
                  </div>

                  {/* Problem Statement */}
                  <p style={{
                    fontSize: '0.85rem', color: 'var(--text-secondary)',
                    marginBottom: 16, flex: 1, lineHeight: 1.6,
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {startup.problemStatement}
                  </p>

                  {/* Metrics Footer */}
                  <div style={{
                    borderTop: '1px solid var(--surface-border)', paddingTop: 12, marginTop: 'auto',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      {startup.fundingRequired ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Seeking: <strong style={{ color: '#FBBF24' }}>{formatCurrency(startup.fundingRequired, startup.fundingCurrency)}</strong>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {startup.teamMembers.length} team members
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {avgReview && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.8rem', fontWeight: 700, color: '#FBBF24' }}>
                          <Star size={12} fill="#FBBF24" /> {avgReview.toFixed(1)}
                        </div>
                      )}
                      <Link href={`/startups/${startup.id}`} className="btn btn-outline btn-xs">
                        View Details <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
