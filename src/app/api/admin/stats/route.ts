import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'MINT_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [
      totalStartups,
      approvedStartups,
      pendingStartups,
      featuredStartups,
      totalMentors,
      verifiedMentors,
      totalInvestors,
      verifiedInvestors,
      totalReviews,
      totalInvestmentInterests,
      totalMessages,
      recentStartups,
      recentAuditLogs,
      sectorBreakdown,
      stageBreakdown,
    ] = await Promise.all([
      prisma.startupProfile.count(),
      prisma.startupProfile.count({ where: { status: 'APPROVED' } }),
      prisma.startupProfile.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.startupProfile.count({ where: { status: 'FEATURED' } }),
      prisma.mentorProfile.count(),
      prisma.mentorProfile.count({ where: { isVerified: true } }),
      prisma.investorProfile.count(),
      prisma.investorProfile.count({ where: { isVerified: true } }),
      prisma.mentorReview.count({ where: { status: 'PUBLISHED' } }),
      prisma.investmentInterest.count(),
      prisma.message.count(),
      prisma.startupProfile.findMany({
        where: { status: 'PENDING_REVIEW' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.auditLog.findMany({
        include: {
          user: { select: { firstName: true, lastName: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.startupProfile.groupBy({
        by: ['sector'],
        _count: { id: true },
        where: { status: { in: ['APPROVED', 'FEATURED'] } },
      }),
      prisma.startupProfile.groupBy({
        by: ['stage'],
        _count: { id: true },
        where: { status: { in: ['APPROVED', 'FEATURED'] } },
      }),
    ])

    return NextResponse.json({
      stats: {
        totalStartups,
        approvedStartups,
        pendingStartups,
        featuredStartups,
        totalMentors,
        verifiedMentors,
        totalInvestors,
        verifiedInvestors,
        totalReviews,
        totalInvestmentInterests,
        totalMessages,
      },
      pendingStartups: recentStartups,
      recentActivity: recentAuditLogs,
      sectorBreakdown: sectorBreakdown.map(s => ({
        sector: s.sector,
        count: s._count.id,
      })),
      stageBreakdown: stageBreakdown.map(s => ({
        stage: s.stage,
        count: s._count.id,
      })),
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
