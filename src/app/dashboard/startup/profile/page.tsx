import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, MapPin, Target, Calendar, Link as LinkIcon, Edit, Rocket } from 'lucide-react'

export default async function StartupProfilePage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'STARTUP') {
    redirect('/dashboard')
  }

  const profile = await prisma.startupProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) {
    return (
      <div className="empty-state">
        <Rocket size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
        <h2 style={{ marginBottom: 8 }}>No Startup Profile Yet</h2>
        <p style={{ maxWidth: 400, marginBottom: 24 }}>
          You haven't submitted your startup profile yet. Submit your problem profile to get mentorship and AI readiness scoring.
        </p>
        <Link href="/dashboard/startup/submit" className="btn btn-primary btn-lg">
          Submit Profile
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>My Startup Profile</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your startup's information and public presence.</p>
        </div>
        <Link href="/dashboard/startup/submit" className="btn btn-outline">
          <Edit size={16} /> Edit Profile
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 16,
            background: 'rgba(0,107,107,0.1)', border: '1px solid rgba(0,107,107,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Building2 size={32} color="var(--mint-teal)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h2 style={{ margin: 0, fontSize: '1.75rem' }}>{profile.name}</h2>
              <span className={`stage-badge stage-${profile.stage}`}>
                {profile.stage.replace('_', ' ')}
              </span>
            </div>
            {profile.tagline && (
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                {profile.tagline}
              </p>
            )}
            <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {profile.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={14} /> {profile.location}
                </div>
              )}
              {profile.sector && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Target size={14} /> {profile.sector}
                </div>
              )}
              {profile.foundedYear && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={14} /> Founded {profile.foundedYear}
                </div>
              )}
              {profile.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <LinkIcon size={14} /> 
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                    Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="divider" style={{ margin: '24px 0' }} />

        <div style={{ display: 'grid', gap: 32 }}>
          <section>
            <h3 className="section-title">The Problem</h3>
            <p style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{profile.problemStatement}</p>
          </section>

          {profile.solutionDescription && (
            <section>
              <h3 className="section-title">Solution</h3>
              <p style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{profile.solutionDescription}</p>
            </section>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {profile.marketSize && (
              <section>
                <h3 className="section-title">Market Size</h3>
                <div style={{ fontWeight: 500 }}>{profile.marketSize}</div>
              </section>
            )}
            {profile.businessModel && (
              <section>
                <h3 className="section-title">Business Model</h3>
                <div style={{ fontWeight: 500 }}>{profile.businessModel}</div>
              </section>
            )}
            {profile.userCount !== null && (
              <section>
                <h3 className="section-title">Users / Customers</h3>
                <div style={{ fontWeight: 500 }}>{profile.userCount.toLocaleString()}</div>
              </section>
            )}
          </div>
          
          {profile.fundingRequired && (
            <>
              <div className="divider" style={{ margin: '8px 0' }} />
              <section>
                <h3 className="section-title">Funding Ask</h3>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mint-navy)', marginBottom: 8 }}>
                  {profile.fundingRequired.toLocaleString()} {profile.fundingCurrency}
                </div>
                {profile.fundingUse && (
                  <p style={{ color: 'var(--text-secondary)' }}>Use of funds: {profile.fundingUse}</p>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
