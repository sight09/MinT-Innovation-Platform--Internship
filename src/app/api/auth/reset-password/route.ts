import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const schema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid request'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { token, newPassword } = parsed.data

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const resetToken = await (prisma as any).passwordResetToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'This reset link is invalid. Please request a new one.' },
        { status: 400 }
      )
    }

    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: 'This reset link has already been used. Please request a new one.' },
        { status: 400 }
      )
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12)

    // Update password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newPasswordHash },
      }),
      (prisma as any).passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: resetToken.userId,
        action: 'PASSWORD_RESET',
        entityType: 'user',
        entityId: resetToken.userId,
      },
    })

    return NextResponse.json({ message: 'Password reset successfully. You can now sign in.' })
  } catch (error) {
    console.error('[reset-password] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
