import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Mail, Building2, Briefcase, ExternalLink, Calendar } from 'lucide-react'

export default async function StartupInvestorsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'STARTUP') {
    redirect('/dashboard')
  }

  const profile = await prisma.startupProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      investmentInterests: {
        include: {
          investor: {
            include: { user: true }
          }
        },
        orderBy: { expressedAt: 'desc' }
      }
    }
  })

  if (!profile) {
    return (
      <div className="empty-state">
        <Building2 size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
        <h2 style={{ marginBottom: 8 }}>No Startup Profile Yet</h2>
        <p style={{ maxWidth: 400, marginBottom: 24 }}>
          Submit your startup profile to become visible to investors on the MInT Innovation Platform.
        </p>
        <Link href="/dashboard/startup/submit" className="btn btn-primary btn-lg">
          Submit Profile
        </Link>
      </div>
    )
  }

  const interests = profile.investmentInterests

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>Investor Interest</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Investors who have expressed interest in connecting with <strong>{profile.name}</strong>.
        </p>
      </div>

      {interests.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)' }}>
          <TrendingUp size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>No investor requests yet</h3>
          <p style={{ maxWidth: 400, color: 'var(--text-secondary)' }}>
            When verified investors express interest in your startup, their details and messages will appear here. Ensure your profile metrics are up to date to attract more investors.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {interests.map(interest => (
            <div key={interest.id} className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                
                {/* Investor Details */}
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="avatar avatar-lg" style={{ background: 'var(--mint-gold-light)', color: 'var(--mint-gold)' }}>
                    {interest.investor.user.firstName?.[0]}{interest.investor.user.lastName?.[0]}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {interest.investor.user.firstName} {interest.investor.user.lastName}
                      {interest.investor.isVerified && (
                        <span style={{ fontSize: '0.7rem', background: '#D4891A22', color: '#B45309', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                          VERIFIED
                        </span>
                      )}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 12 }}>
                      {interest.investor.organizationName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Briefcase size={14} /> {interest.investor.organizationName}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="badge badge-gray">{interest.investor.investorType.replace('_', ' ')}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <a href={`mailto:${interest.investor.user.email}`} className="btn btn-outline btn-sm" style={{ gap: 6 }}>
                        <Mail size={14} /> Email Investor
                      </a>
                      {interest.investor.website && (
                        <a href={interest.investor.website} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                          <ExternalLink size={14} /> Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Date */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: 8 }}>
                    <span className={`badge ${interest.status === 'EXPRESSED' ? 'badge-blue' : interest.status === 'ACKNOWLEDGED' ? 'badge-green' : 'badge-gray'}`}>
                      {interest.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    <Calendar size={12} />
                    {new Date(interest.expressedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {interest.message && (
                <div style={{ marginTop: 20, padding: 16, background: 'var(--surface-base)', borderRadius: 8, borderLeft: '3px solid var(--mint-gold)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                    Message from Investor
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    "{interest.message}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
