import { prisma } from '@/lib/prisma'
import { MentorsTable } from '@/components/admin/MentorsTable'

export default async function AdminMentorsPage() {
  const mentors = await prisma.user.findMany({
    where: { role: 'MINT_MENTOR' },
    include: {
      mentorProfile: {
        include: {
          _count: {
            select: { reviews: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>Mentor Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Verify mentors and manage their assignments.
          </p>
        </div>
      </div>

      <MentorsTable initialMentors={JSON.parse(JSON.stringify(mentors))} />
    </div>
  )
}
