import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'FEATURED']),
  feedback: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'MINT_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, feedback } = updateSchema.parse(body)

    const startup = await prisma.startupProfile.update({
      where: { id },
      data: {
        status,
        ...(status === 'APPROVED' ? { approvedAt: new Date(), approvedById: session.user.id } : {}),
        ...(status === 'FEATURED' ? { featuredAt: new Date() } : {}),
      }
    })

    // Sync parent user status based on startup profile status
    if (status === 'APPROVED' || status === 'FEATURED') {
      await prisma.user.update({
        where: { id: startup.userId },
        data: { status: 'ACTIVE' }
      })
    } else if (status === 'REJECTED') {
      await prisma.user.update({
        where: { id: startup.userId },
        data: { status: 'SUSPENDED' }
      })
    } else if (status === 'PENDING_REVIEW') {
      await prisma.user.update({
        where: { id: startup.userId },
        data: { status: 'PENDING_VERIFICATION' }
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id as string,
        action: `STARTUP_STATUS_CHANGED_${status}`,
        entityType: 'startup',
        entityId: startup.id,
      },
    })

    // Notify startup owner
    await prisma.notification.create({
      data: {
        userId: startup.userId,
        type: 'STARTUP_UPDATE',
        title: 'Startup Status Updated',
        message: `Your startup "${startup.name}" status has been updated to ${status}.`,
        link: `/dashboard`,
      }
    })

    return NextResponse.json({ startup })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    console.error('Admin startup update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
