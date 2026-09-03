import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    const startup = await prisma.startupProfile.findUnique({
      where: { id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        teamMembers: true,
        documents: {
          where: { deletedAt: null },
          select: {
            id: true, name: true, fileType: true, fileSizeBytes: true, 
            mimeType: true, isPublic: true, uploadedAt: true,
            fileUrl: session?.user?.role !== 'STARTUP' || undefined ? true : undefined,
          },
        },
        startupScores: { orderBy: { computedAt: 'desc' }, take: 1 },
        mentorReviews: {
          where: { status: 'PUBLISHED' },
          include: {
            mentor: {
              include: {
                user: { select: { firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
        mentorQuestions: {
          include: {
            mentor: {
              include: {
                user: { select: { firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        investmentInterests: {
          where: { status: { in: ['EXPRESSED', 'ACKNOWLEDGED', 'IN_DISCUSSION'] } },
          include: {
            investor: {
              include: {
                user: { select: { firstName: true, lastName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    })

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 })
    }

    // Access control: non-approved startups only visible to admin/owner/mentors
    if (
      startup.status !== 'APPROVED' &&
      startup.status !== 'FEATURED' &&
      session?.user?.role !== 'MINT_ADMIN' &&
      session?.user?.id !== startup.userId &&
      session?.user?.role !== 'MINT_MENTOR'
    ) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Track view engagement event
    if (session?.user && session.user.id !== startup.userId) {
      await prisma.engagementEvent.create({
        data: {
          startupId: id,
          eventType: 'view',
          userId: session.user.id,
        },
      }).catch(() => {}) // Non-blocking
    }

    return NextResponse.json({ startup })
  } catch (error) {
    console.error('Startup GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startup = await prisma.startupProfile.findUnique({ where: { id } })
    if (!startup) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isOwner = startup.userId === session.user.id
    const isAdmin = session.user.role === 'MINT_ADMIN'

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()

    // Admin-only fields
    let adminData: Record<string, any> = {}
    if (isAdmin && body.status) {
      adminData.status = body.status
      if (body.status === 'APPROVED') {
        adminData.approvedAt = new Date()
        adminData.approvedById = session.user.id
      }
      if (body.status === 'FEATURED') {
        adminData.featuredAt = new Date()
      }
    }

    const {
      status: _s, approvedAt: _a, approvedById: _ab, featuredAt: _f, userId: _u, id: _id,
      ...allowedUpdates
    } = body

    const updated = await prisma.startupProfile.update({
      where: { id },
      data: {
        ...allowedUpdates,
        ...adminData,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: adminData.status === 'APPROVED' ? 'STARTUP_APPROVED' 
              : adminData.status === 'REJECTED' ? 'STARTUP_REJECTED'
              : adminData.status === 'FEATURED' ? 'STARTUP_FEATURED'
              : 'STARTUP_UPDATED',
        entityType: 'startup',
        entityId: id,
      },
    })

    // Notify startup owner if approved/rejected
    if (adminData.status === 'APPROVED' || adminData.status === 'REJECTED') {
      await prisma.notification.create({
        data: {
          userId: startup.userId,
          type: adminData.status === 'APPROVED' ? 'STARTUP_APPROVED' : 'STARTUP_REJECTED',
          title: adminData.status === 'APPROVED' ? 'Your startup has been approved!' : 'Startup review completed',
          message: adminData.status === 'APPROVED'
            ? 'Congratulations! Your startup is now visible to mentors and investors on the platform.'
            : 'Your startup was not approved. Please review the feedback and resubmit.',
          startupId: id,
        },
      })
    }

    return NextResponse.json({ startup: updated })
  } catch (error) {
    console.error('Startup PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (session?.user?.role !== 'MINT_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startup = await prisma.startupProfile.findUnique({
      where: { id },
    })

    if (!startup) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Deleting the user will cascade to the startup profile
    await prisma.user.delete({
      where: { id: startup.userId }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'STARTUP_DELETED',
        entityType: 'startup',
        entityId: id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Startup DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
