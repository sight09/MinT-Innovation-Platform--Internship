import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Building2, CheckCircle, Clock } from 'lucide-react'

export default async function InvestorInterestsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'INVESTOR') {
    redirect('/dashboard')
  }

  const investorProfile = await prisma.investorProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!investorProfile) {
    return <div>Investor profile not found</div>
  }

  const interests = await prisma.investmentInterest.findMany({
    where: { investorId: investorProfile.id },
    include: {
      startup: true
    },
    orderBy: { expressedAt: 'desc' }
  })

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>My Interests</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Startups you have expressed investment interest in.
        </p>
      </div>

      {interests.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)' }}>
          <TrendingUp size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>No interests expressed</h3>
          <p style={{ maxWidth: 400, color: 'var(--text-secondary)' }}>
            You haven't expressed interest in any startups yet. Explore the startup directory to find investment opportunities.
          </p>
          <Link href="/startups" className="btn btn-outline" style={{ marginTop: 24 }}>
            Explore Startups
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {interests.map(interest => (
            <div key={interest.id} className="card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 12,
                  background: 'rgba(0,107,107,0.1)', border: '1px solid rgba(0,107,107,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Building2 size={24} color="var(--mint-teal)" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem' }}>{interest.startup.name}</h3>
                  <div style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <span className={`stage-badge stage-${interest.startup.stage}`}>
                      {interest.startup.stage.replace('_', ' ')}
                    </span>
                    <span>{interest.startup.sector}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: 4 }}>
                    <span className={`badge ${interest.status === 'EXPRESSED' ? 'badge-blue' : interest.status === 'ACKNOWLEDGED' ? 'badge-green' : 'badge-gray'}`}>
                      {interest.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    <Clock size={12} />
                    {new Date(interest.expressedAt).toLocaleDateString()}
                  </div>
                </div>
                <Link href={`/startups/${interest.startupId}`} className="btn btn-outline btn-sm">
                  View Startup
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
