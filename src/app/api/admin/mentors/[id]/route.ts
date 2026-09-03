import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  isVerified: z.boolean(),
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
    const { isVerified } = updateSchema.parse(body)

    const mentor = await prisma.mentorProfile.update({
      where: { id },
      data: {
        isVerified,
        verifiedAt: isVerified ? new Date() : null,
      },
    })

    // Also update the user's account status so the session reflects approval
    if (isVerified) {
      await prisma.user.update({
        where: { id: mentor.userId },
        data: { status: 'ACTIVE' },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: session.user.id as string,
        action: `MENTOR_${isVerified ? 'VERIFIED' : 'UNVERIFIED'}`,
        entityType: 'mentor',
        entityId: mentor.id,
      },
    })

    // Notify the mentor of the decision
    await prisma.notification.create({
      data: {
        userId: mentor.userId,
        type: 'APPROVAL',
        title: isVerified ? '🎉 Mentor Account Approved' : 'Mentor Status Updated',
        message: isVerified
          ? 'Your mentor account has been approved by the MInT admin team. You can now give feedback to startups.'
          : 'Your mentor verification status has been updated. Please contact the MInT admin team for more information.',
        link: '/dashboard',
      },
    })

    return NextResponse.json({ mentor })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }
    console.error('Admin mentor update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
