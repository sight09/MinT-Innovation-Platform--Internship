import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
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
    const { status } = updateSchema.parse(body)

    const user = await prisma.user.update({
      where: { id },
      data: { status },
      include: {
        mentorProfile: true,
        startupProfile: true,
        investorProfile: true,
      }
    })

    const isApproved = status === 'ACTIVE'

    // Sync profile status if they exist
    if (user.role === 'MINT_MENTOR' && user.mentorProfile) {
      await prisma.mentorProfile.update({
        where: { id: user.mentorProfile.id },
        data: { isVerified: isApproved }
      })
    } else if (user.role === 'INVESTOR' && user.investorProfile) {
      await prisma.investorProfile.update({
        where: { id: user.investorProfile.id },
        data: { isVerified: isApproved }
      })
    } else if (user.role === 'STARTUP' && user.startupProfile) {
      // For startup, ACTIVE maps to APPROVED, SUSPENDED maps to REJECTED
      await prisma.startupProfile.update({
        where: { id: user.startupProfile.id },
        data: { status: isApproved ? 'APPROVED' : 'REJECTED' }
      })
    }

    // Send a notification to the user about the admin decision
    const roleLabel =
      user.role === 'MINT_MENTOR' ? 'Mentor' :
      user.role === 'INVESTOR' ? 'Investor' : 'Startup'

    const dashboardLink =
      user.role === 'MINT_MENTOR' ? '/dashboard/mentor' :
      user.role === 'INVESTOR' ? '/dashboard/investor' : '/dashboard/startup'

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: isApproved ? 'ACCOUNT_APPROVED' : 'ACCOUNT_SUSPENDED',
        title: isApproved ? '🎉 Account Approved!' : 'Account Suspended',
        message: isApproved
          ? `Your ${roleLabel} account has been approved. You now have full access to the MInT platform.`
          : `Your ${roleLabel} account access has been suspended. Please contact the admin for more information.`,
        entityType: 'user',
        entityId: user.id,
        link: isApproved ? dashboardLink : '/dashboard',
      }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id as string,
        action: `USER_STATUS_${status}`,
        entityType: 'user',
        entityId: user.id,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    console.error('Admin user update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'MINT_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Prevent admin from deleting themselves
    if (session.user.id === id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id as string,
        action: 'USER_DELETED',
        entityType: 'user',
        entityId: id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
