import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bookmark, Building2, ChevronRight } from 'lucide-react'
import { getStageLabel, getSectorColor, formatCurrency } from '@/lib/utils'
import { SaveStartupButton } from '@/components/startup/SaveStartupButton'

export default async function InvestorSavedPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'INVESTOR') {
    redirect('/dashboard')
  }

  const savedStartups = await prisma.savedStartup.findMany({
    where: { investor: { userId: session.user.id } },
    include: { startup: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>Saved Startups</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Startups you have bookmarked for later review.
        </p>
      </div>

      {savedStartups.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)' }}>
          <Bookmark size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>No saved startups</h3>
          <p style={{ maxWidth: 400, color: 'var(--text-secondary)' }}>
            Save startups from the directory to build your watchlist.
          </p>
          <Link href="/dashboard/startups" className="btn btn-outline" style={{ marginTop: 24 }}>
            Explore Startups
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savedStartups.map(({ startup }) => (
            <div key={startup.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${getSectorColor(startup.sector)}22`, border: `1px solid ${getSectorColor(startup.sector)}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800, color: getSectorColor(startup.sector) }}>
                    {startup.name[0]}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{startup.name}</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{startup.location}</div>
                  </div>
                </div>
                <SaveStartupButton startupId={startup.id} initialSaved compact />
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-gray">{startup.sector}</span>
                <span className={`stage-badge stage-${startup.stage}`}>{getStageLabel(startup.stage)}</span>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {startup.tagline || startup.problemStatement}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-border)', paddingTop: 12, marginTop: 'auto' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {startup.fundingRequired ? `Seeking ${formatCurrency(startup.fundingRequired, startup.fundingCurrency)}` : <><Building2 size={13} /> {startup.readinessScore || 0}/100 readiness</>}
                </div>
                <Link href={`/dashboard/startups/${startup.id}`} className="btn btn-outline btn-xs">
                  View Details <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
