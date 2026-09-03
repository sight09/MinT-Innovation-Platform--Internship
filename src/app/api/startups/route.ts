import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  sector: z.string().optional(),
  stage: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  featured: z.string().optional(),
  sortBy: z.enum(['createdAt', 'readinessScore', 'fundingRequired']).default('createdAt'),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const { searchParams } = new URL(req.url)
    
    const params = querySchema.parse(Object.fromEntries(searchParams))
    const { page, limit, sector, stage, search, status, featured, sortBy } = params

    const where: Record<string, any> = {}

    // Default to showing approved startups to public
    if (session?.user?.role === 'MINT_ADMIN') {
      if (status) where.status = status
    } else {
      where.status = { in: ['APPROVED', 'FEATURED'] }
    }

    if (sector) where.sector = sector
    if (stage) where.stage = stage
    if (featured === 'true') where.featuredAt = { not: null }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { problemStatement: { contains: search, mode: 'insensitive' } },
        { sector: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
      ]
    }

    const orderBy: Record<string, string> = {}
    if (sortBy === 'readinessScore') orderBy.readinessScore = 'desc'
    else if (sortBy === 'fundingRequired') orderBy.fundingRequired = 'desc'
    else orderBy.createdAt = 'desc'

    const [startups, total] = await Promise.all([
      prisma.startupProfile.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          teamMembers: { select: { id: true, name: true, role: true, isFounder: true } },
          startupScores: { orderBy: { computedAt: 'desc' }, take: 1 },
          mentorReviews: {
            where: { status: 'PUBLISHED' },
            select: { averageScore: true, isFlagged: true },
          },
          _count: {
            select: { investmentInterests: true },
          },
        },
      }),
      prisma.startupProfile.count({ where }),
    ])

    return NextResponse.json({
      startups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Startups GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

const createSchema = z.object({
  name: z.string().min(2).max(100),
  tagline: z.string().max(200).optional(),
  sector: z.string(),
  stage: z.enum(['IDEA', 'PROBLEM_VALIDATED', 'PROTOTYPE', 'MVP', 'EARLY_TRACTION', 'GROWTH', 'INVESTMENT_READY']),
  location: z.string(),
  foundedYear: z.number().optional(),
  problemStatement: z.string().min(50),
  problemSignificance: z.string().optional(),
  targetAudience: z.string().optional(),
  solutionDescription: z.string().optional(),
  uniqueValueProp: z.string().optional(),
  marketSize: z.string().optional(),
  businessModel: z.string().optional(),
  revenueModel: z.string().optional(),
  currentTraction: z.string().optional(),
  userCount: z.number().optional(),
  keyMetrics: z.string().optional(),
  fundingRequired: z.number().optional(),
  fundingCurrency: z.string().default('ETB'),
  fundingUse: z.string().optional(),
  mentorshipNeeds: z.string().optional(),
  partnershipNeeds: z.string().optional(),
  technologyNeeds: z.string().optional(),
  governmentSupport: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role !== 'STARTUP') {
      return NextResponse.json({ error: 'Only startup accounts can create startup profiles' }, { status: 403 })
    }

    const existing = await prisma.startupProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (existing) {
      return NextResponse.json({ error: 'You already have a startup profile' }, { status: 409 })
    }

    const body = await req.json()
    const data = createSchema.parse(body)

    const startup = await prisma.startupProfile.create({
      data: {
        userId: session.user.id as string,
        ...data,
        status: 'PENDING_REVIEW',
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id as string,
        action: 'STARTUP_CREATED',
        entityType: 'startup',
        entityId: startup.id,
      },
    })

    return NextResponse.json({ startup }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).issues || (error as any).errors }, { status: 400 })
    }
    console.error('Startup create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
