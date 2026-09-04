import { prisma } from '@/lib/prisma'
import { LineChart, Users, Building2, TrendingUp } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const startupCount = await prisma.startupProfile.count()
  const mentorCount = await prisma.mentorProfile.count()
  const investorCount = await prisma.investorProfile.count()
  const interestCount = await prisma.investmentInterest.count()
  
  const stats = [
    { label: 'Total Startups', value: startupCount, icon: Building2 },
    { label: 'Mentors', value: mentorCount, icon: Users },
    { label: 'Investors', value: investorCount, icon: TrendingUp },
    { label: 'Connections Made', value: interestCount, icon: LineChart },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>Platform Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          High-level overview of ecosystem activity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" style={{ gap: '24px', marginBottom: '32px' }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'rgba(0,107,107,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <s.icon size={24} color="var(--mint-teal)" />
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {s.label}
              </div>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
      
      <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
        Detailed charts and reporting capabilities are coming in Phase 2.
      </div>
    </div>
  )
}
