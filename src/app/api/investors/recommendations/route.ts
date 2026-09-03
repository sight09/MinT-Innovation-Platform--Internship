import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { computeInvestorMatch } from '@/lib/ai'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const investorProfile = await prisma.investorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!investorProfile) {
      // Return general top-ranked startups if no profile
      const startups = await prisma.startupProfile.findMany({
        where: { status: { in: ['APPROVED', 'FEATURED'] } },
        include: {
          startupScores: { orderBy: { computedAt: 'desc' }, take: 1 },
          mentorReviews: { where: { status: 'PUBLISHED' }, select: { averageScore: true } },
          teamMembers: { select: { name: true, role: true } },
        },
        orderBy: { readinessScore: 'desc' },
        take: 12,
      })

      return NextResponse.json({
        recommendations: startups.map(s => ({
          startup: s,
          matchScore: s.readinessScore || 50,
          matchReasons: ['High readiness score', 'Active on platform'],
        })),
      })
    }

    // Get all approved startups
    const startups = await prisma.startupProfile.findMany({
      where: { status: { in: ['APPROVED', 'FEATURED'] } },
      include: {
        startupScores: { orderBy: { computedAt: 'desc' }, take: 1 },
        mentorReviews: { where: { status: 'PUBLISHED' }, select: { averageScore: true } },
        teamMembers: { select: { name: true, role: true } },
      },
    })

    // Compute match scores
    const recommendations = await Promise.all(
      startups.map(async (startup) => {
        const { score, reasons } = await computeInvestorMatch(investorProfile.id, startup.id)
        return { startup, matchScore: score, matchReasons: reasons }
      })
    )

    // Filter out already-interested startups and sort by match score
    const interests = await prisma.investmentInterest.findMany({
      where: { investorId: investorProfile.id },
      select: { startupId: true },
    })
    const interestedIds = new Set(interests.map(i => i.startupId))

    const sorted = recommendations
      .filter(r => r.matchScore > 30)
      .filter(r => !interestedIds.has(r.startup.id))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20)

    return NextResponse.json({ recommendations: sorted })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
