import { prisma } from '@/lib/prisma'
import { StartupsTable } from '@/components/admin/StartupsTable'

export default async function AdminStartupsPage() {
  const startups = await prisma.user.findMany({
    where: { role: 'STARTUP' },
    include: {
      startupProfile: {
        include: {
          _count: {
            select: { mentorReviews: true, investmentInterests: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  const mentors = await prisma.mentorProfile.findMany({
    include: { user: true }
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Startup Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Review, approve, and manage startups on the MInT platform.
          </p>
        </div>
      </div>

      <StartupsTable 
        initialStartups={JSON.parse(JSON.stringify(startups))}
        mentors={JSON.parse(JSON.stringify(mentors))}
      />
    </div>
  )
}
