import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Star, Building2, CheckCircle } from 'lucide-react'

export default async function MentorReviewsPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'MINT_MENTOR') {
    redirect('/dashboard')
  }

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!mentorProfile) {
    return <div>Mentor profile not found</div>
  }

  const publishedReviews = await prisma.mentorReview.findMany({
    where: { 
      mentorId: mentorProfile.id,
      status: 'PUBLISHED'
    },
    include: {
      startup: true
    },
    orderBy: { submittedAt: 'desc' }
  })

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>My Reviews</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Completed reviews and scores you've provided for startups.
        </p>
      </div>

      {publishedReviews.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)' }}>
          <Star size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>No completed reviews</h3>
          <p style={{ maxWidth: 400, color: 'var(--text-secondary)' }}>
            You haven't submitted any reviews yet. Complete your pending assignments to see your review history here.
          </p>
          <Link href="/dashboard/mentor/assignments" className="btn btn-outline" style={{ marginTop: 24 }}>
            View Assignments
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {publishedReviews.map(review => (
            <div key={review.id} className="card" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 12,
                  background: 'rgba(0,107,107,0.1)', border: '1px solid rgba(0,107,107,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Building2 size={24} color="var(--mint-teal)" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem' }}>{review.startup.name}</h3>
                  <div style={{ display: 'flex', gap: 12, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <span className={`stage-badge stage-${review.startup.stage}`}>
                      {review.startup.stage.replace('_', ' ')}
                    </span>
                    <span>{review.startup.sector}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--mint-teal)', lineHeight: 1 }}>
                    {review.averageScore.toFixed(1)}<span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/10</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                    <CheckCircle size={12} color="var(--mint-green)" />
                    {review.submittedAt ? new Date(review.submittedAt).toLocaleDateString() : ''}
                  </div>
                </div>
                <Link href={`/startups/${review.startupId}`} className="btn btn-outline btn-sm">
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
