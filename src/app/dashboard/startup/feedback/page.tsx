import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Star, MessageSquare, AlertCircle, Building2 } from 'lucide-react'

export default async function StartupFeedbackPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'STARTUP') {
    redirect('/dashboard')
  }

  const profile = await prisma.startupProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      mentorReviews: {
        include: {
          mentor: {
            include: { user: true }
          }
        },
        orderBy: { submittedAt: 'desc' }
      }
    }
  })

  if (!profile) {
    return (
      <div className="empty-state">
        <Building2 size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
        <h2 style={{ marginBottom: 8 }}>No Startup Profile Yet</h2>
        <p style={{ maxWidth: 400, marginBottom: 24 }}>
          You need to submit your startup profile before you can receive mentor feedback.
        </p>
        <Link href="/dashboard/startup/submit" className="btn btn-primary btn-lg">
          Submit Profile
        </Link>
      </div>
    )
  }

  const reviews = profile.mentorReviews.filter(r => r.status === 'PUBLISHED')

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>Mentor Feedback</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Reviews and feedback provided by verified MInT mentors for <strong>{profile.name}</strong>.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--surface-card)', borderRadius: 16, border: '1px solid var(--surface-border)' }}>
          <Star size={48} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>No feedback yet</h3>
          <p style={{ maxWidth: 400, color: 'var(--text-secondary)' }}>
            Your startup profile is pending review. Mentors will be assigned to evaluate your problem statement and solution.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {reviews.map(review => (
            <div key={review.id} className="card" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="avatar avatar-md" style={{ background: 'var(--mint-teal-soft)', color: 'var(--mint-teal)' }}>
                    {review.mentor.user.firstName?.[0]}{review.mentor.user.lastName?.[0]}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                      {review.mentor.user.firstName} {review.mentor.user.lastName}
                    </h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {review.mentor.title} at {review.mentor.organization}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--mint-teal)', lineHeight: 1 }}>
                    {review.averageScore.toFixed(1)}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/10</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Overall Score
                  </div>
                </div>
              </div>

              <div className="divider" style={{ margin: '20px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--mint-navy)' }}>
                    <MessageSquare size={16} /> General Feedback
                  </h4>
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    {review.generalFeedback}
                  </p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', color: 'var(--mint-green)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Strengths
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {review.strengths}
                    </p>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: '0.875rem', color: 'var(--mint-red)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Areas for Improvement
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {review.weaknesses}
                    </p>
                  </div>
                  
                  <div style={{ background: 'var(--surface-elevated)', padding: 16, borderRadius: 8, border: '1px solid var(--surface-border)' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--mint-gold)', marginBottom: 8 }}>
                      <AlertCircle size={16} /> Key Recommendations
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, fontWeight: 500 }}>
                      {review.recommendations}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
