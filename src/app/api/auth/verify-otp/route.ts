import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const verifySchema = z.object({
  userId: z.string(),
  otp: z.string().length(6),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, otp } = verifySchema.parse(body)

    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' })
    }

    if (!user.otpCode || !user.otpExpiry) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 })
    }

    if (new Date() > user.otpExpiry) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 })
    }

    if (user.otpCode !== otp) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        status: 'ACTIVE',
        otpCode: null,
        otpExpiry: null,
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_VERIFIED',
        entityType: 'user',
        entityId: user.id,
      },
    })

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
