import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const interestSchema = z.object({
  startupId: z.string(),
  message: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.user.role !== 'INVESTOR') {
      return NextResponse.json({ error: 'Only investors can express investment interest' }, { status: 403 })
    }

    // Check if user account is approved
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { investorProfile: true },
    })
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (currentUser.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your investor account is pending admin approval. You will be able to express investment interest once approved.' },
        { status: 403 }
      )
    }

    const investorProfile = currentUser.investorProfile
    if (!investorProfile) {
      return NextResponse.json({ error: 'Please complete your investor profile before expressing interest.' }, { status: 404 })
    }

    const body = await req.json()
    const { startupId, message } = interestSchema.parse(body)

    const existing = await prisma.investmentInterest.findUnique({
      where: {
        investorId_startupId: {
          investorId: investorProfile.id,
          startupId,
        },
      } as any,
    })

    if (existing) {
      return NextResponse.json({ error: 'Interest already expressed for this startup' }, { status: 409 })
    }

    const interest = await prisma.investmentInterest.create({
      data: {
        investorId: investorProfile.id,
        startupId,
        message,
        status: 'EXPRESSED',
      },
    })

    const startup = await prisma.startupProfile.findUnique({
      where: { id: startupId },
      select: { userId: true, name: true },
    })

    if (startup) {
      await prisma.notification.create({
        data: {
          userId: startup.userId,
          type: 'INVESTOR_INTEREST',
          title: 'Investor Interest Expressed',
          message: `${investorProfile.organizationName || session.user.name} has expressed investment interest in ${startup.name}`,
          entityType: 'investment_interest',
          entityId: interest.id,
          startupId,
          link: `/startups/${startupId}`,
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'INVESTOR_INTEREST_EXPRESSED',
        entityType: 'startup',
        entityId: startupId,
      },
    })

    await prisma.engagementEvent.create({
      data: {
        startupId,
        eventType: 'investor_interest',
        userId: session.user.id,
      },
    })

    return NextResponse.json({ interest }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const investorProfile = await prisma.investorProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!investorProfile) return NextResponse.json({ interests: [] })

    const interests = await prisma.investmentInterest.findMany({
      where: { investorId: investorProfile.id },
      include: {
        startup: {
          select: {
            id: true, name: true, sector: true, stage: true, 
            tagline: true, fundingRequired: true, fundingCurrency: true,
            readinessScore: true, status: true,
          },
        },
      },
      orderBy: { expressedAt: 'desc' },
    })

    return NextResponse.json({ interests })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
