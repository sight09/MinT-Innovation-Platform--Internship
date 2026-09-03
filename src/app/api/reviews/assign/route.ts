import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const assignSchema = z.object({
  startupId: z.string(),
  mentorId: z.string()
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (session?.user?.role !== 'MINT_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { startupId, mentorId } = assignSchema.parse(body)

    // Verify both exist
    const startup = await prisma.startupProfile.findUnique({ where: { id: startupId } })
    const mentor = await prisma.mentorProfile.findUnique({ where: { id: mentorId }, include: { user: true } })

    if (!startup || !mentor) {
      return NextResponse.json({ error: 'Startup or Mentor not found' }, { status: 404 })
    }

    // Check if review already exists
    const existing = await prisma.mentorReview.findUnique({
      where: {
        mentorId_startupId: {
          mentorId,
          startupId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Mentor already assigned to this startup' }, { status: 400 })
    }

    // Create DRAFT review
    const review = await prisma.mentorReview.create({
      data: {
        mentorId,
        startupId,
        status: 'DRAFT',
        problemSignificance: 0,
        problemClarity: 0,
        innovation: 0,
        technicalFeasibility: 0,
        marketPotential: 0,
        businessModel: 0,
        scalability: 0,
        teamReadiness: 0,
        traction: 0,
        overallReadiness: 0,
        averageScore: 0,
        generalFeedback: '',
        strengths: '',
        weaknesses: '',
        recommendations: '',
      }
    })

    // Notify mentor
    await prisma.notification.create({
      data: {
        userId: mentor.userId,
        type: 'REVIEW_ASSIGNED',
        title: 'New Startup Review Assigned',
        message: `You have been assigned to review startup: ${startup.name}.`,
        startupId: startup.id
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'REVIEW_ASSIGNED',
        entityType: 'mentorReview',
        entityId: review.id,
        details: JSON.stringify({ mentorId, startupId })
      }
    })

    return NextResponse.json({ success: true, review })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    console.error('Assign Review POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
