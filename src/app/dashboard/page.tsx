import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { StartupDashboard } from '@/components/dashboard/StartupDashboard'
import { MentorDashboard } from '@/components/dashboard/MentorDashboard'
import { InvestorDashboard } from '@/components/dashboard/InvestorDashboard'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { role, id: userId } = session.user as any

  if (role === 'MINT_ADMIN') {
    const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/admin/stats`, {
      headers: { Cookie: '' }, // server-side fetch — handled via direct prisma below
      cache: 'no-store',
    }).catch(() => null)

    const [stats, pendingStartups, pendingMentors, recentActivity, sectorData] = await Promise.all([
      Promise.resolve({
        totalStartups: await prisma.startupProfile.count(),
        approvedStartups: await prisma.startupProfile.count({ where: { status: 'APPROVED' } }),
        pendingStartups: await prisma.startupProfile.count({ where: { status: 'PENDING_REVIEW' } }),
        featuredStartups: await prisma.startupProfile.count({ where: { status: 'FEATURED' } }),
        totalMentors: await prisma.mentorProfile.count(),
        verifiedMentors: await prisma.mentorProfile.count({ where: { isVerified: true } }),
        totalInvestors: await prisma.investorProfile.count(),
        verifiedInvestors: await prisma.investorProfile.count({ where: { isVerified: true } }),
        totalReviews: await prisma.mentorReview.count({ where: { status: 'PUBLISHED' } }),
        totalInvestmentInterests: await prisma.investmentInterest.count(),
        totalMessages: await prisma.message.count(),
      }),
      prisma.startupProfile.findMany({
        where: { status: 'PENDING_REVIEW' },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.mentorProfile.findMany({
        where: { isVerified: false },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.auditLog.findMany({
        include: { user: { select: { firstName: true, lastName: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
      prisma.startupProfile.groupBy({
        by: ['sector'],
        _count: { id: true },
        where: { status: { in: ['APPROVED', 'FEATURED'] } },
      }),
    ])

    return (
      <AdminDashboard
        stats={stats}
        pendingStartups={JSON.parse(JSON.stringify(pendingStartups))}
        pendingMentors={JSON.parse(JSON.stringify(pendingMentors))}
        recentActivity={JSON.parse(JSON.stringify(recentActivity))}
        sectorBreakdown={sectorData.map(s => ({ sector: s.sector, count: s._count.id }))}
      />
    )
  }

  if (role === 'STARTUP') {
    const startup = await prisma.startupProfile.findUnique({
      where: { userId },
      include: {
        startupScores: { orderBy: { computedAt: 'desc' }, take: 1 },
        mentorReviews: {
          where: { status: 'PUBLISHED' },
          include: {
            mentor: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
          orderBy: { submittedAt: 'desc' },
          take: 3,
        },
        mentorQuestions: {
          where: { isResolved: false },
          include: {
            mentor: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
          take: 5,
        },
        investmentInterests: {
          include: {
            investor: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
          take: 5,
        },
      },
    })

    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return (
      <StartupDashboard
        user={JSON.parse(JSON.stringify(session.user))}
        startup={startup ? JSON.parse(JSON.stringify(startup)) : null}
        notifications={JSON.parse(JSON.stringify(notifications))}
      />
    )
  }

  if (role === 'MINT_MENTOR') {
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId },
    })

    const [recentReviews, pendingStartups, pendingQuestions] = await Promise.all([
      prisma.mentorReview.findMany({
        where: { mentor: { userId } },
        include: { startup: { select: { id: true, name: true, sector: true, stage: true } } },
        orderBy: { submittedAt: 'desc' },
        take: 5,
      }),
      prisma.startupProfile.findMany({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.mentorQuestion.findMany({
        where: { mentor: { userId }, isResolved: false },
        include: { startup: { select: { id: true, name: true } } },
        take: 5,
      }),
    ])

    return (
      <MentorDashboard
        user={JSON.parse(JSON.stringify(session.user))}
        mentorProfile={mentorProfile ? JSON.parse(JSON.stringify(mentorProfile)) : null}
        recentReviews={JSON.parse(JSON.stringify(recentReviews))}
        pendingStartups={JSON.parse(JSON.stringify(pendingStartups))}
        pendingQuestions={JSON.parse(JSON.stringify(pendingQuestions))}
      />
    )
  }

  if (role === 'INVESTOR') {
    const investorProfile = await prisma.investorProfile.findUnique({
      where: { userId },
    })

    const recentInterests = await prisma.investmentInterest.findMany({
      where: { investor: { userId } },
      include: {
        startup: {
          select: { id: true, name: true, sector: true, stage: true, tagline: true, readinessScore: true },
        },
      },
      orderBy: { expressedAt: 'desc' },
      take: 5,
    })

    return (
      <InvestorDashboard
        user={JSON.parse(JSON.stringify(session.user))}
        investorProfile={investorProfile ? JSON.parse(JSON.stringify(investorProfile)) : null}
        recentInterests={JSON.parse(JSON.stringify(recentInterests))}
      />
    )
  }

  redirect('/login')
}
