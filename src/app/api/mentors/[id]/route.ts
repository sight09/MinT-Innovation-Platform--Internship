import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (session?.user?.role !== 'MINT_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const mentor = await prisma.mentorProfile.findUnique({
      where: { id },
      include: { user: true }
    })
    
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 })
    }

    const body = await req.json()
    
    const allowedUpdates: Record<string, any> = {}
    
    if (body.isVerified !== undefined) {
      allowedUpdates.isVerified = body.isVerified
      allowedUpdates.verifiedAt = body.isVerified ? new Date() : null
    }

    const updated = await prisma.mentorProfile.update({
      where: { id },
      data: allowedUpdates,
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: allowedUpdates.isVerified ? 'MENTOR_VERIFIED' : 'MENTOR_UNVERIFIED',
        entityType: 'mentor',
        entityId: id,
      },
    })

    if (allowedUpdates.isVerified) {
      await prisma.notification.create({
        data: {
          userId: mentor.userId,
          type: 'MENTOR_APPROVED',
          title: 'Your Mentor account has been verified!',
          message: 'Congratulations! You can now start reviewing startups on the platform.',
        },
      })
    }

    return NextResponse.json({ mentor: updated })
  } catch (error) {
    console.error('Mentor PATCH error:', error)
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

    const mentor = await prisma.mentorProfile.findUnique({
      where: { id },
    })

    if (!mentor) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Deleting the user will cascade to the mentor profile
    await prisma.user.delete({
      where: { id: mentor.userId }
    })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'MENTOR_DELETED',
        entityType: 'mentor',
        entityId: id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mentor DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
