import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const questionSchema = z.object({
  startupId: z.string(),
  question: z.string().min(10),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'MINT_MENTOR') {
      return NextResponse.json({ error: 'Only mentors can ask questions' }, { status: 403 })
    }

    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!mentorProfile) {
      return NextResponse.json({ error: 'Mentor profile not found' }, { status: 404 })
    }

    const body = await req.json()
    const data = questionSchema.parse(body)

    const question = await prisma.mentorQuestion.create({
      data: {
        mentorId: mentorProfile.id,
        startupId: data.startupId,
        question: data.question,
      },
      include: {
        mentor: {
          include: {
            user: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
        },
      },
    })

    const startup = await prisma.startupProfile.findUnique({
      where: { id: data.startupId },
      select: { userId: true, name: true },
    })

    if (startup) {
      await prisma.notification.create({
        data: {
          userId: startup.userId,
          type: 'MENTOR_QUESTION',
          title: 'New Mentor Question',
          message: `A MInT mentor asked: "${data.question.substring(0, 80)}..."`,
          entityType: 'mentor_question',
          entityId: question.id,
          startupId: data.startupId,
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'MENTOR_QUESTION_ASKED',
        entityType: 'startup',
        entityId: data.startupId,
      },
    })

    return NextResponse.json({ question }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const answerSchema = z.object({
  questionId: z.string(),
  answer: z.string().min(10),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { questionId, answer } = answerSchema.parse(body)

    const question = await prisma.mentorQuestion.findUnique({
      where: { id: questionId },
      include: { startup: { select: { userId: true } } },
    })

    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

    if (session.user.id !== question.startup.userId && session.user.role !== 'MINT_ADMIN') {
      return NextResponse.json({ error: 'Only the startup owner can answer this question' }, { status: 403 })
    }

    const updated = await prisma.mentorQuestion.update({
      where: { id: questionId },
      data: {
        answer,
        answeredAt: new Date(),
        isResolved: true,
      },
    })

    return NextResponse.json({ question: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
