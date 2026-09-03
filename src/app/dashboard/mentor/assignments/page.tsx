import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, ArrowRight, Clock, Building2 } from 'lucide-react'

export default async function MentorAssignmentsPage() {
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

  const draftReviews = await prisma.mentorReview.findMany({
    where: { 
      mentorId: mentorProfile.id,
      status: 'DRAFT'
    },
    include: {
      startup: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>My Assignments</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Startups assigned to you for review and scoring.
        </p>
      </div>

      {draftReviews.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>No pending assignments</h3>
          <p style={{ maxWidth: 400, color: 'var(--text-secondary)' }}>
            You have no pending startup assignments to review. When an admin assigns a startup to you, it will appear here.
          </p>
          <Link href="/startups" className="btn btn-outline" style={{ marginTop: 24 }}>
            Browse All Startups
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 24 }}>
          {draftReviews.map(review => (
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
                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginBottom: 4 }}>
                    <Clock size={14} /> Assigned
                  </div>
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
                <Link href={`/dashboard/mentor/review/${review.id}`} className="btn btn-primary">
                  Start Review <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
