import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Briefcase } from 'lucide-react'

export default async function InvestorSavedPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'INVESTOR') {
    redirect('/dashboard')
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>Saved Startups</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Startups you have bookmarked for later review.
        </p>
      </div>

      <div className="empty-state" style={{ background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)' }}>
        <Briefcase size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
        <h3 style={{ marginBottom: 8 }}>Coming Soon</h3>
        <p style={{ maxWidth: 400, color: 'var(--text-secondary)' }}>
          The bookmarking feature is currently under development. Soon, you'll be able to save startups here to build your watchlist.
        </p>
        <Link href="/startups" className="btn btn-outline" style={{ marginTop: 24 }}>
          Explore Startups
        </Link>
      </div>
    </div>
  )
}
