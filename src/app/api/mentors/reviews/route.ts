import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reviewSchema = z.object({
  startupId: z.string(),
  problemSignificance: z.number().min(1).max(10),
  problemClarity: z.number().min(1).max(10),
  innovation: z.number().min(1).max(10),
  technicalFeasibility: z.number().min(1).max(10),
  marketPotential: z.number().min(1).max(10),
  businessModel: z.number().min(1).max(10),
  scalability: z.number().min(1).max(10),
  teamReadiness: z.number().min(1).max(10),
  traction: z.number().min(1).max(10),
  overallReadiness: z.number().min(1).max(10),
  generalFeedback: z.string().min(50),
  strengths: z.string(),
  weaknesses: z.string(),
  recommendations: z.string(),
  privateNotes: z.string().optional(),
  isFlagged: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'MINT_MENTOR') return NextResponse.json({ error: 'Only mentors can submit reviews' }, { status: 403 })

    // Check user account approval status first (canonical source of truth)
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { mentorProfile: true },
    })
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (currentUser.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your mentor account is pending admin approval. You will be able to submit reviews once approved.' },
        { status: 403 }
      )
    }

    const mentorProfile = currentUser.mentorProfile
    if (!mentorProfile) {
      return NextResponse.json({ error: 'Please complete your mentor profile before submitting reviews.' }, { status: 404 })
    }

    const body = await req.json()
    const data = reviewSchema.parse(body)

    const scores = [
      data.problemSignificance, data.problemClarity, data.innovation,
      data.technicalFeasibility, data.marketPotential, data.businessModel,
      data.scalability, data.teamReadiness, data.traction, data.overallReadiness,
    ]
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length

    // Upsert review (mentor can only have one review per startup)
    const review = await prisma.mentorReview.upsert({
      where: {
        mentorId_startupId: {
          mentorId: mentorProfile.id,
          startupId: data.startupId,
        },
      } as any,
      update: {
        ...data,
        averageScore,
        status: 'PUBLISHED',
        submittedAt: new Date(),
      },
      create: {
        mentorId: mentorProfile.id,
        ...data,
        averageScore,
        status: 'PUBLISHED',
        submittedAt: new Date(),
      },
    })

    // Find startup owner and notify
    const startup = await prisma.startupProfile.findUnique({
      where: { id: data.startupId },
      select: { userId: true, name: true },
    })

    if (startup) {
      await prisma.notification.create({
        data: {
          userId: startup.userId,
          type: 'MENTOR_FEEDBACK',
          title: 'New Mentor Review',
          message: `${session.user.name} submitted a review for ${startup.name}. Score: ${averageScore.toFixed(1)}/10`,
          entityType: 'mentor_review',
          entityId: review.id,
          startupId: data.startupId,
          link: `/startups/${data.startupId}`,
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'MENTOR_REVIEW_SUBMITTED',
        entityType: 'startup',
        entityId: data.startupId,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).issues || (error as any).errors }, { status: 400 })
    }
    console.error('Mentor review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(req.url)
    const startupId = searchParams.get('startupId')

    if (!startupId) {
      return NextResponse.json({ error: 'startupId required' }, { status: 400 })
    }

    const reviews = await prisma.mentorReview.findMany({
      where: {
        startupId,
        status: 'PUBLISHED',
      },
      include: {
        mentor: {
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
