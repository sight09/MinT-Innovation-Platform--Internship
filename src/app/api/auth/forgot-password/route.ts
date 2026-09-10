import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

const schema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  // Generic response — same regardless of whether email exists (prevents enumeration)
  const GENERIC_MESSAGE = "If an account with that email exists, a password reset link has been sent."

  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }

    const email = parsed.data.email.toLowerCase()
    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: GENERIC_MESSAGE })
    }

    // Users who signed up with Google only (no password) can't use password reset
    if (!user.passwordHash) {
      // Still return generic message — don't reveal account exists via Google
      return NextResponse.json({ message: GENERIC_MESSAGE })
    }

    // Rate-limit: check for a recent non-expired, unused token (created in last 60s)
    const recentToken = await (prisma as any).passwordResetToken.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
    })

    if (recentToken) {
      // Return generic message — don't reveal rate limit to potential attackers
      return NextResponse.json({ message: GENERIC_MESSAGE })
    }

    // Invalidate any existing unused tokens for this user
    await (prisma as any).passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() }, // Mark as used to invalidate
    })

    // Generate a cryptographically secure token
    const rawToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

    await (prisma as any).passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    try {
      await sendPasswordResetEmail(user.email, user.firstName, rawToken)
    } catch (emailErr) {
      console.error('[forgot-password] Failed to send email:', emailErr)
    }

    // In dev, also log the token for easy testing
    if (process.env.NODE_ENV === 'development') {
      const appUrl = process.env.APP_URL || 'http://localhost:3000'
      console.log(`[DEV] Password reset URL: ${appUrl}/reset-password?token=${rawToken}`)
    }

    return NextResponse.json({ message: GENERIC_MESSAGE })
  } catch (error) {
    console.error('[forgot-password] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
